<?php

namespace Database\Seeders;

use App\Enum\RolesEnum;
use App\Models\UISetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create roles from enum
        foreach (RolesEnum::cases() as $role) {
            Role::firstOrCreate(
                ['name' => $role->value],
                ['guard_name' => 'web']
            );
        }

        // Create default attendance display user
        $displayUser = User::firstOrCreate(
            ['email' => 'attendance@ams.local'],
            [
                'first_name' => 'Attendance',
                'last_name' => 'Display',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (! $displayUser->hasRole(RolesEnum::ATTENDANCE_DISPLAY->value)) {
            $displayUser->assignRole(RolesEnum::ATTENDANCE_DISPLAY->value);
        }

        // Ensure UI settings exist with default values
        if (UISetting::count() === 0) {
            UISetting::create([
                'org_name' => 'Attendance Monitoring System',
                'org_initial' => 'AMS',
                'org_address' => '123 Main Street, City, State 12345',
                'email' => 'admin@ams.local',
                'contact_number' => '+1 (555) 123-4567',
                'theme_colors' => [
                    'primary' => '#1e3a8a',    // Blue 900
                    'secondary' => '#7c3aed', // Violet 600
                    'tertiary' => '#f59e0b',  // Amber 500
                ],
                'social_links' => [
                    'facebook' => 'https://facebook.com',
                    'twitter' => 'https://twitter.com',
                    'instagram' => 'https://instagram.com',
                ],
            ]);
        }
    }
}
