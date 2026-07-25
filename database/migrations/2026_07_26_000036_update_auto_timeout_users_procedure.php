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
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS `AutoTimeoutUsers`;
CREATE PROCEDURE `AutoTimeoutUsers`()
BEGIN
    -- Explicitly set timezone for this execution session
    SET time_zone = '+08:00';
    
    UPDATE log_user_logs
    SET
        time_out = TIMESTAMP(CURRENT_DATE, '15:30:00'),
        remarks = 'System Generated Timeout'
    WHERE
        time_out IS NULL
        AND DATE(time_in) = CURRENT_DATE
        -- Only time-out users who clocked in BEFORE the timeout schedule (15:30)
        AND time_in < TIMESTAMP(CURRENT_DATE, '15:30:00');
END;
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
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
};
