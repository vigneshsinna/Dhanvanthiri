<?php

namespace App\Modules\Payment\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'order_id' => 'required|exists:orders,id', 'gateway_payment_id' => 'required|string|max:200', 'gateway_order_id' => 'required|string|max:200', 'signature' => 'required|string|max:255' ];
    }
}

