<?php

namespace App\Http\Controllers;

use App\Http\Requests\RouteRequest;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $query = Route::withCount('stops')
            ->with('stops');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('origin', 'ilike', "%{$search}%")
                  ->orWhere('destination', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('active') && $request->get('active') !== '') {
            $query->where('active', $request->boolean('active'));
        }

        $routes = $query->orderBy('name')->paginate(10)->withQueryString();

        $counts = [
            'total'    => Route::count(),
            'active'   => Route::where('active', true)->count(),
            'inactive' => Route::where('active', false)->count(),
        ];

        return Inertia::render('Routes/Index', [
            'routes'  => $routes,
            'counts'  => $counts,
            'filters' => $request->only(['search', 'active']),
        ]);
    }

    // Detalle de la ruta (endpoint JSON)
    public function show(Route $route)
    {
        $route->load(['stops' => fn ($q) => $q->orderBy('stop_order'), 'schedules']);

        return response()->json($route);
    }

    public function store(RouteRequest $request)
    {
        DB::transaction(function () use ($request) {
            $route = Route::create($request->safe()->except('stops'));

            $this->syncStops($route, $request->input('stops', []));
        });

        return redirect()
            ->route('routes.index')
            ->with('success', 'Ruta creada correctamente.');
    }

    public function update(RouteRequest $request, Route $route)
    {
        DB::transaction(function () use ($request, $route) {
            $route->update($request->safe()->except('stops'));

            // Reemplazar paradas: eliminar las viejas y crear las nuevas
            $route->stops()->delete();
            $this->syncStops($route, $request->input('stops', []));
        });

        return redirect()
            ->route('routes.index')
            ->with('success', 'Ruta actualizada correctamente.');
    }

    public function destroy(Route $route)
    {
        // Proteger si tiene horarios o viajes activos
        if ($route->schedules()->where('active', true)->exists()) {
            return back()->with('error', 'No se puede eliminar una ruta con horarios activos.');
        }

        if ($route->trips()->whereIn('status', ['programado', 'abordando', 'en_ruta'])->exists()) {
            return back()->with('error', 'No se puede eliminar una ruta con viajes en curso.');
        }

        DB::transaction(function () use ($route) {
            $route->stops()->delete();
            $route->delete();
        });

        return redirect()
            ->route('routes.index')
            ->with('success', 'Ruta eliminada correctamente.');
    }

    public function toggleActive(Route $route)
    {
        $route->update(['active' => ! $route->active]);

        $label = $route->active ? 'activada' : 'desactivada';

        return back()->with('success', "Ruta {$label} correctamente.");
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function syncStops(Route $route, array $stops): void
    {
        foreach ($stops as $index => $stop) {
            if (empty(trim($stop['stop_name'] ?? ''))) continue;

            $route->stops()->create([
                'stop_name'           => $stop['stop_name'],
                'stop_order'          => $index + 1,
                'minutes_from_origin' => $stop['minutes_from_origin'] ?? null,
                'fare_from_origin'    => $stop['fare_from_origin'] ?? null,
            ]);
        }
    }
}
