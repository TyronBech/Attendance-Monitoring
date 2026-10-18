<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserMaintenanceIndexRequest;
use App\Http\Requests\UserMaintenanceRequest;
use App\Models\EmployeeDetail;
use App\Models\StudentDetail;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserMaintenanceController extends Controller
{
    public function index(UserMaintenanceIndexRequest $request): Response
    {
        $filters = [
            'user_type' => $request->validated('user_type', 'Student'),
            'search' => trim($request->validated('search') ?? ''),
            'sort' => $request->validated('sort', 'newest'),
        ];
        $query = User::query()->select([
            'id', 'privilege_id', 'first_name', 'middle_name', 'last_name', 'suffix',
            'gender', 'email', 'rfid', 'created_at',
        ])->with(['privileges', 'students', 'employees', 'visitors'])
            ->whereHas('privileges', fn (Builder $groups) => $groups->where('user_type', $filters['user_type']));

        foreach (preg_split('/[\s,]+/u', $filters['search'], -1, PREG_SPLIT_NO_EMPTY) as $term) {
            $query->where(function (Builder $match) use ($term, $filters): void {
                $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term).'%';
                foreach (['first_name', 'middle_name', 'last_name', 'suffix', 'email', 'rfid'] as $column) {
                    $match->orWhereRaw("LOWER({$column}) LIKE LOWER(?) ESCAPE '!'", [$pattern]);
                }
                $match->orWhereHas('privileges', fn (Builder $groups) => $groups->whereRaw("LOWER(category) LIKE LOWER(?) ESCAPE '!'", [$pattern]));

                [$relation, $columns] = match ($filters['user_type']) {
                    'Student' => ['students', ['id_number', 'level', 'section']],
                    'Employee' => ['employees', ['employee_id', 'employee_role']],
                    'Visitor' => ['visitors', ['school_org', 'purpose']],
                };
                $match->orWhereHas($relation, function (Builder $details) use ($columns, $pattern): void {
                    $details->where(function (Builder $fields) use ($columns, $pattern): void {
                        foreach ($columns as $column) {
                            $fields->orWhereRaw("LOWER({$column}) LIKE LOWER(?) ESCAPE '!'", [$pattern]);
                        }
                    });
                });
            });
        }

        $this->applySort($query, $filters['sort']);

        return Inertia::render('users/index', [
            'users' => $query->paginate(15)->withQueryString()->through(fn (User $user): array => $this->userData($user)),
            'filters' => $filters,
        ]);
    }

    public function create(UserMaintenanceIndexRequest $request): Response
    {
        return Inertia::render('users/create', [
            'groups' => $this->groups(),
            'userType' => $request->validated('user_type', 'Student'),
        ]);
    }

    public function store(UserMaintenanceRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = new User(['password' => Str::random(64)]);
            $this->saveUser($user, $request->validated());

            return $user;
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'User created successfully.']);

        return to_route('maintenance.users.show', $user);
    }

    public function show(User $user): Response
    {
        return Inertia::render('users/show', [
            'managedUser' => [...$this->userData($user), 'profile_image' => $user->avatar],
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'managedUser' => [...$this->userData($user), 'profile_image' => $user->avatar],
            'groups' => $this->groups(),
        ]);
    }

    public function update(UserMaintenanceRequest $request, User $user): RedirectResponse
    {
        DB::transaction(fn () => $this->saveUser($user, $request->validated()));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'User updated successfully.']);

        return to_route('maintenance.users.show', $user);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            throw ValidationException::withMessages(['user' => 'You cannot delete your signed-in account.']);
        }

        $type = $user->privileges?->user_type ?? 'Student';
        DB::transaction(function () use ($user): void {
            $user->students()->delete();
            $user->employees()->delete();
            $user->visitors()->delete();
            $user->delete();
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'User deleted successfully.']);

        return to_route('maintenance.users', ['user_type' => $type]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function saveUser(User $user, array $data): void
    {
        $user->fill(Arr::only($data, ['privilege_id', 'first_name', 'middle_name', 'last_name', 'suffix', 'gender', 'email', 'rfid']));
        $photo = $data['profile_image'] ?? null;
        if ($photo instanceof UploadedFile) {
            $user->profile_image = 'data:'.$photo->getMimeType().';base64,'.base64_encode($photo->getContent());
        } elseif ($data['remove_profile_image'] ?? false) {
            $user->profile_image = null;
        }
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        [$relation, $details] = match ($data['user_type']) {
            'Student' => ['students', ['id_number' => $data['student_id'], 'level' => $data['grade_level'] ?? null, 'section' => $data['section'] ?? null]],
            'Employee' => ['employees', ['employee_id' => $data['employee_id'], 'employee_role' => $data['employee_role'] ?? null]],
            'Visitor' => ['visitors', ['school_org' => $data['school_org'], 'purpose' => $data['purpose']]],
        };
        $user->{$relation}()->updateOrCreate(['user_id' => $user->id], $details);
    }

    /**
     * @return Collection<int, UserGroup>
     */
    private function groups(): Collection
    {
        return UserGroup::query()->whereIn('user_type', ['Student', 'Employee', 'Visitor'])
            ->orderBy('category')->get(['id', 'user_type', 'category']);
    }

    /**
     * @return array<string, mixed>
     */
    private function userData(User $user): array
    {
        $user->loadMissing(['privileges', 'students', 'employees', 'visitors']);

        return [
            'id' => $user->id, 'name' => $user->name, 'first_name' => $user->first_name,
            'middle_name' => $user->middle_name, 'last_name' => $user->last_name, 'suffix' => $user->suffix,
            'gender' => $user->gender, 'email' => $user->email, 'rfid' => $user->rfid,
            'privilege_id' => $user->privilege_id, 'user_type' => $user->privileges?->user_type,
            'category' => $user->privileges?->category, 'created_at' => $user->created_at?->toIso8601String(),
            'student_id' => $user->students?->id_number, 'grade_level' => $user->students?->level,
            'section' => $user->students?->section, 'employee_id' => $user->employees?->employee_id,
            'employee_role' => $user->employees?->employee_role, 'school_org' => $user->visitors?->school_org,
            'purpose' => $user->visitors?->purpose,
        ];
    }

    /**
     * @param  Builder<User>  $query
     */
    private function applySort(Builder $query, string $sort): void
    {
        if ($sort === 'grade_level') {
            $levels = ['nursery', 'kindergarten', 'kinder', 'prep', ...array_map(fn (int $grade): string => 'grade '.$grade, range(1, 12)), '1st year', '2nd year', '3rd year', '4th year', '5th year', '6th year'];
            $cases = implode(' ', array_map(fn (int $rank): string => 'WHEN LOWER(TRIM(level)) = ? THEN '.$rank, array_keys($levels)));
            $userId = (new User)->qualifyColumn('id');
            $query->orderBy(StudentDetail::query()->selectRaw('CASE '.$cases.' ELSE 100 END', $levels)
                ->whereColumn('user_id', $userId)->limit(1));
            $query->orderBy(StudentDetail::query()->selectRaw("COALESCE(NULLIF(TRIM(level), ''), 'zzzz')")
                ->whereColumn('user_id', $userId)->limit(1));
        } elseif ($sort === 'role') {
            $query->orderBy(EmployeeDetail::query()->selectRaw("COALESCE(NULLIF(TRIM(employee_role), ''), 'zzzz')")
                ->whereColumn('user_id', (new User)->qualifyColumn('id'))->limit(1));
        }

        $direction = $sort === 'oldest' ? 'asc' : 'desc';
        $query->orderBy('created_at', $direction)->orderBy('id', $direction);
    }
}
