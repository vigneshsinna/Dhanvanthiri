# Admin Panel Shell, OMS, and License Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the admin panel into an Active eCommerce-style shell, fix OMS and module-license workflow blockers, and ship supporting documentation and verification artifacts.

**Architecture:** Keep the existing `/admin/*` route structure and feature modules, then add a shared admin shell, frontend view-model adapters, and role-aware navigation on top. Fix backend role inheritance and module-setup resilience first so the UI redesign is built on stable contracts instead of page-local workarounds.

**Tech Stack:** React 18, React Router, Redux Toolkit, TanStack Query, Vitest, MSW, Laravel 11, PHPUnit, JWT auth, Tailwind CSS

---

### Task 1: Harden backend admin access and module setup behavior

**Files:**
- Modify: `backend/app/Modules/Shared/Http/Middleware/RoleMiddleware.php`
- Modify: `backend/app/Modules/Admin/Http/Controllers/ModuleLicenseController.php`
- Create: `backend/tests/Feature/AdminRouteRoleAccessTest.php`
- Create: `backend/tests/Feature/ModuleLicenseSetupGuardTest.php`
- Test: `backend/tests/Unit/ModuleLicenseControllerTest.php`

**Step 1: Write the failing tests**

```php
public function test_super_admin_can_access_admin_routes(): void
{
    $user = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($user, 'api')
        ->getJson('/api/admin/orders')
        ->assertOk();
}

public function test_module_index_returns_setup_required_when_feature_modules_table_is_missing(): void
{
    Schema::dropIfExists('feature_modules');

    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user, 'api')
        ->getJson('/api/admin/modules')
        ->assertOk()
        ->assertJsonPath('data.meta.setup_required', true);
}
```

**Step 2: Run tests to verify they fail**

Run: `composer test -- --filter=AdminRouteRoleAccessTest`
Expected: FAIL because `super_admin` currently receives `403` on `/api/admin/*`.

Run: `composer test -- --filter=ModuleLicenseSetupGuardTest`
Expected: FAIL because missing `feature_modules` currently causes a `500`.

**Step 3: Implement the minimal backend changes**

```php
$roles = explode('|', $role);

if (in_array('admin', $roles, true) && $user->role === 'super_admin') {
    return $next($request);
}

if (!in_array($user->role, $roles, true)) {
    abort(403, 'Forbidden');
}
```

```php
if (!Schema::hasTable('feature_modules')) {
    return ApiResponse::success([
        'data' => [],
        'meta' => [
            'setup_required' => true,
            'reason' => 'feature_modules_table_missing',
        ],
    ], 'Module licensing setup required');
}
```

Use an explicit typed error for module detail, write, validation, credential, health, and activation actions when setup is missing.

**Step 4: Run tests to verify they pass**

Run: `composer test -- --filter=AdminRouteRoleAccessTest`
Expected: PASS

Run: `composer test -- --filter=ModuleLicenseSetupGuardTest`
Expected: PASS

Run: `composer test -- --filter=ModuleLicenseControllerTest`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/Modules/Shared/Http/Middleware/RoleMiddleware.php backend/app/Modules/Admin/Http/Controllers/ModuleLicenseController.php backend/tests/Feature/AdminRouteRoleAccessTest.php backend/tests/Feature/ModuleLicenseSetupGuardTest.php
git commit -m "fix: harden admin role access and module setup handling"
```

### Task 2: Add frontend admin view-model adapters and contract tests

**Files:**
- Create: `frontend/src/features/admin/lib/dashboardViewModel.ts`
- Create: `frontend/src/features/admin/lib/dashboardViewModel.test.ts`
- Create: `frontend/src/features/admin/lib/orderViewModel.ts`
- Create: `frontend/src/features/admin/lib/orderViewModel.test.ts`
- Modify: `frontend/src/features/admin/pages/AdminDashboardPage.tsx`
- Modify: `frontend/src/features/admin/pages/AdminOrdersPage.tsx`

**Step 1: Write the failing tests**

```ts
it('maps dashboard summary from nested backend payload', () => {
  const vm = toDashboardViewModel({
    revenue: { current: 1200, growth_percent: 4.2 },
    orders: { current: 12, by_status: { processing: 3 } },
    customers: { total: 8 },
    products: { low_stock: 2 },
    recent_orders: [],
    top_products: [],
    pending_returns: 1,
    pending_reviews: 0,
  });

  expect(vm.kpis.orders.value).toBe(12);
  expect(vm.orderStatus.processing).toBe(3);
});

