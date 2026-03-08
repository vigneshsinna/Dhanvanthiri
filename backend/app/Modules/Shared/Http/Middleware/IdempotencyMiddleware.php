<?php

namespace App\Modules\Shared\Http\Middleware;

use App\Modules\Shared\Models\IdempotencyKey;
use Closure;
use Illuminate\Http\Request;

class IdempotencyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $key = $request->header('Idempotency-Key');
        if (!$key) {
            return $next($request);
        }

        $hash = hash('sha256', $request->method() . '|' . $request->path() . '|' . json_encode($request->all()));

        $cached = IdempotencyKey::query()
            ->where('idempotency_key', $key)
            ->where('request_hash', $hash)
            ->first();

        if ($cached) {
            return response($cached->response_body, $cached->status_code)
                ->header('Content-Type', 'application/json');
        }

        $response = $next($request);

        IdempotencyKey::query()->create([
            'idempotency_key' => $key,
            'request_hash' => $hash,
            'status_code' => $response->getStatusCode(),
            'response_body' => (string) $response->getContent(),
            'expires_at' => now()->addMinutes(config('payment.idempotency_ttl_minutes', 60)),
        ]);

        return $response;
    }
}
