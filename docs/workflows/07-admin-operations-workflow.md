# Admin Operations Workflow

## 1) Feature Scope

Admin workflow aggregates back-office capabilities across modules:

- Dashboard KPIs and analytics charts
- Product/category/review moderation
- Order lifecycle actions (status, shipment, returns)
- Customer profile/status management
- Inventory updates and low-stock alerts
- CMS management screens (pages/posts/banners/faqs/media/settings)
- Settings management
- Notifications and activity logs
- Super-admin user administration
- Export job tracking and analytics export request handling

## 2) End-to-End Workflow

1. Admin authenticates through standard auth flow and enters `/admin` routes.
2. Admin frontend pages call `frontend/src/features/admin/api.ts` hooks.
3. Backend `/api/admin/*` endpoints are protected by:
  - `auth:api`
  - `role:admin`
4. Super-admin-only endpoints are nested behind additional `role:super_admin`.
5. Controllers perform domain operations (catalog, orders, cms, settings, analytics).
6. Jobs capture async admin operations like reports and digest notifications.

## 3) API Contract (Implemented Routes under `/api/admin`)

### Analytics and dashboard

- `GET /dashboard/summary`
- `GET /analytics/revenue`
- `GET /analytics/orders`
- `GET /analytics/customers`
- `GET /analytics/products`
- `POST /analytics/export`
- `GET /exports/{id}`

### Catalog/admin commerce operations

- `apiResource /categories`
- `apiResource /products`
- `POST /products/{id}/images`
- `DELETE /products/images/{id}`
- `PUT /products/{id}/variants`
- `PUT /reviews/{id}/status`
- `GET /reviews`
- `DELETE /reviews/{id}`

### Orders/fulfillment/refunds

- `GET /orders`
- `GET /orders/{id}`
- `PUT /orders/{id}/status`
- `POST /orders/{id}/shipment`
- `PUT /shipments/{id}`
- `POST /shipments/{id}/events`
- `GET /returns`
- `PUT /returns/{id}`
- `POST /orders/{id}/refund` (idempotency middleware)
- `GET /payments`

### Customers and inventory

- `GET /customers`
- `GET /customers/{id}`
- `PUT /customers/{id}`
- `PUT /customers/{id}/status`
- `GET /inventory`
- `PUT /inventory/{variantId}`
- `GET /inventory/alerts`
- `POST /inventory/bulk-update`

### CMS and settings

- `apiResource /pages`
- `apiResource /posts`
- `apiResource /post-categories`
- `apiResource /banners`
- `apiResource /faqs`
- `apiResource /menus`
- `PUT /menus/{id}/items`
- `POST /media`
- `GET /media`
- `DELETE /media/{id}`
- `POST /seo/analysis`
- `GET /settings`
- `PUT /settings`

### Notification and audit

- `GET /notifications`
- `PUT /notifications/read-all`
- `GET /activity-logs`

### Super-admin only

- `GET /admins`
- `POST /admins`
- `PUT /admins/{id}`
- `DELETE /admins/{id}`

## 4) Backend File Map

### Controllers

- `backend/app/Modules/Admin/Http/Controllers/DashboardController.php`
- `backend/app/Modules/Admin/Http/Controllers/AnalyticsController.php`
- `backend/app/Modules/Admin/Http/Controllers/InventoryController.php`
- `backend/app/Modules/Admin/Http/Controllers/AdminCustomerController.php`
- `backend/app/Modules/Admin/Http/Controllers/SettingsController.php`
- `backend/app/Modules/Admin/Http/Controllers/AdminNotificationController.php`
- `backend/app/Modules/Admin/Http/Controllers/ActivityLogController.php`
- `backend/app/Modules/Admin/Http/Controllers/AdminUserController.php`
- `backend/app/Modules/Admin/Http/Controllers/ExportController.php`

### Services

- `backend/app/Modules/Admin/Services/ActivityLogService.php`
- `backend/app/Modules/Admin/Services/SettingsService.php`

### Models

- `backend/app/Modules/Admin/Models/AdminActivityLog.php`
- `backend/app/Modules/Admin/Models/StoreSetting.php`
- `backend/app/Modules/Admin/Models/ExportJob.php`

### Jobs

- `backend/app/Modules/Admin/Jobs/DailyAnalyticsSnapshotJob.php`
- `backend/app/Modules/Admin/Jobs/WeeklyRevenueReportJob.php`
- `backend/app/Modules/Admin/Jobs/LowStockDigestJob.php`
- `backend/app/Modules/Admin/Jobs/ExportOrdersJob.php`
- `backend/app/Modules/Admin/Jobs/ExportRevenueReportJob.php`

### Schema

- `backend/database/migrations/2026_03_03_000007_create_admin_tables.php`

## 5) Frontend File Map

### Layout and state

- `frontend/src/components/layout/AdminLayout.tsx`
- `frontend/src/features/admin/store/adminSlice.ts`
- `frontend/src/features/admin/api.ts`

### Admin pages

- `frontend/src/features/admin/pages/AdminDashboardPage.tsx`
- `frontend/src/features/admin/pages/AdminProductsPage.tsx`
- `frontend/src/features/admin/pages/AdminOrdersPage.tsx`
- `frontend/src/features/admin/pages/AdminCustomersPage.tsx`
- `frontend/src/features/admin/pages/AdminInventoryPage.tsx`
- `frontend/src/features/admin/pages/AdminCategoriesPage.tsx`
- `frontend/src/features/admin/pages/AdminReviewsPage.tsx`
- `frontend/src/features/admin/pages/AdminPagesPage.tsx`
- `frontend/src/features/admin/pages/AdminPostsPage.tsx`
- `frontend/src/features/admin/pages/AdminBannersPage.tsx`
- `frontend/src/features/admin/pages/AdminFaqsPage.tsx`
- `frontend/src/features/admin/pages/AdminMediaPage.tsx`
- `frontend/src/features/admin/pages/AdminSettingsPage.tsx`

## 6) Data Tables

- `admin_activity_logs`
- `store_settings`
- `export_jobs`
- `notifications`

## 7) Tests and Coverage Files

- `frontend/src/features/admin/__tests__/admin-workflow-contract.test.ts`
- `frontend/src/features/admin/__tests__/review-moderation-contract.test.ts`
- `frontend/src/features/admin/__tests__/cms-admin-contract.test.ts`
- `frontend/src/features/admin/store/adminSlice.test.ts`

## 8) Remaining Admin Gaps / Risks

- `backend/routes/api.php` currently contains escaped newline text in the admin review route block:
  - `Route::put('/reviews/{id}/status', ...);\n Route::get('/reviews', ...);\n Route::delete('/reviews/{id}', ...);`
- This should be normalized to real newlines immediately, because it risks route registration/runtime parse issues.

## 9) Integration Touchpoints

- Admin workflow orchestrates Catalog, Orders, Payment, and CMS modules.
- Scheduled admin jobs are wired through `backend/app/Console/Kernel.php`.
- Access control depends on shared auth and `RoleMiddleware`.
