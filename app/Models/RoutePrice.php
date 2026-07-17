<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoutePrice extends Model
{
    protected $fillable = [
        'route_id',
        'origin_name',
        'destination_name',
        'ticket_fare',
        'pkg_fare_sobre_manila',
        'pkg_fare_caja_pequena',
        'pkg_fare_caja_mediana',
        'pkg_fare_caja_grande',
    ];

    protected $casts = [
        'ticket_fare' => 'decimal:2',
        'pkg_fare_sobre_manila' => 'decimal:2',
        'pkg_fare_caja_pequena' => 'decimal:2',
        'pkg_fare_caja_mediana' => 'decimal:2',
        'pkg_fare_caja_grande' => 'decimal:2',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }
}
