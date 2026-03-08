<?php

namespace App\Modules\OrderManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'carrier' => 'required|string|max:100', 'tracking_number' => 'required|string|max:100', 'tracking_url' => 'nullable|url|max:255', 'estimated_delivery_at' => 'nullable|date' ];
    }
}

