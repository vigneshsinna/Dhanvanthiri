# Order Management System Module — `ORDER_MANAGEMENT_WORKFLOW`

> **Stack:** Laravel 11 · MySQL 8 · Queued Jobs · React 18 + TypeScript · React Query · Redux Toolkit

---

## 1. Overview

Covers the full post-payment order lifecycle: item fulfilment, shipment tracking, return/refund requests, customer order history, and admin order management with status transitions and notifications.

---

## 2. Database Schema

### `order_items`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `order_id` | FK → `orders` | |
| `product_id` | FK → `products` | |
| `variant_id` | FK → `product_variants` | Nullable |
| `product_name` | `varchar(200)` | Snapshot |
| `variant_label` | `varchar(100)` | Nullable snapshot |
| `sku` | `varchar(100)` | Snapshot |
| `unit_price` | `decimal(10,2)` | Snapshot |
| `quantity` | `int` | |
| `line_total` | `decimal(10,2)` | |
| `product_image_url` | `varchar(255)` | Nullable snapshot |
| `timestamps` | | |

### `shipments`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `order_id` | FK → `orders` | |
| `carrier` | `varchar(100)` | e.g. `FedEx`, `DHL`, `JNE` |
| `tracking_number` | `varchar(100)` | |
| `tracking_url` | `varchar(255)` | Nullable |
| `status` | `enum('pending','in_transit','out_for_delivery','delivered','failed','returned')` | |
| `shipped_at` | `timestamp` | Nullable |
| `estimated_delivery_at` | `timestamp` | Nullable |
| `delivered_at` | `timestamp` | Nullable |
| `timestamps` | | |

### `shipment_events`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `shipment_id` | FK → `shipments` | |
| `status` | `varchar(100)` | |
| `location` | `varchar(200)` | Nullable |
| `description` | `text` | |
| `occurred_at` | `timestamp` | |

### `return_requests`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `order_id` | FK → `orders` | |
| `user_id` | FK → `users` | |
| `reason` | `varchar(255)` | |
| `description` | `text` | Nullable |
| `status` | `enum('pending','approved','rejected','completed')` | Default: `pending` |
| `refund_type` | `enum('original_payment','store_credit','exchange')` | |
| `admin_notes` | `text` | Nullable |
| `resolved_at` | `timestamp` | Nullable |
| `timestamps` | | |

### `return_request_items`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `return_request_id` | FK | |
| `order_item_id` | FK → `order_items` | |
| `quantity` | `int` | |
| `reason` | `varchar(255)` | |
| `condition` | `enum('unopened','like_new','used','damaged')` | |

### `order_status_history`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `order_id` | FK → `orders` | |
| `from_status` | `varchar(50)` | |
| `to_status` | `varchar(50)` | |
| `note` | `varchar(255)` | Nullable |
| `changed_by` | FK → `users` | Admin or system |
| `created_at` | `timestamp` | |

### `invoices`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `order_id` | FK → `orders` | Unique |
| `invoice_number` | `varchar(30)` | Unique |
| `pdf_path` | `varchar(255)` | S3 path |
| `issued_at` | `timestamp` | |

---

## 3. Order Status State Machine

```
pending_payment
    ↓ (payment confirmed)
paid
    ↓ (admin starts processing)
processing
    ↓ (shipment created)
shipped
    ↓ (carrier confirms delivery)
delivered
    ↓ (auto after 7 days OR customer confirms)
completed
    
Any state before shipped:
    → cancelled (customer or admin)

completed / delivered:
    → return_requested (customer)
    → refunded / partially_refunded (after return approved)
```

**Allowed transitions enforced in `OrderStateMachine` service:**
```php
private const TRANSITIONS = [
    'pending_payment' => ['paid', 'cancelled'],
    'paid'            => ['processing', 'cancelled', 'refunded'],
    'processing'      => ['shipped', 'cancelled'],
    'shipped'         => ['delivered'],
    'delivered'       => ['completed', 'refunded'],
    'completed'       => ['refunded', 'partially_refunded'],
];
```

---

## 4. Backend — Laravel 11

### 4.1 Routes

