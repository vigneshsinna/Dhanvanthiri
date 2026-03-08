# Product & Catalog Module — `PRODUCT_CATALOG_WORKFLOW`

> **Stack:** Laravel 11 · MySQL 8 · File-based Cache · React 18 + TypeScript · React Query · Redux Toolkit

---

## 1. Overview

Manages the full product lifecycle: categories, products, variants (SKUs), inventory, media gallery, pricing, discounts, tags, reviews, and search/filter/sort capabilities.

---

## 2. Database Schema

### `categories`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `parent_id` | FK → `categories` | Nullable (root category) |
| `name` | `varchar(100)` | |
| `slug` | `varchar(120)` | Unique |
| `description` | `text` | Nullable |
| `image` | `varchar(255)` | Nullable |
| `sort_order` | `int` | Default: 0 |
| `is_active` | `boolean` | Default: true |
| `timestamps` | | |

### `products`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `category_id` | FK → `categories` | |
| `name` | `varchar(200)` | |
| `slug` | `varchar(220)` | Unique |
| `sku` | `varchar(100)` | Unique, base SKU |
| `description` | `longtext` | Rich HTML |
| `short_description` | `varchar(500)` | Nullable |
| `price` | `decimal(10,2)` | Base price |
| `compare_price` | `decimal(10,2)` | Nullable, crossed-out price |
| `cost_price` | `decimal(10,2)` | Nullable, internal |
| `stock_quantity` | `int` | Aggregate (updated by variants) |
| `low_stock_threshold` | `int` | Default: 5 |
| `weight` | `decimal(8,2)` | kg, for shipping |
| `status` | `enum('draft','active','archived')` | Default: `draft` |
| `is_featured` | `boolean` | Default: false |
| `meta_title` | `varchar(160)` | SEO |
| `meta_description` | `varchar(320)` | SEO |
| `published_at` | `timestamp` | Nullable |
| `timestamps` | | |

### `product_variants`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `product_id` | FK → `products` | |
| `sku` | `varchar(100)` | Unique |
| `price` | `decimal(10,2)` | Overrides product price if set |
| `compare_price` | `decimal(10,2)` | Nullable |
| `stock_quantity` | `int` | Default: 0 |
| `weight` | `decimal(8,2)` | Nullable |
| `image_id` | FK → `product_images` | Nullable |
| `is_active` | `boolean` | Default: true |
| `timestamps` | | |

### `variant_options`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `product_id` | FK → `products` | |
| `name` | `varchar(50)` | e.g. `Color`, `Size` |
| `sort_order` | `int` | |

### `variant_option_values`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `variant_option_id` | FK → `variant_options` | |
| `value` | `varchar(100)` | e.g. `Red`, `XL` |
| `sort_order` | `int` | |

### `product_variant_option_values` (pivot)
| Column | Type |
|---|---|
| `product_variant_id` | FK |
| `variant_option_value_id` | FK |

### `product_images`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `product_id` | FK → `products` | |
| `path` | `varchar(255)` | S3 or local |
| `alt_text` | `varchar(200)` | Nullable |
| `sort_order` | `int` | |
| `is_primary` | `boolean` | Default: false |
| `timestamps` | | |

### `tags` & `product_tags` (pivot)
| Column | Type |
|---|---|
| `id` | PK |
| `name` | `varchar(50)` Unique |
| `slug` | `varchar(60)` Unique |

### `reviews`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `product_id` | FK → `products` | |
| `user_id` | FK → `users` | |
| `rating` | `tinyint` | 1–5 |
| `title` | `varchar(100)` | Nullable |
| `body` | `text` | |
| `status` | `enum('pending','approved','rejected')` | Default: `pending` |
| `timestamps` | | |

---

## 3. Backend — Laravel 11

### 3.1 Routes

