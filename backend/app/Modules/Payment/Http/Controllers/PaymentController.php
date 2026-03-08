<?php

namespace App\Modules\Payment\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use Illuminate\Http\Request;
use App\Modules\Payment\Http\Requests\CreatePaymentIntentRequest;
use App\Modules\Payment\Http\Requests\ConfirmPaymentRequest;
use App\Modules\Payment\Services\PaymentService;

class PaymentController
{
    public function createIntent(CreatePaymentIntentRequest $request, PaymentService $service){ return ApiResponse::success($service->createIntent($request->user(), $request->validated()), "Intent created", 201); }

    public function confirmPayment(ConfirmPaymentRequest $request, PaymentService $service){ return ApiResponse::success($service->confirmPayment($request->validated()), "Payment confirmed"); }

    public function show(int $orderId, PaymentService $service){ return ApiResponse::success($service->showPayment($orderId)); }
}
