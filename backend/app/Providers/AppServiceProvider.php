<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Gateways\RazorpayGateway;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, function () {
            return new RazorpayGateway();
        });
    }

    public function boot(): void
    {
    }
}
