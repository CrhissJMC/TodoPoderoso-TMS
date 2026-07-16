<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });

        // Postgres enum check constraint update
        DB::statement('ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check');
        DB::statement("ALTER TABLE drivers ADD CONSTRAINT drivers_status_check CHECK (status::text = ANY (ARRAY['activo'::character varying, 'inactivo'::character varying, 'en_viaje'::character varying, 'en_renovacion'::character varying]::text[]))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check');
        DB::statement("ALTER TABLE drivers ADD CONSTRAINT drivers_status_check CHECK (status::text = ANY (ARRAY['activo'::character varying, 'inactivo'::character varying, 'en_viaje'::character varying]::text[]))");

        Schema::table('drivers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
