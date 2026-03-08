<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Product;
use Illuminate\Http\Request;

class ProductController
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'tags', 'approvedReviews'])
            ->active();

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->query('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->query('max_price'));
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $request->query('tag')));
        }

        $sort = $request->query('sort', 'newest');
        $query = match ($sort) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'popularity' => $query->withCount('approvedReviews')->orderByDesc('approved_reviews_count'),
            default => $query->orderByDesc('created_at'),
        };

        $products = $query->paginate($request->query('per_page', 20));

        return ApiResponse::success([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $product = Product::with(['category', 'images', 'variants.optionValues.option', 'tags', 'approvedReviews.user'])
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $avgRating = $product->approvedReviews->avg('rating');

        return ApiResponse::success([
            'data' => array_merge($product->toArray(), [
                'average_rating' => $avgRating ? round($avgRating, 1) : null,
                'review_count' => $product->approvedReviews->count(),
            ]),
        ]);
    }

    public function featured()
    {
        $products = Product::with(['category', 'images', 'approvedReviews'])
            ->active()
            ->featured()
            ->limit(12)
            ->get();

        return ApiResponse::success(['data' => $products]);
    }

    public function search(Request $request)
    {
        $query = $request->query('q', '');

        if (strlen($query) < 2) {
            return ApiResponse::success(['data' => [], 'query' => $query]);
        }

        $products = Product::with(['category', 'images', 'approvedReviews'])
            ->active()
            ->search($query)
            ->paginate($request->query('per_page', 20));

        return ApiResponse::success([
            'data' => $products->items(),
            'query' => $query,
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }
}
