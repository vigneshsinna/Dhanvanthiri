<?php

return [
    'enabled' => env('HOSTINGER_SHARED_MODE', true),
    'queue_burst_command' => 'queue:work database --stop-when-empty --queue=high,notifications,default --tries=3 --backoff=5 --max-time=50 --memory=128',
    'scheduler' => '* * * * * php artisan schedule:run',
];
