<?php

namespace App\Modules\Payment\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentWebhook extends Model
{
    protected $table = 'payment_webhooks';
    protected $guarded = [];

    protected $casts = [
        'processed' => 'boolean',
        'processed_at' => 'datetime',
    ];
}
