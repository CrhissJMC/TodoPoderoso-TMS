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
        'capacity',
        'capacity_unit',
        'type',
        'status',
        'color',
        'observations',
    ];

    protected $casts = [
        'year'     => 'integer',
        'capacity' => 'integer',
    ];

    // Tipos de vehículo disponibles
    public static function types(): array
    {
        return ['Auto', 'Minivan', 'Otro'];
    }

    // Estados posibles
    public static function statuses(): array
    {
        return ['disponible', 'en_viaje', 'en_mantenimiento'];
    }

    // Label legible del estado
    public function statusLabel(): string
    {
        return match ($this->status) {
            'disponible'       => 'Disponible',
            'en_viaje'         => 'En viaje',
            'en_mantenimiento' => 'En mantenimiento',
            default            => $this->status,
        };
    }

    // Relación con conductores asignados
    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }

    // Relación con viajes
    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    // Scope: solo disponibles
    public function scopeAvailable($query)
    {
        return $query->where('status', 'disponible');
    }
}
