import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy } from '@/routes/maintenance/users';
import type { ManagedUser } from '@/types/user-maintenance';

export default function DeleteUserDialog({
    user,
    onClose,
}: {
    user: ManagedUser;
    onClose: () => void;
}) {
    const form = useForm<{ user?: string }>({});

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) {
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {user.name}?</DialogTitle>
                    <DialogDescription>
                        This user will be removed from the active user lists and
                        attendance access.
                    </DialogDescription>
                </DialogHeader>
                <InputError message={form.errors.user} />
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={form.processing}
                        onClick={() =>
                            form.delete(destroy.url(user.id), {
                                preserveScroll: true,
                                onSuccess: onClose,
                            })
                        }
                    >
                        {form.processing ? 'Deleting…' : 'Delete user'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
