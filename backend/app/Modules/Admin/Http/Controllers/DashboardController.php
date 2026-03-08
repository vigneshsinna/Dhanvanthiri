<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\Review;
use App\Modules\OrderManagement\Models\ReturnRequest;
use App\Modules\Auth\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController
{
    public function summary(Request $request)
    {
        $period = $request->query('period', 'month');
        $now = Carbon::now();

        $currentStart = match ($period) {
            'week' => $now->copy()->startOfWeek(),
            'year' => $now->copy()->startOfYear(),
            default => $now->copy()->startOfMonth(),
        };
        $previousStart = match ($period) {
            'week' => $currentStart->copy()->subWeek(),
            'year' => $currentStart->copy()->subYear(),
            default => $currentStart->copy()->subMonth(),
        };

        $currentRevenue = Order::whereBetween('created_at', [$currentStart, $now])
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->sum('grand_total');
        $previousRevenue = Order::whereBetween('created_at', [$previousStart, $currentStart])
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->sum('grand_total');
        $revenueGrowth = $previousRevenue > 0 ? round(($currentRevenue - $previousRevenue) / $previousRevenue * 100, 1) : 0;

        $currentOrders = Order::whereBetween('created_at', [$currentStart, $now])->count();
        $previousOrders = Order::whereBetween('created_at', [$previousStart, $currentStart])->count();
        $ordersGrowth = $previousOrders > 0 ? round(($currentOrders - $previousOrders) / $previousOrders * 100, 1) : 0;

        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalCustomers = User::where('role', 'customer')->count();
        $newCustomers = User::where('role', 'customer')->where('created_at', '>=', $currentStart)->count();

        $activeProducts = Product::where('status', 'active')->count();
        $lowStock = Product::where('status', 'active')->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10)->count();
        $outOfStock = Product::where('status', 'active')->where('stock_quantity', '<=', 0)->count();

        $recentOrders = Order::with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'order_number', 'user_id', 'status', 'grand_total', 'created_at']);

        $topProducts = DB::table('order_items')
            ->select('product_name', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(line_total) as total_revenue'))
            ->groupBy('product_name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $pendingReturns = ReturnRequest::where('status', 'pending')->count();
        $pendingReviews = Review::where('status', 'pending')->count();

        return ApiResponse::success([
            'period' => $period,
            'revenue' => [
                'current' => (float) $currentRevenue,
                'previous' => (float) $previousRevenue,
                'growth_percent' => $revenueGrowth,
            ],
            'orders' => [
                'current' => $currentOrders,
                'previous' => $previousOrders,
                'growth_percent' => $ordersGrowth,
                'by_status' => $ordersByStatus,
            ],
            'customers' => [
                'total' => $totalCustomers,
                'new_this_period' => $newCustomers,
            ],
            'products' => [
                'active' => $activeProducts,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock,
            ],
            'recent_orders' => $recentOrders,
            'top_products' => $topProducts,
            'pending_returns' => $pendingReturns,
            'pending_reviews' => $pendingReviews,
        ]);
    }
}
