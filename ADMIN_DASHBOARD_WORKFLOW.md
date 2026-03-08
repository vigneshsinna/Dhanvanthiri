# Admin & Analytics Dashboard Module — `ADMIN_DASHBOARD_WORKFLOW`

> **Stack:** Laravel 11 · MySQL 8 · File Cache · React 18 + TypeScript · React Query · Redux Toolkit · Recharts

---

## 1. Overview

Provides a fully featured back-office experience: real-time KPI dashboard, sales analytics, inventory management, customer management, activity logs, role-based admin access, and data export capabilities.

---

## 2. Database Schema

### `admin_activity_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `user_id` | FK → `users` | |
| `action` | `varchar(100)` | e.g. `order.status.updated` |
| `entity_type` | `varchar(50)` | e.g. `Order`, `Product` |
| `entity_id` | `bigint` | Nullable |
| `old_values` | `json` | Nullable |
| `new_values` | `json` | Nullable |
| `ip_address` | `varchar(45)` | |
| `user_agent` | `varchar(255)` | |
| `created_at` | `timestamp` | |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | Laravel default |
| `type` | `varchar(255)` | Notification class |
| `notifiable_type` | `varchar(100)` | |
| `notifiable_id` | `bigint` | |
| `data` | `json` | |
| `read_at` | `timestamp` | Nullable |
| `created_at` | `timestamp` | |

### `store_settings`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `group` | `varchar(50)` | e.g. `general`, `shipping`, `payment`, `email` |
| `key` | `varchar(100)` | |
| `value` | `text` | |
| `cast` | `varchar(20)` | `string`, `boolean`, `integer`, `json` |

---

## 3. Analytics Data Model

All analytics are computed from existing tables on-demand with file-based cache. No separate analytics tables needed for MVP.

### Computed Metrics

```
Revenue Metrics:
  - total_revenue              = SUM(grand_total) WHERE status IN (paid, processing, shipped, delivered, completed)
  - revenue_today / week / month / year
  - revenue_by_day[]           (last 30 days)
  - revenue_by_month[]         (last 12 months)
  - avg_order_value            = total_revenue / order_count
  - revenue_growth_percent     = (this_period - last_period) / last_period * 100

Order Metrics:
  - total_orders
  - orders_by_status{}
  - order_count_today / week / month
  - order_growth_percent

Customer Metrics:
  - total_customers
  - new_customers_this_month
  - returning_customers_percent
  - customer_lifetime_value    = total_revenue / unique_customers

Product Metrics:
  - top_selling_products[]     (by quantity sold, revenue)
  - low_stock_products[]       (stock <= low_stock_threshold)
  - out_of_stock_products[]
  - most_viewed_products[]     (via post views if applicable)

Conversion:
  - cart_abandonment_rate      = (carts_with_items - completed_orders) / carts_with_items
```

---

## 4. Backend — Laravel 11

### 4.1 Routes

```php
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {

    // Dashboard & Analytics
    Route::get('/dashboard/summary',      [DashboardController::class, 'summary']);
    Route::get('/analytics/revenue',      [AnalyticsController::class, 'revenue']);
    Route::get('/analytics/orders',       [AnalyticsController::class, 'orders']);
    Route::get('/analytics/customers',    [AnalyticsController::class, 'customers']);
    Route::get('/analytics/products',     [AnalyticsController::class, 'products']);
    Route::get('/analytics/export',       [AnalyticsController::class, 'export']);

    // Customer Management
    Route::get('/customers',              [AdminCustomerController::class, 'index']);
    Route::get('/customers/{id}',         [AdminCustomerController::class, 'show']);
    Route::put('/customers/{id}',         [AdminCustomerController::class, 'update']);
    Route::put('/customers/{id}/status',  [AdminCustomerController::class, 'toggleStatus']);

    // Inventory
    Route::get('/inventory',              [InventoryController::class, 'index']);
    Route::put('/inventory/{variantId}',  [InventoryController::class, 'update']);
    Route::get('/inventory/alerts',       [InventoryController::class, 'alerts']);
    Route::post('/inventory/bulk-update', [InventoryController::class, 'bulkUpdate']);

    // Settings
    Route::get('/settings',               [SettingsController::class, 'index']);
    Route::put('/settings',               [SettingsController::class, 'update']);

    // Notifications & Activity
    Route::get('/notifications',          [AdminNotificationController::class, 'index']);
    Route::put('/notifications/read-all', [AdminNotificationController::class, 'markAllRead']);
    Route::get('/activity-logs',          [ActivityLogController::class, 'index']);

    // Admin User Management (super_admin only)
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/admins',             [AdminUserController::class, 'index']);
        Route::post('/admins',            [AdminUserController::class, 'store']);
        Route::put('/admins/{id}',        [AdminUserController::class, 'update']);
        Route::delete('/admins/{id}',     [AdminUserController::class, 'destroy']);
    });
});
```

