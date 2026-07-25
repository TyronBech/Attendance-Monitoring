<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE import_progress MODIFY COLUMN type ENUM('materials', 'students', 'employees', 'user_images') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First delete any rows with the new enum value to avoid errors when rolling back
        DB::table('import_progress')->where('type', 'user_images')->delete();

        DB::statement("ALTER TABLE import_progress MODIFY COLUMN type ENUM('materials', 'students', 'employees') NOT NULL");
    }
};
