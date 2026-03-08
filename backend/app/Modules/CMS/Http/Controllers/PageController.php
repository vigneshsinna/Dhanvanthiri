<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\CMS\Models\Page;

class PageController
{
    public function show(string $slug)
    {
        $page = Page::published()->where('slug', $slug)->firstOrFail();

        return ApiResponse::success([
            'data' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'excerpt' => $page->excerpt,
                'effective_date' => optional($page->effective_date)->toDateString(),
                'template' => $page->template,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'og_title' => $page->og_title,
                'og_description' => $page->og_description,
                'og_image' => $page->og_image,
                'canonical_url' => $page->canonical_url,
                'published_at' => $page->published_at,
            ],
        ]);
    }
}
