<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Package;
use App\Models\Route;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\TripStatusLog;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $roleName = $user->role ? $user->role->name : '';
        $roleId = $user->role_id;

        if ($roleName === 'chofer' || $roleId === 2) {
            $driver = $user->driver;
            $driverTrips = [];
            $driverTotalTrips = 0;
            $driverFrequentRoutes = [];
            $driverUpcomingPackages = [];
            $driverRanking = 0;

            if ($driver) {
                $driverTrips = Trip::with(['route', 'vehicle', 'schedule'])
                    ->where('driver_id', $driver->id)
                    ->withCount(['tickets' => fn ($q) => $q->whereNotIn('ticket_status', ['anulado'])])
                    ->orderByDesc('trip_date')
                    ->get()
                    ->map(fn (Trip $trip) => [
                        'id' => $trip->id,
                        'route_name' => $trip->route->name,
                        'vehicle_plate' => $trip->vehicle?->plate,
                        'status' => $trip->status,
                        'trip_date' => $trip->trip_date,
                        'time' => $trip->schedule ? substr($trip->schedule->departure_time, 0, 5) : '',
                        'occupied_seats' => $trip->tickets_count,
                        'sellable_seats' => $trip->vehicle?->sellable_seats,
                    ]);

                $driverTotalTrips = Trip::where('driver_id', $driver->id)
                    ->where('status', 'completado')
                    ->count();

                $driverFrequentRoutes = DB::table('trips')
                    ->join('routes', 'trips.route_id', '=', 'routes.id')
                    ->where('trips.driver_id', $driver->id)
                    ->where('trips.status', 'completado')
                    ->select('routes.name', DB::raw('COUNT(trips.id) as trips_count'))
                    ->groupBy('routes.name')
                    ->orderByDesc('trips_count')
                    ->limit(5)
                    ->get();

                $upcomingTripIds = Trip::where('driver_id', $driver->id)
                    ->whereIn('status', ['programado', 'abordando', 'en_ruta'])
                    ->pluck('id');

                $driverUpcomingPackages = Package::whereIn('trip_id', $upcomingTripIds)
                    ->latest()
                    ->get(['id', 'tracking_code', 'destination', 'package_type']);

                $driverStats = DB::table('trips')
                    ->where('status', 'completado')
                    ->select('driver_id', DB::raw('COUNT(id) as count'))
                    ->groupBy('driver_id')
                    ->orderByDesc('count')
                    ->get();

                $rank = 1;
                foreach ($driverStats as $stat) {
                    if ($stat->driver_id === $driver->id) {
                        $driverRanking = $rank;
                        break;
                    }
                    $rank++;
                }
                if ($driverRanking === 0 && $driverStats->count() > 0) {
                    $driverRanking = $rank;
                } elseif ($driverRanking === 0) {
                    $driverRanking = 1;
                }
            }

            return Inertia::render('Dashboard', [
                'driverTrips' => $driverTrips,
                'driverTotalTrips' => $driverTotalTrips,
                'driverFrequentRoutes' => $driverFrequentRoutes,
                'driverUpcomingPackages' => $driverUpcomingPackages,
                'driverRanking' => $driverRanking,
                'statusConfig' => Trip::statusConfig(),
            ]);
        }

        if ($roleName === 'administrador' || $roleId === 1) {
            $routeId = $request->input('route_id');
            $selectedRoute = $routeId ? Route::find($routeId) : null;

            $allRoutes = Route::where('active', true)->get(['id', 'name', 'origin', 'destination']);

            // 1. Viajes en Curso
            $tripsInProgressQuery = Trip::whereIn('status', ['abordando', 'en_ruta']);
            if ($routeId) {
                $tripsInProgressQuery->where('route_id', $routeId);
            }
            $tripsInProgress = $tripsInProgressQuery->count();

            // 2. Pasajeros Hoy
            $passengersTodayQuery = Ticket::whereDate('created_at', today())
                ->whereIn('ticket_status', ['emitido', 'abordado']);
            if ($routeId) {
                $passengersTodayQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
            }
            $passengersToday = $passengersTodayQuery->count();

            // 3. Ingresos Hoy
            $ticketRevenueQuery = Ticket::whereDate('created_at', today())
                ->whereNotIn('ticket_status', ['anulado']);
            if ($routeId) {
                $ticketRevenueQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
            }
            $ticketRevenue = $ticketRevenueQuery->sum('fare');

            $packageRevenueQuery = Package::whereDate('created_at', today());
            if ($selectedRoute) {
                $packageRevenueQuery->where(function ($q) use ($selectedRoute) {
                    $q->whereHas('trip', fn ($t) => $t->where('route_id', $selectedRoute->id))
                        ->orWhere(function ($q2) use ($selectedRoute) {
                            $q2->whereNull('trip_id')
                                ->where('origin', $selectedRoute->origin)
                                ->where('destination', $selectedRoute->destination);
                        });
                });
            }
            $packageRevenue = $packageRevenueQuery->sum('price');
            $revenueToday = $ticketRevenue + $packageRevenue;

            // 4. Ocupación Promedio de Hoy
            $tripsTodayQuery = Trip::with('vehicle')
                ->whereDate('trip_date', today())
                ->whereNotIn('status', ['cancelado'])
                ->withCount(['tickets' => fn ($q) => $q->whereNotIn('ticket_status', ['anulado'])]);
            if ($routeId) {
                $tripsTodayQuery->where('route_id', $routeId);
            }

            $tripsToday = $tripsTodayQuery->get();

            $totalSeats = 0;
            $occupiedSeats = 0;
            foreach ($tripsToday as $trip) {
                $totalSeats += $trip->vehicle?->sellable_seats ?? 0;
                $occupiedSeats += $trip->tickets_count;
            }
            $occupancyRate = $totalSeats > 0 ? round(($occupiedSeats / $totalSeats) * 100) : 0;

            // 5. Gráfico de Ingresos (Últimos 7 días)
            $sevenDaysAgo = Carbon::today()->subDays(6);

            $ticketsLast7DaysQuery = Ticket::where('created_at', '>=', $sevenDaysAgo)
                ->whereNotIn('ticket_status', ['anulado'])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(fare) as total'))
                ->groupBy('date');
            if ($routeId) {
                $ticketsLast7DaysQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
            }
            $ticketsLast7Days = $ticketsLast7DaysQuery->get()->keyBy('date');

            $packagesLast7DaysQuery = Package::where('created_at', '>=', $sevenDaysAgo)
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(price) as total'))
                ->groupBy('date');
            if ($selectedRoute) {
                $packagesLast7DaysQuery->where(function ($q) use ($selectedRoute) {
                    $q->whereHas('trip', fn ($t) => $t->where('route_id', $selectedRoute->id))
                        ->orWhere(function ($q2) use ($selectedRoute) {
                            $q2->whereNull('trip_id')
                                ->where('origin', $selectedRoute->origin)
                                ->where('destination', $selectedRoute->destination);
                        });
                });
            }
            $packagesLast7Days = $packagesLast7DaysQuery->get()->keyBy('date');

            $revenueChart = [];
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::today()->subDays(6 - $i)->format('Y-m-d');
                $carbonDate = Carbon::parse($date);
                $dayName = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][$carbonDate->dayOfWeek];
                $label = $dayName.' '.$carbonDate->day;

                $revenueChart[] = [
                    'date' => $label,
                    'boletos' => round($ticketsLast7Days->get($date)?->total ?? 0, 2),
                    'encomiendas' => round($packagesLast7Days->get($date)?->total ?? 0, 2),
                ];
            }

            // 5.5 Gráfico de Estado de Encomiendas (Últimos 7 días)
            $packagesStatusLast7DaysQuery = Package::where('created_at', '>=', $sevenDaysAgo)
                ->select(DB::raw('DATE(created_at) as date'), 'status', DB::raw('COUNT(id) as total'))
                ->groupBy('date', 'status');
            if ($selectedRoute) {
                $packagesStatusLast7DaysQuery->where(function ($q) use ($selectedRoute) {
                    $q->whereHas('trip', fn ($t) => $t->where('route_id', $selectedRoute->id))
                        ->orWhere(function ($q2) use ($selectedRoute) {
                            $q2->whereNull('trip_id')
                                ->where('origin', $selectedRoute->origin)
                                ->where('destination', $selectedRoute->destination);
                        });
                });
            }
            $packagesStatusLast7Days = $packagesStatusLast7DaysQuery->get()->groupBy('date');

            $packagesCountChart = [];
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::today()->subDays(6 - $i)->format('Y-m-d');
                $carbonDate = Carbon::parse($date);
                $dayName = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][$carbonDate->dayOfWeek];
                $label = $dayName.' '.$carbonDate->day;

                $statusesForDate = $packagesStatusLast7Days->get($date) ?? collect();

                $packagesCountChart[] = [
                    'date' => $label,
                    'recibidas' => $statusesForDate->where('status', 'recibido')->sum('total'),
                    'enviadas' => $statusesForDate->whereIn('status', ['en_ruta', 'entregado'])->sum('total'),
                    'devueltas' => $statusesForDate->where('status', 'devuelto')->sum('total'),
                ];
            }

            // 6. Rutas más populares (Top 5)
            $topRoutesQuery = DB::table('tickets')
                ->join('trips', 'tickets.trip_id', '=', 'trips.id')
                ->join('routes', 'trips.route_id', '=', 'routes.id')
                ->whereNotIn('tickets.ticket_status', ['anulado'])
                ->select('routes.name', DB::raw('COUNT(tickets.id) as tickets_count'))
                ->groupBy('routes.name')
                ->orderByDesc('tickets_count')
                ->limit(5);
            if ($routeId) {
                $topRoutesQuery->where('routes.id', $routeId);
            }
            $topRoutes = $topRoutesQuery->get();

            // 7. Próximos Viajes
            $recentTripsQuery = Trip::with(['route', 'vehicle', 'driver', 'schedule'])
                ->whereIn('status', ['programado', 'abordando', 'en_ruta'])
                ->withCount(['tickets' => fn ($q) => $q->whereNotIn('ticket_status', ['anulado'])])
                ->latest('trip_date');
            if ($routeId) {
                $recentTripsQuery->where('route_id', $routeId);
            }
            $recentTrips = $recentTripsQuery->take(5)
                ->get()
                ->map(fn (Trip $trip) => [
                    'id' => $trip->id,
                    'route_name' => $trip->route->name,
                    'vehicle_plate' => $trip->vehicle?->plate,
                    'driver_name' => $trip->driver?->name,
                    'status' => $trip->status,
                    'trip_date' => $trip->trip_date,
                    'time' => $trip->schedule ? substr($trip->schedule->departure_time, 0, 5) : '',
                    'occupied_seats' => $trip->tickets_count,
                    'sellable_seats' => $trip->vehicle?->sellable_seats,
                ]);

            // 8. Encomiendas Pendientes
            $pendingPackagesQuery = Package::where('status', 'recibido')->latest();
            if ($selectedRoute) {
                $pendingPackagesQuery->where(function ($q) use ($selectedRoute) {
                    $q->whereHas('trip', fn ($t) => $t->where('route_id', $selectedRoute->id))
                        ->orWhere(function ($q2) use ($selectedRoute) {
                            $q2->whereNull('trip_id')
                                ->where('origin', $selectedRoute->origin)
                                ->where('destination', $selectedRoute->destination);
                        });
                });
            }
            $pendingPackages = $pendingPackagesQuery->take(5)->get(['id', 'tracking_code', 'destination', 'package_type']);

            // 9. Top Operadores
            $topTicketSellersQuery = User::whereHas('role', function ($q) {
                $q->where('name', 'operador_ventas');
            });
            if ($routeId) {
                $topTicketSellersQuery->withCount(['ticketsSold' => fn ($q) => $q->whereHas('trip', fn ($t) => $t->where('route_id', $routeId))]);
            } else {
                $topTicketSellersQuery->withCount('ticketsSold');
            }
            $topTicketSellers = $topTicketSellersQuery->orderByDesc('tickets_sold_count')
                ->take(5)
                ->get(['id', 'name', 'email']);

            $topPackageSellersQuery = User::whereHas('role', function ($q) {
                $q->where('name', 'operador_encomiendas');
            });
            if ($selectedRoute) {
                $topPackageSellersQuery->withCount(['packagesReceived' => function ($q) use ($selectedRoute) {
                    $q->where(function ($q3) use ($selectedRoute) {
                        $q3->whereHas('trip', fn ($t) => $t->where('route_id', $selectedRoute->id))
                            ->orWhere(function ($q2) use ($selectedRoute) {
                                $q2->whereNull('trip_id')
                                    ->where('origin', $selectedRoute->origin)
                                    ->where('destination', $selectedRoute->destination);
                            });
                    });
                }]);
            } else {
                $topPackageSellersQuery->withCount('packagesReceived');
            }
            $topPackageSellers = $topPackageSellersQuery->orderByDesc('packages_received_count')
                ->take(5)
                ->get(['id', 'name', 'email']);

            // 10. Alertas Críticas (Compliance)
            $complianceAlerts = Vehicle::whereNotNull('soat_expiration_date')
                ->where('soat_expiration_date', '<=', Carbon::today()->addDays(30))
                ->whereNull('deleted_at')
                ->get(['id', 'plate', 'soat_expiration_date'])
                ->map(function ($vehicle) {
                    $daysLeft = Carbon::today()->diffInDays(Carbon::parse($vehicle->soat_expiration_date), false);

                    return [
                        'plate' => $vehicle->plate,
                        'days_left' => (int) $daysLeft,
                        'expiration_date' => $vehicle->soat_expiration_date->format('Y-m-d'),
                    ];
                })
                ->sortBy('days_left')
                ->values();

            // 11. Estadísticas de Licencias de Conductores
            $drivers = Driver::whereNull('deleted_at')->get(['id', 'license_expiry']);
            $vencida = 0;
            $porVencer = 0; // <= 2 meses
            $vigente = 0; // > 2 meses

            $twoMonthsFromNow = Carbon::today()->addMonths(2);

            foreach ($drivers as $d) {
                if (! $d->license_expiry || $d->license_expiry->isPast()) {
                    $vencida++;
                } elseif ($d->license_expiry <= $twoMonthsFromNow) {
                    $porVencer++;
                } else {
                    $vigente++;
                }
            }

            $driverLicenseStats = [
                ['name' => 'Vigente (> 2 meses)', 'value' => $vigente, 'color' => '#10B981'],
                ['name' => 'Por vencer (<= 2 meses)', 'value' => $porVencer, 'color' => '#EAB308'],
                ['name' => 'Vencida', 'value' => $vencida, 'color' => '#EF4444'],
            ];

            return Inertia::render('Dashboard', [
                'allRoutes' => $allRoutes,
                'filters' => $request->only(['route_id']),
                'tripsInProgress' => $tripsInProgress,
                'passengersToday' => $passengersToday,
                'revenueToday' => $revenueToday,
                'occupancyRate' => $occupancyRate,
                'revenueChart' => $revenueChart,
                'packagesCountChart' => $packagesCountChart,
                'topRoutes' => $topRoutes,
                'recentTrips' => $recentTrips,
                'pendingPackages' => $pendingPackages,
                'topTicketSellers' => $topTicketSellers,
                'topPackageSellers' => $topPackageSellers,
                'statusConfig' => Trip::statusConfig(),
                'complianceAlerts' => $complianceAlerts,
                'driverLicenseStats' => $driverLicenseStats,
            ]);
        }
        if ($roleName === 'operador_encomiendas' || $roleId === 4) {
            $operatorTotalPackages = Package::where('received_by', $user->id)->count();

            $operatorPendingPackages = Package::where('received_by', $user->id)
                ->where('status', 'recibido')
                ->count();

            $operatorRecentPackages = Package::with(['sender', 'receiver', 'trip', 'trip.route'])
                ->where('received_by', $user->id)
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($pkg) => [
                    'id' => $pkg->id,
                    'tracking_code' => $pkg->tracking_code,
                    'destination' => $pkg->destination,
                    'package_type' => $pkg->package_type,
                    'status' => $pkg->status,
                    'created_at' => $pkg->created_at,
                    'sender_name' => $pkg->sender->name,
                    'receiver_name' => $pkg->receiver->name,
                    'trip_route' => $pkg->trip ? $pkg->trip->route->name : 'Sin asignar',
                ]);

            $operatorStats = DB::table('packages')
                ->select('received_by', DB::raw('COUNT(id) as count'))
                ->groupBy('received_by')
                ->orderByDesc('count')
                ->get();

            $operatorRanking = 0;
            $rank = 1;
            foreach ($operatorStats as $stat) {
                if ($stat->received_by === $user->id) {
                    $operatorRanking = $rank;
                    break;
                }
                $rank++;
            }
            if ($operatorRanking === 0 && $operatorStats->count() > 0) {
                $operatorRanking = $rank;
            } elseif ($operatorRanking === 0) {
                $operatorRanking = 1;
            }

            return Inertia::render('Dashboard', [
                'operatorTotalPackages' => $operatorTotalPackages,
                'operatorPendingPackages' => $operatorPendingPackages,
                'operatorRecentPackages' => $operatorRecentPackages,
                'operatorRanking' => $operatorRanking,
                'statusConfig' => Trip::statusConfig(),
            ]);
        }

        if ($roleName === 'operador_ventas' || $roleId === 3) {
            $sellerTotalTickets = Ticket::where('sold_by', $user->id)->count();

            $sellerTodayTickets = Ticket::where('sold_by', $user->id)
                ->whereDate('created_at', today())
                ->count();

            $sellerRecentTickets = Ticket::with(['client', 'trip', 'trip.route'])
                ->where('sold_by', $user->id)
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($t) => [
                    'id' => $t->id,
                    'ticket_code' => $t->ticket_code,
                    'client_name' => $t->client->name,
                    'client_document' => $t->client->document_number,
                    'trip_route' => $t->trip ? $t->trip->route->name : 'Sin ruta',
                    'seat_number' => $t->seat_number,
                    'fare' => $t->fare,
                    'ticket_status' => $t->ticket_status,
                    'created_at' => $t->created_at,
                ]);

            $sellerStats = DB::table('tickets')
                ->select('sold_by', DB::raw('COUNT(id) as count'))
                ->groupBy('sold_by')
                ->orderByDesc('count')
                ->get();

            $sellerRanking = 0;
            $rank = 1;
            foreach ($sellerStats as $stat) {
                if ($stat->sold_by === $user->id) {
                    $sellerRanking = $rank;
                    break;
                }
                $rank++;
            }
            if ($sellerRanking === 0 && $sellerStats->count() > 0) {
                $sellerRanking = $rank;
            } elseif ($sellerRanking === 0) {
                $sellerRanking = 1;
            }

            return Inertia::render('Dashboard', [
                'sellerTotalTickets' => $sellerTotalTickets,
                'sellerTodayTickets' => $sellerTodayTickets,
                'sellerRecentTickets' => $sellerRecentTickets,
                'sellerRanking' => $sellerRanking,
                'statusConfig' => Trip::statusConfig(),
            ]);
        }
        // Dashboard para Cliente
        if ($roleName === 'cliente' || $roleId === 6) {
            $client = $user->client;

            if (! $client) {
                return Inertia::render('Dashboard', [
                    'clientError' => 'Tu cuenta de usuario no está vinculada a un registro de cliente. Contacta al administrador.',
                    'statusConfig' => Trip::statusConfig(),
                ]);
            }

            $clientId = $client->id;

            // === DASHBOARD 1: RESUMEN Y SEGUIMIENTO ===

            // KPIs — Conteo de viajes por estado (via boletos del cliente)
            $clientTripIds = Ticket::where('client_id', $clientId)
                ->whereNotIn('ticket_status', ['anulado'])
                ->pluck('trip_id')
                ->unique();

            $tripStatusCounts = Trip::whereIn('id', $clientTripIds)
                ->select('status', DB::raw('COUNT(id) as count'))
                ->groupBy('status')
                ->pluck('count', 'status');

            $clientKpis = [
                'programados' => ($tripStatusCounts['programado'] ?? 0) + ($tripStatusCounts['abordando'] ?? 0),
                'en_curso' => $tripStatusCounts['en_ruta'] ?? 0,
                'completados' => $tripStatusCounts['completado'] ?? 0,
                'cancelados' => $tripStatusCounts['cancelado'] ?? 0,
            ];

            // Seguimiento en Vivo — Viajes activos del cliente
            $activeTrips = Trip::with(['route', 'vehicle', 'driver', 'schedule'])
                ->whereIn('id', $clientTripIds)
                ->whereIn('status', ['abordando', 'en_ruta'])
                ->get()
                ->map(fn (Trip $trip) => [
                    'id' => $trip->id,
                    'route_name' => $trip->route->name,
                    'origin' => $trip->route->origin,
                    'destination' => $trip->route->destination,
                    'vehicle_plate' => $trip->vehicle?->plate,
                    'driver_name' => $trip->driver?->name,
                    'status' => $trip->status,
                    'trip_date' => $trip->trip_date,
                    'time' => $trip->schedule ? substr($trip->schedule->departure_time, 0, 5) : '',
                    'estimated_minutes' => $trip->route->estimated_minutes,
                ]);

            // Próximas Entregas — Encomiendas donde el cliente es sender o receiver
            $upcomingPackages = Package::with(['trip', 'trip.route', 'trip.schedule', 'sender', 'receiver'])
                ->where(fn ($q) => $q->where('sender_id', $clientId)->orWhere('receiver_id', $clientId))
                ->whereIn('status', ['recibido', 'en_ruta'])
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($pkg) => [
                    'id' => $pkg->id,
                    'tracking_code' => $pkg->tracking_code,
                    'origin' => $pkg->origin,
                    'destination' => $pkg->destination,
                    'status' => $pkg->status,
                    'package_type' => $pkg->package_type,
                    'trip_route' => $pkg->trip?->route?->name ?? 'Sin asignar',
                    'trip_date' => $pkg->trip?->trip_date,
                    'departure_time' => $pkg->trip?->schedule ? substr($pkg->trip->schedule->departure_time, 0, 5) : null,
                    'estimated_minutes' => $pkg->trip?->route?->estimated_minutes,
                    'is_sender' => $pkg->sender_id === $clientId,
                ]);

            // Actividad Reciente — Cambios de estado de viajes del cliente
            $recentActivity = [];

            $tripLogs = TripStatusLog::whereIn('trip_id', $clientTripIds)
                ->with(['trip.route'])
                ->orderByDesc('changed_at')
                ->take(10)
                ->get()
                ->map(fn ($log) => [
                    'type' => 'viaje',
                    'message' => 'Viaje '.($log->trip->route->name ?? '').': '.($log->previous_status ?? '—').' → '.$log->new_status,
                    'date' => $log->changed_at,
                    'status' => $log->new_status,
                ]);

            $packageActivity = Package::where(fn ($q) => $q->where('sender_id', $clientId)->orWhere('receiver_id', $clientId))
                ->whereIn('status', ['en_ruta', 'entregado', 'devuelto'])
                ->latest('updated_at')
                ->take(10)
                ->get()
                ->map(fn ($pkg) => [
                    'type' => 'encomienda',
                    'message' => 'Encomienda '.$pkg->tracking_code.': estado actualizado a '.$pkg->status,
                    'date' => $pkg->updated_at,
                    'status' => $pkg->status,
                ]);

            $recentActivity = $tripLogs->merge($packageActivity)->sortByDesc('date')->take(15)->values();

            // === DASHBOARD 2: HISTORIAL Y RENDIMIENTO ===

            // Historial de Viajes
            $tripHistory = Trip::with(['route', 'schedule'])
                ->whereIn('id', $clientTripIds)
                ->orderByDesc('trip_date')
                ->take(20)
                ->get()
                ->map(fn (Trip $trip) => [
                    'id' => $trip->id,
                    'route_name' => $trip->route->name,
                    'origin' => $trip->route->origin,
                    'destination' => $trip->route->destination,
                    'trip_date' => $trip->trip_date,
                    'time' => $trip->schedule ? substr($trip->schedule->departure_time, 0, 5) : '',
                    'status' => $trip->status,
                ]);

            // OTD — On-Time Delivery (encomiendas entregadas en ≤24h = a tiempo)
            $clientPackages = Package::where(fn ($q) => $q->where('sender_id', $clientId)->orWhere('receiver_id', $clientId));
            $totalDelivered = (clone $clientPackages)->where('status', 'entregado')->count();
            $onTimeDelivered = (clone $clientPackages)->where('status', 'entregado')
                ->whereRaw('EXTRACT(EPOCH FROM (updated_at - created_at)) <= 86400')
                ->count();
            $otdPercentage = $totalDelivered > 0 ? round(($onTimeDelivered / $totalDelivered) * 100) : 0;

            // Resumen por Ruta
            $routeSummary = DB::table('tickets')
                ->join('trips', 'tickets.trip_id', '=', 'trips.id')
                ->join('routes', 'trips.route_id', '=', 'routes.id')
                ->where('tickets.client_id', $clientId)
                ->whereNotIn('tickets.ticket_status', ['anulado'])
                ->select('routes.name', DB::raw('COUNT(DISTINCT trips.id) as trips_count'))
                ->groupBy('routes.name')
                ->orderByDesc('trips_count')
                ->limit(10)
                ->get();

            return Inertia::render('Dashboard', [
                'clientKpis' => $clientKpis,
                'clientActiveTrips' => $activeTrips,
                'clientUpcomingPackages' => $upcomingPackages,
                'clientRecentActivity' => $recentActivity,
                'clientTripHistory' => $tripHistory,
                'clientOtd' => $otdPercentage,
                'clientTotalDelivered' => $totalDelivered,
                'clientOnTimeDelivered' => $onTimeDelivered,
                'clientRouteSummary' => $routeSummary,
                'statusConfig' => Trip::statusConfig(),
            ]);
        }

        // Dashboard para Agente de Mostrador (combina ventas + encomiendas)
        if ($roleName === 'agente' || $roleId === 5) {
            // Boletos
            $agentTotalTickets = Ticket::where('sold_by', $user->id)->count();
            $agentTodayTickets = Ticket::where('sold_by', $user->id)
                ->whereDate('created_at', today())
                ->count();

            $agentRecentTickets = Ticket::with(['client', 'trip', 'trip.route'])
                ->where('sold_by', $user->id)
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($t) => [
                    'id' => $t->id,
                    'ticket_code' => $t->ticket_code,
                    'client_name' => $t->client->name,
                    'client_document' => $t->client->document_number,
                    'trip_route' => $t->trip ? $t->trip->route->name : 'Sin ruta',
                    'seat_number' => $t->seat_number,
                    'fare' => $t->fare,
                    'ticket_status' => $t->ticket_status,
                    'created_at' => $t->created_at,
                ]);

            // Encomiendas
            $agentTotalPackages = Package::where('received_by', $user->id)->count();
            $agentPendingPackages = Package::where('received_by', $user->id)
                ->where('status', 'recibido')
                ->count();

            $agentRecentPackages = Package::with(['sender', 'receiver', 'trip', 'trip.route'])
                ->where('received_by', $user->id)
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($pkg) => [
                    'id' => $pkg->id,
                    'tracking_code' => $pkg->tracking_code,
                    'destination' => $pkg->destination,
                    'package_type' => $pkg->package_type,
                    'status' => $pkg->status,
                    'created_at' => $pkg->created_at,
                    'sender_name' => $pkg->sender->name,
                    'receiver_name' => $pkg->receiver->name,
                    'trip_route' => $pkg->trip ? $pkg->trip->route->name : 'Sin asignar',
                ]);

            // Ingresos generados hoy por este agente (boletos + encomiendas)
            $agentTicketRevenueToday = Ticket::where('sold_by', $user->id)
                ->whereDate('created_at', today())
                ->whereNotIn('ticket_status', ['anulado'])
                ->sum('fare');

            $agentPackageRevenueToday = Package::where('received_by', $user->id)
                ->whereDate('created_at', today())
                ->sum('price');

            $agentRevenueToday = $agentTicketRevenueToday + $agentPackageRevenueToday;

            return Inertia::render('Dashboard', [
                'agentTotalTickets' => $agentTotalTickets,
                'agentTodayTickets' => $agentTodayTickets,
                'agentRecentTickets' => $agentRecentTickets,
                'agentTotalPackages' => $agentTotalPackages,
                'agentPendingPackages' => $agentPendingPackages,
                'agentRecentPackages' => $agentRecentPackages,
                'agentRevenueToday' => $agentRevenueToday,
                'statusConfig' => Trip::statusConfig(),
            ]);
        }

        // Para otros usuarios
        return Inertia::render('Dashboard', [
            'statusConfig' => Trip::statusConfig(),
        ]);
    }
}
