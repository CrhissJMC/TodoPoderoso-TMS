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
            $table->foreignId('trip_id')->constrained('trips')->onDelete('cascade');
            $table->foreignId('passenger_id')->constrained('passengers')->onDelete('restrict');
            $table->foreignId('sold_by')->constrained('users')->onDelete('restrict'); // Quién lo vendió
            
            $table->integer('seat_number');
            $table->string('boarding_stop', 100);
            $table->string('dropoff_stop', 100);
            $table->decimal('fare', 10, 2);
            
            $table->string('ticket_status', 50)->default('valido'); // valido, anulado, utilizado
            $table->string('payment_status', 50)->default('pagado'); // pagado, pendiente
            $table->string('payment_method', 50)->default('efectivo'); // efectivo, yape, plin, tarjeta
            
            $table->string('ticket_code', 50)->unique(); // Código único, ej: TKT-0001
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};