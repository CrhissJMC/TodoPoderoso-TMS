<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('origin', 100);
            $table->string('destination', 100);
            $table->integer('estimated_minutes')->nullable();
            $table->decimal('base_fare', 10, 2);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('route_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->string('stop_name', 100);
            $table->integer('stop_order');
            $table->integer('minutes_from_origin')->nullable();
            $table->decimal('fare_from_origin', 10, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_stops');
        Schema::dropIfExists('routes');
    }
};
