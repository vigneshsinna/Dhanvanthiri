<?php

namespace App\Modules\CartCheckout\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingMethod extends Model
{
    protected $table = 'shipping_methods';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
        'price' => 'decimal:2',
        'min_order_free' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }
}
