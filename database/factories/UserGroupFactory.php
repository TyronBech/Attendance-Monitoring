<?php

namespace Database\Factories;

use App\Models\UserGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserGroup>
 */
class UserGroupFactory extends Factory
{
    protected $model = UserGroup::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_type' => fake()->randomElement(['Student', 'Employee', 'Visitor']),
            'category' => fake()->randomElement(['Undergraduate', 'Graduate', 'Faculty', 'Staff', 'Guest']),
        ];
    }
}
