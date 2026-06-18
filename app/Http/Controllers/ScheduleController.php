<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScheduleRequest;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Schedule;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon; // Importamos Carbon para formatear la hora

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = Schedule::with(['route', 'vehicle', 'driver']);

        if ($search = $request->get('search')) {
            $query->whereHas('route', fn ($q) =>
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('origin', 'ilike', "%{$search}%")
                  ->orWhere('destination', 'ilike', "%{$search}%")
            );
        }

        if ($routeId = $request->get('route_id')) {
            $query->where('route_id', $routeId);
        }

        if ($request->has('active') && $request->get('active') !== '') {
            $query->where('active', $request->boolean('active'));
        }

        $schedules = $query
            ->orderBy('departure_time')
            ->paginate(12)
            ->withQueryString()
            // 🔴 AQUI ENVIAMOS LOS DATOS EXACTOS QUE REACT NECESITA
            ->through(fn ($schedule) => [
                'id'             => $schedule->id,
                'route_id'       => $schedule->route_id,
                'vehicle_id'     => $schedule->vehicle_id,
                'driver_id'      => $schedule->driver_id,
                'departure_time' => $schedule->departure_time,
                'days_of_week'   => $schedule->days_of_week,
                'active'         => $schedule->active,
                'route'          => $schedule->route,
                'vehicle'        => $schedule->vehicle,
                'driver'         => $schedule->driver,
                
                // Convertimos "1,3,5" en un arreglo real [1, 3, 5] para evitar el error "includes"
                'days_array'     => array_map('intval', explode(',', $schedule->days_of_week)),
                
                // Formateamos la hora para que se vea bonita (ej: 08:30 AM)
                'formatted_time' => Carbon::parse($schedule->departure_time)->format('h:i A'),
            ]);

        $counts = [
            'total'  => Schedule::count(),
            'active' => Schedule::where('active', true)->count(),
            
            // Calculamos los que operan hoy de forma segura
            'today'  => Schedule::where('active', true)->get()
                            ->filter(function ($s) {
                                $today = now()->dayOfWeekIso; // 1=Lunes, 7=Domingo
                                $days = array_map('intval', explode(',', $s->days_of_week));
                                return in_array($today, $days);
                            })->count(),
        ];

        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules,
            'counts'    => $counts,
            'routes'    => Route::active()->orderBy('name')->get(['id', 'name', 'origin', 'destination', 'base_fare']),
            'vehicles'  => Vehicle::where('status', '!=', 'inactivo')->orderBy('plate')->get(['id', 'plate', 'brand', 'model', 'sellable_seats']),
            'drivers'   => Driver::where('status', 'activo')->orderBy('name')->get(['id', 'name', 'license_number']),
            'filters'   => $request->only(['search', 'route_id', 'active']),
        ]);
    }

    public function store(ScheduleRequest $request)
    {
        Schedule::create($request->validated());

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Horario creado correctamente.');
    }

    public function update(ScheduleRequest $request, Schedule $schedule)
    {
        $schedule->update($request->validated());

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Horario actualizado correctamente.');
    }

    public function destroy(Schedule $schedule)
    {
        if ($schedule->trips()->whereIn('status', ['programado', 'abordando', 'en_ruta'])->exists()) {
            return back()->with('error', 'No se puede eliminar un horario con viajes activos.');
        }

        $schedule->delete();

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Horario eliminado correctamente.');
    }

    public function toggleActive(Schedule $schedule)
    {
        $schedule->update(['active' => ! $schedule->active]);
        $label = $schedule->active ? 'activado' : 'desactivado';
        return back()->with('success', "Horario {$label} correctamente.");
    }
}