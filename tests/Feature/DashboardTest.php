<?php

use App\Enum\RolesEnum;
use App\Models\User;
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