### 4.2 Controllers

#### `DashboardController`

```
summary(Request $request)
  → ?period=today|week|month|year (default: month)
  → Cache key: "dashboard.summary.{period}" TTL: 5 min
  → Returns:
    {
      revenue:           { current, previous, growth_percent },
      orders:            { current, previous, growth_percent, by_status },
      customers:         { total, new_this_period, returning_percent },
      products:          { active, low_stock, out_of_stock },
      recent_orders:     Order[] (last 10),
      top_products:      ProductSalesStat[] (top 5),
      revenue_chart:     RevenueDataPoint[] (daily for period),
      pending_returns:   int,
      pending_reviews:   int,
    }
```

#### `AnalyticsController`

```
revenue(Request $request)
  → ?from=&to=&group_by=day|week|month
  → Returns: RevenueDataPoint[] with: date, revenue, order_count, avg_order_value
  → Cache: keyed by params, TTL 10 min

orders(Request $request)
  → ?from=&to=
  → Returns: order counts by status, hourly distribution, fulfilment rate

customers(Request $request)
  → ?from=&to=
  → Returns: new vs returning, top customers by LTV, geographic distribution

products(Request $request)
  → Returns: top 20 by revenue, by quantity, conversion rate by category

export(Request $request)
  → ?type=orders|revenue|customers|inventory&from=&to=&format=csv|xlsx
  → Dispatches ExportJob → returns download URL when complete
```

#### `InventoryController`

```
index(Request $request)
  → Filter: low_stock, out_of_stock, category_id, search
  → Returns: products with all variants and current stock levels
  → Sort: stock_asc (critical first by default)

update(UpdateInventoryRequest $request, int $variantId)
  → Validate: quantity >= 0
  → Update variant stock
  → Update parent product aggregate stock
  → Log to admin_activity_logs

bulkUpdate(BulkInventoryRequest $request)
  → Array of { variant_id, quantity, adjustment_type: 'set'|'add'|'subtract' }
  → Process in transaction
  → Return summary: { updated, failed[] }

alerts()
  → Returns: low_stock_products[], out_of_stock_products[]
  → Cache: 5 min
```

### 4.3 `ActivityLogService`

```php
class ActivityLogService
{
    public function log(
        string $action,
        ?Model $entity = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        AdminActivityLog::create([
            'user_id'     => auth()->id(),
            'action'      => $action,
            'entity_type' => $entity ? class_basename($entity) : null,
            'entity_id'   => $entity?->id,
            'old_values'  => $oldValues,
            'new_values'  => $newValues,
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->userAgent(),
        ]);
    }
}
```

Logged automatically via **Eloquent Observers** on: `Order`, `Product`, `User`, `Coupon`, `ProductVariant`.

### 4.4 `SettingsService`

```php
class SettingsService
{
    public function get(string $key, mixed $default = null): mixed
    public function set(string $key, mixed $value): void
    public function getGroup(string $group): array
    // Settings cached in memory per request; file cache TTL 1 hour
}

// Usage
settings()->get('general.store_name')
settings()->get('shipping.free_threshold')
settings()->set('payment.stripe_enabled', true)
```

