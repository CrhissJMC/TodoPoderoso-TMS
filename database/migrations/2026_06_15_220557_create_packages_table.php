<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('clients')->restrictOnDelete();
            $table->foreignId('receiver_id')->constrained('clients')->restrictOnDelete();
            $table->string('origin', 100);
            $table->string('destination', 100);
            $table->foreignId('trip_id')->nullable()->constrained('trips')->nullOnDelete();
            $table->foreignId('received_by')->constrained('users');
            $table->string('package_type', 50);        // sobre_manila | caja
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('dimensions', 100)->nullable();
            $table->decimal('price', 10, 2);
            $table->string('payment_method', 50);      // efectivo | yape | plin | tarjeta
            $table->string('payment_status', 50);      // pagado | pendiente
            $table->string('status', 50)->default('recibido'); // recibido | en_ruta | entregado
            $table->string('tracking_code', 50)->unique();
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
