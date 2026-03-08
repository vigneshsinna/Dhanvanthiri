# Auth and User Workflow

## 1) Feature Scope

Implemented authentication and identity lifecycle includes:

- User registration, login, logout, profile fetch (`/auth/me`)
- Access-token refresh flow (cookie-assisted refresh endpoint)
- Forgot/reset password flow
- Email verification endpoint
- Profile management: update profile, upload avatar, change password, delete account
- OAuth redirect/callback endpoints (controller scaffold present)
- Route-level role guard support through shared middleware

## 2) End-to-End Workflow

1. User submits login/register form from React auth pages.
2. Frontend calls auth API hooks in `frontend/src/features/auth/api.ts`.
3. Axios client attaches bearer token when available and retries once on 401 after `POST /auth/refresh`.
4. Laravel auth controllers validate input via FormRequest classes and update auth tables/models.
5. API returns normalized response envelope via `ApiResponse`.
6. Frontend stores access token in Redux auth slice and updates guarded routing behavior.

## 3) API Contract (Implemented Routes)

Prefix: `/api/auth`

- `POST /register`
- `POST /login` (throttled by `auth-login` rate limiter)
- `POST /forgot-password`
- `POST /reset-password`
- `POST /refresh`
- `GET /verify-email/{id}/{hash}`
- `GET /{provider}/redirect`
- `GET /{provider}/callback`
- `POST /logout` (auth required)
- `GET /me` (auth required)

Profile routes (auth required):

- `PUT /api/profile`
- `POST /api/profile/avatar`
- `PUT /api/profile/password`
- `DELETE /api/profile`

## 4) Backend File Map

### Controllers

- `backend/app/Modules/Auth/Http/Controllers/AuthController.php`
- `backend/app/Modules/Auth/Http/Controllers/ProfileController.php`
- `backend/app/Modules/Auth/Http/Controllers/OAuthController.php`

### Request Validators

- `backend/app/Modules/Auth/Http/Requests/RegisterRequest.php`
- `backend/app/Modules/Auth/Http/Requests/LoginRequest.php`
- `backend/app/Modules/Auth/Http/Requests/ForgotPasswordRequest.php`
- `backend/app/Modules/Auth/Http/Requests/ResetPasswordRequest.php`
- `backend/app/Modules/Auth/Http/Requests/UpdateProfileRequest.php`
- `backend/app/Modules/Auth/Http/Requests/ChangePasswordRequest.php`

### Models

- `backend/app/Modules/Auth/Models/User.php`
- `backend/app/Modules/Auth/Models/OAuthProvider.php`
- `backend/app/Modules/Auth/Models/UserRefreshToken.php`

### Shared auth/security infrastructure

- `backend/config/auth.php`
- `backend/config/jwt.php`
- `backend/app/Providers/RouteServiceProvider.php`
- `backend/app/Modules/Shared/Http/Middleware/RoleMiddleware.php`
- `backend/app/Modules/Shared/Http/Middleware/TraceIdMiddleware.php`
- `backend/app/Modules/Shared/Http/Resources/ApiResponse.php`

### Schema

- `backend/database/migrations/2026_03_03_000001_create_auth_tables.php`

## 5) Frontend File Map

### API + state

- `frontend/src/features/auth/api.ts`
- `frontend/src/features/auth/store/authSlice.ts`
- `frontend/src/lib/api/client.ts`
- `frontend/src/lib/query/keys.ts`
- `frontend/src/app/store.ts`

### Pages

- `frontend/src/features/auth/pages/LoginPage.tsx`
- `frontend/src/features/auth/pages/RegisterPage.tsx`
- `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`
- `frontend/src/features/auth/pages/ResetPasswordPage.tsx`
- `frontend/src/features/auth/pages/ProfilePage.tsx`
- `frontend/src/features/auth/pages/SecurityPage.tsx`

### Validation + guards

- `frontend/src/features/auth/schemas/loginSchema.ts`
- `frontend/src/features/auth/schemas/registerSchema.ts`
- `frontend/src/components/guards/index.tsx`

## 6) Data Tables

- `users`
- `password_reset_tokens`
- `oauth_providers`
- `user_refresh_tokens`

## 7) Security and Reliability Notes

- JWT guard is used for protected API routes.
- Refresh endpoint is public but guarded by refresh-token validation logic.
- Login throttling is configured in route service provider.
- Axios interceptor uses single-flight refresh to avoid parallel refresh storms.

## 8) Tests and Coverage Files

- `frontend/src/features/auth/__tests__/auth-contract.test.ts`
- `frontend/src/features/auth/store/authSlice.test.ts`
- `frontend/src/components/guards/guards.test.tsx`

## 9) Integration Touchpoints

- Required by authenticated checkout, payments, orders, wishlist, and admin workflows.
- Guest checkout and guest order tracking are intentionally public and bypass auth.
- Admin workflow depends on `role:admin` / `role:super_admin` route protection.
