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

    protected $casts = [
        'fare'        => 'decimal:2',
        'seat_number' => 'integer',
    ];

    public static function ticketStatuses(): array
    {
        return ['emitido', 'abordado', 'anulado'];
    }

    public static function paymentMethods(): array
    {
        return ['efectivo', 'yape', 'plin', 'tarjeta'];
    }

    public static function paymentStatuses(): array
    {
        return ['pagado', 'pendiente'];
    }

    // Genera código único: TKT-00001
    public static function generateTicketCode(): string
    {
        $last = self::withTrashed()->latest('id')->value('id') ?? 0;
        return 'TKT-' . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
    }

    public function trip()      { return $this->belongsTo(Trip::class); }
    public function client() { return $this->belongsTo(Client::class); }
    public function soldBy()    { return $this->belongsTo(User::class, 'sold_by'); }
}
