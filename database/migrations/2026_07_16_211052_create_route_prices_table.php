<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('route_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->string('origin_name', 100);
            $table->string('destination_name', 100);
            $table->decimal('ticket_fare', 10, 2)->nullable();
            $table->decimal('pkg_fare_sobre_manila', 10, 2)->nullable();
            $table->decimal('pkg_fare_caja_pequena', 10, 2)->nullable();
            $table->decimal('pkg_fare_caja_mediana', 10, 2)->nullable();
            $table->decimal('pkg_fare_caja_grande', 10, 2)->nullable();
            $table->timestamps();
            
            // Uniquely identify a tramo per route
            $table->unique(['route_id', 'origin_name', 'destination_name'], 'route_prices_unique_tramo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_prices');
    }
};
