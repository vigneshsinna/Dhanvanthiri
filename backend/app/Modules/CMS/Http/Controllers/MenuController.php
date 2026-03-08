<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Menu;

class MenuController
{
    public function show(string $location)
    {
        $menu = Menu::where('location', $location)
            ->with('rootItems.children')
            ->first();

        if (!$menu) {
            return ApiResponse::success(['data' => [], 'location' => $location]);
        }

        return ApiResponse::success(['data' => $menu->rootItems, 'location' => $location, 'menu_name' => $menu->name]);
    }
}
