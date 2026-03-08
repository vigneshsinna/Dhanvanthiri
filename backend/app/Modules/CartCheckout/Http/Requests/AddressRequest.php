<?php

namespace App\Modules\CartCheckout\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'label' => 'nullable|string|max:50', 'recipient_name' => 'required|string|min:2|max:100', 'phone' => 'required|string|min:7|max:20', 'line1' => 'required|string|min:5|max:200', 'line2' => 'nullable|string|max:200', 'city' => 'required|string|min:2|max:100', 'state' => 'required|string|min:2|max:100', 'postal_code' => 'required|string|min:3|max:20', 'country_code' => 'required|string|size:2' ];
    }
}

