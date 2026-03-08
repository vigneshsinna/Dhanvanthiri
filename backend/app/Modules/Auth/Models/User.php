<?php

namespace App\Modules\Auth\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'phone',
        'is_active',
        'email_verified_at',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role,
            'is_active' => $this->is_active,
        ];
    }

    public function oauthProviders(): HasMany
    {
        return $this->hasMany(OAuthProvider::class);
    }

    public function refreshTokens(): HasMany
    {
        return $this->hasMany(UserRefreshToken::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(\App\Modules\OrderManagement\Models\Order::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(\App\Modules\CartCheckout\Models\Address::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(\App\Modules\Catalog\Models\Review::class);
    }

    public function carts(): HasMany
    {
        return $this->hasMany(\App\Modules\CartCheckout\Models\Cart::class);
    }
}
