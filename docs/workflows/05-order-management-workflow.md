# Order Management Workflow

## 1) Feature Scope

Order Management (OMS) workflow includes:

- Customer order list/detail retrieval
- Customer order cancellation
- Invoice link retrieval
- Shipment tracking read model
- Customer return request creation/list
- Public guest order tracking (`order number + email/phone`)
- Admin order listing/detail/status updates
- Admin shipment creation/event updates
- Admin return review/update
- Customer notification triggers across order lifecycle

## 2) End-to-End Workflow

1. Payment success updates order state and linked records.
2. Customer accesses order history and details from account routes.
3. Guest users can track by order number with email or phone.
4. OMS controllers fetch order graph (items, payments, addresses, shipments, status history).
5. State transitions use `OrderStateMachine` to enforce allowed movement.
6. Admin users operate on orders, shipments, and returns through admin endpoints.
7. Scheduler runs jobs for lifecycle automation (auto-complete/cancel-abandoned).

## 3) API Contract (Implemented Routes)

Authenticated customer:

- `GET /api/orders`
- `GET /api/orders/{orderNumber}`
- `POST /api/orders/{id}/cancel`
- `GET /api/orders/{id}/invoice`
- `GET /api/orders/{id}/tracking`
- `POST /api/orders/{id}/returns`
- `GET /api/orders/{id}/returns`

Public guest tracking:

- `POST /api/orders/track`

Admin (`/api/admin`, auth + role):

- `GET /orders`
- `GET /orders/{id}`
- `PUT /orders/{id}/status`
- `POST /orders/{id}/shipment`
- `PUT /shipments/{id}`
- `POST /shipments/{id}/events`
- `GET /returns`
- `PUT /returns/{id}`

## 4) Backend File Map

### Controllers

- `backend/app/Modules/OrderManagement/Http/Controllers/OrderController.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/GuestOrderController.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/ReturnRequestController.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/AdminOrderController.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/AdminShipmentController.php`
- `backend/app/Modules/OrderManagement/Http/Controllers/AdminReturnController.php`

### Request validators

- `backend/app/Modules/OrderManagement/Http/Requests/UpdateOrderStatusRequest.php`
- `backend/app/Modules/OrderManagement/Http/Requests/CreateShipmentRequest.php`
- `backend/app/Modules/OrderManagement/Http/Requests/AddShipmentEventRequest.php`
- `backend/app/Modules/OrderManagement/Http/Requests/CreateReturnRequest.php`

### Services

- `backend/app/Modules/OrderManagement/Services/OrderStateMachine.php`
- `backend/app/Modules/OrderManagement/Services/OrderNumberService.php`
- `backend/app/Modules/OrderManagement/Services/CustomerNotificationService.php`

### Jobs

- `backend/app/Modules/OrderManagement/Jobs/AutoCompleteOrdersJob.php`
- `backend/app/Modules/OrderManagement/Jobs/CancelAbandonedOrdersJob.php`

### Models

- `backend/app/Modules/OrderManagement/Models/Order.php`
- `backend/app/Modules/OrderManagement/Models/OrderItem.php`
- `backend/app/Modules/OrderManagement/Models/OrderAddress.php`
- `backend/app/Modules/OrderManagement/Models/OrderStatusHistory.php`
- `backend/app/Modules/OrderManagement/Models/Shipment.php`
- `backend/app/Modules/OrderManagement/Models/ShipmentEvent.php`
- `backend/app/Modules/OrderManagement/Models/ReturnRequest.php`
- `backend/app/Modules/OrderManagement/Models/ReturnRequestItem.php`
- `backend/app/Modules/OrderManagement/Models/Invoice.php`
- `backend/app/Modules/OrderManagement/Models/CustomerNotification.php`

### Schema

- `backend/database/migrations/2026_03_03_000005_create_oms_tables.php`
- `backend/database/migrations/2026_03_07_000010_add_guest_checkout_and_wishlist_tables.php`

## 5) Frontend File Map

- `frontend/src/features/orders/api.ts`
- `frontend/src/features/orders/pages/OrderListPage.tsx`
- `frontend/src/features/orders/pages/OrderDetailPage.tsx`
- `frontend/src/features/orders/pages/OrderTrackingPage.tsx`
- `frontend/src/lib/query/keys.ts`

## 6) Data Tables

- `orders`
- `order_items`
- `order_addresses`
- `order_status_history`
- `shipments`
- `shipment_events`
- `return_requests`
- `return_request_items`
- `invoices`
- `customer_notifications`

## 7) Contract Alignment Notes

- Backend route parameters are mixed:
  - `show` uses `{orderNumber}`
  - `cancel/tracking/invoice/returns` use `{id}`
- Frontend `orders/api.ts` follows this split today.

## 8) Customer Notification Coverage

Implemented notification triggers in OMS flow:

- `order_cancelled` on customer cancellation
- `shipment_dispatched` on admin shipment creation
- `delivered` on shipment delivered status update
- `return_received` on return request creation
- `return_approved` / `return_rejected` on admin return decisions

Payment-side events (`payment_success`, `order_confirmed`, `refund_processed`) are triggered from Payment workflow.

## 9) Tests and Coverage Files

- `frontend/src/features/orders/__tests__/oms-contract.test.ts`
- `frontend/src/features/orders/__tests__/guest-tracking-contract.test.ts`
- `backend/tests/Unit/OrderStateMachineTest.php`

## 10) Remaining OMS Gaps

- Public tracking API supports email or phone, but current `OrderTrackingPage` UI only accepts email.
- Notification delivery is currently email-only; SMS/WhatsApp channel execution is not implemented.
