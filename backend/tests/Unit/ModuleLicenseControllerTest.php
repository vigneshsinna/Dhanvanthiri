<?php

namespace Tests\Unit;

use App\Modules\Admin\Http\Controllers\ModuleLicenseController;
use App\Modules\Admin\Models\FeatureModule;
use PHPUnit\Framework\TestCase;

class ModuleLicenseControllerTest extends TestCase
{
    public function test_module_license_controller_exposes_expected_actions(): void
    {
        $expectedMethods = [
            'index',
            'show',
            'store',
            'update',
            'toggle',
            'validateLicense',
            'updateCredentials',
            'health',
            'requestActivation',
        ];

        foreach ($expectedMethods as $method) {
            $this->assertTrue(
                method_exists(ModuleLicenseController::class, $method),
                "Expected method {$method} to exist on ModuleLicenseController"
            );
        }
    }

    public function test_feature_module_model_has_required_casts(): void
    {
        $casts = (new FeatureModule())->getCasts();

        $this->assertSame('boolean', $casts['is_enabled'] ?? null);
        $this->assertSame('date', $casts['valid_from'] ?? null);
        $this->assertSame('date', $casts['valid_to'] ?? null);
        $this->assertSame('array', $casts['config_json'] ?? null);
        $this->assertSame('datetime', $casts['last_validated_at'] ?? null);
        $this->assertSame('datetime', $casts['activated_on'] ?? null);
    }

    public function test_api_routes_include_module_license_endpoints(): void
    {
        $routesFile = file_get_contents(__DIR__ . '/../../routes/api.php');

        $this->assertIsString($routesFile);
        $this->assertStringContainsString("Route::get('/modules'", $routesFile);
        $this->assertStringContainsString("Route::post('/modules'", $routesFile);
        $this->assertStringContainsString("Route::put('/modules/{id}/toggle'", $routesFile);
        $this->assertStringContainsString("Route::post('/modules/{id}/validate-license'", $routesFile);
        $this->assertStringContainsString("Route::put('/modules/{id}/credentials'", $routesFile);
        $this->assertStringContainsString("Route::get('/modules/{id}/health'", $routesFile);
    }
}
