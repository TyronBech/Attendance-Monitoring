<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserMaintenanceIndexRequest extends FormRequest
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
        $sorts = ['newest', 'oldest'];

        if ($this->input('user_type', 'Student') === 'Student') {
            $sorts[] = 'grade_level';
        } elseif ($this->input('user_type') === 'Employee') {
            $sorts[] = 'role';
        }

        return [
            'user_type' => ['sometimes', Rule::in(['Student', 'Employee', 'Visitor'])],
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['sometimes', Rule::in($sorts)],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
