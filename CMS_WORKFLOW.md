# Content Management System (CMS) & SEO Module — `CMS_WORKFLOW`

> **Stack:** Laravel 11 · MySQL 8 · File Cache · React 18 + TypeScript · React Query · React-Hook-Form + Zod

---

## 1. Overview

Provides a headless CMS for managing dynamic content (pages, blog posts, banners, FAQs, menus) with full SEO tooling (meta tags, Open Graph, JSON-LD, XML sitemap, robots.txt) and a rich admin editor experience.

---

## 2. Database Schema

### `pages`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `title` | `varchar(200)` | |
| `slug` | `varchar(220)` | Unique |
| `content` | `longtext` | HTML / Slate JSON |
| `excerpt` | `varchar(500)` | Nullable |
| `template` | `varchar(50)` | e.g. `default`, `landing`, `contact` |
| `status` | `enum('draft','published','archived')` | |
| `author_id` | FK → `users` | |
| `meta_title` | `varchar(160)` | SEO |
| `meta_description` | `varchar(320)` | SEO |
| `og_title` | `varchar(160)` | Open Graph |
| `og_description` | `varchar(320)` | |
| `og_image` | `varchar(255)` | |
| `canonical_url` | `varchar(255)` | Nullable |
| `no_index` | `boolean` | Default: false |
| `published_at` | `timestamp` | Nullable |
| `sort_order` | `int` | |
| `timestamps` | | |

### `posts` (Blog)
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `category_id` | FK → `post_categories` | Nullable |
| `author_id` | FK → `users` | |
| `title` | `varchar(200)` | |
| `slug` | `varchar(220)` | Unique |
| `excerpt` | `varchar(500)` | |
| `content` | `longtext` | HTML |
| `featured_image` | `varchar(255)` | Nullable |
| `status` | `enum('draft','published','scheduled','archived')` | |
| `is_featured` | `boolean` | |
| `reading_time` | `int` | Minutes, computed |
| `views` | `int` | Default: 0 |
| `meta_title` | `varchar(160)` | |
| `meta_description` | `varchar(320)` | |
| `og_image` | `varchar(255)` | |
| `no_index` | `boolean` | |
| `published_at` | `timestamp` | Nullable |
| `timestamps` | | |

### `post_categories`
| Column | Type |
|---|---|
| `id` | PK |
| `name` | `varchar(100)` |
| `slug` | `varchar(120)` Unique |
| `description` | `text` Nullable |
| `timestamps` | |

### `post_tags` & `post_post_tags` (pivot)
| Column | Type |
|---|---|
| `id` | PK |
| `name` | `varchar(50)` |
| `slug` | `varchar(60)` Unique |

### `banners`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `name` | `varchar(100)` | Internal |
| `title` | `varchar(200)` | Nullable |
| `subtitle` | `varchar(300)` | Nullable |
| `image` | `varchar(255)` | |
| `image_mobile` | `varchar(255)` | Nullable |
| `cta_text` | `varchar(100)` | Nullable |
| `cta_url` | `varchar(255)` | Nullable |
| `position` | `varchar(50)` | e.g. `hero`, `sidebar`, `footer` |
| `starts_at` | `timestamp` | Nullable |
| `ends_at` | `timestamp` | Nullable |
| `sort_order` | `int` | |
| `is_active` | `boolean` | |
| `timestamps` | | |

### `faqs`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `category` | `varchar(100)` | Nullable |
| `question` | `varchar(300)` | |
| `answer` | `text` | |
| `sort_order` | `int` | |
| `is_active` | `boolean` | |

### `menus`
| Column | Type |
|---|---|
| `id` | PK |
| `name` | `varchar(50)` Unique |
| `location` | `varchar(50)` e.g. `header`, `footer` |

### `menu_items`
| Column | Type | Notes |
|---|---|---|
| `id` | PK | |
| `menu_id` | FK | |
| `parent_id` | FK → `menu_items` | Nullable |
| `label` | `varchar(100)` | |
| `url` | `varchar(255)` | Absolute or relative |
| `target` | `varchar(10)` | `_self` / `_blank` |
| `sort_order` | `int` | |

### `media_library`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `uploaded_by` | FK → `users` | |
| `filename` | `varchar(255)` | Original name |
| `path` | `varchar(255)` | S3 path |
| `disk` | `varchar(30)` | `s3` / `local` |
| `mime_type` | `varchar(100)` | |
| `size` | `int` | Bytes |
| `width` | `int` | Nullable (images) |
| `height` | `int` | Nullable |
| `alt_text` | `varchar(200)` | Nullable |
| `timestamps` | | |

---

## 3. Backend — Laravel 11

### 3.1 Routes

