<?php

namespace App\Http\Controllers;

use App\Http\Requests\TripRequest;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Trip;
use App\Models\TripStatusLog;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $query = Trip::with(['route', 'vehicle', 'driver', 'schedule'])
            ->withCount(['tickets', 'packages']);

        $user = Auth::user();
        $isDriver = $user && $user->role && $user->role->name === 'chofer' && $user->driver;

        // Si el usuario es un chofer, filtrar por su conductor asignado
        if ($isDriver) {
            $query->where('driver_id', $user->driver->id);
        }

        // Filtros
        if ($search = $request->get('search')) {
            $query->whereHas('route', fn ($q) => $q->where('name', 'ilike', "%{$search}%")
                ->orWhere('origin', 'ilike', "%{$search}%")
                ->orWhere('destination', 'ilike', "%{$search}%")
            );
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($date = $request->get('date')) {
            $query->whereDate('trip_date', $date);
        }

        if ($routeId = $request->get('route_id')) {
            $query->where('route_id', $routeId);
        }

        // Por defecto muestra viajes de hoy y futuros, ordenados por fecha y hora de salida
        $query->orderBy('trip_date', 'desc')->orderBy('created_at', 'desc');

        $trips = $query->paginate(12)->withQueryString();

        $tripsCountQuery = Trip::query();
        if ($isDriver) {
            $tripsCountQuery->where('driver_id', $user->driver->id);
        }

        $counts = [
            'total' => (clone $tripsCountQuery)->count(),
            'programado' => (clone $tripsCountQuery)->where('status', 'programado')->count(),
            'abordando' => (clone $tripsCountQuery)->where('status', 'abordando')->count(),
            'en_ruta' => (clone $tripsCountQuery)->where('status', 'en_ruta')->count(),
            'completado' => (clone $tripsCountQuery)->whereDate('trip_date', today())->where('status', 'completado')->count(),
            'cancelado' => (clone $tripsCountQuery)->whereDate('trip_date', today())->where('status', 'cancelado')->count(),
        ];

        return Inertia::render('Trips/Index', [
            'trips' => $trips,
            'counts' => $counts,
            'routes' => Route::active()->orderBy('name')->get(['id', 'name', 'origin', 'destination', 'base_fare', 'estimated_minutes']),
            'vehicles' => Vehicle::where('status', '!=', 'inactivo')->orderBy('plate')->get(['id', 'plate', 'brand', 'model', 'sellable_seats']),
            'drivers' => Driver::where('status', 'activo')->orderBy('name')->get(['id', 'name', 'license_number']),
            'filters' => $request->only(['search', 'status', 'date', 'route_id']),
            'statuses' => Trip::statuses(),
        ]);
    }

    public function store(TripRequest $request)
    {
        DB::transaction(function () use ($request) {
            $trip = Trip::create([
                ...$request->validated(),
                'created_by' => Auth::id(),
                'status' => 'programado',
            ]);

            // Log inicial
            TripStatusLog::create([
                'trip_id' => $trip->id,
                'changed_by' => Auth::id(),
                'previous_status' => '—',
                'new_status' => 'programado',
                'changed_at' => now(),
            ]);
        });

        return redirect()
            ->route('trips.index')
            ->with('success', 'Viaje programado correctamente.');
    }

    public function update(TripRequest $request, Trip $trip)
    {
        if (in_array($trip->status, ['completado', 'cancelado'])) {
            return back()->with('error', 'No se puede editar un viaje completado o cancelado.');
        }

        $trip->update($request->validated());

        return redirect()
            ->route('trips.index')
            ->with('success', 'Viaje actualizado correctamente.');
    }

    public function destroy(Trip $trip)
    {
        if (in_array($trip->status, ['abordando', 'en_ruta'])) {
            return back()->with('error', 'No se puede eliminar un viaje en curso.');
        }

        $trip->delete();

        return redirect()
            ->route('trips.index')
            ->with('success', 'Viaje eliminado correctamente.');
    }

    // Cambiar estado con validación de transición
    public function updateStatus(Request $request, Trip $trip)
    {
        $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', Trip::statuses())],
            'observations' => ['nullable', 'string', 'max:500'],
        ]);

        $newStatus = $request->status;

        if (! $trip->canTransitionTo($newStatus)) {
            return back()->with('error', "No se puede cambiar de '{$trip->status}' a '{$newStatus}'.");
        }

        DB::transaction(function () use ($trip, $newStatus, $request) {
            $oldStatus = $trip->status;

            $trip->update([
                'status' => $newStatus,
                'observations' => $request->observations ?? $trip->observations,
            ]);

            TripStatusLog::create([
                'trip_id' => $trip->id,
                'changed_by' => Auth::id(),
                'previous_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_at' => now(),
            ]);

            // Si el viaje pasa a en_ruta, actualizar encomiendas vinculadas
            if ($newStatus === 'en_ruta') {
                $trip->packages()->where('status', 'recibido')->update(['status' => 'en_ruta']);
            }

            // Si se completa, marcar encomiendas como entregadas
            if ($newStatus === 'completado') {
                $trip->packages()->where('status', 'en_ruta')->update(['status' => 'entregado']);
            }
        });

        return back()->with('success', 'Estado del viaje actualizado.');
    }

    // Vista detalle del viaje (para ver boletos, encomiendas y logs)
    public function show(Trip $trip)
    {
        $trip->load([
            'route.stops',
            'vehicle',
            'driver',
            'schedule',
            'creator',
            'statusLogs.changedBy',
            'tickets.client',
            'packages',
        ]);

        return Inertia::render('Trips/Show', [
            'trip' => $trip,
            'statuses' => Trip::statuses(),
            'statusConfig' => Trip::statusConfig(),
            'allowedTransitions' => Trip::allowedTransitions()[$trip->status] ?? [],
        ]);
    }
}
