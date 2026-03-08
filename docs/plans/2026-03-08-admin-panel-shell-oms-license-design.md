# Admin Panel Shell, OMS, and License Management Design

## Goal

Deliver an Active eCommerce-style admin experience across the existing admin surface without a risky platform rewrite.

The redesign must:

- keep current repo-backed modules fully working
- unify the full admin UI under one persistent shell
- preserve existing `/admin/*` routes where possible
- fix the verified OMS and module-license workflow blockers
- produce implementation and verification documentation for OMS and License Management

## Current Verified Problems

### Frontend contract drift

- The admin dashboard page expects flat fields like `total_orders`, `revenue_change`, and `stock_alerts`, but the backend returns nested objects such as `orders.current`, `revenue.growth_percent`, and `products.low_stock`.
- The admin order page expects `order.customer`, but the backend returns `order.user`.

### Backend access and setup failures

- `super_admin` does not inherit `admin` access under the current role middleware, so IT User receives `403` for `/api/admin/*`.
- The live environment can fail module-license reads because the `feature_modules` table is missing, which causes `500` responses instead of a controlled setup state.

### Product experience issues

- The current admin panel feels page-by-page rather than productized.
- OMS is exposed only partially through generic order tables, even though the repo already contains distinct workflows for shipments, tracking, returns, invoices, and status transitions.
- Module license management is functionally split by role in the backend but not clearly expressed in the admin IA.

## Design Principles

1. Preserve route stability. Reuse current routes and feature pages instead of remapping the platform.
2. Rebuild the shell, not the business model. The first step is visual and navigational unification.
3. Show only repo-backed modules. Do not add fake marketplace sections copied from the reference product.
4. Separate business controls from technical controls.
5. Keep Admin and IT User experiences visually consistent but permission-aware.
6. Ship the redesign together with the contract fixes already verified in code and runtime checks.

## Scope

### In scope

- New persistent admin shell
- Role-aware expanded sidebar and top utility bar
- Dashboard redesign
- OMS workspace refinement
- License Management and System controls for IT User
- Reports, notifications, activity logs, and media pages where repo support exists
- Frontend adapters for backend response normalization
- Backend role-access and module-setup hardening
- Documentation for admin IA, OMS, license management, and workflow verification

### Out of scope

- New marketplace-style modules not present in the repo
- Replacing the entire backend analytics model
- Rewriting the admin into a different route architecture
- Adding vendor, seller, affiliate, GST, OTP, auction, or addon-manager features

## Role Model

### Customer

- No admin shell
- Storefront only

### Admin

- Business operations
- Read-only module-license visibility
- Activation request capability for disabled modules
- No technical write controls for licenses, integrations, or admin-user management

### IT User

- `super_admin` displayed in UI as "IT User"
- Full module-license ownership
- Access to technical system pages
- Access to admin-user management

## Information Architecture

## Sidebar groups

- Dashboard
- Commerce
- OMS
- Catalog
- CMS
- Customers
- Reports
- License & System
- Settings

### Final repo-backed entries

#### Dashboard

- Overview

#### Commerce

- Orders
- Payments

#### OMS

- Order Operations
- Shipments
- Returns
- Tracking

Invoices remain an order-level action rather than a standalone sidebar page until a dedicated screen exists.

#### Catalog

- Products
- Categories
- Inventory
- Reviews

#### CMS

- Pages
- Posts
- Banners
- FAQs
- Media Library

#### Customers

- Customers

#### Reports

- Sales Reports
- Export Jobs

#### License & System

- Module Licenses
- System Activity Logs
- Integration Health
- System Notifications
- Admin Users

#### Settings

- Store Settings

### Role visibility

#### Admin

- Dashboard
- Commerce
- OMS
- Catalog
- CMS
- Customers
- Reports
- Settings
- Module Licenses in read-only mode under License & System

#### IT User

- Full Admin surface
- Full License & System group
- Admin Users
- Integration and license controls

## Visual System

### Shell

- Dark expanded sidebar on desktop
- Sidebar collapses only on tablet and mobile
- Light neutral content canvas
- Sticky top utility bar
- Compact platform density rather than storefront spacing

