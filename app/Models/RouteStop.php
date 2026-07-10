<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RouteStop extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'route_id',
        'stop_name',
        'stop_order',
        'minutes_from_origin',
        'fare_from_origin',
    ];

    protected $casts = [
        'stop_order' => 'integer',
        'minutes_from_origin' => 'integer',
        'fare_from_origin' => 'decimal:2',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }
}
