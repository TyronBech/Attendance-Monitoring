import { Link } from '@inertiajs/react';
import { User, Palette, Settings as SettingsIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import settings from '@/routes/settings';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
    {
        title: 'System Settings',
        href: settings.uiSettings.url(),
        icon: SettingsIcon,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Heading
                title="Settings"
                description="Manage your profile, appearance, and system settings"
            />

            <div className="mt-8 flex flex-col lg:flex-row lg:space-x-10">
                <aside className="w-full lg:w-64 shrink-0 mb-6 lg:mb-0">
                    <nav
                        className="flex flex-col space-y-1"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const isActive = isCurrentOrParentUrl(item.href);
                            const Icon = item.icon;
                            
                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'w-full justify-start px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                                        isActive
                                            ? 'bg-primary-50 text-primary-700 font-bold dark:bg-primary-900/40 dark:text-primary-300'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                    )}
                                >
                                    <Link href={item.href}>
                                        {Icon && (
                                            <Icon className={cn('h-4 w-4 mr-2.5 shrink-0', isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400')} />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
