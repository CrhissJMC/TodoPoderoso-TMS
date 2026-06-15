<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketRequest;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\Passenger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['passenger', 'trip.route', 'seller']);

        // Búsqueda por código de boleto o nombre del pasajero
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_code', 'ilike', "%{$search}%")
                  ->orWhereHas('passenger', fn($p) => 
                      $p->where('full_name', 'ilike', "%{$search}%")
                        ->orWhere('dni', 'ilike', "%{$search}%")
                  );
            });
        }

        if ($status = $request->get('ticket_status')) {
            $query->where('ticket_status', $status);
        }

        $tickets = $query->latest()->paginate(15)->withQueryString();

        $counts = [
            'total'     => Ticket::count(),
            'validos'   => Ticket::where('ticket_status', 'valido')->count(),
            'anulados'  => Ticket::where('ticket_status', 'anulado')->count(),
        ];

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'counts'  => $counts,
            'filters' => $request->only(['search', 'ticket_status']),
        ]);
    }

    public function store(TicketRequest $request)
    {
        $data = $request->validated();
        
        // Asignamos automáticamente al usuario que está vendiendo el boleto
        $data['sold_by'] = Auth::id(); 
        
        Ticket::create($data);

        return redirect()->back()->with('success', 'Boleto vendido correctamente.');
    }

    public function update(TicketRequest $request, Ticket $ticket)
    {
        $ticket->update($request->validated());

        return redirect()->back()->with('success', 'Boleto actualizado.');
    }

    // Cambiar estado rápido (Ej: para anular un boleto)
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $request->validate(['ticket_status' => 'required|in:valido,anulado,utilizado']);
        
        $ticket->update(['ticket_status' => $request->ticket_status]);

        return back()->with('success', 'Estado del boleto actualizado.');
    }

    public function destroy(Ticket $ticket)
    {
        // En lugar de borrar físicamente, en finanzas se suele "Anular"
        $ticket->update(['ticket_status' => 'anulado']);
        $ticket->delete(); // Soft delete opcional

        return redirect()->back()->with('success', 'Boleto anulado correctamente.');
    }
}