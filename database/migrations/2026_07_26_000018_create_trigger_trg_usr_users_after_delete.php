<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TRIGGER `trg_usr_users_after_delete` AFTER DELETE ON `usr_users` FOR EACH ROW BEGIN
    DECLARE actor VARCHAR(50);
    SET actor = IFNULL(@current_user_id, 'system');

    INSERT INTO audit_trail
        (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by, created_at, updated_at)
    VALUES
        (OLD.id, 'usr_users', 'rfid', OLD.rfid, NULL, 'DELETE', actor, NOW(), NOW()),
        (OLD.id, 'usr_users', 'privilege_id', CAST(OLD.privilege_id AS CHAR), NULL, 'DELETE', actor, NOW(), NOW()),
        (OLD.id, 'usr_users', 'first_name', OLD.first_name, NULL, 'DELETE', actor, NOW(), NOW()),
        (OLD.id, 'usr_users', 'middle_name', OLD.middle_name, NULL, 'DELETE', actor, NOW(), NOW()),
        (OLD.id, 'usr_users', 'last_name', OLD.last_name, NULL, 'DELETE', actor, NOW(), NOW()),
        (OLD.id, 'usr_users', 'suffix', OLD.suffix, NULL, 'DELETE', actor, NOW(), NOW()),
        (OLD.id, 'usr_users', 'gender', OLD.gender, NULL, 'DELETE', actor, NOW(), NOW()),
        (OLD.id, 'usr_users', 'email', OLD.email, NULL, 'DELETE', actor, NOW(), NOW());
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS `trg_usr_users_after_delete`;
SQL);
    }
};
