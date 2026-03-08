<?php

namespace App\Modules\Shared\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        $roles = explode('|', $role);
        if (!in_array($user->role, $roles, true)) {
            abort(403, 'Forbidden');
        }

        return $next($request);
    }
}
