# Cart and Checkout Workflow

## 1) Feature Scope

This workflow covers pre-payment transaction preparation:

- Guest/auth cart creation and persistence
- Add/update/remove/clear cart items
- Coupon apply/remove
- Shipping rates fetch
- Address CRUD for authenticated users
- Auth checkout validation + summary
- Guest checkout validation + summary
- Stock reservation hold before payment intent

## 2) End-to-End Workflow

1. User adds items from catalog/product pages.
2. Frontend cart hooks call `/api/cart/*` endpoints.
3. Backend `CartSessionMiddleware` resolves cart by user or cart token/session.
4. Cart controller assembles response using cart items, stock, coupon, and totals services.
5. Checkout validation reserves stock with TTL-based holds.
6. Payment intent consumes validated checkout context.

## 3) API Contract (Implemented Routes)

Cart (guest + authenticated, under `cart.session` middleware):

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/{id}`
- `DELETE /api/cart/items/{id}`
- `DELETE /api/cart`
- `POST /api/cart/coupon`
- `DELETE /api/cart/coupon`
- `GET /api/cart/shipping-rates`

Authenticated checkout:

- `POST /api/cart/merge`
- `apiResource /api/addresses`
- `PUT /api/addresses/{id}/default`
- `POST /api/checkout/validate`
- `POST /api/checkout/summary`

Guest checkout:

- `POST /api/guest/checkout/validate`
- `POST /api/guest/checkout/summary`

## 4) Backend File Map

### Controllers

- `backend/app/Modules/CartCheckout/Http/Controllers/CartController.php`
- `backend/app/Modules/CartCheckout/Http/Controllers/AddressController.php`
- `backend/app/Modules/CartCheckout/Http/Controllers/CheckoutController.php`
- `backend/app/Modules/CartCheckout/Http/Controllers/GuestCheckoutController.php`

### Middleware

- `backend/app/Modules/CartCheckout/Http/Middleware/CartSessionMiddleware.php`

### Request validators

- `backend/app/Modules/CartCheckout/Http/Requests/AddCartItemRequest.php`
- `backend/app/Modules/CartCheckout/Http/Requests/UpdateCartItemRequest.php`
- `backend/app/Modules/CartCheckout/Http/Requests/ApplyCouponRequest.php`
- `backend/app/Modules/CartCheckout/Http/Requests/AddressRequest.php`
- `backend/app/Modules/CartCheckout/Http/Requests/CheckoutValidateRequest.php`
- `backend/app/Modules/CartCheckout/Http/Requests/CheckoutSummaryRequest.php`

### Services and jobs

- `backend/app/Modules/CartCheckout/Services/CartTotalsService.php`
- `backend/app/Modules/CartCheckout/Services/CouponValidationService.php`
- `backend/app/Modules/CartCheckout/Services/StockReservationService.php`
- `backend/app/Modules/CartCheckout/Services/CartExpirationJob.php`
- `backend/app/Modules/CartCheckout/Jobs/ReleaseExpiredReservationsJob.php`

### Models

- `backend/app/Modules/CartCheckout/Models/Cart.php`
- `backend/app/Modules/CartCheckout/Models/CartItem.php`
- `backend/app/Modules/CartCheckout/Models/Coupon.php`
- `backend/app/Modules/CartCheckout/Models/Address.php`
- `backend/app/Modules/CartCheckout/Models/ShippingZone.php`
- `backend/app/Modules/CartCheckout/Models/ShippingMethod.php`
- `backend/app/Modules/CartCheckout/Models/StockReservation.php`

### Schema

- `backend/database/migrations/2026_03_03_000003_create_cart_checkout_tables.php`
- `backend/database/migrations/2026_03_07_000010_add_guest_checkout_and_wishlist_tables.php`

## 5) Frontend File Map

### Cart feature

- `frontend/src/features/cart/api.ts`
- `frontend/src/features/cart/store/cartSlice.ts`
- `frontend/src/features/cart/pages/CartPage.tsx`
- `frontend/src/features/cart/schemas/couponSchema.ts`

### Checkout feature

- `frontend/src/features/checkout/api.ts`
- `frontend/src/features/checkout/store/checkoutSlice.ts`
- `frontend/src/features/checkout/pages/CheckoutPage.tsx`
- `frontend/src/features/checkout/schemas/addressSchema.ts`

### Shared request behavior

- `frontend/src/lib/api/client.ts` (adds `X-Cart-Token` for `/cart*` and `/guest*`)

## 6) Data Tables

- `carts`
- `cart_items`
- `coupons`
- `coupon_user`
- `addresses`
- `shipping_zones`
- `shipping_methods`
- `stock_reservations`

## 7) Contract Alignment Notes

- Backend `AddressRequest` validates `line1`/`line2`, but frontend `useCreateAddressMutation` sends `line_1`/`line_2`.
- Checkout and payment payload keys differ by design:
  - Checkout uses `address_id`
  - Payment intent uses `shipping_address_id`

## 8) Tests and Coverage Files

- `frontend/src/features/cart/__tests__/cart-checkout-contract.test.ts`
- `frontend/src/features/checkout/__tests__/checkout-contract.test.ts`
- `frontend/src/features/checkout/__tests__/guest-checkout-contract.test.ts`
- `backend/tests/Unit/CouponValidationServiceTest.php`

## 9) Integration Touchpoints

- Consumes catalog product/variant stock and pricing.
- Feeds payment workflow with validated checkout context.
- Depends on auth workflow for address ownership and persistent customer cart ownership.

## 10) Remaining Checkout Gaps

- Guest checkout APIs are implemented, but frontend route `/checkout` is still wrapped by `PrivateRoute`, so guest users do not have an end-to-end checkout UI yet.
- `ReleaseExpiredReservationsJob` exists but is not scheduled in `backend/app/Console/Kernel.php`.
