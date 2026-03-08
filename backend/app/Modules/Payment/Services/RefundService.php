<?php

namespace App\Modules\Payment\Services;

use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\Refund;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Services\OrderStateMachine;

class RefundService
{
    public function process(int $orderId, array $payload): array
    {
        $order = Order::findOrFail($orderId);
        $payment = Payment::where('order_id', $orderId)->where('status', 'paid')->latest()->firstOrFail();

        $amount = (float) $payload['amount'];
        if ($amount > (float) $payment->amount_decimal) {
            throw new \RuntimeException('Refund amount exceeds payment amount');
        }

        $refund = Refund::create([
            'payment_id' => $payment->id,
            'amount' => $amount,
            'reason' => (string) $payload['reason'],
            'status' => 'pending',
            'processed_by' => $payload['processed_by'] ?? null,
        ]);

        $isFullRefund = $amount >= (float) $payment->amount_decimal;
        $newPaymentStatus = $isFullRefund ? 'refunded' : 'partially_refunded';
        $payment->update(['status' => $newPaymentStatus]);

        $sm = app(OrderStateMachine::class);
        $targetStatus = $isFullRefund ? 'refunded' : 'partially_refunded';
        if ($sm->canTransition($order->status, $targetStatus)) {
            $sm->transition($order, $targetStatus, 'Refund: ' . $payload['reason'], $payload['processed_by'] ?? null);
        }

        return [
            'refund_id' => $refund->id,
            'order_id' => $orderId,
            'status' => $refund->status,
            'amount' => $refund->amount,
            'reason' => $refund->reason,
            'payment_status' => $newPaymentStatus,
        ];
    }
}
