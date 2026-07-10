<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('plate', 20)->unique();
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->integer('year')->nullable();

            // --- NUEVO: Lógica de Pasajeros ---
            $table->integer('capacity_seats'); // Asientos físicos totales
            $table->integer('sellable_seats'); // Asientos que se venden al público

            $table->string('type', 50)->default('Minivan');

            // Estados alineados con el nuevo TMS
            $table->enum('status', ['disponible', 'en_ruta', 'mantenimiento', 'inactivo'])->default('disponible');

            $table->string('color', 50)->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
