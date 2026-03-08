# Payment & Security Module — `PAYMENT_WORKFLOW`

> **Stack:** Laravel 11 · MySQL 8 · Queued Jobs · React 18 + TypeScript · React Query · Redux Toolkit

---

## 1. Overview

Handles secure payment processing, order creation on successful payment, webhook verification, refund management, and payment-specific security hardening. Designed to be gateway-agnostic with a provider driver pattern (Stripe / PayPal / Midtrans supported out of the box).

---

## 2. Supported Payment Gateways

| Gateway | Method | Region |
|---|---|---|
| **Stripe** | Card, Apple Pay, Google Pay | Global |
| **PayPal** | PayPal wallet, Pay Later | Global |
| **Midtrans** | Virtual Account, GoPay, OVO, QRIS | SEA |

---

## 3. Database Schema

### `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `user_id` | FK → `users` | |
| `order_number` | `varchar(30)` | Unique, e.g. `ORD-20250301-0001` |
| `status` | `enum` | See Order Status table |
| `subtotal` | `decimal(10,2)` | |
| `discount_amount` | `decimal(10,2)` | Default: 0 |
| `shipping_cost` | `decimal(10,2)` | |
| `tax_amount` | `decimal(10,2)` | |
| `grand_total` | `decimal(10,2)` | |
| `currency` | `char(3)` | ISO 4217, e.g. `USD` |
| `coupon_code` | `varchar(50)` | Nullable snapshot |
| `notes` | `text` | Nullable |
| `ip_address` | `varchar(45)` | For fraud tracking |
| `timestamps` | | |

### `order_addresses` (snapshot)
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `order_id` | FK → `orders` | |
| `type` | `enum('shipping','billing')` | |
| `recipient_name` | `varchar(100)` | |
| `phone` | `varchar(20)` | |
| `line1` | `varchar(200)` | |
| `line2` | `varchar(200)` | Nullable |
| `city` | `varchar(100)` | |
| `state` | `varchar(100)` | |
| `postal_code` | `varchar(20)` | |
| `country_code` | `char(2)` | |

### `payments`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `order_id` | FK → `orders` | |
| `gateway` | `varchar(30)` | `stripe`, `paypal`, `midtrans` |
| `gateway_transaction_id` | `varchar(200)` | Provider's transaction ID |
| `gateway_payment_intent_id` | `varchar(200)` | Nullable (Stripe PI) |
| `amount` | `decimal(10,2)` | |
| `currency` | `char(3)` | |
| `status` | `enum('pending','paid','failed','refunded','partially_refunded')` | |
| `payment_method_type` | `varchar(50)` | e.g. `card`, `paypal`, `gopay` |
| `payment_method_last4` | `char(4)` | Nullable |
| `gateway_response` | `json` | Full provider response (encrypted at rest) |
| `paid_at` | `timestamp` | Nullable |
| `timestamps` | | |

### `refunds`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `payment_id` | FK → `payments` | |
| `amount` | `decimal(10,2)` | |
| `reason` | `varchar(255)` | |
| `gateway_refund_id` | `varchar(200)` | |
| `status` | `enum('pending','succeeded','failed')` | |
| `processed_by` | FK → `users` | Admin who processed |
| `timestamps` | | |

### `payment_webhooks` (audit log)
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `gateway` | `varchar(30)` | |
| `event_type` | `varchar(100)` | e.g. `payment_intent.succeeded` |
| `payload` | `longtext` | Raw webhook body |
| `signature` | `varchar(300)` | |
| `processed` | `boolean` | Default: false |
| `processed_at` | `timestamp` | Nullable |
| `timestamps` | | |

---

## 4. Backend — Laravel 11

### 4.1 Routes

```php
// Authenticated — Payment intent / order creation
Route::middleware('auth:api')->group(function () {
    Route::post('/payments/intent',         [PaymentController::class, 'createIntent']);
    Route::post('/payments/confirm',        [PaymentController::class, 'confirmPayment']);
    Route::get('/payments/{orderId}',       [PaymentController::class, 'show']);
});

// Webhooks (public, signature-verified)
Route::post('/webhooks/stripe',    [WebhookController::class, 'stripe'])->name('webhook.stripe');
Route::post('/webhooks/paypal',    [WebhookController::class, 'paypal'])->name('webhook.paypal');
Route::post('/webhooks/midtrans',  [WebhookController::class, 'midtrans'])->name('webhook.midtrans');

// Admin
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {
    Route::post('/orders/{id}/refund',     [AdminRefundController::class, 'process']);
    Route::get('/payments',                [AdminPaymentController::class, 'index']);
});
```

