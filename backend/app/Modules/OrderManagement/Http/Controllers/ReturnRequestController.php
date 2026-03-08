<?php

namespace App\Modules\OrderManagement\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Models\ReturnRequest;
use App\Modules\OrderManagement\Services\CustomerNotificationService;
use App\Modules\OrderManagement\Http\Requests\CreateReturnRequest;
use Illuminate\Http\Request;

class ReturnRequestController
{
    public function store(CreateReturnRequest $request, int $id)
    {
        $order = Order::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();

        if (!in_array($order->status, ['delivered', 'completed'])) {
            return ApiResponse::error('Returns only allowed for delivered/completed orders', 'INVALID_ORDER_STATUS', [], 422);
        }

        $data = $request->validated();

        $returnReq = ReturnRequest::create([
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'status' => 'pending',
            'refund_type' => $data['refund_type'] ?? 'original_payment',
        ]);

        if (!empty($data['items'])) {
            foreach ($data['items'] as $item) {
                $returnReq->items()->create([
                    'order_item_id' => $item['order_item_id'],
                    'quantity' => $item['quantity'],
                    'reason' => $item['reason'] ?? $data['reason'],
                    'condition' => $item['condition'] ?? 'used',
                ]);
            }
        }

        app(CustomerNotificationService::class)->notify($order, 'return_received');

        return ApiResponse::success(['data' => $returnReq->load('items')], 'Return request created', 201);
    }

    public function index(int $id, Request $request)
    {
        $order = Order::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $returns = $order->returnRequests()->with('items')->orderByDesc('created_at')->get();

        return ApiResponse::success(['data' => $returns]);
    }
}
