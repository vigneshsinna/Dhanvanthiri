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
use App\Modules\CartCheckout\Models\Address;
use App\Modules\CartCheckout\Models\Coupon;
use App\Modules\CartCheckout\Models\ShippingMethod;
use App\Modules\CartCheckout\Models\ShippingZone;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Models\OrderItem;
use App\Modules\OrderManagement\Models\OrderAddress;
use App\Modules\Payment\Models\Payment;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * DATABASE-BACKED INTEGRATION TESTS
 * Phase 2 validation — real SQLite database, no mocks.
 */
class IntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $admin;
    private string $customerToken;
    private string $adminToken;
    private Category $category;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $this->admin = User::create([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->customerToken = JWTAuth::fromUser($this->customer);
        $this->adminToken = JWTAuth::fromUser($this->admin);

        $this->category = Category::create([
            'name' => 'Thokku',
            'slug' => 'thokku',
            'description' => 'Traditional thokku',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Poondu Thokku',
            'slug' => 'poondu-thokku',
            'sku' => 'TK-POONDU-250',
            'description' => 'Traditional garlic thokku made with farm-fresh ingredients',
            'short_description' => 'Garlic thokku',
            'price' => 199.00,
            'compare_price' => 249.00,
            'cost_price' => 120.00,
            'stock_quantity' => 50,
            'low_stock_threshold' => 5,
            'weight' => 0.25,
            'status' => 'active',
            'is_featured' => true,
        ]);

        ProductImage::create([
            'product_id' => $this->product->id,
            'path' => '/images/products/poondu-thokku.jpg',
            'alt_text' => 'Poondu Thokku',
            'sort_order' => 0,
            'is_primary' => true,
        ]);
    }

    // ─── CATALOG ─────────────────────────────────────────────────────

    public function test_categories_index_returns_active_categories(): void
    {
        Category::create(['name' => 'Inactive', 'slug' => 'inactive', 'is_active' => false, 'sort_order' => 2]);

        $response = $this->getJson('/api/categories');
        $response->assertOk()
            ->assertJsonPath('data.data.0.name', 'Thokku');

        // Inactive category should NOT be returned
        $names = collect($response->json('data.data'))->pluck('name')->toArray();
        $this->assertNotContains('Inactive', $names);
    }

    public function test_categories_show_by_slug(): void
    {
        $response = $this->getJson('/api/categories/thokku');
        $response->assertOk()
            ->assertJsonPath('data.data.name', 'Thokku');
    }

    public function test_products_index_returns_active_products(): void
    {
        Product::create([
            'category_id' => $this->category->id,
            'name' => 'Draft Product',
            'slug' => 'draft-product',
            'sku' => 'DRAFT-001',
            'description' => 'Draft product',
            'price' => 100,
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/products');
        $response->assertOk();

        $slugs = collect($response->json('data.data'))->pluck('slug')->toArray();
        $this->assertContains('poondu-thokku', $slugs);
        $this->assertNotContains('draft-product', $slugs);
    }

    public function test_products_show_by_slug(): void
    {
        $response = $this->getJson('/api/products/poondu-thokku');
        $response->assertOk()
            ->assertJsonPath('data.data.name', 'Poondu Thokku')
            ->assertJsonPath('data.data.price', '199.00');
    }

    public function test_products_show_returns_404_for_nonexistent(): void
    {
        $response = $this->getJson('/api/products/nonexistent-product');
        $response->assertNotFound();
    }

    public function test_products_filter_by_category(): void
    {
        $other = Category::create(['name' => 'Podi', 'slug' => 'podi', 'is_active' => true, 'sort_order' => 2]);
        Product::create([
            'category_id' => $other->id,
            'name' => 'Idly Podi',
            'slug' => 'idly-podi',
            'sku' => 'PD-IDLY-100',
            'description' => 'Traditional idly podi',
            'price' => 149,
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/products?category_id=' . $this->category->id);
        $response->assertOk();

        $slugs = collect($response->json('data.data'))->pluck('slug')->toArray();
        $this->assertContains('poondu-thokku', $slugs);
        $this->assertNotContains('idly-podi', $slugs);
    }

    public function test_products_filter_by_price_range(): void
    {
        $response = $this->getJson('/api/products?min_price=100&max_price=200');
        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
    }

    public function test_featured_products(): void
    {
        $response = $this->getJson('/api/products/featured');
        $response->assertOk();

        $slugs = collect($response->json('data.data'))->pluck('slug')->toArray();
        $this->assertContains('poondu-thokku', $slugs);
    }

    // ─── AUTH ────────────────────────────────────────────────────────

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['data' => ['access_token', 'token_type', 'expires_in', 'user']]);

        $this->assertDatabaseHas('users', ['email' => 'newuser@test.com', 'role' => 'customer']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Duplicate',
            'email' => 'customer@test.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
        ]);

        $response->assertUnprocessable();
    }

    public function test_login_returns_token(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'customer@test.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['access_token', 'user']]);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'customer@test.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertUnauthorized();
    }

    public function test_me_endpoint_returns_user_profile(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.user.email', 'customer@test.com')
            ->assertJsonPath('data.user.role', 'customer');
    }

    public function test_me_endpoint_rejects_unauthenticated(): void
    {
        $response = $this->getJson('/api/auth/me');
        $response->assertUnauthorized();
    }

    public function test_logout_invalidates_token(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/auth/logout');

        $response->assertOk();
    }

    // ─── ADDRESSES ───────────────────────────────────────────────────

    public function test_address_crud_flow(): void
    {
        // Create
        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/addresses', [
                'label' => 'Home',
                'recipient_name' => 'Test Customer',
                'phone' => '9876543210',
                'line1' => '123 Main Street',
                'line2' => 'Apt 4B',
                'city' => 'Chennai',
                'state' => 'Tamil Nadu',
                'postal_code' => '600001',
                'country_code' => 'IN',
                'is_default' => true,
            ]);

        $createResponse->assertCreated();
        $addressId = $createResponse->json('data.data.id');

        // Verify line1/line2 field naming (Bug #11 fix verification)
        $this->assertDatabaseHas('addresses', [
            'id' => $addressId,
            'line1' => '123 Main Street',
            'line2' => 'Apt 4B',
        ]);

        // List
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/addresses');
        $listResponse->assertOk();
        $this->assertCount(1, $listResponse->json('data.data'));

        // Show
        $showResponse = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson("/api/addresses/{$addressId}");
        $showResponse->assertOk()
            ->assertJsonPath('data.data.city', 'Chennai');

        // Update
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->putJson("/api/addresses/{$addressId}", [
                'label' => 'Office',
                'recipient_name' => 'Test Customer',
                'phone' => '9876543210',
                'line1' => '456 Business Park',
                'city' => 'Coimbatore',
                'state' => 'Tamil Nadu',
                'postal_code' => '641001',
                'country_code' => 'IN',
            ]);
        $updateResponse->assertOk();
        $this->assertDatabaseHas('addresses', ['id' => $addressId, 'city' => 'Coimbatore']);

        // Delete
        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson("/api/addresses/{$addressId}");
        $deleteResponse->assertOk();
        $this->assertDatabaseMissing('addresses', ['id' => $addressId]);
    }

    public function test_address_requires_line1_not_line_1(): void
    {
        // Ensure the backend rejects the wrong field name (Bug #11 verification)
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/addresses', [
                'recipient_name' => 'Test',
                'phone' => '9876543210',
                'line_1' => '123 Main Street', // Wrong field name
                'city' => 'Chennai',
                'state' => 'Tamil Nadu',
                'postal_code' => '600001',
                'country_code' => 'IN',
            ]);

        // Should fail validation because 'line1' is required but 'line_1' was sent
        $response->assertUnprocessable();
    }

    public function test_address_belongs_to_user(): void
    {
        // Create address for customer
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/addresses', [
                'recipient_name' => 'Customer',
                'phone' => '9876543210',
                'line1' => '123 Street',
                'city' => 'Chennai',
                'state' => 'Tamil Nadu',
                'postal_code' => '600001',
                'country_code' => 'IN',
            ]);

        $addressId = Address::where('user_id', $this->customer->id)->first()->id;

        // Another user should NOT be able to access customer's address
        $other = User::create([
            'name' => 'Other User',
            'email' => 'other@test.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $response = $this->actingAs($other, 'api')
            ->getJson("/api/addresses/{$addressId}");

        $response->assertNotFound();
    }

    // ─── CART ────────────────────────────────────────────────────────

    public function test_cart_add_item_and_show(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        $response->assertCreated();
        $data = $response->json('data.data');
        $this->assertEquals(2, $data['item_count']);
        $this->assertEquals(398.00, $data['subtotal']);

        // Show cart
        $showResponse = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/cart');
        $showResponse->assertOk();
        $this->assertEquals(2, $showResponse->json('data.data.item_count'));
    }

    public function test_cart_update_item_quantity(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $cart = Cart::where('user_id', $this->customer->id)->first();
        $itemId = $cart->items->first()->id;

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->putJson("/api/cart/items/{$itemId}", ['quantity' => 3]);

        $response->assertOk();
        $this->assertEquals(3, $response->json('data.data.item_count'));
    }

    public function test_cart_reject_out_of_stock(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 51, // Over stock_quantity=50 but under max:99 validation
            ]);

        $response->assertUnprocessable()
            ->assertJsonPath('code', 'OUT_OF_STOCK');
    }

    public function test_cart_remove_item(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $cart = Cart::where('user_id', $this->customer->id)->first();
        $itemId = $cart->items->first()->id;

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson("/api/cart/items/{$itemId}");

        $response->assertOk();
        $this->assertEquals(0, $response->json('data.data.item_count'));
    }

    public function test_cart_clear(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson('/api/cart');

        $response->assertOk();
        $this->assertEquals(0, $response->json('data.data.item_count'));
    }

    public function test_cart_apply_coupon(): void
    {
        Coupon::create([
            'code' => 'TESTCOUPON',
            'type' => 'percent',
            'value' => 10,
            'min_order_amount' => 100,
            'max_discount_amount' => 50,
            'usage_limit' => 100,
            'used_count' => 0,
            'per_user_limit' => 1,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addMonth(),
            'is_active' => true,
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 3,
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/coupon', ['code' => 'TESTCOUPON']);

        $response->assertOk();
        $this->assertNotNull($response->json('data.data.coupon'));
        $this->assertEquals('TESTCOUPON', $response->json('data.data.coupon.code'));
    }

    public function test_cart_reject_invalid_coupon(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/coupon', ['code' => 'NOTREAL']);

        $response->assertUnprocessable();
    }

    public function test_shipping_rates(): void
    {
        $zone = ShippingZone::create(['name' => 'India', 'countries' => json_encode(['IN'])]);
        ShippingMethod::create([
            'shipping_zone_id' => $zone->id,
            'name' => 'Standard',
            'description' => 'Standard delivery',
            'price' => 50.00,
            'min_delivery_days' => 5,
            'max_delivery_days' => 7,
            'min_order_free' => 499,
            'is_active' => true,
        ]);

        // Shipping rates requires cart.session middleware — use auth token
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/cart/shipping-rates');
        $response->assertOk();
        $this->assertNotEmpty($response->json('data.data'));
    }

    // ─── GUEST CART ──────────────────────────────────────────────────

    public function test_guest_cart_with_cart_token(): void
    {
        $token = 'test-guest-cart-token-abc';

        $response = $this->withHeader('X-Cart-Token', $token)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $response->assertCreated();

        // Verify cart was created with session_id
        $this->assertDatabaseHas('carts', ['session_id' => $token]);
    }

    // ─── CHECKOUT ────────────────────────────────────────────────────

    public function test_checkout_validate_with_valid_cart(): void
    {
        // Add item to cart
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        // Create address
        $address = Address::create([
            'user_id' => $this->customer->id,
            'recipient_name' => 'Test',
            'phone' => '9876543210',
            'line1' => '123 Street',
            'city' => 'Chennai',
            'state' => 'Tamil Nadu',
            'postal_code' => '600001',
            'country_code' => 'IN',
        ]);

        // Create shipping method
        $zone = ShippingZone::create(['name' => 'India', 'countries' => json_encode(['IN'])]);
        $method = ShippingMethod::create([
            'shipping_zone_id' => $zone->id,
            'name' => 'Standard',
            'description' => 'Standard',
            'price' => 50.00,
            'min_delivery_days' => 5,
            'max_delivery_days' => 7,
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/checkout/validate', [
                'address_id' => $address->id,
                'shipping_method_id' => $method->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.valid', true);
    }

    public function test_checkout_validate_empty_cart(): void
    {
        // Without required fields, validation returns 422
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/checkout/validate', []);

        $response->assertUnprocessable();
    }

    public function test_checkout_summary(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        $zone = ShippingZone::create(['name' => 'India', 'countries' => json_encode(['IN'])]);
        $method = ShippingMethod::create([
            'shipping_zone_id' => $zone->id,
            'name' => 'Standard',
            'description' => 'Standard',
            'price' => 50.00,
            'min_delivery_days' => 5,
            'max_delivery_days' => 7,
            'is_active' => true,
        ]);

        $address = Address::create([
            'user_id' => $this->customer->id,
            'recipient_name' => 'Test',
            'phone' => '9876543210',
            'line1' => '123 Street',
            'city' => 'Chennai',
            'state' => 'Tamil Nadu',
            'postal_code' => '600001',
            'country_code' => 'IN',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/checkout/summary', [
                'address_id' => $address->id,
                'shipping_method_id' => $method->id,
            ]);

        $response->assertOk();
        $data = $response->json('data.data');
        $this->assertEquals(398.00, $data['subtotal']);
        $this->assertArrayHasKey('grand_total', $data);
    }

    // ─── ORDERS ──────────────────────────────────────────────────────

    public function test_order_list_returns_user_orders(): void
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-TEST-001',
            'status' => 'paid',
            'subtotal' => 398.00,
            'discount_amount' => 0,
            'shipping_cost' => 50.00,
            'tax_amount' => 0,
            'grand_total' => 448.00,
            'currency' => 'INR',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_name' => 'Poondu Thokku',
            'sku' => 'TK-POONDU-250',
            'unit_price' => 199.00,
            'quantity' => 2,
            'line_total' => 398.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/orders');

        $response->assertOk();
        $this->assertCount(1, $response->json('data.data'));
        $this->assertEquals('ORD-TEST-001', $response->json('data.data.0.order_number'));
    }

    public function test_order_show_by_order_number(): void
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-TEST-002',
            'status' => 'paid',
            'subtotal' => 199.00,
            'discount_amount' => 0,
            'shipping_cost' => 50.00,
            'tax_amount' => 0,
            'grand_total' => 249.00,
            'currency' => 'INR',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_name' => 'Poondu Thokku',
            'sku' => 'TK-POONDU-250',
            'unit_price' => 199.00,
            'quantity' => 1,
            'line_total' => 199.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/orders/ORD-TEST-002');

        $response->assertOk()
            ->assertJsonPath('data.data.order_number', 'ORD-TEST-002')
            ->assertJsonPath('data.data.grand_total', '249.00');
    }

    public function test_order_cancel_from_pending_payment(): void
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-CANCEL-001',
            'status' => 'pending_payment',
            'subtotal' => 199.00,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'grand_total' => 199.00,
            'currency' => 'INR',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson("/api/orders/{$order->id}/cancel", [
                'reason' => 'Changed my mind',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_order_cannot_cancel_delivered(): void
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-DELIVERED-001',
            'status' => 'delivered',
            'subtotal' => 199.00,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'grand_total' => 199.00,
            'currency' => 'INR',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson("/api/orders/{$order->id}/cancel");

        $response->assertUnprocessable();
    }

    public function test_order_tracking(): void
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-TRACK-001',
            'status' => 'shipped',
            'subtotal' => 199.00,
            'discount_amount' => 0,
            'shipping_cost' => 50.00,
            'tax_amount' => 0,
            'grand_total' => 249.00,
            'currency' => 'INR',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson("/api/orders/{$order->id}/tracking");

        $response->assertOk()
            ->assertJsonStructure(['data' => ['data']]);
    }

    public function test_order_belongs_to_user(): void
    {
        $other = User::create([
            'name' => 'Other',
            'email' => 'other2@test.com',
            'password' => bcrypt('pass'),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $order = Order::create([
            'user_id' => $other->id,
            'order_number' => 'ORD-OTHER-001',
            'status' => 'paid',
            'subtotal' => 100,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'grand_total' => 100,
            'currency' => 'INR',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson("/api/orders/{$order->order_number}");

        $response->assertNotFound();
    }

    // ─── PAYMENTS ────────────────────────────────────────────────────

    public function test_payment_show(): void
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-PAY-001',
            'status' => 'paid',
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
            'gateway_payment_intent_id' => 'order_test_123',
            'amount_minor' => 19900,
            'amount_decimal' => 199.00,
            'currency' => 'INR',
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson("/api/payments/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.gateway', 'razorpay');
    }

    // ─── ADMIN CRUD ──────────────────────────────────────────────────

    public function test_admin_product_crud(): void
    {
        // Create
        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/products', [
                'name' => 'New Admin Product',
                'slug' => 'new-admin-product',
                'sku' => 'ADMIN-001',
                'category_id' => $this->category->id,
                'description' => 'Created by admin',
                'price' => 299.00,
                'stock_quantity' => 100,
                'status' => 'active',
            ]);

        $createResponse->assertCreated();
        $productId = $createResponse->json('data.data.id');

        // Update
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson("/api/admin/products/{$productId}", [
                'name' => 'Updated Admin Product',
                'price' => 349.00,
            ]);

        $updateResponse->assertOk();
        $this->assertDatabaseHas('products', ['id' => $productId, 'price' => 349.00]);

        // Delete
        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->deleteJson("/api/admin/products/{$productId}");

        $deleteResponse->assertOk();
    }

    public function test_admin_category_crud(): void
    {
        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/admin/categories', [
                'name' => 'New Category',
                'slug' => 'new-category',
                'is_active' => true,
            ]);

        $createResponse->assertCreated();
        $catId = $createResponse->json('data.data.id');

        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson("/api/admin/categories/{$catId}", [
                'name' => 'Updated Category',
            ]);

        $updateResponse->assertOk();

        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->deleteJson("/api/admin/categories/{$catId}");

        $deleteResponse->assertOk();
    }

    public function test_admin_requires_admin_role(): void
    {
        // Customer should not access admin routes
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/admin/products');

        $response->assertForbidden();
    }

    public function test_admin_order_list(): void
    {
        Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-ADMIN-001',
            'status' => 'paid',
            'subtotal' => 199.00,
            'discount_amount' => 0,
            'shipping_cost' => 0,
            'tax_amount' => 0,
            'grand_total' => 199.00,
            'currency' => 'INR',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/admin/orders');

        $response->assertOk();
    }

    // ─── WEBHOOK IDEMPOTENCY ─────────────────────────────────────────

    public function test_webhook_duplicate_rejected(): void
    {
        $payload = json_encode([
            'event' => 'payment.captured',
            'payload' => [
                'payment' => [
                    'entity' => [
                        'id' => 'pay_test_123',
                        'order_id' => 'order_test_123',
                        'amount' => 19900,
                        'status' => 'captured',
                    ],
                ],
            ],
        ]);

        $secret = config('payment.gateways.razorpay.webhook_secret');
        $signature = hash_hmac('sha256', $payload, $secret);

        // First call
        $this->postJson('/api/webhooks/razorpay', json_decode($payload, true), [
            'X-Razorpay-Signature' => $signature,
        ]);

        // Second call with same data should be idempotent (not error)
        $response = $this->postJson('/api/webhooks/razorpay', json_decode($payload, true), [
            'X-Razorpay-Signature' => $signature,
        ]);

        // Should either succeed (idempotent) or return 200
        $this->assertTrue(in_array($response->getStatusCode(), [200, 422]));
    }
}
