<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleSoatRenewal extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'expiration_date',
        'renewed_at',
        'cost',
        'document_path',
        'notes',
    ];

    protected $casts = [
        'expiration_date' => 'date',
        'renewed_at' => 'date',
        'cost' => 'decimal:2',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
