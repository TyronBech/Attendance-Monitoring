<?php

namespace Database\Factories;

use App\Models\VisitorDetail;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VisitorDetail>
 */
class VisitorDetailFactory extends Factory
{
    protected $model = VisitorDetail::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'school_org' => fake()->randomElement([
                'Polytechnic University of the Philippines',
                'De La Salle University',
                'University of Santo Tomas',
                'University of the Philippines',
                'Department of Education',
                'Independent Researcher',
            ]),
            'purpose' => fake()->randomElement([
                'Library Research',
                'Official Business',
                'Guest Visit',
                'Inquiry',
                'Seminar / Workshop',
            ]),
        ];
    }
}
