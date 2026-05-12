<?php

namespace Database\Seeders;

use App\Enum\RolesEnum;
use App\Models\UISetting;
use Illuminate\Database\Seeder;
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
