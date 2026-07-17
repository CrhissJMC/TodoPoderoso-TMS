<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'license_number',
        'license_type',
        'license_expiry',
        'phone',
        'email',
        'dni',
        'status',
        'vehicle_id',
        'user_id',       // NUEVO
        'contract_type', // NUEVO
        'rental_fee',    // NUEVO
        'observations',
        'license_document_path',
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'rental_fee' => 'decimal:2',
    ];

    public static function statuses(): array
    {
        return ['activo', 'inactivo', 'en_viaje', 'en_renovacion'];
    }

    public static function licenseTypes(): array
    {
        return ['A-IIa', 'A-IIb'];
    }

    // NUEVO: Modalidades de contrato
    public static function contractTypes(): array
    {
        return ['empleado', 'propietario', 'alquiler'];
    }

    public function isLicenseExpiringSoon(): bool
    {
        if (! $this->license_expiry) {
            return false;
        }

        return $this->license_expiry->diffInDays(now(), false) >= -30;
    }

    public function isLicenseExpired(): bool
    {
        if (! $this->license_expiry) {
            return false;
        }

        return $this->license_expiry->isPast();
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class)->withTrashed();
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}
