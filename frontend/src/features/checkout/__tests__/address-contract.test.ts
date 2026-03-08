/**
 * Address contract-alignment tests
 * Verifies POST /addresses sends line1/line2 (NOT line_1/line_2)
 * Bug 11: Frontend was sending line_1/line_2 but backend expects line1/line2
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

describe('Address contract: POST /addresses uses line1/line2', () => {
  it('sends line1 (not line_1) and succeeds', async () => {
    login();
    const res = await api.post('/addresses', {
      recipient_name: 'Lakshmi',
      phone: '9876543210',
      line1: '42 Temple Street',
      line2: 'Near Ganesh Temple',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postal_code: '600001',
      country_code: 'IN',
    });
    expect(res.status).toBe(200);
  });

  it('rejects line_1 (old wrong field name) with 422', async () => {
    login();
    try {
      await api.post('/addresses', {
        recipient_name: 'Test',
        phone: '9876543210',
        line_1: '42 Temple Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600001',
        country_code: 'IN',
      });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });

  it('rejects missing line1 with 422', async () => {
    login();
    try {
      await api.post('/addresses', {
        recipient_name: 'Test',
        phone: '9876543210',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600001',
        country_code: 'IN',
      });
      expect.unreachable('should have thrown');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.line1).toBeDefined();
    }
  });
});

describe('Address contract: GET /addresses returns line1/line2', () => {
  it('response contains line1 (not line_1)', async () => {
    login();
    const res = await api.get('/addresses');
    expect(res.status).toBe(200);
    const addr = res.data.data.data[0];
    expect(addr.line1).toBeDefined();
    expect(addr.line_1).toBeUndefined();
  });
});

describe('Address contract: CRUD operations', () => {
  it('GET /addresses/{id} returns address', async () => {
    login();
    const res = await api.get('/addresses/1');
    expect(res.status).toBe(200);
    expect(res.data.data.line1).toBe('42 Temple Street');
  });

  it('PUT /addresses/{id} updates address', async () => {
    login();
    const res = await api.put('/addresses/1', { line1: '99 New Street' });
    expect(res.status).toBe(200);
  });

  it('DELETE /addresses/{id} removes address', async () => {
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
