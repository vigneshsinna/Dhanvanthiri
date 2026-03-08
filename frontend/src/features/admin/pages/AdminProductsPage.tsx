import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminProductsQuery, useAdminDeleteProductMutation } from '@/features/admin/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  status: string;
  primary_image_url?: string;
  variants?: { id: number; stock_quantity: number; sku: string }[];
  category?: { name: string };
  created_at: string;
}

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminProductsQuery({ page, per_page: 15, search: search || undefined });
  const deleteMut = useAdminDeleteProductMutation();

  const products: Product[] = data?.data?.data ?? data?.data ?? [];
  const pagination = data?.data?.meta ?? data?.meta ?? null;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new">
          <Button>+ Add Product</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Product</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Price</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              const totalStock = product.variants?.reduce((s, v) => s + v.stock_quantity, 0) ?? 0;
              return (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-slate-100">
                        {product.primary_image_url ? (
                          <img src={product.primary_image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-lg">📦</div>
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.category?.name ?? '-'}</td>
                  <td className="px-4 py-3 font-medium">₹{product.price}</td>
                  <td className="px-4 py-3">
                    <Badge variant={totalStock === 0 ? 'danger' : totalStock <= 10 ? 'warning' : 'success'}>
                      {totalStock}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.status === 'active' ? 'success' : 'default'}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/products/${product.id}`} className="mr-2 text-brand-700 hover:underline">Edit</Link>
                    <button
                      onClick={() => { if (confirm('Delete this product?')) deleteMut.mutate(product.id); }}
                      className="text-red-600 hover:underline"
                    >Delete</button>
                  </td>
                </tr>
              );
            })}
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
