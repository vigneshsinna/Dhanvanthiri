<?php

namespace App\Modules\CartCheckout\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingZone extends Model
{
    protected $table = 'shipping_zones';
    protected $guarded = [];

    protected $casts = [
        'countries' => 'array',
    ];

    public function methods(): HasMany
    {
        return $this->hasMany(ShippingMethod::class);
    }
}
