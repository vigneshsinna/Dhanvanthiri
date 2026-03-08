<?php

namespace App\Modules\CartCheckout\Http\Middleware;

use App\Modules\CartCheckout\Models\Cart;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartSessionMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()) {
            $cart = Cart::query()->firstOrCreate(['user_id' => $request->user()->id], ['expires_at' => now()->addDays(30)]);
        } else {
            $token = (string) ($request->header('X-Cart-Token') ?: $request->cookie('cart_token') ?: Str::uuid());
            $cart = Cart::query()->firstOrCreate(['session_id' => $token], ['expires_at' => now()->addDays(30)]);
            cookie()->queue(cookie('cart_token', $token, 60 * 24 * 30, '/', null, false, true, false, 'Lax'));
        }

        $request->attributes->set('cart', $cart);

        return $next($request);
    }
}
