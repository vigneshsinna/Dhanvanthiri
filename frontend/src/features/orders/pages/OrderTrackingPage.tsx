import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Helmet } from 'react-helmet-async';

interface TrackingResult {
  order_number: string;
  status: string;
  grand_total: number;
  currency: string;
  created_at: string;
  items: Array<{
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    product_image_url: string | null;
  }>;
  shipping_address: {
    recipient_name: string;
    city: string;
    state: string;
  } | null;
  shipments: Array<{
    carrier: string;
    tracking_number: string;
    tracking_url: string | null;
    status: string;
    shipped_at: string | null;
    estimated_delivery_at: string | null;
    delivered_at: string | null;
    events: Array<{ description: string; location: string | null; occurred_at: string }>;
  }>;
  status_history: Array<{ from_status: string | null; to_status: string; note: string | null; created_at: string }>;
}

const STATUS_COLORS: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  pending_payment: 'warning',
  paid: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  completed: 'success',
  cancelled: 'danger',
  refunded: 'default',
};

export function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState('');

  const trackOrder = useMutation({
    mutationFn: async (payload: { order_number: string; email?: string; phone?: string }) => {
      const res = await api.post('/orders/track', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setResult(data.data);
      setError('');
    },
    onError: () => {
      setResult(null);
      setError('Order not found. Please check your order number and email.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedEmail && !trimmedPhone) {
      setError('Please enter either your email or phone number.');
      return;
    }

    trackOrder.mutate({
      order_number: orderNumber.trim(),
      ...(trimmedEmail ? { email: trimmedEmail } : {}),
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
    });
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order | Dhanvanthiri Foods</title>
      </Helmet>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Track Your Order</h1>
        <p className="mb-6 text-slate-600">
          Enter your order number and either email or phone to check your order status.
        </p>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="orderNumber" className="mb-1 block text-sm font-medium text-slate-700">
              Order Number
            </label>
            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g., DV-20260307-001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email Address (optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
              Phone Number (optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <Button type="submit" className="w-full" disabled={trackOrder.isPending}>
            {trackOrder.isPending ? 'Tracking...' : 'Track Order'}
          </Button>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Order #{result.order_number}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(result.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant={STATUS_COLORS[result.status] || 'gray'}>
                  {result.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900">
                ₹{Number(result.grand_total).toFixed(2)}
              </p>
            </div>

            {/* Items */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Items</h2>
              <div className="space-y-3">
                {result.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 border-b pb-3 last:border-0">
                    {item.product_image_url && (
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.product_name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{item.unit_price}</p>
                    </div>
                    <p className="font-semibold">₹{Number(item.line_total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking */}
            {result.shipments.length > 0 && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipment Tracking</h2>
                {result.shipments.map((shipment, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-700">{shipment.carrier}</p>
                      {shipment.tracking_url ? (
                        <a
                          href={shipment.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-700 hover:underline"
                        >
                          {shipment.tracking_number}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-500">{shipment.tracking_number}</span>
                      )}
                    </div>
                    {shipment.events.length > 0 && (
                      <div className="ml-4 mt-3 border-l-2 border-slate-200 pl-4">
                        {shipment.events.map((event, j) => (
                          <div key={j} className="mb-2 last:mb-0">
                            <p className="text-sm font-medium text-slate-700">{event.description}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(event.occurred_at).toLocaleString('en-IN')}
                              {event.location && ` — ${event.location}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Status History */}
            {result.status_history.length > 0 && (
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Timeline</h2>
                <div className="space-y-3">
                  {result.status_history.map((entry, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {entry.to_status.replace(/_/g, ' ')}
                        </p>
                        {entry.note && <p className="text-sm text-slate-500">{entry.note}</p>}
                        <p className="text-xs text-slate-400">
                          {new Date(entry.created_at).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
