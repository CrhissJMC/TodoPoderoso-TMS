<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'origin',
        'destination',
        'estimated_minutes',
        'base_fare',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
        'estimated_minutes' => 'integer',
        'base_fare' => 'decimal:2',
    ];

    // Duración formateada: 90 → "1h 30m"
    public function getDurationLabelAttribute(): string
    {
        if (! $this->estimated_minutes) {
            return '—';
        }
        $h = intdiv($this->estimated_minutes, 60);
        $m = $this->estimated_minutes % 60;

        return $h > 0
            ? ($m > 0 ? "{$h}h {$m}m" : "{$h}h")
            : "{$m}m";
    }

    public function stops()
    {
        return $this->hasMany(RouteStop::class)->orderBy('stop_order');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
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
