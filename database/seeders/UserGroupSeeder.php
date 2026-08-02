<?php

namespace Database\Seeders;

use App\Models\UserGroup;
use Illuminate\Database\Seeder;

class UserGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            ['user_type' => 'Student', 'category' => 'Undergraduate'],
            ['user_type' => 'Student', 'category' => 'Senior High School'],
            ['user_type' => 'Student', 'category' => 'Graduate'],
            ['user_type' => 'Employee', 'category' => 'Faculty'],
            ['user_type' => 'Employee', 'category' => 'Staff'],
            ['user_type' => 'Visitor', 'category' => 'Guest'],
        ];

        foreach ($groups as $group) {
            UserGroup::firstOrCreate(
                ['user_type' => $group['user_type'], 'category' => $group['category']],
                $group
            );
        }
    }
}
