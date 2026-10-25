import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    Edit3,
    Eye,
    EyeOff,
    Lock,
    ShieldCheck,
    ShieldAlert,
    X,
} from 'lucide-react';
import { useState, useRef } from 'react';
import type { FormEventHandler } from 'react';
import { Input } from '@/components/ui/input';
import SettingsLayout from '@/layouts/settings/layout';
import profile from '@/routes/profile';

interface User {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    email: string;
    profile_image: string | null;
    user_type: string;
    user_id_number: string | null;
    employee_role: string | null;
    two_factor_enabled: boolean;
    updated_at: string;
}

interface SharedProps {
    auth: {
        user: User;
    };
    settings: {
        theme_colors: {
            primary: string;
            secondary: string;
            tertiary: string;
        };
    };
    [key: string]: any;
}

export default function Profile() {
    const { user, settings, ui } = usePage<SharedProps>().props;
    const primaryColor =
        settings?.theme_colors?.primary ||
        ui?.theme_colors?.primary ||
        '#3B82F6';
    const secondaryColor =
        settings?.theme_colors?.secondary ||
        ui?.theme_colors?.secondary ||
        '#6366F1';
    const [isEditMode, setIsEditMode] = useState(false);
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [twoFactorAction, setTwoFactorAction] = useState<
        'enable' | 'disable'
    >('enable');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(
        user?.profile_image ?? null,
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        first_name: user.first_name,
        middle_name: user.middle_name || '',
        last_name: user.last_name,
        suffix: user.suffix || '',
        email: user.email,
        profile_image: null as File | null,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const twoFactorForm = useForm({
        password: '',
    });

    const handleProfileUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        patch(profile.update.url(), {
            onSuccess: () => {
                setIsEditMode(false);
                reset(
                    'current_password',
                    'new_password',
                    'new_password_confirmation',
                );
            },
        });
    };

    const handleTwoFactorAction: FormEventHandler = (e) => {
        e.preventDefault();
        const actionUrl =
            twoFactorAction === 'enable'
                ? profile.twoFactor.enable.url()
                : profile.twoFactor.disable.url();

        twoFactorForm.post(actionUrl, {
            onSuccess: () => {
                setShowTwoFactorModal(false);
                twoFactorForm.reset();
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('profile_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleEditMode = (enable: boolean) => {
        if (!enable) {
            reset();
            setPreviewImage(user.profile_image);
        }

        setIsEditMode(enable);
    };

    const openTwoFactorModal = (action: 'enable' | 'disable') => {
        setTwoFactorAction(action);
        setShowTwoFactorModal(true);
        twoFactorForm.reset();
    };

    return (
        <>
            <Head title="Account Settings" />

            <SettingsLayout>
                {/* Profile Information Card */}
                <div className="mb-8 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                    <form
                        onSubmit={handleProfileUpdate}
                        encType="multipart/form-data"
                    >
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Left Column: Profile Image and Basic Info */}
                            <div className="flex flex-col items-center text-center lg:col-span-1 lg:border-r lg:border-gray-200 lg:pr-8 dark:lg:border-gray-700">
                                <div className="group relative mb-6">
                                    <div className="h-40 w-40 overflow-hidden rounded-full bg-gray-100 shadow-md md:h-48 md:w-48 dark:bg-gray-700">
                                        {previewImage ? (
                                            <img
                                                src={
                                                    previewImage.startsWith(
                                                        'data:',
                                                    )
                                                        ? previewImage
                                                        : previewImage
                                                }
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <Camera size={48} />
                                            </div>
                                        )}
                                    </div>

                                    {isEditMode && (
                                        <label
                                            htmlFor="profile_image"
                                            className="absolute right-2 bottom-2 cursor-pointer rounded-full border-4 border-white bg-primary-500 p-2.5 text-white shadow-lg transition-transform hover:scale-110 hover:bg-primary-400 dark:border-gray-800 dark:bg-primary-400 dark:hover:bg-primary-300"
                                            title="Upload new photo"
                                            style={{
                                                backgroundColor: primaryColor,
                                            }}
                                        >
                                            <Camera size={20} />
                                            <input
                                                type="file"
                                                id="profile_image"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                ref={fileInputRef}
                                            />
                                        </label>
                                    )}
                                </div>

                                <h5 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                                    {user.first_name} {user.middle_name}{' '}
                                    {user.last_name}
                                </h5>
                                <p className="mb-4 text-sm text-gray-500 capitalize dark:text-gray-400">
                                    {user.user_type === 'employee'
                                        ? user.employee_role
                                        : user.user_type}
                                </p>

                                <div className="w-full max-w-xs space-y-3">
                                    {user.user_id_number && (
                                        <div className="text-center">
                                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                {user.user_id_number}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.user_type === 'student'
                                                    ? 'ID Number'
                                                    : 'Employee ID'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Form */}
                            <div className="lg:col-span-2">
                                <div className="mb-6 flex items-center justify-between">
                                    <h6 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                                        Personal Information
                                    </h6>

                                    {!isEditMode && (
                                        <button
                                            type="button"
                                            onClick={() => toggleEditMode(true)}
                                            className="flex items-center text-sm font-medium hover:underline"
                                            style={{ color: primaryColor }}
                                        >
                                            <Edit3 size={16} className="mr-1" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {/* First Name */}
                                    <div className="w-full">
                                        <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            First Name
                                        </label>
                                        {isEditMode ? (
                                            <Input
                                                type="text"
                                                value={data.first_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'first_name',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        ) : (
                                            <p className="border-b border-transparent py-2 text-base font-medium text-gray-900 dark:text-white">
                                                {user.first_name}
                                            </p>
                                        )}
                                        {errors.first_name && (
                                            <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                {errors.first_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Middle Name */}
                                    <div className="w-full">
                                        <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            Middle Name
                                        </label>
                                        {isEditMode ? (
                                            <Input
                                                type="text"
                                                value={data.middle_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'middle_name',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <p className="border-b border-transparent py-2 text-base font-medium text-gray-900 dark:text-white">
                                                {user.middle_name || '-'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="w-full">
                                        <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            Last Name
                                        </label>
                                        {isEditMode ? (
                                            <Input
                                                type="text"
                                                value={data.last_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'last_name',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        ) : (
                                            <p className="border-b border-transparent py-2 text-base font-medium text-gray-900 dark:text-white">
                                                {user.last_name}
                                            </p>
                                        )}
                                        {errors.last_name && (
                                            <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                {errors.last_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Suffix */}
                                    <div className="w-full">
                                        <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            Suffix
                                        </label>
                                        {isEditMode ? (
                                            <Input
                                                type="text"
                                                value={data.suffix}
                                                onChange={(e) =>
                                                    setData(
                                                        'suffix',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <p className="border-b border-transparent py-2 text-base font-medium text-gray-900 dark:text-white">
                                                {user.suffix || '-'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="w-full sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            Email Address
                                        </label>
                                        {isEditMode ? (
                                            <Input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        ) : (
                                            <p className="border-b border-transparent py-2 text-base font-medium text-gray-900 dark:text-white">
                                                {user.email}
                                            </p>
                                        )}
                                        {errors.email && (
                                            <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Security Section */}
                                    <div className="w-full border-t border-gray-100 pt-4 sm:col-span-2 dark:border-gray-700">
                                        <h6 className="mb-4 text-sm font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Security
                                        </h6>

                                        {isEditMode ? (
                                            <div className="space-y-4">
                                                {/* Current Password */}
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                        Current Password
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            type={
                                                                showCurrentPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            value={
                                                                data.current_password
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'current_password',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="pr-10"
                                                            placeholder="Leave blank to keep unchanged"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowCurrentPassword(
                                                                    !showCurrentPassword,
                                                                )
                                                            }
                                                            className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        >
                                                            {showCurrentPassword ? (
                                                                <EyeOff
                                                                    size={18}
                                                                />
                                                            ) : (
                                                                <Eye
                                                                    size={18}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {errors.current_password && (
                                                        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                            {
                                                                errors.current_password
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* New Password */}
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            type={
                                                                showNewPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            value={
                                                                data.new_password
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'new_password',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="pr-10"
                                                            placeholder="Leave blank to keep unchanged"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowNewPassword(
                                                                    !showNewPassword,
                                                                )
                                                            }
                                                            className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        >
                                                            {showNewPassword ? (
                                                                <EyeOff
                                                                    size={18}
                                                                />
                                                            ) : (
                                                                <Eye
                                                                    size={18}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {errors.new_password && (
                                                        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                            {
                                                                errors.new_password
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Confirm New Password */}
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                        Confirm New Password
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            type={
                                                                showConfirmPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            value={
                                                                data.new_password_confirmation
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'new_password_confirmation',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="pr-10"
                                                            placeholder="Confirm new password"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowConfirmPassword(
                                                                    !showConfirmPassword,
                                                                )
                                                            }
                                                            className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff
                                                                    size={18}
                                                                />
                                                            ) : (
                                                                <Eye
                                                                    size={18}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                                                    Password
                                                </label>
                                                <p className="text-xl font-bold tracking-widest text-gray-900 dark:text-white">
                                                    ••••••••
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div
                                    className={`mt-8 flex justify-end gap-3 ${!isEditMode ? 'hidden' : ''}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleEditMode(false)}
                                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 shadow-md hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white shadow-md focus:ring-4 focus:outline-none disabled:opacity-50"
                                        style={{
                                            backgroundColor: primaryColor,
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Two-Factor Authentication Card */}
                <div className="mx-auto max-w-5xl rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl sm:p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3">
                                <div
                                    className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900"
                                    style={{
                                        backgroundColor: `${primaryColor}20`,
                                    }}
                                >
                                    <ShieldCheck
                                        className="h-6 w-6"
                                        style={{ color: primaryColor }}
                                    />
                                </div>
                                <h6 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Two-Factor Authentication
                                </h6>
                            </div>

                            <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                Strengthen your account security by adding an
                                additional verification step. When enabled,
                                you'll need to enter a code from your
                                authentication app along with your password.
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                {user.two_factor_enabled ? (
                                    <>
                                        <div className="inline-flex items-center rounded-full bg-linear-to-r from-green-100 to-green-200 px-4 py-2 text-sm font-semibold text-green-800 shadow-sm dark:from-green-900 dark:to-green-800 dark:text-green-200">
                                            <CheckCircle2
                                                size={16}
                                                className="mr-2"
                                            />
                                            <span>Active & Protected</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <Lock size={14} className="mr-1" />
                                            <span>
                                                Activated on {user.updated_at}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="inline-flex items-center rounded-full bg-linear-to-r from-amber-100 to-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm dark:from-amber-900 dark:to-amber-800 dark:text-amber-200">
                                            <ShieldAlert
                                                size={16}
                                                className="mr-2"
                                            />
                                            <span>Not Configured</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <ShieldCheck
                                                size={14}
                                                className="mr-1"
                                            />
                                            <span>
                                                Recommended for enhanced
                                                security
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0">
                            {user.two_factor_enabled ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        openTwoFactorModal('disable')
                                    }
                                    className="group relative inline-flex items-center justify-center rounded-lg bg-linear-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:shadow-lg focus:ring-4 focus:ring-red-300 focus:outline-none"
                                >
                                    <ShieldAlert
                                        size={18}
                                        className="mr-2 transition-transform group-hover:scale-110"
                                    />
                                    <span>Disable 2FA</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openTwoFactorModal('enable')}
                                    className="group relative inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg focus:ring-4 focus:outline-none"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <ShieldCheck
                                        size={18}
                                        className="mr-2 transition-transform group-hover:scale-110"
                                    />
                                    <span>Enable 2FA</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {!user.two_factor_enabled && (
                        <div
                            className="mt-6 rounded-r-lg border-l-4 p-4"
                            style={{
                                backgroundColor: `${secondaryColor}10`,
                                borderColor: primaryColor,
                            }}
                        >
                            <div className="flex items-start">
                                <ShieldCheck
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: primaryColor }}
                                />
                                <div className="ml-3">
                                    <p
                                        className="text-sm font-medium"
                                        style={{ color: primaryColor }}
                                    >
                                        Security Tip
                                    </p>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        Enable 2FA to add an extra layer of
                                        protection to your account. You'll need
                                        an authenticator app like Google
                                        Authenticator or Microsoft
                                        Authenticator.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>

            {/* Two-Factor Authentication Modal */}
            {showTwoFactorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all duration-200">
                    <div className="relative w-full max-w-md animate-in rounded-lg bg-white shadow-xl duration-200 fade-in zoom-in dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {twoFactorAction === 'enable'
                                    ? 'Enable 2FA'
                                    : 'Disable 2FA'}
                            </h3>
                            <button
                                onClick={() => setShowTwoFactorModal(false)}
                                className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleTwoFactorAction}>
                            <div className="space-y-4 p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Please enter your password to{' '}
                                    {twoFactorAction === 'enable'
                                        ? 'enable'
                                        : 'disable'}{' '}
                                    two-factor authentication.
                                </p>

                                <div className="group relative z-0 w-full">
                                    <input
                                        type={
                                            showModalPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={twoFactorForm.data.password}
                                        onChange={(e) =>
                                            twoFactorForm.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 pr-10 text-sm text-gray-900 focus:border-primary-400 focus:ring-0 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-primary-500"
                                        placeholder=" "
                                        autoFocus
                                        required
                                    />
                                    <label className="absolute top-3 -z-10 origin-left -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium dark:text-gray-400">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowModalPassword(
                                                !showModalPassword,
                                            )
                                        }
                                        className="absolute top-2.5 right-0 text-gray-500 hover:text-gray-700"
                                    >
                                        {showModalPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>

                                {twoFactorForm.errors.password && (
                                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-gray-900 dark:text-red-400">
                                        {twoFactorForm.errors.password}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 border-t p-4 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={twoFactorForm.processing}
                                    className={`flex-1 rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white shadow-md disabled:opacity-50 ${
                                        twoFactorAction === 'disable'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : ''
                                    }`}
                                    style={
                                        twoFactorAction === 'enable'
                                            ? { backgroundColor: primaryColor }
                                            : {}
                                    }
                                >
                                    {twoFactorAction === 'enable'
                                        ? 'Enable 2FA'
                                        : 'Disable 2FA'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowTwoFactorModal(false)}
                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
