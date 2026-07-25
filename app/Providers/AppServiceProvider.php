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

            return [
                'org_name' => $ui->org_name,
                'org_initial' => $ui->org_initial,
                'org_address' => $ui->org_address,
                'org_logo' => $ui->org_logo ? 'data:image/png;base64,'.$ui->org_logo : null,
                'org_logo_full' => $ui->org_logo_full ? 'data:image/png;base64,'.$ui->org_logo_full : null,
                'email' => $ui->email,
                'contact_number' => $ui->contact_number,
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
