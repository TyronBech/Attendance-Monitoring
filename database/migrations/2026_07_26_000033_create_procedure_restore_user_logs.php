<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS `restore_user_logs`;
CREATE PROCEDURE `restore_user_logs`(IN restore_date DATE)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO log_user_logs (user_id, computer_use, time_in, time_out, remarks, created_at, updated_at)
    SELECT
        a.user_id,
        a.computer_use,
        a.timestamp,
        a.timestamp,
        a.action,
        NOW(),
        NOW()
    FROM archive_user_logs a
    WHERE DATE(a.timestamp) = restore_date
      AND a.user_id IS NOT NULL;

    DELETE FROM archive_user_logs WHERE DATE(timestamp) = restore_date;

    COMMIT;
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS `restore_user_logs`;
SQL);
    }
};
