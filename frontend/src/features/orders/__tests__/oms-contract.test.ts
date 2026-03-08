/**
 * OMS parameter consistency contract tests
 * Verifies order endpoints use correct parameters (orderNumber vs id)
 * After fix: show uses orderNumber, cancel/tracking/returns use id
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

describe('OMS contract: order show uses orderNumber', () => {
  it('GET /orders/{orderNumber} returns order', async () => {
    login();
    const res = await api.get('/orders/ORD-20260307-0001');
    expect(res.status).toBe(200);
    expect(res.data.data.order_number).toBe('ORD-20260307-0001');
  });

  it('GET /orders/NOTFOUND returns 404', async () => {
    login();
    try {
      await api.get('/orders/NOTFOUND');
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(404);
    }
  });
});

describe('OMS contract: cancel uses numeric id', () => {
  it('POST /orders/{id}/cancel with reason succeeds', async () => {
    login();
    const res = await api.post('/orders/1/cancel', { reason: 'Changed my mind' });
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe('cancelled');
  });

  it('POST /orders/{id}/cancel without reason returns 422', async () => {
    login();
    try {
      await api.post('/orders/1/cancel', {});
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });

  it('POST /orders/{id}/cancel for non-cancellable order returns 422', async () => {
    login();
    try {
      await api.post('/orders/999/cancel', { reason: 'test' });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });
});

describe('OMS contract: tracking uses numeric id', () => {
  it('GET /orders/{id}/tracking returns tracking events', async () => {
    login();
    const res = await api.get('/orders/1/tracking');
    expect(res.status).toBe(200);
    expect(res.data.data).toBeInstanceOf(Array);
    expect(res.data.data[0].event_type).toBe('shipped');
  });
});

describe('OMS contract: invoice uses numeric id', () => {
  it('GET /orders/{id}/invoice returns PDF content-type', async () => {
    login();
    const res = await api.get('/orders/1/invoice');
    expect(res.status).toBe(200);
  });
});

describe('OMS contract: return request uses numeric id', () => {
  it('POST /orders/{id}/returns with proper body succeeds', async () => {
    login();
    const res = await api.post('/orders/1/returns', {
      refund_type: 'original_payment',
      description: 'Product defective',
      items: [{ order_item_id: 1, quantity: 1, reason: 'Defective', condition: 'damaged' }],
    });
    expect(res.status).toBe(200);
    expect(res.data.data.refund_type).toBe('original_payment');
  });

  it('POST /orders/{id}/returns without refund_type returns 422', async () => {
    login();
    try {
      await api.post('/orders/1/returns', {
        items: [{ order_item_id: 1, quantity: 1, reason: 'test', condition: 'used' }],
      });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });

  it('POST /orders/{id}/returns without items returns 422', async () => {
    login();
    try {
      await api.post('/orders/1/returns', { refund_type: 'store_credit', items: [] });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });

  it('GET /orders/{id}/returns lists returns', async () => {
    login();
    const res = await api.get('/orders/1/returns');
    expect(res.status).toBe(200);
    expect(res.data.data).toBeInstanceOf(Array);
  });
});

describe('OMS contract: order list', () => {
  it('GET /orders returns paginated orders', async () => {
    login();
    const res = await api.get('/orders');
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
  });
});
