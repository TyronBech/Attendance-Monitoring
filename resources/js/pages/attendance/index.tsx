import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, ChevronDown, LayoutGrid, LogIn, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ClockDisplay from './components/clock-display';
import PCInputForm from './components/pc-input-form';
import RFIDForm from './components/rfid-form';
import VisitorForm from './components/visitor-form';

const AVATAR_RETRY_LIMIT = 2;
const RECENT_SCANS_KEEP_ALIVE_INTERVAL_MS = 1000;

type RecentScan = {
    id: string | number;
    name: string;
    groupName: string;
    timeLabel: string;
    type: string;
    image?: string | null;
};

function getRecentScanGroupLabel(scan: RecentScan) {
    const normalizedGroup = String(scan?.groupName || '').trim().toLowerCase();

    if (normalizedGroup === 'visitor') {
        return 'Visitor';
    }

    if (normalizedGroup === 'student') {
        return 'Student';
    }

    return 'Employee';
}

function getAvatarInitials(name = '') {
    return String(name || 'L')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'LU';
}

function hasAvatarImage(imageSource = '') {
    if (typeof imageSource !== 'string') {
        return false;
    }

    const normalized = imageSource.trim().toLowerCase();

    return normalized !== '' && !normalized.includes('id_default.png') && !normalized.includes('sncs-logo');
}

function buildRetryableAvatarSource(imageSource: string | null | undefined, attempt: number) {
    if (typeof imageSource !== 'string' || imageSource.trim() === '') {
        return '';
    }

    if (imageSource.startsWith('data:image/')) {
        return imageSource;
    }

    if (attempt <= 0) {
        return imageSource;
    }

    const separator = imageSource.includes('?') ? '&' : '?';

    return `${imageSource}${separator}retry=${attempt}`;
}

function RecentScanAvatar({ scan }: { scan: RecentScan }) {
    const imageSource = typeof scan?.image === 'string' ? scan.image.trim() : '';
    const [prevImageSource, setPrevImageSource] = useState(imageSource);
    const [retryCount, setRetryCount] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);

    if (prevImageSource !== imageSource) {
        setPrevImageSource(imageSource);
        setRetryCount(0);
        setImageFailed(false);
    }

    const resolvedImageSource = buildRetryableAvatarSource(imageSource, retryCount);
    const canShowImage = hasAvatarImage(imageSource) && !imageFailed;

    function handleImageError() {
        if (retryCount < AVATAR_RETRY_LIMIT) {
            setRetryCount((currentCount) => currentCount + 1);

            return;
        }

        setImageFailed(true);
    }

    if (!canShowImage) {
        return <>{getAvatarInitials(scan?.name)}</>;
    }

    return (
        <img
            src={resolvedImageSource}
            alt=""
            className="w-full h-full object-cover"
            onError={handleImageError}
        />
    );
}

