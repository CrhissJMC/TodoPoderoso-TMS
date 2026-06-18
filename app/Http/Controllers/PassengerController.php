<?php

namespace App\Http\Controllers;

use App\Http\Requests\PassengerRequest;
use App\Models\Passenger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PassengerController extends Controller
{
    public function index(Request $request)
    {
        $query = Passenger::withCount([
            'tickets',
            'tickets as completed_trips_count' => fn ($q) =>
                $q->whereHas('trip', fn ($t) => $t->where('status', 'completado')),
        ]);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'ilike', "%{$search}%")
                  ->orWhere('dni', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $passengers = $query
            ->orderBy('full_name')
            ->paginate(15)
            ->withQueryString();

        $counts = [
            'total'        => Passenger::count(),
            'with_tickets' => Passenger::has('tickets')->count(),
        ];

        return Inertia::render('Passengers/Index', [
            'passengers' => $passengers,
            'counts'     => $counts,
            'filters'    => $request->only(['search']),
        ]);
    }

    public function store(PassengerRequest $request)
    {
        Passenger::create($request->validated());

        return redirect()
            ->route('passengers.index')
            ->with('success', 'Pasajero registrado correctamente.');
    }

    public function update(PassengerRequest $request, Passenger $passenger)
    {
        $passenger->update($request->validated());

        return redirect()
            ->route('passengers.index')
            ->with('success', 'Datos del pasajero actualizados.');
    }

    public function destroy(Passenger $passenger)
    {
        if ($passenger->tickets()->whereHas('trip', fn ($q) =>
            $q->whereIn('status', ['programado', 'abordando', 'en_ruta'])
        )->exists()) {
            return back()->with('error', 'El pasajero tiene boletos en viajes activos.');
        }

        $passenger->delete();

        return redirect()
            ->route('passengers.index')
            ->with('success', 'Pasajero eliminado correctamente.');
    }

    // Búsqueda por DNI para autocompletar en venta de boletos
    public function searchByDni(Request $request)
    {
        $request->validate(['dni' => 'required|string|max:20']);

        $passenger = Passenger::where('dni', $request->dni)->first();

        if (! $passenger) {
            return response()->json(['found' => false]);
        }

        return response()->json([
            'found'     => true,
            'passenger' => [
                'id'        => $passenger->id,
                'full_name' => $passenger->full_name,
                'dni'       => $passenger->dni,
                'phone'     => $passenger->phone,
                // El campo email fue eliminado aquí
            ],
        ]);
    }
}