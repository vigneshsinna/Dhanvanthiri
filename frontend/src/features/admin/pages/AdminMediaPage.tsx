import { useState, useRef } from 'react';
import { useAdminMediaQuery, useAdminUploadMediaMutation, useAdminDeleteMediaMutation } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

interface MediaItem {
  id: number;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  return (kb / 1024).toFixed(1) + ' MB';
}

export function AdminMediaPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminMediaQuery({ page, per_page: 24 });
  const uploadMut = useAdminUploadMediaMutation();
  const deleteMut = useAdminDeleteMediaMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const items: MediaItem[] = data?.data?.data ?? data?.data ?? [];
  const pagination = data?.data?.meta ?? data?.meta ?? null;

  const handleUpload = () => {
    const files = fileRef.current?.files;
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      const fd = new FormData();
      fd.append('file', file);
      uploadMut.mutate(fd);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*,video/*,.pdf" multiple className="text-sm" />
          <Button onClick={handleUpload} loading={uploadMut.isPending}>Upload</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.id} className="group overflow-hidden rounded-xl border bg-white">
            {item.mime_type.startsWith('image/') ? (
              <img src={item.url} alt={item.filename} className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center bg-slate-100 text-2xl">📄</div>
            )}
            <div className="p-2 space-y-1">
              <p className="truncate text-xs font-medium text-slate-900" title={item.filename}>{item.filename}</p>
              <p className="text-xs text-slate-400">{formatBytes(item.size)}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  className="rounded bg-slate-100 px-2 py-0.5 text-xs hover:bg-slate-200"
                  onClick={() => copyUrl(item)}
                >
                  {copied === item.id ? '✓ Copied' : 'Copy URL'}
                </button>
                <button
                  className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600 hover:bg-red-200"
                  onClick={() => { if (confirm('Delete?')) deleteMut.mutate(item.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="py-12 text-center text-slate-400">No media files. Upload some above.</p>
      )}

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
