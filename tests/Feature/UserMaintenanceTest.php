<?php

use App\Enum\RolesEnum;
use App\Models\EmployeeDetail;
use App\Models\StudentDetail;
use App\Models\User;
use App\Models\UserGroup;
use App\Models\VisitorDetail;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->admin = User::factory()->create(['privilege_id' => null]);
    $this->admin->assignRole(Role::firstOrCreate(['name' => RolesEnum::ADMIN->value]));
    $this->actingAs($this->admin);
});

function maintenanceUser(string $type, array $attributes = [], array $details = []): User
{
    $group = UserGroup::factory()->create(['user_type' => $type]);
    $user = User::factory()->create(['privilege_id' => $group->id, ...$attributes]);

    match ($type) {
        'Student' => StudentDetail::factory()->create(['user_id' => $user->id, ...$details]),
        'Employee' => EmployeeDetail::factory()->create(['user_id' => $user->id, ...$details]),
        'Visitor' => VisitorDetail::factory()->create(['user_id' => $user->id, ...$details]),
    };

    return $user;
}

function maintenancePayload(string $type): array
{
    return [
        'user_type' => $type,
        'privilege_id' => UserGroup::factory()->create(['user_type' => $type])->id,
        'first_name' => 'Juan', 'middle_name' => 'Santos', 'last_name' => 'Dela Cruz', 'suffix' => 'Jr.',
        'gender' => 'Male', 'email' => 'juan@example.com', 'rfid' => 'RFID-12345',
        ...match ($type) {
            'Student' => ['student_id' => 'STU-001', 'grade_level' => 'Grade 10', 'section' => 'Section A'],
            'Employee' => ['employee_id' => 'EMP-001', 'employee_role' => 'Teacher'],
            'Visitor' => ['school_org' => 'Example School', 'purpose' => 'Research'],
        },
    ];
}

test('maintenance requires an authenticated verified administrator', function (string $access) {
    if ($access === 'guest') {
        auth()->logout();
    } else {
        $user = $access === 'unverified' ? User::factory()->unverified()->create() : User::factory()->create();
        if ($access === 'unverified') {
            $user->assignRole(Role::findByName(RolesEnum::ADMIN->value));
        }
        $this->actingAs($user);
    }
    $target = maintenanceUser('Student');

    foreach ([
        ['get', route('maintenance.users')], ['get', route('maintenance.users.create')],
        ['get', route('maintenance.users.show', $target)], ['get', route('maintenance.users.edit', $target)],
        ['post', route('maintenance.users.store')], ['put', route('maintenance.users.update', $target)],
        ['delete', route('maintenance.users.destroy', $target)],
    ] as [$method, $url]) {
        $this->{$method}($url)->assertRedirect(route($access === 'unverified' ? 'verification.notice' : 'login'));
    }
    expect($target->fresh()->deleted_at)->toBeNull();
})->with(['guest', 'regular user', 'unverified']);

test('maintenance lists only the selected user type without exposing credentials', function (string $type) {
    $target = maintenanceUser($type, ['two_factor_backup_codes' => 'private-backup']);
    maintenanceUser(collect(['Student', 'Employee', 'Visitor'])->first(fn (string $other) => $other !== $type));
    maintenanceUser($type)->delete();

    $this->get(route('maintenance.users', ['user_type' => $type]))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('users/index')
            ->where('filters.user_type', $type)->has('users.data', 1)
            ->where('users.data.0.id', $target->id)->where('users.data.0.user_type', $type)
            ->missing('users.data.0.password')->missing('users.data.0.two_factor_backup_codes')->missing('users.data.0.profile_image'));
})->with(['Student', 'Employee', 'Visitor']);

