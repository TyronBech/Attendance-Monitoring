import { Link, router, usePage } from '@inertiajs/react';
import {
    Briefcase,
    ChevronDown,
    ClipboardList,
    Home,
    LogOut,
    Menu,
    Monitor,
    Settings,
    Upload,
    UserCircle,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import report from '@/routes/report';
import settings from '@/routes/settings';

export function AppHeader() {
    const { auth, ui, name } = usePage().props as any;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const [isMobileReportOpen, setIsMobileReportOpen] = useState(false);
    const [isMobileImportOpen, setIsMobileImportOpen] = useState(false);

    const logoRaw = ui?.org_logo_base64 || ui?.org_logo;
    const logoSrc = logoRaw
        ? logoRaw.startsWith('data:') ||
          logoRaw.startsWith('http') ||
          logoRaw.startsWith('/')
            ? logoRaw
            : `data:image/png;base64,${logoRaw}`
        : null;

    const isReportActive =
        isCurrentUrl(report.userLogs.url(), undefined, true) ||
        isCurrentUrl(report.computerUse.url(), undefined, true);

    const isImportActive =
        isCurrentUrl('/import/students', undefined, true) ||
        isCurrentUrl('/import/employees', undefined, true);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(logout().url);
    };

    const navLinkClasses = (isActive: boolean) =>
        cn(
            'block rounded px-3 py-2 text-white transition-colors lg:p-0',
            isActive
                ? 'bg-primary-600 lg:bg-transparent lg:text-secondary-400'
                : 'hover:bg-primary-600 lg:hover:bg-transparent lg:hover:text-secondary-300',
        );

    const dropdownItemClasses =
        'flex w-full cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 dark:text-gray-200 dark:hover:bg-primary-900';

    return (
        <header className="sticky top-0 z-50 shadow-md">
            <nav className="border-gray-200 bg-primary-700 dark:bg-primary-800">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between p-4">
                    <Link
                        href={dashboard().url}
                        className="flex items-center space-x-3 rtl:space-x-reverse"
                    >
                        {logoSrc && (
                            <img
                                className="h-12 w-12 rounded-full object-cover shadow-lg md:h-16 md:w-16"
                                src={logoSrc}
                                alt={
                                    ui?.org_name
                                        ? `${ui.org_name} Logo`
                                        : 'School Logo'
                                }
                            />
                        )}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xs leading-tight font-bold tracking-wider text-white uppercase md:text-sm lg:text-base">
                                {ui?.org_name || 'School Name'}
                            </h1>
                            <hr className="my-1 h-px border-0 bg-white/30" />
                            <h2 className="text-[10px] leading-tight font-medium text-white opacity-90 md:text-xs lg:text-sm">
                                {name} - Library Management System
                            </h2>
                        </div>
                    </Link>

                    <div className="flex items-center lg:order-2">
                        {/* Mobile Menu Toggle */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:outline-none lg:hidden"
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">
                                        Open main menu
                                    </span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                            >
                                <SheetHeader className="mb-4 border-b pb-4">
                                    <SheetTitle className="text-primary-700 dark:text-primary-400">
                                        Navigation
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col space-y-4">
                                    <Link
                                        href={dashboard().url}
                                        className={cn(
                                            'flex items-center space-x-2 rounded-lg p-2 transition-colors',
                                            isCurrentUrl(dashboard().url)
                                                ? 'bg-primary-50 font-bold text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-50',
                                        )}
                                    >
                                        <Home className="h-5 w-5" />
                                        <span>Home</span>
                                    </Link>

                                    <div>
                                        <button
                                            onClick={() =>
                                                setIsMobileReportOpen(
                                                    !isMobileReportOpen,
                                                )
                                            }
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-lg p-2 transition-colors',
                                                isReportActive
                                                    ? 'bg-primary-50 font-bold text-primary-700'
                                                    : 'text-gray-600 hover:bg-gray-50',
                                            )}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <ClipboardList className="h-5 w-5" />
                                                <span>Reports</span>
                                            </div>
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 transition-transform',
                                                    isMobileReportOpen &&
                                                        'rotate-180',
                                                )}
                                            />
                                        </button>
                                        {isMobileReportOpen && (
                                            <div className="mt-2 ml-6 flex flex-col space-y-2 border-l-2 border-primary-100 pl-4">
                                                <Link
                                                    href={report.userLogs.url()}
                                                    className="py-1 text-sm hover:text-primary-600"
                                                >
                                                    Attendance Monitoring
                                                </Link>
                                                <Link
                                                    href={report.computerUse.url()}
                                                    className="py-1 text-sm hover:text-primary-600"
                                                >
                                                    Online Research
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            onClick={() =>
                                                setIsMobileImportOpen(
                                                    !isMobileImportOpen,
                                                )
                                            }
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-lg p-2 transition-colors',
                                                isImportActive
                                                    ? 'bg-primary-50 font-bold text-primary-700'
                                                    : 'text-gray-600 hover:bg-gray-50',
                                            )}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Upload className="h-5 w-5" />
                                                <span>Import</span>
                                            </div>
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 transition-transform',
                                                    isMobileImportOpen &&
                                                        'rotate-180',
                                                )}
                                            />
                                        </button>
                                        {isMobileImportOpen && (
                                            <div className="mt-2 ml-6 flex flex-col space-y-2 border-l-2 border-primary-100 pl-4">
                                                <Link
                                                    href="/import/students"
                                                    className="py-1 text-sm hover:text-primary-600"
                                                >
                                                    Import Students
                                                </Link>
                                                <Link
                                                    href="/import/employees"
                                                    className="py-1 text-sm hover:text-primary-600"
                                                >
                                                    Import Employees
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 border-t pt-4">
                                        <Link
                                            href={settings.uiSettings.url()}
                                            className="flex items-center space-x-2 rounded-lg p-2 text-gray-600 hover:bg-gray-50"
                                        >
                                            <Settings className="h-5 w-5" />
                                            <span>Settings</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center space-x-2 rounded-lg p-2 text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Desktop User Dropdown */}
                        <div className="ml-4 hidden items-center lg:flex">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center text-sm font-medium text-white transition-colors hover:text-secondary-300 focus:outline-none">
                                        <Avatar className="mr-2 h-8 w-8 overflow-hidden border border-white/20">
                                            <AvatarImage
                                                src={
                                                    auth.user?.avatar ||
                                                    auth.user?.profile_image
                                                }
                                                alt={auth.user?.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="bg-primary-600 text-xs text-white">
                                                {getInitials(
                                                    auth.user?.name || '',
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="max-w-25 truncate">
                                            {auth.user?.name}
                                        </span>
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="mt-2 w-56 border-gray-100 shadow-xl"
                                >
                                    <div className="border-b border-gray-50 px-4 py-3">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {auth.user?.name}
                                        </p>
                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                            {auth.user?.email}
                                        </p>
                                    </div>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={settings.uiSettings.url()}
                                            className={dropdownItemClasses}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />{' '}
                                            System Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className={cn(
                                            dropdownItemClasses,
                                            'text-red-600 hover:bg-red-50',
                                        )}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />{' '}
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div
                        className="hidden w-full lg:order-1 lg:flex lg:w-auto lg:items-center"
                        id="mobile-menu-2"
                    >
                        <ul className="mt-4 flex flex-col font-medium lg:mt-0 lg:flex-row lg:space-x-8">
                            <li>
                                <Link
                                    href={dashboard().url}
                                    className={navLinkClasses(
                                        isCurrentUrl(dashboard().url),
                                    )}
                                    aria-current={
                                        isCurrentUrl(dashboard().url)
                                            ? 'page'
                                            : undefined
                                    }
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="group relative">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className={navLinkClasses(
                                                isReportActive,
                                            )}
                                        >
                                            <span className="flex items-center">
                                                Reports
                                                <ChevronDown className="ml-1 h-4 w-4" />
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="mt-2 w-56 border-gray-100 shadow-xl">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={report.userLogs.url()}
                                                className={dropdownItemClasses}
                                            >
                                                <UserCircle className="mr-2 h-4 w-4" />{' '}
                                                Attendance Monitoring
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={report.computerUse.url()}
                                                className={dropdownItemClasses}
                                            >
                                                <Monitor className="mr-2 h-4 w-4" />{' '}
                                                Online Research
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                            <li className="group relative">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className={navLinkClasses(
                                                isImportActive,
                                            )}
                                        >
                                            <span className="flex items-center">
                                                Import
                                                <ChevronDown className="ml-1 h-4 w-4" />
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="mt-2 w-56 border-gray-100 shadow-xl">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/import/students"
                                                className={dropdownItemClasses}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />{' '}
                                                Import Students
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/import/employees"
                                                className={dropdownItemClasses}
                                            >
                                                <Briefcase className="mr-2 h-4 w-4" />{' '}
                                                Import Employees
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}
