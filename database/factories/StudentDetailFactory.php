<?php

namespace Database\Factories;

use App\Models\StudentDetail;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentDetail>
 */
class StudentDetailFactory extends Factory
{
    protected $model = StudentDetail::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'id_number' => fake()->unique()->numerify('202#-#####'),
            'level' => fake()->randomElement(['Grade 11', 'Grade 12', '1st Year', '2nd Year', '3rd Year', '4th Year']),
            'section' => fake()->randomElement(['BSIT 4-1', 'BSCS 3-2', 'BSIS 2-1', 'STEM 12-A', 'ABM 11-B']),
        ];
    }
}
