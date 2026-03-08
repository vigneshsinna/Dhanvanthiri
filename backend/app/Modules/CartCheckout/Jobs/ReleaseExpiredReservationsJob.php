<?php

namespace App\Modules\CartCheckout\Jobs;

use App\Modules\CartCheckout\Services\StockReservationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ReleaseExpiredReservationsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(StockReservationService $service): void
    {
        $count = $service->releaseExpired();
        if ($count > 0) {
            Log::info("Released {$count} expired stock reservations");
        }
    }
}