### 4.5 Queued Jobs

| Job | Description |
|---|---|
| `ExportOrdersJob` | Generates CSV/XLSX for orders export |
| `ExportRevenueReportJob` | Revenue report with charts data |
| `DailyAnalyticsSnapshotJob` | Stores daily aggregates (future optimisation) |
| `LowStockDigestJob` | Daily email to admin with low-stock summary |
| `WeeklyRevenueReportJob` | Emails revenue summary to super_admin |

---

## 5. Frontend — React 18 + TypeScript

### 5.1 React Query Hooks

```ts
// Dashboard
useDashboardSummaryQuery(period: Period)     // GET /admin/dashboard/summary
useRevenueAnalyticsQuery(params)             // GET /admin/analytics/revenue
useOrderAnalyticsQuery(params)               // GET /admin/analytics/orders
useCustomerAnalyticsQuery(params)            // GET /admin/analytics/customers
useProductAnalyticsQuery()                   // GET /admin/analytics/products
useExportMutation()                          // GET /admin/analytics/export

// Inventory
useInventoryQuery(filters)                   // GET /admin/inventory
useInventoryAlertsQuery()                    // GET /admin/inventory/alerts
useUpdateInventoryMutation()                 // PUT /admin/inventory/:id
useBulkUpdateInventoryMutation()             // POST /admin/inventory/bulk-update

// Customers
useAdminCustomersQuery(filters)              // GET /admin/customers
useAdminCustomerQuery(id)                    // GET /admin/customers/:id
useToggleCustomerStatusMutation()            // PUT /admin/customers/:id/status

// Settings
useSettingsQuery()
useUpdateSettingsMutation()

// Notifications
useAdminNotificationsQuery()
useMarkAllNotificationsReadMutation()
```

### 5.2 Redux Slice (`adminSlice.ts`)

```ts
interface AdminState {
  period: 'today' | 'week' | 'month' | 'year';
  revenueChartGroupBy: 'day' | 'week' | 'month';
  sidebarCollapsed: boolean;
  notificationCount: number;
}
```

### 5.3 Pages & Components

| Route | Component | Description |
|---|---|---|
| `/admin` | `AdminDashboardPage` | KPI summary + charts |
| `/admin/analytics` | `AnalyticsPage` | Deep-dive analytics |
| `/admin/orders` | `AdminOrdersPage` | Order management table |
| `/admin/products` | `AdminProductsPage` | Product CRUD |
| `/admin/inventory` | `AdminInventoryPage` | Stock management |
| `/admin/customers` | `AdminCustomersPage` | Customer list + detail |
| `/admin/cms/*` | See CMS_WORKFLOW | Content management |
| `/admin/coupons` | `AdminCouponsPage` | Discount management |
| `/admin/returns` | `AdminReturnsPage` | Return request queue |
| `/admin/settings` | `AdminSettingsPage` | Store configuration |
| `/admin/activity` | `AdminActivityPage` | Audit log viewer |
| `/admin/admins` | `AdminUsersPage` | Admin user management |

---

#### `AdminDashboardPage`

**KPI Cards Row**
```tsx
<KpiCard
  title="Revenue"
  value={formatCurrency(summary.revenue.current)}
  change={summary.revenue.growth_percent}
  icon={<DollarSign />}
  period="vs last month"
/>
// Repeat for: Orders, Customers, Avg Order Value
```

**Revenue Chart** (Recharts `AreaChart`)
```tsx
<AreaChart data={revenueChart}>
  <Area dataKey="revenue" stroke="#6366f1" fill="#6366f140" />
  <Area dataKey="order_count" stroke="#22c55e" />
</AreaChart>
```

**Orders by Status** (Recharts `PieChart` / `DonutChart`)

**Top Products Table**
```
Rank | Product | Qty Sold | Revenue | Stock
```

**Recent Orders Table** (last 10, with quick status badge)

