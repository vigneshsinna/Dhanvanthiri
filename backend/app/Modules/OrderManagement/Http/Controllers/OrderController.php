<?php

namespace App\Modules\OrderManagement\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Services\OrderStateMachine;
use App\Modules\OrderManagement\Services\CustomerNotificationService;
use Illuminate\Http\Request;

class OrderController
{
    public function index(Request $request)
    {
        $query = Order::where('user_id', $request->user()->id)
            ->with(['items.product:id,name,slug', 'items.product.images' => fn ($q) => $q->where('is_primary', true)])
            ->orderByDesc('created_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $orders = $query->paginate($request->integer('per_page', 10));

        return ApiResponse::success([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(string $orderNumber, Request $request)
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->with([
                'items.product:id,name,slug',
                'items.product.images' => fn ($q) => $q->where('is_primary', true),
                'shippingAddress',
                'payments:id,order_id,gateway,status,amount_decimal,paid_at',
                'shipments.events',
                'statusHistory',
            ])
            ->firstOrFail();

        return ApiResponse::success(['data' => $order]);
    }

    public function cancel(Request $request, int $id)
    {
        $order = Order::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $sm = app(OrderStateMachine::class);

        if (!$sm->canTransition($order->status, 'cancelled')) {
            return ApiResponse::error('Order cannot be cancelled in current status', 'INVALID_TRANSITION', [], 422);
        }

        $order = $sm->transition($order, 'cancelled', $request->input('reason', 'Cancelled by customer'), $request->user()->id);

        app(CustomerNotificationService::class)->notify($order, 'order_cancelled');

        return ApiResponse::success(['data' => $order], 'Order cancelled');
    }

    public function downloadInvoice(int $id, Request $request)
    {
        $order = Order::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $invoice = $order->invoice;

        if (!$invoice) {
            return ApiResponse::error('Invoice not yet generated', 'NO_INVOICE', [], 404);
        }

        return ApiResponse::success([
            'data' => [
                'invoice_number' => $invoice->invoice_number,
                'pdf_url' => url('storage/' . $invoice->pdf_path),
                'issued_at' => $invoice->issued_at,
            ],
        ]);
    }

    public function tracking(int $id, Request $request)
    {
        $order = Order::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $shipments = $order->shipments()->with('events')->get();

        return ApiResponse::success([
            'data' => $shipments->map(fn ($s) => [
                'id' => $s->id,
                'carrier' => $s->carrier,
                'tracking_number' => $s->tracking_number,
                'tracking_url' => $s->tracking_url,
                'status' => $s->status,
                'shipped_at' => $s->shipped_at,
                'estimated_delivery_at' => $s->estimated_delivery_at,
                'delivered_at' => $s->delivered_at,
                'events' => $s->events,
            ]),
        ]);
    }
}
