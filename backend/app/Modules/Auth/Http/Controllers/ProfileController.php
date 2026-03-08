<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Modules\Auth\Http\Requests\UpdateProfileRequest;
use App\Modules\Auth\Http\Requests\ChangePasswordRequest;

class ProfileController
{
    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return ApiResponse::success([
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
        ], 'Profile updated');
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate(['avatar' => 'required|image|max:2048']);

        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->avatar = $path;
        $user->save();

        return ApiResponse::success([
            'avatar_url' => Storage::url($path),
        ], 'Avatar uploaded');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return ApiResponse::error('Current password is incorrect', 'INVALID_PASSWORD', [], 422);
        }

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return ApiResponse::success([], 'Password changed');
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        $user->is_active = false;
        $user->save();

        return ApiResponse::success([], 'Account deactivated');
    }
}
