<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the import_progress table used to track the state of
     * async queue-based imports (materials, students, employees).
     * The actual job payload lives in the existing `jobs` table;
     * this table only stores progress metadata and a reference.
     */
    public function up(): void
    {
        Schema::create('import_progress', function (Blueprint $table) {
            $table->id();

            /** Which type of import is running */
            $table->enum('type', ['materials', 'students', 'employees']);

            /** Lifecycle status */
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])
                  ->default('pending');

            /** The user who initiated this import */
            $table->unsignedBigInteger('initiated_by');

            /** Total rows to be processed (set when job is dispatched) */
            $table->integer('total_rows')->default(0);

            /** Running count of rows already processed by the job */
            $table->integer('processed_rows')->default(0);

            /** Count of newly created records */
            $table->integer('new_count')->default(0);

            /** Count of updated records */
            $table->integer('updated_count')->default(0);

            /** Human-readable error detail when status = failed */
            $table->text('error_message')->nullable();

            $table->timestamps();

            $table->foreign('initiated_by')
                  ->references('id')
                  ->on('usr_users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_progress');
    }
};
