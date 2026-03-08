# E-commerce Workflow Documentation

This folder contains workflow-level documentation for the implemented Dhanvanthiri e-commerce modules.

## Read Order

1. [00-end-to-end-tech-stack.md](./00-end-to-end-tech-stack.md)
2. [01-auth-and-user-workflow.md](./01-auth-and-user-workflow.md)
3. [02-product-catalog-workflow.md](./02-product-catalog-workflow.md)
4. [03-cart-and-checkout-workflow.md](./03-cart-and-checkout-workflow.md)
5. [04-payment-workflow.md](./04-payment-workflow.md)
6. [05-order-management-workflow.md](./05-order-management-workflow.md)
7. [06-cms-content-workflow.md](./06-cms-content-workflow.md)
8. [07-admin-operations-workflow.md](./07-admin-operations-workflow.md)
9. [08-commerce-gaps-and-backlog.md](./08-commerce-gaps-and-backlog.md)
10. [09-role-and-license-management.md](./09-role-and-license-management.md)

## Source of Truth

- Backend routing and contracts: `backend/routes/api.php`
- Frontend route map: `frontend/src/app/router.tsx`
- Database schema: `backend/database/migrations/*.php`
- Seed data and CMS defaults: `backend/database/seeders/ProductSeeder.php`
- Frontend API contracts and tests: `frontend/src/features/**/api.ts`, `frontend/src/features/**/__tests__/*contract.test.ts`

## Scope Note

These docs are based on currently implemented repository code (controllers, services, models, migrations, React pages/hooks, and route contracts).

`08-commerce-gaps-and-backlog.md` tracks what was implemented and what still remains incomplete at integration or UX level.
