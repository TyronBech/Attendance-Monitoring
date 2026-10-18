import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { users as index } from '@/routes/maintenance';
import { create, edit, show } from '@/routes/maintenance/users';
import type {
    ManagedUser,
    PaginatedUsers,
    UserFilters,
} from '@/types/user-maintenance';
import DeleteUserDialog from './components/delete-user-dialog';
import UserFiltersPanel from './components/user-filters';

type Props = { users: PaginatedUsers; filters: UserFilters };

export default function UsersIndex(props: Props) {
    return <UserList key={JSON.stringify(props.filters)} {...props} />;
}

function UserList({ users, filters }: Props) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search);
    const [processing, setProcessing] = useState(false);
    const [deleting, setDeleting] = useState<ManagedUser | null>(null);
    const isStudent = filters.user_type === 'Student';
    const isEmployee = filters.user_type === 'Employee';

    function visit(changes: Partial<UserFilters> = {}) {
        router.get(
            index.url(),
            { ...filters, search, ...changes },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8">
            <Head title="User maintenance" />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">User maintenance</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage students, employees, and visitors.
                    </p>
                </div>
                <Button asChild>
                    <Link
                        href={create.url({
                            query: { user_type: filters.user_type },
                        })}
                    >
                        <Plus />
                        Add user
                    </Link>
                </Button>
            </div>
            <UserFiltersPanel
                userType={filters.user_type}
                search={search}
                sort={filters.sort}
                processing={processing}
                onSearchChange={setSearch}
                onTypeChange={(type) =>
                    visit({ user_type: type, sort: 'newest' })
                }
                onSortChange={(sort) => visit({ sort })}
                onClear={() => {
                    setSearch('');
                    visit({ search: '' });
                }}
                onSubmit={(event) => {
                    event.preventDefault();
                    visit();
                }}
            />
            <section
                aria-label={`${filters.user_type} users`}
                aria-busy={processing}
                className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm"
            >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
                    <h2 className="flex items-center gap-2 font-semibold">
                        <Users size={18} />
                        {filters.user_type === 'Employee'
                            ? 'Employees'
                            : `${filters.user_type}s`}
                    </h2>
                    <p role="status" className="text-sm text-muted-foreground">
                        {users.total} {users.total === 1 ? 'user' : 'users'}
                        {filters.search && ` matching “${filters.search}”`}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-200 text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-5 py-3 font-medium"
                                >
                                    Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 font-medium"
                                >
                                    RFID
                                </th>
                                {!isStudent && (
                                    <th
                                        scope="col"
                                        className="px-5 py-3 font-medium"
                                    >
                                        {isEmployee
                                            ? 'Employee ID'
                                            : 'School / Organization'}
                                    </th>
                                )}
                                <th
                                    scope="col"
                                    className="px-5 py-3 font-medium"
                                >
                                    {isStudent
                                        ? 'Grade / Section'
                                        : isEmployee
                                          ? 'Role'
                                          : 'Purpose'}
                                </th>
                                <th
                                    scope="col"
                                    className="px-5 py-3 text-right font-medium"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30">
                                    <td className="max-w-72 px-5 py-4 wrap-anywhere">
                                        <p className="font-medium">
                                            {user.name}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs">
                                        {user.rfid || '—'}
                                    </td>
                                    {!isStudent && (
                                        <td className="max-w-56 px-5 py-4 wrap-anywhere">
                                            {(isEmployee
                                                ? user.employee_id
                                                : user.school_org) || '—'}
                                        </td>
                                    )}
                                    <td className="max-w-56 px-5 py-4 wrap-anywhere">
                                        {(isStudent
                                            ? [user.grade_level, user.section]
                                                  .filter(Boolean)
                                                  .join(' / ')
                                            : isEmployee
                                              ? user.employee_role
                                              : user.purpose) || '—'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={show.url(user.id)}
                                                    aria-label={`View ${user.name}`}
                                                >
                                                    <Eye />
                                                    View
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={edit.url(user.id)}
                                                    aria-label={`Edit ${user.name}`}
                                                >
                                                    <Pencil />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={
                                                    auth.user.id === user.id
                                                }
                                                aria-label={`Delete ${user.name}`}
                                                onClick={() =>
                                                    setDeleting(user)
                                                }
                                            >
                                                <Trash2 />
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={isStudent ? 4 : 5}
                                        className="px-5 py-16 text-center text-muted-foreground"
                                    >
                                        {filters.search
                                            ? 'No users match your search. Try another name, RFID, email, or ID.'
                                            : `No ${filters.user_type.toLowerCase()} users have been added yet.`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <nav
                    aria-label="User pagination"
                    className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4"
                >
                    <p className="text-sm text-muted-foreground">
                        Showing {users.from ?? 0}–{users.to ?? 0} of{' '}
                        {users.total}
                    </p>
                    <div className="flex items-center gap-3">
                        {users.prev_page_url ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={users.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                Previous
                            </Button>
                        )}
                        <span className="text-sm">
                            Page {users.current_page} of {users.last_page}
                        </span>
                        {users.next_page_url ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={users.next_page_url} preserveScroll>
                                    Next
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                Next
                            </Button>
                        )}
                    </div>
                </nav>
            </section>
            {deleting && (
                <DeleteUserDialog
                    user={deleting}
                    onClose={() => setDeleting(null)}
                />
            )}
        </div>
    );
}
