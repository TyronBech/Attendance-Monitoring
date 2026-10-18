import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { userTypes } from '@/types/user-maintenance';
import type { UserType } from '@/types/user-maintenance';

export default function UserTypeToggle({
    value,
    onChange,
    disabled = false,
    singular = false,
}: {
    value: UserType;
    onChange: (value: UserType) => void;
    disabled?: boolean;
    singular?: boolean;
}) {
    return (
        <ToggleGroup
            type="single"
            variant="outline"
            value={value}
            disabled={disabled}
            aria-label="User groups"
            className="w-full sm:w-auto"
            onValueChange={(type) => {
                if (userTypes.includes(type as UserType)) {
                    onChange(type as UserType);
                }
            }}
        >
            {userTypes.map((type) => (
                <ToggleGroupItem
                    key={type}
                    value={type}
                    className="flex-1 px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                    {singular
                        ? type
                        : type === 'Employee'
                          ? 'Employees'
                          : `${type}s`}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}
