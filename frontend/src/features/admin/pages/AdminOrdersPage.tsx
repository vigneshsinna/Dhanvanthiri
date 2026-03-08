import { useState } from 'react';
import { useAdminOrdersQuery, useAdminUpdateOrderStatusMutation } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const statusVariant = (status: string) => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending_payment: 'warning', confirmed: 'info', processing: 'info',
    shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'danger',
  };
  return map[status] ?? 'default';
};

const nextStatuses: Record<string, string[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

interface Order {
  id: number;
  order_number: string;
  status: string;
  grand_total: number;
  customer?: { name: string; email: string };
  created_at: string;
}

export function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminOrdersQuery({ page, per_page: 15, status: statusFilter || undefined, search: search || undefined });
  const updateStatus = useAdminUpdateOrderStatusMutation();

  const orders: Order[] = data?.data?.data ?? data?.data ?? [];
  const pagination = data?.data?.meta ?? data?.meta ?? null;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search by order # or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Order #</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{order.order_number}</td>
                <td className="px-4 py-3">
                  <p className="text-slate-900">{order.customer?.name ?? '-'}</p>
                  <p className="text-xs text-slate-500">{order.customer?.email}</p>
                </td>
                <td className="px-4 py-3 font-semibold">₹{order.grand_total}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(order.status)}>
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3 text-right">
                  {(nextStatuses[order.status] ?? []).map((ns) => (
                    <Button
                      key={ns}
                      size="sm"
                      variant={ns === 'cancelled' ? 'danger' : 'outline'}
                      className="ml-1"
                      onClick={() => updateStatus.mutate({ id: order.id, status: ns })}
                    >
                      {ns.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">Prev</button>
          <span className="px-3 py-1.5 text-sm text-slate-600">Page {page} of {pagination.last_page}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= pagination.last_page} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
