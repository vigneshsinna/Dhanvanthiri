import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistQuery, useRemoveFromWishlistMutation } from '@/features/wishlist/api';
import { useAddCartItemMutation } from '@/features/cart/api';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { Helmet } from 'react-helmet-async';

export function WishlistPage() {
  const { data, isLoading } = useWishlistQuery();
  const removeItem = useRemoveFromWishlistMutation();
  const addToCart = useAddCartItemMutation();
  const [movingToCart, setMovingToCart] = useState<number | null>(null);

  const items = data?.data ?? [];

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>My Wishlist | Dhanvanthiri Foods</title>
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg text-slate-600">Your wishlist is empty</p>
            <Link to="/products" className="mt-4 inline-block text-brand-700 hover:underline">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: WishlistItemType) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm"
              >
                <img
                  src={item.product.image || '/images/placeholder.jpg'}
                  alt={item.product.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="font-semibold text-slate-900 hover:text-brand-700"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-sm text-slate-500">{item.variant.sku}</p>
                  )}
                  <p className="text-lg font-bold text-brand-700">
                    ₹{item.variant?.price_override ?? item.product.price}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    disabled={item.product.stock_quantity <= 0 || movingToCart === item.id}
                    onClick={async () => {
                      setMovingToCart(item.id);
                      try {
                        await addToCart.mutateAsync({
                          product_id: item.product_id,
                          variant_id: item.variant_id ?? undefined,
                          quantity: 1,
                        });
                        await removeItem.mutateAsync(item.id);
                      } finally {
                        setMovingToCart(null);
                      }
                    }}
                  >
                    {movingToCart === item.id ? 'Moving...' : 'Move to Cart'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem.mutate(item.id)}
                    disabled={removeItem.isPending}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

interface WishlistItemType {
  id: number;
  product_id: number;
  variant_id: number | null;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock_quantity: number;
  };
  variant: {
    id: number;
    sku: string;
    price_override: number | null;
  } | null;
  added_at: string;
}
