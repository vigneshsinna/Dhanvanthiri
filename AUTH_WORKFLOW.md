# Authentication & User Module — `AUTH_WORKFLOW`

> **Stack:** Laravel 11 · JWT (`tymon/jwt-auth`) · React 18 + TypeScript · Redux Toolkit · React Query · React-Hook-Form + Zod

---

## 1. Overview

Handles full identity lifecycle: registration, login, token management, profile editing, password reset, email verification, social OAuth, and role-based access control (RBAC).

---

## 2. User Roles & Permissions

| Role | Description |
|---|---|
| `guest` | Unauthenticated visitor |
| `customer` | Registered shopper |
| `admin` | Full back-office access |
| `super_admin` | Manages admins and system config |

---

## 3. Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint unsigned` PK | Auto-increment |
| `name` | `varchar(100)` | |
| `email` | `varchar(150)` | Unique |
| `password` | `varchar(255)` | Bcrypt |
| `role` | `enum('customer','admin','super_admin')` | Default: `customer` |
| `avatar` | `varchar(255)` | Nullable, S3 path |
| `phone` | `varchar(20)` | Nullable |
| `is_active` | `boolean` | Default: `true` |
| `email_verified_at` | `timestamp` | Nullable |
| `created_at` / `updated_at` | `timestamp` | |

### `password_reset_tokens`
| Column | Type |
|---|---|
| `email` | `varchar` PK |
| `token` | `varchar` |
| `created_at` | `timestamp` |

### `oauth_providers`
| Column | Type | Notes |
|---|---|---|
| `id` | `bigint` PK | |
| `user_id` | FK → `users` | |
| `provider` | `varchar(30)` | e.g. `google`, `facebook` |
| `provider_id` | `varchar(100)` | |
| `created_at` | `timestamp` | |

---

## 4. Backend — Laravel 11

### 4.1 Routes (`routes/api.php`)

```php
// Public
Route::post('/auth/register',        [AuthController::class, 'register']);
Route::post('/auth/login',           [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);
Route::get('/auth/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail']);
Route::get('/auth/{provider}/redirect',  [OAuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback',  [OAuthController::class, 'callback']);

// Authenticated
Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout',          [AuthController::class, 'logout']);
    Route::post('/auth/refresh',         [AuthController::class, 'refresh']);
    Route::get('/auth/me',               [AuthController::class, 'me']);
    Route::put('/profile',               [ProfileController::class, 'update']);
    Route::post('/profile/avatar',       [ProfileController::class, 'uploadAvatar']);
    Route::put('/profile/password',      [ProfileController::class, 'changePassword']);
    Route::delete('/profile',            [ProfileController::class, 'deleteAccount']);
});
```

### 4.2 Controllers

#### `AuthController`

```
register(RegisterRequest $request)
  → Validate → Hash password → Create user → Send verification email (Queued Job)
  → Return JWT tokens (access + refresh)

login(LoginRequest $request)
  → Validate credentials → Check is_active → Attempt JWT auth
  → Return { access_token, refresh_token, expires_in, user }

logout()
  → Invalidate current token

refresh()
  → Rotate JWT access token using refresh token

me()
  → Return authenticated user resource

forgotPassword(ForgotPasswordRequest $request)
  → Generate signed URL → Queue SendPasswordResetEmail job

resetPassword(ResetPasswordRequest $request)
  → Validate token TTL (60 min) → Update password → Invalidate all tokens
```

#### `ProfileController`

```
update(UpdateProfileRequest $request)
  → Validate → Update name, phone, email (re-verify if changed)

uploadAvatar(Request $request)
  → Validate image (max 2MB, jpg/png/webp) → Store on S3 → Update avatar path

changePassword(ChangePasswordRequest $request)
  → Verify current password → Hash new → Update → Invalidate other tokens

deleteAccount()
  → Soft delete or anonymise → Dispatch AccountDeletionJob
```

### 4.3 Form Requests

**`RegisterRequest`**
```php
'name'     => 'required|string|max:100',
'email'    => 'required|email|unique:users',
'password' => 'required|min:8|confirmed|regex:/[A-Z]/|regex:/[0-9]/',
```

**`LoginRequest`**
```php
'email'    => 'required|email',
'password' => 'required|string',
```

**`ResetPasswordRequest`**
```php
'token'    => 'required',
'email'    => 'required|email',
'password' => 'required|min:8|confirmed',
```

