<?php

namespace App\Http\Middleware;

use App\Models\UISetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'avatar' => $request->user()->avatar,
                    'profile_image' => $request->user()->avatar,
                    'roles' => $request->user()->getRoleNames()->map(fn ($role) => strtolower($role))->toArray(),
                ] : null,
            ],
            'ui' => function () {
                $ui = UISetting::latest()->first();
                if (! $ui) {
                    return null;
                }

                $logo = $ui->org_logo_base64;
                $logoFull = $ui->org_logo_full_base64;

                return [
                    'id' => $ui->id,
                    'org_name' => $ui->org_name,
                    'org_initial' => $ui->org_initial,
                    'org_address' => $ui->org_address,
                    'org_logo' => $logo,
                    'org_logo_full' => $logoFull,
                    'org_logo_base64' => $logo,
                    'org_logo_full_base64' => $logoFull,
                    'email' => $ui->email,
                    'contact_number' => $ui->contact_number,
                    'social_links' => $ui->social_links,
                    'theme_colors' => $ui->theme_colors,
                ];
            },
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
