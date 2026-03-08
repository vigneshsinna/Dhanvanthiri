<?php

namespace App\Modules\Payment\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use Illuminate\Http\Request;
use App\Modules\Payment\Services\WebhookService;

class WebhookController
{
    public function razorpay(Request $request, WebhookService $service){ $service->handleRazorpay($request); return ApiResponse::success([], "Webhook accepted"); }
}
