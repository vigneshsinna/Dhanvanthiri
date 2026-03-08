<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductImage;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Modules\Catalog\Http\Requests\CreateProductRequest;
use App\Modules\Catalog\Http\Requests\UpdateProductRequest;
use App\Modules\Catalog\Http\Requests\SyncVariantsRequest;

class AdminProductController
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->query('search') . '%');
        }

        $products = $query->orderByDesc('updated_at')->paginate($request->query('per_page', 20));

        return ApiResponse::success([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(CreateProductRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $product = Product::create($data);

        return ApiResponse::success(['data' => $product->load(['category', 'images'])], 'Product created', 201);
    }

    public function show(int $id)
    {
        $product = Product::with(['category', 'images', 'variants.optionValues.option', 'tags', 'reviews.user'])
            ->findOrFail($id);

        return ApiResponse::success(['data' => $product]);
    }

    public function update(UpdateProductRequest $request, int $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->validated());

        return ApiResponse::success(['data' => $product->fresh(['category', 'images'])], 'Product updated');
    }

    public function destroy(int $id)
    {
        $product = Product::findOrFail($id);
        $product->images->each(fn ($img) => Storage::disk('public')->delete($img->path));
        $product->delete();

        return ApiResponse::success([], 'Product deleted');
    }

    public function uploadImages(Request $request, int $id)
    {
        $request->validate(['images' => 'required|array', 'images.*' => 'image|max:5120']);

        $product = Product::findOrFail($id);
        $uploaded = [];

        foreach ($request->file('images') as $index => $file) {
            $path = $file->store('products/' . $product->id, 'public');
            $image = $product->images()->create([
                'path' => $path,
                'alt_text' => $product->name,
                'sort_order' => $product->images()->count() + $index,
                'is_primary' => $product->images()->count() === 0 && $index === 0,
            ]);
            $uploaded[] = $image;
        }

        return ApiResponse::success(['data' => $uploaded], 'Images uploaded');
    }

    public function deleteImage(int $id)
    {
        $image = ProductImage::findOrFail($id);
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return ApiResponse::success([], 'Image deleted');
    }

    public function syncVariants(SyncVariantsRequest $request, int $id)
    {
        $product = Product::findOrFail($id);
        $variants = $request->validated('variants');

        // Delete existing variants not in the new set
        $existingIds = collect($variants)->pluck('id')->filter()->toArray();
        $product->variants()->whereNotIn('id', $existingIds)->delete();

        foreach ($variants as $variantData) {
            if (isset($variantData['id'])) {
                ProductVariant::where('id', $variantData['id'])->update($variantData);
            } else {
                $product->variants()->create($variantData);
            }
        }

        // Update aggregate stock
        $product->stock_quantity = $product->variants()->sum('stock_quantity');
        $product->save();

        return ApiResponse::success(['data' => $product->fresh('variants')], 'Variants synced');
    }
}
