<?php

namespace App\Modules\Payment\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Payment\Http\Requests\RefundRequest;
use App\Modules\Payment\Services\RefundService;

class AdminRefundController
{
    public function process(RefundRequest $request, int $id, RefundService $service){ return ApiResponse::success($service->process($id, $request->validated()), "Refund queued", 202); }
}
