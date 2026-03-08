# Shopping Cart & Checkout Module — `CART_CHECKOUT_WORKFLOW`

> **Stack:** Laravel 11 · MySQL 8 · File Cache · React 18 + TypeScript · Redux Toolkit · React Query · React-Hook-Form + Zod

---

## 1. Overview

Covers the full pre-payment funnel: guest/user cart management, cart persistence, shipping address handling, shipping rate calculation, coupon/promo application, and order summary before handoff to the Payment Module.

---

## 2. Database Schema

### `carts`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `user_id` | FK → `users` | Nullable (guest) |
| `session_id` | `varchar(100)` | Guest identifier |
| `coupon_id` | FK → `coupons` | Nullable |
| `expires_at` | `timestamp` | 30 days from last activity |
| `timestamps` | | |

### `cart_items`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `cart_id` | FK → `carts` | |
| `product_id` | FK → `products` | |
| `variant_id` | FK → `product_variants` | Nullable |
| `quantity` | `int` | Min: 1 |
| `unit_price` | `decimal(10,2)` | Snapshot at time of add |
| `timestamps` | | |

### `addresses`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `user_id` | FK → `users` | |
| `label` | `varchar(50)` | e.g. `Home`, `Office` |
| `recipient_name` | `varchar(100)` | |
| `phone` | `varchar(20)` | |
| `line1` | `varchar(200)` | |
| `line2` | `varchar(200)` | Nullable |
| `city` | `varchar(100)` | |
| `state` | `varchar(100)` | |
| `postal_code` | `varchar(20)` | |
| `country_code` | `char(2)` | ISO 3166-1 |
| `is_default` | `boolean` | Default: false |
| `timestamps` | | |

### `coupons`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `code` | `varchar(50)` | Unique, uppercase |
| `type` | `enum('percent','fixed','free_shipping')` | |
| `value` | `decimal(10,2)` | % or fixed amount |
| `min_order_amount` | `decimal(10,2)` | Nullable |
| `max_discount_amount` | `decimal(10,2)` | Cap for percent, nullable |
| `usage_limit` | `int` | Nullable = unlimited |
| `used_count` | `int` | Default: 0 |
| `per_user_limit` | `int` | Nullable |
| `starts_at` | `timestamp` | Nullable |
| `expires_at` | `timestamp` | Nullable |
| `is_active` | `boolean` | Default: true |
| `timestamps` | | |

### `coupon_user` (pivot)
| Column | Type |
|---|---|
| `coupon_id` | FK |
| `user_id` | FK |
| `used_count` | int |

### `shipping_zones`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `name` | `varchar(100)` | |
| `countries` | `json` | Array of country codes |
| `timestamps` | | |

### `shipping_methods`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `shipping_zone_id` | FK | |
| `name` | `varchar(100)` | e.g. `Standard`, `Express` |
| `description` | `varchar(255)` | Nullable |
| `price` | `decimal(10,2)` | |
| `min_delivery_days` | `int` | |
| `max_delivery_days` | `int` | |
| `min_order_free` | `decimal(10,2)` | Nullable — free threshold |
| `is_active` | `boolean` | |

---

## 3. Backend — Laravel 11

### 3.1 Routes

```php
// Guest + Authenticated
Route::middleware('cart.session')->group(function () {
    Route::get('/cart',                   [CartController::class, 'show']);
    Route::post('/cart/items',            [CartController::class, 'addItem']);
    Route::put('/cart/items/{id}',        [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{id}',     [CartController::class, 'removeItem']);
    Route::delete('/cart',                [CartController::class, 'clear']);
    Route::post('/cart/coupon',           [CartController::class, 'applyCoupon']);
    Route::delete('/cart/coupon',         [CartController::class, 'removeCoupon']);
    Route::get('/cart/shipping-rates',    [CartController::class, 'shippingRates']);
});

// Authenticated
Route::middleware('auth:api')->group(function () {
    Route::post('/cart/merge',            [CartController::class, 'mergeGuestCart']);
    Route::apiResource('addresses',       AddressController::class);
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault']);
});

// Checkout (Authenticated)
Route::middleware('auth:api')->group(function () {
    Route::post('/checkout/validate',     [CheckoutController::class, 'validate']);
    Route::post('/checkout/summary',      [CheckoutController::class, 'summary']);
});
```

### 3.2 Middleware — `cart.session`

```php
// CartSessionMiddleware
// 1. If authenticated → resolve or create cart by user_id
// 2. If guest → read/set X-Cart-Token header or cookie → resolve by session_id
// 3. Bind resolved Cart model into request → request->cart
```

