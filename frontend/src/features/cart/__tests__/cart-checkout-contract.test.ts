/**
 * Cart + checkout matrix tests
 * - Guest cart create/add/update/remove/clear
 * - Cart merge after login
 * - Coupon apply/remove with valid/invalid/expired/ineligible
 * - Shipping rates
 * - Address CRUD + default
 * - Checkout summary correctness
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

describe('Cart: guest operations', () => {
  it('GET /cart returns cart', async () => {
    const res = await api.get('/cart');
    expect(res.status).toBe(200);
    expect(res.data.data.items).toBeInstanceOf(Array);
  });

  it('POST /cart/items adds item', async () => {
    const res = await api.post('/cart/items', { product_id: 1, variant_id: 1, quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.data.data.items.length).toBeGreaterThan(0);
  });

  it('PUT /cart/items/{id} updates quantity', async () => {
    const res = await api.put('/cart/items/1', { quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.data.data.items[0].quantity).toBe(3);
  });

  it('PUT /cart/items/{id} rejects exceeding stock', async () => {
    try {
      await api.put('/cart/items/1', { quantity: 100 });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.quantity).toBeDefined();
    }
  });

  it('DELETE /cart/items/{id} removes item', async () => {
    const res = await api.delete('/cart/items/1');
    expect(res.status).toBe(200);
    expect(res.data.data.items).toHaveLength(0);
  });

  it('DELETE /cart clears cart', async () => {
    const res = await api.delete('/cart');
    expect(res.status).toBe(200);
    expect(res.data.data.total).toBe(0);
  });
});

describe('Cart: coupon operations', () => {
  it('POST /cart/coupon applies valid coupon', async () => {
    const res = await api.post('/cart/coupon', { code: 'SAVE10' });
    expect(res.status).toBe(200);
    expect(res.data.data.discount).toBe(50);
    expect(res.data.data.coupon.code).toBe('SAVE10');
  });

  it('POST /cart/coupon rejects expired coupon', async () => {
    try {
      await api.post('/cart/coupon', { code: 'EXPIRED' });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.code[0]).toContain('expired');
    }
  });

  it('POST /cart/coupon rejects invalid coupon', async () => {
    try {
      await api.post('/cart/coupon', { code: 'INVALID' });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });

  it('POST /cart/coupon rejects minimum-not-met coupon', async () => {
    try {
      await api.post('/cart/coupon', { code: 'MINORDER' });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.code[0]).toContain('1000');
    }
  });

  it('DELETE /cart/coupon removes coupon', async () => {
    const res = await api.delete('/cart/coupon');
    expect(res.status).toBe(200);
    expect(res.data.data.coupon).toBeNull();
  });
});

describe('Cart: shipping rates', () => {
  it('GET /cart/shipping-rates returns methods', async () => {
    const res = await api.get('/cart/shipping-rates', { params: { address_id: 1 } });
    expect(res.status).toBe(200);
    expect(res.data.data.data.length).toBeGreaterThanOrEqual(2);
    expect(res.data.data.data[0].name).toBe('Standard');
  });
});

describe('Cart: merge guest to user', () => {
  it('POST /cart/merge merges guest cart', async () => {
    login();
    const res = await api.post('/cart/merge');
    expect(res.status).toBe(200);
    expect(res.data.data.items).toBeInstanceOf(Array);
  });
});

describe('Address CRUD + default', () => {
  it('GET /addresses returns addresses', async () => {
    login();
    const res = await api.get('/addresses');
    expect(res.status).toBe(200);
    expect(res.data.data.data[0].recipient_name).toBe('Lakshmi');
  });

  it('POST /addresses creates address', async () => {
    login();
    const res = await api.post('/addresses', {
      label: 'Office', recipient_name: 'Lakshmi', phone: '9876543210',
      line1: '1 Tech Park', city: 'Bangalore', state: 'Karnataka',
      postal_code: '560001', country_code: 'IN',
    });
    expect(res.status).toBe(200);
  });

  it('PUT /addresses/{id} updates address', async () => {
    login();
    const res = await api.put('/addresses/1', { label: 'Updated Home' });
    expect(res.status).toBe(200);
  });

  it('DELETE /addresses/{id} deletes address', async () => {
    login();
    const res = await api.delete('/addresses/1');
    expect(res.status).toBe(200);
  });

  it('PUT /addresses/{id}/default sets default', async () => {
    login();
    const res = await api.put('/addresses/1/default');
    expect(res.status).toBe(200);
    expect(res.data.data.is_default).toBe(true);
  });
});

describe('Checkout summary correctness', () => {
  it('returns totals with address and shipping method', async () => {
    login();
    const res = await api.post('/checkout/summary', { address_id: 1, shipping_method_id: 1 });
    expect(res.data.data.subtotal).toBe(500);
    expect(res.data.data.shipping).toBe(60);
    expect(res.data.data.tax).toBeCloseTo(89.6, 1);
    expect(res.data.data.total).toBeCloseTo(649.6, 1);
  });
});
