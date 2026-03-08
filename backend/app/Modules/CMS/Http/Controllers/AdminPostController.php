<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPostController
{
    public function index(Request $request)
    {
        $query = Post::with(['category:id,name', 'author:id,name'])->orderByDesc('updated_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $posts = $query->paginate($request->integer('per_page', 15));

        return ApiResponse::success([
            'data' => $posts->items(),
            'meta' => ['current_page' => $posts->currentPage(), 'last_page' => $posts->lastPage(), 'total' => $posts->total()],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
            'slug' => 'nullable|string|max:220|unique:posts,slug',
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:post_categories,id',
            'featured_image' => 'nullable|string',
            'status' => 'nullable|in:draft,published,scheduled,archived',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:160',
            'meta_description' => 'nullable|string|max:320',
            'og_image' => 'nullable|string',
            'no_index' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:post_tags,id',
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['author_id'] = $request->user()->id;
        $data['reading_time'] = max(1, (int) ceil(str_word_count(strip_tags($data['content'])) / 200));

        if (($data['status'] ?? 'draft') === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $tags = $data['tags'] ?? [];
        unset($data['tags']);

        $post = Post::create($data);
        if (!empty($tags)) {
            $post->tags()->sync($tags);
        }

        return ApiResponse::success(['data' => $post->load('tags', 'category')], 'Post created', 201);
    }

    public function show(int $id)
    {
        $post = Post::with(['category', 'author:id,name', 'tags'])->findOrFail($id);
        return ApiResponse::success(['data' => $post]);
    }

    public function update(Request $request, int $id)
    {
        $post = Post::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:200',
            'slug' => 'sometimes|string|max:220|unique:posts,slug,' . $id,
            'excerpt' => 'sometimes|string|max:500',
            'content' => 'sometimes|string',
            'category_id' => 'nullable|exists:post_categories,id',
            'featured_image' => 'nullable|string',
            'status' => 'nullable|in:draft,published,scheduled,archived',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:160',
            'meta_description' => 'nullable|string|max:320',
            'og_image' => 'nullable|string',
            'no_index' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:post_tags,id',
        ]);

        if (isset($data['content'])) {
            $data['reading_time'] = max(1, (int) ceil(str_word_count(strip_tags($data['content'])) / 200));
        }
        if (isset($data['status']) && $data['status'] === 'published' && $post->status !== 'published') {
            $data['published_at'] = $data['published_at'] ?? now();
        }

        $tags = $data['tags'] ?? null;
        unset($data['tags']);

        $post->update($data);
        if ($tags !== null) {
            $post->tags()->sync($tags);
        }

        return ApiResponse::success(['data' => $post->fresh()->load('tags', 'category')], 'Post updated');
    }

    public function destroy(int $id)
    {
        Post::findOrFail($id)->delete();
        return ApiResponse::success([], 'Post deleted');
    }
}
