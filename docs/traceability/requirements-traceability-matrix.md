# Requirement Traceability Matrix (Implementation Scaffold)

| Workflow | Backend module path | Routes file references | Frontend feature path |
|---|---|---|---|
| AUTH_WORKFLOW | `backend/app/Modules/Auth` | `backend/routes/api.php` auth endpoints | `frontend/src/features/auth` |
| PRODUCT_CATALOG_WORKFLOW | `backend/app/Modules/Catalog` | product/category/review routes | `frontend/src/features/catalog` |
| CART_CHECKOUT_WORKFLOW | `backend/app/Modules/CartCheckout` | cart/checkout/address routes | `frontend/src/features/cart`, `frontend/src/features/checkout` |
| PAYMENT_WORKFLOW | `backend/app/Modules/Payment` | payments/webhooks/refunds routes | `frontend/src/features/payment`, `frontend/src/features/checkout` |
| ORDER_MANAGEMENT_WORKFLOW | `backend/app/Modules/OrderManagement` | orders/shipments/returns routes | `frontend/src/features/orders` |
| CMS_WORKFLOW | `backend/app/Modules/CMS` | pages/posts/menus/seo routes | `frontend/src/features/cms` |
| ADMIN_DASHBOARD_WORKFLOW | `backend/app/Modules/Admin` | admin analytics/inventory/settings routes | `frontend/src/features/admin` |
