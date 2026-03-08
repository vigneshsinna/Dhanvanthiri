<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;

class OAuthController
{
    public function redirect(string $provider)
    {
        return ApiResponse::success([
            'provider' => $provider,
            'redirect_url' => "/oauth/{$provider}/mock",
        ]);
    }

    public function callback(string $provider)
    {
        return ApiResponse::success([
            'provider' => $provider,
            'access_token' => 'oauth-token',
        ], 'OAuth login successful');
    }
}
