<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'trip_id',
        'passenger_id',
        'sold_by',
        'seat_number',
        'boarding_stop',
        'dropoff_stop',
        'fare',
        'ticket_status',
        'payment_status',
        'payment_method',
        'ticket_code',
    ];

    // Relaciones
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function passenger()
    {
        return $this->belongsTo(Passenger::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'sold_by');
    }

    // Auto-generar código de ticket antes de crear
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_code)) {
                // Genera un código tipo: TKT-654A9B
                $ticket->ticket_code = 'TKT-' . strtoupper(substr(uniqid(), -6));
            }
        });
    }
}