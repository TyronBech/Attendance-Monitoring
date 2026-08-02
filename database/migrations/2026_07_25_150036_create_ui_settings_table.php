<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ui_settings', function (Blueprint $table) {
            $table->id();
            $table->string('org_name', 100);
            $table->string('org_initial', 45)->nullable();
            $table->text('org_address');
            $table->binary('org_logo')->nullable();
            $table->binary('org_logo_full')->nullable();
            $table->string('email', 100);
            $table->string('contact_number', 45);
            $table->json('social_links')->nullable();
            $table->json('theme_colors')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE `ui_settings` MODIFY `org_logo` LONGBLOB NULL');
            DB::statement('ALTER TABLE `ui_settings` MODIFY `org_logo_full` LONGBLOB NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ui_settings');
    }
};
