<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripStatusLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'trip_id',
        'changed_by',
        'previous_status',
        'new_status',
        'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function trip()      { return $this->belongsTo(Trip::class); }
    public function changedBy() { return $this->belongsTo(User::class, 'changed_by'); }
}
