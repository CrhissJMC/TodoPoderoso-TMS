<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketRequest;
use App\Models\Client;
use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['trip.route', 'trip.vehicle', 'client', 'soldBy', 'voidedBy']);

        $user = Auth::user();
        if ($user && ($user->role_id === 6 || $user->role === 'cliente')) {
            if ($user->client) {
                $query->where('client_id', $user->client->id);
            } else {
                // Si es rol cliente pero no tiene cliente vinculado, no mostrar boletos
                $query->where('client_id', -1);
            }
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_code', 'ilike', "%{$search}%")
                    ->orWhereHas('client', fn ($c) => $c->where('name', 'ilike', "%{$search}%")
                        ->orWhere('document_number', 'ilike', "%{$search}%")
                    );
            });
        }

        if ($status = $request->get('status')) {
            $query->where('ticket_status', $status);
        }

        if ($tripId = $request->get('trip_id')) {
            $query->where('trip_id', $tripId);
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $counts = [
            'total' => Ticket::count(),
            'emitido' => Ticket::where('ticket_status', 'emitido')->count(),
            'abordado' => Ticket::where('ticket_status', 'abordado')->count(),
            'anulado' => Ticket::where('ticket_status', 'anulado')->count(),
        ];

        // Viajes disponibles para vender (no completados/cancelados, desde ayer)
        $availableTrips = Trip::with(['route.stops', 'route.prices', 'vehicle'])
            ->whereNotIn('status', ['completado', 'cancelado'])
            ->whereDate('trip_date', '>=', today()->subDay())
            ->orderBy('trip_date')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'label' => $t->route->name.' — '.$t->trip_date->format('d/m/Y'),
                'status' => $t->status,
                'route_name' => $t->route->name,
                'origin' => $t->route->origin,
                'destination' => $t->route->destination,
                'base_fare' => $t->route->base_fare,
                'sellable_seats' => $t->vehicle?->sellable_seats ?? 0,
                'stops' => $t->route->stops->map(fn ($s) => [
                    'name' => $s->stop_name,
                    'fare' => $s->fare_from_origin,
                ]),
                'prices' => $t->route->prices,
                'occupied_seats' => $t->occupiedSeats(),
            ]);

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'counts' => $counts,
            'availableTrips' => $availableTrips,
            'filters' => $request->only(['search', 'status', 'trip_id']),
            'ticketStatuses' => Ticket::ticketStatuses(),
            'paymentMethods' => Ticket::paymentMethods(),
            'paymentStatuses' => Ticket::paymentStatuses(),
        ]);
    }

    // Detalle del boleto (endpoint JSON)
    public function show(Ticket $ticket)
    {
        $ticket->load(['trip.route', 'client', 'soldBy', 'voidedBy']);

        return response()->json($ticket);
    }

    public function store(TicketRequest $request)
    {
        $client = DB::transaction(function () use ($request) {
            // Buscar o crear cliente por documento
            $client = Client::where('document_number', $request->client_document_number)->first();

            if (! $client) {
                $client = Client::create([
                    'name' => $request->client_name,
                    'document_type' => $request->client_document_type,
                    'document_number' => $request->client_document_number,
                    'phone' => $request->client_phone,
                ]);
            }

            // Calcular tarifa en el backend
            $trip = Trip::with('route.prices')->findOrFail($request->trip_id);
            $priceObj = $trip->route->prices
                ->where('origin_name', $request->boarding_stop)
                ->where('destination_name', $request->dropoff_stop)
                ->first();
            $fare = $priceObj && $priceObj->ticket_fare !== null
                ? $priceObj->ticket_fare
                : $trip->route->base_fare;

            Ticket::create([
                'trip_id' => $request->trip_id,
                'client_id' => $client->id,
                'sold_by' => Auth::id(),
                'seat_number' => $request->seat_number,
                'boarding_stop' => $request->boarding_stop,
                'dropoff_stop' => $request->dropoff_stop,
                'fare' => $fare,
                'ticket_status' => 'emitido',
                'payment_status' => $request->payment_status,
                'payment_method' => $request->payment_method,
                'ticket_code' => Ticket::generateTicketCode(),
            ]);

            return $client;
        });

        return redirect()
            ->route('tickets.index')
            ->with('success', "Boleto emitido para {$client->name}.");
    }

    public function update(TicketRequest $request, Ticket $ticket)
    {
        if ($ticket->ticket_status === 'anulado') {
            return back()->with('error', 'No se puede editar un boleto anulado.');
        }

        $client = Client::where('document_number', $request->client_document_number)->first();
        if (! $client) {
            $client = Client::create([
                'name' => $request->client_name,
                'document_type' => $request->client_document_type,
                'document_number' => $request->client_document_number,
                'phone' => $request->client_phone,
            ]);
        }
        // Recalcular tarifa en backend por si cambiaron los puntos de abordaje/bajada
        $trip = Trip::with('route.prices')->findOrFail($request->trip_id);
        $priceObj = $trip->route->prices
            ->where('origin_name', $request->boarding_stop)
            ->where('destination_name', $request->dropoff_stop)
            ->first();
        $fare = $priceObj && $priceObj->ticket_fare !== null
            ? $priceObj->ticket_fare
            : $trip->route->base_fare;

        $ticket->update([
            'trip_id' => $request->trip_id,
            'client_id' => $client->id,
            'seat_number' => $request->seat_number,
            'boarding_stop' => $request->boarding_stop,
            'dropoff_stop' => $request->dropoff_stop,
            'fare' => $fare,
            'payment_method' => $request->payment_method,
            'payment_status' => $request->payment_status,
        ]);

        return redirect()
            ->route('tickets.index')
            ->with('success', 'Boleto actualizado correctamente.');
    }

    public function destroy(Ticket $ticket)
    {
        // Anular en lugar de eliminar físicamente (libera el asiento)
        $ticket->update([
            'ticket_status' => 'anulado',
            'voided_by' => Auth::id(),
            'voided_at' => now(),
        ]);
        $ticket->delete();

        return redirect()
            ->route('tickets.index')
            ->with('success', 'Boleto anulado correctamente. El asiento quedó liberado.');
    }

    // Marcar como abordado (check-in)
    public function markBoarded(Ticket $ticket)
    {
        if ($ticket->ticket_status !== 'emitido') {
            return back()->with('error', 'Solo se pueden marcar como abordados los boletos emitidos.');
        }

        $ticket->update(['ticket_status' => 'abordado']);

        return back()->with('success', 'Pasajero registrado como abordado.');
    }

    // Endpoint para refrescar mapa de asientos de un viaje (AJAX desde el modal)
    public function seatMap(Trip $trip)
    {
        $trip->load('vehicle', 'route.stops');

        return response()->json([
            'sellable_seats' => $trip->vehicle?->sellable_seats ?? 0,
            'occupied_seats' => $trip->occupiedSeats(),
            'base_fare' => $trip->route->base_fare,
            'stops' => $trip->route->stops->map(fn ($s) => [
                'name' => $s->stop_name,
                'fare' => $s->fare_from_origin,
            ]),
        ]);
    }
}
