<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE `ui_settings` MODIFY `org_logo` LONGBLOB NULL');
            DB::statement('ALTER TABLE `ui_settings` MODIFY `org_logo_full` LONGBLOB NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE `ui_settings` MODIFY `org_logo` BLOB NULL');
            DB::statement('ALTER TABLE `ui_settings` MODIFY `org_logo_full` BLOB NULL');
        }
    }
};
