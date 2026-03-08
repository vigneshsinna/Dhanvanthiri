<?php

namespace App\Modules\Admin\Http\Controllers;

use App\Modules\Shared\Http\Resources\ApiResponse;
use App\Modules\OrderManagement\Models\Order;
use App\Modules\Auth\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController
{
    private function dateRange(Request $request): array
    {
        $from = $request->input('from_date', Carbon::now()->subDays(30)->toDateString());
        $to = $request->input('to_date', Carbon::now()->toDateString());
        return [$from, $to];
    }

    public function revenue(Request $request)
    {
        [$from, $to] = $this->dateRange($request);

        $daily = Order::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(grand_total) as total'), DB::raw('COUNT(*) as orders'))
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalRevenue = $daily->sum('total');
        $avgOrderValue = $daily->sum('orders') > 0 ? $totalRevenue / $daily->sum('orders') : 0;

        return ApiResponse::success([
            'data' => [
                'chart' => $daily,
                'total_revenue' => (float) $totalRevenue,
                'avg_order_value' => round($avgOrderValue, 2),
                'total_orders' => $daily->sum('orders'),
            ],
        ]);
    }

    public function orders(Request $request)
    {
        [$from, $to] = $this->dateRange($request);

        $byStatus = Order::select('status', DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->groupBy('status')
            ->get();

        $daily = Order::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return ApiResponse::success(['data' => ['by_status' => $byStatus, 'daily' => $daily]]);
    }

    public function customers(Request $request)
    {
        [$from, $to] = $this->dateRange($request);

        $newCustomers = User::where('role', 'customer')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topBuyers = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email', DB::raw('COUNT(*) as order_count'), DB::raw('SUM(grand_total) as total_spent'))
            ->whereNotIn('orders.status', ['cancelled', 'refunded'])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_spent')
            ->limit(10)
            ->get();

        return ApiResponse::success(['data' => ['new_customers' => $newCustomers, 'top_buyers' => $topBuyers]]);
    }

    public function products(Request $request)
    {
        $topSelling = DB::table('order_items')
            ->select('product_id', 'product_name', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(line_total) as total_revenue'))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sold')
            ->limit(20)
            ->get();

        return ApiResponse::success(['data' => ['top_selling' => $topSelling]]);
    }

    public function export(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:orders,revenue,customers,products',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
            'format' => 'nullable|in:csv,xlsx',
        ]);

        $job = DB::table('export_jobs')->insertGetId([
            'requested_by' => $request->user()->id,
            'type' => $data['type'],
            'from_date' => $data['from_date'] ?? null,
            'to_date' => $data['to_date'] ?? null,
            'format' => $data['format'] ?? 'csv',
            'status' => 'queued',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return ApiResponse::success(['export_id' => $job, 'status' => 'queued'], 'Export queued', 202);
    }
}
