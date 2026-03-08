import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderQuery, useOrderTrackingQuery, useCancelOrderMutation } from '@/features/orders/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const statusVariant = (status: string) => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending_payment: 'warning', confirmed: 'info', processing: 'info',
    shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'danger',
  };
  return map[status] ?? 'default';
};

interface OrderItem {
  id: number;
  product_name: string;
  variant_name?: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface TrackingEvent {
  id: number;
  status?: string;
  event_type?: string;
  description: string;
  location?: string;
  occurred_at?: string;
  created_at: string;
}

export function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { data, isLoading } = useOrderQuery(orderNumber || '');
  const order = data?.data;
  const { data: trackingData } = useOrderTrackingQuery(order?.id ?? 0);
  const cancelMut = useCancelOrderMutation();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const tracking: TrackingEvent[] = trackingData?.data ?? [];

  if (isLoading) return <PageLoader />;

  if (!order) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h1 className="text-xl font-semibold">Order Not Found</h1>
        <Link to="/account/orders" className="mt-4 inline-block text-brand-700 hover:underline">Back to Orders</Link>
      </div>
    );
  }

  const items: OrderItem[] = order.items ?? [];
  const canCancel = ['pending_payment', 'confirmed'].includes(order.status);

  const handleCancel = async () => {
    try {
      await cancelMut.mutateAsync({ orderId: order.id, reason: cancelReason });
      setShowCancel(false);
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/account/orders" className="text-sm text-brand-700 hover:underline">← Back to Orders</Link>
          <h1 className="mt-1 text-2xl font-semibold">Order {order.order_number}</h1>
          <p className="text-sm text-slate-500">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant(order.status)}>
            {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </Badge>
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setShowCancel(true)}>Cancel Order</Button>
          )}
        </div>
      </div>

      {/* Cancel modal */}
      {showCancel && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="font-medium text-red-800">Cancel this order?</h3>
          <textarea
            className="mt-2 w-full rounded-lg border border-red-300 px-3 py-2 text-sm"
            placeholder="Reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={2}
          />
          <div className="mt-2 flex gap-2">
            <Button variant="danger" size="sm" onClick={handleCancel} loading={cancelMut.isPending}>Confirm Cancel</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCancel(false)}>Never mind</Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Order Items */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 font-semibold">Items</h2>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.product_name}</p>
                    {item.variant_name && <p className="text-xs text-slate-500">{item.variant_name}</p>}
                    <p className="text-xs text-slate-400">SKU: {item.sku} | Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.total_price}</p>
                    <p className="text-xs text-slate-500">₹{item.unit_price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Timeline */}
          {tracking.length > 0 && (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="mb-3 font-semibold">Tracking</h2>
              <div className="space-y-3">
                {tracking.map((event, i) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${i === 0 ? 'bg-brand-600' : 'bg-slate-300'}`} />
                      {i < tracking.length - 1 && <div className="w-0.5 flex-1 bg-slate-200" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{event.description}</p>
                      {event.location && <p className="text-xs text-slate-500">{event.location}</p>}
                      <p className="text-xs text-slate-400">
                        {new Date(event.occurred_at ?? event.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span>{order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`}</span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span>₹{order.tax_amount}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>₹{order.grand_total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="rounded-xl border bg-white p-4">
              <h3 className="mb-2 font-semibold">Shipping Address</h3>
              <div className="text-sm text-slate-600">
                <p className="font-medium text-slate-900">{order.shipping_address.recipient_name}</p>
                <p>{order.shipping_address.line_1}</p>
                {order.shipping_address.line_2 && <p>{order.shipping_address.line_2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                <p>{order.shipping_address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          {order.payment && (
            <div className="rounded-xl border bg-white p-4">
              <h3 className="mb-2 font-semibold">Payment</h3>
              <div className="text-sm text-slate-600">
                <p>Gateway: {order.payment.gateway}</p>
                <p>Status: <Badge variant={order.payment.status === 'captured' ? 'success' : 'warning'}>{order.payment.status}</Badge></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
