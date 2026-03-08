<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Menu;
use App\Modules\CMS\Models\MenuItem;
use Illuminate\Http\Request;

class AdminMenuController
{
    public function index()
    {
        $menus = Menu::withCount('items')->get();
        return ApiResponse::success(['data' => $menus]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:50|unique:menus,name',
            'location' => 'required|string|max:50',
        ]);

        $menu = Menu::create($data);

        return ApiResponse::success(['data' => $menu], 'Menu created', 201);
    }

    public function show(int $id)
    {
        $menu = Menu::with('rootItems.children')->findOrFail($id);
        return ApiResponse::success(['data' => $menu]);
    }

    public function update(Request $request, int $id)
    {
        $menu = Menu::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:50|unique:menus,name,' . $id,
            'location' => 'sometimes|string|max:50',
        ]);

        $menu->update($data);

        return ApiResponse::success(['data' => $menu->fresh()], 'Menu updated');
    }

    public function destroy(int $id)
    {
        Menu::findOrFail($id)->delete();
        return ApiResponse::success([], 'Menu deleted');
    }

    public function syncItems(Request $request, int $id)
    {
        $menu = Menu::findOrFail($id);

        $data = $request->validate([
            'items' => 'required|array',
            'items.*.label' => 'required|string|max:100',
            'items.*.url' => 'required|string',
            'items.*.target' => 'nullable|in:_self,_blank',
            'items.*.sort_order' => 'nullable|integer',
            'items.*.parent_id' => 'nullable|integer',
        ]);

        $menu->items()->delete();

        foreach ($data['items'] as $itemData) {
            MenuItem::create([
                'menu_id' => $menu->id,
                'parent_id' => $itemData['parent_id'] ?? null,
                'label' => $itemData['label'],
                'url' => $itemData['url'],
                'target' => $itemData['target'] ?? '_self',
                'sort_order' => $itemData['sort_order'] ?? 0,
            ]);
        }

        return ApiResponse::success(['data' => $menu->fresh()->load('rootItems.children')], 'Menu items synced');
    }
}