### 4.2 Gateway Driver Pattern

```php
// PaymentGatewayInterface
interface PaymentGatewayInterface
{
    public function createIntent(Order $order): IntentResult;
    public function confirmPayment(string $intentId, array $payload): PaymentResult;
    public function refund(Payment $payment, float $amount, string $reason): RefundResult;
    public function verifyWebhook(Request $request): bool;
    public function handleWebhookEvent(array $payload): void;
}

// Drivers: StripeGateway, PayPalGateway, MidtransGateway
// Resolved via: app(PaymentGatewayInterface::class) bound by config('payment.default')
// Or: PaymentGatewayFactory::make('stripe')
```

### 4.3 Controllers

#### `PaymentController`

```
createIntent(CreatePaymentIntentRequest $request)
  Flow:
  1. Load cart → call POST /checkout/summary (internal) to finalise totals
  2. DB Transaction:
     a. Create Order (status=pending_payment)
     b. Snapshot order_address (shipping + billing)
     c. Create order_items from cart items
     d. Decrement product/variant stock (lock for update)
     e. Mark coupon as used (increment used_count)
     f. Create Payment record (status=pending)
  3. Call gateway.createIntent(order)
     → Stripe: Create PaymentIntent → return client_secret
     → PayPal: Create Order → return approve_url
     → Midtrans: Create transaction → return payment token
  4. Return { order_id, client_secret|approve_url|token, gateway }

confirmPayment(ConfirmPaymentRequest $request)
  → Used only for gateways that don't use webhooks as primary confirmation
  → Verify payment status with gateway API
  → Update payment.status, order.status
  → Dispatch PostPaymentJob
```

#### `WebhookController`

```
stripe(Request $request)
  1. Verify Stripe-Signature header using webhook secret
  2. Store raw payload in payment_webhooks
  3. Dispatch ProcessStripeWebhookJob (async)
  4. Return 200 immediately

paypal / midtrans follow same pattern
```

### 4.4 Queued Jobs

#### `ProcessStripeWebhookJob`

```
Event: payment_intent.succeeded
  → Find Payment by gateway_payment_intent_id
  → Update payment.status = paid, paid_at = now()
  → Update order.status = paid
  → Dispatch PostPaymentJob

Event: payment_intent.payment_failed
  → Update payment.status = failed
  → Update order.status = payment_failed
  → Dispatch OrderPaymentFailedNotificationJob
  → Release reserved stock
```

#### `PostPaymentJob`

```
1. Clear user's cart
2. Send OrderConfirmationEmail (queued)
3. Send AdminNewOrderNotification
4. Trigger inventory low-stock check
5. Generate invoice PDF (async, stored on S3)
```

#### `ProcessRefundJob`

```
1. Call gateway.refund(payment, amount, reason)
2. Create Refund record
3. If full refund → payment.status = refunded, order.status = refunded
4. If partial  → payment.status = partially_refunded
5. Send RefundConfirmationEmail
```

### 4.5 Form Requests

**`CreatePaymentIntentRequest`**
```php
'gateway'             => 'required|in:stripe,paypal,midtrans',
'shipping_address_id' => 'required|exists:addresses,id',
'shipping_method_id'  => 'required|exists:shipping_methods,id',
'billing_same_as_shipping' => 'boolean',
'billing_address_id'  => 'required_if:billing_same_as_shipping,false|exists:addresses,id',
'notes'               => 'nullable|string|max:500',
```

### 4.6 Order Number Generation

```php
// Service: OrderNumberService
// Format: ORD-YYYYMMDD-XXXX (zero-padded daily sequence)
// Uses DB advisory lock to prevent race conditions
// Example: ORD-20250301-0042
```

### 4.7 Order Status Enum

| Status | Description |
|---|---|
| `pending_payment` | Order created, awaiting payment |
| `paid` | Payment confirmed |
| `payment_failed` | Payment attempt failed |
| `processing` | Preparing for fulfilment |
| `shipped` | Tracking number assigned |
| `delivered` | Carrier confirmed delivery |
| `completed` | Customer confirmed / auto after 7 days |
| `cancelled` | Cancelled before shipment |
| `refunded` | Full refund issued |
| `partially_refunded` | Partial refund |