test('maintenance searches names in any order and other identifying fields', function (string $term) {
    $target = maintenanceUser('Student', [
        'first_name' => 'Juan Miguel', 'middle_name' => 'Santos', 'last_name' => 'Dela Cruz',
        'email' => 'juan.miguel@example.com', 'rfid' => 'CARD-98765',
    ], ['id_number' => 'STU-456', 'level' => 'Grade 10', 'section' => 'Section Alpha']);
    maintenanceUser('Student', ['first_name' => 'Pedro', 'middle_name' => null, 'last_name' => 'Reyes', 'suffix' => null, 'email' => 'pedro@example.net', 'rfid' => 'OTHER-CARD'], ['id_number' => 'OTHER-ID', 'level' => 'Grade 8', 'section' => 'Beta']);
    maintenanceUser('Employee', ['first_name' => 'Juan Miguel', 'last_name' => 'Dela Cruz']);

    $this->get(route('maintenance.users', ['search' => $term]))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('users.data', 1)->where('users.data.0.id', $target->id));
})->with(['Juan', 'dela cruz', 'Juan Dela Cruz', 'Dela Cruz, Juan', '  Juan   Santos Cruz  ', 'CARD-98765', 'juan.miguel@', 'STU-456', 'Grade 10', 'Section Alpha']);

test('maintenance searches employee and visitor details', function (string $type, string $term) {
    $target = maintenanceUser($type, [], $type === 'Employee'
        ? ['employee_id' => 'EMP-TARGET', 'employee_role' => 'Science Teacher']
        : ['school_org' => 'Target University', 'purpose' => 'Historical Research']);
    $this->get(route('maintenance.users', ['user_type' => $type, 'search' => $term]))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('users.data', 1)->where('users.data.0.id', $target->id));
})->with([
    ['Employee', 'EMP-TARGET'], ['Employee', 'Science Teacher'],
    ['Visitor', 'Target University'], ['Visitor', 'Historical Research'],
]);

test('maintenance orders each group by oldest or newest addition', function (string $type, string $sort) {
    $old = maintenanceUser($type, ['created_at' => now()->subYear()]);
    $new = maintenanceUser($type, ['created_at' => now()]);
    $this->get(route('maintenance.users', ['user_type' => $type, 'sort' => $sort]))->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.data.0.id', ($sort === 'oldest' ? $old : $new)->id)
            ->where('users.data.1.id', ($sort === 'oldest' ? $new : $old)->id));
})->with(['Student', 'Employee', 'Visitor'])->with(['newest', 'oldest']);

test('student grade ordering places grade 2 before grade 10 and college levels after school grades', function () {
    $college = maintenanceUser('Student', [], ['level' => '1st Year']);
    $tenth = maintenanceUser('Student', [], ['level' => 'Grade 10']);
    $second = maintenanceUser('Student', [], ['level' => 'Grade 2']);
    $missing = maintenanceUser('Student', [], ['level' => null]);
    $this->get(route('maintenance.users', ['sort' => 'grade_level']))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('users.data.0.id', $second->id)
            ->where('users.data.1.id', $tenth->id)->where('users.data.2.id', $college->id)->where('users.data.3.id', $missing->id));
});

test('employee role ordering uses the employment role', function () {
    $teacher = maintenanceUser('Employee', [], ['employee_role' => 'Teacher']);
    $librarian = maintenanceUser('Employee', [], ['employee_role' => 'Librarian']);
    $this->get(route('maintenance.users', ['user_type' => 'Employee', 'sort' => 'role']))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('users.data.0.id', $librarian->id)->where('users.data.1.id', $teacher->id));
});

test('maintenance validates type specific sorts and pagination input', function (array $query, string $field) {
    $this->getJson(route('maintenance.users', $query))->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    [['user_type' => 'Visitor', 'sort' => 'grade_level'], 'sort'],
    [['user_type' => 'Student', 'sort' => 'role'], 'sort'],
    [['user_type' => 'Employee', 'sort' => 'grade_level'], 'sort'],
    [['user_type' => 'Unknown'], 'user_type'], [['sort' => 'created_at desc; drop table users'], 'sort'],
    [['page' => -1], 'page'], [['search' => ['invalid']], 'search'],
]);

test('maintenance pagination retains the group search and sort', function () {
    $group = UserGroup::factory()->create(['user_type' => 'Visitor']);
    User::factory()->count(16)->create(['privilege_id' => $group->id, 'first_name' => 'Matching']);
    $this->get(route('maintenance.users', ['user_type' => 'Visitor', 'search' => 'Matching', 'sort' => 'oldest', 'page' => 2]))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('users.data', 1)->where('users.total', 16)->where('users.current_page', 2)
            ->where('users.prev_page_url', fn (string $url) => str_contains($url, 'user_type=Visitor') && str_contains($url, 'search=Matching') && str_contains($url, 'sort=oldest')));
});

