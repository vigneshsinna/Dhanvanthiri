<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Wishlist;
use App\Modules\Catalog\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistController
{
    public function index(Request $request)
    {
        $wishlist = $this->getOrCreateWishlist($request->user()->id);
        $wishlist->load(['items.product.images' => fn ($q) => $q->where('is_primary', true), 'items.variant']);

        return ApiResponse::success([
            'data' => $wishlist->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => $item->product->price,
                    'image' => $item->product->images->first()?->path,
                    'stock_quantity' => $item->variant?->stock_quantity ?? $item->product->stock_quantity,
                ],
                'variant' => $item->variant ? [
                    'id' => $item->variant->id,
                    'sku' => $item->variant->sku,
                    'price_override' => $item->variant->price_override,
                ] : null,
                'added_at' => $item->created_at,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'variant_id' => 'nullable|integer|exists:product_variants,id',
        ]);

        $wishlist = $this->getOrCreateWishlist($request->user()->id);

        $exists = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('product_id', $request->input('product_id'))
            ->where('variant_id', $request->input('variant_id'))
            ->exists();

        if ($exists) {
            return ApiResponse::error('Item already in wishlist', 'DUPLICATE', [], 409);
        }

        $item = WishlistItem::create([
            'wishlist_id' => $wishlist->id,
            'product_id' => $request->input('product_id'),
            'variant_id' => $request->input('variant_id'),
        ]);

        return ApiResponse::success(['data' => $item], 'Added to wishlist', 201);
    }

    public function destroy(Request $request, int $id)
    {
        $wishlist = $this->getOrCreateWishlist($request->user()->id);
        $item = WishlistItem::where('wishlist_id', $wishlist->id)->findOrFail($id);
        $item->delete();

        return ApiResponse::success(null, 'Removed from wishlist');
    }

    private function getOrCreateWishlist(int $userId): Wishlist
    {
        return Wishlist::firstOrCreate(
            ['user_id' => $userId, 'name' => 'My Wishlist'],
        );
    }
}
