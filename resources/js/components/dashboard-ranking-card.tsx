import { Monitor, Users } from 'lucide-react';

export interface RankedUser {
    rank: number;
    id: number;
    name: string;
    user_type: string;
    grade_section: string;
    count: number;
    avatar: string | null;
}

interface DashboardRankingCardProps {
    users: RankedUser[];
    variant: 'library' | 'research';
}

export default function DashboardRankingCard({
    users,
    variant,
}: DashboardRankingCardProps) {
    const isLibrary = variant === 'library';
    const title = isLibrary
        ? 'Top 5 Library Visitors'
        : 'Top 5 Online Research Users';
    const description = isLibrary
        ? 'All-time library visits, highest first'
        : 'All-time research sessions, highest first';
    const Icon = isLibrary ? Users : Monitor;

    return (
        <section
            aria-label={title}
            className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
        >
            <div className="flex h-20 items-center justify-between gap-2 border-b border-neutral-100 px-4 dark:border-neutral-800">
                <div className="flex min-w-0 items-center gap-2">
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                            isLibrary
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                                : 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400'
                        }`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h3
                            title={title}
                            className="line-clamp-2 h-10 text-base leading-5 font-bold text-neutral-900 dark:text-neutral-100"
                        >
                            {title}
                        </h3>
                        <p
                            title={description}
                            className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400"
                        >
                            {description}
                        </p>
                    </div>
                </div>
                <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    Top 5
                </span>
            </div>

            <table className="w-full table-fixed text-left text-xs">
                <colgroup>
                    <col className="w-[8%]" />
                    <col className="w-[38%]" />
                    <col />
                    <col className="w-20" />
                </colgroup>
                <thead className="bg-neutral-50/80 text-neutral-400 uppercase dark:bg-neutral-800/40">
                    <tr className="h-12">
                        <th scope="col" className="pl-3 font-semibold sm:pl-4">
                            #
                        </th>
                        <th scope="col" className="px-2 font-semibold">
                            User
                        </th>
                        <th scope="col" className="px-2 font-semibold">
                            Grade &amp; Section
                        </th>
                        <th
                            scope="col"
                            className="pr-3 pl-2 text-right font-semibold sm:pr-4"
                        >
                            {isLibrary ? 'Visits' : 'Sessions'}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {users.length === 0 ? (
                        <tr>
                            <td
                                colSpan={4}
                                className="h-14 px-4 text-center text-neutral-400"
                            >
                                {isLibrary
                                    ? 'No library visits recorded yet.'
                                    : 'No online research sessions recorded yet.'}
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr
                                key={user.id}
                                className="h-14 transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
                            >
                                <td className="pl-3 font-bold text-gray-600 sm:pl-4 dark:text-gray-300">
                                    {user.rank}
                                </td>
                                <td className="px-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ${
                                                isLibrary
                                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                                            }`}
                                        >
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                user.name
                                                    .charAt(0)
                                                    .toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div
                                                title={user.name}
                                                className="truncate font-semibold text-neutral-900 dark:text-neutral-100"
                                            >
                                                {user.name}
                                            </div>
                                            <div
                                                title={user.user_type}
                                                className="truncate text-[10px] text-neutral-400"
                                            >
                                                {user.user_type}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2">
                                    <span
                                        title={user.grade_section}
                                        className="inline-block max-w-full truncate rounded-lg bg-neutral-100 px-2 py-0.5 align-middle font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                    >
                                        {user.grade_section}
                                    </span>
                                </td>
                                <td className="pr-3 pl-2 text-right font-semibold text-neutral-600 tabular-nums sm:pr-4 dark:text-neutral-300">
                                    {user.count.toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </section>
    );
}
