<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('log_user_logs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->unsigned()->nullable();
            $table->enum('computer_use', ['Yes', 'No'])->default('no');
            $table->dateTime('time_in')->nullable();
            $table->dateTime('time_out')->nullable();
            $table->string('remarks', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('user_id');
            $table->foreign('user_id')->references('id')->on('usr_users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_user_logs');
    }
};
