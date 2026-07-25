<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TRIGGER `soft_delete_user_details` AFTER UPDATE ON `usr_users` FOR EACH ROW BEGIN
    IF NEW.deleted_at IS NOT NULL THEN
        UPDATE usr_student_details SET deleted_at = NOW() WHERE user_id = NEW.id AND deleted_at IS NULL;
        UPDATE usr_visitor_details SET deleted_at = NOW() WHERE user_id = NEW.id AND deleted_at IS NULL;
        UPDATE usr_employee_details SET deleted_at = NOW() WHERE user_id = NEW.id AND deleted_at IS NULL;
    ELSEIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
        UPDATE usr_student_details SET deleted_at = NULL WHERE user_id = NEW.id AND deleted_at IS NOT NULL;
        UPDATE usr_visitor_details SET deleted_at = NULL WHERE user_id = NEW.id AND deleted_at IS NOT NULL;
        UPDATE usr_employee_details SET deleted_at = NULL WHERE user_id = NEW.id AND deleted_at IS NOT NULL;
    END IF;
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS `soft_delete_user_details`;
SQL);
    }
};
