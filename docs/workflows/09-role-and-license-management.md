# Role Model and Module License Management

## Goal

Separate business operations from technical enablement while keeping backend roles unchanged:

- `customer`
- `admin`
- `super_admin` (shown in UI as **IT User**)

## Role Split

### Customer

- Storefront only: auth, profile, address, cart, checkout, order history, returns.
- No access to `/api/admin/*`.

### Admin

- Business operations: products, categories, orders, customers, inventory, CMS, reviews, reports, business settings.
- Read-only visibility for module licenses.
- Can request activation for disabled modules.

### IT User (`super_admin`)

- Full module license ownership:
  - create/update licenses
  - activate/deactivate modules
  - update integration credentials
  - validate license
  - run module health checks
- Super-admin-only admin account management remains available.

## API Contracts

All routes are under `auth:api + role:admin` and prefixed by `/api/admin`.

### Read (Admin + IT User)

- `GET /api/admin/modules`
- `GET /api/admin/modules/{id}`
- `POST /api/admin/modules/{id}/activation-request`

### Write (IT User only via nested `role:super_admin`)

- `POST /api/admin/modules`
- `PUT /api/admin/modules/{id}`
- `PUT /api/admin/modules/{id}/toggle`
- `POST /api/admin/modules/{id}/validate-license`
- `PUT /api/admin/modules/{id}/credentials`
- `GET /api/admin/modules/{id}/health`

## Data Model

Table: `feature_modules`

Core fields include:

- identity: `module_code`, `module_name`, `description`
- license: `license_type`, `license_key`, `valid_from`, `valid_to`
- state: `is_enabled`, `integration_status`, `health_status`, `last_validated_at`
- integration: `config_json`, `vendor_name`, `notes`
- audit: `activated_by`, `activated_on`, `updated_by`, timestamps

## Enforcement Rules

1. **Backend first**: route middleware enforces write operations as `super_admin` only.
2. **UI split**: admin portal shows module availability; IT User portal exposes management actions.
3. **Activity logging**: create/update/toggle/validation/credentials and activation requests are logged.
4. **Feature gating middleware**: `module.enabled:{module_code}` currently applied to:
   - `GET /api/products/recommendations`
   - `/api/wishlist*`

If a module record exists and is disabled, backend returns `403`.

## Frontend Mapping

- `/admin/modules` page added for module visibility/management.
- `super_admin` is displayed as **IT User** in admin shell and store header.
