<?php

namespace Tests\Unit;

use App\Modules\OrderManagement\Services\CustomerNotificationService;
use PHPUnit\Framework\TestCase;

/**
 * Tests for CustomerNotificationService template interpolation and template coverage.
 * Since this service relies heavily on Eloquent models and Mail facade,
 * we test the publicly available business logic via reflection where needed,
 * and verify the template map is complete.
 */
class CustomerNotificationServiceTest extends TestCase
{
    private CustomerNotificationService $service;

    protected function setUp(): void
    {
        $this->service = new CustomerNotificationService();
    }

    /**
     * @dataProvider notificationTypeProvider
     */
    public function test_all_lifecycle_notification_types_exist(string $type): void
    {
        $templates = $this->getTemplates();
        $this->assertArrayHasKey($type, $templates, "Template missing for notification type: {$type}");
        $this->assertArrayHasKey('subject', $templates[$type]);
        $this->assertArrayHasKey('body', $templates[$type]);
    }

    public static function notificationTypeProvider(): array
    {
        return [
            'order_confirmed'     => ['order_confirmed'],
            'payment_success'     => ['payment_success'],
            'payment_failed'      => ['payment_failed'],
            'shipment_dispatched' => ['shipment_dispatched'],
            'delivered'           => ['delivered'],
            'return_received'     => ['return_received'],
            'return_approved'     => ['return_approved'],
            'return_rejected'     => ['return_rejected'],
            'refund_processed'    => ['refund_processed'],
            'order_cancelled'     => ['order_cancelled'],
        ];
    }

    public function test_interpolate_replaces_placeholders(): void
    {
        $method = new \ReflectionMethod($this->service, 'interpolate');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->service,
            'Order #{order_number} total ₹{grand_total}',
            ['order_number' => 'ORD-001', 'grand_total' => '649.60']
        );

        $this->assertSame('Order #ORD-001 total ₹649.60', $result);
    }

    public function test_interpolate_handles_extra_data(): void
    {
        $method = new \ReflectionMethod($this->service, 'interpolate');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->service,
            'Tracking: {tracking_number}',
            ['tracking_number' => 'BD123456']
        );

        $this->assertSame('Tracking: BD123456', $result);
    }

    public function test_interpolate_leaves_unknown_placeholders_untouched(): void
    {
        $method = new \ReflectionMethod($this->service, 'interpolate');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->service,
            'Hello {name}, order {order_number}',
            ['order_number' => 'ORD-001']
        );

        $this->assertSame('Hello {name}, order ORD-001', $result);
    }

    public function test_all_templates_use_order_number_placeholder(): void
    {
        $templates = $this->getTemplates();
        foreach ($templates as $type => $template) {
            $this->assertStringContainsString(
                '{order_number}',
                $template['subject'],
                "Template '{$type}' subject must reference {order_number}"
            );
        }
    }

    public function test_refund_template_uses_refund_amount(): void
    {
        $templates = $this->getTemplates();
        $this->assertStringContainsString('{refund_amount}', $templates['refund_processed']['body']);
    }

    public function test_shipment_template_uses_tracking_number(): void
    {
        $templates = $this->getTemplates();
        $this->assertStringContainsString('{tracking_number}', $templates['shipment_dispatched']['body']);
    }

    public function test_template_count_is_ten(): void
    {
        $templates = $this->getTemplates();
        $this->assertCount(10, $templates, 'All 10 lifecycle notification types must be defined');
    }

    private function getTemplates(): array
    {
        $reflection = new \ReflectionClass($this->service);
        $prop = $reflection->getConstant('TEMPLATES');
        return $prop;
    }
}
