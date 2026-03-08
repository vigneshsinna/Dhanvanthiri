<?php

namespace Tests\Unit;

use App\Modules\CartCheckout\Services\StockReservationService;
use PHPUnit\Framework\TestCase;

/**
 * StockReservationService unit tests.
 * Tests the service constants and method signatures.
 * Full integration tests require database; these verify structural contracts.
 */
class StockReservationServiceTest extends TestCase
{
    private StockReservationService $service;

    protected function setUp(): void
    {
        $this->service = new StockReservationService();
    }

    public function test_service_class_exists(): void
    {
        $this->assertInstanceOf(StockReservationService::class, $this->service);
    }

    public function test_reservation_ttl_is_15_minutes(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $ttl = $reflection->getConstant('RESERVATION_TTL_MINUTES');
        $this->assertSame(15, $ttl);
    }

    public function test_reserveForCart_method_exists(): void
    {
        $this->assertTrue(method_exists($this->service, 'reserveForCart'));
    }

    public function test_confirmForOrder_method_exists(): void
    {
        $this->assertTrue(method_exists($this->service, 'confirmForOrder'));
    }

    public function test_releaseForCart_method_exists(): void
    {
        $this->assertTrue(method_exists($this->service, 'releaseForCart'));
    }

    public function test_releaseExpired_method_exists(): void
    {
        $this->assertTrue(method_exists($this->service, 'releaseExpired'));
    }

    public function test_getAvailableStock_is_private(): void
    {
        $method = new \ReflectionMethod($this->service, 'getAvailableStock');
        $this->assertTrue($method->isPrivate(), 'getAvailableStock must be private');
    }

    public function test_getAvailableStock_accepts_nullable_variant_id(): void
    {
        $method = new \ReflectionMethod($this->service, 'getAvailableStock');
        $params = $method->getParameters();
        $this->assertCount(2, $params);
        $this->assertSame('productId', $params[0]->getName());
        $this->assertSame('variantId', $params[1]->getName());
        $this->assertTrue($params[1]->getType()->allowsNull());
    }
}