test('the creation form receives only active supported groups', function () {
    $group = UserGroup::factory()->create(['user_type' => 'Visitor']);
    UserGroup::factory()->create(['user_type' => 'Visitor'])->delete();
    UserGroup::factory()->create(['user_type' => 'Other']);
    $this->get(route('maintenance.users.create', ['user_type' => 'Visitor']))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('users/create')->where('userType', 'Visitor')
            ->where('groups', fn ($groups) => collect($groups)->contains('id', $group->id) && ! collect($groups)->contains('user_type', 'Other')));
});

test('administrators can create a user with the matching type details', function (string $type) {
    $payload = maintenancePayload($type);
    $this->post(route('maintenance.users.store'), $payload)->assertRedirect();
    $user = User::where('email', $payload['email'])->firstOrFail();
    expect($user->first_name)->toBe('Juan')->and($user->rfid)->toBe('RFID-12345')
        ->and($user->privileges->user_type)->toBe($type)->and($user->password)->not->toBeEmpty()->and($user->roles)->toHaveCount(0);
    match ($type) {
        'Student' => expect($user->students->id_number)->toBe('STU-001')->and($user->students->level)->toBe('Grade 10'),
        'Employee' => expect($user->employees->employee_id)->toBe('EMP-001')->and($user->employees->employee_role)->toBe('Teacher'),
        'Visitor' => expect($user->visitors->school_org)->toBe('Example School')->and($user->visitors->purpose)->toBe('Research'),
    };
})->with(['Student', 'Employee', 'Visitor']);

test('administrators can view and edit each type of user without receiving authentication secrets', function (string $type) {
    $user = maintenanceUser($type, ['two_factor_backup_codes' => 'secret-backup']);
    foreach (['show', 'edit'] as $action) {
        $this->get(route('maintenance.users.'.$action, $user))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('users/'.$action)
                ->where('managedUser.id', $user->id)->where('managedUser.name', $user->name)->where('managedUser.user_type', $type)
                ->missing('managedUser.password')->missing('managedUser.two_factor_secret')->missing('managedUser.two_factor_backup_codes'));
    }
})->with(['Student', 'Employee', 'Visitor']);

test('administrators can update common and type specific fields without changing credentials', function (string $type) {
    $user = maintenanceUser($type);
    $password = $user->password;
    $payload = maintenancePayload($type);
    $payload['email'] = $user->email;
    $payload['rfid'] = $user->rfid;
    $payload['password'] = 'untrusted-password';
    $payload['two_factor_enabled'] = true;
    $payload['roles'] = [RolesEnum::SUPER_ADMIN->value];
    $this->put(route('maintenance.users.update', $user), $payload)->assertRedirect(route('maintenance.users.show', $user));
    $user->refresh();
    expect($user->first_name)->toBe('Juan')->and($user->password)->toBe($password)
        ->and($user->two_factor_enabled)->toBeFalse()->and($user->roles)->toHaveCount(0)->and($user->privilege_id)->toBe($payload['privilege_id']);
    match ($type) {
        'Student' => expect($user->students->id_number)->toBe('STU-001'),
        'Employee' => expect($user->employees->employee_role)->toBe('Teacher'),
        'Visitor' => expect($user->visitors->purpose)->toBe('Research'),
    };
})->with(['Student', 'Employee', 'Visitor']);

test('maintenance rejects invalid user data without creating partial records', function (string $field, mixed $value) {
    $payload = maintenancePayload('Student');
    $payload[$field] = $value;
    $count = User::count();
    $this->postJson(route('maintenance.users.store'), $payload)->assertUnprocessable()->assertJsonValidationErrors($field);
    expect(User::count())->toBe($count);
})->with([
    ['first_name', ''], ['last_name', ''], ['email', 'invalid'], ['gender', 'Unknown'],
    ['rfid', str_repeat('1', 21)], ['student_id', ''], ['grade_level', str_repeat('x', 51)],
    ['privilege_id', 999999], ['user_type', 'Other'],
]);

