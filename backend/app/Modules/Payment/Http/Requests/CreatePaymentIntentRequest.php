<?php

namespace App\Modules\Payment\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'gateway' => 'required|in:razorpay', 'shipping_address_id' => 'required|exists:addresses,id', 'shipping_method_id' => 'required|exists:shipping_methods,id', 'billing_same_as_shipping' => 'boolean', 'billing_address_id' => 'required_if:billing_same_as_shipping,false|exists:addresses,id', 'notes' => 'nullable|string|max:500' ];
    }
}

