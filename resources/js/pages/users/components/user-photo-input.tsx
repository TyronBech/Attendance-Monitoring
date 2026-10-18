import { UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UserPhotoInput({
    photo,
    currentPhoto,
    removePhoto,
    disabled = false,
    error,
    onChange,
    onRemoveChange,
}: {
    photo: File | null;
    currentPhoto?: string | null;
    removePhoto: boolean;
    disabled?: boolean;
    error?: string;
    onChange: (photo: File | null) => void;
    onRemoveChange: (remove: boolean) => void;
}) {
    const input = useRef<HTMLInputElement>(null);
    const reader = useRef<FileReader | null>(null);
    const [preview, setPreview] = useState(currentPhoto ?? null);
    const [failedPreview, setFailedPreview] = useState<string | null>(null);
    const visiblePhoto = removePhoto ? null : preview;

    useEffect(() => () => reader.current?.abort(), []);

    function selectPhoto(nextPhoto: File | null) {
        reader.current?.abort();
        onChange(nextPhoto);
        onRemoveChange(false);

        if (!nextPhoto) {
            setPreview(currentPhoto ?? null);

            return;
        }

        const nextReader = new FileReader();
        reader.current = nextReader;
        nextReader.onload = () =>
            setPreview(
                typeof nextReader.result === 'string'
                    ? nextReader.result
                    : null,
            );
        nextReader.onerror = () => setPreview(null);
        nextReader.readAsDataURL(nextPhoto);
    }

    function removeSelectedPhoto() {
        reader.current?.abort();

        if (input.current) {
            input.current.value = '';
        }

        onChange(null);
        onRemoveChange(!!currentPhoto);
        setPreview(null);
    }

    return (
        <div className="grid gap-4 rounded-lg border p-4 sm:flex sm:items-center">
            <Avatar className="size-24 border bg-muted">
                {visiblePhoto && visiblePhoto !== failedPreview ? (
                    <img
                        src={visiblePhoto}
                        alt="Profile photo preview"
                        className="size-full object-cover"
                        onError={() => setFailedPreview(visiblePhoto)}
                    />
                ) : (
                    <UserRound
                        role="img"
                        aria-label="No profile photo"
                        className="m-auto size-10 text-muted-foreground"
                    />
                )}
            </Avatar>
            <div className="grid min-w-0 flex-1 gap-2">
                <Label htmlFor="profile_image">Profile photo (optional)</Label>
                <Input
                    ref={input}
                    id="profile_image"
                    name="profile_image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={disabled}
                    onChange={(event) =>
                        selectPhoto(event.target.files?.[0] ?? null)
                    }
                    aria-invalid={!!error}
                    aria-describedby="profile-photo-help profile-photo-error"
                />
                <p
                    id="profile-photo-help"
                    className="text-sm text-muted-foreground"
                >
                    JPEG, PNG, or WebP. Maximum 2 MB and 4096 × 4096 pixels.
                </p>
                <InputError id="profile-photo-error" message={error} />
                {!removePhoto && (photo || currentPhoto) && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={removeSelectedPhoto}
                        className="w-fit"
                    >
                        Remove photo
                    </Button>
                )}
                {removePhoto && currentPhoto && (
                    <div className="grid gap-2">
                        <p className="text-sm text-muted-foreground">
                            The photo will be removed when you save.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                            className="w-fit"
                            onClick={() => {
                                onRemoveChange(false);
                                setPreview(currentPhoto);
                            }}
                        >
                            Keep current photo
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
