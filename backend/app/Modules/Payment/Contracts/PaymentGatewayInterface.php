<?php

namespace App\Modules\Payment\Contracts;

use App\Modules\Payment\Models\Payment;
use App\Modules\OrderManagement\Models\Order;
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    public function createIntent(Order $order): array;

    public function confirmPayment(string $gatewayOrderId, string $gatewayPaymentId, string $signature): array;

    public function refund(Payment $payment, float $amount, string $reason): array;

    public function verifyWebhook(Request $request): bool;

    public function parseWebhook(Request $request): array;
}
