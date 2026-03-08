import { Link } from 'react-router-dom';
import { useCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation, useApplyCouponMutation, useRemoveCouponMutation } from '@/features/cart/api';
import { useAppDispatch } from '@/lib/utils/hooks';
import { setCart, clearCart } from '@/features/cart/store/cartSlice';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { useEffect, useState } from 'react';

interface CartItem {
  id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  product: { id: number; name: string; slug: string; primary_image_url?: string };
  variant?: { id: number; sku: string; name: string } | null;
}

export function CartPage() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useCartQuery();
  const updateItem = useUpdateCartItemMutation();
  const removeItem = useRemoveCartItemMutation();
  const clearCartMut = useClearCartMutation();
  const applyCoupon = useApplyCouponMutation();
  const removeCoupon = useRemoveCouponMutation();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const cart = data?.data;
  const items: CartItem[] = cart?.items ?? [];

  useEffect(() => {
    if (cart) {
      dispatch(setCart({
        items: items.map((i: CartItem) => ({
          id: i.id,
          quantity: i.quantity,
          unitPrice: i.unit_price,
          lineTotal: i.line_total,
          product: i.product,
          variant: i.variant ?? null,
          isInStock: true,
        })),
        coupon: cart.coupon ?? null,
        subtotal: cart.subtotal ?? 0,
        discountAmount: cart.discount_amount ?? 0,
        shippingCost: cart.shipping_cost ?? null,
        taxAmount: cart.tax_amount ?? null,
        grandTotal: cart.grand_total ?? cart.subtotal ?? 0,
        itemCount: items.length,
      }));
    }
  }, [cart, items, dispatch]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    try {
      await applyCoupon.mutateAsync({ code: couponCode });
      setCouponCode('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid coupon';
      setCouponError(msg);
    }
  };

  if (isLoading) return <PageLoader />;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-600">Browse our products and add items to your cart.</p>
        <Link to="/products">
          <Button className="mt-4">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shopping Cart ({items.length} items)</h1>
        <Button variant="ghost" size="sm" onClick={() => { clearCartMut.mutate(); dispatch(clearCart()); }}>
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border bg-white p-4">
              <Link to={`/products/${item.product.slug}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {item.product.primary_image_url ? (
                  <img src={item.product.primary_image_url} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl text-slate-300">📦</div>
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link to={`/products/${item.product.slug}`} className="font-medium text-slate-900 hover:text-brand-700">
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-slate-500">{item.variant.name} (SKU: {item.variant.sku})</p>
                  )}
                  <p className="text-sm font-semibold text-slate-900">₹{item.unit_price}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-lg border border-slate-300">
                    <button
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-50"
                      onClick={() => {
                        if (item.quantity <= 1) removeItem.mutate(item.id);
                        else updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                      }}
                    >−</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-50"
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                    >+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">₹{item.line_total}</span>
                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Coupon Code</h3>
            {cart?.coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-2">
                <span className="text-sm font-medium text-green-700">{cart.coupon.code} applied</span>
                <button onClick={() => removeCoupon.mutate()} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button size="sm" variant="outline" onClick={handleApplyCoupon} loading={applyCoupon.isPending}>Apply</Button>
                </div>
                {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
              </>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">₹{cart?.subtotal?.toFixed(2) ?? '0.00'}</span>
              </div>
              {(cart?.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{cart.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {cart?.shipping_cost != null && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium">{cart.shipping_cost === 0 ? 'FREE' : `₹${cart.shipping_cost.toFixed(2)}`}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>₹{cart?.grand_total?.toFixed(2) ?? cart?.subtotal?.toFixed(2) ?? '0.00'}</span>
                </div>
              </div>
            </div>
            <Link to="/checkout">
              <Button className="mt-4 w-full">Proceed to Checkout</Button>
            </Link>
            <Link to="/products" className="mt-2 block text-center text-sm text-brand-700 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
