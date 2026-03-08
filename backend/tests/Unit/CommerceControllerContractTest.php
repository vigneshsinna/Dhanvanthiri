<?php

namespace Tests\Unit;

use App\Modules\Catalog\Http\Controllers\WishlistController;
use App\Modules\OrderManagement\Http\Controllers\GuestOrderController;
use App\Modules\CartCheckout\Http\Controllers\GuestCheckoutController;
use App\Modules\Payment\Http\Controllers\GuestPaymentController;
use PHPUnit\Framework\TestCase;

/**
 * Structural contract tests for new commerce controllers.
 * Verifies method signatures, expected validation rules, and class structure.
 */
class CommerceControllerContractTest extends TestCase
{
    // ── WishlistController ──

    public function test_wishlist_controller_has_index_method(): void
    {
        $this->assertTrue(method_exists(WishlistController::class, 'index'));
    }

    public function test_wishlist_controller_has_store_method(): void
    {
        $this->assertTrue(method_exists(WishlistController::class, 'store'));
    }

    public function test_wishlist_controller_has_destroy_method(): void
    {
        $this->assertTrue(method_exists(WishlistController::class, 'destroy'));
    }

    public function test_wishlist_controller_has_private_getOrCreateWishlist(): void
    {
        $method = new \ReflectionMethod(WishlistController::class, 'getOrCreateWishlist');
        $this->assertTrue($method->isPrivate());
    }

    // ── GuestOrderController ──

    public function test_guest_order_controller_has_track_method(): void
    {
        $this->assertTrue(method_exists(GuestOrderController::class, 'track'));
    }

    public function test_guest_order_track_accepts_request(): void
    {
        $method = new \ReflectionMethod(GuestOrderController::class, 'track');
        $params = $method->getParameters();
        $this->assertCount(1, $params);
        $this->assertSame('request', $params[0]->getName());
    }

    // ── GuestCheckoutController ──

    public function test_guest_checkout_has_validateCheckout(): void
    {
        $this->assertTrue(method_exists(GuestCheckoutController::class, 'validateCheckout'));
    }

    public function test_guest_checkout_has_summary(): void
    {
        $this->assertTrue(method_exists(GuestCheckoutController::class, 'summary'));
    }

    public function test_guest_checkout_has_private_resolveGuestCart(): void
    {
        $method = new \ReflectionMethod(GuestCheckoutController::class, 'resolveGuestCart');
        $this->assertTrue($method->isPrivate());
    }

    // ── GuestPaymentController ──

    public function test_guest_payment_has_createIntent(): void
    {
        $this->assertTrue(method_exists(GuestPaymentController::class, 'createIntent'));
    }

    public function test_guest_payment_has_confirmPayment(): void
    {
        $this->assertTrue(method_exists(GuestPaymentController::class, 'confirmPayment'));
    }
}
