<?php

namespace Database\Factories;

use App\Models\Log;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Log>
 */
class LogFactory extends Factory
{
    protected $model = Log::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $timeIn = fake()->dateTimeBetween('-30 days', 'now');
        $timeOut = fake()->boolean(85)
            ? fake()->dateTimeBetween($timeIn, (clone $timeIn)->modify('+4 hours'))
            : null;

        return [
            'user_id' => User::factory(),
            'computer_use' => fake()->randomElement(['Yes', 'No']),
            'time_in' => $timeIn,
            'time_out' => $timeOut,
            'remarks' => fake()->optional(0.3)->randomElement(['Regular Entry', 'Auto Timeout', 'Manual Entry', 'Visitor Pass']),
        ];
    }
}