### 3.3 Controllers

#### `CartController`

```
show()
  → Load cart with items (product, variant, images), coupon
  → Compute: subtotal, discount_amount, shipping_total, tax, grand_total
  → Validate stock (mark items out_of_stock if needed)
  → Return CartResource

addItem(AddCartItemRequest $request)
  → Check product status=active and stock available
  → If item exists → increment quantity (cap at stock)
  → Else → create item with unit_price snapshot
  → Refresh cart totals → Return CartResource

updateItem(UpdateCartItemRequest $request, CartItem $item)
  → Validate quantity >= 1 and <= stock
  → Update → refresh totals

removeItem(CartItem $item)
  → Delete → refresh totals

clear()
  → Delete all cart_items, remove coupon_id

applyCoupon(ApplyCouponRequest $request)
  → Find coupon by code (case-insensitive)
  → Run CouponValidationService:
      - is_active, within date range
      - usage_limit not exceeded
      - per_user_limit not exceeded (if auth)
      - min_order_amount satisfied
  → Attach coupon_id to cart
  → Return updated CartResource

removeCoupon()
  → Set cart.coupon_id = null

shippingRates(Request $request)
  → Require ?country_code= param
  → Find shipping zone matching country
  → Return available ShippingMethodResource[]
  → Apply free shipping if order total >= min_order_free

mergeGuestCart()
  → On login: merge guest cart items into user cart
  → If same product/variant exists → take max quantity
  → Delete guest cart
```

#### `CheckoutController`

```
validate(CheckoutValidateRequest $request)
  → Re-validate all cart items (stock, active status, price)
  → Return: { valid: bool, issues: [] }

summary(CheckoutSummaryRequest $request)
  → Accepts: { address_id, shipping_method_id }
  → Returns full order summary:
    { items[], subtotal, discount, shipping_cost,
      tax_amount, tax_rate, grand_total, estimated_delivery }
  → This response is passed to Payment Module to create the order
```

### 3.4 `CouponValidationService`

```php
class CouponValidationService
{
    public function validate(Coupon $coupon, Cart $cart, ?User $user): ValidationResult
    // Checks:
    // 1. is_active === true
    // 2. starts_at <= now() <= expires_at
    // 3. used_count < usage_limit (if set)
    // 4. Per-user check via coupon_user pivot
    // 5. cart subtotal >= min_order_amount

    public function calculate(Coupon $coupon, float $subtotal): float
    // type=percent  → min(subtotal * value/100, max_discount_amount)
    // type=fixed    → min(value, subtotal)
    // type=free_shipping → 0 discount on cart items (handled in shipping)
}
```

### 3.5 Pricing Calculation (CartTotalsService)

```
subtotal         = SUM(item.unit_price × item.quantity)
discount_amount  = CouponValidationService.calculate(coupon, subtotal)
discounted_total = subtotal - discount_amount
shipping_cost    = selected_method.price
                   (0 if free_shipping coupon OR total >= min_order_free)
tax_rate         = resolved from country/state tax rules (config)
tax_amount       = (discounted_total + shipping_cost) × tax_rate
grand_total      = discounted_total + shipping_cost + tax_amount
```

### 3.6 Form Requests

**`AddCartItemRequest`**
```php
'product_id'  => 'required|exists:products,id',
'variant_id'  => 'nullable|exists:product_variants,id',
'quantity'    => 'required|integer|min:1|max:99',
```

**`CheckoutSummaryRequest`**
```php
'address_id'          => 'required|exists:addresses,id',
'shipping_method_id'  => 'required|exists:shipping_methods,id',
```

### 3.7 Resources

**`CartResource`**
```php
[
  'id',
  'items'          => CartItemResource::collection,
  'coupon'         => CouponResource (nullable),
  'subtotal',
  'discount_amount',
  'shipping_cost'  => null,   // null until address selected
  'tax_amount'     => null,
  'grand_total',
  'item_count',
  'has_out_of_stock_items',
]
```

**`CartItemResource`**
```php
[
  'id', 'quantity', 'unit_price', 'line_total',
  'product'  => ProductResource (compact),
  'variant'  => ProductVariantResource (nullable),
  'is_in_stock',
]
```

---

## 4. Frontend — React 18 + TypeScript

### 4.1 Redux Slice (`cartSlice.ts`)

```ts
interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  subtotal: number;
  discountAmount: number;
  shippingCost: number | null;
  taxAmount: number | null;
  grandTotal: number;
  itemCount: number;
  isLoading: boolean;
  cartToken: string | null;  // guest token persisted in localStorage
}

// Actions
setCart(cart: Cart)
setCartToken(token: string)
clearCart()
setShippingCost(cost: number)
```

