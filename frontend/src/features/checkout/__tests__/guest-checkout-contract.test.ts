/**
 * BACKLOG COVERAGE — Guest checkout contract tests
 * Status: APIs implemented, but /checkout UI is blocked by PrivateRoute (backlog item)
 * These tests verify the API contract layer is correct.
 * Verifies:
 * - X-Cart-Token is sent on /guest/* routes (Bug #8 fix)
 * - Guest validate requires guest_email + guest_phone
 * - Guest summary, payment intent, confirm all work
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/msw-server';
import { api } from '@/lib/api/client';
import { store } from '@/app/store';
import { clearCredentials } from '@/features/auth/store/authSlice';
import { setCartToken } from '@/features/cart/store/cartSlice';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  store.dispatch(clearCredentials());
  store.dispatch(setCartToken(null));
});
afterAll(() => server.close());

function setGuestCart() {
  store.dispatch(setCartToken('guest-cart-token-abc'));
}

describe('Guest checkout: X-Cart-Token header', () => {
  it('sends X-Cart-Token on /guest/* routes when cart token exists', async () => {
    setGuestCart();
    const res = await api.post('/guest/checkout/validate', {
      guest_email: 'guest@example.com',
      guest_phone: '9876543210',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.valid).toBe(true);
  });

  it('fails without cart token', async () => {
    // No setGuestCart() — no token in store
    try {
      await api.post('/guest/checkout/validate', {
        guest_email: 'guest@example.com',
        guest_phone: '9876543210',
      });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.cart).toBeDefined();
    }
  });
});

describe('Guest checkout: POST /guest/checkout/validate', () => {
  it('rejects missing guest_email', async () => {
    setGuestCart();
    try {
      await api.post('/guest/checkout/validate', { guest_phone: '9876543210' });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.guest_email).toBeDefined();
    }
  });

  it('rejects missing guest_phone', async () => {
    setGuestCart();
    try {
      await api.post('/guest/checkout/validate', { guest_email: 'guest@example.com' });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.guest_phone).toBeDefined();
    }
  });
});

describe('Guest checkout: POST /guest/checkout/summary', () => {
  it('returns totals with valid cart token', async () => {
    setGuestCart();
    const res = await api.post('/guest/checkout/summary', { shipping_method_id: 1 });
    expect(res.status).toBe(200);
    expect(res.data.data.total).toBeGreaterThan(0);
    expect(res.data.data.subtotal).toBeDefined();
  });
});

describe('Guest checkout: POST /guest/payments/intent', () => {
  it('creates payment intent with inline shipping address', async () => {
    setGuestCart();
    const res = await api.post('/guest/payments/intent', {
      gateway: 'razorpay',
      guest_email: 'guest@example.com',
      guest_phone: '9876543210',
      shipping_address: {
        recipient_name: 'Guest User',
        phone: '9876543210',
        line1: '100 MG Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600001',
      },
      shipping_method_id: 1,
    });
    expect(res.status).toBe(200);
    expect(res.data.data.razorpay_order_id).toBeDefined();
    expect(res.data.data.order_id).toBeDefined();
  });

  it('rejects without required fields', async () => {
    setGuestCart();
    try {
      await api.post('/guest/payments/intent', { gateway: 'razorpay' });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });
});

describe('Guest checkout: POST /guest/payments/confirm', () => {
  it('confirms guest payment with correct fields', async () => {
    setGuestCart();
    const res = await api.post('/guest/payments/confirm', {
      order_id: 2,
      gateway_payment_id: 'pay_guest_abc',
      gateway_order_id: 'order_guest_abc',
      signature: 'sig_valid',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.payment.status).toBe('captured');
  });

  it('rejects bad signature', async () => {
    setGuestCart();
    try {
      await api.post('/guest/payments/confirm', {
        order_id: 2,
        gateway_payment_id: 'pay_guest_abc',
        gateway_order_id: 'order_guest_abc',
        signature: 'bad-signature',
      });
      expect.unreachable('should 400');
    } catch (e: any) {
      expect(e.response.status).toBe(400);
    }
  });

  it('rejects missing fields', async () => {
    setGuestCart();
    try {
      await api.post('/guest/payments/confirm', { order_id: 2 });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });
});
