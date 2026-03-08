<?php

namespace Tests\Unit;

use App\Modules\CartCheckout\Services\CartTotalsService;
use PHPUnit\Framework\TestCase;

class CartTotalsServiceTest extends TestCase
{
    private CartTotalsService $service;

    protected function setUp(): void
    {
        $this->service = new CartTotalsService();
    }

    public function test_basic_calculation_without_discount_or_tax(): void
    {
        $result = $this->service->calculate(500.0, 0.0, 50.0, 0.0);

        $this->assertSame(500.0, $result['subtotal']);
        $this->assertSame(0.0, $result['discount_amount']);
        $this->assertSame(50.0, $result['shipping_cost']);
        $this->assertSame(0.0, $result['tax_amount']);
        $this->assertSame(550.0, $result['grand_total']);
    }

    public function test_calculation_with_discount(): void
    {
        $result = $this->service->calculate(500.0, 100.0, 50.0, 0.0);

        $this->assertSame(400.0, $result['subtotal'] - $result['discount_amount']);
        $this->assertSame(450.0, $result['grand_total']);
    }

    public function test_discount_cannot_produce_negative_total(): void
    {
        $result = $this->service->calculate(100.0, 200.0, 50.0, 0.0);

        // Discounted total should be max(100-200, 0) = 0, so grand = 0 + 50 + tax
        $this->assertGreaterThanOrEqual(0.0, $result['grand_total']);
    }

    public function test_tax_applied_to_discounted_subtotal_plus_shipping(): void
    {
        // subtotal=1000, discount=200, shipping=100, tax=10%
        // discounted = 800, taxable = 800+100 = 900, tax = 90
        $result = $this->service->calculate(1000.0, 200.0, 100.0, 0.1);

        $this->assertSame(90.0, $result['tax_amount']);
        $this->assertSame(990.0, $result['grand_total']); // 800 + 100 + 90
    }

    public function test_zero_subtotal(): void
    {
        $result = $this->service->calculate(0.0, 0.0, 0.0, 0.18);

        $this->assertSame(0.0, $result['grand_total']);
    }

    public function test_tax_is_rounded_to_two_decimals(): void
    {
        // 333.33 * 0.18 = 59.9994 → should round to 60.0
        $result = $this->service->calculate(333.33, 0.0, 0.0, 0.18);

        $this->assertSame(60.0, $result['tax_amount']);
    }

    public function test_grand_total_is_rounded_to_two_decimals(): void
    {
        $result = $this->service->calculate(99.99, 0.0, 9.99, 0.05);

        $this->assertIsFloat($result['grand_total']);
        $this->assertSame(round(99.99 + 9.99 + (99.99 + 9.99) * 0.05, 2), $result['grand_total']);
    }

    public function test_free_shipping_with_tax(): void
    {
        $result = $this->service->calculate(500.0, 0.0, 0.0, 0.05);

        $this->assertSame(0.0, $result['shipping_cost']);
        $this->assertSame(25.0, $result['tax_amount']);
        $this->assertSame(525.0, $result['grand_total']);
    }
}
