<?php

namespace App\Http\Controllers\Auth;

use App\Enum\RolesEnum;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AdminLoginController
{
    /**
     * Handle an incoming admin login request.
     */
    public function store(Request $request)
    {
        $email = trim($request->input('email'));
        $password = trim($request->input('password'));

        $request->merge(['email' => $email]);

        Log::info('Admin Login: Authentication attempt initiated', [
            'email' => $email,
            'ip_address' => $request->ip(),
            'timestamp' => now(),
        ]);

        // Rate limiting
        $throttleKey = Str::transliterate(Str::lower($email).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            Log::warning('Admin Login: Rate limited', [
                'email' => $email,
                'ip_address' => $request->ip(),
                'lockout_seconds' => $seconds,
                'timestamp' => now(),
            ]);

            return back()
                ->with('error', trans('auth.throttle', ['seconds' => $seconds, 'minutes' => ceil($seconds / 60)]))
                ->withInput();
        }

        // Find user by email
        $user = User::where('email', $email)->first();

        if (! $user) {
            Log::error('Admin Login: Failed - User not found', [
                'email' => $email,
                'ip_address' => $request->ip(),
                'timestamp' => now(),
            ]);

            $this->handleFailedAttempt($throttleKey);

            return back()->with('error', 'Invalid email or password.')->withInput();
        }

        // Verify password
        if (! Hash::check($password, $user->password)) {
            Log::error('Admin Login: Failed - Invalid password', [
                'email' => $email,
                'ip_address' => $request->ip(),
                'timestamp' => now(),
            ]);

            $this->handleFailedAttempt($throttleKey);

            return back()->with('error', 'Invalid email or password.')->withInput();
        }

        // Check if user has admin role
        $userRoles = $user->getRoleNames()->map(fn ($role) => strtolower($role))->toArray();
        $adminRoles = [strtolower(RolesEnum::SUPER_ADMIN->value), strtolower(RolesEnum::ADMIN->value)];
        $isAdmin = ! empty(array_intersect($userRoles, $adminRoles));

        if (! $isAdmin) {
            Log::error('Admin Login: Failed - User has no admin role', [
                'user_id' => $user->id,
                'email' => $email,
                'roles' => $user->getRoleNames()->toArray(),
                'ip_address' => $request->ip(),
                'timestamp' => now(),
            ]);

            return back()->with('error', 'You do not have admin access to this application.')->withInput();
        }

        // Authenticate the user
        Auth::login($user, $request->filled('remember'));

        // Clear rate limiter on successful login
        RateLimiter::clear($throttleKey);

        Log::info('Admin Login: Authentication successful', [
            'user_id' => $user->id,
            'email' => $email,
            'ip_address' => $request->ip(),
            'timestamp' => now(),
        ]);

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Handle failed login attempt.
     */
    private function handleFailedAttempt(string $throttleKey): void
    {
        RateLimiter::hit($throttleKey, 60);
    }

    /**
     * Log out the user.
     */
    public function destroy(Request $request)
    {
        $user = Auth::user();

        Log::info('Admin Logout: Logout initiated', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => $request->ip(),
            'timestamp' => now(),
        ]);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Log::info('Admin Logout: Logout completed', [
            'user_id' => $user->id,
            'email' => $user->email,
            'timestamp' => now(),
        ]);

        return redirect()->route('home');
    }
}
