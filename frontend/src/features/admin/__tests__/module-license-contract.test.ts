/**
 * Module license management contract tests
 * - Admin: read-only + activation request
 * - IT User (super_admin): full lifecycle control
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/msw-server';
import { api } from '@/lib/api/client';
import { store } from '@/app/store';
import { clearCredentials, setCredentials } from '@/features/auth/store/authSlice';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { server.resetHandlers(); store.dispatch(clearCredentials()); });
afterAll(() => server.close());

function loginAdmin() {
  store.dispatch(setCredentials({
    accessToken: 'admin-token',
    user: { id: 99, name: 'Admin', email: 'admin@example.com', role: 'admin' },
  }));
}

function loginItUser() {
  store.dispatch(setCredentials({
    accessToken: 'super-admin-token',
    user: { id: 100, name: 'IT User', email: 'it@example.com', role: 'super_admin' },
  }));
}

describe('Module licenses: admin read-only', () => {
  it('GET /admin/modules returns modules', async () => {
    loginAdmin();
    const res = await api.get('/admin/modules');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.data.data)).toBe(true);
    expect(res.data.data.data.length).toBeGreaterThan(0);
  });

  it('GET /admin/modules/{id} masks license key for admin', async () => {
    loginAdmin();
    const res = await api.get('/admin/modules/1');
    expect(res.status).toBe(200);
    expect(String(res.data.data.license_key)).toMatch(/\*+/);
  });

  it('POST /admin/modules is forbidden for admin', async () => {
    loginAdmin();
    await expect(api.post('/admin/modules', {
      module_code: 'coupon_engine',
      module_name: 'Coupon Engine',
    })).rejects.toMatchObject({
      response: { status: 403 },
    });
  });

  it('POST /admin/modules/{id}/activation-request works for admin', async () => {
    loginAdmin();
    const res = await api.post('/admin/modules/2/activation-request', { reason: 'Required for upcoming release' });
    expect(res.status).toBe(200);
    expect(res.data.data.module_id).toBe(2);
  });
});

describe('Module licenses: IT User full control', () => {
  it('POST /admin/modules creates module', async () => {
    loginItUser();
    const res = await api.post('/admin/modules', {
      module_code: 'coupon_engine',
      module_name: 'Coupon Engine',
      license_type: 'annual',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.module_code).toBe('coupon_engine');
  });

  it('PUT /admin/modules/{id} updates module', async () => {
    loginItUser();
    const res = await api.put('/admin/modules/1', {
      module_name: 'Payment Gateway Pro',
      vendor_name: 'Razorpay',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.module_name).toBe('Payment Gateway Pro');
  });

  it('PUT /admin/modules/{id}/toggle activates or deactivates module', async () => {
    loginItUser();
    const res = await api.put('/admin/modules/2/toggle', { is_enabled: true });
    expect(res.status).toBe(200);
    expect(res.data.data.is_enabled).toBe(true);
  });

  it('POST /admin/modules/{id}/validate-license validates license state', async () => {
    loginItUser();
    const res = await api.post('/admin/modules/1/validate-license', { license_key: 'PAY-KEY-9999' });
    expect(res.status).toBe(200);
    expect(res.data.data.valid).toBe(true);
  });

  it('PUT /admin/modules/{id}/credentials stores integration credentials', async () => {
    loginItUser();
    const res = await api.put('/admin/modules/1/credentials', {
      config_json: { api_key: 'abc', secret: 'xyz' },
      integration_status: 'configured',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.has_credentials).toBe(true);
    expect(res.data.data.integration_status).toBe('configured');
  });

  it('GET /admin/modules/{id}/health returns health checks', async () => {
    loginItUser();
    const res = await api.get('/admin/modules/1/health');
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBeDefined();
    expect(Array.isArray(res.data.data.checks)).toBe(true);
  });
});
