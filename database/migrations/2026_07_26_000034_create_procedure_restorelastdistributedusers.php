<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS `RestoreLastDistributedUsers`;
CREATE PROCEDURE `RestoreLastDistributedUsers`()
BEGIN
    DECLARE latest_created_at DATETIME;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT MAX(created_at) INTO latest_created_at FROM usr_users;

    IF latest_created_at IS NOT NULL THEN
        INSERT INTO usr_staging_users (
            rfid, first_name, middle_name, last_name, suffix, gender, email, password,
            profile_image, user_type, id_number, level, section, employee_id, employee_role,
            school_org, purpose, created_at, updated_at
        )
        SELECT
            u.rfid,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.suffix,
            u.gender,
            u.email,
            u.password,
            u.profile_image,
            COALESCE(p.user_type, 'visitor'),
            sd.id_number,
            sd.level,
            sd.section,
            ed.employee_id,
            ed.employee_role,
            vd.school_org,
            vd.purpose,
            NOW(),
            NOW()
        FROM usr_users u
        LEFT JOIN privileges p ON p.id = u.privilege_id
        LEFT JOIN usr_student_details sd ON sd.user_id = u.id
        LEFT JOIN usr_employee_details ed ON ed.user_id = u.id
        LEFT JOIN usr_visitor_details vd ON vd.user_id = u.id
        WHERE u.created_at = latest_created_at
          AND NOT EXISTS (SELECT 1 FROM usr_staging_users su WHERE su.email = u.email);

        DELETE FROM usr_student_details WHERE user_id IN (SELECT id FROM usr_users WHERE created_at = latest_created_at);
        DELETE FROM usr_employee_details WHERE user_id IN (SELECT id FROM usr_users WHERE created_at = latest_created_at);
        DELETE FROM usr_visitor_details WHERE user_id IN (SELECT id FROM usr_users WHERE created_at = latest_created_at);
        DELETE FROM usr_users WHERE created_at = latest_created_at;
    END IF;

    COMMIT;
END;
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS `RestoreLastDistributedUsers`;
SQL);
    }
};