```php
// Public
Route::get('/pages/{slug}',             [PageController::class, 'show']);
Route::get('/posts',                     [PostController::class, 'index']);
Route::get('/posts/{slug}',              [PostController::class, 'show']);
Route::get('/posts/category/{slug}',     [PostController::class, 'byCategory']);
Route::get('/banners',                   [BannerController::class, 'index']);        // ?position=hero
Route::get('/faqs',                      [FaqController::class, 'index']);
Route::get('/menus/{location}',          [MenuController::class, 'show']);
Route::get('/sitemap.xml',               [SeoController::class, 'sitemap']);
Route::get('/robots.txt',                [SeoController::class, 'robots']);

// Admin
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('pages',          AdminPageController::class);
    Route::apiResource('posts',          AdminPostController::class);
    Route::apiResource('post-categories', AdminPostCategoryController::class);
    Route::apiResource('banners',        AdminBannerController::class);
    Route::apiResource('faqs',           AdminFaqController::class);
    Route::apiResource('menus',          AdminMenuController::class);
    Route::put('/menus/{id}/items',      [AdminMenuController::class, 'syncItems']);
    Route::post('/media',                [AdminMediaController::class, 'upload']);
    Route::get('/media',                 [AdminMediaController::class, 'index']);
    Route::delete('/media/{id}',         [AdminMediaController::class, 'destroy']);
    Route::get('/seo/analysis',          [AdminSeoController::class, 'analyze']);
});
```

### 3.2 Controllers

#### `PostController` (Public)

```
index(Request $request)
  → Filter: category_slug, tag, search (FULLTEXT on title+excerpt+content)
  → Sort: newest, oldest, popular (views), featured first
  → Paginate 10/page
  → Increment views via PostViewJob (async, no cache bust)
  → Cache: keyed by query fingerprint, TTL 5 min

show(string $slug)
  → Load: author, category, tags, related posts (same category, limit 4)
  → Increment views
  → Cache: keyed by slug, TTL 10 min
  → Dispatch GenerateStructuredDataJob (JSON-LD)
```

#### `SeoController`

```
sitemap()
  → XML sitemap with:
      - Static pages (from pages table)
      - Products (active, with lastmod = updated_at)
      - Blog posts (published)
      - Categories
  → Cache: TTL 1 hour
  → Content-Type: application/xml

robots()
  → Returns robots.txt from config/seo.php
  → Respect APP_ENV (disallow all on non-production)
```

#### `AdminSeoController`

```
analyze(Request $request)
  → Requires: { url: string, content: string }
  → Runs SeoAnalysisService:
      - Title length check (50–60 chars)
      - Meta description length (120–160 chars)
      - Keyword density
      - Heading structure (H1 count, H2/H3 hierarchy)
      - Image alt text presence
      - Internal link count
      - Content length (>300 words)
  → Returns score (0–100) + recommendations[]
```

### 3.3 `SeoAnalysisService`

```php
class SeoAnalysisService
{
    public function analyze(string $content, array $meta): SeoReport
    {
        return new SeoReport([
            'score'           => $this->computeScore($content, $meta),
            'title_score'     => $this->analyzeTitle($meta['title']),
            'description_score' => $this->analyzeDescription($meta['description']),
            'content_score'   => $this->analyzeContent($content),
            'recommendations' => $this->buildRecommendations($content, $meta),
        ]);
    }
}
```

### 3.4 JSON-LD Structured Data Generators

```php
// Product pages
Schema::product()
  ->name($product->name)
  ->description($product->short_description)
  ->image($product->primaryImageUrl)
  ->offers(Schema::offer()->price($product->price)->priceCurrency('USD'))
  ->aggregateRating(Schema::aggregateRating()->ratingValue($product->avg_rating))
  ->toScript();

// Blog posts
Schema::blogPosting()
  ->headline($post->title)
  ->author(Schema::person()->name($post->author->name))
  ->datePublished($post->published_at)
  ->image($post->featured_image);

// FAQ pages
Schema::faqPage()->mainEntity($faqs->map(fn($f) =>
    Schema::question()->name($f->question)->acceptedAnswer(
        Schema::answer()->text($f->answer)
    )
));
```

### 3.5 Caching Strategy

```
"page.{slug}"              TTL: 1800s (30 min)
"post.{slug}"              TTL: 600s
"posts.index.{fingerprint}" TTL: 300s
"banners.{position}"       TTL: 900s
"menu.{location}"          TTL: 3600s
"faqs.all"                 TTL: 7200s
"sitemap"                  TTL: 3600s
```

### 3.6 Queued Jobs

| Job | Description |
|---|---|
| `IncrementPostViewsJob` | Batches view increments every 5 min |
| `GenerateOgImageJob` | Auto-generates OG image using headless Chrome (optional) |
| `ScheduledPublishJob` | Publishes posts/pages with `published_at <= now()` |
| `RegenerateSitemapJob` | Triggered on any content publish/unpublish |

---

## 4. Frontend — React 18 + TypeScript

### 4.1 SEO Utility (Head Management)

```tsx
// components/SEOHead.tsx — uses react-helmet-async
interface SEOProps {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

export const SEOHead: React.FC<SEOProps> = ({ ... }) => (
  <Helmet>
    <title>{title} | StoreName</title>
    <meta name="description" content={description} />
    {canonical && <link rel="canonical" href={canonical} />}
    {noIndex && <meta name="robots" content="noindex,nofollow" />}
    <meta property="og:title" content={ogTitle ?? title} />
    <meta property="og:description" content={ogDescription ?? description} />
    {ogImage && <meta property="og:image" content={ogImage} />}
    {jsonLd && (
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    )}
  </Helmet>
);
```