### Navigation behavior

- Nested groups with disclosure
- Active item highlighted with a filled pill or bar
- Icons plus labels for all primary entries
- Remembered open-state for expanded groups

### Page structure

Every admin page shares:

- same sidebar width
- same top bar
- same breadcrumb and title pattern
- same card radius and border rules
- same table styling
- same filter/search bar styling
- same empty and loading state styling
- same action button system

## Dashboard Design

## Admin dashboard

The Admin dashboard prioritizes business operations:

- KPI strip: Revenue, Orders, Customers, Low Stock
- OMS status tiles: Pending, Processing, Shipped, Delivered, Returns Pending
- Recent orders
- Low-stock alerts
- Top products or top categories
- Sales trend when data exists
- Quick action cluster for orders, inventory, returns, and CMS

## IT User dashboard

The IT User dashboard keeps the business row and adds a technical row:

- Enabled Modules
- License Issues
- Failed Integrations
- Unread System Notifications
- Recent Activity Logs
- Module Health Snapshot

## Page Templates

### List pages

- header
- filter row
- primary table or card list
- consistent row actions

### Detail pages

- primary content left
- operational summary right
- context-aware actions

### Settings pages

- left sub-navigation
- form panel on the right

### Analytics and reports

- KPI strip
- trend area
- export status area

## OMS Design

OMS remains a first-class group because the repo already has distinct workflows and contracts for:

- order status transitions
- shipments
- tracking
- returns
- invoices

### OMS screens

#### Order Operations

- searchable order queue
- status chips
- next available transition actions
- links to order detail

#### Shipments

- shipment creation
- carrier and tracking visibility
- shipment event updates

#### Returns

- return review queue
- status update actions
- refund or exchange context

#### Tracking

- operational shipment timeline views
- order-level tracking access

#### Invoices

- order detail action only for now
- surfaced in OMS context through the order detail screen

## License & System Design

### Module Licenses

- Admin sees masked license keys and module state
- Admin can request activation
- IT User can create, update, validate, toggle, and manage credentials

### Integration Health

- exposed through module health and related status summaries
- belongs to License & System, not to Settings

### System Activity Logs

- technical and operational audit trail
- IT User-focused visibility

### System Notifications

- admin-user operational notifications only
- not customer marketing
- business/customer notifications remain elsewhere

### Admin Users

- IT User only
- remains under License & System because it is a technical governance function, not a store setting

## Data Contract Normalization Strategy

The frontend must stop assuming page-specific ad hoc response shapes.

Introduce explicit view-model adapters for:

- dashboard summary
- admin orders
- system notifications
- reports and export jobs

This keeps pages aligned to the real backend while avoiding repeated `data?.data?.data` and field-name drift.

## Backend Hardening Strategy

### Role inheritance

`super_admin` must be treated as an allowed role anywhere `role:admin` is required.

### Module setup resilience

If `feature_modules` is not migrated yet:

- module list returns a controlled setup-required state instead of a `500`
- write and health actions return explicit setup errors instead of crashing

This keeps the admin shell operational while still surfacing the deployment gap.

## Verification Gates

The redesign is not complete until these flows are verified:

- Admin can load the dashboard
- Admin OMS list and detail render correctly
- Admin can see masked module-license data
- Admin can submit activation requests
- IT User can access all admin routes that require `admin`
- IT User can fully manage module licenses
- shipment creation and updates work
- returns review works
- invoice access works from order context
- reports and export job views render
- media library works as a real screen

## Documentation Deliverables

Implementation must produce:

- `docs/admin/admin-panel-ia-ui-spec.md`
- `docs/admin/oms-admin-workflow-spec.md`
- `docs/admin/license-management-it-user-spec.md`
- `docs/admin/admin-workflow-validation-report.md`

## Rollout Sequence

1. Fix backend blockers first.
2. Add frontend adapters and tests.
3. Rebuild the admin shell and navigation.
4. Redesign dashboard and page templates.
5. Expand OMS screens.
6. Refine license and system pages.
7. Write docs and run workflow verification.

## Approval

Approved by the user on 2026-03-08.
