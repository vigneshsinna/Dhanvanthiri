import { useState } from 'react';
import { useAdminCustomersQuery } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  orders_count: number;
  total_spent: number;
  status: string;
  created_at: string;
}

export function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminCustomersQuery({ page, per_page: 15, search: search || undefined });

  const customers: Customer[] = data?.data?.data ?? data?.data ?? [];
  const pagination = data?.data?.meta ?? data?.meta ?? null;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>

      <input
        className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Orders</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Total Spent</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.phone ?? '-'}</td>
                <td className="px-4 py-3 font-medium">{c.orders_count}</td>
                <td className="px-4 py-3 font-semibold">₹{c.total_spent?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.status === 'active' ? 'success' : 'danger'}>{c.status}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(c.created_at).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No customers found</td></tr>
            )}
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
