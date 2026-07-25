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
        DB::unprepared("DROP PROCEDURE IF EXISTS `DistributeStagingUsers`;");
        DB::unprepared(<<<'SQL'
CREATE PROCEDURE `DistributeStagingUsers`()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO usr_users (
        rfid, privilege_id, first_name, middle_name, last_name, suffix, gender,
        email, password, profile_image
    )
    SELECT
        su.rfid,
        CASE
            WHEN su.user_type = 'student' THEN (SELECT id FROM privileges WHERE user_type = 'student' LIMIT 1)
            WHEN su.user_type = 'visitor' THEN (SELECT id FROM privileges WHERE user_type = 'visitor' LIMIT 1)
            WHEN su.user_type = 'employee' THEN (SELECT id FROM privileges WHERE user_type = 'employee' AND category = su.employee_role LIMIT 1)
            ELSE NULL
        END,
        su.first_name, su.middle_name, su.last_name, su.suffix, su.gender,
        su.email, su.password, su.profile_image
    FROM usr_staging_users su
    WHERE NOT EXISTS (
        SELECT 1 FROM usr_users u
        LEFT JOIN usr_student_details sd ON sd.user_id = u.id
        LEFT JOIN usr_employee_details ed ON ed.user_id = u.id
        WHERE u.deleted_at IS NULL AND (
            (su.email IS NOT NULL AND su.email != '' AND u.email = su.email)
            OR (su.rfid IS NOT NULL AND su.rfid != '' AND u.rfid = su.rfid)
            OR (su.user_type = 'student' AND su.id_number IS NOT NULL AND sd.id_number = su.id_number)
            OR (su.user_type = 'employee' AND su.employee_id IS NOT NULL AND ed.employee_id = su.employee_id)
        )
    );

    INSERT INTO usr_student_details (user_id, id_number, level, section)
    SELECT u.id, su.id_number, su.level, su.section
    FROM usr_staging_users su
    JOIN usr_users u ON 
        (su.email IS NOT NULL AND su.email != '' AND u.email = su.email)
        OR (su.rfid IS NOT NULL AND su.rfid != '' AND u.rfid = su.rfid)
        OR (
            (su.email IS NULL OR su.email = '') 
            AND (su.rfid IS NULL OR su.rfid = '')
            AND u.first_name = su.first_name 
            AND u.last_name = su.last_name
            AND u.gender = su.gender
        )
    WHERE su.user_type = 'student' AND su.id_number IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM usr_student_details sd WHERE sd.user_id = u.id);

    INSERT INTO usr_employee_details (user_id, employee_id, employee_role)
    SELECT u.id, su.employee_id, su.employee_role
    FROM usr_staging_users su
    JOIN usr_users u ON 
        (su.email IS NOT NULL AND su.email != '' AND u.email = su.email)
        OR (su.rfid IS NOT NULL AND su.rfid != '' AND u.rfid = su.rfid)
        OR (
            (su.email IS NULL OR su.email = '') 
            AND (su.rfid IS NULL OR su.rfid = '')
            AND u.first_name = su.first_name 
            AND u.last_name = su.last_name
            AND u.gender = su.gender
        )
    WHERE su.user_type = 'employee' AND su.employee_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM usr_employee_details ed WHERE ed.user_id = u.id);

    INSERT INTO usr_visitor_details (user_id, school_org, purpose)
    SELECT u.id, su.school_org, su.purpose
    FROM usr_staging_users su
    JOIN usr_users u ON 
        (su.email IS NOT NULL AND su.email != '' AND u.email = su.email)
        OR (su.rfid IS NOT NULL AND su.rfid != '' AND u.rfid = su.rfid)
        OR (
            (su.email IS NULL OR su.email = '') 
            AND (su.rfid IS NULL OR su.rfid = '')
            AND u.first_name = su.first_name 
            AND u.last_name = su.last_name
            AND u.gender = su.gender
        )
    WHERE su.user_type = 'visitor' AND su.school_org IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM usr_visitor_details vd WHERE vd.user_id = u.id);

    DELETE FROM usr_staging_users;

    COMMIT;
END;
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("DROP PROCEDURE IF EXISTS `DistributeStagingUsers`;");
        DB::unprepared(<<<'SQL'
CREATE PROCEDURE `DistributeStagingUsers`()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO usr_users (
        rfid, privilege_id, first_name, middle_name, last_name, suffix, gender,
        email, password, profile_image
    )
    SELECT
        su.rfid,
        CASE
            WHEN su.user_type = 'student' THEN (SELECT id FROM privileges WHERE user_type = 'student' LIMIT 1)
            WHEN su.user_type = 'visitor' THEN (SELECT id FROM privileges WHERE user_type = 'visitor' LIMIT 1)
            WHEN su.user_type = 'employee' THEN (SELECT id FROM privileges WHERE user_type = 'employee' AND category = su.employee_role LIMIT 1)
            ELSE NULL
        END,
        su.first_name, su.middle_name, su.last_name, su.suffix, su.gender,
        su.email, su.password, su.profile_image
    FROM usr_staging_users su
    WHERE NOT EXISTS (
        SELECT 1 FROM usr_users u WHERE u.email = su.email AND u.deleted_at IS NULL
    );

    INSERT INTO usr_student_details (user_id, id_number, level, section)
    SELECT u.id, su.id_number, su.level, su.section
    FROM usr_staging_users su
    JOIN usr_users u ON u.email = su.email
    WHERE su.user_type = 'student' AND su.id_number IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM usr_student_details sd WHERE sd.user_id = u.id);

    INSERT INTO usr_employee_details (user_id, employee_id, employee_role)
    SELECT u.id, su.employee_id, su.employee_role
    FROM usr_staging_users su
    JOIN usr_users u ON u.email = su.email
    WHERE su.user_type = 'employee' AND su.employee_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM usr_employee_details ed WHERE ed.user_id = u.id);

    INSERT INTO usr_visitor_details (user_id, school_org, purpose)
    SELECT u.id, su.school_org, su.purpose
    FROM usr_staging_users su
    JOIN usr_users u ON u.email = su.email
    WHERE su.user_type = 'visitor' AND su.school_org IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM usr_visitor_details vd WHERE vd.user_id = u.id);

    DELETE FROM usr_staging_users;

    COMMIT;
END;
SQL);
    }
};
