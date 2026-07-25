<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS `AutoTimeoutUsers`;
CREATE PROCEDURE `AutoTimeoutUsers`()
BEGIN
    UPDATE log_user_logs
    SET
        time_out = TIMESTAMP(CURRENT_DATE, '15:30:00'),
        remarks = 'System Generated Timeout'
    WHERE
        time_out IS NULL
        AND DATE(time_in) = CURRENT_DATE;
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS `AutoTimeoutUsers`;
SQL);
    }
};
