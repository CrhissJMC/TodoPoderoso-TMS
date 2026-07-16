<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
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
            // 1. Viajes en Curso
            $tripsInProgress = Trip::whereIn('status', ['abordando', 'en_ruta'])->count();

            // 2. Pasajeros Hoy
            $passengersToday = Ticket::whereDate('created_at', today())
                ->whereIn('ticket_status', ['emitido', 'abordado'])
                ->count();

            // 3. Ingresos Hoy
            $ticketRevenue = Ticket::whereDate('created_at', today())
                ->whereNotIn('ticket_status', ['anulado'])
                ->sum('fare');

            $packageRevenue = Package::whereDate('created_at', today())
                ->sum('price');

            $revenueToday = $ticketRevenue + $packageRevenue;

            // 4. Ocupación Promedio de Hoy
            $tripsToday = Trip::with('vehicle')
                ->whereDate('trip_date', today())
                ->whereNotIn('status', ['cancelado'])
                ->withCount(['tickets' => fn ($q) => $q->whereNotIn('ticket_status', ['anulado'])])
                ->get();

            $totalSeats = 0;
            $occupiedSeats = 0;

            foreach ($tripsToday as $trip) {
                $totalSeats += $trip->vehicle?->sellable_seats ?? 0;
                $occupiedSeats += $trip->tickets_count;
            }

            $occupancyRate = $totalSeats > 0 ? round(($occupiedSeats / $totalSeats) * 100) : 0;

            // 5. Gráfico de Ingresos (Últimos 7 días)
            $sevenDaysAgo = Carbon::today()->subDays(6);

            $ticketsLast7Days = Ticket::where('created_at', '>=', $sevenDaysAgo)
                ->whereNotIn('ticket_status', ['anulado'])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(fare) as total'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

            $packagesLast7Days = Package::where('created_at', '>=', $sevenDaysAgo)
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(price) as total'))
                ->groupBy('date')
                ->get()
                ->keyBy('date');

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
            $packagesStatusLast7Days = Package::where('created_at', '>=', $sevenDaysAgo)
                ->select(DB::raw('DATE(created_at) as date'), 'status', DB::raw('COUNT(id) as total'))
                ->groupBy('date', 'status')
                ->get()
                ->groupBy('date');

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
            $topRoutes = DB::table('tickets')
                ->join('trips', 'tickets.trip_id', '=', 'trips.id')
                ->join('routes', 'trips.route_id', '=', 'routes.id')
                ->whereNotIn('tickets.ticket_status', ['anulado'])
                ->select('routes.name', DB::raw('COUNT(tickets.id) as tickets_count'))
                ->groupBy('routes.name')
                ->orderByDesc('tickets_count')
                ->limit(5)
                ->get();

            // 7. Próximos Viajes
            $recentTrips = Trip::with(['route', 'vehicle', 'driver', 'schedule'])
                ->whereIn('status', ['programado', 'abordando', 'en_ruta'])
                ->withCount(['tickets' => fn ($q) => $q->whereNotIn('ticket_status', ['anulado'])])
                ->latest('trip_date')
                ->take(5)
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
            $pendingPackages = Package::where('status', 'recibido')
                ->latest()
                ->take(5)
                ->get(['id', 'tracking_code', 'destination', 'package_type']);

            // 9. Top Operadores
            $topTicketSellers = User::whereHas('role', function ($q) {
                $q->where('name', 'operador_ventas');
            })
                ->withCount('ticketsSold')
                ->orderByDesc('tickets_sold_count')
                ->take(5)
                ->get(['id', 'name', 'email']);

            $topPackageSellers = User::whereHas('role', function ($q) {
                $q->where('name', 'operador_encomiendas');
            })
                ->withCount('packagesReceived')
                ->orderByDesc('packages_received_count')
                ->take(5)
                ->get(['id', 'name', 'email']);

            return Inertia::render('Dashboard', [
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

        // Para otros usuarios (vendedores, operadores, etc)
        return Inertia::render('Dashboard', [
            'statusConfig' => Trip::statusConfig(),
        ]);
    }
}
