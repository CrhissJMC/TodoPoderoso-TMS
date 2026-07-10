<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'vehicle_id',
        'driver_id',
        'departure_time',
        'days_of_week',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    // Días de la semana: '1,2,3,4,5' → [1, 2, 3, 4, 5]
    public function getDaysArrayAttribute(): array
    {
        return array_map('intval', explode(',', $this->days_of_week));
    }

    public static function dayLabels(): array
    {
        return [
            1 => 'Lun',
            2 => 'Mar',
            3 => 'Mié',
            4 => 'Jue',
            5 => 'Vie',
            6 => 'Sáb',
            7 => 'Dom',
        ];
    }

    public static function dayLabelsLong(): array
    {
        return [
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
            7 => 'Domingo',
        ];
    }

    // Hora formateada: '08:00:00' → '08:00'
    public function getFormattedTimeAttribute(): string
    {
        return substr($this->departure_time, 0, 5);
    }

    // Verifica si opera hoy
    public function isActiveToday(): bool
    {
        $today = (int) now()->format('N'); // ISO: 1=lunes, 7=domingo

        return in_array($today, $this->days_array);
    }

    // Relaciones
    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class)->withTrashed();
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class)->withTrashed();
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
