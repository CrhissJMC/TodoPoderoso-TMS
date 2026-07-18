<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\DriverLicenseRenewal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DriverLicenseController extends Controller
{
    public function showRenewForm()
    {
        $user = Auth::user();
        if (! $user || ! $user->role || $user->role->name !== 'chofer') {
            abort(403);
        }

        $driver = $user->driver;
        if (! $driver || ! $driver->isLicenseExpired()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Driver/LicenseRenew', [
            'currentCategory' => $driver->license_type,
            'licenseTypes' => Driver::licenseTypes(),
        ]);
    }

    public function processRenewal(Request $request)
    {
        $user = Auth::user();
        if (! $user || ! $user->role || $user->role->name !== 'chofer') {
            abort(403);
        }

        $driver = $user->driver;
        if (! $driver) {
            abort(403);
        }

        $request->validate([
            'license_type' => 'required|in:'.implode(',', Driver::licenseTypes()),
            'license_expiry' => 'required|date|after:today',
            'license_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'declaration' => 'accepted',
        ], [
            'license_type.required' => 'Debes seleccionar la categoría de tu licencia.',
            'license_expiry.required' => 'La nueva fecha de vencimiento es obligatoria.',
            'license_expiry.after' => 'La fecha de vencimiento debe ser posterior a hoy.',
            'license_document.required' => 'Debes adjuntar el documento de tu licencia.',
            'license_document.mimes' => 'El documento debe ser un archivo PDF o una imagen (JPG, PNG).',
            'license_document.max' => 'El documento no debe pesar más de 2MB.',
            'declaration.accepted' => 'Debes aceptar la declaración jurada para continuar.',
        ]);

        if ($request->hasFile('license_document')) {
            $path = $request->file('license_document')->store('licenses', 'public');

            // Delete old if exists
            if ($driver->license_document_path && Storage::disk('public')->exists($driver->license_document_path)) {
                Storage::disk('public')->delete($driver->license_document_path);
            }

            $driver->license_document_path = $path;
        }

        $driver->license_type = $request->license_type;
        $driver->license_expiry = $request->license_expiry;
        $driver->save();

        // Registrar en historial
        DriverLicenseRenewal::create([
            'driver_id' => $driver->id,
            'license_number' => $driver->license_number,
            'expiry_date' => $request->license_expiry,
            'renewed_at' => now(),
            'document_path' => $driver->license_document_path ?? null,
            'notes' => 'Renovado por el propio conductor desde su panel.',
        ]);

        return redirect()->route('dashboard')->with('success', 'Tu licencia ha sido actualizada correctamente.');
    }
}
