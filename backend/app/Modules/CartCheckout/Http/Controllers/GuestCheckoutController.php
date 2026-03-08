<?php

namespace App\Modules\CartCheckout\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CartCheckout\Models\Cart;
use App\Modules\CartCheckout\Models\ShippingMethod;
use App\Modules\CartCheckout\Services\CartTotalsService;
use App\Modules\CartCheckout\Services\CouponValidationService;
use App\Modules\CartCheckout\Services\StockReservationService;
use Illuminate\Http\Request;

class GuestCheckoutController
{
    public function validateCheckout(Request $request)
    {
        $request->validate([
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'required|string|max:20',
        ]);

        $cart = $this->resolveGuestCart($request);
        $issues = [];

        if (!$cart || $cart->items->isEmpty()) {
            $issues[] = 'Cart is empty';
        } else {
            foreach ($cart->items as $item) {
                $stock = $item->variant ? $item->variant->stock_quantity : $item->product->stock_quantity;
                if ($stock < $item->quantity) {
                    $issues[] = "{$item->product->name} has insufficient stock (available: {$stock})";
                }
                if ($item->product->status !== 'active') {
                    $issues[] = "{$item->product->name} is no longer available";
                }
            }
        }

        // If valid, create stock reservation
        if (empty($issues) && $cart) {
            try {
                app(StockReservationService::class)->reserveForCart($cart);
            } catch (\RuntimeException $e) {
                $issues[] = $e->getMessage();
            }
        }

        return ApiResponse::success([
            'valid' => empty($issues),
            'issues' => $issues,
        ]);
    }

    public function summary(Request $request)
    {
        $request->validate([
            'shipping_method_id' => 'nullable|integer',
        ]);

        $cart = $this->resolveGuestCart($request);
        if (!$cart) {
            return ApiResponse::error('Cart not found', 'CART_NOT_FOUND', [], 404);
        }

        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        $subtotal = $cart->items->sum(fn ($item) => $item->line_total);
        $discountAmount = 0;

        if ($cart->coupon && $cart->coupon->isValid()) {
            $discountAmount = app(CouponValidationService::class)->calculate($cart->coupon->toArray(), $subtotal);
        }

        $shippingCost = 0;
        $shippingMethod = null;
        $shippingMethodId = $request->input('shipping_method_id');
        if ($shippingMethodId) {
            $shippingMethod = ShippingMethod::find($shippingMethodId);
            if ($shippingMethod) {
                $shippingCost = (float) $shippingMethod->price;
                if ($shippingMethod->min_order_free && $subtotal >= (float) $shippingMethod->min_order_free) {
                    $shippingCost = 0;
                }
            }
        }

        $totals = app(CartTotalsService::class)->calculate($subtotal, $discountAmount, $shippingCost, 0.0);

        return ApiResponse::success([
            'data' => [
                'items' => $cart->items->map(fn ($item) => [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total,
                    'image' => $item->product->images->firstWhere('is_primary', true)?->path,
                ]),
                'coupon' => $cart->coupon ? ['code' => $cart->coupon->code, 'type' => $cart->coupon->type] : null,
                'shipping_method' => $shippingMethod ? ['id' => $shippingMethod->id, 'name' => $shippingMethod->name] : null,
                ...$totals,
            ],
        ]);
    }

    private function resolveGuestCart(Request $request): ?Cart
    {
        $token = $request->header('X-Cart-Token');
        if (!$token) {
            return null;
        }

        return Cart::where('session_id', $token)
            ->whereNull('user_id')
            ->with(['items.product', 'items.variant'])
            ->first();
    }
}
