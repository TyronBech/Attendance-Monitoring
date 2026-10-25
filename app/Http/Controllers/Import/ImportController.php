<?php

namespace App\Http\Controllers\Import;

use App\Http\Controllers\Controller;
use App\Models\EmployeeDetail;
use App\Models\ImportProgress;
use App\Models\StudentDetail;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportController extends Controller
{
    /**
     * Display the student import page.
     */
    public function studentsIndex(): Response
    {
        return Inertia::render('import/students');
    }

    /**
     * Display the employee import page.
     */
    public function employeesIndex(): Response
    {
        return Inertia::render('import/employees');
    }

    /**
     * Download the student import Excel template.
     */
    public function downloadStudentTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;

        // ── Instructions Sheet ──
        $instructionSheet = $spreadsheet->getActiveSheet();
        $instructionSheet->setTitle('Instructions');
        $this->buildInstructionSheet($instructionSheet, 'Student');

        // ── Data Sheet ──
        $dataSheet = $spreadsheet->createSheet();
        $dataSheet->setTitle('Student Data');

        $headers = [
            'A1' => 'First Name *',
            'B1' => 'Middle Name',
            'C1' => 'Last Name *',
            'D1' => 'Suffix',
            'E1' => 'Gender *',
            'F1' => 'Email *',
            'G1' => 'RFID',
            'H1' => 'Student ID *',
            'I1' => 'Grade Level',
            'J1' => 'Section',
        ];

        $this->applyHeaderStyles($dataSheet, $headers);
        $this->setColumnWidths($dataSheet, [
            'A' => 20, 'B' => 20, 'C' => 20, 'D' => 10,
            'E' => 12, 'F' => 30, 'G' => 18, 'H' => 18,
            'I' => 18, 'J' => 20,
        ]);

        // Add sample data row
        $dataSheet->setCellValue('A2', 'Juan');
        $dataSheet->setCellValue('B2', 'Dela');
        $dataSheet->setCellValue('C2', 'Cruz');
        $dataSheet->setCellValue('D2', '');
        $dataSheet->setCellValue('E2', 'Male');
        $dataSheet->setCellValue('F2', 'juan.delacruz@example.com');
        $dataSheet->setCellValue('G2', '');
        $dataSheet->setCellValue('H2', 'STU-2026-001');
        $dataSheet->setCellValue('I2', 'Grade 10');
        $dataSheet->setCellValue('J2', 'Section A');

        // Style sample row as italic hint
        $dataSheet->getStyle('A2:J2')->getFont()->setItalic(true)->setColor(new Color('FF808080'));

        $dataSheet->setSelectedCell('A3');
        $spreadsheet->setActiveSheetIndex(1);

        return $this->streamExcelDownload($spreadsheet, 'Student_Import_Template.xlsx');
    }

    /**
     * Download the employee import Excel template.
     */
    public function downloadEmployeeTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;

        // ── Instructions Sheet ──
        $instructionSheet = $spreadsheet->getActiveSheet();
        $instructionSheet->setTitle('Instructions');
        $this->buildInstructionSheet($instructionSheet, 'Employee');

        // ── Data Sheet ──
        $dataSheet = $spreadsheet->createSheet();
        $dataSheet->setTitle('Employee Data');

        $headers = [
            'A1' => 'First Name *',
            'B1' => 'Middle Name',
            'C1' => 'Last Name *',
            'D1' => 'Suffix',
            'E1' => 'Gender *',
            'F1' => 'Email *',
            'G1' => 'RFID',
            'H1' => 'Employee ID *',
            'I1' => 'Role',
        ];

        $this->applyHeaderStyles($dataSheet, $headers);
        $this->setColumnWidths($dataSheet, [
            'A' => 20, 'B' => 20, 'C' => 20, 'D' => 10,
            'E' => 12, 'F' => 30, 'G' => 18, 'H' => 18,
            'I' => 25,
        ]);

        // Add sample data row
        $dataSheet->setCellValue('A2', 'Maria');
        $dataSheet->setCellValue('B2', 'Santos');
        $dataSheet->setCellValue('C2', 'Reyes');
        $dataSheet->setCellValue('D2', '');
        $dataSheet->setCellValue('E2', 'Female');
        $dataSheet->setCellValue('F2', 'maria.reyes@example.com');
        $dataSheet->setCellValue('G2', '');
        $dataSheet->setCellValue('H2', 'EMP-2026-001');
        $dataSheet->setCellValue('I2', 'Teacher');

        $dataSheet->getStyle('A2:I2')->getFont()->setItalic(true)->setColor(new Color('FF808080'));

        $dataSheet->setSelectedCell('A3');
        $spreadsheet->setActiveSheetIndex(1);

        return $this->streamExcelDownload($spreadsheet, 'Employee_Import_Template.xlsx');
    }

    /**
     * Parse an uploaded Excel file and return preview data for students.
     */
    public function previewStudents(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        return $this->parseExcelPreview($request->file('file'), 'students');
    }

    /**
     * Parse an uploaded Excel file and return preview data for employees.
     */
    public function previewEmployees(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ]);

        return $this->parseExcelPreview($request->file('file'), 'employees');
    }

    /**
     * Execute the student bulk import with validation and transaction.
     */
    public function importStudents(Request $request): JsonResponse
    {
        $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.first_name' => ['required', 'string', 'max:100'],
            'rows.*.middle_name' => ['nullable', 'string', 'max:100'],
            'rows.*.last_name' => ['required', 'string', 'max:100'],
            'rows.*.suffix' => ['nullable', 'string', 'max:10'],
            'rows.*.gender' => ['required', Rule::in(['Male', 'Female'])],
            'rows.*.email' => ['required', 'email', 'max:255'],
            'rows.*.rfid' => ['nullable', 'string', 'max:20'],
            'rows.*.student_id' => ['required', 'string', 'max:20'],
            'rows.*.grade_level' => ['nullable', 'string', 'max:50'],
            'rows.*.section' => ['nullable', 'string', 'max:100'],
        ]);

        return $this->executeImport($request->input('rows'), 'students');
    }

    /**
     * Execute the employee bulk import with validation and transaction.
     */
    public function importEmployees(Request $request): JsonResponse
    {
        $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.first_name' => ['required', 'string', 'max:100'],
            'rows.*.middle_name' => ['nullable', 'string', 'max:100'],
            'rows.*.last_name' => ['required', 'string', 'max:100'],
            'rows.*.suffix' => ['nullable', 'string', 'max:10'],
            'rows.*.gender' => ['required', Rule::in(['Male', 'Female'])],
            'rows.*.email' => ['required', 'email', 'max:255'],
            'rows.*.rfid' => ['nullable', 'string', 'max:20'],
            'rows.*.employee_id' => ['required', 'string', 'max:50'],
            'rows.*.role' => ['nullable', 'string', 'max:45'],
        ]);

        return $this->executeImport($request->input('rows'), 'employees');
    }

    // ──────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────

    /**
     * Parse uploaded Excel into structured preview data.
     *
     * @param  UploadedFile  $file
     */
    private function parseExcelPreview($file, string $type): JsonResponse
    {
        $spreadsheet = IOFactory::load($file->getPathname());

        // Try to find the data sheet (second sheet, or first with "Data" in its name)
        $dataSheet = null;
        foreach ($spreadsheet->getAllSheets() as $sheet) {
            if (str_contains(strtolower($sheet->getTitle()), 'data')) {
                $dataSheet = $sheet;
                break;
            }
        }

        if (! $dataSheet && $spreadsheet->getSheetCount() > 1) {
            $dataSheet = $spreadsheet->getSheet(1);
        }

        if (! $dataSheet) {
            $dataSheet = $spreadsheet->getActiveSheet();
        }

        $highestRow = $dataSheet->getHighestRow();
        $highestColumn = $dataSheet->getHighestColumn();

        $rows = [];
        $errors = [];

        // Start at row 2 (skip header); skip sample row if it matches example email
        for ($rowIdx = 2; $rowIdx <= $highestRow; $rowIdx++) {
            $emailCell = trim((string) $dataSheet->getCell('F'.$rowIdx)->getValue());

            // Skip completely empty rows
            $firstName = trim((string) $dataSheet->getCell('A'.$rowIdx)->getValue());
            if ($firstName === '' && $emailCell === '') {
                continue;
            }

            // Skip the sample/example row
            if (str_contains($emailCell, '@example.com')) {
                continue;
            }

            $rowData = $this->extractRowData($dataSheet, $rowIdx, $type);
            $rowErrors = $this->validateRow($rowData, $type, $rowIdx);

            $rows[] = $rowData;
            if (count($rowErrors) > 0) {
                $errors[] = ['row' => count($rows), 'errors' => $rowErrors];
            }
        }

        if (count($rows) === 0) {
            return response()->json([
                'data' => [],
                'errors' => [],
                'message' => 'No data rows found in the uploaded file.',
            ], 422);
        }

        return response()->json([
            'data' => $rows,
            'errors' => $errors,
        ]);
    }

    /**
     * Extract a single row from the data sheet into an associative array.
     *
     * @param  Worksheet  $sheet
     * @return array<string, string|null>
     */
    private function extractRowData($sheet, int $rowIdx, string $type): array
    {
        $base = [
            'first_name' => trim((string) $sheet->getCell('A'.$rowIdx)->getValue()),
            'middle_name' => trim((string) $sheet->getCell('B'.$rowIdx)->getValue()) ?: null,
            'last_name' => trim((string) $sheet->getCell('C'.$rowIdx)->getValue()),
            'suffix' => trim((string) $sheet->getCell('D'.$rowIdx)->getValue()) ?: null,
            'gender' => trim((string) $sheet->getCell('E'.$rowIdx)->getValue()),
            'email' => strtolower(trim((string) $sheet->getCell('F'.$rowIdx)->getValue())),
            'rfid' => trim((string) $sheet->getCell('G'.$rowIdx)->getValue()) ?: null,
        ];

        if ($type === 'students') {
            $base['student_id'] = trim((string) $sheet->getCell('H'.$rowIdx)->getValue());
            $base['grade_level'] = trim((string) $sheet->getCell('I'.$rowIdx)->getValue()) ?: null;
            $base['section'] = trim((string) $sheet->getCell('J'.$rowIdx)->getValue()) ?: null;
        } else {
            $base['employee_id'] = trim((string) $sheet->getCell('H'.$rowIdx)->getValue());
            $base['role'] = trim((string) $sheet->getCell('I'.$rowIdx)->getValue()) ?: null;
        }

        return $base;
    }

    /**
     * Validate a single row of import data and return error messages.
     *
     * @param  array<string, string|null>  $row
     * @return array<string, string[]>
     */
    private function validateRow(array $row, string $type, int $rowIdx): array
    {
        $rules = [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'gender' => ['required', Rule::in(['Male', 'Female'])],
            'email' => ['required', 'email', 'max:255'],
        ];

        if ($type === 'students') {
            $rules['student_id'] = ['required', 'string', 'max:20'];
        } else {
            $rules['employee_id'] = ['required', 'string', 'max:50'];
        }

        $validator = Validator::make($row, $rules);

        if ($validator->fails()) {
            return $validator->errors()->toArray();
        }

        return [];
    }

    /**
     * Execute import inside a database transaction.
     * Processes in chunks for memory efficiency.
     * On any row failure, the entire batch rolls back.
     *
     * @param  array<int, array<string, string|null>>  $rows
     */
    private function executeImport(array $rows, string $type): JsonResponse
    {
        $importProgress = ImportProgress::create([
            'type' => $type,
            'status' => 'processing',
            'initiated_by' => auth()->user()?->id,
            'total_rows' => count($rows),
        ]);

        $newCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        try {
            DB::transaction(function () use ($rows, $type, &$newCount, &$updatedCount, &$skippedCount, $importProgress) {
                $privilegeType = $type === 'students' ? 'Student' : 'Employee';
                $privilege = UserGroup::where('user_type', $privilegeType)->first();

                // Process in chunks of 50 for memory efficiency
                $chunks = array_chunk($rows, 50);

                foreach ($chunks as $chunk) {
                    foreach ($chunk as $row) {
                        $result = $this->upsertUser($row, $type, $privilege);

                        match ($result) {
                            'created' => $newCount++,
                            'updated' => $updatedCount++,
                            'skipped' => $skippedCount++,
                        };
                    }

                    // Update progress after each chunk
                    $importProgress->update([
                        'processed_rows' => $newCount + $updatedCount + $skippedCount,
                        'new_count' => $newCount,
                        'updated_count' => $updatedCount,
                    ]);
                }
            });

            $importProgress->update([
                'status' => 'completed',
                'processed_rows' => $newCount + $updatedCount + $skippedCount,
                'new_count' => $newCount,
                'updated_count' => $updatedCount,
            ]);

            return response()->json([
                'message' => 'Import completed successfully.',
                'new_count' => $newCount,
                'updated_count' => $updatedCount,
                'skipped_count' => $skippedCount,
                'total' => count($rows),
            ]);

        } catch (\Throwable $e) {
            $importProgress->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Import failed. All changes have been rolled back.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create or update a single user and its detail record.
     * Returns 'created', 'updated', or 'skipped'.
     */
    private function upsertUser(array $row, string $type, ?UserGroup $privilege): string
    {
        $email = strtolower(trim($row['email']));
        $existingUser = User::withTrashed()->where('email', $email)->first();

        $userData = [
            'first_name' => $row['first_name'],
            'middle_name' => $row['middle_name'] ?? null,
            'last_name' => $row['last_name'],
            'suffix' => $row['suffix'] ?? null,
            'gender' => $row['gender'],
            'rfid' => $row['rfid'] ?? null,
            'privilege_id' => $privilege?->id,
        ];

        if ($existingUser) {
            // Restore soft-deleted user if applicable
            if ($existingUser->trashed()) {
                $existingUser->restore();
            }

            // Check if any user fields changed
            $hasChanges = false;
            foreach ($userData as $field => $value) {
                if ($existingUser->{$field} !== $value) {
                    $hasChanges = true;
                    break;
                }
            }

            // Check detail fields too
            $detailChanged = $this->hasDetailChanges($existingUser, $row, $type);

            if (! $hasChanges && ! $detailChanged) {
                return 'skipped';
            }

            $existingUser->update($userData);
            $this->upsertDetail($existingUser, $row, $type);

            return 'updated';
        }

        // Create new user with a random password
        $userData['email'] = $email;
        $userData['password'] = Hash::make(bin2hex(random_bytes(16)));

        $user = User::create($userData);
        $this->upsertDetail($user, $row, $type);

        return 'created';
    }

    /**
     * Check if the detail-specific fields have changed for an existing user.
     */
    private function hasDetailChanges(User $user, array $row, string $type): bool
    {
        if ($type === 'students') {
            $detail = $user->students;
            if (! $detail) {
                return true;
            }

            return $detail->id_number !== ($row['student_id'] ?? null)
                || $detail->level !== ($row['grade_level'] ?? null)
                || $detail->section !== ($row['section'] ?? null);
        }

        $detail = $user->employees;
        if (! $detail) {
            return true;
        }

        return $detail->employee_id !== ($row['employee_id'] ?? null)
            || $detail->employee_role !== ($row['role'] ?? null);
    }

    /**
     * Create or update the type-specific detail record for a user.
     */
    private function upsertDetail(User $user, array $row, string $type): void
    {
        if ($type === 'students') {
            StudentDetail::withTrashed()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'id_number' => $row['student_id'],
                    'level' => $row['grade_level'] ?? null,
                    'section' => $row['section'] ?? null,
                    'deleted_at' => null,
                ]
            );
        } else {
            EmployeeDetail::withTrashed()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_id' => $row['employee_id'],
                    'employee_role' => $row['role'] ?? null,
                    'deleted_at' => null,
                ]
            );
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Excel template helpers
    // ──────────────────────────────────────────────────────────────

    /**
     * Build the instructions sheet for the template.
     *
     * @param  Worksheet  $sheet
     */
    private function buildInstructionSheet($sheet, string $type): void
    {
        $sheet->setCellValue('A1', "{$type} Import Template — Instructions");
        $sheet->mergeCells('A1:D1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->setColor(new Color('FF1E3A5F'));
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $instructions = [
            ['Step 1:', "Go to the \"{$type} Data\" sheet tab at the bottom."],
            ['Step 2:', 'Fill in user information starting at row 3 (row 2 is an example).'],
            ['Step 3:', 'Fields marked with * are required.'],
            ['Step 4:', 'Gender must be exactly "Male" or "Female".'],
            ['Step 5:', 'Email must be a valid email address and unique per user.'],
            ['Step 6:', 'RFID is optional — leave blank if not applicable.'],
            ['Step 7:', 'Save the file and upload it back on the import page.'],
            ['', ''],
            ['Note:', 'If a user with the same email already exists, their information will be updated.'],
            ['Note:', 'New users will receive a random password. They must use "Forgot Password" to set their own.'],
        ];

        if ($type === 'Student') {
            $instructions[] = ['Note:', 'Student ID, Grade Level, and Section are specific to student records.'];
        } else {
            $instructions[] = ['Note:', 'Employee ID and Role are specific to employee records.'];
        }

        $rowIdx = 3;
        foreach ($instructions as $line) {
            $sheet->setCellValue("A{$rowIdx}", $line[0]);
            $sheet->setCellValue("B{$rowIdx}", $line[1]);
            $sheet->getStyle("A{$rowIdx}")->getFont()->setBold(true)->setColor(new Color('FF1E3A5F'));
            $sheet->getStyle("B{$rowIdx}")->getFont()->setColor(new Color('FF333333'));
            $rowIdx++;
        }

        $sheet->getColumnDimension('A')->setWidth(15);
        $sheet->getColumnDimension('B')->setWidth(80);

        // Highlight the header area
        $sheet->getStyle('A1:D1')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE8F0FE');

        // Protect the instruction sheet from accidental edits
        $sheet->getProtection()->setSheet(true);
        $sheet->getProtection()->setPassword('import');
    }

    /**
     * Apply styled header cells to the data sheet.
     *
     * @param  Worksheet  $sheet
     * @param  array<string, string>  $headers
     */
    private function applyHeaderStyles($sheet, array $headers): void
    {
        foreach ($headers as $cell => $label) {
            $sheet->setCellValue($cell, $label);
        }

        $lastColumn = array_key_last($headers);
        $columnLetter = preg_replace('/[0-9]/', '', $lastColumn);
        $headerRange = "A1:{$columnLetter}1";

        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF1E3A5F'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FF999999'],
                ],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(28);
        $sheet->freezePane('A2');
        $sheet->setAutoFilter($headerRange);
    }

    /**
     * Set column widths on a worksheet.
     *
     * @param  Worksheet  $sheet
     * @param  array<string, int>  $widths
     */
    private function setColumnWidths($sheet, array $widths): void
    {
        foreach ($widths as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    /**
     * Stream an Excel spreadsheet as an HTTP download.
     */
    private function streamExcelDownload(Spreadsheet $spreadsheet, string $filename): StreamedResponse
    {
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
