import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { show } from '@/routes/maintenance/users';
import type { ManagedUser, UserGroupOption } from '@/types/user-maintenance';
import UserForm from './components/user-form';

export default function EditUser({
    managedUser,
    groups,
}: {
    managedUser: ManagedUser;
    groups: UserGroupOption[];
}) {
    return (
        <div className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-8">
            <Head title={`Edit ${managedUser.name}`} />
            <Link
                href={show.url(managedUser.id)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft size={16} />
                Back to user details
            </Link>
            <div>
                <h1 className="text-2xl font-bold">Edit user</h1>
                <p className="mt-1 text-muted-foreground">{managedUser.name}</p>
            </div>
            <UserForm
                key={managedUser.id}
                groups={groups}
                userType={managedUser.user_type}
                managedUser={managedUser}
            />
        </div>
    );
}
