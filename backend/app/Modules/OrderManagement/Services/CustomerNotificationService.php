<?php

namespace App\Modules\OrderManagement\Services;

use App\Modules\OrderManagement\Models\CustomerNotification;
use App\Modules\OrderManagement\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CustomerNotificationService
{
    /**
     * Notification templates keyed by event type.
     */
    private const TEMPLATES = [
        'order_confirmed' => [
            'subject' => 'Order #{order_number} Confirmed',
            'body'    => 'Thank you for your order! Your order #{order_number} has been confirmed and is being processed. Grand total: Rs {grand_total}.',
        ],
        'payment_success' => [
            'subject' => 'Payment Received for Order #{order_number}',
            'body'    => 'We have received your payment of Rs {grand_total} for order #{order_number}. Your order is now being prepared.',
        ],
        'payment_failed' => [
            'subject' => 'Payment Failed for Order #{order_number}',
            'body'    => 'Unfortunately, the payment for order #{order_number} could not be processed. Please try again or contact support.',
        ],
        'shipment_dispatched' => [
            'subject' => 'Order #{order_number} Has Been Shipped',
            'body'    => 'Great news! Your order #{order_number} has been shipped. Track your delivery with tracking number: {tracking_number}.',
        ],
        'delivered' => [
            'subject' => 'Order #{order_number} Delivered',
            'body'    => 'Your order #{order_number} has been delivered. We hope you enjoy your purchase! Please leave a review.',
        ],
        'return_received' => [
            'subject' => 'Return Request Received for Order #{order_number}',
            'body'    => 'We have received your return request for order #{order_number}. We will review it and get back to you shortly.',
        ],
        'return_approved' => [
            'subject' => 'Return Approved for Order #{order_number}',
            'body'    => 'Your return for order #{order_number} has been approved. Please ship the items back as per the return instructions.',
        ],
        'return_rejected' => [
            'subject' => 'Return Request Declined for Order #{order_number}',
            'body'    => 'Unfortunately, your return request for order #{order_number} could not be approved. Please contact support for details.',
        ],
        'refund_processed' => [
            'subject' => 'Refund Processed for Order #{order_number}',
            'body'    => 'A refund of Rs {refund_amount} has been processed for order #{order_number}. It may take 5-7 business days to reflect.',
        ],
        'order_cancelled' => [
            'subject' => 'Order #{order_number} Cancelled',
            'body'    => 'Your order #{order_number} has been cancelled as requested. If a payment was made, a refund will be initiated.',
        ],
    ];

    /**
     * Send a notification for an order lifecycle event.
     */
    public function notify(Order $order, string $type, array $extraData = []): ?CustomerNotification
    {
        $template = self::TEMPLATES[$type] ?? null;
        if (!$template) {
            Log::warning("Unknown notification type: {$type}");
            return null;
        }

        $vars = array_merge([
            'order_number' => $order->order_number,
            'grand_total'  => number_format((float) $order->grand_total, 2),
        ], $extraData);

        $subject = $this->interpolate($template['subject'], $vars);
        $body = $this->interpolate($template['body'], $vars);

        $targets = $this->resolveTargets($order);
        if (empty($targets)) {
            Log::warning("No notification targets for type={$type} order={$order->order_number}");
            return null;
        }

        $firstNotification = null;

        foreach ($targets as $target) {
            $notification = CustomerNotification::create([
                'user_id'   => $order->user_id,
                'order_id'  => $order->id,
                'channel'   => $target['channel'],
                'type'      => $type,
                'recipient' => $target['recipient'],
                'subject'   => $subject,
                'body'      => $body,
                'status'    => 'pending',
            ]);

            if (!$firstNotification) {
                $firstNotification = $notification;
            }

            try {
                $this->deliver(
                    $target['channel'],
                    $target['recipient'],
                    $subject,
                    $body,
                    ['order_number' => $order->order_number, 'type' => $type]
                );

                $notification->update(['status' => 'sent', 'sent_at' => now()]);
            } catch (\Throwable $e) {
                Log::error("Failed to send {$target['channel']} notification #{$notification->id}: {$e->getMessage()}");
                $notification->update(['status' => 'failed', 'failure_reason' => $e->getMessage()]);
            }
        }

        return $firstNotification;
    }

    /**
     * Resolve channel targets based on available contact data and configured providers.
     *
     * @return array<int, array{channel:string,recipient:string}>
     */
    private function resolveTargets(Order $order): array
    {
        $targets = [];

        $email = $order->user?->email ?? $order->guest_email;
        if ($email) {
            $targets[] = ['channel' => 'email', 'recipient' => $email];
        }

        $phone = $this->normalizePhone(
            $order->guest_phone
            ?? $order->user?->phone
            ?? $order->shippingAddress?->phone
        );

        if ($phone) {
            if ($this->webhookUrl('sms')) {
                $targets[] = ['channel' => 'sms', 'recipient' => $phone];
            }

            if ($this->webhookUrl('whatsapp')) {
                $targets[] = ['channel' => 'whatsapp', 'recipient' => $phone];
            }
        }

        return $targets;
    }

    private function deliver(string $channel, string $recipient, string $subject, string $body, array $meta = []): void
    {
        if ($channel === 'email') {
            Mail::raw($body, function ($message) use ($recipient, $subject) {
                $message->to($recipient)->subject($subject);
            });
            return;
        }

        $url = $this->webhookUrl($channel);
        if (!$url) {
            throw new \RuntimeException(strtoupper($channel) . ' webhook URL is not configured');
        }

        $response = Http::timeout(12)->acceptJson()->post($url, [
            'channel' => $channel,
            'to' => $recipient,
            'subject' => $subject,
            'message' => $body,
            'meta' => $meta,
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException(strtoupper($channel) . ' provider returned HTTP ' . $response->status());
        }
    }

    private function webhookUrl(string $channel): ?string
    {
        return match ($channel) {
            'sms' => env('CUSTOMER_SMS_WEBHOOK_URL'),
            'whatsapp' => env('CUSTOMER_WHATSAPP_WEBHOOK_URL'),
            default => null,
        };
    }

    private function normalizePhone(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $normalized = preg_replace('/[^\d+]/', '', $value);
        return $normalized !== '' ? $normalized : null;
    }

    private function interpolate(string $template, array $vars): string
    {
        foreach ($vars as $key => $value) {
            $template = str_replace("{{$key}}", (string) $value, $template);
        }

        return $template;
    }
}
