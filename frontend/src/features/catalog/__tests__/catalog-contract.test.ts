/**
 * Catalog and storefront contract tests
 * - Product list/search/filter/sort/featured
 * - Product detail by slug + 404
 * - Reviews CRUD
 * - Categories
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

describe('Catalog: product list', () => {
  it('GET /products returns paginated products', async () => {
    const res = await api.get('/products');
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
    expect(res.data.data.meta.total).toBeGreaterThan(0);
  });

  it('GET /products?search=poondu filters by search', async () => {
    const res = await api.get('/products', { params: { search: 'poondu' } });
    expect(res.status).toBe(200);
    expect(res.data.data.data[0].name).toContain('Poondu');
  });

  it('GET /products?search=nonexistent returns empty', async () => {
    const res = await api.get('/products', { params: { search: 'nonexistent' } });
    expect(res.data.data.data).toHaveLength(0);
  });

  it('GET /products/featured returns featured products', async () => {
    const res = await api.get('/products/featured');
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
  });

  it('GET /products/search handles query', async () => {
    const res = await api.get('/products/search', { params: { q: 'poondu' } });
    expect(res.status).toBe(200);
  });
});

describe('Catalog: product detail', () => {
  it('GET /products/{slug} returns product', async () => {
    const res = await api.get('/products/poondu-thokku');
    expect(res.status).toBe(200);
    const p = res.data.data;
    expect(p.slug).toBe('poondu-thokku');
    expect(p.variants).toBeInstanceOf(Array);
    expect(p.images).toBeInstanceOf(Array);
    expect(p.tags).toBeInstanceOf(Array);
  });

  it('GET /products/nonexistent returns 404', async () => {
    try {
      await api.get('/products/nonexistent');
      expect.unreachable('should 404');
    } catch (e: any) {
      expect(e.response.status).toBe(404);
    }
  });
});

describe('Catalog: categories', () => {
  it('GET /categories returns categories', async () => {
    const res = await api.get('/categories');
    expect(res.status).toBe(200);
    expect(res.data.data.data[0].slug).toBe('pickles');
  });

  it('GET /categories/{slug} returns single category', async () => {
    const res = await api.get('/categories/pickles');
    expect(res.status).toBe(200);
  });
});

describe('Catalog: reviews', () => {
  it('GET /products/{id}/reviews returns reviews (public)', async () => {
    const res = await api.get('/products/1/reviews');
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
  });

  it('POST /products/{id}/reviews creates review (auth required)', async () => {
    login();
    const res = await api.post('/products/1/reviews', {
      rating: 5, title: 'Amazing', body: 'Very tasty pickle',
    });
    expect(res.status).toBe(200);
  });

  it('POST /products/{id}/reviews fails without auth', async () => {
    try {
      await api.post('/products/1/reviews', { rating: 5, body: 'test' });
      expect.unreachable('should 401');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  it('PUT /reviews/{id} updates review (auth required)', async () => {
    login();
    const res = await api.put('/reviews/1', { rating: 4, body: 'Updated review' });
    expect(res.status).toBe(200);
  });

  it('DELETE /reviews/{id} deletes review (auth required)', async () => {
    login();
    const res = await api.delete('/reviews/1');
    expect(res.status).toBe(200);
  });

  it('DELETE /reviews/{id} fails without auth', async () => {
    try {
      await api.delete('/reviews/1');
      expect.unreachable('should 401');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });
});
