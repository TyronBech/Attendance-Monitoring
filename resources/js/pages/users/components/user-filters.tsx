import { Search, X } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserFilters, UserType } from '@/types/user-maintenance';
import UserTypeToggle from './user-type-toggle';

export default function UserFiltersPanel({
    userType,
    search,
    sort,
    processing = false,
    onTypeChange,
    onSearchChange,
    onSortChange,
    onSubmit,
    onClear,
}: {
    userType: UserType;
    search: string;
    sort: UserFilters['sort'];
    processing?: boolean;
    onTypeChange: (type: UserType) => void;
    onSearchChange: (search: string) => void;
    onSortChange: (sort: UserFilters['sort']) => void;
    onSubmit: FormEventHandler<HTMLFormElement>;
    onClear: () => void;
}) {
    return (
        <div className="grid gap-5 rounded-xl border bg-card p-5 shadow-sm">
            <UserTypeToggle
                value={userType}
                onChange={onTypeChange}
                disabled={processing}
            />
            <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
                <div className="grid flex-1 gap-2">
                    <Label htmlFor="user-search">Search users</Label>
                    <Input
                        id="user-search"
                        name="search"
                        type="search"
                        maxLength={255}
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Name, full name, RFID, email, ID or details…"
                    />
                </div>
                <div className="grid gap-2 sm:w-48">
                    <Label htmlFor="user-sort">Sort by</Label>
                    <select
                        id="user-sort"
                        name="sort"
                        value={sort}
                        disabled={processing}
                        onChange={(event) =>
                            onSortChange(
                                event.target.value as UserFilters['sort'],
                            )
                        }
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value="newest">Recently added</option>
                        <option value="oldest">Oldest added</option>
                        {userType === 'Student' && (
                            <option value="grade_level">Grade level</option>
                        )}
                        {userType === 'Employee' && (
                            <option value="role">Employee role</option>
                        )}
                    </select>
                </div>
                <Button type="submit" disabled={processing}>
                    <Search />
                    {processing ? 'Searching…' : 'Search'}
                </Button>
                {search && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClear}
                        disabled={processing}
                    >
                        <X />
                        Clear
                    </Button>
                )}
            </form>
        </div>
    );
}
