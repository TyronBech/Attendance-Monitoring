<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
DROP EVENT IF EXISTS `AutoTimeoutEvent`;
CREATE EVENT `AutoTimeoutEvent` ON SCHEDULE EVERY 1 DAY STARTS '2025-06-09 17:52:00' ON COMPLETION NOT PRESERVE ENABLE DO CALL AutoTimeoutUsers();
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
DROP EVENT IF EXISTS `AutoTimeoutEvent`;
SQL);
    }
};
