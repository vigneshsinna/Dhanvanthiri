<?php

namespace App\Modules\CartCheckout\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CartCheckout\Models\Cart;
use App\Modules\CartCheckout\Models\CartItem;
use App\Modules\CartCheckout\Models\Coupon;
use App\Modules\CartCheckout\Models\ShippingMethod;
use App\Modules\CartCheckout\Services\CouponValidationService;
use App\Modules\CartCheckout\Services\CartTotalsService;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Http\Request;
use App\Modules\CartCheckout\Http\Requests\AddCartItemRequest;
use App\Modules\CartCheckout\Http\Requests\UpdateCartItemRequest;
use App\Modules\CartCheckout\Http\Requests\ApplyCouponRequest;

class CartController
{
    private function getCart(Request $request): Cart
    {
        return $request->attributes->get('cart');
    }

    private function buildCartResponse(Cart $cart): array
    {
        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        $subtotal = $cart->items->sum(fn ($item) => $item->line_total);
        $discountAmount = 0;

        if ($cart->coupon && $cart->coupon->isValid()) {
            $couponService = app(CouponValidationService::class);
            $discountAmount = $couponService->calculate($cart->coupon->toArray(), $subtotal);
        }

        $totals = app(CartTotalsService::class)->calculate($subtotal, $discountAmount, 0, 0.0);

        return [
            'id' => $cart->id,
            'items' => $cart->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'line_total' => $item->line_total,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'primary_image_url' => $item->product->images->firstWhere('is_primary', true)?->path,
                    'stock_quantity' => $item->product->stock_quantity,
                ],
                'variant' => $item->variant ? [
                    'id' => $item->variant->id,
                    'sku' => $item->variant->sku,
                ] : null,
            ]),
            'coupon' => $cart->coupon ? [
                'code' => $cart->coupon->code,
                'type' => $cart->coupon->type,
                'value' => $cart->coupon->value,
            ] : null,
            'item_count' => $cart->items->sum('quantity'),
            ...$totals,
        ];
    }

    public function show(Request $request)
    {
        $cart = $this->getCart($request);
        return ApiResponse::success(['data' => $this->buildCartResponse($cart)]);
    }

    public function addItem(AddCartItemRequest $request)
    {
        $cart = $this->getCart($request);
        $data = $request->validated();

        $product = Product::active()->findOrFail($data['product_id']);
        $variant = isset($data['variant_id']) ? ProductVariant::findOrFail($data['variant_id']) : null;

        $stockQty = $variant ? $variant->stock_quantity : $product->stock_quantity;
        if ($stockQty < $data['quantity']) {
            return ApiResponse::error('Insufficient stock', 'OUT_OF_STOCK', [], 422);
        }

        $unitPrice = $variant ? $variant->getEffectivePrice() : $product->getEffectivePrice();

        $existingItem = $cart->items()
            ->where('product_id', $data['product_id'])
            ->where('variant_id', $data['variant_id'] ?? null)
            ->first();

        if ($existingItem) {
            $existingItem->quantity += $data['quantity'];
            $existingItem->save();
        } else {
            $cart->items()->create([
                'product_id' => $data['product_id'],
                'variant_id' => $data['variant_id'] ?? null,
                'quantity' => $data['quantity'],
                'unit_price' => $unitPrice,
            ]);
        }

        $cart->expires_at = now()->addDays(30);
        $cart->save();

        return ApiResponse::success(['data' => $this->buildCartResponse($cart->fresh())], 'Item added', 201);
    }

    public function updateItem(UpdateCartItemRequest $request, int $id)
    {
        $cart = $this->getCart($request);
        $item = $cart->items()->findOrFail($id);

        $quantity = $request->validated('quantity');
        $stockQty = $item->variant ? $item->variant->stock_quantity : $item->product->stock_quantity;

        if ($stockQty < $quantity) {
            return ApiResponse::error('Insufficient stock', 'OUT_OF_STOCK', [], 422);
        }

        $item->quantity = $quantity;
        $item->save();

        return ApiResponse::success(['data' => $this->buildCartResponse($cart->fresh())], 'Item updated');
    }

    public function removeItem(Request $request, int $id)
    {
        $cart = $this->getCart($request);
        $cart->items()->where('id', $id)->delete();

        return ApiResponse::success(['data' => $this->buildCartResponse($cart->fresh())], 'Item removed');
    }

    public function clear(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->items()->delete();
        $cart->coupon_id = null;
        $cart->save();

        return ApiResponse::success(['data' => $this->buildCartResponse($cart->fresh())], 'Cart cleared');
    }

    public function applyCoupon(ApplyCouponRequest $request)
    {
        $cart = $this->getCart($request);
        $code = strtoupper($request->validated('code'));

        $coupon = Coupon::where('code', $code)->first();
        if (!$coupon || !$coupon->isValid()) {
            return ApiResponse::error('Invalid or expired coupon', 'INVALID_COUPON', [], 422);
        }

        $subtotal = $cart->items->sum(fn ($item) => $item->line_total);
        if ($coupon->min_order_amount && $subtotal < (float) $coupon->min_order_amount) {
            return ApiResponse::error(
                'Minimum order amount of INR ' . $coupon->min_order_amount . ' required',
                'MIN_ORDER_NOT_MET', [], 422
            );
        }

        $cart->coupon_id = $coupon->id;
        $cart->save();

        return ApiResponse::success(['data' => $this->buildCartResponse($cart->fresh())], 'Coupon applied');
    }

    public function removeCoupon(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->coupon_id = null;
        $cart->save();

        return ApiResponse::success(['data' => $this->buildCartResponse($cart->fresh())], 'Coupon removed');
    }

    public function shippingRates(Request $request)
    {
        $methods = ShippingMethod::where('is_active', true)
            ->with('zone:id,name')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'description' => $m->description,
                'price' => $m->price,
                'min_delivery_days' => $m->min_delivery_days,
                'max_delivery_days' => $m->max_delivery_days,
                'free_above' => $m->min_order_free,
            ]);

        return ApiResponse::success(['data' => $methods]);
    }

    public function mergeGuestCart(Request $request)
    {
        $user = $request->user();
        $guestSessionId = $request->input('guest_session_id');

        if (!$guestSessionId) {
            return ApiResponse::success([], 'No guest cart to merge');
        }

        $guestCart = Cart::where('session_id', $guestSessionId)->first();
        if (!$guestCart) {
            return ApiResponse::success([], 'No guest cart found');
        }

        $userCart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['expires_at' => now()->addDays(30)]
        );

        foreach ($guestCart->items as $guestItem) {
            $existing = $userCart->items()
                ->where('product_id', $guestItem->product_id)
                ->where('variant_id', $guestItem->variant_id)
                ->first();

            if ($existing) {
                $existing->quantity += $guestItem->quantity;
                $existing->save();
            } else {
                $userCart->items()->create($guestItem->only(['product_id', 'variant_id', 'quantity', 'unit_price']));
            }
        }

        $guestCart->items()->delete();
        $guestCart->delete();

        return ApiResponse::success(['data' => $this->buildCartResponse($userCart->fresh())], 'Cart merged');
    }
}
