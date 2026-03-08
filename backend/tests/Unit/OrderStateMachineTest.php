<?php

namespace Tests\Unit;

use App\Modules\OrderManagement\Services\OrderStateMachine;
use PHPUnit\Framework\TestCase;

class OrderStateMachineTest extends TestCase
{
    private OrderStateMachine $machine;

    protected function setUp(): void
    {
        $this->machine = new OrderStateMachine();
    }

    public function test_valid_transition_matrix(): void
    {
        $this->assertTrue($this->machine->canTransition('pending_payment', 'paid'));
        $this->assertFalse($this->machine->canTransition('pending_payment', 'shipped'));
        $this->assertTrue($this->machine->canTransition('paid', 'processing'));
        $this->assertFalse($this->machine->canTransition('shipped', 'cancelled'));
    }

    public function test_pending_payment_can_go_to_paid(): void
    {
        $this->assertTrue($this->machine->canTransition('pending_payment', 'paid'));
    }

    public function test_pending_payment_can_go_to_cancelled(): void
    {
        $this->assertTrue($this->machine->canTransition('pending_payment', 'cancelled'));
    }

    public function test_paid_can_go_to_processing(): void
    {
        $this->assertTrue($this->machine->canTransition('paid', 'processing'));
    }

    public function test_paid_can_go_to_cancelled(): void
    {
        $this->assertTrue($this->machine->canTransition('paid', 'cancelled'));
    }

    public function test_paid_can_go_to_refunded(): void
    {
        $this->assertTrue($this->machine->canTransition('paid', 'refunded'));
    }

    public function test_processing_can_go_to_shipped(): void
    {
        $this->assertTrue($this->machine->canTransition('processing', 'shipped'));
    }

    public function test_processing_can_go_to_cancelled(): void
    {
        $this->assertTrue($this->machine->canTransition('processing', 'cancelled'));
    }

    public function test_shipped_can_go_to_delivered(): void
    {
        $this->assertTrue($this->machine->canTransition('shipped', 'delivered'));
    }

    public function test_shipped_cannot_go_backward(): void
    {
        $this->assertFalse($this->machine->canTransition('shipped', 'processing'));
        $this->assertFalse($this->machine->canTransition('shipped', 'paid'));
    }

    public function test_delivered_can_go_to_completed(): void
    {
        $this->assertTrue($this->machine->canTransition('delivered', 'completed'));
    }

    public function test_delivered_can_go_to_refunded(): void
    {
        $this->assertTrue($this->machine->canTransition('delivered', 'refunded'));
    }

    public function test_completed_can_go_to_refunded(): void
    {
        $this->assertTrue($this->machine->canTransition('completed', 'refunded'));
    }

    public function test_completed_can_go_to_partially_refunded(): void
    {
        $this->assertTrue($this->machine->canTransition('completed', 'partially_refunded'));
    }

    public function test_unknown_status_returns_false(): void
    {
        $this->assertFalse($this->machine->canTransition('nonexistent', 'paid'));
    }

    public function test_same_status_transition_is_invalid(): void
    {
        $this->assertFalse($this->machine->canTransition('paid', 'paid'));
    }
}
