import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { ui } = usePage().props as any;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-12 w-12 items-center justify-center overflow-hidden rounded-md">
                                {ui && ui.org_logo ? (
                                    <img
                                        src={ui.org_logo}
                                        alt={ui.org_name || 'Logo'}
                                        className="h-12 w-12 object-contain"
                                    />
                                ) : (
                                    <AppLogoIcon className="size-9 fill-current text-(--foreground) dark:text-white" />
                                )}
                            </div>
                        </Link>

                        <div className="space-y-2 text-center">
                            {ui && ui.org_name ? (
                                <h2 className="text-lg font-semibold">
                                    {ui.org_name}
                                </h2>
                            ) : (
                                <h1 className="text-xl font-medium">{title}</h1>
                            )}
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
