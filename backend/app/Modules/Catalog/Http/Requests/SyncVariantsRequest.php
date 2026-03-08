<?php

namespace App\Modules\Catalog\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncVariantsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'variants' => 'required|array|min:1', 'variants.*.sku' => 'required|string|max:100', 'variants.*.price' => 'nullable|numeric|min:0', 'variants.*.stock_quantity' => 'required|integer|min:0', 'variants.*.option_values' => 'required|array|min:1' ];
    }
}

