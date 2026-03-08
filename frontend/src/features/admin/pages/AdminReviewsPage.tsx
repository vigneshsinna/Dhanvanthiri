import { useState } from 'react';
import { useAdminReviewsQuery, useAdminUpdateReviewMutation, useAdminDeleteReviewMutation } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Review {
  id: number;
  user_name: string;
  product_name: string;
  rating: number;
  title?: string;
  body: string;
  status: string;
  created_at: string;
}

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useAdminReviewsQuery({ page, per_page: 15, status: statusFilter || undefined });
  const updateMut = useAdminUpdateReviewMutation();
  const deleteMut = useAdminDeleteReviewMutation();

  const reviews: Review[] = data?.data?.data ?? data?.data ?? [];
  const pagination = data?.data?.meta ?? data?.meta ?? null;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reviews</h1>

      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{r.user_name}</p>
                <p className="text-xs text-slate-500">on <strong>{r.product_name}</strong> · {new Date(r.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">{stars(r.rating)}</span>
                <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>{r.status}</Badge>
              </div>
            </div>
            {r.title && <p className="mt-2 font-semibold text-slate-800">{r.title}</p>}
            <p className="mt-1 text-sm text-slate-600">{r.body}</p>
            <div className="mt-3 flex gap-2">
              {r.status !== 'approved' && (
                <Button size="sm" onClick={() => updateMut.mutate({ id: r.id, status: 'approved' })}>Approve</Button>
              )}
              {r.status !== 'rejected' && (
                <Button size="sm" variant="outline" onClick={() => updateMut.mutate({ id: r.id, status: 'rejected' })}>Reject</Button>
              )}
              <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete this review?')) deleteMut.mutate(r.id); }}>Delete</Button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="py-8 text-center text-slate-400">No reviews found</p>
        )}
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
