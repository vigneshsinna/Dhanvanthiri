# CMS and Content Workflow

## 1) Feature Scope

CMS workflow manages public content and content administration:

- Dynamic pages (`/pages/:slug`)
- Blog posts and categories
- Banners and FAQ content blocks
- Menus by location
- SEO endpoints (`sitemap.xml`, `robots.txt`)
- Admin CRUD for pages/posts/categories/banners/faqs/menus/media
- SEO analysis helper endpoint for admin content editing

## 2) End-to-End Workflow

1. Public frontend requests CMS resources via feature hooks.
2. Backend CMS controllers return published content records.
3. Static/legal pages use seeded/default content in migrations and seeders.
4. Admin UI performs CRUD and media uploads to CMS admin endpoints.
5. Scheduler jobs support delayed publishing and sitemap regeneration.

## 3) API Contract (Implemented Routes)

Public:

- `GET /api/pages/{slug}`
- `GET /api/posts`
- `GET /api/posts/{slug}`
- `GET /api/posts/category/{slug}`
- `GET /api/banners`
- `GET /api/faqs`
- `GET /api/menus/{location}`
- `GET /api/sitemap.xml`
- `GET /api/robots.txt`

Admin (`/api/admin`, auth + role):

- `apiResource pages`
- `apiResource posts`
- `apiResource post-categories`
- `apiResource banners`
- `apiResource faqs`
- `apiResource menus`
- `PUT /menus/{id}/items`
- `POST /media`
- `GET /media`
- `DELETE /media/{id}`
- `POST /seo/analysis`

## 4) Backend File Map

### Controllers

- `backend/app/Modules/CMS/Http/Controllers/PageController.php`
- `backend/app/Modules/CMS/Http/Controllers/PostController.php`
- `backend/app/Modules/CMS/Http/Controllers/BannerController.php`
- `backend/app/Modules/CMS/Http/Controllers/FaqController.php`
- `backend/app/Modules/CMS/Http/Controllers/MenuController.php`
- `backend/app/Modules/CMS/Http/Controllers/SeoController.php`
- `backend/app/Modules/CMS/Http/Controllers/AdminPageController.php`
- `backend/app/Modules/CMS/Http/Controllers/AdminPostController.php`
- `backend/app/Modules/CMS/Http/Controllers/AdminPostCategoryController.php`
- `backend/app/Modules/CMS/Http/Controllers/AdminBannerController.php`
- `backend/app/Modules/CMS/Http/Controllers/AdminFaqController.php`
- `backend/app/Modules/CMS/Http/Controllers/AdminMenuController.php`
- `backend/app/Modules/CMS/Http/Controllers/AdminMediaController.php`
- `backend/app/Modules/CMS/Http/Controllers/AdminSeoController.php`

### Models

- `backend/app/Modules/CMS/Models/Page.php`
- `backend/app/Modules/CMS/Models/Post.php`
- `backend/app/Modules/CMS/Models/PostCategory.php`
- `backend/app/Modules/CMS/Models/PostTag.php`
- `backend/app/Modules/CMS/Models/Banner.php`
- `backend/app/Modules/CMS/Models/Faq.php`
- `backend/app/Modules/CMS/Models/Menu.php`
- `backend/app/Modules/CMS/Models/MenuItem.php`
- `backend/app/Modules/CMS/Models/MediaLibrary.php`

### Services and jobs

- `backend/app/Modules/CMS/Services/SeoAnalysisService.php`
- `backend/app/Modules/CMS/Jobs/ScheduledPublishJob.php`
- `backend/app/Modules/CMS/Jobs/RegenerateSitemapJob.php`

### Schema and seeded content

- `backend/database/migrations/2026_03_03_000006_create_cms_tables.php`
- `backend/database/migrations/2026_03_07_000009_update_legal_pages_content.php`
- `backend/database/seeders/ProductSeeder.php`

## 5) Frontend File Map

### CMS API + pages

- `frontend/src/features/cms/api.ts`
- `frontend/src/features/cms/pages/BlogListPage.tsx`
- `frontend/src/features/cms/pages/BlogPostPage.tsx`
- `frontend/src/features/cms/pages/DynamicPage.tsx`
- `frontend/src/features/cms/pages/FaqPage.tsx`

### Static/fallback content dependencies

- `frontend/src/pages/AboutPage.tsx`
- `frontend/src/lib/fallbackData.ts`

## 6) Data Tables

- `pages`
- `posts`
- `post_categories`
- `post_tags`
- `post_post_tags`
- `banners`
- `faqs`
- `menus`
- `menu_items`
- `media_library`

## 7) Tests and Coverage Files

- `frontend/src/features/admin/__tests__/cms-admin-contract.test.ts`
- `backend/tests/Unit/SeoAnalysisServiceTest.php`

## 8) Integration Touchpoints

- Homepage and app layout consume CMS menus, banners, and FAQ/blog content.
- Legal and policy pages rely on seeded CMS page data.
- Admin workflow depends on CMS APIs for storefront content operations.
