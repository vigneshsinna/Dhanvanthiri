import { useState } from 'react';
import { useAdminPagesQuery, useAdminCreatePageMutation, useAdminUpdatePageMutation, useAdminDeletePageMutation } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface CMSPage {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  effective_date?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  status: string;
  updated_at: string;
}

export function AdminPagesPage() {
  const { data, isLoading } = useAdminPagesQuery();
  const createMut = useAdminCreatePageMutation();
  const updateMut = useAdminUpdatePageMutation();
  const deleteMut = useAdminDeletePageMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    effective_date: '',
    status: 'draft' as string,
    meta_title: '',
    meta_description: '',
  });

  const pages: CMSPage[] = data?.data?.data ?? data?.data ?? [];

  const openCreate = () => {
    setEditId(null);
    setForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      effective_date: '',
      status: 'draft',
      meta_title: '',
      meta_description: '',
    });
    setShowForm(true);
  };

  const openEdit = (p: CMSPage) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      content: p.content ?? '',
      excerpt: p.excerpt ?? '',
      effective_date: p.effective_date ?? '',
      status: p.status,
      meta_title: p.meta_title ?? '',
      meta_description: p.meta_description ?? '',
    });
    setShowForm(true);
  };

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
        <h1 className="text-2xl font-bold">Pages</h1>
        <Button onClick={openCreate}>+ New Page</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">{editId ? 'Edit' : 'New'} Page</h2>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="privacy-policy" />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Summary</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[90px]"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>
          <Input
            label="Effective Date"
            type="date"
            value={form.effective_date}
            onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">HTML Content</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm min-h-[200px]"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <Input label="Meta Title" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
          <Input label="Meta Description" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
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
              <th className="px-4 py-3 text-left font-medium text-slate-600">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Updated</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{p.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.slug}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === 'published' ? 'success' : 'default'}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{new Date(p.updated_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete this page?')) deleteMut.mutate(p.id); }}>Delete</Button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No pages yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
