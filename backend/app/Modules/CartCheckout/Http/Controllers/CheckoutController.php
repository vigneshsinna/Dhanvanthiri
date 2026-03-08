<?php

namespace App\Modules\CartCheckout\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CartCheckout\Models\Cart;
use App\Modules\CartCheckout\Models\ShippingMethod;
use App\Modules\CartCheckout\Services\CartTotalsService;
use App\Modules\CartCheckout\Services\CouponValidationService;
use App\Modules\CartCheckout\Services\StockReservationService;
use App\Modules\CartCheckout\Http\Requests\CheckoutValidateRequest;
use App\Modules\CartCheckout\Http\Requests\CheckoutSummaryRequest;

class CheckoutController
{
    public function validateCheckout(CheckoutValidateRequest $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->with('items.product', 'items.variant')->first();
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

        $addressId = $request->input('address_id');
        if ($addressId && !$user->addresses()->where('id', $addressId)->exists()) {
            $issues[] = 'Selected address not found';
        }

        // Reserve stock if validation passes
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

    public function summary(CheckoutSummaryRequest $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->with(['items.product.images', 'items.variant', 'coupon'])->firstOrFail();

        $subtotal = $cart->items->sum(fn ($item) => $item->line_total);
        $discountAmount = 0;

        if ($cart->coupon && $cart->coupon->isValid()) {
            $discountAmount = app(CouponValidationService::class)->calculate($cart->coupon->toArray(), $subtotal);
        }

        $shippingCost = 0;
        $shippingMethodId = $request->input('shipping_method_id');
        $shippingMethod = null;
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
}
