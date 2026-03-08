<?php

namespace App\Modules\Payment\Jobs;

use App\Modules\Payment\Models\Refund;
use App\Modules\OrderManagement\Services\CustomerNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessRefundJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public int $refundId)
    {
    }

    public function handle(CustomerNotificationService $notifier): void
    {
        $refund = Refund::with('payment.order')->find($this->refundId);
        if (!$refund) {
            Log::warning("ProcessRefundJob: Refund {$this->refundId} not found");
            return;
        }

        $order = $refund->payment?->order;
        if ($order) {
            $notifier->notify($order, 'refund_processed', [
                'refund_amount' => number_format((float) $refund->amount, 2),
            ]);
        }
    }
}
