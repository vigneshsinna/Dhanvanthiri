<?php

namespace App\Modules\OrderManagement\Services;

use Carbon\CarbonImmutable;

class OrderNumberService
{
    public function next(): string
    {
        $date = CarbonImmutable::now()->format('Ymd');
        $sequence = str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);

        return "ORD-{$date}-{$sequence}";
    }
}
