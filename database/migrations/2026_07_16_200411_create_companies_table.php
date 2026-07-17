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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Mi Empresa');
            $table->string('primary_color')->default('#4F46E5'); // Indigo 600
            $table->string('bg_color')->default('#F9FAFB'); // Gray 50
            $table->string('accent_color')->default('#8B5CF6'); // Violet 500
            $table->string('logo_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
