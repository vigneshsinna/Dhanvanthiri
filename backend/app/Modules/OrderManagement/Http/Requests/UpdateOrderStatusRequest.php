<?php

namespace App\Modules\OrderManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'status' => 'required|in:pending_payment,paid,payment_failed,processing,shipped,delivered,completed,cancelled,refunded,partially_refunded', 'note' => 'nullable|string|max:255' ];
    }
}

