<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Models\StoreSetting;

class SettingsService
{
    public function get(string $key, mixed $default = null): mixed
    {
        $parts = explode('.', $key, 2);
        $group = $parts[0];
        $settingKey = $parts[1] ?? $key;

        $setting = StoreSetting::where('group', $group)->where('key', $settingKey)->first();

        return $setting ? $setting->getCastedValue() : $default;
    }

    public function set(string $key, mixed $value): void
    {
        $parts = explode('.', $key, 2);
        $group = $parts[0];
        $settingKey = $parts[1] ?? $key;

        $cast = match (true) {
            is_bool($value) => 'boolean',
            is_int($value) => 'integer',
            is_array($value) => 'json',
            default => 'string',
        };

        $storedValue = $cast === 'json' ? json_encode($value) : (string) $value;

        StoreSetting::updateOrCreate(
            ['group' => $group, 'key' => $settingKey],
            ['value' => $storedValue, 'cast' => $cast]
        );
    }

    public function getGroup(string $group): array
    {
        return StoreSetting::where('group', $group)
            ->get()
            ->mapWithKeys(fn ($s) => [$s->key => $s->getCastedValue()])
            ->toArray();
    }
}
