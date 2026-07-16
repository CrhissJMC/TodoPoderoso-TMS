<?php

namespace App\Http\Controllers;

use App\Http\Requests\PackageRequest;
use App\Models\Client;
use App\Models\Package;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $query = Package::with(['trip.route', 'receivedBy', 'sender', 'receiver']);

        $user = Auth::user();
        if ($user && ($user->role_id === 6 || $user->role === 'cliente')) {
            if ($user->client) {
                $query->where(function ($q) use ($user) {
                    $q->where('sender_id', $user->client->id)
                        ->orWhere('receiver_id', $user->client->id);
                });
            } else {
                // Si es rol cliente pero no tiene cliente vinculado, no mostrar encomiendas
                $query->where('id', -1);
            }
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('sender', fn ($s) => $s->where('name', 'ilike', "%{$search}%")->orWhere('document_number', 'ilike', "%{$search}%"))
                    ->orWhereHas('receiver', fn ($r) => $r->where('name', 'ilike', "%{$search}%")->orWhere('document_number', 'ilike', "%{$search}%"))
                    ->orWhere('tracking_code', 'ilike', "%{$search}%")
                    ->orWhere('origin', 'ilike', "%{$search}%")
                    ->orWhere('destination', 'ilike', "%{$search}%");
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
            'total' => Package::count(),
            'recibido' => Package::where('status', 'recibido')->count(),
            'en_ruta' => Package::where('status', 'en_ruta')->count(),
            'entregado' => Package::where('status', 'entregado')->count(),
        ];

        // Viajes activos para asignar encomiendas
        $activeTrips = Trip::with('route')
            ->whereIn('status', ['programado', 'abordando', 'en_ruta'])
            ->whereDate('trip_date', '>=', today()->subDay())
            ->orderBy('trip_date')
            ->get(['id', 'trip_date', 'status', 'route_id'])
            ->map(fn ($t) => [
                'id' => $t->id,
                'label' => $t->route->name.' — '.$t->trip_date->format('d/m/Y'),
                'status' => $t->status,
                'trip_date' => $t->trip_date->toDateString(),
                'route_name' => $t->route->name,
            ]);

        return Inertia::render('Packages/Index', [
            'packages' => $packages,
            'counts' => $counts,
            'activeTrips' => $activeTrips,
            'filters' => $request->only(['search', 'status', 'package_type']),
            'packageTypes' => Package::packageTypes(),
            'paymentMethods' => Package::paymentMethods(),
            'paymentStatuses' => Package::paymentStatuses(),
            'statuses' => Package::statuses(),
        ]);
    }

    // Detalle de la encomienda (endpoint JSON)
    public function show(Package $package)
    {
        $package->load(['trip.route', 'sender', 'receiver', 'receivedBy']);

        return response()->json($package);
    }

    public function store(PackageRequest $request)
    {
        $data = $request->validated();

        DB::transaction(function () use (&$data) {
            $sender = Client::where('document_number', $data['sender_document_number'])->first();
            if (! $sender) {
                $sender = Client::create([
                    'name' => $data['sender_name'],
                    'document_type' => $data['sender_document_type'],
                    'document_number' => $data['sender_document_number'],
                    'phone' => $data['sender_phone'],
                ]);
            }
            $receiver = Client::where('document_number', $data['receiver_document_number'])->first();
            if (! $receiver) {
                $receiver = Client::create([
                    'name' => $data['receiver_name'],
                    'document_type' => $data['receiver_document_type'],
                    'document_number' => $data['receiver_document_number'],
                    'phone' => $data['receiver_phone'],
                ]);
            }

            unset($data['sender_name'], $data['sender_document_type'], $data['sender_document_number'], $data['sender_phone']);
            unset($data['receiver_name'], $data['receiver_document_type'], $data['receiver_document_number'], $data['receiver_phone']);

            $data['sender_id'] = $sender->id;
            $data['receiver_id'] = $receiver->id;

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
                'received_by' => Auth::id(),
                'status' => $status,
                'tracking_code' => Package::generateTrackingCode(),
            ]);
        });

        return redirect()
            ->route('packages.index')
            ->with('success', 'Encomienda registrada correctamente.');
    }

    public function update(PackageRequest $request, Package $package)
    {
        if ($package->status === 'entregado') {
            return back()->with('error', 'No se puede editar una encomienda ya entregada.');
        }

        $data = $request->validated();

        DB::transaction(function () use (&$data, $package) {
            $sender = Client::where('document_number', $data['sender_document_number'])->first();
            if (! $sender) {
                $sender = Client::create([
                    'name' => $data['sender_name'],
                    'document_type' => $data['sender_document_type'],
                    'document_number' => $data['sender_document_number'],
                    'phone' => $data['sender_phone'],
                ]);
            }
            $receiver = Client::where('document_number', $data['receiver_document_number'])->first();
            if (! $receiver) {
                $receiver = Client::create([
                    'name' => $data['receiver_name'],
                    'document_type' => $data['receiver_document_type'],
                    'document_number' => $data['receiver_document_number'],
                    'phone' => $data['receiver_phone'],
                ]);
            }

            unset($data['sender_name'], $data['sender_document_type'], $data['sender_document_number'], $data['sender_phone']);
            unset($data['receiver_name'], $data['receiver_document_type'], $data['receiver_document_number'], $data['receiver_phone']);

            $data['sender_id'] = $sender->id;
            $data['receiver_id'] = $receiver->id;

            $package->update($data);
        });

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

        $package = Package::with(['trip.route', 'trip.vehicle', 'trip.driver', 'sender', 'receiver'])
            ->where('tracking_code', strtoupper($request->code))
            ->first();

        if (! $package) {
            return response()->json(['found' => false]);
        }

        return response()->json([
            'found' => true,
            'package' => [
                'tracking_code' => $package->tracking_code,
                'sender_name' => $package->sender->name,
                'receiver_name' => $package->receiver->name,
                'origin' => $package->origin,
                'destination' => $package->destination,
                'package_type' => $package->package_type,
                'status' => $package->status,
                'trip' => $package->trip ? [
                    'route' => $package->trip->route->name,
                    'date' => $package->trip->trip_date->format('d/m/Y'),
                    'status' => $package->trip->status,
                    'vehicle' => $package->trip->vehicle?->plate,
                    'driver' => $package->trip->driver?->name,
                ] : null,
            ],
        ]);
    }
}
