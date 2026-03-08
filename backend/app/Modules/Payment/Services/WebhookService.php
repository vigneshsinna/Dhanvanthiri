<?php

namespace App\Modules\Payment\Services;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Jobs\ProcessRazorpayWebhookJob;
use App\Modules\Payment\Models\PaymentWebhook;
use Illuminate\Http\Request;

class WebhookService
{
    public function __construct(private readonly PaymentGatewayInterface $gateway)
    {
    }

    public function handleRazorpay(Request $request): void
    {
        if (!$this->gateway->verifyWebhook($request)) {
            abort(401, 'Invalid webhook signature');
        }

        $payload = $this->gateway->parseWebhook($request);
        $eventId = data_get($payload, 'payload.payment.entity.id')
            ?? data_get($payload, 'payload.order.entity.id')
            ?? data_get($payload, 'event');

        // Idempotent: skip if this webhook event was already recorded
        $existing = PaymentWebhook::where('gateway', 'razorpay')
            ->where('gateway_event_id', (string) $eventId)
            ->exists();

        if ($existing) {
            return;
        }

        $webhook = PaymentWebhook::query()->create([
            'gateway' => 'razorpay',
            'gateway_event_id' => (string) $eventId,
            'event_type' => (string) data_get($payload, 'event', 'unknown'),
            'payload' => (string) $request->getContent(),
            'signature' => (string) $request->header('X-Razorpay-Signature', ''),
            'processed' => false,
        ]);

        ProcessRazorpayWebhookJob::dispatch($webhook->id);
    }
}