```php
// Public
Route::get('/categories',                  [CategoryController::class, 'index']);
Route::get('/categories/{slug}',           [CategoryController::class, 'show']);
Route::get('/products',                    [ProductController::class, 'index']);
Route::get('/products/{slug}',             [ProductController::class, 'show']);
Route::get('/products/featured',           [ProductController::class, 'featured']);
Route::get('/products/search',             [ProductController::class, 'search']);
Route::get('/products/{id}/reviews',       [ReviewController::class, 'index']);

// Authenticated customer
Route::middleware('auth:api')->group(function () {
    Route::post('/products/{id}/reviews',  [ReviewController::class, 'store']);
    Route::put('/reviews/{id}',            [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}',         [ReviewController::class, 'destroy']);
});

// Admin
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('categories',       AdminCategoryController::class);
    Route::apiResource('products',         AdminProductController::class);
    Route::post('/products/{id}/images',   [AdminProductController::class, 'uploadImages']);
    Route::delete('/products/images/{id}', [AdminProductController::class, 'deleteImage']);
    Route::put('/products/{id}/variants',  [AdminProductController::class, 'syncVariants']);
    Route::put('/reviews/{id}/status',     [AdminReviewController::class, 'updateStatus']);
});
```

### 3.2 Controllers

#### `ProductController` (Public)

```
index(Request $request)
  Filters: category_id, min_price, max_price, tag, status=active
  Sort: price_asc, price_desc, newest, popularity, rating
  Pagination: 20 per page (configurable via ?per_page=)
  Cache: file cache keyed by query fingerprint, TTL 5 min

show(string $slug)
  → Load product with: images, variants.optionValues, tags, category
  → Include avg_rating, review_count
  → Cache: keyed by slug, TTL 10 min

featured()
  → Products where is_featured=true AND status=active, limit 12
  → Cached 15 min

search(Request $request)
  → Full-text search on name + description using MySQL FULLTEXT index
  → ?q= required, min 2 chars
  → Returns paginated ProductResource
```

#### `AdminProductController`

```
store(CreateProductRequest $request)
  → Create product → sync tags (firstOrCreate) → return ProductResource

update(UpdateProductRequest $request, Product $product)
  → Update → flush product cache

uploadImages(Request $request, Product $product)
  → Validate: max 10 images, each max 5MB, jpg/png/webp
  → Store on S3 with thumbnail generation (Queued: GenerateProductThumbnailJob)
  → Return ProductImageResource[]

syncVariants(SyncVariantsRequest $request, Product $product)
  → Delete old option values → re-create from request matrix
  → Update product.stock_quantity = sum(variants.stock_quantity)
  → Flush cache
```

### 3.3 Caching Strategy

```php
// Key pattern
"products.index.{md5(querystring)}"   TTL: 300s
"products.show.{slug}"                TTL: 600s
"products.featured"                   TTL: 900s
"categories.tree"                     TTL: 3600s

// Invalidation
// On any product write → Cache::forget("products.show.{slug}")
//                      → Cache::tags not available in file driver
//                      → Use Cache::flush() on bulk imports
```

### 3.4 Form Requests

**`CreateProductRequest`** key rules:
```php
'name'              => 'required|string|max:200',
'category_id'       => 'required|exists:categories,id',
'price'             => 'required|numeric|min:0',
'status'            => 'required|in:draft,active,archived',
'tags'              => 'array',
'tags.*'            => 'string|max:50',
'variants'          => 'array',
'variants.*.sku'    => 'required|unique:product_variants,sku',
'variants.*.price'  => 'nullable|numeric|min:0',
'variants.*.stock_quantity' => 'required|integer|min:0',
```

### 3.5 Queued Jobs

| Job | Description |
|---|---|
| `GenerateProductThumbnailJob` | Creates 400×400 and 800×800 WebP thumbnails using Intervention Image |
| `ReindexProductSearchJob` | Updates MySQL FULLTEXT index after bulk import |
| `UpdateProductStockJob` | Recalculates aggregate stock from variants |

### 3.6 Resources

**`ProductResource`**
```php
[
  'id', 'name', 'slug', 'sku', 'description', 'short_description',
  'price', 'compare_price', 'discount_percent',   // computed
  'stock_quantity', 'is_in_stock',                 // computed
  'status', 'is_featured',
  'primary_image_url',                             // computed from images
  'images'       => ProductImageResource::collection,
  'variants'     => ProductVariantResource::collection,
  'category'     => CategoryResource,
  'tags'         => TagResource::collection,
  'avg_rating',  'review_count',
  'meta_title',  'meta_description',
  'published_at', 'created_at',
]
```

