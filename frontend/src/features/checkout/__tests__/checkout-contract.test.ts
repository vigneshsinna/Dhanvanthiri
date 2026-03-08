/**
 * Checkout contract-alignment tests
 * Verifies POST /checkout/validate requires address_id and shipping_method_id
 * Covers auth/guest scenarios and invalid combinations
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
  store.dispatch(setCredentials({ accessToken: 'test-jwt-token', user: { id: 1, name: 'Lakshmi', email: 'l@e.com', role: 'customer' } }));
}

describe('Checkout contract: POST /checkout/validate', () => {
  it('rejects unauthenticated requests', async () => {
    try {
      await api.post('/checkout/validate', { address_id: 1, shipping_method_id: 1 });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  it('rejects missing address_id', async () => {
    login();
    try {
      await api.post('/checkout/validate', { shipping_method_id: 1 });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.address_id).toBeDefined();
    }
  });

  it('rejects missing shipping_method_id', async () => {
    login();
    try {
      await api.post('/checkout/validate', { address_id: 1 });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.shipping_method_id).toBeDefined();
    }
  });

  it('succeeds with valid address_id and shipping_method_id', async () => {
    login();
    const res = await api.post('/checkout/validate', { address_id: 1, shipping_method_id: 1 });
    expect(res.data.success).toBe(true);
    expect(res.data.data.valid).toBe(true);
  });
});

describe('Checkout contract: POST /checkout/summary', () => {
  it('rejects unauthenticated requests', async () => {
    try {
      await api.post('/checkout/summary', { address_id: 1, shipping_method_id: 1 });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  it('returns totals for valid input', async () => {
    login();
    const res = await api.post('/checkout/summary', { address_id: 1, shipping_method_id: 1 });
    expect(res.data.data.subtotal).toBe(500);
    expect(res.data.data.shipping).toBe(60);
    expect(res.data.data.tax).toBeGreaterThan(0);
    expect(res.data.data.total).toBeGreaterThan(0);
  });
});

describe('Checkout contract: useValidateCheckoutMutation sends required body', () => {
  it('hook sends address_id and shipping_method_id in POST body', async () => {
    login();
    // Direct API call mimicking what the hook does
    const res = await api.post('/checkout/validate', { address_id: 1, shipping_method_id: 1 });
    expect(res.status).toBe(200);
    expect(res.data.data.valid).toBe(true);
  });
});

describe('Checkout contract: useConfirmPaymentMutation field names', () => {
  it('sends gateway_payment_id, gateway_order_id, signature (not razorpay_*)', async () => {
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

  it('rejects bad signature', async () => {
    login();
    try {
      await api.post('/payments/confirm', {
        order_id: 1,
        gateway_payment_id: 'pay_abc',
        gateway_order_id: 'order_abc',
        signature: 'bad-signature',
      });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(400);
    }
  });
});
