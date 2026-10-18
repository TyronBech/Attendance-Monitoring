export const userTypes = ['Student', 'Employee', 'Visitor'] as const;

export type UserType = (typeof userTypes)[number];

export type UserGroupOption = {
    id: number;
    user_type: UserType;
    category: string;
};

export type ManagedUser = {
    id: number;
    profile_image?: string | null;
    name: string;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    suffix: string | null;
    gender: string;
    email: string;
    rfid: string | null;
    privilege_id: number | null;
    user_type: UserType;
    category: string | null;
    created_at: string | null;
    student_id: string | null;
    grade_level: string | null;
    section: string | null;
    employee_id: string | null;
    employee_role: string | null;
    school_org: string | null;
    purpose: string | null;
};

export type UserFormData = {
    profile_image: File | null;
    remove_profile_image: boolean;
    user_type: UserType;
    privilege_id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    gender: string;
    email: string;
    rfid: string;
    student_id: string;
    grade_level: string;
    section: string;
    employee_id: string;
    employee_role: string;
    school_org: string;
    purpose: string;
};

export type UserFilters = {
    user_type: UserType;
    search: string;
    sort: 'newest' | 'oldest' | 'grade_level' | 'role';
};

export type PaginatedUsers = {
    data: ManagedUser[];
    total: number;
    from: number | null;
    to: number | null;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
