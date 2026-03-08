<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Category;
use Illuminate\Http\Request;

class CategoryController
{
    public function index(Request $request)
    {
        $query = Category::active()->withCount('products');

        if ($request->boolean('tree', false)) {
            $categories = $query->roots()->with('children')->orderBy('sort_order')->get();
        } else {
            $categories = $query->orderBy('sort_order')->get();
        }

        return ApiResponse::success(['data' => $categories]);
    }

    public function show(string $slug)
    {
        $category = Category::with(['children', 'products' => fn ($q) => $q->active()->with('images')->limit(20)])
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        return ApiResponse::success(['data' => $category]);
    }
}
