<?php

namespace App\Modules\OrderManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [ 'items' => 'required|array|min:1', 'items.*.order_item_id' => 'required|exists:order_items,id', 'items.*.quantity' => 'required|integer|min:1', 'items.*.reason' => 'required|string|max:255', 'items.*.condition' => 'required|in:unopened,like_new,used,damaged', 'refund_type' => 'required|in:original_payment,store_credit,exchange', 'description' => 'nullable|string' ];
    }
}

