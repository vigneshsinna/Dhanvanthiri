<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Admin\Models\FeatureModule;
use App\Modules\Admin\Services\ActivityLogService;
use App\Modules\Shared\Http\Resources\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ModuleLicenseController
{
    private const INTEGRATION_STATUSES = ['not_configured', 'configured', 'healthy', 'degraded', 'failed'];
    private const HEALTH_STATUSES = ['unknown', 'healthy', 'degraded', 'failed'];

    public function __construct(private readonly ActivityLogService $activityLogs)
    {
    }

    public function index(Request $request)
    {
        $query = FeatureModule::query()
            ->with(['activatedBy:id,name', 'updatedBy:id,name'])
            ->orderBy('module_name');

        if ($request->filled('enabled')) {
            $query->where('is_enabled', filter_var($request->input('enabled'), FILTER_VALIDATE_BOOLEAN));
        }

        $modules = $query->get();
        $isItUser = $this->isItUser($request);

        return ApiResponse::success([
            'data' => $modules->map(fn (FeatureModule $module) => $this->serializeModule($module, $isItUser))->values(),
        ]);
    }

    public function show(int $id, Request $request)
    {
        $module = FeatureModule::with(['activatedBy:id,name', 'updatedBy:id,name'])->findOrFail($id);

        return ApiResponse::success([
            'data' => $this->serializeModule($module, $this->isItUser($request)),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'module_code' => 'required|string|max:80|alpha_dash|unique:feature_modules,module_code',
            'module_name' => 'required|string|max:120',
            'description' => 'nullable|string|max:5000',
            'is_enabled' => 'sometimes|boolean',
            'license_type' => 'nullable|string|max:50',
            'license_key' => 'nullable|string|max:500',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'integration_status' => ['sometimes', Rule::in(self::INTEGRATION_STATUSES)],
            'health_status' => ['sometimes', Rule::in(self::HEALTH_STATUSES)],
            'vendor_name' => 'nullable|string|max:120',
            'notes' => 'nullable|string|max:5000',
            'config_json' => 'nullable|array',
        ]);

        $data['module_code'] = strtolower($data['module_code']);
        $data['updated_by'] = $request->user()->id;
        $data['is_enabled'] = $data['is_enabled'] ?? false;
        $data['integration_status'] = $data['integration_status'] ?? 'not_configured';
        $data['health_status'] = $data['health_status'] ?? 'unknown';

        if ($data['is_enabled']) {
            $data['activated_by'] = $request->user()->id;
            $data['activated_on'] = now();
        }

        $module = FeatureModule::create($data);
        $module->load(['activatedBy:id,name', 'updatedBy:id,name']);

        $this->activityLogs->log('module.created', $module, null, [
            'module_code' => $module->module_code,
            'module_name' => $module->module_name,
            'is_enabled' => $module->is_enabled,
        ]);

        return ApiResponse::success(
            ['data' => $this->serializeModule($module, true)],
            'Module license created',
            201
        );
    }

    public function update(int $id, Request $request)
    {
        $module = FeatureModule::findOrFail($id);
        $oldValues = $module->toArray();

        $data = $request->validate([
            'module_name' => 'sometimes|string|max:120',
            'description' => 'nullable|string|max:5000',
            'is_enabled' => 'sometimes|boolean',
            'license_type' => 'nullable|string|max:50',
            'license_key' => 'nullable|string|max:500',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'integration_status' => ['sometimes', Rule::in(self::INTEGRATION_STATUSES)],
            'health_status' => ['sometimes', Rule::in(self::HEALTH_STATUSES)],
            'vendor_name' => 'nullable|string|max:120',
            'notes' => 'nullable|string|max:5000',
            'config_json' => 'nullable|array',
        ]);

        if (array_key_exists('is_enabled', $data) && $data['is_enabled'] && !$module->is_enabled) {
            $data['activated_by'] = $request->user()->id;
            $data['activated_on'] = now();
        }

        $data['updated_by'] = $request->user()->id;

        $module->update($data);
        $module->load(['activatedBy:id,name', 'updatedBy:id,name']);

        $this->activityLogs->log('module.updated', $module, $oldValues, $module->toArray());

        return ApiResponse::success(['data' => $this->serializeModule($module, true)], 'Module license updated');
    }

    public function toggle(int $id, Request $request)
    {
        $module = FeatureModule::findOrFail($id);
        $oldValues = $module->toArray();

        $data = $request->validate([
            'is_enabled' => 'required|boolean',
            'notes' => 'nullable|string|max:5000',
        ]);

        $updates = [
            'is_enabled' => $data['is_enabled'],
            'updated_by' => $request->user()->id,
        ];

        if (array_key_exists('notes', $data)) {
            $updates['notes'] = $data['notes'];
        }

        if ($data['is_enabled'] && !$module->is_enabled) {
            $updates['activated_by'] = $request->user()->id;
            $updates['activated_on'] = now();
        }

        $module->update($updates);
        $module->load(['activatedBy:id,name', 'updatedBy:id,name']);

        $this->activityLogs->log(
            $data['is_enabled'] ? 'module.activated' : 'module.deactivated',
            $module,
            $oldValues,
            $module->toArray()
        );

        return ApiResponse::success(
            ['data' => $this->serializeModule($module, true)],
            $data['is_enabled'] ? 'Module activated' : 'Module deactivated'
        );
    }

    public function validateLicense(int $id, Request $request)
    {
        $module = FeatureModule::findOrFail($id);
        $oldValues = $module->toArray();

        $data = $request->validate([
            'license_key' => 'nullable|string|max:500',
        ]);

        if (array_key_exists('license_key', $data)) {
            $module->license_key = $data['license_key'];
        }

        $reasons = [];
        $isValid = true;

        if (empty($module->license_key)) {
            $isValid = false;
            $reasons[] = 'License key is missing';
        }

        if ($module->valid_to && now()->greaterThan($module->valid_to->endOfDay())) {
            $isValid = false;
            $reasons[] = 'License has expired';
        }

        if ($module->license_key && str_starts_with(strtoupper($module->license_key), 'INVALID')) {
            $isValid = false;
            $reasons[] = 'License key format is invalid';
        }

        $module->integration_status = $isValid
            ? ($module->config_json ? 'configured' : 'not_configured')
            : 'failed';
        $module->health_status = $isValid ? 'healthy' : 'failed';
        $module->last_validated_at = now();
        $module->updated_by = $request->user()->id;
        $module->save();
        $module->load(['activatedBy:id,name', 'updatedBy:id,name']);

        $this->activityLogs->log('module.license_validated', $module, $oldValues, [
            'is_valid' => $isValid,
            'reasons' => $reasons,
            'validated_at' => $module->last_validated_at?->toIso8601String(),
        ]);

        return ApiResponse::success([
            'data' => [
                'valid' => $isValid,
                'reasons' => $reasons,
                'module' => $this->serializeModule($module, true),
            ],
        ], $isValid ? 'License is valid' : 'License validation failed');
    }

    public function updateCredentials(int $id, Request $request)
    {
        $module = FeatureModule::findOrFail($id);
        $oldValues = $module->toArray();

        $data = $request->validate([
            'config_json' => 'required|array',
            'integration_status' => ['sometimes', Rule::in(self::INTEGRATION_STATUSES)],
            'notes' => 'nullable|string|max:5000',
        ]);

        $module->config_json = $data['config_json'];
        $module->integration_status = $data['integration_status'] ?? 'configured';
        if (array_key_exists('notes', $data)) {
            $module->notes = $data['notes'];
        }
        $module->updated_by = $request->user()->id;
        $module->save();
        $module->load(['activatedBy:id,name', 'updatedBy:id,name']);

        $this->activityLogs->log('module.credentials_updated', $module, $oldValues, [
            'integration_status' => $module->integration_status,
            'has_credentials' => !empty($module->config_json),
        ]);

        return ApiResponse::success(['data' => $this->serializeModule($module, true)], 'Module credentials updated');
    }

    public function health(int $id, Request $request)
    {
        $module = FeatureModule::findOrFail($id);

        $status = 'healthy';
        $checks = [];

        if (!$module->is_enabled) {
            $status = 'degraded';
            $checks[] = ['name' => 'enabled', 'status' => 'failed', 'message' => 'Module is disabled'];
        } else {
            $checks[] = ['name' => 'enabled', 'status' => 'passed', 'message' => 'Module is enabled'];
        }

        if ($module->valid_to && now()->greaterThan($module->valid_to->endOfDay())) {
            $status = 'failed';
            $checks[] = ['name' => 'license_expiry', 'status' => 'failed', 'message' => 'License has expired'];
        } else {
            $checks[] = ['name' => 'license_expiry', 'status' => 'passed', 'message' => 'License is within validity period'];
        }

        if (empty($module->config_json)) {
            if ($status === 'healthy') {
                $status = 'degraded';
            }
            $checks[] = ['name' => 'credentials', 'status' => 'failed', 'message' => 'Integration credentials are missing'];
        } else {
            $checks[] = ['name' => 'credentials', 'status' => 'passed', 'message' => 'Integration credentials are present'];
        }

        $module->health_status = $status;
        $module->updated_by = $request->user()->id;
        $module->save();

        return ApiResponse::success([
            'data' => [
                'module_id' => $module->id,
                'module_code' => $module->module_code,
                'status' => $status,
                'checked_at' => now()->toIso8601String(),
                'checks' => $checks,
            ],
        ]);
    }

    public function requestActivation(int $id, Request $request)
    {
        $module = FeatureModule::findOrFail($id);

        $data = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if ($module->is_enabled) {
            return ApiResponse::error('Module is already enabled', 'MODULE_ALREADY_ENABLED', [], 422);
        }

        $this->activityLogs->log('module.activation_requested', $module, null, [
            'reason' => $data['reason'],
            'requested_by' => $request->user()->id,
        ]);

        return ApiResponse::success([
            'data' => [
                'module_id' => $module->id,
                'requested_by' => $request->user()->id,
                'reason' => $data['reason'],
            ],
        ], 'Activation request submitted');
    }

    private function isItUser(Request $request): bool
    {
        return $request->user()?->role === 'super_admin';
    }

    private function serializeModule(FeatureModule $module, bool $isItUser): array
    {
        $licenseKey = $module->license_key;

        return [
            'id' => $module->id,
            'module_code' => $module->module_code,
            'module_name' => $module->module_name,
            'description' => $module->description,
            'is_enabled' => $module->is_enabled,
            'license_type' => $module->license_type,
            'license_key' => $isItUser ? $licenseKey : $this->maskLicenseKey($licenseKey),
            'valid_from' => $module->valid_from?->toDateString(),
            'valid_to' => $module->valid_to?->toDateString(),
            'integration_status' => $module->integration_status,
            'health_status' => $module->health_status,
            'last_validated_at' => $module->last_validated_at?->toIso8601String(),
            'vendor_name' => $module->vendor_name,
            'notes' => $module->notes,
            'config_json' => $isItUser ? ($module->config_json ?? []) : null,
            'has_credentials' => !empty($module->config_json),
            'activated_by' => $module->activated_by,
            'activated_by_name' => $module->activatedBy?->name,
            'activated_on' => $module->activated_on?->toIso8601String(),
            'updated_by' => $module->updated_by,
            'updated_by_name' => $module->updatedBy?->name,
            'updated_at' => $module->updated_at?->toIso8601String(),
        ];
    }

    private function maskLicenseKey(?string $licenseKey): ?string
    {
        if ($licenseKey === null || $licenseKey === '') {
            return null;
        }

        $visible = substr($licenseKey, -4);
        return str_repeat('*', max(strlen($licenseKey) - 4, 4)) . $visible;
    }
}
