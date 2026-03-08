<?php

namespace App\Modules\CartCheckout\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockReservation extends Model
{
    protected $table = 'stock_reservations';
    protected $guarded = [];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Catalog\Models\Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Catalog\Models\ProductVariant::class, 'variant_id');
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\OrderManagement\Models\Order::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
