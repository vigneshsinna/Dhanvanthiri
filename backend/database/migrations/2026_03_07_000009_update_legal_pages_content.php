<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

return new class extends Migration {
    public function up(): void
    {
        $authorId = DB::table('users')->orderBy('id')->value('id');
        if (!$authorId) {
            return;
        }

        $now = Carbon::now();

        $pages = require database_path('support/legal_pages.php');

        foreach ($pages as $page) {
            DB::table('pages')->updateOrInsert(
                ['slug' => $page['slug']],
                [
                    'title' => $page['title'],
                    'content' => $page['content'],
                    'excerpt' => $page['excerpt'],
                    'effective_date' => $page['effective_date'] ?? null,
                    'template' => 'default',
                    'status' => 'published',
                    'author_id' => $authorId,
                    'meta_title' => $page['meta_title'],
                    'meta_description' => $page['meta_description'],
                    'published_at' => $now,
                    'sort_order' => $page['sort_order'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    public function down(): void
    {
        // Intentionally left as no-op to avoid destructive rollback of legal content.
    }
};

