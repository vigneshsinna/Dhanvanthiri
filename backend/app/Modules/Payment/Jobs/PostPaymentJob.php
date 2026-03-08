<?php

namespace App\Modules\Payment\Jobs;

use App\Modules\OrderManagement\Models\Order;
use App\Modules\OrderManagement\Services\CustomerNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PostPaymentJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public int $orderId)
    {
    }

    public function handle(CustomerNotificationService $notifier): void
    {
        $order = Order::find($this->orderId);
        if (!$order) {
            Log::warning("PostPaymentJob: Order {$this->orderId} not found");
            return;
        }

        // Send order confirmation notification if not already sent
        $notifier->notify($order, 'order_confirmed');
    }
}
