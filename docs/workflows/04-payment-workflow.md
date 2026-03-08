# Payment Workflow

## 1) Feature Scope

Payment workflow handles:

- Auth and guest payment intent creation from checkout context
- Payment confirmation (gateway signature payload)
- Payment status fetch per order
- Razorpay webhook ingestion and async processing
- Admin-triggered refunds with idempotent safety
- Payment recovery/background dispatch jobs
- Payment-linked customer notifications (email channel)

## 2) End-to-End Workflow

1. Checkout calls payment intent endpoint (`/payments/intent` or `/guest/payments/intent`).
2. Backend `PaymentService` creates order/payment records and reserves stock.
3. Frontend completes payment via gateway SDK and posts signature payload to confirm endpoint.
4. Backend verifies and updates payment/order status.
5. On success, reservations are confirmed, inventory is decremented, cart items are cleared.
6. Webhooks from Razorpay hit `/api/webhooks/razorpay`; event is stored and processed asynchronously.
7. Admin refund endpoint records refund intent and updates payment/order states.

## 3) API Contract (Implemented Routes)

Authenticated customer:

- `POST /api/payments/intent` (idempotency middleware)
- `POST /api/payments/confirm`
- `GET /api/payments/{orderId}`

Guest:

- `POST /api/guest/payments/intent` (idempotency middleware)
- `POST /api/guest/payments/confirm`

Public webhook:

- `POST /api/webhooks/razorpay`

Admin (`/api/admin`, auth + role):

- `GET /payments`
- `POST /orders/{id}/refund` (idempotency middleware)

## 4) Backend File Map

### Controllers

- `backend/app/Modules/Payment/Http/Controllers/PaymentController.php`
- `backend/app/Modules/Payment/Http/Controllers/GuestPaymentController.php`
- `backend/app/Modules/Payment/Http/Controllers/WebhookController.php`
- `backend/app/Modules/Payment/Http/Controllers/AdminPaymentController.php`
- `backend/app/Modules/Payment/Http/Controllers/AdminRefundController.php`

### Services

- `backend/app/Modules/Payment/Services/PaymentService.php`
- `backend/app/Modules/Payment/Services/WebhookService.php`
- `backend/app/Modules/Payment/Services/RefundService.php`

### Gateway abstraction

- `backend/app/Modules/Payment/Contracts/PaymentGatewayInterface.php`
- `backend/app/Modules/Payment/Gateways/RazorpayGateway.php`

### Request validators

- `backend/app/Modules/Payment/Http/Requests/CreatePaymentIntentRequest.php`
- `backend/app/Modules/Payment/Http/Requests/ConfirmPaymentRequest.php`
- `backend/app/Modules/Payment/Http/Requests/RefundRequest.php`

### Jobs

- `backend/app/Modules/Payment/Jobs/PostPaymentJob.php`
- `backend/app/Modules/Payment/Jobs/ProcessRazorpayWebhookJob.php`
- `backend/app/Modules/Payment/Jobs/ProcessRefundJob.php`
- `backend/app/Modules/Payment/Jobs/PaymentRecoveryDispatchJob.php`

### Models

- `backend/app/Modules/Payment/Models/Payment.php`
- `backend/app/Modules/Payment/Models/Refund.php`
- `backend/app/Modules/Payment/Models/PaymentWebhook.php`

### Cross-cutting infra

- `backend/app/Modules/Shared/Http/Middleware/IdempotencyMiddleware.php`
- `backend/app/Modules/Shared/Models/IdempotencyKey.php`
- `backend/config/payment.php`
- `backend/config/hostinger.php`

### Schema

- `backend/database/migrations/2026_03_03_000004_create_payment_tables.php`
- `backend/database/migrations/2026_03_03_000008_create_operations_tables.php`
- `backend/database/migrations/2026_03_07_000010_add_guest_checkout_and_wishlist_tables.php`

## 5) Frontend File Map

- `frontend/src/features/checkout/api.ts`
- `frontend/src/features/checkout/pages/CheckoutPage.tsx`
- `frontend/src/features/payment/pages/OrderConfirmationPage.tsx`
- `frontend/src/lib/api/client.ts`

## 6) Data Tables

- `payments`
- `refunds`
- `payment_webhooks`
- `idempotency_keys`
- Queue tables:
  - `jobs`
  - `job_batches`
  - `failed_jobs`

## 7) Reliability and Security Controls

- Idempotency is enforced for payment intent and admin refund routes.
- Payment confirmation verifies gateway signature before status transition.
- Reservation confirmation and stock decrement happen inside transaction logic.
- Trace ID middleware helps request correlation.
- Queue-based webhook processing protects API latency.

## 8) Customer Notification Status

- Payment success path sends `payment_success` and `order_confirmed` via `CustomerNotificationService`.
- Notification records are persisted in `customer_notifications`.
- Current delivery channel is email.

## 9) Tests and Coverage Files

- `frontend/src/features/checkout/__tests__/payment-contract.test.ts`
- `frontend/src/features/checkout/__tests__/guest-checkout-contract.test.ts`
- `backend/tests/Feature/PaymentWebhookReplayTest.php`

## 10) Remaining Payment Gaps

- `PostPaymentJob` and `ProcessRefundJob` exist, but there is no confirmed dispatch path from payment/refund services in current code.
- Refund flow updates refund record to `pending`; a complete gateway callback -> refund finalization path is not yet explicit in docs/code.
- Multi-channel customer notifications (SMS/WhatsApp) are modeled in schema but not implemented as senders.
