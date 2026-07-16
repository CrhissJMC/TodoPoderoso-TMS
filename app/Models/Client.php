<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'document_type',
        'document_number',
        'phone',
        'email',
        'address',
    ];

    /**
     * El cliente puede estar vinculado a un usuario del sistema.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Un cliente puede tener muchos pasajes como pasajero.
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'client_id');
    }

    /**
     * Un cliente puede tener muchas encomiendas enviadas (remitente).
     */
    public function packagesAsSender()
    {
        return $this->hasMany(Package::class, 'sender_id');
    }

    /**
     * Un cliente puede tener muchas encomiendas recibidas (destinatario).
     */
    public function packagesAsReceiver()
    {
        return $this->hasMany(Package::class, 'receiver_id');
    }
}
