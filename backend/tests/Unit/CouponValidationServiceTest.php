<?php

namespace Tests\Unit;

use App\Modules\CartCheckout\Services\CouponValidationService;
use PHPUnit\Framework\TestCase;

class CouponValidationServiceTest extends TestCase
{
    private CouponValidationService $service;

    protected function setUp(): void
    {
        $this->service = new CouponValidationService();
    }

    // --- calculate() tests ---

    public function test_percent_coupon_calculation_with_cap(): void
    {
        $coupon = [
            'type' => 'percent',
            'value' => 20,
            'max_discount_amount' => 30,
            'is_active' => true,
        ];

        $this->assertSame(30.0, $this->service->calculate($coupon, 200.0));
    }

    public function test_percent_coupon_without_cap(): void
    {
        $coupon = ['type' => 'percent', 'value' => 10, 'is_active' => true];

        $this->assertSame(50.0, $this->service->calculate($coupon, 500.0));
    }

    public function test_fixed_coupon_calculation(): void
    {
        $coupon = ['type' => 'fixed', 'value' => 75, 'is_active' => true];

        $this->assertSame(75.0, $this->service->calculate($coupon, 200.0));
    }

    public function test_fixed_coupon_capped_by_subtotal(): void
    {
        $coupon = ['type' => 'fixed', 'value' => 100, 'is_active' => true];

        $this->assertSame(50.0, $this->service->calculate($coupon, 50.0));
    }

    public function test_unknown_type_returns_zero(): void
    {
        $coupon = ['type' => 'unknown', 'value' => 50];

        $this->assertSame(0.0, $this->service->calculate($coupon, 200.0));
    }

    // --- validate() tests ---

    public function test_inactive_coupon_is_invalid(): void
    {
        $coupon = ['is_active' => false, 'type' => 'fixed', 'value' => 10];

        $result = $this->service->validate($coupon, 100.0);
        $this->assertFalse($result['valid']);
        $this->assertSame('Coupon inactive', $result['reason']);
    }

    public function test_active_coupon_without_restrictions_is_valid(): void
    {
        $coupon = ['is_active' => true, 'type' => 'fixed', 'value' => 10];

        $result = $this->service->validate($coupon, 100.0);
        $this->assertTrue($result['valid']);
        $this->assertNull($result['reason']);
    }

    public function test_minimum_order_amount_not_met(): void
    {
        $coupon = ['is_active' => true, 'min_order_amount' => 500, 'type' => 'fixed', 'value' => 10];

        $result = $this->service->validate($coupon, 200.0);
        $this->assertFalse($result['valid']);
        $this->assertSame('Minimum order amount not reached', $result['reason']);
    }

    public function test_minimum_order_amount_met(): void
    {
        $coupon = ['is_active' => true, 'min_order_amount' => 200, 'type' => 'fixed', 'value' => 10];

        $result = $this->service->validate($coupon, 200.0);
        $this->assertTrue($result['valid']);
    }

    public function test_usage_limit_reached(): void
    {
        $coupon = ['is_active' => true, 'usage_limit' => 5, 'type' => 'fixed', 'value' => 10];

        $result = $this->service->validate($coupon, 100.0, 5);
        $this->assertFalse($result['valid']);
        $this->assertSame('Usage limit reached', $result['reason']);
    }

    public function test_usage_limit_not_reached(): void
    {
        $coupon = ['is_active' => true, 'usage_limit' => 5, 'type' => 'fixed', 'value' => 10];

        $result = $this->service->validate($coupon, 100.0, 3);
        $this->assertTrue($result['valid']);
    }

    public function test_null_used_count_skips_limit_check(): void
    {
        $coupon = ['is_active' => true, 'usage_limit' => 5, 'type' => 'fixed', 'value' => 10];

        $result = $this->service->validate($coupon, 100.0, null);
        $this->assertTrue($result['valid']);
    }
}
