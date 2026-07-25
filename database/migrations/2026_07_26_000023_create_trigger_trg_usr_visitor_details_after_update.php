<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TRIGGER `trg_usr_visitor_details_after_update` AFTER UPDATE ON `usr_visitor_details` FOR EACH ROW BEGIN
    DECLARE actor VARCHAR(50);
    SET actor = IFNULL(@current_user_id, 'system');

    IF NOT (OLD.school_org <=> NEW.school_org) THEN
        INSERT INTO audit_trail (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
        VALUES (NEW.user_id, 'usr_visitor_details', 'school_org', OLD.school_org, NEW.school_org, 'UPDATE', actor);
    END IF;

    IF NOT (OLD.purpose <=> NEW.purpose) THEN
        INSERT INTO audit_trail (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
        VALUES (NEW.user_id, 'usr_visitor_details', 'purpose', OLD.purpose, NEW.purpose, 'UPDATE', actor);
    END IF;
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS `trg_usr_visitor_details_after_update`;
SQL);
    }
};
