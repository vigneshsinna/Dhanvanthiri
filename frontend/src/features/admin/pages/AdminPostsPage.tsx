import { useState } from 'react';
import { useAdminPostsQuery, useAdminCreatePostMutation, useAdminUpdatePostMutation, useAdminDeletePostMutation } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Post {
  id: number;
  title: string;
  slug: string;
  category?: string;
  status: string;
  published_at?: string;
  updated_at: string;
}

export function AdminPostsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminPostsQuery({ page, per_page: 15 });
  const createMut = useAdminCreatePostMutation();
  const updateMut = useAdminUpdatePostMutation();
  const deleteMut = useAdminDeletePostMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', category: '', status: 'draft' as string });

  const posts: Post[] = data?.data?.data ?? data?.data ?? [];
  const pagination = data?.data?.meta ?? data?.meta ?? null;

  const openCreate = () => { setEditId(null); setForm({ title: '', excerpt: '', body: '', category: '', status: 'draft' }); setShowForm(true); };
  const openEdit = (p: Post) => { setEditId(p.id); setForm({ title: p.title, excerpt: '', body: '', category: p.category ?? '', status: p.status }); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMut.mutate({ id: editId, ...form }, { onSuccess: () => setShowForm(false) });
    } else {
      createMut.mutate(form, { onSuccess: () => setShowForm(false) });
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={openCreate}>+ New Post</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">{editId ? 'Edit' : 'New'} Post</h2>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Excerpt</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[80px]"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Body</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[200px]"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <div className="flex gap-2">
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
              {editId ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Title</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Updated</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{p.title}</td>
                <td className="px-4 py-3 text-slate-600">{p.category ?? '-'}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === 'published' ? 'success' : 'default'}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{new Date(p.updated_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete this post?')) deleteMut.mutate(p.id); }}>Delete</Button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No posts yet</td></tr>
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
