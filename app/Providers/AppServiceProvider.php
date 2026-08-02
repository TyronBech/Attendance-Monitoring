<?php

namespace App\Providers;

use App\Models\UISetting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        // Share UI settings with all Inertia responses so layouts/pages can access branding
        Inertia::share('ui', function () {
            try {
                $ui = UISetting::latest()->first();
            } catch (\Throwable $e) {
                return null;
            }

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
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }
}
