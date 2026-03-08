<?php

namespace App\Modules\OrderManagement\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Services\OrderStateMachine;
use Illuminate\Http\Request;
use App\Modules\OrderManagement\Http\Requests\UpdateOrderStatusRequest;

class AdminOrderController
{
    public function index(Request $request)
    {
        $query = Order::with(['user:id,name,email', 'items'])
            ->orderByDesc('created_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->input('search')) {
            $query->where(fn ($q) => $q
                ->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
            );
        }
        if ($from = $request->input('from_date')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->input('to_date')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $orders = $query->paginate($request->integer('per_page', 15));

        return ApiResponse::success([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(int $id)
    {
        $order = Order::with([
            'user:id,name,email,phone',
            'items.product:id,name,slug',
            'items.variant:id,sku',
            'addresses',
            'payments',
            'shipments.events',
            'statusHistory.changedBy:id,name',
            'returnRequests.items',
            'invoice',
        ])->findOrFail($id);

        return ApiResponse::success(['data' => $order]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, int $id)
    {
        $order = Order::findOrFail($id);
        $toStatus = $request->validated('status');
        $sm = app(OrderStateMachine::class);

        if (!$sm->canTransition($order->status, $toStatus)) {
            return ApiResponse::error(
                "Cannot transition from {$order->status} to {$toStatus}",
                'INVALID_TRANSITION', [], 422
            );
        }

        $order = $sm->transition($order, $toStatus, $request->input('note'), $request->user()->id);

        return ApiResponse::success(['data' => $order->load('statusHistory')], 'Order status updated');
    }
}
