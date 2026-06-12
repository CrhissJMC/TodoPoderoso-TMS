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
            ->orWhereHas('drivers', fn($q) => $q->whereIn('status', ['activo', 'inactivo']))
            ->get(['id', 'plate', 'brand', 'model', 'status']);

        $counts = [
            'total'    => Driver::count(),
            'activo'   => Driver::where('status', 'activo')->count(),
            'en_viaje' => Driver::where('status', 'en_viaje')->count(),
            'inactivo' => Driver::where('status', 'inactivo')->count(),
        ];

        return Inertia::render('Drivers/Index', [
            'drivers'           => $drivers,
            'counts'            => $counts,
            'availableVehicles' => $availableVehicles,
            'filters'           => $request->only(['search', 'status']),
            'statuses'          => Driver::statuses(),
            'licenseTypes'      => Driver::licenseTypes(),
            // Enviamos los tipos de contrato a React si en el futuro los quieres mostrar
            'contractTypes'     => Driver::contractTypes(), 
        ]);
    }

    public function store(DriverRequest $request)
    {
        $driver = Driver::create($request->validated());

        // Lógica Inteligente
        $this->syncVehicleAssignment($driver->vehicle_id, $driver->id);
        $this->syncVehicleStatus($driver);

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Conductor registrado correctamente.');
    }

    public function update(DriverRequest $request, Driver $driver)
    {
        $driver->update($request->validated());

        // Lógica Inteligente
        $this->syncVehicleAssignment($driver->vehicle_id, $driver->id);
        $this->syncVehicleStatus($driver);

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Conductor actualizado correctamente.');
    }

    public function destroy(Driver $driver)
    {
        if ($driver->trips()->whereIn('status', ['pendiente', 'en_curso'])->exists()) {
            return back()->with('error', 'No se puede eliminar un conductor con viajes activos.');
        }

        // Si eliminamos al conductor, liberamos su vehículo
        if ($driver->vehicle_id) {
            $vehicleId = $driver->vehicle_id;
            $driver->update(['vehicle_id' => null]);
            
            // Forzamos a que el vehículo quede disponible para otro
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
        
        // Sincronizamos el estado del vehículo en automático
        $this->syncVehicleStatus($driver);

        return back()->with('success', 'Estado actualizado.');
    }

    // ── METODOS PRIVADOS DE LÓGICA DE NEGOCIO ──────────────────────────────

    /**
     * Previene duplicidad: Si asignamos un vehículo a este conductor,
     * se lo quitamos a cualquier otro que lo tuviera.
     */
    private function syncVehicleAssignment($vehicleId, $driverId)
    {
        if ($vehicleId) {
            Driver::where('vehicle_id', $vehicleId)
                ->where('id', '!=', $driverId)
                ->update(['vehicle_id' => null]);
        }
    }

    /**
     * Sincroniza el estado del vehículo según lo que haga el conductor.
     */
    private function syncVehicleStatus(Driver $driver)
    {
        if ($driver->vehicle_id) {
            $vehicle = Vehicle::find($driver->vehicle_id);
            
            // Nunca tocamos un vehículo que esté en el taller
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