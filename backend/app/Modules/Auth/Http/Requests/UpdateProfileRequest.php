<?php

namespace App\Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'name' => 'required|string|max:100', 'email' => 'required|email', 'phone' => 'nullable|string|max:20' ];
    }
}

