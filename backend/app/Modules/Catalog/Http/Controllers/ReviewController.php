<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Review;
use App\Modules\Catalog\Models\Product;
use Illuminate\Http\Request;
use App\Modules\Catalog\Http\Requests\CreateReviewRequest;
use App\Modules\Catalog\Http\Requests\UpdateReviewRequest;

class ReviewController
{
    public function index(int $id)
    {
        $reviews = Review::with('user:id,name,avatar')
            ->where('product_id', $id)
            ->approved()
            ->orderByDesc('created_at')
            ->paginate(10);

        $avgRating = Review::where('product_id', $id)->approved()->avg('rating');

        return ApiResponse::success([
            'data' => $reviews->items(),
            'average_rating' => $avgRating ? round($avgRating, 1) : null,
            'total' => $reviews->total(),
            'product_id' => $id,
        ]);
    }

    public function store(CreateReviewRequest $request, int $id)
    {
        $product = Product::findOrFail($id);
        $user = $request->user();

        $existing = Review::where('product_id', $id)->where('user_id', $user->id)->first();
        if ($existing) {
            return ApiResponse::error('You already reviewed this product', 'DUPLICATE_REVIEW', [], 422);
        }

        $review = Review::create([
            'product_id' => $id,
            'user_id' => $user->id,
            'rating' => $request->input('rating'),
            'title' => $request->input('title'),
            'body' => $request->input('body'),
            'status' => 'pending',
        ]);

        return ApiResponse::success(['data' => $review->load('user:id,name')], 'Review created', 201);
    }

    public function update(UpdateReviewRequest $request, int $id)
    {
        $review = Review::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $review->update($request->validated());
        $review->status = 'pending'; // Re-moderate on edit
        $review->save();

        return ApiResponse::success(['data' => $review], 'Review updated');
    }

    public function destroy(int $id, Request $request)
    {
        $review = Review::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $review->delete();

        return ApiResponse::success([], 'Review deleted');
    }
}
