# E-commerce Gaps and Backlog

This document reflects the current status after implementing the previously identified baseline commerce gaps.

## 1) Status Matrix

| Capability | Status | Notes |
|---|---|---|
| Guest checkout API | Implemented | `/api/guest/checkout/*` + `/api/guest/payments/*` routes, controllers, tests |
| Guest order tracking | Implemented | `POST /api/orders/track` + `/track-order` frontend page |
| Customer notifications | Partially implemented | Email channel with DB logging implemented; SMS/WhatsApp sender not implemented |
| Stock reservation / oversell guard | Implemented with caveat | Reservation model/service implemented; expiry release job not yet scheduled |
| Wishlist / save-for-later | Implemented | Auth routes + wishlist page + contract tests |
| Recommendations API | Implemented | `GET /api/products/recommendations` added and tested |
| Recently viewed | Partially implemented | localStorage tracking implemented; no storefront section yet |

## 2) What Was Implemented

### Guest checkout

- Added guest checkout routes and controllers:
  - `POST /api/guest/checkout/validate`
  - `POST /api/guest/checkout/summary`
  - `POST /api/guest/payments/intent`
  - `POST /api/guest/payments/confirm`
- Added guest fields on orders and nullable `user_id`.
- Added frontend guest checkout API hooks.

Key files:

- `backend/app/Modules/CartCheckout/Http/Controllers/GuestCheckoutController.php`
- `backend/app/Modules/Payment/Http/Controllers/GuestPaymentController.php`
- `backend/database/migrations/2026_03_07_000010_add_guest_checkout_and_wishlist_tables.php`
- `frontend/src/features/checkout/api.ts`

### Guest order tracking

- Added public endpoint `POST /api/orders/track` with throttling.
- Added `OrderTrackingPage` route at `/track-order`.

Key files:

- `backend/app/Modules/OrderManagement/Http/Controllers/GuestOrderController.php`
- `backend/routes/api.php`
- `frontend/src/features/orders/pages/OrderTrackingPage.tsx`

### Customer notifications

- Added `CustomerNotificationService` and `customer_notifications` table.
- Added lifecycle event notifications across payment/order/shipping/return flows.

Key files:

- `backend/app/Modules/OrderManagement/Services/CustomerNotificationService.php`
- `backend/app/Modules/OrderManagement/Models/CustomerNotification.php`
- `backend/app/Modules/Payment/Services/PaymentService.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/OrderController.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/AdminShipmentController.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/ReturnRequestController.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/AdminReturnController.php`

### Stock reservation and oversell protection

- Added `stock_reservations` table and model.
- Added reservation service with hold/confirm/release operations.
- Wired holds into checkout validation and order creation flow.

Key files:

- `backend/app/Modules/CartCheckout/Models/StockReservation.php`
- `backend/app/Modules/CartCheckout/Services/StockReservationService.php`
- `backend/app/Modules/CartCheckout/Jobs/ReleaseExpiredReservationsJob.php`
- `backend/app/Modules/Payment/Services/PaymentService.php`

### Wishlist and save-for-later

- Added wishlists and wishlist_items data model.
- Added auth-protected wishlist routes and frontend wishlist page.

Key files:

- `backend/app/Modules/Catalog/Http/Controllers/WishlistController.php`
- `backend/app/Modules/Catalog/Models/Wishlist.php`
- `backend/app/Modules/Catalog/Models/WishlistItem.php`
- `frontend/src/features/wishlist/api.ts`
- `frontend/src/features/wishlist/pages/WishlistPage.tsx`

### Recommendations and recently viewed

- Added recommendations endpoint and frontend query hook.
- Added recently viewed localStorage helper and product-detail tracking call.

Key files:

- `backend/app/Modules/Catalog/Http/Controllers/RecommendationController.php`
- `frontend/src/features/catalog/api.ts`
- `frontend/src/features/catalog/recentlyViewed.ts`
- `frontend/src/features/catalog/pages/ProductDetailPage.tsx`

## 3) Remaining Missing / Incomplete Items

1. Guest checkout UI is still blocked by auth guard.
   - `/checkout` route is wrapped by `PrivateRoute`, so guest APIs are not yet exposed in full user flow.
2. Order tracking UI only supports email input.
   - API supports `email` or `phone`, but `OrderTrackingPage` currently captures email only.
3. Stock reservation expiry cleanup is not scheduled.
   - `ReleaseExpiredReservationsJob` exists but is not wired in `backend/app/Console/Kernel.php`.
4. Notification channel coverage is incomplete.
   - Schema supports email/SMS/WhatsApp, but implementation currently sends email only.
5. Route file quality issue in admin review routes.
   - `backend/routes/api.php` contains escaped newline text in review route block and should be normalized.
6. Recommendation/recently-viewed UX is partial.
   - Recommendation API exists, but product detail still shows static related products and no dedicated recently-viewed section.

## 4) Validation Evidence

Contract tests exist for newly implemented gaps:

- `frontend/src/features/checkout/__tests__/guest-checkout-contract.test.ts`
- `frontend/src/features/orders/__tests__/guest-tracking-contract.test.ts`
- `frontend/src/features/wishlist/__tests__/wishlist-contract.test.ts`
- `frontend/src/features/catalog/__tests__/recommendations-contract.test.ts`
- `frontend/src/features/admin/__tests__/cms-admin-contract.test.ts`
- `frontend/src/features/admin/__tests__/review-moderation-contract.test.ts`

## 5) Recommended Next Backlog Order

1. Expose guest checkout in UI (or intentionally enforce login checkout and remove guest flow hooks from UI scope).
2. Schedule expired reservation cleanup job in kernel.
3. Clean admin review route block in `backend/routes/api.php`.
4. Add phone option to public order tracking form.
5. Add storefront widgets for recommendations/recently viewed.
6. Add actual SMS/WhatsApp sender integrations or explicitly scope notifications to email-only.
