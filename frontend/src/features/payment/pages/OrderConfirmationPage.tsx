import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/lib/utils/hooks';

export function OrderConfirmationPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <div className="mx-auto max-w-lg rounded-xl border bg-white p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Order Confirmed!</h1>
      <p className="mt-2 text-slate-600">
        Thank you for your purchase. Your order has been placed successfully and payment has been confirmed.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        You will receive an order confirmation email shortly.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {isAuthenticated ? (
          <Link to="/account/orders">
            <Button variant="primary">View My Orders</Button>
          </Link>
        ) : (
          <Link to="/track-order">
            <Button variant="primary">Track Order</Button>
          </Link>
        )}
        <Link to="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