```php
// Customer
Route::middleware('auth:api')->group(function () {
    Route::get('/orders',                      [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}',        [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel',         [OrderController::class, 'cancel']);
    Route::get('/orders/{id}/invoice',         [OrderController::class, 'downloadInvoice']);
    Route::get('/orders/{id}/tracking',        [OrderController::class, 'tracking']);
    Route::post('/orders/{id}/returns',        [ReturnRequestController::class, 'store']);
    Route::get('/orders/{id}/returns',         [ReturnRequestController::class, 'index']);
});

// Admin
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/orders',                      [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}',                 [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status',          [AdminOrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/shipment',       [AdminShipmentController::class, 'store']);
    Route::put('/shipments/{id}',              [AdminShipmentController::class, 'update']);
    Route::post('/shipments/{id}/events',      [AdminShipmentController::class, 'addEvent']);
    Route::get('/returns',                     [AdminReturnController::class, 'index']);
    Route::put('/returns/{id}',                [AdminReturnController::class, 'update']);
});
```

### 4.2 Controllers

#### `OrderController` (Customer)

```
index(Request $request)
  → Filter: status, date_from, date_to
  → Paginate (10/page), include: items (compact), latest shipment status
  → Return OrderResource::collection

show(string $orderNumber)
  → Authorize: order.user_id === auth user
  → Load: items, shipment.events, payment, return_requests, address
  → Return full OrderResource

cancel(Request $request, int $id)
  → Check allowed: status in [pending_payment, paid, processing]
  → Call OrderStateMachine::transition(order, 'cancelled')
  → If paid → dispatch ProcessRefundJob (full refund)
  → Dispatch OrderCancelledNotificationJob

downloadInvoice(int $id)
  → Check invoice exists → if not, dispatch GenerateInvoiceJob and wait (sync)
  → Stream PDF from S3 with Content-Disposition: attachment

tracking(int $id)
  → Return shipment with all shipment_events ordered by occurred_at desc
```

#### `AdminOrderController`

```
index(Request $request)
  → Filters: status, payment_status, search (order_number, email, name)
  → Date range filter
  → Sort: created_at, grand_total
  → Paginate 25/page

updateStatus(UpdateOrderStatusRequest $request, int $id)
  → Validate transition via OrderStateMachine
  → Save to order_status_history
  → Dispatch appropriate notification job
```

#### `AdminShipmentController`

```
store(CreateShipmentRequest $request, int $orderId)
  → Create shipment record
  → Transition order to status=shipped
  → Dispatch ShipmentCreatedNotificationJob (sends tracking email)

addEvent(AddShipmentEventRequest $request, int $shipmentId)
  → Create shipment_event
  → If status=delivered → transition order to delivered
  → Dispatch ShipmentStatusUpdateNotificationJob
```

### 4.3 `OrderStateMachine` Service

```php
class OrderStateMachine
{
    public function transition(Order $order, string $to, ?string $note = null, ?User $actor = null): Order
    {
        if (!$this->canTransition($order->status, $to)) {
            throw new InvalidStatusTransitionException($order->status, $to);
        }

        DB::transaction(function () use ($order, $to, $note, $actor) {
            $from = $order->status;
            $order->update(['status' => $to]);
            OrderStatusHistory::create([
                'order_id'   => $order->id,
                'from_status' => $from,
                'to_status'  => $to,
                'note'       => $note,
                'changed_by' => $actor?->id,
            ]);
        });

        return $order->fresh();
    }

    public function canTransition(string $from, string $to): bool
    {
        return in_array($to, self::TRANSITIONS[$from] ?? []);
    }
}
```

### 4.4 Queued Jobs & Notifications

| Job / Notification | Trigger | Channel |
|---|---|---|
| `OrderConfirmationEmail` | Payment confirmed | Email |
| `OrderShippedEmail` | Shipment created | Email |
| `ShipmentStatusUpdateEmail` | Shipment event added | Email |
| `OrderCancelledEmail` | Order cancelled | Email |
| `RefundProcessedEmail` | Refund completed | Email |
| `ReturnApprovedEmail` | Return approved by admin | Email |
| `AdminNewOrderNotification` | New paid order | Slack/Email |
| `LowStockAlertJob` | Stock <= threshold | Email/Slack |
| `GenerateInvoicePDFJob` | Post-payment | Background |
| `AutoCompleteOrderJob` | Scheduled: 7 days after delivered | Cron |

### 4.5 Scheduled Commands

```php
// app/Console/Kernel.php
$schedule->job(new AutoCompleteOrdersJob)->daily();     // delivered → completed
$schedule->job(new CancelAbandonedOrdersJob)->hourly(); // pending_payment > 1hr → cancelled
$schedule->job(new CartExpirationJob)->daily();         // purge expired carts
```

### 4.6 Resources

