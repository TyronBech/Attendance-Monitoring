<?php

namespace App\Http\Middleware;

use App\Enum\RolesEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AttendanceDisplayAuthentication
{
    /**
     * Handle an incoming request.
     * Ensures user is authenticated and has permission/role to view attendance display.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('login')->with('error', 'Please log in to access the Attendance Display.');
        }

        $user = Auth::user();

        // Check if user has attendance display, admin, or super admin role
        $userRoles = $user->getRoleNames()->map(fn ($role) => strtolower($role))->toArray();
        $allowedRoles = [
            strtolower(RolesEnum::SUPER_ADMIN->value),
            strtolower(RolesEnum::ADMIN->value),
            strtolower(RolesEnum::ATTENDANCE_DISPLAY->value),
        ];

        $hasAccess = ! empty(array_intersect($userRoles, $allowedRoles));

        if (! $hasAccess) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized access.'], 403);
            }

            return redirect()->route('login')->with('error', 'You do not have permission to access the Attendance Display.');
        }

        return $next($request);
    }
}
