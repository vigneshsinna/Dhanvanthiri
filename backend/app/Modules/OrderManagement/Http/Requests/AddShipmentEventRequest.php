<?php

namespace App\Modules\OrderManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddShipmentEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'status' => 'required|string|max:100', 'location' => 'nullable|string|max:200', 'description' => 'required|string', 'occurred_at' => 'required|date' ];
    }
}

