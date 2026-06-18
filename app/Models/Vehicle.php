<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'plate',
        'brand',
        'model',
        'year',
        'capacity_seats', // NUEVO
        'sellable_seats', // NUEVO
        'type',
        'status',
        'color',
        'observations',
    ];

    protected $casts = [
        'year'           => 'integer',
        'capacity_seats' => 'integer',
        'sellable_seats' => 'integer',
    ];

    // Tipos de vehículo ajustados para personas
    public static function types(): array
    {
        return ['Auto', 'Minivan', 'Bus', 'Otro'];
    }

    // Estados corregidos
    public static function statuses(): array
    {
        return ['disponible', 'en_ruta', 'mantenimiento', 'inactivo'];
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            'disponible'    => 'Disponible',
            'en_ruta'       => 'En ruta',
            'mantenimiento' => 'Mantenimiento',
            'inactivo'      => 'Inactivo',
            default         => ucfirst($this->status),
        };
    }

    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'disponible');
    }
}