test('maintenance rejects another group or a deleted group', function (bool $deleted) {
    $payload = maintenancePayload('Student');
    $group = UserGroup::factory()->create(['user_type' => $deleted ? 'Student' : 'Employee']);
    if ($deleted) {
        $group->delete();
    }
    $payload['privilege_id'] = $group->id;
    $this->postJson(route('maintenance.users.store'), $payload)->assertUnprocessable()->assertJsonValidationErrors('privilege_id');
})->with([false, true]);

test('maintenance prevents changing an existing users type', function () {
    $user = maintenanceUser('Student');
    $this->putJson(route('maintenance.users.update', $user), maintenancePayload('Employee'))
        ->assertUnprocessable()->assertJsonValidationErrors('user_type');
    expect($user->fresh()->privileges->user_type)->toBe('Student');
});

test('maintenance rejects duplicate identifiers including deleted users emails', function (string $field) {
    $existing = maintenanceUser('Student', ['email' => 'juan@example.com', 'rfid' => 'RFID-12345'], ['id_number' => 'STU-001']);
    $payload = maintenancePayload('Student');
    $payload['email'] = $field === 'email' ? $existing->email : 'different@example.com';
    $payload['rfid'] = $field === 'rfid' ? $existing->rfid : 'different-rfid';
    $payload['student_id'] = $field === 'student_id' ? $existing->students->id_number : 'STU-OTHER';
    if ($field === 'email') {
        $existing->delete();
    }
    $this->postJson(route('maintenance.users.store'), $payload)->assertUnprocessable()->assertJsonValidationErrors($field);
})->with(['email', 'rfid', 'student_id']);

test('administrators can delete users and their related details and logs', function (string $type) {
    $user = maintenanceUser($type);
    $detail = match ($type) {
        'Student' => $user->students, 'Employee' => $user->employees, 'Visitor' => $user->visitors,
    };
    $log = $user->logs()->create(['time_in' => now(), 'computer_use' => 'No']);
    $this->delete(route('maintenance.users.destroy', $user))->assertRedirect(route('maintenance.users', ['user_type' => $type]));
    $this->assertSoftDeleted($user);
    $this->assertSoftDeleted($detail);
    $this->assertSoftDeleted($log);
    $this->get(route('maintenance.users.show', $user))->assertNotFound();
    $this->get(route('maintenance.users.edit', $user))->assertNotFound();
    $this->put(route('maintenance.users.update', $user), [])->assertNotFound();
    $this->delete(route('maintenance.users.destroy', $user))->assertNotFound();
})->with(['Student', 'Employee', 'Visitor']);

test('profile images are provided on view and edit pages but omitted from user lists', function (?string $storedImage, ?string $expectedImage) {
    $user = maintenanceUser('Student', ['profile_image' => $storedImage]);

    $this->get(route('maintenance.users.show', $user))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('managedUser.profile_image', $expectedImage));
    $this->get(route('maintenance.users.edit', $user))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('managedUser.profile_image', $expectedImage));
    $this->get(route('maintenance.users'))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('users.data', 1)->missing('users.data.0.profile_image'));
})->with([
    'no image' => [null, null],
    'data URL' => ['data:image/png;base64,aW1hZ2U=', 'data:image/png;base64,aW1hZ2U='],
    'base64' => ['aW1hZ2U=', 'data:image/jpeg;base64,aW1hZ2U='],
    'binary' => ["\xFF\xD8\xFF", 'data:image/jpeg;base64,/9j/'],
]);

test('administrators can create users with a validated profile photo', function (string $filename, string $mimeType) {
    $photo = UploadedFile::fake()->image($filename, 200, 200);
    $this->post(route('maintenance.users.store'), [...maintenancePayload('Student'), 'profile_image' => $photo])
        ->assertRedirect();

    $user = User::where('email', 'juan@example.com')->firstOrFail();
    expect($user->profile_image)->toStartWith('data:'.$mimeType.';base64,')
        ->and(base64_decode(explode(',', $user->profile_image, 2)[1]))->toBe($photo->getContent());
    $user->assignRole(Role::findByName(RolesEnum::ADMIN->value));
    $user->forceFill(['email_verified_at' => now()])->save();
    $this->actingAs($user)->get(route('profile.edit'))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('user.profile_image', $user->profile_image));
})->with([['photo.jpg', 'image/jpeg'], ['photo.png', 'image/png'], ['photo.webp', 'image/webp']]);

