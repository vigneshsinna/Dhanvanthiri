<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Catalog\Models\Review;
use Illuminate\Http\Request;

class AdminReviewController
{
    public function index(Request $request)
    {
        $reviews = Review::with('user:id,name', 'product:id,name')
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate($request->input('per_page', 15));

        return ApiResponse::success(['data' => $reviews]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        $review = Review::findOrFail($id);
        $review->status = $request->input('status');
        $review->save();

        return ApiResponse::success(['data' => $review->load('user:id,name', 'product:id,name')], 'Review status updated');
    }

    public function destroy(int $id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return ApiResponse::success(null, 'Review deleted');
    }
}
