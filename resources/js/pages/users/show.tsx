import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { users as index } from '@/routes/maintenance';
import { edit } from '@/routes/maintenance/users';
import type { ManagedUser } from '@/types/user-maintenance';
import DeleteUserDialog from './components/delete-user-dialog';

export default function ShowUser({
    managedUser: user,
}: {
    managedUser: ManagedUser;
}) {
    const { auth } = usePage().props;
    const [deleting, setDeleting] = useState(false);
    const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
    const fields = [
        ['First name', user.first_name],
        ['Middle name', user.middle_name],
        ['Last name', user.last_name],
        ['Suffix', user.suffix],
        ['Gender', user.gender],
        ['Email', user.email],
        ['RFID', user.rfid],
        ['User group', user.user_type],
        ['Category', user.category],
        ...(user.user_type === 'Student'
            ? [
                  ['Student ID', user.student_id],
                  ['Grade level', user.grade_level],
                  ['Section', user.section],
              ]
            : []),
        ...(user.user_type === 'Employee'
            ? [
                  ['Employee ID', user.employee_id],
                  ['Employee role', user.employee_role],
              ]
            : []),
        ...(user.user_type === 'Visitor'
            ? [
                  ['School or organization', user.school_org],
                  ['Purpose of visit', user.purpose],
              ]
            : []),
    ];

    return (
        <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8">
            <Head title={user.name} />
            <Link
                href={index.url({ query: { user_type: user.user_type } })}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft size={16} />
                Back to user maintenance
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                    <Avatar className="size-24 border bg-muted">
                        {user.profile_image &&
                        user.profile_image !== failedPhoto ? (
                            <img
                                src={user.profile_image}
                                alt={`Profile photo of ${user.name}`}
                                className="size-full object-cover"
                                onError={() =>
                                    setFailedPhoto(user.profile_image ?? null)
                                }
                            />
                        ) : (
                            <UserRound
                                role="img"
                                aria-label="No profile photo"
                                className="m-auto size-10 text-muted-foreground"
                            />
                        )}
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">
                            {user.user_type} details
                        </p>
                        <h1 className="text-2xl font-bold wrap-anywhere">
                            {user.name}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href={edit.url(user.id)}>
                            <Pencil />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={auth.user.id === user.id}
                        onClick={() => setDeleting(true)}
                    >
                        <Trash2 />
                        Delete
                    </Button>
                </div>
            </div>
            <dl className="grid gap-6 rounded-xl border bg-card p-6 shadow-sm sm:grid-cols-2">
                {fields.map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-sm text-muted-foreground">
                            {label}
                        </dt>
                        <dd className="mt-1 font-medium wrap-anywhere whitespace-pre-wrap">
                            {value || '—'}
                        </dd>
                    </div>
                ))}
            </dl>
            {deleting && (
                <DeleteUserDialog
                    user={user}
                    onClose={() => setDeleting(false)}
                />
            )}
        </div>
    );
}
