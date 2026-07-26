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
            if (!trimmedValue) return 'This field is required.';
            if (!namePattern.test(trimmedValue)) return 'Only letters and spaces are allowed.';
            return '';
        case 'middle_name':
            if (trimmedValue && !namePattern.test(trimmedValue)) return 'Only letters and spaces are allowed.';
            return '';
        case 'email':
            if (!trimmedValue) return 'Email is required.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return 'Invalid email address.';
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
    if (typeof document === 'undefined') return '';
    const metaToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
    if (metaToken) return metaToken;
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
        if (!active) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
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
            if (err) newErrors[key] = err;
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

    if (!active) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-full max-w-4xl my-auto bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 space-y-6 text-slate-900" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-5 border-b border-slate-200">
                    <div>
                        <h3 className="text-3xl font-extrabold text-slate-900">Visitor Registration Form</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Complete the form below to record your library visit.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                        aria-label="Close form"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 leading-relaxed font-medium">
                    <strong>Tip:</strong> After registration, you can use your <strong>email address</strong> for time in and time out instead of an RFID card.
                </div>

                <form method="POST" className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-12">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">Email *</label>
                            <input
                                ref={emailInputRef}
                                type="email"
                                name="email"
                                required
                                value={form.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                            {errors.email && <p className="mt-1 text-xs font-bold text-red-600">{errors.email}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">First Name *</label>
                            <input
                                type="text"
                                name="first_name"
                                required
                                value={form.first_name}
                                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                                className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                            {errors.first_name && <p className="mt-1 text-xs font-bold text-red-600">{errors.first_name}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">Middle Name</label>
                            <input
                                type="text"
                                name="middle_name"
                                value={form.middle_name}
                                onChange={(e) => handleFieldChange('middle_name', e.target.value)}
                                className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                            {errors.middle_name && <p className="mt-1 text-xs font-bold text-red-600">{errors.middle_name}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">Last Name *</label>
                            <input
                                type="text"
                                name="last_name"
                                required
                                value={form.last_name}
                                onChange={(e) => handleFieldChange('last_name', e.target.value)}
                                className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                            {errors.last_name && <p className="mt-1 text-xs font-bold text-red-600">{errors.last_name}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">Suffix</label>
                            <select
                                name="suffix"
                                value={form.suffix}
                                onChange={(e) => handleFieldChange('suffix', e.target.value)}
                                className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            >
                                <option value="">N/A</option>
                                <option value="Jr.">Jr.</option>
                                <option value="Sr.">Sr.</option>
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                            </select>
                        </div>

                        <div className="md:col-span-8">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">Purpose *</label>
                            <input
                                type="text"
                                name="purpose"
                                required
                                value={form.purpose}
                                onChange={(e) => handleFieldChange('purpose', e.target.value)}
                                className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                            {errors.purpose && <p className="mt-1 text-xs font-bold text-red-600">{errors.purpose}</p>}
                        </div>

                        <div className="md:col-span-4">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">Gender *</label>
                            <select
                                name="gender"
                                required
                                value={form.gender}
                                onChange={(e) => handleFieldChange('gender', e.target.value)}
                                className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                            {errors.gender && <p className="mt-1 text-xs font-bold text-red-600">{errors.gender}</p>}
                        </div>

                        <div className="md:col-span-12">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">School / Organization *</label>
                            <input
                                type="text"
                                name="school_org"
                                required
                                value={form.school_org}
                                onChange={(e) => handleFieldChange('school_org', e.target.value)}
                                className="w-full h-13 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                            {errors.school_org && <p className="mt-1 text-xs font-bold text-red-600">{errors.school_org}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-13 px-10 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-primary-600/25 transition-all cursor-pointer disabled:opacity-60"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit & Time In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
