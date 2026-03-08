import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrdersQuery } from '@/features/orders/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

const statusVariant = (status: string) => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending_payment: 'warning', confirmed: 'info', processing: 'info',
    shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'danger',
  };
  return map[status] ?? 'default';
};

interface Order {
  id: number;
  order_number: string;
  status: string;
  grand_total: number;
  item_count?: number;
  created_at: string;
  items?: { id: number; product_name: string; quantity: number }[];
}

export function OrderListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrdersQuery({ page, per_page: 10 });
  const orders: Order[] = data?.data?.data ?? data?.data ?? [];
  const pagination = data?.data?.meta ?? data?.meta ?? null;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="text-4xl">📦</div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No orders yet</h2>
          <p className="mt-1 text-sm text-slate-600">Start shopping to see your orders here.</p>
          <Link to="/products" className="mt-4 inline-block text-brand-700 hover:underline">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.order_number}`}
              className="block rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-900">{order.order_number}</span>
                  <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(order.status)}>
                    {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                  <span className="text-lg font-bold text-slate-900">₹{order.grand_total}</span>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="mt-2 text-sm text-slate-600">
                  {order.items.slice(0, 3).map((item) => (
                    <span key={item.id} className="mr-2">{item.product_name} ×{item.quantity}</span>
                  ))}
                  {order.items.length > 3 && <span className="text-slate-400">+{order.items.length - 3} more</span>}
                </div>
              )}
            </Link>
          ))}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              >Previous</button>
              <span className="px-3 py-1.5 text-sm text-slate-600">
                Page {page} of {pagination.last_page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.last_page}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
              >Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
