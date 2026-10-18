import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserFormData, UserGroupOption } from '@/types/user-maintenance';

type FieldName = Exclude<
    keyof UserFormData,
    'user_type' | 'profile_image' | 'remove_profile_image'
>;
type Field = {
    name: FieldName;
    label: string;
    maxLength: number;
    required?: boolean;
    type?: string;
};

const commonFields: Field[] = [
    { name: 'first_name', label: 'First name', maxLength: 100, required: true },
    { name: 'middle_name', label: 'Middle name', maxLength: 100 },
    { name: 'last_name', label: 'Last name', maxLength: 100, required: true },
    { name: 'suffix', label: 'Suffix', maxLength: 10 },
    {
        name: 'email',
        label: 'Email',
        maxLength: 255,
        required: true,
        type: 'email',
    },
    { name: 'rfid', label: 'RFID', maxLength: 20 },
];

const selectClassName =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring';

export default function UserFields({
    values,
    groups,
    errors,
    onChange,
}: {
    values: UserFormData;
    groups: UserGroupOption[];
    errors: Partial<Record<keyof UserFormData, string>>;
    onChange: (name: FieldName, value: string) => void;
}) {
    const categories = groups.filter(
        (group) => group.user_type === values.user_type,
    );
    const detailFields: Field[] =
        values.user_type === 'Student'
            ? [
                  {
                      name: 'student_id',
                      label: 'Student ID',
                      maxLength: 20,
                      required: true,
                  },
                  { name: 'grade_level', label: 'Grade level', maxLength: 50 },
                  { name: 'section', label: 'Section', maxLength: 100 },
              ]
            : values.user_type === 'Employee'
              ? [
                    {
                        name: 'employee_id',
                        label: 'Employee ID',
                        maxLength: 50,
                        required: true,
                    },
                    {
                        name: 'employee_role',
                        label: 'Employee role',
                        maxLength: 45,
                    },
                ]
              : [
                    {
                        name: 'school_org',
                        label: 'School or organization',
                        maxLength: 100,
                        required: true,
                    },
                    {
                        name: 'purpose',
                        label: 'Purpose of visit',
                        maxLength: 100,
                        required: true,
                    },
                ];

    function field({ name, label, maxLength, required, type = 'text' }: Field) {
        return (
            <div key={name} className="grid gap-2">
                <Label htmlFor={name}>
                    {label}
                    {required && ' *'}
                </Label>
                <Input
                    id={name}
                    name={name}
                    type={type}
                    maxLength={maxLength}
                    required={required}
                    value={values[name]}
                    onChange={(event) => onChange(name, event.target.value)}
                    aria-invalid={!!errors[name]}
                    aria-describedby={
                        errors[name] ? `${name}-error` : undefined
                    }
                />
                <InputError id={`${name}-error`} message={errors[name]} />
            </div>
        );
    }

    return (
        <>
            <fieldset className="grid gap-5 sm:grid-cols-2">
                <legend className="mb-4 text-lg font-semibold">
                    Personal information
                </legend>
                {commonFields.map(field)}
                <div className="grid gap-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                        id="gender"
                        name="gender"
                        className={selectClassName}
                        required
                        value={values.gender}
                        onChange={(event) =>
                            onChange('gender', event.target.value)
                        }
                        aria-invalid={!!errors.gender}
                        aria-describedby={
                            errors.gender ? 'gender-error' : undefined
                        }
                    >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <InputError id="gender-error" message={errors.gender} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="privilege_id">Category *</Label>
                    <select
                        id="privilege_id"
                        name="privilege_id"
                        className={selectClassName}
                        required
                        value={values.privilege_id}
                        onChange={(event) =>
                            onChange('privilege_id', event.target.value)
                        }
                        aria-invalid={!!errors.privilege_id}
                        aria-describedby={
                            errors.privilege_id
                                ? 'privilege_id-error'
                                : undefined
                        }
                    >
                        <option value="">Select category</option>
                        {categories.map((group) => (
                            <option key={group.id} value={String(group.id)}>
                                {group.category}
                            </option>
                        ))}
                    </select>
                    {categories.length === 0 && (
                        <p role="status" className="text-sm text-destructive">
                            No categories are available for this user group.
                        </p>
                    )}
                    <InputError
                        id="privilege_id-error"
                        message={errors.privilege_id}
                    />
                </div>
            </fieldset>
            <fieldset className="grid gap-5 border-t pt-6 sm:grid-cols-2">
                <legend className="pt-6 text-lg font-semibold">
                    {values.user_type} details
                </legend>
                {detailFields.map(field)}
                {values.user_type === 'Student' && (
                    <p className="text-sm text-muted-foreground sm:col-span-2">
                        Use a grade or year level, such as Grade 10 or 1st Year.
                    </p>
                )}
            </fieldset>
        </>
    );
}
