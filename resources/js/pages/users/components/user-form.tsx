import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { users as index } from '@/routes/maintenance';
import { show, store, update } from '@/routes/maintenance/users';
import type {
    ManagedUser,
    UserFormData,
    UserGroupOption,
    UserType,
} from '@/types/user-maintenance';
import UserFields from './user-fields';
import UserPhotoInput from './user-photo-input';
import UserTypeToggle from './user-type-toggle';

export default function UserForm({
    groups,
    userType,
    managedUser,
}: {
    groups: UserGroupOption[];
    userType: UserType;
    managedUser?: ManagedUser;
}) {
    const form = useForm<UserFormData>({
        profile_image: null,
        remove_profile_image: false,
        user_type: userType,
        privilege_id: String(
            managedUser?.privilege_id ??
                groups.find((group) => group.user_type === userType)?.id ??
                '',
        ),
        first_name: managedUser?.first_name ?? '',
        middle_name: managedUser?.middle_name ?? '',
        last_name: managedUser?.last_name ?? '',
        suffix: managedUser?.suffix ?? '',
        gender: managedUser?.gender ?? '',
        email: managedUser?.email ?? '',
        rfid: managedUser?.rfid ?? '',
        student_id: managedUser?.student_id ?? '',
        grade_level: managedUser?.grade_level ?? '',
        section: managedUser?.section ?? '',
        employee_id: managedUser?.employee_id ?? '',
        employee_role: managedUser?.employee_role ?? '',
        school_org: managedUser?.school_org ?? '',
        purpose: managedUser?.purpose ?? '',
    });
    const hasCategory = groups.some(
        (group) => group.user_type === form.data.user_type,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (managedUser) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(update.url(managedUser.id), { forceFormData: true });
        } else {
            form.post(store.url(), { forceFormData: true });
        }
    }

    return (
        <form
            onSubmit={submit}
            encType="multipart/form-data"
            className="grid gap-6 rounded-xl border bg-card p-5 shadow-sm sm:p-8"
        >
            <div className="grid gap-2">
                {managedUser ? (
                    <p className="font-medium">User group: {userType}</p>
                ) : (
                    <UserTypeToggle
                        singular
                        value={form.data.user_type}
                        disabled={form.processing}
                        onChange={(type) => {
                            form.clearErrors();
                            form.setData((data) => ({
                                ...data,
                                user_type: type,
                                privilege_id: String(
                                    groups.find(
                                        (group) => group.user_type === type,
                                    )?.id ?? '',
                                ),
                            }));
                        }}
                    />
                )}
                <InputError message={form.errors.user_type} />
                <p className="text-sm text-muted-foreground">
                    Fields marked * are required.
                </p>
            </div>
            <UserPhotoInput
                photo={form.data.profile_image}
                currentPhoto={managedUser?.profile_image}
                removePhoto={form.data.remove_profile_image}
                disabled={form.processing}
                error={form.errors.profile_image}
                onChange={(photo) => {
                    form.clearErrors('profile_image');
                    form.setData('profile_image', photo);
                }}
                onRemoveChange={(remove) =>
                    form.setData('remove_profile_image', remove)
                }
            />
            <InputError message={form.errors.remove_profile_image} />
            {form.progress && (
                <progress
                    aria-label="Photo upload progress"
                    value={form.progress.percentage ?? 0}
                    max={100}
                    className="w-full"
                />
            )}
            <UserFields
                values={form.data}
                groups={groups}
                errors={form.errors}
                onChange={(name, value) => form.setData(name, value)}
            />
            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" asChild>
                    <Link
                        href={
                            managedUser
                                ? show.url(managedUser.id)
                                : index.url({
                                      query: { user_type: form.data.user_type },
                                  })
                        }
                    >
                        Cancel
                    </Link>
                </Button>
                <Button
                    type="submit"
                    disabled={form.processing || !hasCategory}
                >
                    {form.processing
                        ? 'Saving…'
                        : managedUser
                          ? 'Save changes'
                          : 'Create user'}
                </Button>
            </div>
        </form>
    );
}
