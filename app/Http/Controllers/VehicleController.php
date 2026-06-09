<?php

namespace App\Http\Controllers;

use App\Http\Requests\VehicleRequest;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::query();

        // Búsqueda general
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('plate', 'ilike', "%{$search}%")
                  ->orWhere('brand', 'ilike', "%{$search}%")
                  ->orWhere('model', 'ilike', "%{$search}%");
            });
        }

        // Filtro por estado
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        // Filtro por tipo
        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        $vehicles = $query
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Contadores para el resumen
        $counts = [
            'total'            => Vehicle::count(),
            'disponible'       => Vehicle::where('status', 'disponible')->count(),
            'en_viaje'         => Vehicle::where('status', 'en_viaje')->count(),
            'en_mantenimiento' => Vehicle::where('status', 'en_mantenimiento')->count(),
        ];

        return Inertia::render('Vehicles/Index', [
            'vehicles' => $vehicles,
            'counts'   => $counts,
            'filters'  => $request->only(['search', 'status', 'type']),
            'types'    => Vehicle::types(),
            'statuses' => Vehicle::statuses(),
        ]);
    }

    public function store(VehicleRequest $request)
    {
        Vehicle::create($request->validated());

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehículo registrado correctamente.');
    }

    public function update(VehicleRequest $request, Vehicle $vehicle)
    {
        $vehicle->update($request->validated());

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehículo actualizado correctamente.');
    }

    public function destroy(Vehicle $vehicle)
    {
        // Verificar si tiene viajes activos
        if ($vehicle->trips()->whereIn('status', ['pendiente', 'en_curso'])->exists()) {
            return back()->with('error', 'No se puede eliminar un vehículo con viajes activos.');
        }

        $vehicle->delete();

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehículo eliminado correctamente.');
    }

    // Actualizar solo el estado (acceso rápido desde la tabla)
    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'status' => ['required', 'in:disponible,en_viaje,en_mantenimiento'],
        ]);

        $vehicle->update(['status' => $request->status]);

        return back()->with('success', 'Estado actualizado.');
    }
}
