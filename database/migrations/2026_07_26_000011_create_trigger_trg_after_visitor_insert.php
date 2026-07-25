<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TRIGGER `trg_after_visitor_insert` AFTER INSERT ON `usr_users` FOR EACH ROW BEGIN
    IF NEW.privilege_id = (SELECT id FROM privileges WHERE user_type = 'visitor' LIMIT 1) THEN
        INSERT INTO log_user_logs (user_id, computer_use, time_in, remarks, created_at, updated_at)
        VALUES (NEW.id, 'No', NOW(), 'Time in', NOW(), NOW());
    END IF;
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS `trg_after_visitor_insert`;
SQL);
    }
};
