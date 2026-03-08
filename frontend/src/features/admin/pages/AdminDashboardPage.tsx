import { useAppDispatch, useAppSelector } from '@/lib/utils/hooks';
import { setPeriod } from '@/features/admin/store/adminSlice';
import { useDashboardSummaryQuery } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const period = useAppSelector((s) => s.admin.period);
  const { data, isLoading } = useDashboardSummaryQuery(period);
  const summary = data?.data;

  if (isLoading) return <PageLoader />;

  const stats = [
    {
      label: 'Revenue',
      value: `₹${summary?.revenue?.toLocaleString('en-IN') ?? '0'}`,
      change: summary?.revenue_change,
      icon: '💰',
    },
    {
      label: 'Orders',
      value: summary?.total_orders ?? 0,
      change: summary?.orders_change,
      icon: '📦',
    },
    {
      label: 'Customers',
      value: summary?.total_customers ?? 0,
      change: summary?.customers_change,
      icon: '👥',
    },
    {
      label: 'Low Stock',
      value: summary?.low_stock_count ?? 0,
      icon: '⚠️',
      alert: (summary?.low_stock_count ?? 0) > 0,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <select
          value={period}
          onChange={(e) => dispatch(setPeriod(e.target.value as typeof period))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl bg-white p-5 shadow-sm ${stat.alert ? 'ring-2 ring-orange-200' : ''}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
            {stat.change !== undefined && (
              <p className={`mt-1 text-xs font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% vs previous period
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        {summary?.orders_by_status && (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">Orders by Status</h2>
            <div className="space-y-2">
              {Object.entries(summary.orders_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-slate-600">{status.replace(/_/g, ' ')}</span>
                  <Badge variant={status === 'delivered' ? 'success' : status === 'cancelled' ? 'danger' : 'info'}>
                    {count as number}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {summary?.recent_orders && (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-brand-700 hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {summary.recent_orders.map((order: { id: number; order_number: string; grand_total: number; status: string; created_at: string }) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <div>
                    <span className="font-medium">{order.order_number}</span>
                    <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={order.status === 'delivered' ? 'success' : 'info'}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="font-semibold">₹{order.grand_total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Products */}
        {summary?.top_products && (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900">Top Products</h2>
            <div className="space-y-2">
              {summary.top_products.map((product: { id: number; name: string; total_sold: number; revenue: number }, i: number) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="text-slate-900">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">₹{product.revenue.toLocaleString('en-IN')}</span>
                    <p className="text-xs text-slate-400">{product.total_sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock Alerts */}
        {summary?.stock_alerts && summary.stock_alerts.length > 0 && (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Stock Alerts</h2>
              <Link to="/admin/inventory" className="text-sm text-brand-700 hover:underline">Manage</Link>
            </div>
            <div className="space-y-2">
              {summary.stock_alerts.map((item: { id: number; product_name: string; variant_name: string; stock_quantity: number }) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-900">{item.product_name}</span>
                    <p className="text-xs text-slate-500">{item.variant_name}</p>
                  </div>
                  <Badge variant={item.stock_quantity === 0 ? 'danger' : 'warning'}>
                    {item.stock_quantity === 0 ? 'Out of stock' : `${item.stock_quantity} left`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
