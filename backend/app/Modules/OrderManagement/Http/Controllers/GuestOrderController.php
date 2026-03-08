<?php

namespace App\Modules\OrderManagement\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\OrderManagement\Models\Order;
use Illuminate\Http\Request;

class GuestOrderController
{
    /**
     * Track an order by order number + email/phone without authentication.
     */
    public function track(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string|max:30',
            'email' => 'required_without:phone|nullable|email|max:255',
            'phone' => 'required_without:email|nullable|string|max:20',
        ]);

        $query = Order::where('order_number', $request->input('order_number'));

        // Match against either guest fields or authenticated user fields
        $email = $request->input('email');
        $phone = $request->input('phone');

        $query->where(function ($q) use ($email, $phone) {
            if ($email) {
                $q->where('guest_email', $email)
                  ->orWhereHas('user', fn ($u) => $u->where('email', $email));
            }
            if ($phone) {
                $q->orWhere('guest_phone', $phone);
            }
        });

        $order = $query->with([
            'items:id,order_id,product_name,variant_label,sku,quantity,unit_price,line_total,product_image_url',
            'shippingAddress',
            'shipments.events',
            'statusHistory' => fn ($q) => $q->orderByDesc('created_at')->limit(10),
        ])->first();

        if (!$order) {
            return ApiResponse::error('Order not found. Please check your order number and email/phone.', 'ORDER_NOT_FOUND', [], 404);
        }

        return ApiResponse::success([
            'data' => [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'grand_total' => $order->grand_total,
                'currency' => $order->currency,
                'created_at' => $order->created_at,
                'items' => $order->items,
                'shipping_address' => $order->shippingAddress,
                'shipments' => $order->shipments->map(fn ($s) => [
                    'carrier' => $s->carrier,
                    'tracking_number' => $s->tracking_number,
                    'tracking_url' => $s->tracking_url,
                    'status' => $s->status,
                    'shipped_at' => $s->shipped_at,
                    'estimated_delivery_at' => $s->estimated_delivery_at,
                    'delivered_at' => $s->delivered_at,
                    'events' => $s->events,
                ]),
                'status_history' => $order->statusHistory,
            ],
        ]);
    }
}
