<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminPageController
{
    public function index(Request $request)
    {
        $query = Page::with('author:id,name')->orderByDesc('updated_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $pages = $query->paginate($request->integer('per_page', 15));

        return ApiResponse::success([
            'data' => $pages->items(),
            'meta' => ['current_page' => $pages->currentPage(), 'last_page' => $pages->lastPage(), 'total' => $pages->total()],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
            'slug' => 'nullable|string|max:220|unique:pages,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'effective_date' => 'nullable|date',
            'template' => 'nullable|string|max:50',
            'status' => 'nullable|in:draft,published,archived',
            'meta_title' => 'nullable|string|max:160',
            'meta_description' => 'nullable|string|max:320',
            'og_title' => 'nullable|string|max:160',
            'og_description' => 'nullable|string|max:320',
            'og_image' => 'nullable|string',
            'canonical_url' => 'nullable|string',
            'no_index' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['author_id'] = $request->user()->id;
        if (($data['status'] ?? 'draft') === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $page = Page::create($data);

        return ApiResponse::success(['data' => $page], 'Page created', 201);
    }

    public function show(int $id)
    {
        $page = Page::with('author:id,name')->findOrFail($id);
        return ApiResponse::success(['data' => $page]);
    }

    public function update(Request $request, int $id)
    {
        $page = Page::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:200',
            'slug' => 'sometimes|string|max:220|unique:pages,slug,' . $id,
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string|max:500',
            'effective_date' => 'nullable|date',
            'template' => 'nullable|string|max:50',
            'status' => 'nullable|in:draft,published,archived',
            'meta_title' => 'nullable|string|max:160',
            'meta_description' => 'nullable|string|max:320',
            'og_title' => 'nullable|string|max:160',
            'og_description' => 'nullable|string|max:320',
            'og_image' => 'nullable|string',
            'canonical_url' => 'nullable|string',
            'no_index' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if (isset($data['status']) && $data['status'] === 'published' && $page->status !== 'published') {
            $data['published_at'] = now();
        }

        $page->update($data);

        return ApiResponse::success(['data' => $page->fresh()], 'Page updated');
    }

    public function destroy(int $id)
    {
        Page::findOrFail($id)->delete();
        return ApiResponse::success([], 'Page deleted');
    }
}
