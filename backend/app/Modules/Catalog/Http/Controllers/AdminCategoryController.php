<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController
{
    public function index(Request $request)
    {
        $query = Category::withCount('products');

        if ($request->boolean('tree', false)) {
            $categories = $query->roots()->with('children')->orderBy('sort_order')->get();
        } else {
            $categories = $query->orderBy('sort_order')->get();
        }

        return ApiResponse::success(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:120|unique:categories,slug',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $category = Category::create($data);

        return ApiResponse::success(['data' => $category], 'Category created', 201);
    }

    public function show(int $id)
    {
        $category = Category::with(['children', 'parent'])->withCount('products')->findOrFail($id);
        return ApiResponse::success(['data' => $category]);
    }

    public function update(Request $request, int $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'slug' => 'sometimes|string|max:120|unique:categories,slug,' . $id,
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($data);

        return ApiResponse::success(['data' => $category->fresh()], 'Category updated');
    }

    public function destroy(int $id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->exists()) {
            return ApiResponse::error('Category has products', 'HAS_PRODUCTS', [], 422);
        }

        $category->children()->update(['parent_id' => $category->parent_id]);
        $category->delete();

        return ApiResponse::success([], 'Category deleted');
    }
}
