<?php

namespace App\Modules\Catalog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

class Product extends Model
{
    protected $table = 'products';
    protected $guarded = [];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $appends = ['primary_image_url', 'avg_rating', 'review_count'];

    public function getPrimaryImageUrlAttribute(): ?string
    {
        $image = $this->relationLoaded('images')
            ? $this->images->firstWhere('is_primary', true)
            : $this->images()->where('is_primary', true)->first();

        return $image?->path;
    }

    public function getAvgRatingAttribute(): ?float
    {
        if ($this->relationLoaded('approvedReviews')) {
            $avg = $this->approvedReviews->avg('rating');
            return $avg ? round($avg, 1) : null;
        }
        return null;
    }

    public function getReviewCountAttribute(): int
    {
        if ($this->relationLoaded('approvedReviews')) {
            return $this->approvedReviews->count();
        }
        return 0;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(ProductImage::class)->where('is_primary', true);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tags');
    }

    public function variantOptions(): HasMany
    {
        return $this->hasMany(VariantOption::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->whereRaw('MATCH(name, description, short_description) AGAINST(? IN BOOLEAN MODE)', [$term]);
    }

    public function getEffectivePrice(): float
    {
        return (float) $this->price;
    }

    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }
}
