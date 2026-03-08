<?php

namespace App\Modules\CartCheckout\Services;

class CouponValidationService
{
    public function validate(array $coupon, float $subtotal, ?int $usedCount = null): array
    {
        if (($coupon['is_active'] ?? false) !== true) {
            return ['valid' => false, 'reason' => 'Coupon inactive'];
        }

        if (isset($coupon['min_order_amount']) && $subtotal < (float) $coupon['min_order_amount']) {
            return ['valid' => false, 'reason' => 'Minimum order amount not reached'];
        }

        if (isset($coupon['usage_limit']) && $usedCount !== null && $usedCount >= (int) $coupon['usage_limit']) {
            return ['valid' => false, 'reason' => 'Usage limit reached'];
        }

        return ['valid' => true, 'reason' => null];
    }

    public function calculate(array $coupon, float $subtotal): float
    {
        $type = $coupon['type'] ?? 'fixed';
        $value = (float) ($coupon['value'] ?? 0);

        return match ($type) {
            'percent' => min($subtotal * ($value / 100), (float) ($coupon['max_discount_amount'] ?? PHP_FLOAT_MAX)),
            'fixed' => min($value, $subtotal),
            default => 0.0,
        };
    }
}
