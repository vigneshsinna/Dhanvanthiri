# Product Catalog Workflow

## 1) Feature Scope

Catalog workflow currently covers:

- Category browsing (list + detail)
- Product listing with filters/search/sort
- Featured products listing
- Product detail with variants/images/tags/reviews
- Customer review CRUD (authenticated)
- Admin catalog operations (products/categories/review moderation)
- Public recommendations endpoint
- Wishlist API and wishlist page (auth)
- Recently viewed tracking helper (client-side localStorage)

## 2) End-to-End Workflow

1. User opens catalog page (`/products`) or product detail (`/products/:slug`).
2. Frontend hooks call `/api/products`, `/api/categories`, `/api/products/{slug}`, `/api/products/recommendations`, and review endpoints.
3. Backend catalog controllers query Eloquent models with related category/image/variant/review data.
4. API response returns to React Query cache and renders card/detail UI.
5. Admin screens use dedicated admin endpoints for product/category/review management.

## 3) API Contract (Implemented Routes)

Public:

- `GET /api/categories`
- `GET /api/categories/{slug}`
- `GET /api/products`
- `GET /api/products/search`
- `GET /api/products/featured`
- `GET /api/products/recommendations`
- `GET /api/products/{slug}`
- `GET /api/products/{id}/reviews`

Authenticated customer:

- `POST /api/products/{id}/reviews`
- `PUT /api/reviews/{id}`
- `DELETE /api/reviews/{id}`
- `GET /api/wishlist`
- `POST /api/wishlist`
- `DELETE /api/wishlist/{id}`

Admin (`/api/admin`, auth + role):

- `apiResource categories`
- `apiResource products`
- `POST /products/{id}/images`
- `DELETE /products/images/{id}`
- `PUT /products/{id}/variants`
- `PUT /reviews/{id}/status`
- `GET /reviews`
- `DELETE /reviews/{id}`

## 4) Backend File Map

### Controllers

- `backend/app/Modules/Catalog/Http/Controllers/CategoryController.php`
- `backend/app/Modules/Catalog/Http/Controllers/ProductController.php`
- `backend/app/Modules/Catalog/Http/Controllers/ReviewController.php`
- `backend/app/Modules/Catalog/Http/Controllers/RecommendationController.php`
- `backend/app/Modules/Catalog/Http/Controllers/WishlistController.php`
- `backend/app/Modules/Catalog/Http/Controllers/AdminCategoryController.php`
- `backend/app/Modules/Catalog/Http/Controllers/AdminProductController.php`
- `backend/app/Modules/Catalog/Http/Controllers/AdminReviewController.php`

### Request Validators

- `backend/app/Modules/Catalog/Http/Requests/CreateProductRequest.php`
- `backend/app/Modules/Catalog/Http/Requests/UpdateProductRequest.php`
- `backend/app/Modules/Catalog/Http/Requests/SyncVariantsRequest.php`
- `backend/app/Modules/Catalog/Http/Requests/CreateReviewRequest.php`
- `backend/app/Modules/Catalog/Http/Requests/UpdateReviewRequest.php`

### Models

- `backend/app/Modules/Catalog/Models/Category.php`
- `backend/app/Modules/Catalog/Models/Product.php`
- `backend/app/Modules/Catalog/Models/ProductImage.php`
- `backend/app/Modules/Catalog/Models/ProductVariant.php`
- `backend/app/Modules/Catalog/Models/VariantOption.php`
- `backend/app/Modules/Catalog/Models/VariantOptionValue.php`
- `backend/app/Modules/Catalog/Models/Tag.php`
- `backend/app/Modules/Catalog/Models/Review.php`
- `backend/app/Modules/Catalog/Models/Wishlist.php`
- `backend/app/Modules/Catalog/Models/WishlistItem.php`

### Schema

- `backend/database/migrations/2026_03_03_000002_create_catalog_tables.php`
- `backend/database/migrations/2026_03_07_000010_add_guest_checkout_and_wishlist_tables.php`

## 5) Frontend File Map

### API + state

- `frontend/src/features/catalog/api.ts`
- `frontend/src/features/catalog/store/catalogSlice.ts`
- `frontend/src/features/catalog/recentlyViewed.ts`
- `frontend/src/features/wishlist/api.ts`
- `frontend/src/lib/query/keys.ts`

### Pages

- `frontend/src/features/catalog/pages/CatalogPage.tsx`
- `frontend/src/features/catalog/pages/ProductDetailPage.tsx`
- `frontend/src/features/wishlist/pages/WishlistPage.tsx`

### Validation

- `frontend/src/features/catalog/schemas/reviewSchema.ts`

## 6) Data Tables

- `categories`
- `products`
- `product_images`
- `product_variants`
- `variant_options`
- `variant_option_values`
- `product_variant_option_values`
- `tags`
- `product_tags`
- `reviews`
- `wishlists`
- `wishlist_items`

## 7) Contract and Behavior Notes

- Recommendation route is explicitly registered before `/products/{slug}` to avoid shadowing.
- Admin review moderation endpoint is `PUT /api/admin/reviews/{id}/status`.
- Recently viewed is persisted in browser localStorage, not backend DB.

## 8) Tests and Coverage Files

- `frontend/src/features/catalog/__tests__/catalog-contract.test.ts`
- `frontend/src/features/catalog/__tests__/recommendations-contract.test.ts`
- `frontend/src/features/wishlist/__tests__/wishlist-contract.test.ts`
- `frontend/src/features/catalog/pages/CatalogPage.test.tsx`
- `frontend/src/features/catalog/pages/ProductDetailPage.test.tsx`

## 9) Remaining Catalog UX Gaps

- Product detail currently renders "You May Also Like" from static `productCatalogData` instead of `GET /api/products/recommendations`.
- Recently viewed is tracked but no storefront section is rendered yet for users to see/manage it.
