<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->nullable()->constrained('schedules')->nullOnDelete();
            $table->foreignId('route_id')->constrained('routes')->restrictOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->date('trip_date');
            $table->string('status', 50)->default('programado');
            $table->text('observations')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('trip_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignId('changed_by')->constrained('users');
            $table->string('previous_status', 50);
            $table->string('new_status', 50);
            $table->timestamp('changed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_status_logs');
        Schema::dropIfExists('trips');
    }
};
