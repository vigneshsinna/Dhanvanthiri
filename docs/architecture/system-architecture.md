# Architecture Notes

- Feature-based modules under `backend/app/Modules`.
- Global API response shape provided by `App\\Modules\\Shared\\Http\\Resources\\ApiResponse`.
- Idempotency middleware applies to payment-intent and refund endpoints.
- Queue + scheduler are configured for Hostinger shared-hosting constraints.
- Frontend SPA routes in `frontend/src/app/router.tsx`; API base path `/api` in `frontend/src/lib/api/client.ts`.
- Public URL topology is `https://example.com/api/*` mapped to Laravel API routes; avoid adding extra `/api` prefixes in app code (`/api/api/*`).
