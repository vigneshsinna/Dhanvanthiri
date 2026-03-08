<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Banner;
use Illuminate\Http\Request;

class AdminBannerController
{
    public function index()
    {
        $banners = Banner::orderBy('position')->orderBy('sort_order')->get();
        return ApiResponse::success(['data' => $banners]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'title' => 'nullable|string|max:200',
            'subtitle' => 'nullable|string|max:300',
            'image' => 'required|string',
            'image_mobile' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_url' => 'nullable|string',
            'position' => 'required|string|max:50',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $banner = Banner::create($data);

        return ApiResponse::success(['data' => $banner], 'Banner created', 201);
    }

    public function show(int $id)
    {
        $banner = Banner::findOrFail($id);
        return ApiResponse::success(['data' => $banner]);
    }

    public function update(Request $request, int $id)
    {
        $banner = Banner::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'title' => 'nullable|string|max:200',
            'subtitle' => 'nullable|string|max:300',
            'image' => 'sometimes|string',
            'image_mobile' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_url' => 'nullable|string',
            'position' => 'sometimes|string|max:50',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $banner->update($data);

        return ApiResponse::success(['data' => $banner->fresh()], 'Banner updated');
    }

    public function destroy(int $id)
    {
        Banner::findOrFail($id)->delete();
        return ApiResponse::success([], 'Banner deleted');
    }
}
