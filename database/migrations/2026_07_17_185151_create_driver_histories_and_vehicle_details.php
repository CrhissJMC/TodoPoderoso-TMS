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
        // 1. Añadir photo_path a drivers
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('photo_path', 255)->nullable()->after('license_document_path');
        });

        // 2. Tabla historial de renovaciones de licencia de conducir
        Schema::create('driver_license_renewals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->string('license_number', 50);
            $table->date('expiry_date');
            $table->date('renewed_at');
            $table->string('document_path', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Tabla historial de renovaciones de SOAT
        Schema::create('vehicle_soat_renewals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->date('expiration_date');
            $table->date('renewed_at');
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('document_path', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Tabla de mantenimientos del vehículo
        Schema::create('vehicle_maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->date('maintenance_date');
            $table->string('type', 50); // preventivo | correctivo
            $table->string('description', 255);
            $table->decimal('cost', 10, 2);
            $table->string('workshop', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_maintenances');
        Schema::dropIfExists('vehicle_soat_renewals');
        Schema::dropIfExists('driver_license_renewals');

        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn('photo_path');
        });
    }
};
