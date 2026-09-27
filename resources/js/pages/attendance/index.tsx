import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronDown, LayoutGrid, LogOut } from 'lucide-react';
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
    const normalizedGroup = String(scan?.groupName || '')
        .trim()
        .toLowerCase();

    if (normalizedGroup === 'visitor') {
        return 'Visitor';
    }

    if (normalizedGroup === 'student') {
        return 'Student';
    }

    return 'Employee';
}

function getAvatarInitials(name = '') {
    return (
        String(name || 'L')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || 'LU'
    );
}

function hasAvatarImage(imageSource = '') {
    if (typeof imageSource !== 'string') {
        return false;
    }

    const normalized = imageSource.trim().toLowerCase();

    return (
        normalized !== '' &&
        !normalized.includes('id_default.png') &&
        !normalized.includes('sncs-logo')
    );
}

function buildRetryableAvatarSource(
    imageSource: string | null | undefined,
    attempt: number,
) {
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
    const imageSource =
        typeof scan?.image === 'string' ? scan.image.trim() : '';
    const [prevImageSource, setPrevImageSource] = useState(imageSource);
    const [retryCount, setRetryCount] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);

    if (prevImageSource !== imageSource) {
        setPrevImageSource(imageSource);
        setRetryCount(0);
        setImageFailed(false);
    }

    const resolvedImageSource = buildRetryableAvatarSource(
        imageSource,
        retryCount,
    );
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
            className="h-full w-full object-cover"
            onError={handleImageError}
        />
    );
}

export default function AttendanceIndex() {
    const { auth = {}, ui = {}, recentScans = [] } = usePage().props as any;

    const userRoles = Array.isArray(auth?.user?.roles) ? auth.user.roles : [];
    const isAdmin =
        userRoles.includes('admin') || userRoles.includes('super admin');

    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [showPcForm, setShowPcForm] = useState(false);
    const [, setIsGlobalLoading] = useState(false);
    const [prevRecentScans, setPrevRecentScans] = useState(recentScans);
    const [recentActivity, setRecentActivity] = useState<RecentScan[]>(
        Array.isArray(recentScans) ? recentScans : [],
    );

    if (prevRecentScans !== recentScans) {
        setPrevRecentScans(recentScans);
        setRecentActivity(Array.isArray(recentScans) ? recentScans : []);
    }

    const isRecentScansRequestInFlightRef = useRef(false);

    const handleScanSuccess = (scanEntry: RecentScan) => {
        if (!scanEntry) {
            return;
        }

        setRecentActivity((currentEntries) =>
            [
                scanEntry,
                ...currentEntries.filter((entry) => entry.id !== scanEntry.id),
            ].slice(0, 5),
        );
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
                if (
                    data.status === 'success' &&
                    Array.isArray(data.recentScans)
                ) {
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
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, []);

    const getBadgeVariant = (type: string) => {
        if (type === 'Time Out') {
            return 'bg-rose-100 text-rose-700 border-rose-200';
        }

        if (type === 'Online Research Use') {
            return 'bg-blue-100 text-blue-700 border-blue-200';
        }

        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    return (
        <div className="flex min-h-screen w-full flex-col justify-between bg-slate-100 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950">
            <Head title="Attendance Monitoring | Time In & Time Out" />

            {/* Header Navbar */}
            <header className="sticky top-0 z-40 border-b border-primary-500/30 bg-primary-600 shadow-lg dark:bg-slate-900">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between p-4">
                    <Link
                        href="/"
                        className="flex items-center space-x-3 rtl:space-x-reverse"
                    >
                        {ui?.org_logo ? (
                            <img
                                className="h-12 w-12 rounded-full border-2 border-white/20 object-cover md:h-14 md:w-14"
                                src={ui.org_logo}
                                alt="School Logo"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white md:h-14 md:w-14">
                                Logo
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-start text-xs font-bold text-white md:text-sm lg:text-base">
                                {ui?.org_name || 'School Name'}
                            </h1>
                            <hr className="my-0.5 h-px border-0 bg-white/20" />
                            <h2 className="text-start text-[10px] font-medium text-white/80 md:text-xs">
                                Attendance Monitoring System
                            </h2>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white transition-all outline-none hover:bg-white/20">
                                        <Avatar className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/30">
                                            <AvatarImage
                                                src={
                                                    auth.user.avatar ||
                                                    auth.user.profile_image
                                                }
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="bg-primary-700 text-xs font-bold text-white">
                                                {getAvatarInitials(
                                                    auth.user.name,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="max-w-[140px] truncate text-xs font-semibold sm:text-sm">
                                            {auth.user.name}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 text-white/80" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <DropdownMenuLabel className="p-2 font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm leading-none font-bold text-slate-900 dark:text-white">
                                                {auth.user.name}
                                            </p>
                                            <p className="mt-1 truncate text-xs leading-none text-slate-500 dark:text-slate-400">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="my-1 bg-slate-200 dark:bg-slate-800" />
                                    <DropdownMenuGroup>
                                        {isAdmin && (
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                                >
                                                    <LayoutGrid className="h-4 w-4 text-primary-600" />
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/20 sm:text-sm"
                            >
                                Login
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
                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12 xl:gap-8">
                    <div className="flex w-full justify-center xl:col-span-7">
                        <div className="w-full max-w-2xl">
                            <RFIDForm
                                onVisitorClick={() => setShowVisitorForm(true)}
                                onOpenPcForm={() => setShowPcForm(true)}
                                onLoadingChange={setIsGlobalLoading}
                                onScanSuccess={handleScanSuccess}
                                onRecentScansSync={syncRecentScans}
                                scannerCaptureEnabled={
                                    !showVisitorForm && !showPcForm
                                }
                            />
                        </div>
                    </div>

                    <div className="w-full space-y-6 xl:col-span-5">
                        <ClockDisplay />

                        <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <h2 className="text-xs font-extrabold tracking-widest text-primary-600 uppercase">
                                    Recent Scans
                                </h2>
                                <span className="text-xs font-semibold text-slate-500">
                                    Last {recentActivity.length || 0} entries
                                </span>
                            </div>

                            <div className="space-y-3">
                                {recentActivity.length ? (
                                    recentActivity.map((scan) => (
                                        <article
                                            key={`${scan.id ?? scan.timeLabel}-${scan.type}`}
                                            className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50 p-3.5"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-bold text-primary-600">
                                                    <RecentScanAvatar
                                                        scan={scan}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-bold text-slate-900">
                                                        {scan.name}
                                                    </h3>
                                                    <p className="text-xs font-semibold text-slate-500">
                                                        {getRecentScanGroupLabel(
                                                            scan,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                <span className="text-xs font-bold text-slate-600">
                                                    {scan.timeLabel}
                                                </span>
                                                <span
                                                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getBadgeVariant(scan.type)}`}
                                                >
                                                    {scan.type}
                                                </span>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="space-y-1 py-6 text-center text-slate-500">
                                        <p className="text-sm font-bold text-slate-700">
                                            No recent scans yet.
                                        </p>
                                        <p className="text-xs">
                                            The latest attendance activity will
                                            appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                    &copy; {new Date().getFullYear()}{' '}
                    {ui?.org_name || 'OwlQuery Group'}. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
