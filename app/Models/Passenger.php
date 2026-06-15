<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Passenger extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'full_name',
        'dni',
        'phone',
        // 'email' eliminado de aquí
    ];

    // Iniciales para avatar
    public function getInitialsAttribute(): string
    {
        $parts = explode(' ', trim($this->full_name));
        $first = strtoupper(substr($parts[0] ?? '', 0, 1));
        $last  = strtoupper(substr($parts[1] ?? '', 0, 1));
        return $first . $last;
    }

    // Total de viajes realizados
    public function getTotalTripsAttribute(): int
    {
        return $this->tickets()->whereHas('trip', fn ($q) =>
            $q->where('status', 'completado')
        )->count();
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function trips()
    {
        return $this->hasManyThrough(Trip::class, Ticket::class, 'passenger_id', 'id', 'id', 'trip_id');
    }
}