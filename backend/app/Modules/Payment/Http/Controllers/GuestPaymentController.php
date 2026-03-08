<?php

namespace App\Modules\Payment\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Payment\Services\PaymentService;
use Illuminate\Http\Request;

class GuestPaymentController
{
    public function createIntent(Request $request, PaymentService $service)
    {
        $validated = $request->validate([
            'gateway' => 'required|in:razorpay',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'required|string|max:20',
            'shipping_address' => 'required|array',
            'shipping_address.recipient_name' => 'required|string|max:100',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_address.line1' => 'required|string|max:200',
            'shipping_address.line2' => 'nullable|string|max:200',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.state' => 'required|string|max:100',
            'shipping_address.postal_code' => 'required|string|max:20',
            'shipping_address.country_code' => 'nullable|string|size:2',
            'shipping_method_id' => 'nullable|integer',
            'shipping_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        return ApiResponse::success(
            $service->createGuestIntent($validated),
            'Guest payment intent created',
            201
        );
    }

    public function confirmPayment(Request $request, PaymentService $service)
    {
        $validated = $request->validate([
            'order_id' => 'required|integer',
            'gateway_payment_id' => 'required|string',
            'gateway_order_id' => 'required|string',
            'signature' => 'required|string',
        ]);

        return ApiResponse::success(
            $service->confirmPayment($validated),
            'Payment confirmed'
        );
    }
}
