<?php

namespace App\Modules\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VariantOptionValue extends Model
{
    protected $table = 'variant_option_values';
    protected $guarded = [];
    public $timestamps = false;

    public function option(): BelongsTo
    {
        return $this->belongsTo(VariantOption::class, 'variant_option_id');
    }
}
