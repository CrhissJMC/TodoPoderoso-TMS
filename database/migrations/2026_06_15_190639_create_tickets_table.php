<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->foreignId('sold_by')->constrained('users');
            $table->integer('seat_number');
            $table->string('boarding_stop', 100);
            $table->string('dropoff_stop', 100);
            $table->decimal('fare', 10, 2);
            $table->string('ticket_status', 50)->default('emitido');   // emitido | abordado | anulado
            $table->string('payment_status', 50)->default('pagado');   // pagado | pendiente
            $table->string('payment_method', 50)->default('efectivo'); // efectivo | yape | plin | tarjeta
            $table->string('ticket_code', 50)->unique();
            $table->timestamps();
            $table->softDeletes();

            // Regla crítica: no vender el mismo asiento dos veces en el mismo viaje
            $table->unique(['trip_id', 'seat_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