### 4.2 React Query Hooks

```ts
useCartQuery()                             // GET /cart
useAddCartItemMutation()                   // POST /cart/items
useUpdateCartItemMutation()                // PUT /cart/items/:id
useRemoveCartItemMutation()                // DELETE /cart/items/:id
useClearCartMutation()                     // DELETE /cart
useApplyCouponMutation()                   // POST /cart/coupon
useRemoveCouponMutation()                  // DELETE /cart/coupon
useShippingRatesQuery(countryCode: string) // GET /cart/shipping-rates?country_code=
useAddresssQuery()                         // GET /addresses
useCreateAddressMutation()
useCheckoutSummaryMutation()               // POST /checkout/summary
```

### 4.3 Pages & Components

| Route | Component | Description |
|---|---|---|
| `/cart` | `CartPage` | Cart item list + order summary sidebar |
| `/checkout` | `CheckoutPage` | Multi-step checkout flow |
| `/checkout/confirmation` | `OrderConfirmationPage` | Post-payment summary |

#### `CartPage`
- **CartItemRow**: thumbnail, name, variant label, quantity stepper, unit price, line total, remove button
- **CartSummaryPanel**: subtotal, coupon line, shipping placeholder, total
- **CouponInput**: input + "Apply" button; shows success/error inline
- Optimistic updates on quantity change

#### `CheckoutPage` (Multi-Step)

```
Step 1: Shipping Address
  → Select saved address OR fill new address form (React-Hook-Form + Zod)
  → Save new address option

Step 2: Shipping Method
  → Fetch shipping rates by selected address country
  → Radio cards: name, description, price, delivery estimate
  → On select → call POST /checkout/summary → update totals

Step 3: Order Review
  → Final summary: items, address, method, totals
  → "Proceed to Payment" → pass summary to PAYMENT_WORKFLOW
```

### 4.4 Zod Schemas

```ts
// addressSchema
z.object({
  label:          z.string().max(50).optional(),
  recipientName:  z.string().min(2).max(100),
  phone:          z.string().min(7).max(20),
  line1:          z.string().min(5).max(200),
  line2:          z.string().max(200).optional(),
  city:           z.string().min(2).max(100),
  state:          z.string().min(2).max(100),
  postalCode:     z.string().min(3).max(20),
  countryCode:    z.string().length(2),
});
```

### 4.5 Guest Cart Persistence

```ts
// On app load
const cartToken = localStorage.getItem('cart_token');
if (cartToken) dispatch(setCartToken(cartToken));

// Axios interceptor adds header to cart requests
headers['X-Cart-Token'] = cartToken;

// On login success → call POST /cart/merge → clear cart_token
```

### 4.6 TypeScript Types

```ts
interface Cart {
  id: number;
  items: CartItem[];
  coupon: Coupon | null;
  subtotal: number;
  discountAmount: number;
  shippingCost: number | null;
  taxAmount: number | null;
  grandTotal: number;
  itemCount: number;
  hasOutOfStockItems: boolean;
}

interface CartItem {
  id: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: ProductCompact;
  variant: ProductVariant | null;
  isInStock: boolean;
}

interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  price: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  isFree: boolean;
}
```

---

## 5. Edge Cases & Rules

| Scenario | Handling |
|---|---|
| Item goes out of stock after add | Marked `is_in_stock: false`; checkout blocked with warning |
| Price changes after add | Unit price snapshot preserved; banner: "Price updated since added" |
| Coupon expires between apply & checkout | Re-validated on `POST /checkout/validate`; removed if invalid |
| Guest merges cart with existing user cart | Duplicate SKUs take higher quantity, not double |
| Cart abandoned 30 days | `CartExpirationJob` (scheduled daily) purges expired carts |

---

## 6. API Response Contracts

### `GET /cart` — `200`
```json
{
  "data": {
    "id": 5,
    "item_count": 3,
    "subtotal": "89.97",
    "discount_amount": "10.00",
    "grand_total": "79.97",
    "coupon": { "code": "SAVE10", "type": "fixed", "value": "10.00" },
    "items": [
      {
        "id": 12,
        "quantity": 2,
        "unit_price": "29.99",
        "line_total": "59.98",
        "product": { "id": 5, "name": "Classic White Tee", "primary_image_url": "..." },
        "variant": { "id": 3, "sku": "CWT-RED-M", "price": null },
        "is_in_stock": true
      }
    ]
  }
}
```
