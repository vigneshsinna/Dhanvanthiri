<?php

namespace App\Modules\Catalog\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'name' => 'sometimes|string|max:200', 'category_id' => 'sometimes|exists:categories,id', 'price' => 'sometimes|numeric|min:0', 'status' => 'sometimes|in:draft,active,archived', 'tags' => 'array', 'tags.*' => 'string|max:50' ];
    }
}

