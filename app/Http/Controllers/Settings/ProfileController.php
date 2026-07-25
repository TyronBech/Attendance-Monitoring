<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        Log::info('Profile: Page accessed', [
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'timestamp' => now(),
        ]);

        $user = User::with(['privileges', 'students', 'employees'])->findOrFail(Auth::id());

        $profileImage = null;
        if ($user->profile_image) {
            $profileImage = 'data:image/jpeg;base64,'.$user->profile_image;
        }

        return Inertia::render('settings/profile', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'middle_name' => $user->middle_name,
                'last_name' => $user->last_name,
                'suffix' => $user->suffix,
                'email' => $user->email,
                'profile_image' => $profileImage,
                'user_type' => $user->privileges?->user_type ?? 'visitor',
                'user_id_number' => $user->privileges?->user_type === 'student'
                    ? $user->students?->id_number
                    : ($user->privileges?->user_type === 'employee'
                        ? $user->employees?->employee_id
                        : null),
                'employee_role' => $user->employees?->employee_role,
                'two_factor_enabled' => (bool) ($user->two_factor_enabled ?? false),
                'updated_at' => $user->updated_at?->format('M d, Y'),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        Log::info('Profile: Update attempt', [
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'timestamp' => now(),
        ]);

        $rules = [
            'first_name' => ['required_without:name', 'nullable', 'string', 'max:50'],
            'middle_name' => ['nullable', 'string', 'max:50'],
            'last_name' => ['required_without:name', 'nullable', 'string', 'max:50'],
            'suffix' => ['nullable', 'string', 'max:10'],
            'email' => ['required', 'string', 'max:50', 'email'],
            'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'],
        ];

        if ($request->filled('current_password')) {
            if ($request->filled('new_password') && $request->filled('new_password_confirmation')) {
                $rules['current_password'] = ['required', 'current_password'];
                $rules['new_password'] = ['required', 'string', Password::min(8)->mixedCase()->letters()->numbers()->symbols()->uncompromised(), 'confirmed'];
                $rules['new_password_confirmation'] = 'required';
            } else {
                Inertia::flash('toast', ['type' => 'warning', 'message' => 'Please fill in the new password and confirmation fields.']);

                return redirect()->back()->withInput();
            }
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            Log::warning('Profile: Validation failed', [
                'user_id' => Auth::id(),
                'errors' => $validator->errors(),
                'timestamp' => now(),
            ]);

            Inertia::flash('toast', ['type' => 'warning', 'message' => $validator->errors()->first()]);

            return redirect()->back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();

        try {
            $user = User::findOrFail(Auth::id());

            if ($request->has('name') && ! $request->has('first_name')) {
                $user->name = $request->input('name');
            }

            if ($request->has('first_name')) {
                $user->first_name = $request->input('first_name');
            }

            if ($request->has('middle_name')) {
                $user->middle_name = $request->input('middle_name');
            }

            if ($request->has('last_name')) {
                $user->last_name = $request->input('last_name');
            }

            if ($request->has('suffix')) {
                $user->suffix = $request->input('suffix');
            }

            if ($request->has('email')) {
                if ($user->email !== $request->input('email')) {
                    $user->email_verified_at = null;
                }
                $user->email = $request->input('email');
            }

            if ($request->hasFile('profile_image')) {
                $base64Image = base64_encode(file_get_contents($request->file('profile_image')->getRealPath()));
                $user->profile_image = $base64Image;
            }

            if ($request->filled('new_password')) {
                $user->password = Hash::make($request->input('new_password'));
            }

            $user->save();
        } catch (QueryException $e) {
            DB::rollBack();

            Log::error('Profile: Update failed - Database error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);

            Inertia::flash('toast', ['type' => 'error', 'message' => 'Failed to update information. Please try again.']);

            return redirect()->back()->withInput();
        }

        DB::commit();

        Log::info('Profile: Information updated successfully', [
            'user_id' => Auth::id(),
            'timestamp' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Information updated successfully!']);

        return to_route('profile.edit');
    }

    /**
     * Enable two-factor authentication for the user.
     */
    public function enableTwoFactor(Request $request): RedirectResponse
    {
        Log::info('Profile: 2FA Enable attempt', [
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'timestamp' => now(),
        ]);

        $request->validate([
            'password' => 'required|string',
        ]);

        if (! Hash::check($request->password, Auth::user()->password)) {
            Log::warning('Profile: 2FA Enable failed - Incorrect password', [
                'user_id' => Auth::id(),
                'timestamp' => now(),
            ]);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Incorrect password.']);

            return back();
        }

        DB::beginTransaction();
        try {
            $user = User::findOrFail(Auth::id());
            $user->two_factor_enabled = 1;

            // Generate backup codes (10 codes)
            $backupCodes = [];
            for ($i = 0; $i < 10; $i++) {
                $backupCodes[] = strtoupper(Str::random(8));
            }
            $user->two_factor_backup_codes = json_encode($backupCodes);
            $user->two_factor_secret = encrypt('secret');
            $user->two_factor_recovery_codes = encrypt(json_encode($backupCodes));
            $user->two_factor_confirmed_at = now();

            $user->save();

            DB::commit();

            Log::info('Profile: 2FA enabled successfully', [
                'user_id' => $user->id,
                'timestamp' => now(),
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Two-factor authentication has been enabled successfully.']);

            return back()->with('backup_codes', $backupCodes);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Profile: 2FA Enable failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Failed to enable two-factor authentication. Please try again.']);

            return back();
        }
    }

    /**
     * Disable two-factor authentication for the user.
     */
    public function disableTwoFactor(Request $request): RedirectResponse
    {
        Log::info('Profile: 2FA Disable attempt', [
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'timestamp' => now(),
        ]);

        $request->validate([
            'password' => 'required|string',
        ]);

        if (! Hash::check($request->password, Auth::user()->password)) {
            Log::warning('Profile: 2FA Disable failed - Incorrect password', [
                'user_id' => Auth::id(),
                'timestamp' => now(),
            ]);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Incorrect password.']);

            return back();
        }

        DB::beginTransaction();
        try {
            $user = User::findOrFail(Auth::id());
            $user->two_factor_enabled = 0;
            $user->two_factor_secret = null;
            $user->two_factor_recovery_codes = null;
            $user->two_factor_confirmed_at = null;
            $user->two_factor_backup_codes = null;
            $user->save();

            DB::commit();

            Log::info('Profile: 2FA disabled successfully', [
                'user_id' => $user->id,
                'timestamp' => now(),
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Two-factor authentication has been disabled.']);

            return back();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Profile: 2FA Disable failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Failed to disable two-factor authentication. Please try again.']);

            return back();
        }
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
