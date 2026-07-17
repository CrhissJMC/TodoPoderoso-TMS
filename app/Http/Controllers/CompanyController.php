<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function edit()
    {
        $company = Company::first() ?? new Company();
        return Inertia::render('Admin/Company/Edit', [
            'companySettings' => $company
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
        if (!$company) {
            $company = new Company();
        }

        $company->fill($request->only([
            'name', 'primary_color', 'bg_color', 'accent_color'
        ]));
        $company->save();

        return redirect()->back()->with('success', 'Configuración de empresa actualizada correctamente.');
    }
}
