<?php

return [
    'default' => env('PAYMENT_DEFAULT_GATEWAY', 'razorpay'),

    'gateways' => [
        'razorpay' => [
            'key_id' => env('RAZORPAY_KEY_ID'),
            'key_secret' => env('RAZORPAY_KEY_SECRET'),
            'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),
            'base_url' => env('RAZORPAY_BASE_URL', 'https://api.razorpay.com/v1'),
        ],
    ],

    'idempotency_ttl_minutes' => 60,

    'recovery_schedule_hours' => [1, 4, 24],
];
