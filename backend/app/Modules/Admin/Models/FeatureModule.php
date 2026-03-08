<?php

namespace App\Modules\Admin\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeatureModule extends Model
{
    protected $table = 'feature_modules';

    protected $guarded = [];

    protected $casts = [
        'is_enabled' => 'boolean',
        'valid_from' => 'date',
        'valid_to' => 'date',
        'config_json' => 'array',
        'last_validated_at' => 'datetime',
        'activated_on' => 'datetime',
    ];

    public function activatedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'activated_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'updated_by');
    }
}
