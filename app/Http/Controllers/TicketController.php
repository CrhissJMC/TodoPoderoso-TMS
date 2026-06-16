<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketRequest;
use App\Models\Passenger;
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
        $query = Ticket::with(['trip.route', 'trip.vehicle', 'passenger', 'soldBy']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_code', 'ilike', "%{$search}%")
                  ->orWhereHas('passenger', fn ($p) =>
                      $p->where('full_name', 'ilike', "%{$search}%")
                        ->orWhere('dni', 'ilike', "%{$search}%")
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
            'total'    => Ticket::count(),
            'emitido'  => Ticket::where('ticket_status', 'emitido')->count(),
            'abordado' => Ticket::where('ticket_status', 'abordado')->count(),
            'anulado'  => Ticket::where('ticket_status', 'anulado')->count(),
        ];

        // Viajes disponibles para vender (no completados/cancelados, desde ayer)
        $availableTrips = Trip::with(['route.stops', 'vehicle'])
            ->whereNotIn('status', ['completado', 'cancelado'])
            ->whereDate('trip_date', '>=', today()->subDay())
            ->orderBy('trip_date')
            ->get()
            ->map(fn ($t) => [
                'id'              => $t->id,
                'label'           => $t->route->name . ' — ' . $t->trip_date->format('d/m/Y'),
                'status'          => $t->status,
                'route_name'      => $t->route->name,
                'origin'          => $t->route->origin,
                'destination'     => $t->route->destination,
                'base_fare'       => $t->route->base_fare,
                'sellable_seats'  => $t->vehicle?->sellable_seats ?? 0,
                'stops'           => $t->route->stops->map(fn ($s) => [
                    'name' => $s->stop_name,
                    'fare' => $s->fare_from_origin,
                ]),
                'occupied_seats'  => $t->occupiedSeats(),
            ]);

        return Inertia::render('Tickets/Index', [
            'tickets'         => $tickets,
            'counts'          => $counts,
            'availableTrips'  => $availableTrips,
            'filters'         => $request->only(['search', 'status', 'trip_id']),
            'ticketStatuses'  => Ticket::ticketStatuses(),
            'paymentMethods'  => Ticket::paymentMethods(),
            'paymentStatuses' => Ticket::paymentStatuses(),
        ]);
    }

    public function store(TicketRequest $request)
    {
        $passenger = DB::transaction(function () use ($request) {
            // Buscar o crear pasajero por DNI
            $passenger = Passenger::where('dni', $request->passenger_dni)->first();

            if (! $passenger) {
                $passenger = Passenger::create([
                    'full_name' => $request->passenger_name,
                    'dni'       => $request->passenger_dni,
                    'phone'     => $request->passenger_phone,
                ]);
            }

            Ticket::create([
                'trip_id'        => $request->trip_id,
                'passenger_id'   => $passenger->id,
                'sold_by'        => Auth::id(),
                'seat_number'    => $request->seat_number,
                'boarding_stop'  => $request->boarding_stop,
                'dropoff_stop'   => $request->dropoff_stop,
                'fare'           => $request->fare,
                'ticket_status'  => 'emitido',
                'payment_status' => $request->payment_status,
                'payment_method' => $request->payment_method,
                'ticket_code'    => Ticket::generateTicketCode(),
            ]);

            return $passenger;
        });

        return redirect()
            ->route('tickets.index')
            ->with('success', "Boleto emitido para {$passenger->full_name}.");
    }

    public function update(TicketRequest $request, Ticket $ticket)
    {
        if ($ticket->ticket_status === 'anulado') {
            return back()->with('error', 'No se puede editar un boleto anulado.');
        }

        $passenger = Passenger::where('dni', $request->passenger_dni)->first();
        if (! $passenger) {
            $passenger = Passenger::create([
                'full_name' => $request->passenger_name,
                'dni'       => $request->passenger_dni,
                'phone'     => $request->passenger_phone,
            ]);
        }

        $ticket->update([
            'passenger_id'   => $passenger->id,
            'seat_number'    => $request->seat_number,
            'boarding_stop'  => $request->boarding_stop,
            'dropoff_stop'   => $request->dropoff_stop,
            'fare'           => $request->fare,
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
        $ticket->update(['ticket_status' => 'anulado']);
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
            'base_fare'      => $trip->route->base_fare,
            'stops'          => $trip->route->stops->map(fn ($s) => [
                'name' => $s->stop_name,
                'fare' => $s->fare_from_origin,
            ]),
        ]);
    }
}