---

## 4. Frontend — React 18 + TypeScript

### 4.1 React Query Hooks

```ts
// Catalog Queries
useProductsQuery(filters: ProductFilters)       // GET /products
useProductQuery(slug: string)                   // GET /products/:slug
useFeaturedProductsQuery()                      // GET /products/featured
useSearchProductsQuery(q: string)               // GET /products/search?q=
useCategoriesQuery()                            // GET /categories
useCategoryQuery(slug: string)                  // GET /categories/:slug
useProductReviewsQuery(productId: number)       // GET /products/:id/reviews

// Mutations
useCreateReviewMutation()
useUpdateReviewMutation()
useDeleteReviewMutation()
```

### 4.2 Redux Slice (`catalogSlice.ts`)

```ts
interface CatalogState {
  filters: {
    categoryId: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    tags: string[];
    sort: SortOption;
    page: number;
    perPage: number;
  };
  selectedVariant: Record<number, number>; // productId → variantId
}
```

### 4.3 Pages & Components

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Hero, featured products, categories |
| `/products` | `CatalogPage` | Filter sidebar + product grid |
| `/products/:slug` | `ProductDetailPage` | Gallery, variants, add to cart, reviews |
| `/category/:slug` | `CategoryPage` | Category header + filtered catalog |
| `/search` | `SearchPage` | Search results with query highlight |

#### Key Components

**`ProductCard`**
- Thumbnail, name, price (with compare_price strikethrough), rating stars
- Hover: quick-add button, wishlist toggle
- Badge: `Sale`, `Out of Stock`, `Featured`

**`ProductGallery`**
- Primary image large view
- Thumbnail strip (scroll)
- Zoom on hover (CSS transform)

**`VariantSelector`**
- Renders option groups (Color swatches / Size buttons)
- Marks unavailable variants as disabled
- Updates `selectedVariant` in Redux on change
- Derives price/stock from selected variant

**`FilterSidebar`**
- Category tree (collapsible)
- Price range slider (dual handle)
- Tag checkboxes
- Sort dropdown
- "Clear All" resets Redux filters

**`ReviewSection`**
- Rating breakdown bar chart
- Review list with pagination
- Write review form (auth required)

### 4.4 TypeScript Types

```ts
interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  discountPercent: number | null;
  stockQuantity: number;
  isInStock: boolean;
  status: 'draft' | 'active' | 'archived';
  isFeatured: boolean;
  primaryImageUrl: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category;
  tags: Tag[];
  avgRating: number;
  reviewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface ProductVariant {
  id: number;
  sku: string;
  price: number | null;
  comparePrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  optionValues: VariantOptionValue[];
}

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'popularity' | 'rating';
```

---

## 5. Search Implementation

```sql
-- MySQL FULLTEXT index
ALTER TABLE products ADD FULLTEXT INDEX ft_search (name, description, short_description);

-- Query
SELECT *, MATCH(name, description) AGAINST (? IN BOOLEAN MODE) AS relevance
FROM products
WHERE status = 'active'
  AND MATCH(name, description) AGAINST (? IN BOOLEAN MODE)
ORDER BY relevance DESC;
```

---

## 6. Inventory Rules

| Condition | Behaviour |
|---|---|
| `stock_quantity = 0` | `isInStock = false`; "Add to Cart" disabled |
| `stock_quantity <= low_stock_threshold` | Show "Only X left!" badge |
| Variant selected | Show variant-specific stock |
| No variants | Use product-level stock |

---

## 7. API Response Contracts

### `GET /products` — `200`
```json
{
  "data": [ { ...ProductResource } ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "last_page": 8
  },
  "links": { "next": "...", "prev": null }
}
```

### `GET /products/:slug` — `200`
```json
{
  "data": {
    "id": 12,
    "name": "Classic White Tee",
    "slug": "classic-white-tee",
    "price": 29.99,
    "compare_price": 39.99,
    "discount_percent": 25,
    "is_in_stock": true,
    "avg_rating": 4.3,
    "review_count": 47,
    "variants": [ ... ],
    "images": [ ... ]
  }
}
```
