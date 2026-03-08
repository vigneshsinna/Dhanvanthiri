<?php

namespace App\Modules\CMS\Http\Controllers;

use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\Category;
use App\Modules\CMS\Models\Page;
use App\Modules\CMS\Models\Post;
use Illuminate\Http\Response;

class SeoController
{
    public function sitemap()
    {
        $baseUrl = config('app.url');
        $urls = [];

        $urls[] = ['loc' => $baseUrl, 'changefreq' => 'daily', 'priority' => '1.0'];

        foreach (Product::active()->select('slug', 'updated_at')->get() as $p) {
            $urls[] = ['loc' => $baseUrl . '/products/' . $p->slug, 'lastmod' => $p->updated_at->toDateString(), 'changefreq' => 'weekly', 'priority' => '0.8'];
        }

        foreach (Category::active()->select('slug', 'updated_at')->get() as $c) {
            $urls[] = ['loc' => $baseUrl . '/categories/' . $c->slug, 'lastmod' => $c->updated_at->toDateString(), 'changefreq' => 'weekly', 'priority' => '0.7'];
        }

        foreach (Page::published()->select('slug', 'updated_at')->get() as $p) {
            $urls[] = ['loc' => $baseUrl . '/pages/' . $p->slug, 'lastmod' => $p->updated_at->toDateString(), 'changefreq' => 'monthly', 'priority' => '0.6'];
        }

        foreach (Post::published()->select('slug', 'updated_at')->get() as $p) {
            $urls[] = ['loc' => $baseUrl . '/blog/' . $p->slug, 'lastmod' => $p->updated_at->toDateString(), 'changefreq' => 'weekly', 'priority' => '0.6'];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $url) {
            $xml .= '  <url>';
            $xml .= '<loc>' . htmlspecialchars($url['loc']) . '</loc>';
            if (isset($url['lastmod'])) $xml .= '<lastmod>' . $url['lastmod'] . '</lastmod>';
            $xml .= '<changefreq>' . $url['changefreq'] . '</changefreq>';
            $xml .= '<priority>' . $url['priority'] . '</priority>';
            $xml .= '</url>' . "\n";
        }
        $xml .= '</urlset>';

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function robots()
    {
        $baseUrl = config('app.url');
        $content = "User-agent: *\nAllow: /\nSitemap: {$baseUrl}/sitemap.xml\n";
        return response($content, 200)->header('Content-Type', 'text/plain');
    }
}
