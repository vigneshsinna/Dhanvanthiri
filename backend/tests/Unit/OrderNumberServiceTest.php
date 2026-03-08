<?php

namespace Tests\Unit;

use App\Modules\OrderManagement\Services\OrderNumberService;
use PHPUnit\Framework\TestCase;

class OrderNumberServiceTest extends TestCase
{
    private OrderNumberService $service;

    protected function setUp(): void
    {
        $this->service = new OrderNumberService();
    }

    public function test_generates_string(): void
    {
        $this->assertIsString($this->service->next());
    }

    public function test_format_matches_pattern(): void
    {
        $orderNumber = $this->service->next();
        $this->assertMatchesRegularExpression('/^ORD-\d{8}-\d{4}$/', $orderNumber);
    }

    public function test_contains_today_date(): void
    {
        $orderNumber = $this->service->next();
        $today = date('Ymd');
        $this->assertStringContainsString($today, $orderNumber);
    }

    public function test_generates_unique_numbers(): void
    {
        $numbers = [];
        for ($i = 0; $i < 50; $i++) {
            $numbers[] = $this->service->next();
        }
        // With 4-digit random sequence, collisions in 50 calls are extremely unlikely
        $this->assertGreaterThan(40, count(array_unique($numbers)));
    }

    public function test_prefix_is_ord(): void
    {
        $orderNumber = $this->service->next();
        $this->assertStringStartsWith('ORD-', $orderNumber);
    }
}
