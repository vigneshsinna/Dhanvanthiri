<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Admin\Services\SettingsService;
use Illuminate\Http\Request;

class SettingsController
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function index(Request $request)
    {
        $group = $request->input('group');

        if ($group) {
            $data = $this->settings->getGroup($group);
        } else {
            $groups = ['general', 'payment', 'shipping', 'email', 'seo'];
            $data = [];
            foreach ($groups as $g) {
                $data[$g] = $this->settings->getGroup($g);
            }
        }

        return ApiResponse::success(['data' => $data]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings' => 'required|array',
            'settings.*.group' => 'required|string|max:50',
            'settings.*.key' => 'required|string|max:100',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($data['settings'] as $setting) {
            $this->settings->set($setting['group'] . '.' . $setting['key'], $setting['value']);
        }

        return ApiResponse::success(['data' => $data['settings']], 'Settings updated');
    }
}