**`OrderResource`** (full)
```php
[
  'id', 'order_number', 'status', 'status_label',
  'subtotal', 'discount_amount', 'shipping_cost',
  'tax_amount', 'grand_total', 'currency',
  'items'          => OrderItemResource::collection,
  'shipping_address' => OrderAddressResource,
  'payment'        => PaymentResource (compact),
  'shipment'       => ShipmentResource (nullable),
  'return_requests' => ReturnRequestResource::collection,
  'status_history' => OrderStatusHistoryResource::collection,
  'invoice_url'    => signed S3 URL (nullable),
  'can_cancel'     => computed,
  'can_return'     => computed,
  'created_at',
]
```

---

## 5. Frontend — React 18 + TypeScript

### 5.1 React Query Hooks

```ts
useOrdersQuery(filters: OrderFilters)         // GET /orders
useOrderQuery(orderNumber: string)            // GET /orders/:orderNumber
useCancelOrderMutation()                      // POST /orders/:id/cancel
useOrderTrackingQuery(orderId: number)        // GET /orders/:id/tracking
useCreateReturnMutation()                     // POST /orders/:id/returns
useReturnRequestsQuery(orderId: number)       // GET /orders/:id/returns

// Admin
useAdminOrdersQuery(filters)
useAdminUpdateOrderStatusMutation()
useAdminCreateShipmentMutation()
```

### 5.2 Pages & Components

| Route | Component | Description |
|---|---|---|
| `/account/orders` | `OrderListPage` | Paginated order history |
| `/account/orders/:orderNumber` | `OrderDetailPage` | Full order detail |
| `/account/orders/:id/tracking` | `TrackingPage` | Live shipment timeline |
| `/account/orders/:id/return` | `ReturnRequestPage` | Submit return request |
| `/admin/orders` | `AdminOrderListPage` | Admin order management table |
| `/admin/orders/:id` | `AdminOrderDetailPage` | Status updates, shipment form |

#### `OrderDetailPage`
- Order summary card (number, date, status badge)
- `OrderItemList`: product image, name, variant, qty, price
- `ShippingAddressCard`
- `PaymentSummaryCard`: method, totals breakdown
- `ShipmentTracker` (if shipped)
- `OrderStatusTimeline`: visual step indicator
- Action buttons: Cancel Order (if eligible), Request Return (if eligible), Download Invoice

#### `ShipmentTracker`
- Horizontal/vertical step timeline
- Each `ShipmentEvent`: icon, status label, location, datetime
- Carrier logo + tracking number + external link

#### `ReturnRequestPage`
- Item selector (checkboxes for eligible items)
- Per-item: quantity, reason (dropdown), condition (dropdown)
- Refund type selector (radio)
- Description textarea
- Zod-validated form

### 5.3 TypeScript Types

```ts
interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  payment: PaymentCompact;
  shipment: Shipment | null;
  returnRequests: ReturnRequest[];
  statusHistory: OrderStatusHistory[];
  invoiceUrl: string | null;
  canCancel: boolean;
  canReturn: boolean;
  createdAt: string;
}

type OrderStatus =
  | 'pending_payment' | 'paid' | 'processing'
  | 'shipped' | 'delivered' | 'completed'
  | 'cancelled' | 'refunded' | 'partially_refunded';

interface Shipment {
  id: number;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string | null;
  status: ShipmentStatus;
  shippedAt: string | null;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  events: ShipmentEvent[];
}
```

---

## 6. Return Request Flow

```
Customer:
  POST /orders/{id}/returns
  → { items: [{order_item_id, qty, reason, condition}], refund_type, description }
  ← 201 { return_request_id, status: "pending" }

Admin:
  GET /admin/returns?status=pending
  PUT /admin/returns/{id}
  → { status: "approved", admin_notes: "...", refund_amount: 29.99 }
  ← Updates status → dispatches ReturnApprovedEmail
  → If refund_type = original_payment → dispatches ProcessRefundJob
  → If refund_type = store_credit → adds to user wallet (future module)
```

---

## 7. API Response Contracts

### `GET /orders` — `200`
```json
{
  "data": [
    {
      "id": 42,
      "order_number": "ORD-20250301-0042",
      "status": "shipped",
      "grand_total": "89.97",
      "currency": "USD",
      "item_count": 3,
      "primary_image_url": "...",
      "latest_shipment_status": "in_transit",
      "created_at": "2025-03-01T10:00:00Z"
    }
  ],
  "meta": { "current_page": 1, "total": 12 }
}
```

### `PUT /admin/orders/{id}/status` — `200`
```json
{
  "data": {
    "order_id": 42,
    "from_status": "paid",
    "to_status": "processing",
    "changed_at": "2025-03-01T11:30:00Z"
  }
}
```
