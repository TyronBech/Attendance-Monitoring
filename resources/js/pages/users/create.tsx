import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { users as index } from '@/routes/maintenance';
import type { UserGroupOption, UserType } from '@/types/user-maintenance';
import UserForm from './components/user-form';

export default function CreateUser({
    groups,
    userType,
}: {
    groups: UserGroupOption[];
    userType: UserType;
}) {
    return (
        <div className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-8">
            <Head title="Add user" />
            <Link
                href={index.url({ query: { user_type: userType } })}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft size={16} />
                Back to user maintenance
            </Link>
            <h1 className="text-2xl font-bold">Add user</h1>
            <UserForm groups={groups} userType={userType} />
        </div>
    );
}
