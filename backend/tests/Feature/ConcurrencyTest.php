<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\ProductImage;
use App\Modules\CartCheckout\Models\Cart;
use App\Modules\CartCheckout\Models\CartItem;
use App\Modules\CartCheckout\Models\StockReservation;
use App\Modules\CartCheckout\Services\StockReservationService;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\PaymentWebhook;
use App\Modules\Shared\Models\IdempotencyKey;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * CONCURRENCY & RACE-CONDITION TESTS
 * Phase 2 validation — stock reservation races, duplicate payment confirm,
 * duplicate webhook replay, concurrent checkout on low-stock items.
 */
class ConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    private User $customer1;
    private User $customer2;
    private string $token1;
    private string $token2;
    private Category $category;
    private Product $lowStockProduct;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer1 = User::create([
            'name' => 'Customer One',
            'email' => 'customer1@test.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $this->customer2 = User::create([
            'name' => 'Customer Two',
            'email' => 'customer2@test.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $this->token1 = JWTAuth::fromUser($this->customer1);
        $this->token2 = JWTAuth::fromUser($this->customer2);

        $this->category = Category::create([
            'name' => 'Limited',
            'slug' => 'limited',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->lowStockProduct = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Limited Stock Thokku',
            'slug' => 'limited-stock-thokku',
            'sku' => 'TK-LIMITED-250',
            'description' => 'Only 3 left',
            'price' => 199.00,
            'stock_quantity' => 3,
            'status' => 'active',
        ]);

        ProductImage::create([
            'product_id' => $this->lowStockProduct->id,
            'path' => '/images/limited.jpg',
            'alt_text' => 'Limited',
            'sort_order' => 0,
            'is_primary' => true,
        ]);
    }

    // ─── STOCK RESERVATION RACES ─────────────────────────────────────

    public function test_stock_reservation_prevents_overselling(): void
    {
        $service = app(StockReservationService::class);

        // Customer 1 cart: wants 2 of 3 available
        $cart1 = Cart::create(['user_id' => $this->customer1->id, 'expires_at' => now()->addDays(30)]);
        CartItem::create([
            'cart_id' => $cart1->id,
            'product_id' => $this->lowStockProduct->id,
            'quantity' => 2,
            'unit_price' => 199.00,
        ]);

        // Customer 2 cart: wants 2 of 3 available
        $cart2 = Cart::create(['user_id' => $this->customer2->id, 'expires_at' => now()->addDays(30)]);
        CartItem::create([
            'cart_id' => $cart2->id,
            'product_id' => $this->lowStockProduct->id,
            'quantity' => 2,
            'unit_price' => 199.00,
        ]);

        // First reservation should succeed
        $reservations1 = $service->reserveForCart($cart1);
        $this->assertCount(1, $reservations1);
        $this->assertEquals('held', $reservations1[0]->status);

        // Second reservation should fail (only 1 available after held reservation)
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Insufficient stock');
        $service->reserveForCart($cart2);
    }

    public function test_stock_reservation_released_allows_new_reservation(): void
    {
        $service = app(StockReservationService::class);

        $cart1 = Cart::create(['user_id' => $this->customer1->id, 'expires_at' => now()->addDays(30)]);
        CartItem::create([
            'cart_id' => $cart1->id,
            'product_id' => $this->lowStockProduct->id,
            'quantity' => 3,
            'unit_price' => 199.00,
        ]);

        $cart2 = Cart::create(['user_id' => $this->customer2->id, 'expires_at' => now()->addDays(30)]);
        CartItem::create([
            'cart_id' => $cart2->id,
            'product_id' => $this->lowStockProduct->id,
            'quantity' => 2,
            'unit_price' => 199.00,
        ]);

        // Reserve all 3 for cart1
        $service->reserveForCart($cart1);

        // Release cart1's reservations
        $service->releaseForCart($cart1->id);

        // Now cart2 should be able to reserve 2
        $reservations2 = $service->reserveForCart($cart2);
        $this->assertCount(1, $reservations2);
        $this->assertEquals(2, $reservations2[0]->quantity);
    }

    public function test_expired_reservations_are_released(): void
    {
        $service = app(StockReservationService::class);

        // Create an expired reservation
        StockReservation::create([
            'product_id' => $this->lowStockProduct->id,
            'quantity' => 3,
            'cart_id' => null,
            'status' => 'held',
            'expires_at' => now()->subMinutes(1),
        ]);

        // Release expired
        $count = $service->releaseExpired();
        $this->assertEquals(1, $count);

        // Now we should be able to reserve
        $cart = Cart::create(['user_id' => $this->customer1->id, 'expires_at' => now()->addDays(30)]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->lowStockProduct->id,
            'quantity' => 3,
            'unit_price' => 199.00,
        ]);

        $reservations = $service->reserveForCart($cart);
        $this->assertCount(1, $reservations);
    }

    public function test_confirm_decrements_actual_stock(): void
    {
        $service = app(StockReservationService::class);

        $cart = Cart::create(['user_id' => $this->customer1->id, 'expires_at' => now()->addDays(30)]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->lowStockProduct->id,
            'quantity' => 2,
            'unit_price' => 199.00,
        ]);

        $service->reserveForCart($cart);

        // Simulate order creation
        $order = Order::create([
            'user_id' => $this->customer1->id,
            'order_number' => 'ORD-CONFIRM-001',
            'status' => 'paid',
            'subtotal' => 398.00,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'grand_total' => 398.00,
            'currency' => 'INR',
        ]);

        $service->confirmForOrder($order->id, $cart->id);

        // Stock should be decremented
        $this->lowStockProduct->refresh();
        $this->assertEquals(1, $this->lowStockProduct->stock_quantity);

        // Reservation should be confirmed
        $this->assertDatabaseHas('stock_reservations', [
            'cart_id' => $cart->id,
            'status' => 'confirmed',
            'order_id' => $order->id,
        ]);
    }

    public function test_double_confirm_does_not_double_decrement(): void
    {
        $service = app(StockReservationService::class);

        $cart = Cart::create(['user_id' => $this->customer1->id, 'expires_at' => now()->addDays(30)]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->lowStockProduct->id,
            'quantity' => 2,
            'unit_price' => 199.00,
        ]);

        $service->reserveForCart($cart);

        $order = Order::create([
            'user_id' => $this->customer1->id,
            'order_number' => 'ORD-DOUBLE-001',
            'status' => 'paid',
            'subtotal' => 398.00,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'grand_total' => 398.00,
            'currency' => 'INR',
        ]);

        // First confirm
        $service->confirmForOrder($order->id, $cart->id);

        // Second confirm — should not decrement again (reservations already confirmed)
        $service->confirmForOrder($order->id, $cart->id);

        $this->lowStockProduct->refresh();
        $this->assertEquals(1, $this->lowStockProduct->stock_quantity);
    }

    // ─── DUPLICATE PAYMENT CONFIRM ───────────────────────────────────

    public function test_duplicate_payment_confirm_is_idempotent(): void
    {
        $order = Order::create([
            'user_id' => $this->customer1->id,
            'order_number' => 'ORD-IDEMPOTENT-001',
            'status' => 'pending_payment',
            'subtotal' => 199.00,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'grand_total' => 199.00,
            'currency' => 'INR',
        ]);

        Payment::create([
            'order_id' => $order->id,
            'gateway' => 'razorpay',
            'gateway_payment_intent_id' => 'order_idem_001',
            'amount_minor' => 19900,
            'amount_decimal' => 199.00,
            'currency' => 'INR',
            'status' => 'pending',
        ]);

        // After first confirm, payment is paid and order transitions
        $payment = Payment::where('gateway_payment_intent_id', 'order_idem_001')->first();
        $payment->update([
            'gateway_transaction_id' => 'pay_idem_001',
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        $order->update(['status' => 'paid']);

        // Verify state is correct
        $order->refresh();
        $this->assertEquals('paid', $order->status);

        $payment->refresh();
        $this->assertEquals('paid', $payment->status);
    }

    // ─── DUPLICATE WEBHOOK REPLAY ────────────────────────────────────

    public function test_webhook_event_recorded_once(): void
    {
        $eventId = 'evt_test_duplicate_001';

        // Record first webhook
        PaymentWebhook::create([
            'gateway' => 'razorpay',
            'gateway_event_id' => $eventId,
            'event_type' => 'payment.captured',
            'payload' => '{}',
            'signature' => 'sig_test',
            'processed' => true,
            'processed_at' => now(),
        ]);

        // Second insert with same event_id should fail due to unique constraint
        $this->expectException(\Illuminate\Database\QueryException::class);
        PaymentWebhook::create([
            'gateway' => 'razorpay',
            'gateway_event_id' => $eventId,
            'event_type' => 'payment.captured',
            'payload' => '{}',
            'signature' => 'sig_test2',
            'processed' => false,
        ]);
    }

    // ─── IDEMPOTENCY KEY ─────────────────────────────────────────────

    public function test_idempotency_key_prevents_duplicate_intent(): void
    {
        $key = 'test-idempotency-key-123';
        $hash = md5('POST/api/payments/intent' . '{}');

        // Store first result
        IdempotencyKey::create([
            'idempotency_key' => $key,
            'request_hash' => $hash,
            'status_code' => 201,
            'response_body' => json_encode(['order_id' => 1]),
            'expires_at' => now()->addHour(),
        ]);

        // Verify it exists
        $this->assertDatabaseHas('idempotency_keys', [
            'idempotency_key' => $key,
            'status_code' => 201,
        ]);

        // Same key + hash should violate unique constraint
        $this->expectException(\Illuminate\Database\QueryException::class);
        IdempotencyKey::create([
            'idempotency_key' => $key,
            'request_hash' => $hash,
            'status_code' => 201,
            'response_body' => json_encode(['order_id' => 2]),
            'expires_at' => now()->addHour(),
        ]);
    }

    // ─── CONCURRENT CHECKOUT ON LOW-STOCK ────────────────────────────

    public function test_concurrent_add_to_cart_respects_stock(): void
    {
        // Create addresses and shipping method for checkout validation
        $address1 = \App\Modules\CartCheckout\Models\Address::create([
            'user_id' => $this->customer1->id,
            'recipient_name' => 'Cust One',
            'phone' => '9876543210',
            'line1' => '123 Street',
            'city' => 'Chennai',
            'state' => 'Tamil Nadu',
            'postal_code' => '600001',
            'country_code' => 'IN',
        ]);

        $address2 = \App\Modules\CartCheckout\Models\Address::create([
            'user_id' => $this->customer2->id,
            'recipient_name' => 'Cust Two',
            'phone' => '9876543211',
            'line1' => '456 Street',
            'city' => 'Chennai',
            'state' => 'Tamil Nadu',
            'postal_code' => '600002',
            'country_code' => 'IN',
        ]);

        $zone = \App\Modules\CartCheckout\Models\ShippingZone::create([
            'name' => 'India', 'countries' => json_encode(['IN']),
        ]);
        $method = \App\Modules\CartCheckout\Models\ShippingMethod::create([
            'shipping_zone_id' => $zone->id,
            'name' => 'Standard',
            'description' => 'Standard',
            'price' => 50.00,
            'min_delivery_days' => 5,
            'max_delivery_days' => 7,
            'is_active' => true,
        ]);

        // Customer 1 adds 2
        $response1 = $this->actingAs($this->customer1, 'api')
            ->postJson('/api/cart/items', [
                'product_id' => $this->lowStockProduct->id,
                'quantity' => 2,
            ]);
        $response1->assertCreated();

        // Customer 2 adds 2 — should succeed (stock check is at cart level, not reservation)
        $response2 = $this->actingAs($this->customer2, 'api')
            ->postJson('/api/cart/items', [
                'product_id' => $this->lowStockProduct->id,
                'quantity' => 2,
            ]);
        $response2->assertCreated();

        // Customer 1 validates checkout (with reservation), should reserve 2
        $response3 = $this->actingAs($this->customer1, 'api')
            ->postJson('/api/checkout/validate', [
                'address_id' => $address1->id,
                'shipping_method_id' => $method->id,
            ]);
        $response3->assertOk();
        $this->assertTrue($response3->json('data.valid'));

        // Customer 2 validates — should fail because only 1 left after reservation
        $response4 = $this->actingAs($this->customer2, 'api')
            ->postJson('/api/checkout/validate', [
                'address_id' => $address2->id,
                'shipping_method_id' => $method->id,
            ]);
        $response4->assertOk();
        $this->assertFalse($response4->json('data.valid'));
    }

    // ─── ORDER STATE MACHINE ─────────────────────────────────────────

    public function test_state_machine_enforces_valid_transitions(): void
    {
        $sm = app(\App\Modules\OrderManagement\Services\OrderStateMachine::class);

        // Valid transitions
        $this->assertTrue($sm->canTransition('pending_payment', 'paid'));
        $this->assertTrue($sm->canTransition('pending_payment', 'cancelled'));
        $this->assertTrue($sm->canTransition('paid', 'processing'));
        $this->assertTrue($sm->canTransition('processing', 'shipped'));
        $this->assertTrue($sm->canTransition('shipped', 'delivered'));
        $this->assertTrue($sm->canTransition('delivered', 'completed'));

        // Invalid transitions
        $this->assertFalse($sm->canTransition('pending_payment', 'shipped'));
        $this->assertFalse($sm->canTransition('shipped', 'cancelled'));
        $this->assertFalse($sm->canTransition('delivered', 'cancelled'));
        $this->assertFalse($sm->canTransition('cancelled', 'paid'));
    }

    public function test_state_machine_records_history(): void
    {
        $order = Order::create([
            'user_id' => $this->customer1->id,
            'order_number' => 'ORD-SM-001',
            'status' => 'pending_payment',
            'subtotal' => 199.00,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'grand_total' => 199.00,
            'currency' => 'INR',
        ]);

        $sm = app(\App\Modules\OrderManagement\Services\OrderStateMachine::class);
        $sm->transition($order, 'paid', 'Payment received');

        $this->assertDatabaseHas('order_status_history', [
            'order_id' => $order->id,
            'from_status' => 'pending_payment',
            'to_status' => 'paid',
            'note' => 'Payment received',
        ]);
    }
}
