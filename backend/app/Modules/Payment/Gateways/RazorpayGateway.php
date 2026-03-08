<?php

namespace App\Modules\Payment\Gateways;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Models\Payment;
use App\Modules\OrderManagement\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RazorpayGateway implements PaymentGatewayInterface
{
    public function createIntent(Order $order): array
    {
        $endpoint = rtrim((string) config('payment.gateways.razorpay.base_url'), '/');

        $response = Http::withBasicAuth(
            (string) config('payment.gateways.razorpay.key_id'),
            (string) config('payment.gateways.razorpay.key_secret')
        )
            ->post($endpoint . '/orders', [
                'amount' => (int) round((float) $order->grand_total * 100),
                'currency' => $order->currency,
                'receipt' => $order->order_number,
                'notes' => ['order_id' => $order->id],
            ])
            ->throw()
            ->json();

        return [
            'gateway' => 'razorpay',
            'razorpay_order_id' => $response['id'] ?? null,
            'amount' => $response['amount'] ?? 0,
            'currency' => $response['currency'] ?? $order->currency,
            'key_id' => config('payment.gateways.razorpay.key_id'),
        ];
    }

    public function confirmPayment(string $gatewayOrderId, string $gatewayPaymentId, string $signature): array
    {
        return [
            'gateway_order_id' => $gatewayOrderId,
            'gateway_payment_id' => $gatewayPaymentId,
            'signature' => $signature,
            'status' => 'paid',
        ];
    }

    public function refund(Payment $payment, float $amount, string $reason): array
    {
        return [
            'status' => 'pending',
            'amount' => $amount,
            'reason' => $reason,
            'gateway_refund_id' => null,
        ];
    }

    public function verifyWebhook(Request $request): bool
    {
        $header = (string) $request->header('X-Razorpay-Signature', '');
        $body = (string) $request->getContent();
        $secret = (string) config('payment.gateways.razorpay.webhook_secret');

        if ($header === '' || $secret === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $body, $secret);

        return hash_equals($expected, $header);
    }

    public function parseWebhook(Request $request): array
    {
        return $request->json()->all();
    }
}