test('photo edits use multipart method spoofing and preserve the existing photo until replaced or removed', function () {
    $user = maintenanceUser('Student', ['profile_image' => 'data:image/png;base64,b2xk']);
    $payload = ['_method' => 'put', ...maintenancePayload('Student')];

    $this->post(route('maintenance.users.update', $user), [...$payload, 'profile_image' => null, 'remove_profile_image' => false])
        ->assertRedirect(route('maintenance.users.show', $user));
    expect($user->fresh()->profile_image)->toBe('data:image/png;base64,b2xk');

    $photo = UploadedFile::fake()->image('replacement.png');
    $this->post(route('maintenance.users.update', $user), [...$payload, 'profile_image' => $photo])
        ->assertRedirect(route('maintenance.users.show', $user));
    expect(base64_decode(explode(',', $user->fresh()->profile_image, 2)[1]))->toBe($photo->getContent());

    $this->post(route('maintenance.users.update', $user), [...$payload, 'remove_profile_image' => true])
        ->assertRedirect(route('maintenance.users.show', $user));
    expect($user->fresh()->profile_image)->toBeNull();
});

test('invalid profile photos cannot create users or alter an existing photo', function (string $invalidPhoto) {
    $user = maintenanceUser('Student', ['profile_image' => 'data:image/png;base64,b2xk']);
    $photo = match ($invalidPhoto) {
        'text disguised as image' => UploadedFile::fake()->createWithContent('photo.jpg', 'This is not an image.'),
        'svg' => UploadedFile::fake()->createWithContent('photo.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>'),
        'gif' => UploadedFile::fake()->image('photo.gif'),
        'wrong extension' => UploadedFile::fake()->createWithContent('photo.txt', UploadedFile::fake()->image('valid.png')->getContent()),
        'too large' => UploadedFile::fake()->image('photo.png')->size(2049),
        'too wide' => UploadedFile::fake()->image('photo.png', 4097, 1),
        'too tall' => UploadedFile::fake()->image('photo.png', 1, 4097),
        'not a file' => 'data:image/png;base64,dW50cnVzdGVk',
    };
    $payload = [...maintenancePayload('Student'), 'profile_image' => $photo];
    $count = User::count();

    $this->postJson(route('maintenance.users.store'), $payload)->assertUnprocessable()->assertJsonValidationErrors('profile_image');
    $this->postJson(route('maintenance.users.update', $user), ['_method' => 'put', ...$payload])
        ->assertUnprocessable()->assertJsonValidationErrors('profile_image');
    expect(User::count())->toBe($count)->and($user->fresh()->profile_image)->toBe('data:image/png;base64,b2xk');
})->with(['text disguised as image', 'svg', 'gif', 'wrong extension', 'too large', 'too wide', 'too tall', 'not a file']);

test('removing and uploading a profile photo together is rejected', function () {
    $this->postJson(route('maintenance.users.store'), [
        ...maintenancePayload('Student'), 'profile_image' => UploadedFile::fake()->image('photo.png'), 'remove_profile_image' => true,
    ])->assertUnprocessable()->assertJsonValidationErrors('profile_image');
});

test('user maintenance routes use the maintenance prefix', function () {
    expect(route('maintenance.users', absolute: false))->toBe('/admin/maintenance/users')
        ->and(route('maintenance.users.create', absolute: false))->toBe('/admin/maintenance/users/create')
        ->and(route('maintenance.users.show', ['user' => 42], absolute: false))->toBe('/admin/maintenance/users/42')
        ->and(route('maintenance.users.edit', ['user' => 42], absolute: false))->toBe('/admin/maintenance/users/42/edit');
});

test('administrators cannot delete their own signed in account', function () {
    $this->deleteJson(route('maintenance.users.destroy', $this->admin))->assertUnprocessable()->assertJsonValidationErrors('user');
    $this->assertNotSoftDeleted($this->admin);
});
