<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\Auth\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminCustomerController
{
    public function index(Request $request)
    {
        $query = User::where('role', 'customer')
            ->withCount('orders');

        if ($search = $request->input('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
        }

        if ($request->input('status') === 'active') {
            $query->where('is_active', true);
        } elseif ($request->input('status') === 'inactive') {
            $query->where('is_active', false);
        }

        $customers = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return ApiResponse::success([
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    public function show(int $id)
    {
        $customer = User::where('role', 'customer')->withCount('orders')->findOrFail($id);
        $totalSpent = $customer->orders()->whereNotIn('status', ['cancelled', 'refunded'])->sum('grand_total');
        $recentOrders = $customer->orders()->orderByDesc('created_at')->limit(5)->get(['id', 'order_number', 'status', 'grand_total', 'created_at']);

        return ApiResponse::success([
            'data' => [
                'customer' => $customer,
                'total_spent' => (float) $totalSpent,
                'recent_orders' => $recentOrders,
            ],
        ]);
    }

    public function update(Request $request, int $id)
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|string|max:20',
        ]);
        $customer->update($data);

        return ApiResponse::success(['data' => $customer->fresh()], 'Customer updated');
    }

    public function toggleStatus(Request $request, int $id)
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->is_active = !$customer->is_active;
        $customer->save();

        return ApiResponse::success(['data' => $customer], 'Customer status updated');
    }
}
