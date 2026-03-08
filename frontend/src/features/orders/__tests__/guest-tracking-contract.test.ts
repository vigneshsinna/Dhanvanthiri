/**
 * BACKLOG COVERAGE — Guest order tracking contract tests
 * Status: API implemented, but UI only captures email (phone option is backlog)
 * These tests verify the API contract layer is correct.
 * Verifies:
 * - POST /orders/track requires order_number + at least one of email/phone (Bug #10 fix)
 * - 404 for unknown orders
 * - Response shape matches contract
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/msw-server';
import { api } from '@/lib/api/client';
import { store } from '@/app/store';
import { clearCredentials } from '@/features/auth/store/authSlice';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { server.resetHandlers(); store.dispatch(clearCredentials()); });
afterAll(() => server.close());

describe('Guest order tracking: POST /orders/track', () => {
  it('succeeds with order_number + email', async () => {
    const res = await api.post('/orders/track', {
      order_number: 'ORD-20260307-0001',
      email: 'guest@example.com',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.order_number).toBe('ORD-20260307-0001');
    expect(res.data.data.status).toBeDefined();
    expect(res.data.data.items).toBeInstanceOf(Array);
    expect(res.data.data.shipping_address).toBeDefined();
    expect(res.data.data.status_history).toBeInstanceOf(Array);
  });

  it('succeeds with order_number + phone', async () => {
    const res = await api.post('/orders/track', {
      order_number: 'ORD-20260307-0001',
      phone: '9876543210',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.order_number).toBe('ORD-20260307-0001');
  });

  it('succeeds with order_number + email + phone', async () => {
    const res = await api.post('/orders/track', {
      order_number: 'ORD-20260307-0001',
      email: 'guest@example.com',
      phone: '9876543210',
    });
    expect(res.status).toBe(200);
  });

  it('rejects without email or phone', async () => {
    try {
      await api.post('/orders/track', { order_number: 'ORD-20260307-0001' });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });

  it('rejects without order_number', async () => {
    try {
      await api.post('/orders/track', { email: 'guest@example.com' });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.order_number).toBeDefined();
    }
  });

  it('returns 404 for unknown order', async () => {
    try {
      await api.post('/orders/track', {
        order_number: 'NOTFOUND',
        email: 'guest@example.com',
      });
      expect.unreachable('should 404');
    } catch (e: any) {
      expect(e.response.status).toBe(404);
    }
  });

  it('is a public endpoint (no auth required)', async () => {
    // No login — should still work
    const res = await api.post('/orders/track', {
      order_number: 'ORD-20260307-0001',
      email: 'guest@example.com',
    });
    expect(res.status).toBe(200);
  });
});
