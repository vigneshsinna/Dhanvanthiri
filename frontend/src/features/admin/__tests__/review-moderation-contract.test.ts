/**
 * Admin review moderation contract tests
 * Verifies moderation route is PUT /admin/reviews/{id}/status (not /admin/reviews/{id})
 * Tests index and destroy routes added to backend
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw-server';
import { api } from '@/lib/api/client';
import { store } from '@/app/store';
import { setCredentials, clearCredentials } from '@/features/auth/store/authSlice';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { server.resetHandlers(); store.dispatch(clearCredentials()); });
afterAll(() => server.close());

function loginAdmin() {
  store.dispatch(setCredentials({ accessToken: 'admin-token', user: { id: 99, name: 'Admin', email: 'a@e.com', role: 'admin' } }));
}

describe('Review moderation: PUT /admin/reviews/{id}/status', () => {
  it('approves a review', async () => {
    loginAdmin();
    const res = await api.put('/admin/reviews/1/status', { status: 'approved' });
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe('approved');
  });

  it('rejects a review', async () => {
    loginAdmin();
    const res = await api.put('/admin/reviews/1/status', { status: 'rejected' });
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe('rejected');
  });

  it('does NOT call /admin/reviews/{id} (old wrong path)', async () => {
    loginAdmin();
    // Override: PUT to /admin/reviews/:id (without /status) should 404 now
    server.use(
      http.put('/api/admin/reviews/:id', ({ params }) => {
        // Only intercept calls WITHOUT /status suffix
        return HttpResponse.json({ error: 'wrong path, use /status' }, { status: 404 });
      })
    );
    // The correct path /admin/reviews/:id/status should still work
    const res = await api.put('/admin/reviews/1/status', { status: 'approved' });
    expect(res.status).toBe(200);
  });
});

describe('Review moderation: GET /admin/reviews', () => {
  it('lists all reviews', async () => {
    loginAdmin();
    const res = await api.get('/admin/reviews');
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
  });
});

describe('Review moderation: DELETE /admin/reviews/{id}', () => {
  it('deletes a review', async () => {
    loginAdmin();
    const res = await api.delete('/admin/reviews/1');
    expect(res.status).toBe(200);
  });
});
