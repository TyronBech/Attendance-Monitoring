<?php

namespace Database\Seeders;

use App\Models\Log;
use App\Models\User;
use Illuminate\Database\Seeder;

class LogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            return;
        }

        // Create 3 to 8 attendance logs per user spread over the past month
        foreach ($users as $user) {
            $logCount = rand(3, 8);

            for ($i = 0; $i < $logCount; $i++) {
                Log::factory()->create([
                    'user_id' => $user->id,
                ]);
            }
        }
    }
}
