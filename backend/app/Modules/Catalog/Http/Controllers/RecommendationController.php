<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Product;
use App\Modules\OrderManagement\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecommendationController
{
    /**
     * Get product recommendations based on category popularity and co-purchase patterns.
     */
    public function index(Request $request)
    {
        $request->validate([
            'product_id' => 'nullable|integer',
            'category_id' => 'nullable|integer',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $limit = $request->integer('limit', 8);
        $productId = $request->input('product_id');
        $categoryId = $request->input('category_id');

        // Strategy 1: Co-purchased products (if product_id given)
        if ($productId) {
            $coPurchased = $this->getCoPurchasedProducts($productId, $limit);
            if ($coPurchased->isNotEmpty()) {
                return ApiResponse::success(['data' => $coPurchased]);
            }
        }

        // Strategy 2: Same-category popular products
        if ($categoryId || $productId) {
            $catId = $categoryId;
            if (!$catId && $productId) {
                $catId = Product::where('id', $productId)->value('category_id');
            }

            if ($catId) {
                $similar = Product::where('category_id', $catId)
                    ->where('status', 'active')
                    ->when($productId, fn ($q) => $q->where('id', '!=', $productId))
                    ->orderByDesc('review_count')
                    ->orderByDesc('average_rating')
                    ->limit($limit)
                    ->with(['images' => fn ($q) => $q->where('is_primary', true)])
                    ->get();

                if ($similar->isNotEmpty()) {
                    return ApiResponse::success(['data' => $this->formatProducts($similar)]);
                }
            }
        }

        // Strategy 3: Global popular products
        $popular = Product::where('status', 'active')
            ->orderByDesc('review_count')
            ->orderByDesc('average_rating')
            ->limit($limit)
            ->with(['images' => fn ($q) => $q->where('is_primary', true)])
            ->get();

        return ApiResponse::success(['data' => $this->formatProducts($popular)]);
    }

    /**
     * Find products frequently bought with the given product.
     */
    private function getCoPurchasedProducts(int $productId, int $limit)
    {
        // Find orders containing this product, then find other products in those orders
        $orderIds = OrderItem::where('product_id', $productId)
            ->pluck('order_id')
            ->unique()
            ->take(100);

        if ($orderIds->isEmpty()) {
            return collect();
        }

        $coPurchasedIds = OrderItem::whereIn('order_id', $orderIds)
            ->where('product_id', '!=', $productId)
            ->select('product_id', DB::raw('COUNT(*) as frequency'))
            ->groupBy('product_id')
            ->orderByDesc('frequency')
            ->limit($limit)
            ->pluck('product_id');

        if ($coPurchasedIds->isEmpty()) {
            return collect();
        }

        $products = Product::whereIn('id', $coPurchasedIds)
            ->where('status', 'active')
            ->with(['images' => fn ($q) => $q->where('is_primary', true)])
            ->get();

        return $this->formatProducts($products);
    }

    private function formatProducts($products)
    {
        return $products->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'price' => $p->price,
            'compare_at_price' => $p->compare_at_price,
            'average_rating' => $p->average_rating,
            'review_count' => $p->review_count,
            'image' => $p->images->first()?->path,
        ]);
    }
}
