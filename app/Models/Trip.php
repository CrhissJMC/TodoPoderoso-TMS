<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trip extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'schedule_id',
        'route_id',
        'vehicle_id',
        'driver_id',
        'created_by',
        'trip_date',
        'status',
        'observations',
    ];

    protected $casts = [
        'trip_date' => 'date',
    ];

    public static function statuses(): array
    {
        return ['programado', 'abordando', 'en_ruta', 'completado', 'cancelado'];
    }

    public static function statusConfig(): array
    {
        return [
            'programado' => ['label' => 'Programado', 'color' => 'gray'],
            'abordando'  => ['label' => 'Abordando',  'color' => 'blue'],
            'en_ruta'    => ['label' => 'En ruta',    'color' => 'amber'],
            'completado' => ['label' => 'Completado', 'color' => 'green'],
            'cancelado'  => ['label' => 'Cancelado',  'color' => 'red'],
        ];
    }

    // Transiciones válidas de estado
    public static function allowedTransitions(): array
    {
        return [
            'programado' => ['abordando', 'cancelado'],
            'abordando'  => ['en_ruta',   'cancelado'],
            'en_ruta'    => ['completado','cancelado'],
            'completado' => [],
            'cancelado'  => [],
        ];
    }

    public function canTransitionTo(string $newStatus): bool
    {
        return in_array($newStatus, self::allowedTransitions()[$this->status] ?? []);
    }

    // Asientos ocupados (tickets emitidos/abordados)
    public function occupiedSeats(): array
    {
        return $this->tickets()
            ->whereNotIn('ticket_status', ['anulado'])
            ->pluck('seat_number')
            ->toArray();
    }

    // Relaciones
    public function schedule()  { return $this->belongsTo(Schedule::class); }
    public function route()     { return $this->belongsTo(Route::class); }
    public function vehicle()   { return $this->belongsTo(Vehicle::class)->withTrashed(); }
    public function driver()    { return $this->belongsTo(Driver::class)->withTrashed(); }
    public function creator()   { return $this->belongsTo(User::class, 'created_by'); }
    public function tickets()   { return $this->hasMany(Ticket::class); }
    public function packages()  { return $this->hasMany(Package::class); }
    public function statusLogs(){ return $this->hasMany(TripStatusLog::class)->orderByDesc('changed_at'); }
}
