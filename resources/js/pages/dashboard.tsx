import { Head, usePage } from '@inertiajs/react';
import {
    Users,
    Monitor,
    TrendingUp,
    Clock,
    UserCheck,
    Activity,
    BookOpen,
} from 'lucide-react';
import { useState } from 'react';

interface GraphPoint {
    date: string;
    label: string;
    shortLabel?: string;
    count: number;
}

interface UserLogItem {
    rank: number;
    id: number;
    name: string;
    user_type: string;
    grade_section: string;
    time_in: string;
    remarks?: string;
    avatar: string | null;
}

interface DashboardProps {
    metrics: {
        currentlyActiveLibrary: number;
        currentlyActiveComputer: number;
        monthlyLibraryTotal: number;
        monthlyLibraryGraph: GraphPoint[];
        monthlyComputerTotal: number;
        monthlyComputerGraph: GraphPoint[];
        periodLabel?: string;
    };
    recentLibraryUsers: UserLogItem[];
    recentComputerUsers: UserLogItem[];
    currentMonthName: string;
    ui?: {
        theme_colors?: {
            primary?: string;
            secondary?: string;
        };
    };
    [key: string]: any;
}

function AreaChart({
    data,
    colorGradientId,
    strokeColor,
    fillColorStart,
    fillColorEnd,
}: {
    data: GraphPoint[];
    colorGradientId: string;
    strokeColor: string;
    fillColorStart: string;
    fillColorEnd: string;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex h-48 w-full items-center justify-center text-sm text-neutral-400">
                No activity data available for this month
            </div>
        );
    }

    const width = 600;
    const height = 200;
    const padLeft = 35;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;

    const chartWidth = width - padLeft - padRight;
    const chartHeight = height - padTop - padBottom;

    const maxCount = Math.max(...data.map((d) => d.count), 5);

    const getX = (index: number) => {
        if (data.length === 1) {
            return padLeft + chartWidth / 2;
        }

        return padLeft + (index / (data.length - 1)) * chartWidth;
    };

    const getY = (count: number) => {
        return padTop + chartHeight - (count / maxCount) * chartHeight;
    };

    const points = data.map((d, i) => ({
        x: getX(i),
        y: getY(d.count),
        data: d,
        index: i,
    }));

    // Build smooth SVG path using Catmull-Rom / Control points
    let pathD = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cpX = (curr.x + next.x) / 2;
        pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`;

    // Calculate Y-axis ticks
    const yTicks = [0, Math.round(maxCount / 2), maxCount];

    // Calculate X-axis ticks (e.g. 5 dates across month)
    const step = Math.max(1, Math.floor(data.length / 6));
    const xTicks = data.filter((_, i) => i % step === 0 || i === data.length - 1);

    return (
        <div className="relative w-full">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full overflow-visible"
                onMouseLeave={() => setHoveredIndex(null)}
            >
                <defs>
                    <linearGradient id={colorGradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={fillColorStart} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={fillColorEnd} stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {yTicks.map((tick, idx) => {
                    const y = getY(tick);

                    return (
                        <g key={idx}>
                            <line
                                x1={padLeft}
                                y1={y}
                                x2={width - padRight}
                                y2={y}
                                stroke="currentColor"
                                strokeDasharray="3 3"
                                className="text-neutral-200 dark:text-neutral-800"
                            />
                            <text
                                x={padLeft - 8}
                                y={y + 4}
                                textAnchor="end"
                                className="fill-neutral-400 text-[10px] font-medium"
                            >
                                {tick}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {xTicks.map((d, i) => {
                    const originalIdx = data.findIndex((item) => item.date === d.date);
                    const x = getX(originalIdx >= 0 ? originalIdx : 0);

                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - 8}
                            textAnchor="middle"
                            className="fill-neutral-400 text-[10px] font-medium"
                        >
                            {d.shortLabel || d.label}
                        </text>
                    );
                })}

                {/* Gradient area */}
                <path d={areaD} fill={`url(#${colorGradientId})`} />

                {/* Line stroke */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points & hover detection */}
                {points.map((pt) => {
                    const isHovered = hoveredIndex === pt.index;

                    return (
                        <g key={pt.index}>
                            {/* Invisible wider hit area */}
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="12"
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(pt.index)}
                            />

                            {/* Visible dot on hover or if count > 0 */}
                            {(isHovered || pt.data.count > 0) && (
                                <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={isHovered ? 6 : 3.5}
                                    fill={strokeColor}
                                    stroke="#ffffff"
                                    strokeWidth={isHovered ? 2.5 : 1.5}
                                    className="transition-all duration-150"
                                />
                            )}

                            {/* Vertical hover guide line */}
                            {isHovered && (
                                <line
                                    x1={pt.x}
                                    y1={padTop}
                                    x2={pt.x}
                                    y2={padTop + chartHeight}
                                    stroke={strokeColor}
                                    strokeDasharray="2 2"
                                    strokeOpacity="0.6"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Hover Tooltip Popup */}
            {hoveredIndex !== null && points[hoveredIndex] && (
                <div
                    className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl border border-neutral-200 bg-neutral-900/90 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-800/95"
                    style={{
                        left: `${(points[hoveredIndex].x / width) * 100}%`,
                        top: `${(points[hoveredIndex].y / height) * 100 - 10}px`,
                    }}
                >
                    <div className="font-semibold text-neutral-200">
                        {points[hoveredIndex].data.label}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: strokeColor }}
                        />
                        <span>{points[hoveredIndex].data.count} Users</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const {
        metrics = {
            currentlyActiveLibrary: 0,
            currentlyActiveComputer: 0,
            monthlyLibraryTotal: 0,
            monthlyLibraryGraph: [],
            monthlyComputerTotal: 0,
            monthlyComputerGraph: [],
        },
        recentLibraryUsers = [],
        recentComputerUsers = [],
    } = usePage<DashboardProps>().props;

    return (
        <>
            <Head title="Home Dashboard" />

            <div className="min-h-[calc(100vh-4rem)] space-y-8 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
                        Library & Computer Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Real-time monitoring of active attendance, computer lab usage, and monthly trends.
                    </p>
                </div>

                {/* ROW 1: 1 Col-Span for Currently Time-In Users + 2 Col-Span for Graph of Monthly Time-In Users */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Card 1: 1 Col-Span - Currently Time-In Users in Library */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        Live in Library
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                                    Currently Time-In Users
                                </h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <UserCheck className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="my-8 flex flex-col items-center justify-center text-center">
                            <div className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-6xl">
                                {metrics.currentlyActiveLibrary}
                            </div>
                            <p className="mt-2 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
                                Active visitors currently inside the library premises.
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                            <span className="text-xs font-medium text-neutral-400">Status</span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <Activity className="h-3.5 w-3.5" /> Active Session
                            </span>
                        </div>
                    </div>

                    {/* Card 2: 2 Col-Span - Graph of Total Monthly Time-In Users (Last 12 Months) */}
                    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-indigo-500" />
                                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                        12-Month Library Time-In Users
                                    </h3>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Monthly attendance distribution ({metrics.periodLabel || 'Last 12 Months'})
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xs font-medium text-neutral-400">12-Month Total</div>
                                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        {metrics.monthlyLibraryTotal.toLocaleString()} Time-Ins
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <AreaChart
                                data={metrics.monthlyLibraryGraph}
                                colorGradientId="libraryGradient"
                                strokeColor="#6366f1"
                                fillColorStart="#6366f1"
                                fillColorEnd="#6366f1"
                            />
                        </div>
                    </div>
                </div>

                {/* ROW 2: 1 Col-Span for Currently Computer Use Counts + 2 Col-Span for Graph of Monthly Computer Logs */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Card 3: 1 Col-Span - Currently Computer Use Counts */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                                    </span>
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                        In Workstation
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                                    Active Computer Use
                                </h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Monitor className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="my-8 flex flex-col items-center justify-center text-center">
                            <div className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-6xl">
                                {metrics.currentlyActiveComputer}
                            </div>
                            <p className="mt-2 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
                                Active computer sessions logged for research.
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                            <span className="text-xs font-medium text-neutral-400">Workstation Status</span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                <TrendingUp className="h-3.5 w-3.5" /> In Session
                            </span>
                        </div>
                    </div>

                    {/* Card 4: 2 Col-Span - Monthly Total Computer Logs Graph (Last 12 Months) */}
                    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Monitor className="h-4 w-4 text-purple-500" />
                                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                        12-Month Total Computer Logs
                                    </h3>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Online research & workstation activity ({metrics.periodLabel || 'Last 12 Months'})
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xs font-medium text-neutral-400">12-Month Total</div>
                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {metrics.monthlyComputerTotal.toLocaleString()} Sessions
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <AreaChart
                                data={metrics.monthlyComputerGraph}
                                colorGradientId="computerGradient"
                                strokeColor="#a855f7"
                                fillColorStart="#a855f7"
                                fillColorEnd="#a855f7"
                            />
                        </div>
                    </div>
                </div>

                {/* ROW 3: 10 Recent Time-In Users in Library & 10 Recent Computer Use Logs */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Card 5: 10 Recent Time-In Users in Library */}
                    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 p-6 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                        10 Recent Library Time-In Users
                                    </h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Most recent entry logs (#1 as latest)
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                Top 10
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-neutral-50/80 uppercase text-neutral-400 dark:bg-neutral-800/40">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">#</th>
                                        <th className="px-4 py-3 font-semibold">User</th>
                                        <th className="px-4 py-3 font-semibold">Grade & Section</th>
                                        <th className="px-4 py-3 font-semibold">Date & Time of Entry</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {recentLibraryUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                                                No recent library time-ins recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentLibraryUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
                                            >
                                                <td className="px-4 py-3 font-bold text-gray-600 dark:text-gray-300">
                                                    {user.rank}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                                                            {user.avatar ? (
                                                                <img
                                                                    src={user.avatar}
                                                                    alt={user.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                user.name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-[10px] text-neutral-400">
                                                                {user.user_type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                        {user.grade_section}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                                        <span>{user.time_in}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Card 6: 10 Recent Computer Use Logs */}
                    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 p-6 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                    <Monitor className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                        10 Recent Computer Use Logs
                                    </h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Most recent research sessions (#1 as latest)
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                Top 10
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-neutral-50/80 uppercase text-neutral-400 dark:bg-neutral-800/40">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">#</th>
                                        <th className="px-4 py-3 font-semibold">User</th>
                                        <th className="px-4 py-3 font-semibold">Grade & Section</th>
                                        <th className="px-4 py-3 font-semibold">Date & Time of Entry</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {recentComputerUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                                                No recent computer use recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentComputerUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
                                            >
                                                <td className="px-4 py-3 font-bold text-gray-600 dark:text-gray-300">
                                                    {user.rank}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 font-semibold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                                                            {user.avatar ? (
                                                                <img
                                                                    src={user.avatar}
                                                                    alt={user.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                user.name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-[10px] text-neutral-400">
                                                                {user.remarks || user.user_type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                        {user.grade_section}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                                        <span>{user.time_in}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
