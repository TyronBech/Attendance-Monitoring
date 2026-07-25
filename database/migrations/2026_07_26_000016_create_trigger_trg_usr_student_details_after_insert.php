<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TRIGGER `trg_usr_student_details_after_insert` AFTER INSERT ON `usr_student_details` FOR EACH ROW BEGIN
    DECLARE actor VARCHAR(50);
    SET actor = IFNULL(@current_user_id, 'system');

    INSERT INTO audit_trail
        (record_id, source_table, field_changed, old_value, new_value, action_type, changed_by)
    VALUES
        (NEW.user_id, 'usr_student_details', 'id_number', NULL, NEW.id_number, 'INSERT', actor),
        (NEW.user_id, 'usr_student_details', 'level', NULL, NEW.level, 'INSERT', actor),
        (NEW.user_id, 'usr_student_details', 'section', NULL, NEW.section, 'INSERT', actor);
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS `trg_usr_student_details_after_insert`;
SQL);
    }
};
