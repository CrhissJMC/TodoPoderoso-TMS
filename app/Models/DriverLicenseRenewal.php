<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverLicenseRenewal extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'license_number',
        'expiry_date',
        'renewed_at',
        'document_path',
        'notes',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'renewed_at' => 'date',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
