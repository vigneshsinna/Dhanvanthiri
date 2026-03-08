import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/lib/utils/hooks';
import { setStep, setCheckoutData, resetCheckout } from '@/features/checkout/store/checkoutSlice';
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useCheckoutSummaryMutation,
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useGuestValidateCheckoutMutation,
  useGuestCheckoutSummaryMutation,
  useGuestCreatePaymentIntentMutation,
  useGuestConfirmPaymentMutation,
} from '@/features/checkout/api';
import { useShippingRatesQuery } from '@/features/cart/api';
import { clearCart } from '@/features/cart/store/cartSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';

interface Address {
  id: number;
  label?: string;
  recipient_name: string;
  phone: string;
  line_1: string;
  line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
  is_default: boolean;
}

interface ShippingRate {
  id: number;
  name: string;
  cost: number;
  estimated_days_min: number;
  estimated_days_max: number;
}

interface CheckoutTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function unwrapData<T>(payload: unknown): T {
  const data = payload as { data?: { data?: T } & T };
  if (data?.data && typeof data.data === 'object' && 'data' in data.data) {
    return (data.data as { data: T }).data;
  }
  return (data?.data as T) ?? (payload as T);
}

export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const checkout = useAppSelector((s) => s.checkout);
  const cart = useAppSelector((s) => s.cart);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const { data: addressData, isLoading: loadingAddresses } = useAddressesQuery();
  const addresses: Address[] = isAuthenticated ? (addressData?.data ?? []) : [];

  const { data: ratesData } = useShippingRatesQuery(checkout.shippingAddressId ?? 0);
  const shippingRates: ShippingRate[] = isAuthenticated ? (ratesData?.data ?? []) : [];

  const createAddress = useCreateAddressMutation();
  const summaryMut = useCheckoutSummaryMutation();
  const createPayment = useCreatePaymentIntentMutation();
  const confirmPayment = useConfirmPaymentMutation();

  const guestValidate = useGuestValidateCheckoutMutation();
  const guestSummaryMut = useGuestCheckoutSummaryMutation();
  const guestCreatePayment = useGuestCreatePaymentIntentMutation();
  const guestConfirmPayment = useGuestConfirmPaymentMutation();

  const [summary, setSummary] = useState<CheckoutTotals | null>(null);

  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    recipient_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country_code: 'IN',
  });

  const [guestInfo, setGuestInfo] = useState({
    guest_email: '',
    guest_phone: '',
    recipient_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country_code: 'IN',
  });

  const guestAddressValid = useMemo(() => {
    return Boolean(
      guestInfo.guest_email.trim() &&
      guestInfo.guest_phone.trim() &&
      guestInfo.recipient_name.trim() &&
      guestInfo.line1.trim() &&
      guestInfo.city.trim() &&
      guestInfo.state.trim() &&
      guestInfo.postal_code.trim()
    );
  }, [guestInfo]);

  const displaySteps: Array<'address' | 'shipping' | 'review' | 'payment'> = isAuthenticated
    ? ['address', 'shipping', 'review', 'payment']
    : ['address', 'review', 'payment'];

  useEffect(() => {
    if (!isAuthenticated && checkout.step === 'shipping') {
      dispatch(setStep('address'));
    }
  }, [checkout.step, dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (addresses.length > 0 && !checkout.shippingAddressId) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      dispatch(setCheckoutData({ shippingAddressId: def.id }));
    }
  }, [addresses, checkout.shippingAddressId, dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (shippingRates.length > 0 && !checkout.shippingMethodId) {
      dispatch(setCheckoutData({ shippingMethodId: shippingRates[0].id }));
    }
  }, [shippingRates, checkout.shippingMethodId, dispatch, isAuthenticated]);

  useEffect(() => {
    if (checkout.step !== 'review') {
      return;
    }

    const run = async () => {
      try {
        if (isAuthenticated) {
          if (!checkout.shippingAddressId || !checkout.shippingMethodId) {
            return;
          }
          const res = await summaryMut.mutateAsync({
            address_id: checkout.shippingAddressId,
            shipping_method_id: checkout.shippingMethodId,
          });
          const d = unwrapData<CheckoutTotals>(res);
          setSummary(d);
        } else {
          const res = await guestSummaryMut.mutateAsync({
            shipping_method_id: checkout.shippingMethodId ?? undefined,
          });
          const d = unwrapData<CheckoutTotals>(res);
          setSummary(d);
        }
      } catch {
        setSummary(null);
      }
    };

    run();
  }, [checkout.step, checkout.shippingAddressId, checkout.shippingMethodId, guestSummaryMut, isAuthenticated, summaryMut]);

  const handleNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createAddress.mutateAsync(newAddr);
      dispatch(setCheckoutData({ shippingAddressId: unwrapData<{ id: number }>(res).id }));
      setShowNewAddress(false);
    } catch {
      // handled by API messages in existing UI patterns
    }
  };

  const parseIntentPayload = (intentResponse: unknown) => {
    const data = unwrapData<Record<string, unknown>>(intentResponse);
    const orderId = Number(data.order_id);
    const razorpayOrderId = String(data.razorpay_order_id ?? '');
    const keyId = String(data.razorpay_key_id ?? data.key_id ?? '');
    const amount = Number(data.amount ?? data.amount_minor ?? 0);
    const currency = String(data.currency ?? 'INR');

    return { orderId, razorpayOrderId, keyId, amount, currency };
  };

  const handleAuthPayment = async () => {
    dispatch(setCheckoutData({ isProcessing: true, error: null }));
    try {
      const res = await createPayment.mutateAsync({
        gateway: 'razorpay',
        shipping_address_id: checkout.shippingAddressId!,
        shipping_method_id: checkout.shippingMethodId!,
        billing_same_as_shipping: checkout.billingSameAsShipping,
      });

      const paymentData = parseIntentPayload(res);
      dispatch(setCheckoutData({ orderId: paymentData.orderId, razorpayOrderId: paymentData.razorpayOrderId }));

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Dhanvanthiri Foods',
        description: 'Order Payment',
        order_id: paymentData.razorpayOrderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await confirmPayment.mutateAsync({
              order_id: paymentData.orderId,
              gateway_payment_id: response.razorpay_payment_id,
              gateway_order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
            dispatch(clearCart());
            dispatch(resetCheckout());
            navigate('/checkout/confirmation');
          } catch {
            dispatch(setCheckoutData({ isProcessing: false, error: 'Payment verification failed' }));
          }
        },
        modal: {
          ondismiss: () => dispatch(setCheckoutData({ isProcessing: false })),
        },
        prefill: {
          name: addresses.find((a) => a.id === checkout.shippingAddressId)?.recipient_name,
          contact: addresses.find((a) => a.id === checkout.shippingAddressId)?.phone,
        },
        theme: { color: '#346d56' },
      };

      if (typeof window.Razorpay !== 'undefined') {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        dispatch(setCheckoutData({ isProcessing: false, error: 'Payment gateway not loaded. Please refresh.' }));
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment creation failed';
      dispatch(setCheckoutData({ isProcessing: false, error: msg }));
    }
  };

  const handleGuestAddressContinue = async () => {
    dispatch(setCheckoutData({ error: null }));
    try {
      const res = await guestValidate.mutateAsync({
        guest_email: guestInfo.guest_email.trim(),
        guest_phone: guestInfo.guest_phone.trim(),
      });
      const validation = unwrapData<{ valid: boolean; issues?: string[] }>(res);
      if (!validation.valid) {
        dispatch(setCheckoutData({ error: validation.issues?.join(', ') || 'Checkout validation failed' }));
        return;
      }
      dispatch(setStep('review'));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to validate checkout';
      dispatch(setCheckoutData({ error: msg }));
    }
  };

  const handleGuestPayment = async () => {
    dispatch(setCheckoutData({ isProcessing: true, error: null }));
    try {
      const res = await guestCreatePayment.mutateAsync({
        gateway: 'razorpay',
        guest_email: guestInfo.guest_email.trim(),
        guest_phone: guestInfo.guest_phone.trim(),
        shipping_address: {
          recipient_name: guestInfo.recipient_name.trim(),
          phone: guestInfo.phone.trim() || guestInfo.guest_phone.trim(),
          line1: guestInfo.line1.trim(),
          line2: guestInfo.line2.trim() || undefined,
          city: guestInfo.city.trim(),
          state: guestInfo.state.trim(),
          postal_code: guestInfo.postal_code.trim(),
          country_code: guestInfo.country_code,
        },
        shipping_method_id: checkout.shippingMethodId ?? undefined,
      });

      const paymentData = parseIntentPayload(res);
      dispatch(setCheckoutData({ orderId: paymentData.orderId, razorpayOrderId: paymentData.razorpayOrderId }));

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Dhanvanthiri Foods',
        description: 'Guest Order Payment',
        order_id: paymentData.razorpayOrderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await guestConfirmPayment.mutateAsync({
              order_id: paymentData.orderId,
              gateway_payment_id: response.razorpay_payment_id,
              gateway_order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
            dispatch(clearCart());
            dispatch(resetCheckout());
            navigate('/checkout/confirmation');
          } catch {
            dispatch(setCheckoutData({ isProcessing: false, error: 'Payment verification failed' }));
          }
        },
        modal: {
          ondismiss: () => dispatch(setCheckoutData({ isProcessing: false })),
        },
        prefill: {
          name: guestInfo.recipient_name,
          email: guestInfo.guest_email,
          contact: guestInfo.guest_phone,
        },
        theme: { color: '#346d56' },
      };

      if (typeof window.Razorpay !== 'undefined') {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        dispatch(setCheckoutData({ isProcessing: false, error: 'Payment gateway not loaded. Please refresh.' }));
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment creation failed';
      dispatch(setCheckoutData({ isProcessing: false, error: msg }));
    }
  };

  if (isAuthenticated && loadingAddresses) {
    return <PageLoader />;
  }

  if (cart.itemCount === 0 && checkout.step !== 'confirmation') {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Button className="mt-4" onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      {!isAuthenticated && (
        <div className="rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm text-brand-800">
          Guest checkout enabled. Already have an account? <Link to="/login" className="font-semibold underline">Sign in</Link>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        {displaySteps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-300">-&gt;</span>}
            <span className={`rounded-full px-3 py-1 capitalize ${checkout.step === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {checkout.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{checkout.error}</div>}

      {checkout.step === 'address' && isAuthenticated && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
          {addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${checkout.shippingAddressId === addr.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={checkout.shippingAddressId === addr.id}
                    onChange={() => dispatch(setCheckoutData({ shippingAddressId: addr.id }))}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{addr.recipient_name} {addr.label && <span className="text-slate-400">({addr.label})</span>}</p>
                    <p className="text-slate-600">{addr.line_1}{addr.line_2 ? `, ${addr.line_2}` : ''}</p>
                    <p className="text-slate-600">{addr.city}, {addr.state} {addr.postal_code}</p>
                    <p className="text-slate-500">{addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <button onClick={() => setShowNewAddress(!showNewAddress)} className="mt-3 text-sm text-brand-700 hover:underline">
            + Add new address
          </button>

          {showNewAddress && (
            <form onSubmit={handleNewAddress} className="mt-4 grid gap-3 rounded-lg border bg-slate-50 p-4 sm:grid-cols-2">
              <Input label="Full Name" value={newAddr.recipient_name} onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })} required />
              <Input label="Phone" value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} required />
              <div className="sm:col-span-2">
                <Input label="Address Line 1" value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <Input label="Address Line 2 (optional)" value={newAddr.line2} onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })} />
              </div>
              <Input label="City" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} required />
              <Input label="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} required />
              <Input label="Postal Code" value={newAddr.postal_code} onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })} required />
              <div className="sm:col-span-2">
                <Button type="submit" size="sm" loading={createAddress.isPending}>Save Address</Button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <Button disabled={!checkout.shippingAddressId} onClick={() => dispatch(setStep('shipping'))}>Continue to Shipping</Button>
          </div>
        </div>
      )}

      {checkout.step === 'address' && !isAuthenticated && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Guest Details & Shipping Address</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Email" type="email" value={guestInfo.guest_email} onChange={(e) => setGuestInfo({ ...guestInfo, guest_email: e.target.value })} required />
            <Input label="Phone" value={guestInfo.guest_phone} onChange={(e) => setGuestInfo({ ...guestInfo, guest_phone: e.target.value })} required />
            <Input label="Recipient Name" value={guestInfo.recipient_name} onChange={(e) => setGuestInfo({ ...guestInfo, recipient_name: e.target.value })} required />
            <Input label="Delivery Phone" value={guestInfo.phone} onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })} />
            <div className="sm:col-span-2">
              <Input label="Address Line 1" value={guestInfo.line1} onChange={(e) => setGuestInfo({ ...guestInfo, line1: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <Input label="Address Line 2 (optional)" value={guestInfo.line2} onChange={(e) => setGuestInfo({ ...guestInfo, line2: e.target.value })} />
            </div>
            <Input label="City" value={guestInfo.city} onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })} required />
            <Input label="State" value={guestInfo.state} onChange={(e) => setGuestInfo({ ...guestInfo, state: e.target.value })} required />
            <Input label="Postal Code" value={guestInfo.postal_code} onChange={(e) => setGuestInfo({ ...guestInfo, postal_code: e.target.value })} required />
          </div>

          <div className="mt-6">
            <Button disabled={!guestAddressValid || guestValidate.isPending} loading={guestValidate.isPending} onClick={handleGuestAddressContinue}>
              Continue to Review
            </Button>
          </div>
        </div>
      )}

      {checkout.step === 'shipping' && isAuthenticated && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Shipping Method</h2>
          {shippingRates.length === 0 ? (
            <p className="text-sm text-slate-500">Loading shipping options...</p>
          ) : (
            <div className="space-y-2">
              {shippingRates.map((rate) => (
                <label
                  key={rate.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${checkout.shippingMethodId === rate.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={checkout.shippingMethodId === rate.id} onChange={() => dispatch(setCheckoutData({ shippingMethodId: rate.id }))} />
                    <div className="text-sm">
                      <p className="font-medium">{rate.name}</p>
                      <p className="text-xs text-slate-500">{rate.estimated_days_min}-{rate.estimated_days_max} business days</p>
                    </div>
                  </div>
                  <span className="font-semibold">{rate.cost === 0 ? 'FREE' : `Rs ${rate.cost}`}</span>
                </label>
              ))}
            </div>
          )}
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => dispatch(setStep('address'))}>Back</Button>
            <Button disabled={!checkout.shippingMethodId} onClick={() => dispatch(setStep('review'))}>Review Order</Button>
          </div>
        </div>
      )}

      {checkout.step === 'review' && (
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Review</h2>
          {summary ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>Rs {summary.subtotal.toFixed(2)}</span></div>
              {summary.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs {summary.discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span>{summary.shipping === 0 ? 'FREE' : `Rs ${summary.shipping.toFixed(2)}`}</span></div>
              {summary.tax > 0 && <div className="flex justify-between"><span className="text-slate-600">Tax</span><span>Rs {summary.tax.toFixed(2)}</span></div>}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>Rs {summary.total.toFixed(2)}</span></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Calculating total...</p>
          )}

          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => dispatch(setStep('address'))}>Back</Button>
            <Button
              loading={checkout.isProcessing}
              onClick={() => {
                dispatch(setStep('payment'));
                if (isAuthenticated) {
                  void handleAuthPayment();
                } else {
                  void handleGuestPayment();
                }
              }}
            >
              Pay with Razorpay
            </Button>
          </div>
        </div>
      )}

      {checkout.step === 'payment' && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <div className="text-4xl">...</div>
          <h2 className="mt-4 text-lg font-semibold">Processing Payment...</h2>
          <p className="mt-2 text-sm text-slate-600">Please complete the payment in the Razorpay window.</p>
        </div>
      )}
    </div>
  );
}
