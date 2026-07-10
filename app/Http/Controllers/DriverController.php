<?php

namespace App\Http\Controllers;

use App\Http\Requests\DriverRequest;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index(Request $request)
    {
        $query = Driver::with('vehicle');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('license_number', 'ilike', "%{$search}%")
                    ->orWhere('dni', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $drivers = $query
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $availableVehicles = Vehicle::whereIn('status', ['disponible'])
            ->orWhereHas('drivers', fn ($q) => $q->whereIn('status', ['activo', 'inactivo']))
            ->get(['id', 'plate', 'brand', 'model', 'status']);

        $counts = [
            'total' => Driver::count(),
            'activo' => Driver::where('status', 'activo')->count(),
            'en_viaje' => Driver::where('status', 'en_viaje')->count(),
            'inactivo' => Driver::where('status', 'inactivo')->count(),
        ];

        return Inertia::render('Drivers/Index', [
            'drivers' => $drivers,
            'counts' => $counts,
            'availableVehicles' => $availableVehicles,
            'filters' => $request->only(['search', 'status']),
            'statuses' => Driver::statuses() ?? ['activo', 'inactivo', 'en_viaje'],
            'licenseTypes' => Driver::licenseTypes() ?? ['A-I', 'A-IIa', 'A-IIb', 'A-IIIa', 'A-IIIb', 'A-IIIc'],
            'contractTypes' => Driver::contractTypes() ?? ['Propietario', 'Tercero', 'Planilla'],
            // NUEVO: Agregamos esto para el modal de Vehículos
            'vehicleTypes' => ['Auto', 'Minivan', 'Bus', 'Otro'],
            'vehicleStatuses' => ['disponible', 'en_ruta', 'mantenimiento', 'inactivo'],
        ]);
    }

    // Detalle del conductor (endpoint JSON)
    public function show(Driver $driver)
    {
        $driver->load('vehicle');
        $driver->loadCount('trips');

        return response()->json($driver);
    }

    public function store(DriverRequest $request)
    {
        $driver = Driver::create($request->validated());

        $this->syncVehicleAssignment($driver->vehicle_id, $driver->id);
        $this->syncVehicleStatus($driver);

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Conductor registrado correctamente.');
    }

    public function update(DriverRequest $request, Driver $driver)
    {
        $driver->update($request->validated());

        $this->syncVehicleAssignment($driver->vehicle_id, $driver->id);
        $this->syncVehicleStatus($driver);

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Conductor actualizado correctamente.');
    }

    public function destroy(Driver $driver)
    {
        if ($driver->trips()->whereIn('status', ['programado', 'abordando', 'en_ruta'])->exists()) {
            return back()->with('error', 'No se puede eliminar un conductor con viajes o salidas programadas.');
        }

        if ($driver->vehicle_id) {
            $vehicleId = $driver->vehicle_id;
            $driver->update(['vehicle_id' => null]);
            Vehicle::where('id', $vehicleId)->update(['status' => 'disponible']);
        }

        $driver->delete();

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Conductor eliminado correctamente.');
    }

    public function updateStatus(Request $request, Driver $driver)
    {
        $request->validate([
            'status' => ['required', 'in:activo,inactivo,en_viaje'],
        ]);

        $driver->update(['status' => $request->status]);

        $this->syncVehicleStatus($driver);

        return back()->with('success', 'Estado actualizado.');
    }

    // ── METODOS PRIVADOS ──────────────────────────────

    private function syncVehicleAssignment($vehicleId, $driverId)
    {
        if ($vehicleId) {
            Driver::where('vehicle_id', $vehicleId)
                ->where('id', '!=', $driverId)
                ->update(['vehicle_id' => null]);
        }
    }

    private function syncVehicleStatus(Driver $driver)
    {
        if ($driver->vehicle_id) {
            $vehicle = Vehicle::find($driver->vehicle_id);

            if ($vehicle && $vehicle->status !== 'mantenimiento') {
                if ($driver->status === 'en_viaje') {
                    $vehicle->update(['status' => 'en_ruta']);
                } elseif (in_array($driver->status, ['activo', 'inactivo'])) {
                    $vehicle->update(['status' => 'disponible']);
                }
            }
        }
    }
}
