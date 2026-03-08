<?php

namespace App\Modules\Shared\Http\Middleware;

use App\Modules\Admin\Models\FeatureModule;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class FeatureModuleEnabledMiddleware
{
    public function handle(Request $request, Closure $next, string $moduleCode)
    {
        // Backward-compatible: if migration has not run, do not block traffic.
        if (!Schema::hasTable('feature_modules')) {
            return $next($request);
        }

        $module = FeatureModule::query()
            ->where('module_code', strtolower($moduleCode))
            ->first();

        if ($module && !$module->is_enabled) {
            abort(403, 'Feature module is disabled');
        }

        return $next($request);
    }
}