---

## 5. Frontend — React 18 + TypeScript

### 5.1 React Query Hooks

```ts
useCreatePaymentIntentMutation()    // POST /payments/intent
useConfirmPaymentMutation()         // POST /payments/confirm
usePaymentQuery(orderId: number)    // GET /payments/:orderId
```

### 5.2 Redux Slice (`checkoutSlice.ts`)

```ts
interface CheckoutState {
  step: 'address' | 'shipping' | 'review' | 'payment' | 'confirmation';
  shippingAddressId: number | null;
  billingAddressId: number | null;
  billingSameAsShipping: boolean;
  shippingMethodId: number | null;
  gateway: 'stripe' | 'paypal' | 'midtrans' | null;
  orderId: number | null;
  clientSecret: string | null;   // Stripe
  approveUrl: string | null;     // PayPal
  paymentToken: string | null;   // Midtrans
  isProcessing: boolean;
  error: string | null;
}
```

### 5.3 Pages & Components

#### `PaymentPage`

- **GatewaySelector**: Radio cards (Stripe / PayPal / Midtrans)
- **StripePaymentForm**: Uses `@stripe/react-stripe-js`
  - `<CardElement>` or `<PaymentElement>` (Stripe hosted)
  - Calls `stripe.confirmCardPayment(clientSecret)`
- **PayPalButton**: `@paypal/react-paypal-js` — `<PayPalButtons>` component, redirects to approveUrl
- **MidtransSnap**: Calls `window.snap.pay(token)` (Midtrans Snap.js)
- **OrderSummaryPanel**: Right-side locked summary (items, totals)

#### `OrderConfirmationPage`

- Order number, status badge, items summary
- Estimated delivery range
- "Continue Shopping" + "View Orders" CTA
- Triggers confetti animation on mount 🎉

### 5.4 Stripe Integration Flow

```
1. User selects Stripe → clicks "Place Order"
2. POST /payments/intent → { client_secret, order_id }
3. stripe.confirmCardPayment(client_secret, { payment_method: { card: cardElement } })
4. On success → navigate /checkout/confirmation?order_id=X
5. On failure → display Stripe error message inline
```

### 5.5 TypeScript Types

```ts
interface CreateIntentResponse {
  orderId: number;
  gateway: 'stripe' | 'paypal' | 'midtrans';
  clientSecret?: string;      // Stripe
  approveUrl?: string;        // PayPal
  paymentToken?: string;      // Midtrans
}

interface Payment {
  id: number;
  orderId: number;
  gateway: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodType: string;
  paymentMethodLast4: string | null;
  paidAt: string | null;
}

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
```

---

## 6. Security Hardening

| Threat | Mitigation |
|---|---|
| Webhook spoofing | Verify `Stripe-Signature` / `PayPal-Transmission-Sig` / Midtrans hash before processing |
| Double charge | Idempotency keys sent with all gateway API calls; webhook deduplication via `payment_webhooks.processed` |
| Price tampering | Server always recalculates totals from DB; client-provided amounts are NEVER trusted |
| Race condition on stock | `SELECT ... FOR UPDATE` inside DB transaction on stock decrement |
| Sensitive data exposure | `gateway_response` column encrypted with `ENCRYPT_KEY` using AES-256-CBC |
| PCI compliance | Card data never touches Laravel server — handled by Stripe Elements / PayPal SDK |
| CSRF on webhooks | Excluded from CSRF middleware; protected by signature verification instead |

---

## 7. API Response Contracts

### `POST /payments/intent` — `201`
```json
{
  "data": {
    "order_id": 42,
    "order_number": "ORD-20250301-0042",
    "gateway": "stripe",
    "client_secret": "pi_3abc_secret_xyz",
    "amount": "89.97",
    "currency": "USD"
  }
}
```

### `POST /payments/intent` — `422` (stock issue)
```json
{
  "message": "Some items are no longer available.",
  "errors": {
    "stock": [
      { "product_id": 5, "variant_id": 3, "available": 1, "requested": 2 }
    ]
  }
}
```

---

## 8. Refund Flow

```
Admin → POST /admin/orders/{id}/refund
      { amount, reason }
Backend:
  1. Validate: amount <= payment.amount - already_refunded
  2. Dispatch ProcessRefundJob
  3. Return { refund_id, status: "pending" }

Job completes:
  → Update refund.status = succeeded
  → Update payment.status
  → Email customer
```
