<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usr_users', function (Blueprint $table) {
            $table->id();
            $table->string('rfid', 20)->nullable();
            $table->bigInteger('privilege_id')->unsigned();
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('suffix', 10)->nullable();
            $table->enum('gender', ['Male', 'Female']);
            $table->binary('profile_image')->nullable();
            $table->string('last_name', 100);
            $table->string('email')->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->index('email', 'usr_users_idx_email');
            $table->index('privilege_id', 'usr_users_idx_privilege_id');
            $table->index('rfid', 'usr_users_idx_rfid');
            $table->foreign('privilege_id')->references('id')->on('privileges')->onDelete('cascade');
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE `usr_users` MODIFY `profile_image` LONGBLOB NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usr_users');
    }
};
