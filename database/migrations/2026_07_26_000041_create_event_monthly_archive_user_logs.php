<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared(<<<'SQL'
DROP EVENT IF EXISTS `monthly_archive_user_logs`;
CREATE EVENT `monthly_archive_user_logs` ON SCHEDULE EVERY 1 MONTH STARTS '2025-03-19 22:05:05' ON COMPLETION NOT PRESERVE ENABLE DO CALL Archive_user_logs();
SQL);
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared(<<<'SQL'
DROP EVENT IF EXISTS `monthly_archive_user_logs`;
SQL);
    }
};
