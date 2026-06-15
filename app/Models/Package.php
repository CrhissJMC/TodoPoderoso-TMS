<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_name',
        'receiver_name',
        'origin',
        'destination',
        'trip_id',
        'received_by',
        'package_type',
        'weight',
        'dimensions',
        'price',
        'payment_method',
        'payment_status',
        'status',
        'tracking_code',
        'observations',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'price'  => 'decimal:2',
    ];

    public static function packageTypes(): array
    {
        return ['sobre_manila', 'caja'];
    }

    public static function paymentMethods(): array
    {
        return ['efectivo', 'yape', 'plin', 'tarjeta'];
    }

    public static function paymentStatuses(): array
    {
        return ['pagado', 'pendiente'];
    }

    public static function statuses(): array
    {
        return ['recibido', 'en_ruta', 'entregado'];
    }

    // Genera un código único: PKG-00001
    public static function generateTrackingCode(): string
    {
        $last = self::withTrashed()->latest('id')->value('id') ?? 0;
        return 'PKG-' . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
