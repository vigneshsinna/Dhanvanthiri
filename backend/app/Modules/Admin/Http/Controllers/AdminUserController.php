<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Auth\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController
{
    public function index(Request $request)
    {
        $admins = User::where('role', 'admin')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']);

        return ApiResponse::success(['data' => $admins]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $admin = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'admin',
            'is_active' => true,
        ]);

        return ApiResponse::success(['data' => $admin->only('id', 'name', 'email', 'role')], 'Admin created', 201);
    }

    public function update(Request $request, int $id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $admin->update($data);

        return ApiResponse::success(['data' => $admin->fresh()], 'Admin updated');
    }

    public function destroy(int $id, Request $request)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        if ($admin->id === $request->user()->id) {
            return ApiResponse::error('Cannot delete your own account', 'SELF_DELETE', [], 422);
        }

        $admin->delete();

        return ApiResponse::success([], 'Admin deleted');
    }
}
