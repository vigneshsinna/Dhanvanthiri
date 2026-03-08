<?php

namespace App\Modules\Payment\Services;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Models\Payment;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Models\OrderItem;
use App\Modules\OrderManagement\Models\OrderAddress;
use App\Modules\OrderManagement\Services\OrderNumberService;
use App\Modules\OrderManagement\Services\OrderStateMachine;
use App\Modules\OrderManagement\Services\CustomerNotificationService;
use App\Modules\CartCheckout\Models\Cart;
use App\Modules\CartCheckout\Models\Address;
use App\Modules\CartCheckout\Services\CartTotalsService;
use App\Modules\CartCheckout\Services\CouponValidationService;
use App\Modules\CartCheckout\Services\StockReservationService;
use App\Modules\Auth\Models\User;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private readonly PaymentGatewayInterface $gateway,
        private readonly OrderNumberService $orderNumberService,
    ) {
    }

    public function createIntent(User $user, array $payload): array
    {
        $cart = Cart::where('user_id', $user->id)->with(['items.product.images', 'items.variant', 'coupon'])->firstOrFail();

        return $this->createIntentFromCart($cart, $payload, $user->id, null, null);
    }

    /**
     * Create a payment intent for guest checkout (no auth required).
     */
    public function createGuestIntent(array $payload): array
    {
        $token = request()->header('X-Cart-Token');
        if (!$token) {
            throw new \RuntimeException('Cart token is required for guest checkout');
        }

        $cart = Cart::where('session_id', $token)
            ->whereNull('user_id')
            ->with(['items.product.images', 'items.variant', 'coupon'])
            ->firstOrFail();

        return $this->createIntentFromCart(
            $cart,
            $payload,
            null,
            $payload['guest_email'] ?? null,
            $payload['guest_phone'] ?? null
        );
    }

    private function createIntentFromCart(Cart $cart, array $payload, ?int $userId, ?string $guestEmail, ?string $guestPhone): array
    {

        if ($cart->items->isEmpty()) {
            throw new \RuntimeException('Cart is empty');
        }

        // Reserve stock before creating the order
        app(StockReservationService::class)->reserveForCart($cart);

        $subtotal = $cart->items->sum(fn ($item) => $item->line_total);
        $discountAmount = 0;
        $couponCode = null;

        if ($cart->coupon && $cart->coupon->isValid()) {
            $couponCode = $cart->coupon->code;
            $discountAmount = app(CouponValidationService::class)->calculate($cart->coupon->toArray(), $subtotal);
        }

        $shippingCost = (float) ($payload['shipping_cost'] ?? 0);
        $totals = app(CartTotalsService::class)->calculate($subtotal, $discountAmount, $shippingCost, 0.0);

        $order = DB::transaction(function () use ($userId, $guestEmail, $guestPhone, $cart, $totals, $couponCode, $payload) {
            $order = Order::create([
                'user_id' => $userId,
                'guest_email' => $guestEmail,
                'guest_phone' => $guestPhone,
                'order_number' => $this->orderNumberService->next(),
                'order_number' => $this->orderNumberService->next(),
                'status' => 'pending_payment',
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discount_amount'],
                'shipping_cost' => $totals['shipping_cost'],
                'tax_amount' => $totals['tax_amount'],
                'grand_total' => $totals['grand_total'],
                'currency' => 'INR',
                'coupon_code' => $couponCode,
                'notes' => $payload['notes'] ?? null,
                'ip_address' => request()->ip(),
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'product_name' => $item->product->name,
                    'variant_label' => $item->variant?->sku,
                    'sku' => $item->variant?->sku ?? $item->product->sku,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'line_total' => $item->line_total,
                    'product_image_url' => $item->product->images->firstWhere('is_primary', true)?->path,
                ]);
            }

            if (!empty($payload['address_id']) && $userId) {
                $addr = Address::where('user_id', $userId)->findOrFail($payload['address_id']);
                OrderAddress::create([
                    'order_id' => $order->id,
                    'type' => 'shipping',
                    'recipient_name' => $addr->recipient_name,
                    'phone' => $addr->phone,
                    'line1' => $addr->line1,
                    'line2' => $addr->line2,
                    'city' => $addr->city,
                    'state' => $addr->state,
                    'postal_code' => $addr->postal_code,
                    'country_code' => $addr->country_code,
                ]);
            } elseif (!empty($payload['shipping_address'])) {
                // Guest checkout: address provided inline
                $sa = $payload['shipping_address'];
                OrderAddress::create([
                    'order_id' => $order->id,
                    'type' => 'shipping',
                    'recipient_name' => $sa['recipient_name'],
                    'phone' => $sa['phone'],
                    'line1' => $sa['line1'],
                    'line2' => $sa['line2'] ?? null,
                    'city' => $sa['city'],
                    'state' => $sa['state'],
                    'postal_code' => $sa['postal_code'],
                    'country_code' => $sa['country_code'] ?? 'IN',
                ]);
            }

            return $order;
        });

        $intent = $this->gateway->createIntent($order);
        $amountMinor = (int) ($intent['amount'] ?? 0);

        Payment::create([
            'order_id' => $order->id,
            'gateway' => 'razorpay',
            'gateway_payment_intent_id' => $intent['razorpay_order_id'] ?? null,
            'amount_minor' => $amountMinor,
            'amount_decimal' => round($amountMinor / 100, 2),
            'currency' => 'INR',
            'status' => 'pending',
        ]);

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'gateway' => 'razorpay',
            'razorpay_order_id' => $intent['razorpay_order_id'] ?? null,
            'amount_minor' => $amountMinor,
            'amount_decimal' => round($amountMinor / 100, 2),
            'currency' => $intent['currency'] ?? 'INR',
            'key_id' => $intent['key_id'] ?? null,
        ];
    }

    public function confirmPayment(array $payload): array
    {
        $result = $this->gateway->confirmPayment(
            (string) $payload['gateway_order_id'],
            (string) $payload['gateway_payment_id'],
            (string) $payload['signature']
        );

        if ($result['verified'] ?? false) {
            $payment = Payment::where('gateway_payment_intent_id', $payload['gateway_order_id'])->first();
            if ($payment) {
                $payment->update([
                    'gateway_transaction_id' => $payload['gateway_payment_id'],
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);

                $order = $payment->order;
                $sm = app(OrderStateMachine::class);
                if ($sm->canTransition($order->status, 'paid')) {
                    $sm->transition($order, 'paid', 'Payment confirmed via Razorpay');
                }

                // Confirm stock reservations (decrement actual stock)
                $cart = $order->user_id
                    ? Cart::where('user_id', $order->user_id)->first()
                    : Cart::whereNull('user_id')->where('session_id', request()->header('X-Cart-Token'))->first();

                if ($cart) {
                    app(StockReservationService::class)->confirmForOrder($order->id, $cart->id);
                    $cart->items()->delete();
                }

                // Send customer notifications
                $notifier = app(CustomerNotificationService::class);
                $notifier->notify($order, 'payment_success');
                $notifier->notify($order, 'order_confirmed');
            }
        }

        return $result;
    }

    public function showPayment(int $orderId): array
    {
        $payment = Payment::where('order_id', $orderId)->latest()->first();

        if (!$payment) {
            return ['order_id' => $orderId, 'status' => 'not_found'];
        }

        return [
            'order_id' => $orderId,
            'payment_id' => $payment->id,
            'gateway' => $payment->gateway,
            'status' => $payment->status,
            'amount' => $payment->amount_decimal,
            'currency' => $payment->currency,
            'paid_at' => $payment->paid_at,
            'gateway_transaction_id' => $payment->gateway_transaction_id,
        ];
    }
}