export default function AttendanceIndex() {
    const {
        auth = {},
        ui = {},
        recentScans = [],
    } = usePage().props as any;

    const userRoles = Array.isArray(auth?.user?.roles) ? auth.user.roles : [];
    const isAdmin = userRoles.includes('admin') || userRoles.includes('super admin');

    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [showPcForm, setShowPcForm] = useState(false);
    const [, setIsGlobalLoading] = useState(false);
    const [prevRecentScans, setPrevRecentScans] = useState(recentScans);
    const [recentActivity, setRecentActivity] = useState<RecentScan[]>(Array.isArray(recentScans) ? recentScans : []);

    if (prevRecentScans !== recentScans) {
        setPrevRecentScans(recentScans);
        setRecentActivity(Array.isArray(recentScans) ? recentScans : []);
    }

    const isRecentScansRequestInFlightRef = useRef(false);

    const handleScanSuccess = (scanEntry: RecentScan) => {
        if (!scanEntry) {
            return;
        }

        setRecentActivity((currentEntries) => [
            scanEntry,
            ...currentEntries.filter((entry) => entry.id !== scanEntry.id),
        ].slice(0, 5));
    };

    const syncRecentScans = () => {
        if (isRecentScansRequestInFlightRef.current) {
            return;
        }

        isRecentScansRequestInFlightRef.current = true;

        fetch('/attendance/recent-scans', {
            method: 'GET',
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json().catch(() => ({})))
            .then((data) => {
                if (data.status === 'success' && Array.isArray(data.recentScans)) {
                    setRecentActivity(data.recentScans);
                }
            })
            .catch(() => {})
            .finally(() => {
                isRecentScansRequestInFlightRef.current = false;
            });
    };

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return undefined;
        }

        const pollIntervalId = window.setInterval(() => {
            syncRecentScans();
        }, RECENT_SCANS_KEEP_ALIVE_INTERVAL_MS);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                syncRecentScans();
            }
        };

        const handleWindowFocus = () => {
            syncRecentScans();
        };

        syncRecentScans();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.clearInterval(pollIntervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, []);

    const getBadgeVariant = (type: string) => {
        if (type === 'Time Out') {
            return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80';
        }

        if (type === 'Online Research Use') {
            return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80';
        }

        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80';
    };

    return (
        <div className="w-full min-h-screen bg-neutral-50/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col justify-between transition-colors duration-200">
            <Head title="Attendance Monitoring | Time In & Time Out" />

            {/* Header Navbar */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors shadow-2xs">
                <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto px-4 py-3 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        {ui?.org_logo ? (
                            <img
                                className="rounded-full w-11 h-11 md:w-12 md:h-12 object-cover border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                                src={ui.org_logo}
                                alt="School Logo"
                            />
                        ) : (
                            <div className="rounded-full w-11 h-11 md:w-12 md:h-12 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                                Logo
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xs md:text-sm lg:text-base text-neutral-900 dark:text-neutral-100 font-bold tracking-tight text-start">
                                {ui?.org_name || 'School Name'}
                            </h1>
                            <hr className="h-px my-0.5 bg-neutral-200 dark:bg-neutral-800 border-0" />
                            <h2 className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400 font-medium text-start">
                                Attendance Monitoring System
                            </h2>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="inline-flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-neutral-100/80 hover:bg-neutral-200/80 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer outline-none shadow-2xs">
                                        <Avatar className="h-7 w-7 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0">
                                            <AvatarImage src={auth.user.avatar || auth.user.profile_image} alt={auth.user.name} />
                                            <AvatarFallback className="bg-primary-600 text-white text-xs font-bold">
                                                {getAvatarInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs sm:text-sm font-semibold truncate max-w-[140px]">{auth.user.name}</span>
                                        <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-xl">
                                    <DropdownMenuLabel className="p-2 font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-none">{auth.user.name}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-none truncate mt-0.5">{auth.user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="my-1 bg-neutral-100 dark:bg-neutral-800" />
                                    <DropdownMenuGroup>
                                        {isAdmin && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/dashboard" className="flex items-center gap-2 p-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer">
                                                    <LayoutGrid className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild>
                                            <Link href="/logout" method="post" as="button" className="w-full flex items-center gap-2 p-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer">
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer shadow-2xs"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <PCInputForm
                showForm={showPcForm}
                onClose={() => setShowPcForm(false)}
                onLoadingChange={setIsGlobalLoading}
                onScanSuccess={handleScanSuccess}
                onRecentScansSync={syncRecentScans}
            />

            <VisitorForm
                active={showVisitorForm}
                onClose={() => setShowVisitorForm(false)}
                onLoadingChange={setIsGlobalLoading}
                onSuccess={(scanEntry) => {
                    handleScanSuccess(scanEntry);
                    setShowVisitorForm(false);
                }}
                onRecentScansSync={syncRecentScans}
            />

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
                    <div className="xl:col-span-7 w-full flex justify-center">
                        <div className="w-full max-w-2xl">
                            <RFIDForm
                                onVisitorClick={() => setShowVisitorForm(true)}
                                onOpenPcForm={() => setShowPcForm(true)}
                                onLoadingChange={setIsGlobalLoading}
                                onScanSuccess={handleScanSuccess}
                                onRecentScansSync={syncRecentScans}
                                scannerCaptureEnabled={!showVisitorForm && !showPcForm}
                            />
                        </div>
                    </div>

                    <div className="xl:col-span-5 w-full space-y-6">
                        <ClockDisplay />

                        <section className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xs border border-neutral-200/80 dark:border-neutral-800 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Recent Scans</h2>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                                    Last {recentActivity.length || 0} entries
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {recentActivity.length ? (
                                    recentActivity.map((scan) => (
                                        <article key={`${scan.id ?? scan.timeLabel}-${scan.type}`} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/80 hover:bg-neutral-100/80 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 transition-all duration-150">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                                    <RecentScanAvatar scan={scan} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">{scan.name}</h3>
                                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{getRecentScanGroupLabel(scan)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{scan.timeLabel}</span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeVariant(scan.type)}`}>
                                                    {scan.type}
                                                </span>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 space-y-1">
                                        <p className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">No recent scans yet.</p>
                                        <p className="text-xs text-neutral-400 dark:text-neutral-500">The latest attendance activity will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-neutral-900 py-4 border-t border-neutral-200/80 dark:border-neutral-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    &copy; {new Date().getFullYear()} {ui?.org_name || 'OwlQuery Group'}. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
