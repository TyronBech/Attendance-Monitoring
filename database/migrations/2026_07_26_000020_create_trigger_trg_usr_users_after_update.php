<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TRIGGER `trg_usr_users_after_update` AFTER UPDATE ON `usr_users` FOR EACH ROW BEGIN
    DECLARE actor VARCHAR(50);
    SET actor = IFNULL(@current_user_id, 'system');

    IF NOT (OLD.rfid <=> NEW.rfid) THEN
        INSERT INTO audit_trail (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
        VALUES (NEW.id, 'usr_users', 'rfid', OLD.rfid, NEW.rfid, 'UPDATE', actor);
    END IF;

    IF NOT (OLD.privilege_id <=> NEW.privilege_id) THEN
        INSERT INTO audit_trail (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
        VALUES (NEW.id, 'usr_users', 'privilege_id', CAST(OLD.privilege_id AS CHAR), CAST(NEW.privilege_id AS CHAR), 'UPDATE', actor);
    END IF;

    IF NOT (OLD.first_name <=> NEW.first_name) THEN
        INSERT INTO audit_trail (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
        VALUES (NEW.id, 'usr_users', 'first_name', OLD.first_name, NEW.first_name, 'UPDATE', actor);
    END IF;

    IF NOT (OLD.last_name <=> NEW.last_name) THEN
        INSERT INTO audit_trail (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
        VALUES (NEW.id, 'usr_users', 'last_name', OLD.last_name, NEW.last_name, 'UPDATE', actor);
    END IF;

    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        INSERT INTO audit_trail (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
        VALUES (NEW.id, 'usr_users', 'deleted_at', NULL, CAST(NEW.deleted_at AS CHAR), 'DELETE', actor);
    END IF;
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS `trg_usr_users_after_update`;
SQL);
    }
};
