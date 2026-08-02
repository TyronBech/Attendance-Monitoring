<?php

namespace Database\Seeders;

use App\Models\UISetting;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserGroupSeeder::class,
            UserSeeder::class,
            LogSeeder::class,
        ]);

        // Ensure UI settings exist with default values
        if (UISetting::count() === 0) {
            UISetting::create([
                'org_name' => 'Attendance Monitoring System',
                'org_initial' => 'AMS',
                'org_address' => '123 Main Street, City, State 12345',
                'org_logo' => null,
                'org_logo_full' => null,
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