**Low Stock Alerts Panel** (collapsible, sorted by criticality)

---

#### `AdminInventoryPage`

- Full product/variant table with inline quantity edit
- Color-coded stock levels: 🔴 0 · 🟡 ≤ threshold · 🟢 healthy
- Bulk update: select rows → set quantity / add / subtract
- CSV import for batch stock update
- Filter tabs: All / Low Stock / Out of Stock

#### `AdminCustomerPage` (Detail)

- Profile card: avatar, name, email, phone, status toggle, join date
- Stats: total orders, total spend, avg order value, last order date
- Order history table (compact)
- Address book (read-only)
- Activity timeline

#### `AdminSettingsPage`

Tabbed settings panels:
- **General**: store name, logo, timezone, currency
- **Email**: SMTP config, email templates toggle
- **Payment**: enable/disable gateways, test mode toggle
- **Shipping**: free shipping threshold, default zone
- **SEO**: global meta defaults, Google Analytics ID
- **Notifications**: which events trigger admin emails/Slack

### 5.4 TypeScript Types

```ts
interface DashboardSummary {
  revenue: MetricWithGrowth;
  orders: OrderMetrics;
  customers: CustomerMetrics;
  products: ProductMetrics;
  recentOrders: OrderCompact[];
  topProducts: ProductSalesStat[];
  revenueChart: RevenueDataPoint[];
  pendingReturns: number;
  pendingReviews: number;
}

interface MetricWithGrowth {
  current: number;
  previous: number;
  growthPercent: number;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
}

interface ProductSalesStat {
  productId: number;
  name: string;
  primaryImageUrl: string | null;
  qtySold: number;
  revenue: number;
  stockQuantity: number;
}

type Period = 'today' | 'week' | 'month' | 'year';
```

---

## 6. Admin Route Guard

```tsx
// AdminRoute.tsx
// 1. Check isAuthenticated (Redux)
// 2. Check user.role in ['admin', 'super_admin']
// 3. Redirect /login if not authenticated
// 4. Redirect / if authenticated but not admin

// SuperAdminRoute.tsx — wraps AdminRoute
// 5. Further check user.role === 'super_admin'
// 6. Redirect /admin if insufficient role
```

---

## 7. Data Export

```
User selects: type, date range, format
→ POST /admin/analytics/export { type, from, to, format }
← 202 { export_id, status: "queued" }

Polling: GET /admin/exports/:id
← { status: "completed", download_url: "..." } | { status: "processing" }

Download: redirect to signed S3 URL (15 min expiry)
```

---

## 8. API Response Contracts

### `GET /admin/dashboard/summary?period=month` — `200`
```json
{
  "data": {
    "revenue": { "current": 15420.50, "previous": 12300.00, "growth_percent": 25.4 },
    "orders":  { "current": 128, "previous": 105, "growth_percent": 21.9,
                 "by_status": { "paid": 12, "processing": 8, "shipped": 34, "completed": 74 } },
    "customers": { "total": 1420, "new_this_period": 87, "returning_percent": 62.3 },
    "products": { "active": 145, "low_stock": 12, "out_of_stock": 3 },
    "pending_returns": 4,
    "pending_reviews": 11,
    "revenue_chart": [
      { "date": "2025-02-01", "revenue": 480.00, "order_count": 4 },
      ...
    ],
    "top_products": [
      { "product_id": 5, "name": "Classic White Tee", "qty_sold": 42, "revenue": 1259.58 }
    ]
  }
}
```

### `GET /admin/inventory/alerts` — `200`
```json
{
  "data": {
    "out_of_stock": [
      { "variant_id": 12, "sku": "CWT-RED-XL", "product_name": "Classic White Tee",
        "variant_label": "Red / XL", "stock_quantity": 0 }
    ],
    "low_stock": [
      { "variant_id": 8, "sku": "CWT-BLU-M", "product_name": "Classic White Tee",
        "variant_label": "Blue / M", "stock_quantity": 3, "threshold": 5 }
    ]
  }
}
```
