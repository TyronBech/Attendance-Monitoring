<?php

namespace App\Http\Requests;

use App\Models\EmployeeDetail;
use App\Models\StudentDetail;
use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserMaintenanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->route('user');
        $type = $this->input('user_type');
        $types = $user instanceof User ? [$user->privileges?->user_type] : ['Student', 'Employee', 'Visitor'];

        return [
            'user_type' => ['required', Rule::in($types)],
            'privilege_id' => [
                'required', 'integer',
                Rule::exists(UserGroup::class, 'id')->where('user_type', is_string($type) ? $type : '')->whereNull('deleted_at'),
            ],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:10'],
            'gender' => ['required', Rule::in(['Male', 'Female'])],
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class, 'email')->ignore($user)],
            'rfid' => ['nullable', 'string', 'max:20', Rule::unique(User::class, 'rfid')->ignore($user)],
            'profile_image' => [
                'bail', 'nullable', Rule::prohibitedIf($this->boolean('remove_profile_image')),
                'image', 'mimetypes:image/jpeg,image/png,image/webp', 'extensions:jpg,jpeg,png,webp', 'max:2048',
                Rule::dimensions()->maxWidth(4096)->maxHeight(4096),
            ],
            'remove_profile_image' => ['sometimes', 'boolean'],
            'student_id' => [
                'exclude_unless:user_type,Student', 'required', 'string', 'max:20',
                Rule::unique(StudentDetail::class, 'id_number')->ignore($user?->students?->id),
            ],
            'grade_level' => ['exclude_unless:user_type,Student', 'nullable', 'string', 'max:50'],
            'section' => ['exclude_unless:user_type,Student', 'nullable', 'string', 'max:100'],
            'employee_id' => [
                'exclude_unless:user_type,Employee', 'required', 'string', 'max:50',
                Rule::unique(EmployeeDetail::class, 'employee_id')->ignore($user?->employees?->id),
            ],
            'employee_role' => ['exclude_unless:user_type,Employee', 'nullable', 'string', 'max:45'],
            'school_org' => ['exclude_unless:user_type,Visitor', 'required', 'string', 'max:100'],
            'purpose' => ['exclude_unless:user_type,Visitor', 'required', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['privilege_id' => 'category', 'rfid' => 'RFID', 'student_id' => 'student ID', 'employee_id' => 'employee ID', 'school_org' => 'school or organization'];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'profile_image.image' => 'The profile photo must be a valid image.',
            'profile_image.mimetypes' => 'Choose a JPEG, PNG, or WebP profile photo.',
            'profile_image.extensions' => 'The profile photo must have a .jpg, .jpeg, .png, or .webp extension.',
            'profile_image.max' => 'The profile photo must not exceed 2 MB.',
            'profile_image.dimensions' => 'The profile photo must be at most 4096 × 4096 pixels.',
            'profile_image.prohibited' => 'Choose either uploading or removing the profile photo.',
        ];
    }
}
