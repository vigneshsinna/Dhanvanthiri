<?php

namespace App\Modules\OrderManagement\Services;

use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Models\OrderStatusHistory;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderStateMachine
{
    private const TRANSITIONS = [
        'pending_payment' => ['paid', 'cancelled'],
        'paid' => ['processing', 'cancelled', 'refunded'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => ['completed', 'refunded'],
        'completed' => ['refunded', 'partially_refunded'],
    ];

    public function canTransition(string $from, string $to): bool
    {
        return in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }

    public function transition(Order $order, string $to, ?string $note = null, ?int $actorId = null): Order
    {
        if (!$this->canTransition($order->status, $to)) {
            throw new RuntimeException("Invalid status transition: {$order->status} -> {$to}");
        }

        DB::transaction(function () use ($order, $to, $note, $actorId): void {
            $from = $order->status;
            $order->status = $to;
            $order->save();

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'from_status' => $from,
                'to_status' => $to,
                'note' => $note,
                'changed_by' => $actorId,
            ]);
        });

        return $order->fresh();
    }
}
