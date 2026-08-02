<?php

namespace App\Http\Middleware;

use App\Enum\RolesEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     * Redirects authenticated users to their respective home dashboard or attendance page.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $userRoles = $user->getRoleNames()->map(fn ($role) => strtolower($role))->toArray();
            $adminRoles = [strtolower(RolesEnum::SUPER_ADMIN->value), strtolower(RolesEnum::ADMIN->value)];

            if (empty(array_intersect($userRoles, $adminRoles)) && in_array(strtolower(RolesEnum::ATTENDANCE_DISPLAY->value), $userRoles)) {
                return redirect()->route('attendance.index');
            }

            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
