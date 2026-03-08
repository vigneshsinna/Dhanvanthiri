import { useState, useRef } from 'react';
import { useAdminBannersQuery, useAdminCreateBannerMutation, useAdminUpdateBannerMutation, useAdminDeleteBannerMutation } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  position: string;
  is_active: boolean;
  sort_order: number;
  starts_at?: string;
  ends_at?: string;
}

export function AdminBannersPage() {
  const { data, isLoading } = useAdminBannersQuery();
  const createMut = useAdminCreateBannerMutation();
  const updateMut = useAdminUpdateBannerMutation();
  const deleteMut = useAdminDeleteBannerMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', link_url: '', position: 'home_hero', is_active: true, sort_order: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const banners: Banner[] = data?.data?.data ?? data?.data ?? [];

  const openCreate = () => { setEditId(null); setForm({ title: '', subtitle: '', link_url: '', position: 'home_hero', is_active: true, sort_order: 0 }); setShowForm(true); };
  const openEdit = (b: Banner) => { setEditId(b.id); setForm({ title: b.title, subtitle: b.subtitle ?? '', link_url: b.link_url ?? '', position: b.position, is_active: b.is_active, sort_order: b.sort_order }); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);

    if (editId) {
      updateMut.mutate({ id: editId, formData: fd }, { onSuccess: () => setShowForm(false) });
    } else {
      createMut.mutate(fd, { onSuccess: () => setShowForm(false) });
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={openCreate}>+ New Banner</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">{editId ? 'Edit' : 'New'} Banner</h2>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <Input label="Link URL" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Image</label>
            <input ref={fileRef} type="file" accept="image/*" className="text-sm" />
          </div>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          >
            <option value="home_hero">Home Hero</option>
            <option value="home_secondary">Home Secondary</option>
            <option value="catalog_top">Catalog Top</option>
            <option value="sidebar">Sidebar</option>
          </select>
          <Input label="Sort Order" type="number" value={String(form.sort_order)} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
              {editId ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-xl border bg-white">
            <img src={b.image_url} alt={b.title} className="h-40 w-full object-cover" />
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{b.title}</h3>
                <Badge variant={b.is_active ? 'success' : 'default'}>{b.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="text-xs text-slate-500">Position: {b.position} · Order: {b.sort_order}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(b)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete this banner?')) deleteMut.mutate(b.id); }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="col-span-full py-8 text-center text-slate-400">No banners yet</p>
        )}
      </div>
    </div>
  );
}
