<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Modules\OrderManagement\Jobs\AutoCompleteOrdersJob;
use App\Modules\OrderManagement\Jobs\CancelAbandonedOrdersJob;
use App\Modules\CartCheckout\Services\CartExpirationJob;
use App\Modules\CartCheckout\Jobs\ReleaseExpiredReservationsJob;
use App\Modules\CMS\Jobs\ScheduledPublishJob;
use App\Modules\CMS\Jobs\RegenerateSitemapJob;
use App\Modules\Admin\Jobs\LowStockDigestJob;
use App\Modules\Admin\Jobs\WeeklyRevenueReportJob;
use App\Modules\Admin\Jobs\DailyAnalyticsSnapshotJob;
use App\Modules\Payment\Jobs\PaymentRecoveryDispatchJob;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('queue:work database --stop-when-empty --queue=high,notifications,default --tries=3 --backoff=5 --max-time=50 --memory=128')
            ->everyMinute()
            ->withoutOverlapping();

        $schedule->job(new PaymentRecoveryDispatchJob())->everyFiveMinutes();
        $schedule->job(new CancelAbandonedOrdersJob())->hourly();

        $schedule->job(new AutoCompleteOrdersJob())->daily();
        $schedule->job(new CartExpirationJob())->daily();
        $schedule->job(new ReleaseExpiredReservationsJob())->everyFiveMinutes();
        $schedule->job(new ScheduledPublishJob())->everyTenMinutes();
        $schedule->job(new RegenerateSitemapJob())->daily();
        $schedule->job(new LowStockDigestJob())->dailyAt('08:00');
        $schedule->job(new DailyAnalyticsSnapshotJob())->dailyAt('01:30');
        $schedule->job(new WeeklyRevenueReportJob())->weeklyOn(1, '09:00');
    }
}
