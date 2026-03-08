<?php

namespace App\Modules\Catalog\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'rating' => 'required|integer|min:1|max:5', 'title' => 'nullable|string|max:100', 'body' => 'required|string' ];
    }
}

