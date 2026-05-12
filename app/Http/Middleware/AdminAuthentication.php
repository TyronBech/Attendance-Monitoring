<?php

namespace App\Http\Middleware;

use App\Enum\RolesEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthentication
{
    /**
     * Handle an incoming request.
     * Ensures user is authenticated and has admin role.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'You must be logged in.');
        }

        $user = Auth::user();

        // Check if user has admin or super_admin role
        // Use case-insensitive check for flexibility with existing data
        $userRoles = $user->getRoleNames()->map(fn($role) => strtolower($role))->toArray();
        $adminRoles = [strtolower(RolesEnum::SUPER_ADMIN->value), strtolower(RolesEnum::ADMIN->value)];

        $isAdmin = !empty(array_intersect($userRoles, $adminRoles));

        if (!$isAdmin) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('error', 'You do not have admin access.');
        }

        return $next($request);
    }
}