it('maps admin order list rows from user-based backend payload', () => {
  const row = toAdminOrderRow({
    id: 1,
    order_number: 'ORD-1',
    status: 'confirmed',
    grand_total: 649.6,
    user: { name: 'Lakshmi', email: 'lakshmi@example.com' },
    created_at: '2026-03-07T10:00:00Z',
  });

  expect(row.customerName).toBe('Lakshmi');
  expect(row.customerEmail).toBe('lakshmi@example.com');
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/admin/lib/dashboardViewModel.test.ts src/features/admin/lib/orderViewModel.test.ts`
Expected: FAIL because the adapter files do not exist yet.

**Step 3: Implement the adapters and wire pages through them**

```ts
export function toDashboardViewModel(payload: DashboardSummaryPayload): DashboardViewModel {
  return {
    kpis: {
      revenue: {
        value: payload.revenue.current,
        change: payload.revenue.growth_percent,
      },
      orders: {
        value: payload.orders.current,
        change: payload.orders.growth_percent,
      },
      customers: {
        value: payload.customers.total,
        change: null,
      },
      lowStock: {
        value: payload.products.low_stock,
        change: null,
      },
    },
    orderStatus: payload.orders.by_status ?? {},
    recentOrders: payload.recent_orders ?? [],
    topProducts: payload.top_products ?? [],
    pendingReturns: payload.pending_returns ?? 0,
  };
}
```

```ts
export function toAdminOrderRow(order: AdminOrderPayload): AdminOrderRow {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    total: order.grand_total,
    customerName: order.user?.name ?? '-',
    customerEmail: order.user?.email ?? '',
    createdAt: order.created_at,
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/features/admin/lib/dashboardViewModel.test.ts src/features/admin/lib/orderViewModel.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/features/admin/lib/dashboardViewModel.ts frontend/src/features/admin/lib/dashboardViewModel.test.ts frontend/src/features/admin/lib/orderViewModel.ts frontend/src/features/admin/lib/orderViewModel.test.ts frontend/src/features/admin/pages/AdminDashboardPage.tsx frontend/src/features/admin/pages/AdminOrdersPage.tsx
git commit -m "refactor: normalize admin dashboard and order payloads"
```

### Task 3: Build the shared admin shell and role-aware navigation

**Files:**
- Create: `frontend/src/features/admin/config/navigation.ts`
- Create: `frontend/src/features/admin/components/AdminPageHeader.tsx`
- Create: `frontend/src/features/admin/components/AdminStatCard.tsx`
- Modify: `frontend/src/components/layout/AdminLayout.tsx`
- Modify: `frontend/src/features/admin/store/adminSlice.ts`
- Modify: `frontend/src/features/admin/store/adminSlice.test.ts`
- Modify: `frontend/src/app/router.tsx`

**Step 1: Write the failing tests**

```ts
it('shows Module Licenses to admin but hides Admin Users', () => {
  const items = getAdminNavigation('admin');
  expect(items.some((item) => item.label === 'Module Licenses')).toBe(true);
  expect(items.some((item) => item.label === 'Admin Users')).toBe(false);
});

it('shows Admin Users to IT User', () => {
  const items = getAdminNavigation('super_admin');
  expect(items.some((item) => item.label === 'Admin Users')).toBe(true);
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/admin/store/adminSlice.test.ts`
Expected: FAIL after adding route-aware navigation expectations that are not implemented yet.

**Step 3: Implement the shell and navigation config**

```ts
export interface AdminNavItem {
  label: string;
  path?: string;
  children?: AdminNavItem[];
  roles: Array<'admin' | 'super_admin'>;
}

export const adminNavigation: AdminNavItem[] = [
  { label: 'Dashboard', path: '/admin', roles: ['admin', 'super_admin'] },
  {
    label: 'OMS',
    roles: ['admin', 'super_admin'],
    children: [
      { label: 'Order Operations', path: '/admin/orders', roles: ['admin', 'super_admin'] },
      { label: 'Shipments', path: '/admin/shipments', roles: ['admin', 'super_admin'] },
      { label: 'Returns', path: '/admin/returns', roles: ['admin', 'super_admin'] },
    ],
  },
];
```

Update the shell to include:

- expanded dark sidebar
- sticky top bar
- page title and breadcrumb support
- role-aware nav filtering
- persistent layout chrome across all admin pages

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/features/admin/store/adminSlice.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/features/admin/config/navigation.ts frontend/src/features/admin/components/AdminPageHeader.tsx frontend/src/features/admin/components/AdminStatCard.tsx frontend/src/components/layout/AdminLayout.tsx frontend/src/features/admin/store/adminSlice.ts frontend/src/features/admin/store/adminSlice.test.ts frontend/src/app/router.tsx
git commit -m "feat: add role-aware active-ecommerce admin shell"
```

### Task 4: Redesign the dashboard around shared view models and role-aware widgets

**Files:**
- Modify: `frontend/src/features/admin/pages/AdminDashboardPage.tsx`
- Modify: `frontend/src/features/admin/api.ts`
- Create: `frontend/src/features/admin/pages/AdminDashboardPage.test.tsx`
- Test: `frontend/src/features/admin/__tests__/admin-workflow-contract.test.ts`

**Step 1: Write the failing page tests**

```ts
it('renders revenue, orders, customers, and low stock cards from the real summary shape', async () => {
  renderWithProviders(<AdminDashboardPage />, {
    preloadedState: {
      auth: {
        isAuthenticated: true,
        accessToken: 'admin-token',
        user: { id: 99, name: 'Admin', email: 'admin@example.com', role: 'admin' },
      },
    },
  });

  expect(await screen.findByText(/Revenue/i)).toBeInTheDocument();
  expect(screen.getByText(/Low Stock/i)).toBeInTheDocument();
});

it('renders IT User technical widgets for super_admin', async () => {
  renderWithProviders(<AdminDashboardPage />, {
    preloadedState: {
      auth: {
        isAuthenticated: true,
        accessToken: 'super-admin-token',
        user: { id: 100, name: 'IT User', email: 'it@example.com', role: 'super_admin' },
      },
    },
  });

  expect(await screen.findByText(/License Issues/i)).toBeInTheDocument();
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/admin/pages/AdminDashboardPage.test.tsx`
Expected: FAIL because the current page does not render the new widget system.

**Step 3: Implement the dashboard**

- Use the adapter from Task 2 instead of direct field access.
- Build KPI cards, OMS status tiles, recent orders, low-stock cards, and quick actions.
- Add the IT User technical row only for `super_admin`.
- Keep charts lightweight unless the analytics query already supports meaningful data.

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/features/admin/pages/AdminDashboardPage.test.tsx src/features/admin/__tests__/admin-workflow-contract.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/features/admin/pages/AdminDashboardPage.tsx frontend/src/features/admin/pages/AdminDashboardPage.test.tsx frontend/src/features/admin/api.ts
git commit -m "feat: redesign admin dashboard with role-aware widgets"
```

### Task 5: Expand OMS into distinct admin workflows

**Files:**
- Modify: `frontend/src/features/admin/api.ts`
- Modify: `frontend/src/lib/query/keys.ts`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/features/admin/pages/AdminOrdersPage.tsx`
- Create: `frontend/src/features/admin/pages/AdminOrderDetailPage.tsx`
- Create: `frontend/src/features/admin/pages/AdminShipmentsPage.tsx`
- Create: `frontend/src/features/admin/pages/AdminReturnsPage.tsx`
- Create: `frontend/src/features/admin/pages/AdminOrderDetailPage.test.tsx`

**Step 1: Write the failing tests**

```ts
it('shows invoice and tracking actions in admin order detail', async () => {
  renderWithProviders(<AdminOrderDetailPage />, {
    route: '/admin/orders/1',
    preloadedState: {
      auth: {
        isAuthenticated: true,
        accessToken: 'admin-token',
        user: { id: 99, name: 'Admin', email: 'admin@example.com', role: 'admin' },
      },
    },
  });

  expect(await screen.findByRole('button', { name: /download invoice/i })).toBeInTheDocument();
  expect(screen.getByText(/Tracking/i)).toBeInTheDocument();
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/admin/pages/AdminOrderDetailPage.test.tsx`
Expected: FAIL because the detail page and route do not exist yet.

**Step 3: Implement OMS pages and hooks**

```ts
export function useAdminOrderQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.order(id),
    queryFn: async () => (await api.get(`/admin/orders/${id}`)).data,
    enabled,
  });
}
```

```ts
export function useAdminReturnsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.returns(params),
    queryFn: async () => (await api.get('/admin/returns', { params })).data,
  });
}
```

Use the new detail screen to expose:

- order status changes
- shipment creation links
- tracking timeline
- return summary
- invoice download action from order context

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/features/admin/pages/AdminOrderDetailPage.test.tsx src/features/admin/__tests__/admin-workflow-contract.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/features/admin/api.ts frontend/src/lib/query/keys.ts frontend/src/app/router.tsx frontend/src/features/admin/pages/AdminOrdersPage.tsx frontend/src/features/admin/pages/AdminOrderDetailPage.tsx frontend/src/features/admin/pages/AdminShipmentsPage.tsx frontend/src/features/admin/pages/AdminReturnsPage.tsx frontend/src/features/admin/pages/AdminOrderDetailPage.test.tsx
git commit -m "feat: expand admin oms workflows"
```

### Task 6: Add repo-backed system pages for reports, payments, notifications, and activity logs

**Files:**
- Modify: `frontend/src/features/admin/api.ts`
- Modify: `frontend/src/lib/query/keys.ts`
- Create: `frontend/src/features/admin/pages/AdminPaymentsPage.tsx`
- Create: `frontend/src/features/admin/pages/AdminReportsPage.tsx`
- Create: `frontend/src/features/admin/pages/AdminNotificationsPage.tsx`
- Create: `frontend/src/features/admin/pages/AdminActivityLogsPage.tsx`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/components/layout/AdminLayout.tsx`

**Step 1: Write the failing tests**

```ts
it('renders the media library label and reports entries in the shell', () => {
  const items = getAdminNavigation('admin');
  expect(items.flatMap(item => item.children ?? []).some(item => item.label === 'Media Library')).toBe(true);
  expect(items.flatMap(item => item.children ?? []).some(item => item.label === 'Sales Reports')).toBe(true);
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/admin/store/adminSlice.test.ts`
Expected: FAIL after extending the navigation expectations to include the new system/report entries.

**Step 3: Implement the new pages and hooks**

Add query hooks for:

- `/admin/payments`
- `/admin/notifications`
- `/admin/activity-logs`
- `/admin/exports/{id}`
- `/admin/analytics/revenue`

Use the same page template from Task 3 so these pages feel native to the shell rather than one-off screens.

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/features/admin/store/adminSlice.test.ts src/features/admin/__tests__/admin-workflow-contract.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/features/admin/api.ts frontend/src/lib/query/keys.ts frontend/src/features/admin/pages/AdminPaymentsPage.tsx frontend/src/features/admin/pages/AdminReportsPage.tsx frontend/src/features/admin/pages/AdminNotificationsPage.tsx frontend/src/features/admin/pages/AdminActivityLogsPage.tsx frontend/src/app/router.tsx frontend/src/components/layout/AdminLayout.tsx
git commit -m "feat: add admin reports and system pages"
```

### Task 7: Refine module-license UX and write the product documentation set

**Files:**
- Modify: `frontend/src/features/admin/pages/AdminModulesPage.tsx`
- Create: `docs/admin/admin-panel-ia-ui-spec.md`
- Create: `docs/admin/oms-admin-workflow-spec.md`
- Create: `docs/admin/license-management-it-user-spec.md`

**Step 1: Write the failing frontend test**

```ts
it('shows a read-only masked license key to admin users', async () => {
  renderWithProviders(<AdminModulesPage />, {
    preloadedState: {
      auth: {
        isAuthenticated: true,
        accessToken: 'admin-token',
        user: { id: 99, name: 'Admin', email: 'admin@example.com', role: 'admin' },
      },
    },
  });

  expect(await screen.findByDisplayValue(/\*{4,}/)).toBeInTheDocument();
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/admin/__tests__/module-license-contract.test.ts`
Expected: FAIL if the page does not surface the setup-required state, masked value handling, or IT User controls consistently after the shell changes.

**Step 3: Implement the UX updates and write the docs**

Update the page to support three states:

- Admin read-only masked state
- IT User full-management state
- setup-required state when backend reports module setup is unavailable

Write the documentation artifacts with exact:

- IA and role model
- OMS screen map and route-to-screen mapping
- Admin vs IT User license permissions and operational flow

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/features/admin/__tests__/module-license-contract.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/features/admin/pages/AdminModulesPage.tsx docs/admin/admin-panel-ia-ui-spec.md docs/admin/oms-admin-workflow-spec.md docs/admin/license-management-it-user-spec.md
git commit -m "docs: add admin ia oms and license specs"
```

### Task 8: Produce the validation report and run full verification

**Files:**
- Create: `docs/admin/admin-workflow-validation-report.md`
- Modify: `docs/CONTRACT_AUDIT_REPORT.md`
- Modify: `QA_AUTOMATION_REPORT.md`

**Step 1: Write the verification checklist into the report**

```md
- Admin dashboard loads and matches the nested backend summary payload
- IT User inherits admin access
- Admin OMS list and detail render correctly
- Admin sees masked module licenses
- IT User can manage module licenses
- Reports, notifications, logs, media, and settings render in the new shell
```

**Step 2: Run the verification commands**

Run: `npm test -- src/features/admin`
Expected: PASS for admin page, store, and contract suites.

Run: `npm run build`
Expected: PASS

Run: `composer test -- --filter=AdminRouteRoleAccessTest`
Expected: PASS

Run: `composer test -- --filter=ModuleLicenseSetupGuardTest`
Expected: PASS

Run: `composer test -- --filter=ModuleLicenseControllerTest`
Expected: PASS

**Step 3: Record actual results**

Document:

- commands run
- pass/fail status
- environment blockers
- any remaining gaps

**Step 4: Commit**

```bash
git add docs/admin/admin-workflow-validation-report.md docs/CONTRACT_AUDIT_REPORT.md QA_AUTOMATION_REPORT.md
git commit -m "docs: add admin workflow validation report"
```
