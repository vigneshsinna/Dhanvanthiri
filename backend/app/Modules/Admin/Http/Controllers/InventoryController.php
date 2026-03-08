<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Http\Request;

class InventoryController
{
    public function index(Request $request)
    {
        $query = Product::with('variants:id,product_id,sku,stock_quantity')
            ->select('id', 'name', 'sku', 'stock_quantity', 'status');

        if ($request->input('filter') === 'low_stock') {
            $query->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10);
        } elseif ($request->input('filter') === 'out_of_stock') {
            $query->where('stock_quantity', '<=', 0);
        }

        if ($search = $request->input('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%"));
        }

        $items = $query->orderBy('stock_quantity')->paginate($request->integer('per_page', 20));

        return ApiResponse::success([
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function update(Request $request, int $variantId)
    {
        $data = $request->validate(['stock_quantity' => 'required|integer|min:0']);

        $variant = ProductVariant::findOrFail($variantId);
        $variant->stock_quantity = $data['stock_quantity'];
        $variant->save();

        $product = $variant->product;
        $product->stock_quantity = $product->variants()->sum('stock_quantity');
        $product->save();

        return ApiResponse::success(['data' => $variant->fresh()], 'Inventory updated');
    }

    public function alerts()
    {
        $outOfStock = Product::where('status', 'active')
            ->where('stock_quantity', '<=', 0)
            ->select('id', 'name', 'sku', 'stock_quantity')
            ->get();

        $lowStock = Product::where('status', 'active')
            ->where('stock_quantity', '>', 0)
            ->where('stock_quantity', '<=', 10)
            ->select('id', 'name', 'sku', 'stock_quantity')
            ->get();

        return ApiResponse::success(['data' => ['out_of_stock' => $outOfStock, 'low_stock' => $lowStock]]);
    }

    public function bulkUpdate(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.stock_quantity' => 'required|integer|min:0',
        ]);

        $updated = 0;
        $failed = [];

        foreach ($data['items'] as $item) {
            try {
                $variant = ProductVariant::find($item['variant_id']);
                $variant->stock_quantity = $item['stock_quantity'];
                $variant->save();

                $product = $variant->product;
                $product->stock_quantity = $product->variants()->sum('stock_quantity');
                $product->save();

                $updated++;
            } catch (\Throwable $e) {
                $failed[] = ['variant_id' => $item['variant_id'], 'error' => $e->getMessage()];
            }
        }

        return ApiResponse::success(['updated' => $updated, 'failed' => $failed]);
    }
}
