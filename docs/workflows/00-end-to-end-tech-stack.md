# End-to-End Tech Stack

## 1) Architecture

- Monorepo structure:
  - `backend/` Laravel 11 API
  - `frontend/` React 18 SPA
- API-first design:
  - SPA calls REST API under `/api/*`
  - JWT access token + refresh flow
- Domain-module organization in backend:
  - Auth, Catalog, CartCheckout, Payment, OrderManagement, CMS, Admin, Shared

## 2) Frontend Stack

- Runtime:
  - React `18.3.x`
  - TypeScript `5.7.x`
  - React Router `6.30.x`
- State and data:
  - Redux Toolkit for app/session state (`frontend/src/app/store.ts`)
  - TanStack React Query for server state/cache (`frontend/src/lib/query/client.ts`)
- Forms and validation:
  - React Hook Form
  - Zod schemas
- HTTP:
  - Axios client with interceptors (`frontend/src/lib/api/client.ts`)
  - `withCredentials: true` enabled
  - Automatic single-flight refresh on 401
  - Cart token header support for `/cart*` and `/guest*`
- UI:
  - Tailwind CSS (`frontend/tailwind.config.js`)
  - Custom page styling (`frontend/src/index.css`, page CSS files)
- Tooling and tests:
  - Vite (`frontend/vite.config.ts`)
  - Vitest + Testing Library (`frontend/vitest.config.ts`)
  - Playwright for E2E (`frontend/playwright.config.ts`)

## 3) Backend Stack

- Runtime:
  - PHP `8.2+`
  - Laravel `11`
- Auth and security:
  - `tymon/jwt-auth` for JWT guard (`backend/config/auth.php`, `backend/config/jwt.php`)
  - Role middleware (`backend/app/Modules/Shared/Http/Middleware/RoleMiddleware.php`)
  - Trace ID middleware for request tracing
  - Idempotency middleware for payment/refund safety
- HTTP contracts:
  - Central route file: `backend/routes/api.php`
  - Standard API envelope: `ApiResponse`
- Commerce reliability:
  - Stock hold model via `stock_reservations`
  - Guest checkout and guest order tracking routes
  - Customer notification persistence (`customer_notifications`)
- External integrations:
  - Razorpay via gateway abstraction (`PaymentGatewayInterface`, `RazorpayGateway`)
- Scheduling and queues:
  - Laravel scheduler in `backend/app/Console/Kernel.php`
  - Queue connection: `database`
  - Hostinger-oriented queue burst configuration in `backend/config/hostinger.php`

## 4) Data and Persistence

- Primary DB: MySQL (configured via `backend/.env`)
- Migrations:
  - `2026_03_03_000001_create_auth_tables.php`
  - `2026_03_03_000002_create_catalog_tables.php`
  - `2026_03_03_000003_create_cart_checkout_tables.php`
  - `2026_03_03_000004_create_payment_tables.php`
  - `2026_03_03_000005_create_oms_tables.php`
  - `2026_03_03_000006_create_cms_tables.php`
  - `2026_03_03_000007_create_admin_tables.php`
  - `2026_03_03_000008_create_operations_tables.php`
  - `2026_03_07_000009_update_legal_pages_content.php`
  - `2026_03_07_000010_add_guest_checkout_and_wishlist_tables.php`
- Seeders:
  - `backend/database/seeders/DatabaseSeeder.php`
  - `backend/database/seeders/ProductSeeder.php`

## 5) API Lifecycle (Request Path)

1. User action in React page/component.
2. Feature API hook in `frontend/src/features/*/api.ts`.
3. Axios request through `frontend/src/lib/api/client.ts`.
4. Laravel API route in `backend/routes/api.php`.
5. Controller -> request validator -> service/model operations.
6. JSON response via `ApiResponse` envelope.
7. React Query cache update + Redux updates where needed.

## 6) Cross-Cutting Platform Files

- Backend bootstrap and middleware aliases:
  - `backend/bootstrap/app.php`
- Service providers:
  - `backend/app/Providers/AppServiceProvider.php`
  - `backend/app/Providers/RouteServiceProvider.php`
- Frontend app entry:
  - `frontend/src/main.tsx`
  - `frontend/src/app/router.tsx`
  - `frontend/src/app/store.ts`

## 7) Test Stack

- Backend:
  - PHPUnit (`backend/phpunit.xml`)
  - Unit and feature tests under `backend/tests/`
- Frontend:
  - Vitest + jsdom + Testing Library
  - Contract tests under `frontend/src/features/**/__tests__/*contract.test.ts`
  - Test setup in `frontend/src/test/setup.ts`
- E2E:
  - Playwright tests under `frontend/e2e`

## 8) Deployment Footprint

- Hostinger deployment support:
  - `deploy/hostinger/README.md`
  - `deploy/hostinger/api.htaccess`
  - `deploy/hostinger/public_html.htaccess`
- Vite dev proxy for local API:
  - `frontend/vite.config.ts` routes `/api` -> `http://127.0.0.1:8000`

## 9) Current Cross-Module Caveats

- Guest checkout APIs are implemented, but the current checkout page route remains auth-guarded (`/checkout` in `frontend/src/app/router.tsx`).
- Stock reservation expiry cleanup job exists but is not scheduled in `backend/app/Console/Kernel.php`.
- `backend/routes/api.php` contains escaped newline text in admin review routes that should be cleaned before release.