### 4.2 React Query Hooks

```ts
// Public
usePageQuery(slug: string)               // GET /pages/:slug
usePostsQuery(filters: PostFilters)      // GET /posts
usePostQuery(slug: string)               // GET /posts/:slug
useBannersQuery(position: string)        // GET /banners?position=
useFaqsQuery()                           // GET /faqs
useMenuQuery(location: string)           // GET /menus/:location

// Admin
useAdminPagesQuery()
useAdminCreatePageMutation()
useAdminUpdatePageMutation()
useAdminDeletePageMutation()
useAdminPostsQuery()
useAdminSeoAnalysisMutation()
useAdminMediaQuery()
useAdminUploadMediaMutation()
```

### 4.3 Pages & Components

| Route | Component | Description |
|---|---|---|
| `/blog` | `BlogListPage` | Post grid with filters |
| `/blog/:slug` | `BlogPostPage` | Full post + related posts |
| `/pages/:slug` | `DynamicPage` | CMS page renderer |
| `/faq` | `FaqPage` | Accordion FAQ |
| `/admin/cms/pages` | `AdminPagesPage` | Page CRUD |
| `/admin/cms/posts` | `AdminPostsPage` | Blog management |
| `/admin/cms/banners` | `AdminBannersPage` | Banner scheduler |
| `/admin/cms/media` | `AdminMediaLibraryPage` | File browser |
| `/admin/cms/menus` | `AdminMenusPage` | Drag-drop menu builder |
| `/admin/seo` | `AdminSeoPage` | SEO analysis tool |

#### `RichTextEditor` Component

```tsx
// Uses TipTap (headless, ProseMirror-based)
// Features: Bold, Italic, Headings, Lists, Links, Images (from Media Library)
// Image insertion: opens MediaPickerModal → inserts img with alt text
// Outputs HTML string saved to DB
```

#### `MediaLibraryModal`

- Grid view of uploaded files (images, PDFs)
- Filter by type, search by filename
- Upload dropzone (react-dropzone)
- Click to select → returns URL to caller

#### `BannerScheduler`

- Date-range picker for starts_at / ends_at
- Preview of banner at different viewports
- Active/inactive toggle with live status

#### `SeoAnalyzer` (Admin)

```tsx
// Real-time SEO score panel in post/page editor
// Calls POST /admin/seo/analysis on content change (debounced 2s)
// Displays:
//   - Circular score gauge (0-100)
//   - Checklist of recommendations with ✓/✗ status
//   - Title/description character counters with colour-coded feedback
```

### 4.4 Zod Schemas

```ts
// postSchema
z.object({
  title:           z.string().min(5).max(200),
  slug:            z.string().regex(/^[a-z0-9-]+$/),
  excerpt:         z.string().max(500),
  content:         z.string().min(50),
  categoryId:      z.number().nullable(),
  tags:            z.array(z.string()),
  status:          z.enum(['draft','published','scheduled','archived']),
  publishedAt:     z.string().nullable(),
  metaTitle:       z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
  ogImage:         z.string().url().optional(),
  noIndex:         z.boolean(),
});
```

---

## 5. SEO Checklist (Implementation)

| Feature | Implementation |
|---|---|
| Per-page meta title & description | `meta_title`, `meta_description` columns |
| Open Graph tags | `og_title`, `og_description`, `og_image` columns |
| Twitter Card | Derived from OG tags in `SEOHead` |
| Canonical URL | `canonical_url` column or auto-derived |
| JSON-LD structured data | `Schema` library + per-template generators |
| XML Sitemap | `GET /sitemap.xml` — dynamic, cached |
| Robots.txt | `GET /robots.txt` — environment-aware |
| Slug auto-generation | Frontend: kebab-case from title on first change only |
| Image alt text | Required on all `<img>` via MediaLibrary picker |
| Breadcrumbs | BreadcrumbList JSON-LD + visual component |
| Pagination canonical | `<link rel="next/prev">` in paginated views |

---

## 6. API Response Contracts

### `GET /posts/:slug` — `200`
```json
{
  "data": {
    "id": 7,
    "title": "How to Style a Capsule Wardrobe",
    "slug": "style-capsule-wardrobe",
    "excerpt": "...",
    "content": "<p>...</p>",
    "featured_image": "https://cdn.example.com/...",
    "reading_time": 5,
    "views": 1420,
    "author": { "id": 1, "name": "Jane Doe", "avatar_url": "..." },
    "category": { "id": 2, "name": "Style", "slug": "style" },
    "tags": [ { "id": 1, "name": "fashion" } ],
    "related_posts": [ ... ],
    "meta_title": "How to Style a Capsule Wardrobe | StoreName",
    "meta_description": "...",
    "og_image": "...",
    "published_at": "2025-02-15T09:00:00Z"
  }
}
```
