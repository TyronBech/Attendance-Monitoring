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
        Schema::create('ui_settings', function (Blueprint $table) {
            $table->id();
            $table->string('org_name')->nullable();
            $table->string('org_initial', 10)->nullable();
            $table->text('org_address')->nullable();
            $table->longText('org_logo')->nullable();
            $table->longText('org_logo_full')->nullable();
            $table->string('email')->nullable();
            $table->string('contact_number')->nullable();
            $table->json('social_links')->nullable();
            $table->json('theme_colors')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ui_settings');
    }
};
