<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Post;
use App\Modules\CMS\Models\PostCategory;
use Illuminate\Http\Request;

class PostController
{
    public function index(Request $request)
    {
        $query = Post::published()
            ->with(['category:id,name,slug', 'author:id,name'])
            ->orderByDesc('published_at');

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $posts = $query->paginate($request->integer('per_page', 12));

        return ApiResponse::success([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $post = Post::published()
            ->with(['category:id,name,slug', 'author:id,name', 'tags:id,name,slug'])
            ->where('slug', $slug)
            ->firstOrFail();

        $post->increment('views');

        return ApiResponse::success(['data' => $post]);
    }

    public function byCategory(string $slug)
    {
        $category = PostCategory::where('slug', $slug)->firstOrFail();

        $posts = Post::published()
            ->where('category_id', $category->id)
            ->with('author:id,name')
            ->orderByDesc('published_at')
            ->paginate(12);

        return ApiResponse::success([
            'data' => $posts->items(),
            'category' => $category,
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }
}
