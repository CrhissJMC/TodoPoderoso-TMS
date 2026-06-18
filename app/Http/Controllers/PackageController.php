<?php

namespace App\Http\Controllers;

use App\Http\Requests\PackageRequest;
use App\Models\Package;
use App\Models\Route;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $query = Package::with(['trip.route', 'receivedBy']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('sender_name',   'ilike', "%{$search}%")
                  ->orWhere('receiver_name','ilike', "%{$search}%")
                  ->orWhere('tracking_code','ilike', "%{$search}%")
                  ->orWhere('origin',       'ilike', "%{$search}%")
                  ->orWhere('destination',  'ilike', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->get('package_type')) {
            $query->where('package_type', $type);
        }

        $packages = $query
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        $counts = [
            'total'     => Package::count(),
            'recibido'  => Package::where('status', 'recibido')->count(),
            'en_ruta'   => Package::where('status', 'en_ruta')->count(),
            'entregado' => Package::where('status', 'entregado')->count(),
        ];

        // Viajes activos para asignar encomiendas
        $activeTrips = Trip::with('route')
            ->whereIn('status', ['programado', 'abordando', 'en_ruta'])
            ->whereDate('trip_date', '>=', today()->subDay())
            ->orderBy('trip_date')
            ->get(['id', 'trip_date', 'status', 'route_id'])
            ->map(fn ($t) => [
                'id'         => $t->id,
                'label'      => $t->route->name . ' — ' . $t->trip_date->format('d/m/Y'),
                'status'     => $t->status,
                'trip_date'  => $t->trip_date->toDateString(),
                'route_name' => $t->route->name,
            ]);

        return Inertia::render('Packages/Index', [
            'packages'    => $packages,
            'counts'      => $counts,
            'activeTrips' => $activeTrips,
            'filters'     => $request->only(['search', 'status', 'package_type']),
            'packageTypes'   => Package::packageTypes(),
            'paymentMethods' => Package::paymentMethods(),
            'paymentStatuses'=> Package::paymentStatuses(),
            'statuses'       => Package::statuses(),
        ]);
    }

    public function store(PackageRequest $request)
    {
        $data = $request->validated();

        // Determinar estado inicial según el viaje asignado
        $status = 'recibido';
        if (! empty($data['trip_id'])) {
            $trip = Trip::find($data['trip_id']);
            if ($trip && $trip->status === 'en_ruta') {
                $status = 'en_ruta';
            }
        }

        Package::create([
            ...$data,
            'received_by'   => Auth::id(),
            'status'        => $status,
            'tracking_code' => Package::generateTrackingCode(),
        ]);

        return redirect()
            ->route('packages.index')
            ->with('success', 'Encomienda registrada correctamente.');
    }

    public function update(PackageRequest $request, Package $package)
    {
        if ($package->status === 'entregado') {
            return back()->with('error', 'No se puede editar una encomienda ya entregada.');
        }

        $package->update($request->validated());

        return redirect()
            ->route('packages.index')
            ->with('success', 'Encomienda actualizada correctamente.');
    }

    public function destroy(Package $package)
    {
        if ($package->status === 'en_ruta') {
            return back()->with('error', 'No se puede eliminar una encomienda en ruta.');
        }

        $package->delete();

        return redirect()
            ->route('packages.index')
            ->with('success', 'Encomienda eliminada correctamente.');
    }

    // Cambio rápido de estado
    public function updateStatus(Request $request, Package $package)
    {
        $request->validate([
            'status' => ['required', 'in:recibido,en_ruta,entregado'],
        ]);

        $package->update(['status' => $request->status]);

        return back()->with('success', 'Estado actualizado correctamente.');
    }

    // Búsqueda por código de rastreo (para consulta pública o front)
    public function track(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $package = Package::with(['trip.route', 'trip.vehicle', 'trip.driver'])
            ->where('tracking_code', strtoupper($request->code))
            ->first();

        if (! $package) {
            return response()->json(['found' => false]);
        }

        return response()->json([
            'found'   => true,
            'package' => [
                'tracking_code'  => $package->tracking_code,
                'sender_name'    => $package->sender_name,
                'receiver_name'  => $package->receiver_name,
                'origin'         => $package->origin,
                'destination'    => $package->destination,
                'package_type'   => $package->package_type,
                'status'         => $package->status,
                'trip'           => $package->trip ? [
                    'route'   => $package->trip->route->name,
                    'date'    => $package->trip->trip_date->format('d/m/Y'),
                    'status'  => $package->trip->status,
                    'vehicle' => $package->trip->vehicle?->plate,
                    'driver'  => $package->trip->driver?->name,
                ] : null,
            ],
        ]);
    }
}
