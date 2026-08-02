<?php

namespace Database\Factories;

use App\Models\EmployeeDetail;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmployeeDetail>
 */
class EmployeeDetailFactory extends Factory
{
    protected $model = EmployeeDetail::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'employee_id' => fake()->unique()->numerify('EMP-#####'),
            'employee_role' => fake()->randomElement(['Instructor', 'Assistant Professor', 'Associate Professor', 'Administrative Staff', 'Department Head', 'Librarian']),
        ];
    }
}
