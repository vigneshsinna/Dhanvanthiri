/**
 * BACKLOG COVERAGE — Wishlist contract tests
 * Status: APIs + page implemented, but not referenced in primary workflow docs
 * These tests verify the API contract layer is correct.
 * Verifies:
 * - GET/POST/DELETE /wishlist require auth
 * - POST rejects duplicates with 409
 * - Correct request/response shapes
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

describe('Wishlist: GET /wishlist', () => {
  it('returns wishlist items when authenticated', async () => {
    login();
    const res = await api.get('/wishlist');
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
    const item = res.data.data.data[0];
    expect(item.product_id).toBeDefined();
    expect(item.product).toBeDefined();
    expect(item.added_at).toBeDefined();
  });

  it('rejects unauthenticated requests', async () => {
    try {
      await api.get('/wishlist');
      expect.unreachable('should 401');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });
});

describe('Wishlist: POST /wishlist', () => {
  it('adds product to wishlist', async () => {
    login();
    const res = await api.post('/wishlist', { product_id: 1 });
    expect(res.status).toBe(200);
    expect(res.data.data.product_id).toBe(1);
  });

  it('adds product with variant_id', async () => {
    login();
    const res = await api.post('/wishlist', { product_id: 1, variant_id: 1 });
    expect(res.status).toBe(200);
    expect(res.data.data.product_id).toBe(1);
  });

  it('rejects duplicate with 409', async () => {
    login();
    try {
      await api.post('/wishlist', { product_id: 999 });
      expect.unreachable('should 409');
    } catch (e: any) {
      expect(e.response.status).toBe(409);
    }
  });

  it('rejects missing product_id', async () => {
    login();
    try {
      await api.post('/wishlist', {});
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });

  it('rejects unauthenticated requests', async () => {
    try {
      await api.post('/wishlist', { product_id: 1 });
      expect.unreachable('should 401');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });
});

describe('Wishlist: DELETE /wishlist/{id}', () => {
  it('removes item from wishlist', async () => {
    login();
    const res = await api.delete('/wishlist/1');
    expect(res.status).toBe(200);
  });

  it('rejects unauthenticated requests', async () => {
    try {
      await api.delete('/wishlist/1');
      expect.unreachable('should 401');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });
});