### 4.4 JWT Configuration

```php
// config/jwt.php key settings
'ttl'           => 60,         // access token: 60 minutes
'refresh_ttl'   => 20160,      // refresh token: 14 days
'algo'          => 'HS256',
'blacklist_enabled' => true,
```

Middleware: `auth:api` (JWTMiddleware) applied globally to protected routes.

### 4.5 Queued Jobs

| Job | Queue | Description |
|---|---|---|
| `SendEmailVerificationJob` | `notifications` | Sends signed verification link |
| `SendPasswordResetJob` | `notifications` | Sends reset link |
| `AccountDeletionJob` | `default` | Anonymises PII data |

### 4.6 Resources

**`UserResource`**
```php
[
    'id', 'name', 'email', 'role', 'avatar_url',
    'phone', 'is_active', 'email_verified_at', 'created_at'
]
```

---

## 5. Frontend — React 18 + TypeScript

### 5.1 Redux Slice (`authSlice.ts`)

```ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Actions
setCredentials({ user, accessToken })
clearCredentials()
setUser(user)
```

Token stored in **memory only** (Redux state). Refresh token stored in **`HttpOnly` cookie** (set by backend).

### 5.2 React Query Hooks

```ts
// Mutations
useLoginMutation()        // POST /auth/login
useRegisterMutation()     // POST /auth/register
useLogoutMutation()       // POST /auth/logout
useForgotPasswordMutation()
useResetPasswordMutation()

// Queries
useMeQuery()              // GET /auth/me  — enabled only when authenticated
```

### 5.3 Zod Schemas

```ts
// registerSchema
z.object({
  name:             z.string().min(2).max(100),
  email:            z.string().email(),
  password:         z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword:  z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// loginSchema
z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// resetPasswordSchema
z.object({
  password:        z.string().min(8),
  confirmPassword: z.string(),
}).refine(...);
```

### 5.4 Pages & Components

| Route | Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Email/password form + OAuth buttons |
| `/register` | `RegisterPage` | Registration form |
| `/forgot-password` | `ForgotPasswordPage` | Email input |
| `/reset-password` | `ResetPasswordPage` | Token + new password |
| `/verify-email` | `VerifyEmailPage` | Resend verification link |
| `/profile` | `ProfilePage` | View/edit profile, avatar upload |
| `/profile/security` | `SecurityPage` | Change password, active sessions |

### 5.5 Route Guards

```tsx
// PrivateRoute — redirects to /login if not authenticated
// PublicOnlyRoute — redirects to / if already authenticated
// RoleRoute — accepts `allowedRoles: Role[]` prop
```

### 5.6 Axios Interceptor (Token Refresh)

```
Request interceptor  → Attach Authorization: Bearer <accessToken>
Response interceptor → On 401:
  1. Call POST /auth/refresh (uses HttpOnly cookie)
  2. Update Redux store with new access token
  3. Retry original request
  4. On refresh failure → dispatch clearCredentials() → redirect /login
```

---

## 6. Security Considerations

| Concern | Mitigation |
|---|---|
| Brute-force login | Laravel `RateLimiter` — 5 attempts / minute per IP |
| Token theft | Short-lived access tokens (60 min) + HttpOnly refresh cookie |
| CSRF | SameSite=Strict cookie; API-only (no web session) |
| Password reset | Signed URLs expire in 60 min; token invalidated after single use |
| SQL injection | Eloquent ORM parameterised queries |
| XSS | React DOM escaping; CSP headers |
| Mass assignment | `$fillable` defined on all models |

---

## 7. API Response Contracts

### `POST /auth/login` — Success `200`
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "avatar_url": "https://cdn.example.com/avatars/1.jpg",
    "email_verified_at": "2025-01-01T00:00:00Z"
  }
}
```

### `POST /auth/login` — Error `422`
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["These credentials do not match our records."]
  }
}
```

---

## 8. Flow Diagrams

### Registration Flow
```
Client → POST /auth/register
       ← 201 { access_token, user }
       → [background] SendEmailVerificationJob dispatched
Client opens email → clicks verify link
       → GET /auth/verify-email/{id}/{hash}
       ← 200 { message: "Email verified" }
```

### JWT Refresh Flow
```
Client request → 401 Unauthorized
Interceptor → POST /auth/refresh (HttpOnly cookie sent automatically)
            ← 200 { access_token }
Retry original request with new token
```
