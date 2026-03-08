<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\PostCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPostCategoryController
{
    public function index()
    {
        $categories = PostCategory::withCount('posts')->orderBy('name')->get();
        return ApiResponse::success(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:120|unique:post_categories,slug',
            'description' => 'nullable|string',
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $category = PostCategory::create($data);

        return ApiResponse::success(['data' => $category], 'Post category created', 201);
    }

    public function show(int $id)
    {
        $category = PostCategory::withCount('posts')->findOrFail($id);
        return ApiResponse::success(['data' => $category]);
    }

    public function update(Request $request, int $id)
    {
        $category = PostCategory::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'slug' => 'sometimes|string|max:120|unique:post_categories,slug,' . $id,
            'description' => 'nullable|string',
        ]);

        $category->update($data);

        return ApiResponse::success(['data' => $category->fresh()], 'Post category updated');
    }

    public function destroy(int $id)
    {
        $category = PostCategory::findOrFail($id);

        if ($category->posts()->exists()) {
            return ApiResponse::error('Category has posts', 'HAS_POSTS', [], 422);
        }

        $category->delete();

        return ApiResponse::success([], 'Post category deleted');
    }
}
