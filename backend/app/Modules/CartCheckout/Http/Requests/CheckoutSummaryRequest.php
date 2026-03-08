<?php

namespace App\Modules\CartCheckout\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutSummaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'address_id' => 'required|exists:addresses,id', 'shipping_method_id' => 'required|exists:shipping_methods,id' ];
    }
}

