import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (recentScan?: any) => void;
    onNotify: (msg: string, opts?: { type?: string }) => void;
};

function getCsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    const metaToken = (
        document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
    )?.content;

    if (metaToken) {
        return metaToken;
    }

    const match = document.cookie.match(new RegExp('(^|; )XSRF-TOKEN=([^;]+)'));

    return match ? decodeURIComponent(match[2]) : '';
}

export default function VisitorModal({
    isOpen,
    onClose,
    onSuccess,
    onNotify,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        gender: 'Male',
        purpose: '',
        school_org: '',
    });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) {
        return null;
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await fetch('/attendance/visitor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData),
            });

            const data = await res.json().catch(() => ({}));

            if (
                res.status === 419 ||
                data.message?.toLowerCase().includes('csrf')
            ) {
                setErrorMsg('Session expired. Reloading page...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

                return;
            }

            if (!res.ok || data.status !== 'success') {
                setErrorMsg(
                    data.message || 'Error processing visitor submission.',
                );

                return;
            }

            onNotify(data.message || 'Visitor Time In recorded!', {
                type: 'success',
            });
            onSuccess(data.recentScan);
            onClose();
        } catch {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200 fade-in">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between bg-primary-500 p-5 text-white">
                    <div>
                        <h3 className="text-lg font-bold">
                            Visitor Registration Form
                        </h3>
                        <p className="text-xs text-white/80">
                            Complete the form below to record your visit and
                            Time In
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-2xl leading-none font-bold text-white/80 hover:bg-white/10 hover:text-white"
                    >
                        &times;
                    </button>
                </div>

                {/* Form Body */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 space-y-4 overflow-y-auto p-6"
                >
                    {errorMsg && (
                        <div className="rounded-lg bg-red-100 p-3 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                            {errorMsg}
                        </div>
                    )}

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-gray-900/60 dark:text-blue-300">
                        💡 <strong>Tip:</strong> After registering once, you can
                        use your email address to Time In / Time Out in the
                        future.
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="email"
                            className="text-xs font-semibold text-gray-700 dark:text-gray-200"
                        >
                            Email Address *
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="visitor@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                            <Label
                                htmlFor="first_name"
                                className="text-xs font-semibold text-gray-700 dark:text-gray-200"
                            >
                                First Name *
                            </Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                required
                                value={formData.first_name}
                                onChange={handleChange}
                                className="dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label
                                htmlFor="middle_name"
                                className="text-xs font-semibold text-gray-700 dark:text-gray-200"
                            >
                                Middle Name
                            </Label>
                            <Input
                                id="middle_name"
                                name="middle_name"
                                value={formData.middle_name}
                                onChange={handleChange}
                                className="dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label
                                htmlFor="last_name"
                                className="text-xs font-semibold text-gray-700 dark:text-gray-200"
                            >
                                Last Name *
                            </Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                className="dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label
                                htmlFor="suffix"
                                className="text-xs font-semibold text-gray-700 dark:text-gray-200"
                            >
                                Suffix
                            </Label>
                            <select
                                id="suffix"
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleChange}
                                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">None</option>
                                <option value="Jr.">Jr.</option>
                                <option value="Sr.">Sr.</option>
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="gender"
                                className="text-xs font-semibold text-gray-700 dark:text-gray-200"
                            >
                                Gender *
                            </Label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">
                                    Prefer not to say
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="purpose"
                            className="text-xs font-semibold text-gray-700 dark:text-gray-200"
                        >
                            Purpose of Visit *
                        </Label>
                        <Input
                            id="purpose"
                            name="purpose"
                            required
                            placeholder="e.g., Research, Borrowing books, Inquiries"
                            value={formData.purpose}
                            onChange={handleChange}
                            className="dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="school_org"
                            className="text-xs font-semibold text-gray-700 dark:text-gray-200"
                        >
                            School / Organization *
                        </Label>
                        <Input
                            id="school_org"
                            name="school_org"
                            required
                            placeholder="e.g., University / Company Name"
                            value={formData.school_org}
                            onChange={handleChange}
                            className="dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary-500 text-white hover:bg-primary-600"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit & Time In'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
