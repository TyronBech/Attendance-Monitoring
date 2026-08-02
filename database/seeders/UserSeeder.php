<?php

namespace Database\Seeders;

use App\Enum\RolesEnum;
use App\Models\EmployeeDetail;
use App\Models\StudentDetail;
use App\Models\User;
use App\Models\UserGroup;
use App\Models\VisitorDetail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure roles exist
        foreach (RolesEnum::cases() as $role) {
            Role::firstOrCreate(['name' => $role->value], ['guard_name' => 'web']);
        }

        $studentGroup = UserGroup::where('user_type', 'Student')->first()
            ?? UserGroup::factory()->create(['user_type' => 'Student', 'category' => 'Undergraduate']);

        $employeeGroup = UserGroup::where('user_type', 'Employee')->first()
            ?? UserGroup::factory()->create(['user_type' => 'Employee', 'category' => 'Faculty']);

        $visitorGroup = UserGroup::where('user_type', 'Visitor')->first()
            ?? UserGroup::factory()->create(['user_type' => 'Visitor', 'category' => 'Guest']);

        // 2. Seed Default System Administrative Accounts
        $systemUsers = [
            [
                'email' => 'superadmin@ams.local',
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'role' => RolesEnum::SUPER_ADMIN->value,
                'privilege_id' => $employeeGroup->id,
            ],
            [
                'email' => 'admin@ams.local',
                'first_name' => 'System',
                'last_name' => 'Admin',
                'role' => RolesEnum::ADMIN->value,
                'privilege_id' => $employeeGroup->id,
            ],
            [
                'email' => 'librarian@ams.local',
                'first_name' => 'Head',
                'last_name' => 'Librarian',
                'role' => RolesEnum::LIBRARIAN->value,
                'privilege_id' => $employeeGroup->id,
            ],
            [
                'email' => 'encoder@ams.local',
                'first_name' => 'Data',
                'last_name' => 'Encoder',
                'role' => RolesEnum::ENCODER->value,
                'privilege_id' => $employeeGroup->id,
            ],
            [
                'email' => 'attendance@ams.local',
                'first_name' => 'Attendance',
                'last_name' => 'Display',
                'role' => RolesEnum::ATTENDANCE_DISPLAY->value,
                'privilege_id' => $employeeGroup->id,
            ],
        ];

        foreach ($systemUsers as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'rfid' => fake()->unique()->numerify('10##########'),
                    'privilege_id' => $data['privilege_id'],
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->hasRole($data['role'])) {
                $user->assignRole($data['role']);
            }
        }

        // 3. Seed Students with StudentDetails
        User::factory()
            ->count(20)
            ->create(['privilege_id' => $studentGroup->id])
            ->each(function (User $user) {
                StudentDetail::factory()->create(['user_id' => $user->id]);
            });

        // 4. Seed Employees with EmployeeDetails
        User::factory()
            ->count(10)
            ->create(['privilege_id' => $employeeGroup->id])
            ->each(function (User $user) {
                EmployeeDetail::factory()->create(['user_id' => $user->id]);
            });

        // 5. Seed Visitors with VisitorDetails
        User::factory()
            ->count(10)
            ->create(['privilege_id' => $visitorGroup->id])
            ->each(function (User $user) {
                VisitorDetail::factory()->create(['user_id' => $user->id]);
            });
    }
}
