<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Trip;
use App\Models\Vehicle;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $tripsInProgress = Trip::whereIn('status', ['abordando', 'en_ruta'])->count();

        $passengersToday = Ticket::whereDate('created_at', today())
            ->whereIn('ticket_status', ['emitido', 'abordado'])
            ->count();

        $fleet = [
            'available' => Vehicle::available()->count(),
            'total'     => Vehicle::count(),
        ];

        $recentTrips = Trip::with(['route', 'vehicle', 'driver'])
            ->whereIn('status', ['programado', 'abordando', 'en_ruta'])
            ->withCount(['tickets' => fn ($q) => $q->whereNotIn('ticket_status', ['anulado'])])
            ->latest('trip_date')
            ->take(5)
            ->get()
            ->map(fn (Trip $trip) => [
                'id'             => $trip->id,
                'route_name'     => $trip->route->name,
                'vehicle_plate'  => $trip->vehicle?->plate,
                'driver_name'    => $trip->driver?->name,
                'status'         => $trip->status,
                'occupied_seats' => $trip->tickets_count,
                'sellable_seats' => $trip->vehicle?->sellable_seats,
            ]);

        return Inertia::render('Dashboard', [
            'tripsInProgress'  => $tripsInProgress,
            'passengersToday'  => $passengersToday,
            'fleet'            => $fleet,
            'recentTrips'      => $recentTrips,
            'statusConfig'     => Trip::statusConfig(),
        ]);
    }
}
