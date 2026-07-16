<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Ticket;
use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
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

            // Format to show short day names, manually parsing logic if necessary
            $carbonDate = Carbon::parse($date);
            $dayName = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][$carbonDate->dayOfWeek];
            $label = $dayName.' '.$carbonDate->day;

            $revenueChart[] = [
                'date' => $label,
                'boletos' => round($ticketsLast7Days->get($date)?->total ?? 0, 2),
                'encomiendas' => round($packagesLast7Days->get($date)?->total ?? 0, 2),
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

        return Inertia::render('Dashboard', [
            'tripsInProgress' => $tripsInProgress,
            'passengersToday' => $passengersToday,
            'revenueToday' => $revenueToday,
            'occupancyRate' => $occupancyRate,
            'revenueChart' => $revenueChart,
            'topRoutes' => $topRoutes,
            'recentTrips' => $recentTrips,
            'pendingPackages' => $pendingPackages,
            'statusConfig' => Trip::statusConfig(),
        ]);
    }
}
