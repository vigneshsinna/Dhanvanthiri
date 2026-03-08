<?php

namespace App\Modules\CartCheckout\Services;

class CartTotalsService
{
    public function calculate(float $subtotal, float $discountAmount, float $shippingCost, float $taxRate): array
    {
        $discountedTotal = max($subtotal - $discountAmount, 0);
        $taxAmount = ($discountedTotal + $shippingCost) * $taxRate;

        return [
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'shipping_cost' => $shippingCost,
            'tax_amount' => round($taxAmount, 2),
            'grand_total' => round($discountedTotal + $shippingCost + $taxAmount, 2),
        ];
    }
}
