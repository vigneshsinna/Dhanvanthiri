<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Models\UserRefreshToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use App\Modules\Auth\Http\Requests\RegisterRequest;
use App\Modules\Auth\Http\Requests\LoginRequest;
use App\Modules\Auth\Http\Requests\ForgotPasswordRequest;
use App\Modules\Auth\Http\Requests\ResetPasswordRequest;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'customer',
            'is_active' => true,
        ]);

        $token = JWTAuth::fromUser($user);

        return ApiResponse::success([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl', 60) * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 'Registered', 201);
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return ApiResponse::error('Invalid credentials', 'AUTH_FAILED', [], 401);
        }

        if (!$user->is_active) {
            return ApiResponse::error('Account is deactivated', 'ACCOUNT_INACTIVE', [], 403);
        }

        $token = JWTAuth::fromUser($user);

        return ApiResponse::success([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl', 60) * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ],
        ], 'Logged in');
    }

    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (\Exception $e) {
            // Token already invalid
        }

        return ApiResponse::success([], 'Logged out');
    }

    public function refresh(Request $request)
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            return ApiResponse::success([
                'access_token' => $newToken,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl', 60) * 60,
            ], 'Refreshed');
        } catch (\Exception $e) {
            return ApiResponse::error('Token refresh failed', 'REFRESH_FAILED', [], 401);
        }
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return ApiResponse::success([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return ApiResponse::success([], 'Reset link sent if email exists');
        }

        // Don't reveal whether the email exists
        return ApiResponse::success([], 'Reset link sent if email exists');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return ApiResponse::success([], 'Password reset successfully');
        }

        return ApiResponse::error('Password reset failed', 'RESET_FAILED', ['token' => 'Invalid or expired token'], 422);
    }

    public function verifyEmail(int $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->email), $hash)) {
            return ApiResponse::error('Invalid verification link', 'INVALID_HASH', [], 403);
        }

        if ($user->email_verified_at) {
            return ApiResponse::success(['id' => $id], 'Email already verified');
        }

        $user->email_verified_at = now();
        $user->save();

        return ApiResponse::success(['id' => $id], 'Email verified');
    }
}
