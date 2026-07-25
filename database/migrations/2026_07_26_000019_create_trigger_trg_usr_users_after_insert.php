<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TRIGGER `trg_usr_users_after_insert` AFTER INSERT ON `usr_users` FOR EACH ROW BEGIN
    DECLARE actor VARCHAR(50);
    SET actor = IFNULL(@current_user_id, 'system');

    INSERT INTO audit_trail
        (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
    VALUES
        (NEW.id, 'usr_users', 'rfid', NULL, NEW.rfid, 'INSERT', actor),
        (NEW.id, 'usr_users', 'privilege_id', NULL, CAST(NEW.privilege_id AS CHAR), 'INSERT', actor),
        (NEW.id, 'usr_users', 'first_name', NULL, NEW.first_name, 'INSERT', actor),
        (NEW.id, 'usr_users', 'middle_name', NULL, NEW.middle_name, 'INSERT', actor),
        (NEW.id, 'usr_users', 'last_name', NULL, NEW.last_name, 'INSERT', actor),
        (NEW.id, 'usr_users', 'suffix', NULL, NEW.suffix, 'INSERT', actor),
        (NEW.id, 'usr_users', 'gender', NULL, NEW.gender, 'INSERT', actor),
        (NEW.id, 'usr_users', 'email', NULL, NEW.email, 'INSERT', actor);
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS `trg_usr_users_after_insert`;
SQL);
    }
};
