<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Route;
use App\Models\RoutePrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function edit()
    {
        $company = Company::first() ?? new Company;
        $routes = Route::with(['stops', 'prices'])->get();

        return Inertia::render('Admin/Company/Edit', [
            'companySettings' => $company,
            'routes' => $routes,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'primary_color' => 'required|string|max:20',
            'bg_color' => 'required|string|max:20',
            'accent_color' => 'required|string|max:20',
        ]);

        $company = Company::first();
        if (! $company) {
            $company = new Company;
        }

        $company->fill($request->only([
            'name', 'primary_color', 'bg_color', 'accent_color',
        ]));
        $company->save();

        return redirect()->back()->with('success', 'Configuración de empresa actualizada correctamente.');
    }

    public function updatePrices(Request $request)
    {
        $request->validate([
            'prices' => 'required|array',
            'prices.*.route_id' => 'required|exists:routes,id',
            'prices.*.origin_name' => 'required|string|max:100',
            'prices.*.destination_name' => 'required|string|max:100',
            'prices.*.ticket_fare' => 'nullable|numeric|min:0',
            'prices.*.pkg_fare_sobre_manila' => 'nullable|numeric|min:0',
            'prices.*.pkg_fare_caja_pequena' => 'nullable|numeric|min:0',
            'prices.*.pkg_fare_caja_mediana' => 'nullable|numeric|min:0',
            'prices.*.pkg_fare_caja_grande' => 'nullable|numeric|min:0',
        ]);

        foreach ($request->prices as $priceData) {
            RoutePrice::updateOrCreate(
                [
                    'route_id' => $priceData['route_id'],
                    'origin_name' => $priceData['origin_name'],
                    'destination_name' => $priceData['destination_name'],
                ],
                [
                    'ticket_fare' => $priceData['ticket_fare'] ?? null,
                    'pkg_fare_sobre_manila' => $priceData['pkg_fare_sobre_manila'] ?? null,
                    'pkg_fare_caja_pequena' => $priceData['pkg_fare_caja_pequena'] ?? null,
                    'pkg_fare_caja_mediana' => $priceData['pkg_fare_caja_mediana'] ?? null,
                    'pkg_fare_caja_grande' => $priceData['pkg_fare_caja_grande'] ?? null,
                ]
            );
        }

        return redirect()->back()->with('success', 'Matriz de tarifas actualizada correctamente.');
    }
}
