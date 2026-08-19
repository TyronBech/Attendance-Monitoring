import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_FORM = {
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    purpose: '',
    gender: '',
    school_org: '',
};

function encodePayload(payload: any) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function validateField(name: string, value: string) {
    const trimmedValue = value.trim();
    const namePattern = /^[a-zA-Z\s'-]+$/;

    switch (name) {
        case 'first_name':
        case 'last_name':
            if (!trimmedValue) {
return 'This field is required.';
}

            if (!namePattern.test(trimmedValue)) {
return 'Only letters and spaces are allowed.';
}

            return '';
        case 'middle_name':
            if (trimmedValue && !namePattern.test(trimmedValue)) {
return 'Only letters and spaces are allowed.';
}

            return '';
        case 'email':
            if (!trimmedValue) {
return 'Email is required.';
}

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
return 'Invalid email address.';
}

            return '';
        case 'gender':
        case 'school_org':
        case 'purpose':
            return trimmedValue ? '' : 'This field is required.';
        default:
            return '';
    }
}

type Props = {
    active: boolean;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
    onNotify?: (msg: string, opts?: { type?: string }) => void;
    onSuccess?: (scanEntry: any) => void;
    onRecentScansSync?: () => void;
};

function getCsrfToken(): string {
    if (typeof document === 'undefined') {
return '';
}

    const metaToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

    if (metaToken) {
return metaToken;
}

    const match = document.cookie.match(new RegExp('(^|; )XSRF-TOKEN=([^;]+)'));

    return match ? decodeURIComponent(match[2]) : '';
}

export default function VisitorForm({
    active,
    onClose,
    onLoadingChange,
    onNotify,
    onSuccess,
    onRecentScansSync,
}: Props) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const emailInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (active) {
            emailInputRef.current?.focus();
        }
    }, [active]);

    useEffect(() => {
        if (!active) {
return undefined;
}

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
onClose();
}
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [active, onClose]);

    const handleFieldChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        for (const [key, val] of Object.entries(form)) {
            const err = validateField(key, val as string);

            if (err) {
newErrors[key] = err;
}
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            return;
        }

        setIsSubmitting(true);
        onLoadingChange(true);

        try {
            const res = await fetch('/attendance/visitor', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    payload: encodePayload(form),
                    ...form,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 419 || data.message?.toLowerCase().includes('csrf')) {
                onNotify?.('Session expired. Reloading page...', { type: 'error' });
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

                return;
            }

            if (!res.ok || data.status !== 'success') {
                onNotify?.(data.message || 'Error processing visitor submission.', { type: 'error' });

                return;
            }

            onNotify?.(data.message || 'Visitor log submitted successfully!', { type: 'success' });
            onSuccess?.(data.recentScan ?? null);
            onRecentScansSync?.();
            setForm(DEFAULT_FORM);
            setErrors({});
            onClose();
        } catch {
            onNotify?.('Error submitting visitor log.', { type: 'error' });
        } finally {
            setIsSubmitting(false);
            onLoadingChange(false);
        }
    };

    if (!active) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-full max-w-3xl my-auto bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-6 text-neutral-900 dark:text-neutral-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="space-y-1">
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Visitor Registration Form</h3>
                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal">Complete the form below to record your library visit.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
                        aria-label="Close form"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                    <strong>Tip:</strong> After registration, you can use your <strong>email address</strong> for time in and time out instead of an RFID card.
                </div>

                <form method="POST" className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-12">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">Email *</label>
                            <input
                                ref={emailInputRef}
                                type="email"
                                name="email"
                                required
                                value={form.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                placeholder="visitor@example.com"
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {errors.email && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{errors.email}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">First Name *</label>
                            <input
                                type="text"
                                name="first_name"
                                required
                                value={form.first_name}
                                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {errors.first_name && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{errors.first_name}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">Middle Name</label>
                            <input
                                type="text"
                                name="middle_name"
                                value={form.middle_name}
                                onChange={(e) => handleFieldChange('middle_name', e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {errors.middle_name && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{errors.middle_name}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">Last Name *</label>
                            <input
                                type="text"
                                name="last_name"
                                required
                                value={form.last_name}
                                onChange={(e) => handleFieldChange('last_name', e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {errors.last_name && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{errors.last_name}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">Suffix</label>
                            <select
                                name="suffix"
                                value={form.suffix}
                                onChange={(e) => handleFieldChange('suffix', e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all"
                            >
                                <option value="" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">N/A</option>
                                <option value="Jr." className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">Jr.</option>
                                <option value="Sr." className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">Sr.</option>
                                <option value="I" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">I</option>
                                <option value="II" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">II</option>
                                <option value="III" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">III</option>
                            </select>
                        </div>

                        <div className="md:col-span-8">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">Purpose *</label>
                            <input
                                type="text"
                                name="purpose"
                                required
                                value={form.purpose}
                                onChange={(e) => handleFieldChange('purpose', e.target.value)}
                                placeholder="e.g., Research, Reading, Study"
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {errors.purpose && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{errors.purpose}</p>}
                        </div>

                        <div className="md:col-span-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">Gender *</label>
                            <select
                                name="gender"
                                required
                                value={form.gender}
                                onChange={(e) => handleFieldChange('gender', e.target.value)}
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all"
                            >
                                <option value="" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">Select Gender</option>
                                <option value="Male" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">Male</option>
                                <option value="Female" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">Female</option>
                                <option value="Prefer not to say" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">Prefer not to say</option>
                            </select>
                            {errors.gender && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{errors.gender}</p>}
                        </div>

                        <div className="md:col-span-12">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">School / Organization *</label>
                            <input
                                type="text"
                                name="school_org"
                                required
                                value={form.school_org}
                                onChange={(e) => handleFieldChange('school_org', e.target.value)}
                                placeholder="e.g., School or Company Name"
                                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium text-sm focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                            />
                            {errors.school_org && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{errors.school_org}</p>}
                        </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 px-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-sm transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 px-6 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                        >
                            <span>{isSubmitting ? 'Submitting...' : 'Submit & Time In'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
