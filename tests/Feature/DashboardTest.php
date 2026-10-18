<?php

use App\Enum\RolesEnum;
use App\Models\Log;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $role = Role::firstOrCreate(['name' => RolesEnum::ADMIN->value]);
    $user = User::factory()->create();
    $user->assignRole($role);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard ranks the five most active users by recorded visits and research sessions', function (string $computerUse, string $property) {
    $role = Role::firstOrCreate(['name' => RolesEnum::ADMIN->value]);
    $admin = User::factory()->create();
    $admin->assignRole($role);
    $users = User::factory()->count(6)->create();

    foreach ($users as $index => $user) {
        for ($visit = 0; $visit < 6 - $index; $visit++) {
            $user->logs()->create([
                'computer_use' => $computerUse,
                'time_in' => now()->subYears(2)->addDays($index),
            ]);
        }
    }

    $this->actingAs($admin)->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has($property, 5)
            ->where("{$property}.0.id", $users[0]->id)
            ->where("{$property}.0.name", $users[0]->name)
            ->where("{$property}.0.count", 6)
            ->where("{$property}.0.rank", 1)
            ->where("{$property}.4.id", $users[4]->id)
            ->where("{$property}.4.count", 2)
            ->where("{$property}.4.rank", 5)
        );
})->with([
    'library visits' => ['No', 'topLibraryUsers'],
    'online research sessions' => ['Yes', 'topResearchUsers'],
]);

test('dashboard excludes invalid activity and resolves equal counts consistently', function (string $computerUse, string $property, string $otherProperty) {
    $role = Role::firstOrCreate(['name' => RolesEnum::ADMIN->value]);
    $admin = User::factory()->create();
    $admin->assignRole($role);
    $users = User::factory()->count(2)->create();

    foreach ($users->reverse() as $user) {
        $user->logs()->create(['computer_use' => $computerUse, 'time_in' => now()]);
    }

    $users[1]->logs()->create(['computer_use' => $computerUse, 'time_in' => null]);
    $users[1]->logs()->create(['computer_use' => $computerUse, 'time_in' => now()])->delete();
    Log::create(['computer_use' => $computerUse, 'time_in' => now()]);
    $deletedUser = User::factory()->create();
    $deletedUser->delete();
    $deletedUser->logs()->create(['computer_use' => $computerUse, 'time_in' => now()]);

    $this->actingAs($admin)->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has($property, 2)
            ->has($otherProperty, 0)
            ->where("{$property}.0.id", $users[0]->id)
            ->where("{$property}.0.count", 1)
            ->where("{$property}.1.id", $users[1]->id)
            ->where("{$property}.1.count", 1)
        );
})->with([
    'library visits' => ['No', 'topLibraryUsers', 'topResearchUsers'],
    'online research sessions' => ['Yes', 'topResearchUsers', 'topLibraryUsers'],
]);
