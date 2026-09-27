import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    Edit3,
    FileSpreadsheet,
    Loader2,
    Save,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface EmployeeRow {
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    gender: string;
    email: string;
    rfid: string | null;
    employee_id: string;
    role: string | null;
}

interface RowError {
    row: number;
    errors: Record<string, string[]>;
}

interface ImportResult {
    message: string;
    new_count: number;
    updated_count: number;
    skipped_count: number;
    total: number;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'result';

export default function ImportEmployees() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<ImportStep>('upload');
    const [rows, setRows] = useState<EmployeeRow[]>([]);
    const [errors, setErrors] = useState<RowError[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<EmployeeRow | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = useCallback(async (file: File) => {
        if (!file) return;

        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];

        if (
            !allowedTypes.includes(file.type) &&
            !file.name.endsWith('.xlsx') &&
            !file.name.endsWith('.xls')
        ) {
            setImportError('Please upload a valid Excel file (.xlsx or .xls)');
            return;
        }

        setIsUploading(true);
        setImportError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/import/employees/preview', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN':
                        document.querySelector<HTMLMetaElement>(
                            'meta[name="csrf-token"]',
                        )?.content ?? '',
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setImportError(
                    data.message ?? 'Failed to parse the uploaded file.',
                );
                return;
            }

            setRows(data.data);
            setErrors(data.errors ?? []);
            setStep('preview');
        } catch {
            setImportError(
                'An error occurred while uploading the file. Please try again.',
            );
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
        },
        [handleFileUpload],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragActive(false);
    }, []);

    const handleImport = useCallback(async () => {
        setIsImporting(true);
        setImportError(null);
        setStep('importing');

        try {
            const response = await fetch('/import/employees/execute', {
                method: 'POST',
                body: JSON.stringify({ rows }),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector<HTMLMetaElement>(
                            'meta[name="csrf-token"]',
                        )?.content ?? '',
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setImportError(data.message ?? 'Import failed.');
                setStep('preview');
                return;
            }

            setImportResult(data);
            setStep('result');
        } catch {
            setImportError(
                'An error occurred during import. All changes have been rolled back.',
            );
            setStep('preview');
        } finally {
            setIsImporting(false);
        }
    }, [rows]);

    const startEdit = (index: number) => {
        setEditingRow(index);
        setEditForm({ ...rows[index] });
    };

    const saveEdit = () => {
        if (editingRow === null || !editForm) return;
        const updated = [...rows];
        updated[editingRow] = editForm;
        setRows(updated);
        setEditingRow(null);
        setEditForm(null);

        revalidateRows(updated);
    };

    const deleteRow = (index: number) => {
        const updated = rows.filter((_, i) => i !== index);
        setRows(updated);
        revalidateRows(updated);
    };

    const revalidateRows = (updatedRows: EmployeeRow[]) => {
        const newErrors: RowError[] = [];
        updatedRows.forEach((row, idx) => {
            const rowErrors: Record<string, string[]> = {};
            if (!row.first_name?.trim())
                rowErrors['first_name'] = ['First name is required'];
            if (!row.last_name?.trim())
                rowErrors['last_name'] = ['Last name is required'];
            if (!row.email?.trim()) rowErrors['email'] = ['Email is required'];
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
                rowErrors['email'] = ['Invalid email format'];
            if (!row.gender || !['Male', 'Female'].includes(row.gender))
                rowErrors['gender'] = ['Must be Male or Female'];
            if (!row.employee_id?.trim())
                rowErrors['employee_id'] = ['Employee ID is required'];
            if (Object.keys(rowErrors).length > 0)
                newErrors.push({ row: idx + 1, errors: rowErrors });
        });
        setErrors(newErrors);
    };

    const hasRowError = (index: number): boolean => {
        return errors.some((e) => e.row === index + 1);
    };

    const hasValidationErrors = errors.length > 0;

    const resetImport = () => {
        setStep('upload');
        setRows([]);
        setErrors([]);
        setImportResult(null);
        setImportError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            <Head title="Import Employees" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Import Employees
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Bulk import employee records from an Excel
                                spreadsheet
                            </p>
                        </div>
                        <a
                            href="/import/employees/template"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
                        >
                            <Download className="h-4 w-4" />
                            Download Template
                        </a>
                    </div>
                </div>

                {/* Step Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2">
                        {(['upload', 'preview', 'result'] as const).map(
                            (s, i) => (
                                <div
                                    key={s}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                            step === s ||
                                            (step === 'importing' &&
                                                s === 'preview')
                                                ? 'bg-primary-600 text-white'
                                                : step === 'result' ||
                                                    (s === 'upload' &&
                                                        step !== 'upload')
                                                  ? 'bg-green-500 text-white'
                                                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                        }`}
                                    >
                                        {step === 'result' ||
                                        (s === 'upload' &&
                                            step !== 'upload') ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    <span className="hidden text-sm font-medium text-gray-600 sm:inline dark:text-gray-300">
                                        {s === 'upload'
                                            ? 'Upload'
                                            : s === 'preview'
                                              ? 'Preview & Edit'
                                              : 'Complete'}
                                    </span>
                                    {i < 2 && (
                                        <div className="mx-2 h-px w-12 bg-gray-300 dark:bg-gray-600" />
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                {importError && (
                    <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                {importError}
                            </p>
                        </div>
                        <button
                            onClick={() => setImportError(null)}
                            className="ml-auto"
                        >
                            <X className="h-4 w-4 text-red-400" />
                        </button>
                    </div>
                )}

                {/* Upload Step */}
                {step === 'upload' && (
                    <div
                        className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                            dragActive
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-300 bg-white hover:border-primary-400 dark:border-gray-600 dark:bg-gray-800'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <FileSpreadsheet className="mx-auto h-16 w-16 text-primary-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                            {isUploading
                                ? 'Processing file...'
                                : 'Upload your Excel file'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Drag and drop your filled template here, or click to
                            browse
                        </p>
                        <div className="mt-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file);
                                }}
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="gap-2"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                {isUploading ? 'Processing...' : 'Choose File'}
                            </Button>
                        </div>
                        <p className="mt-4 text-xs text-gray-400">
                            Supported formats: .xlsx, .xls (max 10MB)
                        </p>
                    </div>
                )}

                {/* Preview Step */}
                {(step === 'preview' || step === 'importing') && (
                    <div className="space-y-6">
                        {/* Summary Bar */}
                        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-primary-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {rows.length} row
                                    {rows.length !== 1 ? 's' : ''} found
                                </span>
                            </div>
                            {hasValidationErrors && (
                                <Badge variant="destructive" className="gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.length} row
                                    {errors.length !== 1 ? 's' : ''} with errors
                                </Badge>
                            )}
                            <div className="ml-auto flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetImport}
                                    disabled={isImporting}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleImport}
                                    disabled={
                                        isImporting ||
                                        hasValidationErrors ||
                                        rows.length === 0
                                    }
                                    className="gap-2"
                                >
                                    {isImporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4" />
                                    )}
                                    {isImporting
                                        ? 'Importing...'
                                        : 'Import All'}
                                </Button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            #
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            First Name
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Middle Name
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Last Name
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Gender
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Email
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Employee ID
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Role
                                        </th>
                                        <th className="px-3 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {rows.map((row, index) => {
                                        const rowHasError = hasRowError(index);
                                        return (
                                            <tr
                                                key={index}
                                                className={`transition-colors ${
                                                    rowHasError
                                                        ? 'bg-red-50 dark:bg-red-900/10'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500">
                                                    {index + 1}
                                                    {rowHasError && (
                                                        <AlertCircle className="ml-1 inline h-4 w-4 text-red-500" />
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">
                                                    {row.first_name}
                                                </td>
                                                <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    {row.middle_name ?? '—'}
                                                </td>
                                                <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">
                                                    {row.last_name}
                                                </td>
                                                <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    {row.gender}
                                                </td>
                                                <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">
                                                    {row.email}
                                                </td>
                                                <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    {row.employee_id}
                                                </td>
                                                <td className="px-3 py-3 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    {row.role ?? '—'}
                                                </td>
                                                <td className="px-3 py-3 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() =>
                                                                startEdit(index)
                                                            }
                                                            className="rounded p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30"
                                                            title="Edit row"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                deleteRow(index)
                                                            }
                                                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                                                            title="Remove row"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {hasValidationErrors && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Validation Errors — Please fix before
                                    importing
                                </h4>
                                <ul className="mt-2 space-y-1">
                                    {errors.map((e) => (
                                        <li
                                            key={e.row}
                                            className="text-sm text-amber-700 dark:text-amber-400"
                                        >
                                            <strong>Row {e.row}:</strong>{' '}
                                            {Object.entries(e.errors)
                                                .map(
                                                    ([field, msgs]) =>
                                                        `${field}: ${(msgs as string[]).join(', ')}`,
                                                )
                                                .join(' | ')}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Result Step */}
                {step === 'result' && importResult && (
                    <div className="rounded-xl bg-white p-8 text-center shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                            Import Successful!
                        </h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {importResult.message}
                        </p>
                        <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-4">
                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                <p className="text-2xl font-bold text-green-600">
                                    {importResult.new_count}
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-400">
                                    Created
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <p className="text-2xl font-bold text-blue-600">
                                    {importResult.updated_count}
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    Updated
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                                    {importResult.skipped_count}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Skipped
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center gap-4">
                            <Button variant="outline" onClick={resetImport}>
                                Import More
                            </Button>
                            <Button onClick={() => router.visit('/dashboard')}>
                                Go to Dashboard
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog
                open={editingRow !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingRow(null);
                        setEditForm(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Edit Row {editingRow !== null ? editingRow + 1 : ''}
                        </DialogTitle>
                        <DialogDescription>
                            Update the employee information below
                        </DialogDescription>
                    </DialogHeader>
                    {editForm && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-first-name">
                                        First Name *
                                    </Label>
                                    <Input
                                        id="edit-first-name"
                                        value={editForm.first_name}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                first_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-middle-name">
                                        Middle Name
                                    </Label>
                                    <Input
                                        id="edit-middle-name"
                                        value={editForm.middle_name ?? ''}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                middle_name:
                                                    e.target.value || null,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-last-name">
                                        Last Name *
                                    </Label>
                                    <Input
                                        id="edit-last-name"
                                        value={editForm.last_name}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                last_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-suffix">Suffix</Label>
                                    <Input
                                        id="edit-suffix"
                                        value={editForm.suffix ?? ''}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                suffix: e.target.value || null,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-gender">
                                        Gender *
                                    </Label>
                                    <Select
                                        value={editForm.gender}
                                        onValueChange={(val) =>
                                            setEditForm({
                                                ...editForm,
                                                gender: val,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="edit-gender">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="Female">
                                                Female
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="edit-email">Email *</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-rfid">RFID</Label>
                                    <Input
                                        id="edit-rfid"
                                        value={editForm.rfid ?? ''}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                rfid: e.target.value || null,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-employee-id">
                                        Employee ID *
                                    </Label>
                                    <Input
                                        id="edit-employee-id"
                                        value={editForm.employee_id}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                employee_id: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Input
                                    id="edit-role"
                                    value={editForm.role ?? ''}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            role: e.target.value || null,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditingRow(null);
                                setEditForm(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={saveEdit} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
