<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('license_number', 50)->unique();
            $table->string('license_type', 20)->default('B');
            $table->date('license_expiry')->nullable();
            $table->string('phone', 30);
            $table->string('email', 150)->nullable();
            $table->string('dni', 20)->nullable()->unique();
            $table->enum('status', ['activo', 'inactivo', 'en_viaje'])->default('activo');
            $table->foreignId('vehicle_id')
                ->nullable()
                ->constrained('vehicles')
                ->nullOnDelete();

            // --- AQUÍ ESTÁN LOS CAMPOS NUEVOS ---
            $table->enum('contract_type', ['empleado', 'propietario', 'alquiler'])->default('empleado');
            $table->decimal('rental_fee', 10, 2)->nullable();

            $table->text('observations')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
