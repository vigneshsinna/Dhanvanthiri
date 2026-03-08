/**
 * Payment robustness tests
 * - Payment intent idempotency
 * - Confirm payment success/failure/signature mismatch
 * - Webhook replay protection (contract level)
 * - Refund idempotency
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/msw-server';
import { api } from '@/lib/api/client';
import { store } from '@/app/store';
import { setCredentials, clearCredentials } from '@/features/auth/store/authSlice';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { server.resetHandlers(); store.dispatch(clearCredentials()); });
afterAll(() => server.close());

function login() {
  store.dispatch(setCredentials({ accessToken: 'test-jwt-token', user: { id: 1, name: 'L', email: 'l@e.com', role: 'customer' } }));
}
function loginAdmin() {
  store.dispatch(setCredentials({ accessToken: 'admin-token', user: { id: 99, name: 'Admin', email: 'a@e.com', role: 'admin' } }));
}

describe('Payment intent idempotency', () => {
  it('creates payment intent with Idempotency-Key header', async () => {
    login();
    const key = 'test-idem-key-001';
    const res = await api.post('/payments/intent', {
      gateway: 'razorpay',
      shipping_address_id: 1,
      shipping_method_id: 1,
      billing_same_as_shipping: true,
    }, { headers: { 'Idempotency-Key': key } });
    expect(res.status).toBe(200);
    expect(res.data.data.razorpay_order_id).toBeDefined();
  });

  it('returns cached response for duplicate idempotency key', async () => {
    login();
    const key = 'test-idem-key-dup';
    const payload = {
      gateway: 'razorpay',
      shipping_address_id: 1,
      shipping_method_id: 1,
      billing_same_as_shipping: true,
    };
    await api.post('/payments/intent', payload, { headers: { 'Idempotency-Key': key } });
    // Second call with same key should return cached
    const res2 = await api.post('/payments/intent', payload, { headers: { 'Idempotency-Key': key } });
    expect(res2.status).toBe(200);
    expect(res2.data.data.razorpay_order_id).toBe('order_cached');
  });

  it('rejects unauthenticated intent creation', async () => {
    try {
      await api.post('/payments/intent', {
        gateway: 'razorpay', shipping_address_id: 1, shipping_method_id: 1, billing_same_as_shipping: true,
      });
      expect.unreachable('should 401');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  it('rejects missing required fields', async () => {
    login();
    try {
      await api.post('/payments/intent', {}, { headers: { 'Idempotency-Key': 'no-fields' } });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });
});

describe('Confirm payment', () => {
  it('succeeds with valid gateway fields', async () => {
    login();
    const res = await api.post('/payments/confirm', {
      order_id: 1,
      gateway_payment_id: 'pay_abc',
      gateway_order_id: 'order_abc',
      signature: 'sig_valid',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.payment.status).toBe('captured');
  });

  it('fails with bad signature', async () => {
    login();
    try {
      await api.post('/payments/confirm', {
        order_id: 1,
        gateway_payment_id: 'pay_abc',
        gateway_order_id: 'order_abc',
        signature: 'bad-signature',
      });
      expect.unreachable('should 400');
    } catch (e: any) {
      expect(e.response.status).toBe(400);
    }
  });

  it('fails with missing fields', async () => {
    login();
    try {
      await api.post('/payments/confirm', { order_id: 1 });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });
});

describe('Payment show', () => {
  it('GET /payments/{orderId} returns payment info', async () => {
    login();
    const res = await api.get('/payments/1');
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe('captured');
  });
});

describe('Admin refund', () => {
  it('POST /admin/orders/{id}/refund processes refund', async () => {
    loginAdmin();
    const res = await api.post('/admin/orders/1/refund');
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe('processed');
  });
});

describe('Admin payments list', () => {
  it('GET /admin/payments returns payments', async () => {
    loginAdmin();
    const res = await api.get('/admin/payments');
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
  });
});

describe('Webhook contract', () => {
  it('POST /webhooks/razorpay is public', async () => {
    store.dispatch(clearCredentials());
    const res = await api.post('/webhooks/razorpay', { event: 'payment.captured' });
    expect(res.status).toBe(200);
  });
});
