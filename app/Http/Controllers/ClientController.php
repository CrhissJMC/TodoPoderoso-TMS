<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::withCount([
            'tickets',
            'packagesAsSender',
            'packagesAsReceiver'
        ]);

        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('document_number', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $clients = $query->orderBy('name')->paginate(10)->withQueryString();

        $counts = [
            'total'               => Client::count(),
            'with_tickets'        => Client::has('tickets')->count(),
            'with_packages'       => Client::whereHas('packagesAsSender')->orWhereHas('packagesAsReceiver')->count(),
        ];

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'counts'  => $counts,
            'filters' => $request->only(['search']),
        ]);
    }

    // Detalle del cliente (endpoint JSON)
    public function show(Client $client)
    {
        $client->load(['tickets.trip.route', 'packagesAsSender', 'packagesAsReceiver']);

        return response()->json($client);
    }

    public function store(ClientRequest $request)
    {
        Client::create($request->validated());

        return redirect()
            ->route('clients.index')
            ->with('success', 'Cliente registrado correctamente.');
    }

    public function update(ClientRequest $request, Client $client)
    {
        $client->update($request->validated());

        return redirect()
            ->route('clients.index')
            ->with('success', 'Cliente actualizado correctamente.');
    }

    public function destroy(Client $client)
    {
        // Verificar si tiene relaciones antes de eliminar
        if ($client->tickets()->exists() || $client->packagesAsSender()->exists() || $client->packagesAsReceiver()->exists()) {
            return back()->with('error', 'No se puede eliminar el cliente porque tiene viajes o encomiendas asociados.');
        }

        $client->delete();

        return redirect()
            ->route('clients.index')
            ->with('success', 'Cliente eliminado correctamente.');
    }

    // Método AJAX para buscar clientes desde los modulos de Boletos y Encomiendas
    public function searchByDocument(Request $request)
    {
        $request->validate([
            'document_number' => 'required|string',
        ]);

        $client = Client::where('document_number', $request->document_number)->first();

        if ($client) {
            return response()->json(['success' => true, 'client' => $client]);
        }

        return response()->json(['success' => false, 'message' => 'Cliente no encontrado']);
    }
}
