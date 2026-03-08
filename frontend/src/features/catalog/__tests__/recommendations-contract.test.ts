/**
 * BACKLOG COVERAGE — Recommendations and Recently Viewed contract tests
 * Status: API implemented, but product detail UI shows static related products (backlog item)
 * These tests verify the API contract layer is correct.
 * Verifies:
 * - GET /products/recommendations is not shadowed by /products/{slug} (Bug #9 fix)
 * - Accepts product_id, category_id, limit params
 * - Recently viewed localStorage CRUD
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/msw-server';
import { api } from '@/lib/api/client';
import { store } from '@/app/store';
import { clearCredentials } from '@/features/auth/store/authSlice';
import {
  addToRecentlyViewed,
  getRecentlyViewed,
  clearRecentlyViewed,
} from '@/features/catalog/recentlyViewed';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  store.dispatch(clearCredentials());
  clearRecentlyViewed();
});
afterAll(() => server.close());

describe('Recommendations: GET /products/recommendations', () => {
  it('returns recommendations (public, no auth required)', async () => {
    const res = await api.get('/products/recommendations');
    expect(res.status).toBe(200);
    expect(res.data.data).toBeInstanceOf(Array);
    expect(res.data.data.length).toBeGreaterThan(0);
    const item = res.data.data[0];
    expect(item.name).toBeDefined();
    expect(item.slug).toBeDefined();
    expect(item.price).toBeDefined();
  });

  it('respects limit param', async () => {
    const res = await api.get('/products/recommendations', { params: { limit: 2 } });
    expect(res.status).toBe(200);
    expect(res.data.data.length).toBe(2);
  });

  it('accepts product_id and category_id params', async () => {
    const res = await api.get('/products/recommendations', {
      params: { product_id: 1, category_id: 1, limit: 3 },
    });
    expect(res.status).toBe(200);
    expect(res.data.data.length).toBe(3);
  });

  it('is NOT shadowed by /products/{slug} (returns recommendations, not product detail)', async () => {
    const res = await api.get('/products/recommendations');
    // If shadowed, would return a single product object; should be an array
    expect(res.data.data).toBeInstanceOf(Array);
    // Verify it's recommendation data, not a product detail
    expect(res.data.data[0].slug).toMatch(/^rec-product-/);
  });
});

describe('Recently Viewed: localStorage', () => {
  it('starts empty', () => {
    expect(getRecentlyViewed()).toEqual([]);
  });

  it('adds a product', () => {
    addToRecentlyViewed({ id: 1, name: 'Poondu Thokku', slug: 'poondu-thokku', price: 250, image: null });
    const items = getRecentlyViewed();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(1);
    expect(items[0].viewedAt).toBeGreaterThan(0);
  });

  it('deduplicates by id (most recent first)', () => {
    addToRecentlyViewed({ id: 1, name: 'Poondu', slug: 'poondu', price: 250, image: null });
    addToRecentlyViewed({ id: 2, name: 'Mango', slug: 'mango', price: 300, image: null });
    addToRecentlyViewed({ id: 1, name: 'Poondu Updated', slug: 'poondu', price: 260, image: null });
    const items = getRecentlyViewed();
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe(1);
    expect(items[0].name).toBe('Poondu Updated');
    expect(items[1].id).toBe(2);
  });

  it('caps at 20 items', () => {
    for (let i = 1; i <= 25; i++) {
      addToRecentlyViewed({ id: i, name: `P${i}`, slug: `p${i}`, price: 100, image: null });
    }
    expect(getRecentlyViewed()).toHaveLength(20);
    // Most recent should be first
    expect(getRecentlyViewed()[0].id).toBe(25);
  });

  it('clearRecentlyViewed empties list', () => {
    addToRecentlyViewed({ id: 1, name: 'P', slug: 'p', price: 100, image: null });
    clearRecentlyViewed();
    expect(getRecentlyViewed()).toEqual([]);
  });
});
