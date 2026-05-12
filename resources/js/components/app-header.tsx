import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ClipboardList,
    Home,
    LogOut,
    Menu,
    Monitor,
    Settings,
    User,
    UserCircle,
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
import profile from '@/routes/profile';
import report from '@/routes/report';
import settings from '@/routes/settings';

export function AppHeader() {
    const { auth, ui, name } = usePage().props as any;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const [isMobileReportOpen, setIsMobileReportOpen] = useState(false);

    const isReportActive =
        isCurrentUrl(report.userLogs.url(), undefined, true) ||
        isCurrentUrl(report.computerUse.url(), undefined, true);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(logout().url);
    };

    const navLinkClasses = (isActive: boolean) => cn(
        "block py-2 px-3 text-white rounded transition-colors lg:p-0",
        isActive ? "bg-primary-600 lg:bg-transparent lg:text-secondary-400" : "hover:bg-primary-600 lg:hover:bg-transparent lg:hover:text-secondary-300"
    );

    const dropdownItemClasses = "flex w-full cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 dark:text-gray-200 dark:hover:bg-primary-900";

    return (
        <header className="sticky top-0 z-50 shadow-md">
            <nav className="bg-primary-700 border-gray-200 dark:bg-primary-800">
                <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link href={dashboard().url} className="flex items-center space-x-3 rtl:space-x-reverse">
                        {ui?.org_logo_base64 && (
                            <img 
                                className="rounded-full w-12 h-12 md:w-16 md:h-16 shadow-lg border-2 border-white/20" 
                                src={ui.org_logo_base64} 
                                alt="School Logo" 
                            />
                        )}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xs md:text-sm lg:text-base text-white font-bold leading-tight uppercase tracking-wider">
                                {ui?.org_name || 'School Name'}
                            </h1>
                            <hr className="h-px my-1 bg-white/30 border-0" />
                            <h2 className="text-[10px] md:text-xs lg:text-sm text-white font-medium leading-tight opacity-90">
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
                                    className="lg:hidden text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open main menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
                                <SheetHeader className="border-b pb-4 mb-4">
                                    <SheetTitle className="text-primary-700 dark:text-primary-400">Navigation</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col space-y-4">
                                    <Link 
                                        href={dashboard()}
                                        className={cn(
                                            "flex items-center space-x-2 p-2 rounded-lg transition-colors",
                                            isCurrentUrl(dashboard().url) ? "bg-primary-50 text-primary-700 font-bold" : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <Home className="h-5 w-5" />
                                        <span>Home</span>
                                    </Link>
                                    
                                    <div>
                                        <button 
                                            onClick={() => setIsMobileReportOpen(!isMobileReportOpen)}
                                            className={cn(
                                                "flex w-full items-center justify-between p-2 rounded-lg transition-colors",
                                                isReportActive ? "bg-primary-50 text-primary-700 font-bold" : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <ClipboardList className="h-5 w-5" />
                                                <span>Reports</span>
                                            </div>
                                            <ChevronDown className={cn("h-4 w-4 transition-transform", isMobileReportOpen && "rotate-180")} />
                                        </button>
                                        {isMobileReportOpen && (
                                            <div className="ml-6 mt-2 flex flex-col space-y-2 border-l-2 border-primary-100 pl-4">
                                                <Link href={report.userLogs.url()} className="text-sm py-1 hover:text-primary-600">Attendance Monitoring</Link>
                                                <Link href={report.computerUse.url()} className="text-sm py-1 hover:text-primary-600">Online Research</Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <Link href={profile.edit.url()} className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50">
                                            <User className="h-5 w-5" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link href={settings.uiSettings.url()} className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-50">
                                            <Settings className="h-5 w-5" />
                                            <span>System Settings</span>
                                        </Link>
                                        <button onClick={handleLogout} className="flex w-full items-center space-x-2 p-2 rounded-lg text-red-600 hover:bg-red-50">
                                            <LogOut className="h-5 w-5" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Desktop User Dropdown */}
                        <div className="hidden lg:flex items-center ml-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center text-sm font-medium text-white hover:text-secondary-300 transition-colors focus:outline-none">
                                        <Avatar className="h-8 w-8 mr-2 border border-white/20">
                                            <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                            <AvatarFallback className="bg-primary-600 text-white text-xs">
                                                {getInitials(auth.user?.name || '')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="max-w-[100px] truncate">{auth.user?.name}</span>
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2 shadow-xl border-gray-100">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{auth.user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">{auth.user?.email}</p>
                                    </div>
                                    <DropdownMenuItem asChild>
                                        <Link href={profile.edit.url()} className={dropdownItemClasses}>
                                            <User className="mr-2 h-4 w-4" /> Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={settings.uiSettings.url()} className={dropdownItemClasses}>
                                            <Settings className="mr-2 h-4 w-4" /> System Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className={cn(dropdownItemClasses, "text-red-600 hover:bg-red-50")}>
                                        <LogOut className="mr-2 h-4 w-4" /> Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden w-full lg:flex lg:items-center lg:w-auto lg:order-1" id="mobile-menu-2">
                        <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                            <li>
                                <Link 
                                    href={dashboard().url} 
                                    className={navLinkClasses(isCurrentUrl(dashboard().url))}
                                    aria-current={isCurrentUrl(dashboard().url) ? "page" : undefined}
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="relative group">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className={navLinkClasses(isReportActive)}>
                                            <span className="flex items-center">
                                                Reports
                                                <ChevronDown className="ml-1 h-4 w-4" />
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 mt-2 shadow-xl border-gray-100">
                                        <DropdownMenuItem asChild>
                                            <Link href={report.userLogs.url()} className={dropdownItemClasses}>
                                                <UserCircle className="mr-2 h-4 w-4" /> Attendance Monitoring
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={report.computerUse.url()} className={dropdownItemClasses}>
                                                <Monitor className="mr-2 h-4 w-4" /> Online Research
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
