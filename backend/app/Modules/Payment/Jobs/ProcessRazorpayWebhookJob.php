<?php

namespace App\Modules\Payment\Jobs;

use App\Modules\Payment\Models\PaymentWebhook;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessRazorpayWebhookJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public int $webhookId)
    {
    }

    public function handle(): void
    {
        $webhook = PaymentWebhook::query()->find($this->webhookId);
        if (!$webhook || $webhook->processed) {
            return;
        }

        $webhook->processed = true;
        $webhook->processed_at = now();
        $webhook->save();
    }
}
