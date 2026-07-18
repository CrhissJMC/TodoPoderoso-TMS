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

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('plate', 'ilike', "%{$search}%")
                    ->orWhere('brand', 'ilike', "%{$search}%")
                    ->orWhere('model', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        $vehicles = $query
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Contadores actualizados con los nuevos estados
        $counts = [
            'total' => Vehicle::count(),
            'disponible' => Vehicle::where('status', 'disponible')->count(),
            'en_ruta' => Vehicle::where('status', 'en_ruta')->count(),
            'mantenimiento' => Vehicle::where('status', 'mantenimiento')->count(),
            'inactivo' => Vehicle::where('status', 'inactivo')->count(),
        ];

        return Inertia::render('Vehicles/Index', [
            'vehicles' => $vehicles,
            'counts' => $counts,
            'filters' => $request->only(['search', 'status', 'type']),
            'types' => Vehicle::types(),
            'statuses' => Vehicle::statuses(),
        ]);
    }

    // Detalle del vehículo (endpoint JSON)
    public function show(Vehicle $vehicle)
    {
        $vehicle->load(['drivers', 'soatRenewals', 'maintenances']);
        $vehicle->loadCount('trips');

        return response()->json($vehicle);
    }

    public function store(VehicleRequest $request)
    {
        $vehicle = Vehicle::create($request->validated());

        // Registrar primer SOAT en el historial
        if ($vehicle->soat_expiration_date) {
            $vehicle->soatRenewals()->create([
                'expiration_date' => $vehicle->soat_expiration_date,
                'renewed_at' => now(),
                'notes' => 'Registro inicial del vehículo.',
            ]);
        }

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehículo registrado correctamente.');
    }

    public function update(VehicleRequest $request, Vehicle $vehicle)
    {
        $oldSoat = $vehicle->soat_expiration_date;

        $vehicle->update($request->validated());

        // Si cambió el SOAT, registrar renovación
        if (($vehicle->soat_expiration_date && $oldSoat && ! $vehicle->soat_expiration_date->equalTo($oldSoat)) || ($vehicle->soat_expiration_date && ! $oldSoat)) {
            $vehicle->soatRenewals()->create([
                'expiration_date' => $vehicle->soat_expiration_date,
                'renewed_at' => now(),
                'notes' => 'SOAT renovado y actualizado desde la administración.',
            ]);
        }

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehículo actualizado correctamente.');
    }

    public function destroy(Vehicle $vehicle)
    {
        if ($vehicle->trips()->whereIn('status', ['programado', 'abordando', 'en_ruta'])->exists()) {
            return back()->with('error', 'No se puede eliminar un vehículo con viajes activos.');
        }

        $vehicle->delete();

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehículo eliminado correctamente.');
    }

    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        // Validación actualizada
        $request->validate([
            'status' => ['required', 'in:disponible,en_ruta,mantenimiento,inactivo'],
        ]);

        $vehicle->update(['status' => $request->status]);

        return back()->with('success', 'Estado actualizado.');
    }

    public function addMaintenance(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'maintenance_date' => 'required|date',
            'type' => 'required|in:preventivo,correctivo',
            'description' => 'required|string|max:255',
            'cost' => 'required|numeric|min:0',
            'workshop' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $vehicle->maintenances()->create($validated);

        return back()->with('success', 'Registro de mantenimiento agregado correctamente.');
    }

    public function addSoatRenewal(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'expiration_date' => 'required|date',
            'renewed_at' => 'required|date',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $vehicle->soatRenewals()->create($validated);

        $vehicle->update([
            'soat_expiration_date' => $validated['expiration_date'],
        ]);

        return back()->with('success', 'Renovación de SOAT registrada correctamente.');
    }
}
