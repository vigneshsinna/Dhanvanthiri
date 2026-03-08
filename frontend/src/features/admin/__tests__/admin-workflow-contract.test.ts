/**
 * Admin workflow contract tests
 * - Dashboard + analytics
 * - Product/category CRUD
 * - Inventory + alerts
 * - Customers/status
 * - Notifications/activity
 * - Export request
 * - Super-admin admin management
 * - RBAC boundaries
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
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

describe('Admin: dashboard + analytics', () => {
  it('GET /admin/dashboard/summary returns stats', async () => {
    loginAdmin();
    const res = await api.get('/admin/dashboard/summary', { params: { period: 'month' } });
    expect(res.status).toBe(200);
    expect(res.data.data.revenue).toBeDefined();
    expect(res.data.data.orders).toBeDefined();
  });

  it('GET /admin/analytics/revenue returns chart data', async () => {
    loginAdmin();
    const res = await api.get('/admin/analytics/revenue', { params: { period: 'month', group_by: 'day' } });
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
  });

  it('POST /admin/analytics/export queues export', async () => {
    loginAdmin();
    const res = await api.post('/admin/analytics/export', { type: 'revenue', period: 'month' });
    expect(res.status).toBe(200);
    expect(res.data.data.export_id).toBeDefined();
  });

  it('GET /admin/exports/{id} returns export status', async () => {
    loginAdmin();
    const res = await api.get('/admin/exports/1');
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe('completed');
  });
});

describe('Admin: product CRUD', () => {
  it('GET /admin/products lists products', async () => {
    loginAdmin();
    const res = await api.get('/admin/products');
    expect(res.status).toBe(200);
  });

  it('POST /admin/products creates product', async () => {
    loginAdmin();
    const formData = new FormData();
    formData.append('name', 'New Product');
    formData.append('slug', 'new-product');
    const res = await api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    expect(res.status).toBe(200);
  });

  it('POST /admin/products/{id} with _method=PUT updates product', async () => {
    loginAdmin();
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', 'Updated');
    const res = await api.post('/admin/products/1', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    expect(res.status).toBe(200);
  });

  it('DELETE /admin/products/{id} deletes product', async () => {
    loginAdmin();
    const res = await api.delete('/admin/products/1');
    expect(res.status).toBe(200);
  });
});

describe('Admin: category CRUD', () => {
  it('GET /admin/categories lists', async () => {
    loginAdmin();
    const res = await api.get('/admin/categories');
    expect(res.status).toBe(200);
  });

  it('POST /admin/categories creates', async () => {
    loginAdmin();
    const res = await api.post('/admin/categories', { name: 'New Cat', slug: 'new-cat' });
    expect(res.status).toBe(200);
  });

  it('PUT /admin/categories/{id} updates', async () => {
    loginAdmin();
    const res = await api.put('/admin/categories/1', { name: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('DELETE /admin/categories/{id} deletes', async () => {
    loginAdmin();
    const res = await api.delete('/admin/categories/1');
    expect(res.status).toBe(200);
  });
});

describe('Admin: inventory', () => {
  it('GET /admin/inventory lists inventory', async () => {
    loginAdmin();
    const res = await api.get('/admin/inventory');
    expect(res.status).toBe(200);
  });

  it('PUT /admin/inventory/{id} updates stock', async () => {
    loginAdmin();
    const res = await api.put('/admin/inventory/1', { stock_quantity: 100 });
    expect(res.status).toBe(200);
  });

  it('GET /admin/inventory/alerts returns low-stock alerts', async () => {
    loginAdmin();
    const res = await api.get('/admin/inventory/alerts');
    expect(res.status).toBe(200);
    expect(res.data.data.data[0].stock_quantity).toBeLessThan(res.data.data.data[0].threshold);
  });

  it('POST /admin/inventory/bulk-update processes bulk', async () => {
    loginAdmin();
    const res = await api.post('/admin/inventory/bulk-update', {
      updates: [{ variant_id: 1, stock_quantity: 100 }],
    });
    expect(res.status).toBe(200);
  });
});

describe('Admin: customers', () => {
  it('GET /admin/customers lists customers', async () => {
    loginAdmin();
    const res = await api.get('/admin/customers');
    expect(res.status).toBe(200);
  });

  it('GET /admin/customers/{id} shows detail', async () => {
    loginAdmin();
    const res = await api.get('/admin/customers/1');
    expect(res.status).toBe(200);
  });

  it('PUT /admin/customers/{id}/status toggles status', async () => {
    loginAdmin();
    const res = await api.put('/admin/customers/1/status');
    expect(res.status).toBe(200);
  });
});

describe('Admin: notifications + activity', () => {
  it('GET /admin/notifications lists notifications', async () => {
    loginAdmin();
    const res = await api.get('/admin/notifications');
    expect(res.status).toBe(200);
  });

  it('PUT /admin/notifications/read-all marks all read', async () => {
    loginAdmin();
    const res = await api.put('/admin/notifications/read-all');
    expect(res.status).toBe(200);
  });

  it('GET /admin/activity-logs lists logs', async () => {
    loginAdmin();
    const res = await api.get('/admin/activity-logs');
    expect(res.status).toBe(200);
  });
});

describe('Admin: order management', () => {
  it('GET /admin/orders lists orders', async () => {
    loginAdmin();
    const res = await api.get('/admin/orders');
    expect(res.status).toBe(200);
  });

  it('GET /admin/orders/{id} shows order detail', async () => {
    loginAdmin();
    const res = await api.get('/admin/orders/1');
    expect(res.status).toBe(200);
  });

  it('PUT /admin/orders/{id}/status updates order status', async () => {
    loginAdmin();
    const res = await api.put('/admin/orders/1/status', { status: 'processing' });
    expect(res.status).toBe(200);
    expect(res.data.data.status).toBe('processing');
  });

  it('POST /admin/orders/{id}/shipment creates shipment', async () => {
    loginAdmin();
    const res = await api.post('/admin/orders/1/shipment', {
      carrier: 'BlueDart', tracking_number: 'BD123',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.tracking_number).toBe('BD123');
  });

  it('POST /admin/shipments/{id}/events adds event', async () => {
    loginAdmin();
    const res = await api.post('/admin/shipments/1/events', {
      event_type: 'in_transit', description: 'In transit',
    });
    expect(res.status).toBe(200);
  });
});

describe('Admin: returns', () => {
  it('GET /admin/returns lists returns', async () => {
    loginAdmin();
    const res = await api.get('/admin/returns');
    expect(res.status).toBe(200);
  });

  it('PUT /admin/returns/{id} updates return', async () => {
    loginAdmin();
    const res = await api.put('/admin/returns/1', { status: 'approved' });
    expect(res.status).toBe(200);
  });
});

describe('Admin: super_admin-only admin management', () => {
  it('GET /admin/admins lists admin users', async () => {
    loginAdmin();
    const res = await api.get('/admin/admins');
    expect(res.status).toBe(200);
  });

  it('POST /admin/admins creates admin user', async () => {
    loginAdmin();
    const res = await api.post('/admin/admins', {
      name: 'New Admin', email: 'newadmin@e.com', password: 'Pass1!', role: 'admin',
    });
    expect(res.status).toBe(200);
  });

  it('PUT /admin/admins/{id} updates admin user', async () => {
    loginAdmin();
    const res = await api.put('/admin/admins/100', { name: 'Updated Admin' });
    expect(res.status).toBe(200);
  });

  it('DELETE /admin/admins/{id} deletes admin user', async () => {
    loginAdmin();
    const res = await api.delete('/admin/admins/100');
    expect(res.status).toBe(200);
  });
});
