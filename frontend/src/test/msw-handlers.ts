/**
 * MSW (Mock Service Worker) handlers for contract-alignment testing.
 * These handlers mirror the real backend API routes and return
 * predictable data for frontend integration tests.
 */
import { http, HttpResponse } from 'msw';

// ── Helpers ──
const BASE = '/api';
function ok(data: unknown, message = 'Success') {
  return HttpResponse.json({ success: true, message, data });
}
function err(status: number, message: string, errors: Record<string, string[]> = {}) {
  return HttpResponse.json({ success: false, message, errors }, { status });
}

// ── Seed data ──
export const seedUser = {
  id: 1, name: 'Lakshmi', email: 'lakshmi@example.com', role: 'customer',
  phone: '9876543210', avatar_url: null, email_verified_at: '2026-01-01T00:00:00Z',
};
export const seedAdmin = { ...seedUser, id: 99, name: 'Admin', email: 'admin@example.com', role: 'admin' };
export const seedItUser = { ...seedUser, id: 100, name: 'IT User', email: 'it@example.com', role: 'super_admin' };

export const seedProduct = {
  id: 1, slug: 'poondu-thokku', name: 'Poondu Thokku', description: 'Garlic thokku',
  base_price: 250, sale_price: null, is_active: true, category_id: 1,
  images: [{ id: 1, url: '/images/poondu.jpg', alt: 'Poondu Thokku', sort_order: 0 }],
  variants: [{ id: 1, name: '200g', sku: 'PT-200', price: 250, stock_quantity: 50 }],
  tags: ['pickle'], avg_rating: 4.5, review_count: 3,
};

export const seedCategory = { id: 1, name: 'Pickles', slug: 'pickles', description: 'Traditional pickles', product_count: 5 };

export const seedAddress = {
  id: 1, label: 'Home', recipient_name: 'Lakshmi', phone: '9876543210',
  line1: '42 Temple Street', line2: null, city: 'Chennai', state: 'Tamil Nadu',
  postal_code: '600001', country_code: 'IN', is_default: true,
};

export const seedCartItem = {
  id: 1, product_id: 1, variant_id: 1, quantity: 2,
  product_name: 'Poondu Thokku', variant_name: '200g',
  unit_price: 250, total_price: 500, image_url: '/images/poondu.jpg',
};

export const seedCart = {
  id: 1, items: [seedCartItem], subtotal: 500, discount: 0, shipping: 60,
  tax: 89.6, total: 649.6, coupon: null,
};

export const seedOrder = {
  id: 1, order_number: 'ORD-20260307-0001', status: 'confirmed',
  subtotal: 500, discount: 0, shipping: 60, tax: 89.6, total: 649.6,
  items: [{ id: 1, product_name: 'Poondu Thokku', variant_name: '200g', sku: 'PT-200', quantity: 2, unit_price: 250, total_price: 500 }],
  shipping_address: seedAddress, created_at: '2026-03-07T10:00:00Z',
};

export const seedReview = {
  id: 1, product_id: 1, user_id: 1, rating: 5, title: 'Excellent', body: 'Great taste',
  status: 'pending', user: { id: 1, name: 'Lakshmi' }, product: { id: 1, name: 'Poondu Thokku' },
};

export const seedFaq = { id: 1, question: 'How long does it last?', answer: '6 months', category: 'General', sort_order: 0, is_active: true };
export const seedPost = { id: 1, title: 'Health Benefits', slug: 'health-benefits', excerpt: 'Learn about...', body: '<p>Long article</p>', published_at: '2026-02-01', author: 'Admin' };
export const seedPage = {
  id: 1,
  title: 'Terms & Conditions',
  slug: 'terms-and-conditions',
  excerpt: 'Rules, responsibilities, payments, and customer support terms.',
  effective_date: '2026-03-08',
  content: '<h2>Terms & Conditions</h2><p>These terms govern access to and use of the Dhanvanthiri Foods website and services.</p>',
  meta_title: 'Terms & Conditions | Dhanvanthiri Foods',
  meta_description: 'Read the terms and conditions for Dhanvanthiri Foods website usage, orders, payments, and policies.',
  status: 'published',
  is_active: true,
};
export const seedBanner = { id: 1, title: 'Sale', image_url: '/images/sale.jpg', link: '/products', position: 'home_hero', is_active: true };

export const seedShippingMethod = { id: 1, name: 'Standard', price: 60, estimated_days: '5-7' };

interface SeedFeatureModule {
  id: number;
  module_code: string;
  module_name: string;
  description: string | null;
  is_enabled: boolean;
  license_type: string | null;
  license_key: string | null;
  valid_from: string | null;
  valid_to: string | null;
  integration_status: 'not_configured' | 'configured' | 'healthy' | 'degraded' | 'failed';
  health_status: 'unknown' | 'healthy' | 'degraded' | 'failed';
  last_validated_at: string | null;
  vendor_name: string | null;
  notes: string | null;
  config_json: Record<string, unknown>;
  has_credentials: boolean;
  activated_by: number | null;
  activated_by_name: string | null;
  activated_on: string | null;
  updated_by: number | null;
  updated_by_name: string | null;
  updated_at: string | null;
}

let seedModules: SeedFeatureModule[] = [
  {
    id: 1,
    module_code: 'payment_gateway',
    module_name: 'Payment Gateway',
    description: 'Online payment providers',
    is_enabled: true,
    license_type: 'annual',
    license_key: 'PAY-KEY-1234',
    valid_from: '2026-01-01',
    valid_to: '2026-12-31',
    integration_status: 'healthy',
    health_status: 'healthy',
    last_validated_at: '2026-03-01T10:00:00Z',
    vendor_name: 'Razorpay',
    notes: 'Primary payment integration',
    config_json: { key_id: 'rzp_test', key_secret: '***' },
    has_credentials: true,
    activated_by: 100,
    activated_by_name: 'IT User',
    activated_on: '2026-01-01T09:30:00Z',
    updated_by: 100,
    updated_by_name: 'IT User',
    updated_at: '2026-03-07T12:00:00Z',
  },
  {
    id: 2,
    module_code: 'recommendation_engine',
    module_name: 'Recommendation Engine',
    description: 'Cross-sell and recently viewed recommendations',
    is_enabled: false,
    license_type: 'trial',
    license_key: 'REC-TRIAL-7777',
    valid_from: '2026-02-01',
    valid_to: '2026-05-01',
    integration_status: 'not_configured',
    health_status: 'unknown',
    last_validated_at: null,
    vendor_name: 'Internal',
    notes: null,
    config_json: {},
    has_credentials: false,
    activated_by: null,
    activated_by_name: null,
    activated_on: null,
    updated_by: 100,
    updated_by_name: 'IT User',
    updated_at: '2026-03-06T08:00:00Z',
  },
];

function authRole(request: Request): 'super_admin' | 'admin' | 'customer' | 'guest' {
  const header = request.headers.get('Authorization') || '';
  if (header === 'Bearer super-admin-token') return 'super_admin';
  if (header === 'Bearer admin-token') return 'admin';
  if (header.startsWith('Bearer ')) return 'customer';
  return 'guest';
}

function maskLicense(licenseKey: string | null): string | null {
  if (!licenseKey) return null;
  const visible = licenseKey.slice(-4);
  return `${'*'.repeat(Math.max(4, licenseKey.length - 4))}${visible}`;
}

function serializeModuleForRole(module: SeedFeatureModule, role: ReturnType<typeof authRole>) {
  if (role === 'super_admin') {
    return module;
  }

  return {
    ...module,
    license_key: maskLicense(module.license_key),
    config_json: null,
  };
}

const INTEGRATION_STATUSES = ['not_configured', 'configured', 'healthy', 'degraded', 'failed'] as const;
type IntegrationStatus = SeedFeatureModule['integration_status'];

function toIntegrationStatus(value: unknown, fallback: IntegrationStatus = 'not_configured'): IntegrationStatus {
  const candidate = String(value ?? '');
  if (INTEGRATION_STATUSES.includes(candidate as IntegrationStatus)) {
    return candidate as IntegrationStatus;
  }

  return fallback;
}

// ── Auth handlers ──
export const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    if (body.email === 'locked@example.com') return err(429, 'Too many attempts. Please try again later.');
    if (body.email !== 'lakshmi@example.com' || body.password !== 'Password1!') return err(401, 'Invalid credentials');
    return ok({ access_token: 'test-jwt-token', user: seedUser });
  }),
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    if (body.email === 'existing@example.com') return err(422, 'Validation failed', { email: ['The email has already been taken.'] });
    return ok({ access_token: 'new-user-token', user: { ...seedUser, name: body.name, email: body.email } }, 'Registered');
  }),
  http.post(`${BASE}/auth/logout`, () => ok(null, 'Logged out')),
  http.post(`${BASE}/auth/refresh`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    return ok({ access_token: 'refreshed-token' });
  }),
  http.get(`${BASE}/auth/me`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    if (auth === 'Bearer super-admin-token') return ok(seedItUser);
    if (auth === 'Bearer admin-token') return ok(seedAdmin);
    return ok(seedUser);
  }),
  http.post(`${BASE}/auth/forgot-password`, () => ok(null, 'Reset link sent')),
  http.post(`${BASE}/auth/reset-password`, () => ok(null, 'Password reset')),
];

// ── Profile handlers ──
export const profileHandlers = [
  http.put(`${BASE}/profile`, async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    return ok({ ...seedUser, ...body });
  }),
  http.put(`${BASE}/profile/password`, async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    if (body.current_password !== 'Password1!') return err(422, 'Validation failed', { current_password: ['Current password is incorrect'] });
    return ok(null, 'Password changed');
  }),
  http.post(`${BASE}/profile/avatar`, () => ok({ avatar_url: '/images/avatar-new.jpg' })),
  http.delete(`${BASE}/profile`, () => ok(null, 'Account deleted')),
];

// ── Catalog handlers ──
export const catalogHandlers = [
  http.get(`${BASE}/products`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const products = search ? [seedProduct].filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : [seedProduct];
    return ok({ data: products, meta: { current_page: 1, last_page: 1, total: products.length } });
  }),
  http.get(`${BASE}/products/featured`, () => ok({ data: [seedProduct] })),
  http.get(`${BASE}/products/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const match = [seedProduct].filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    return ok({ data: match, meta: { total: match.length } });
  }),
  http.get(`${BASE}/products/:slug`, ({ params }) => {
    if (params.slug === 'nonexistent') return err(404, 'Product not found');
    return ok(seedProduct);
  }),
  http.get(`${BASE}/products/:id/reviews`, () => ok({ data: [seedReview], meta: { current_page: 1, last_page: 1, total: 1 } })),
  http.post(`${BASE}/products/:id/reviews`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    const body = await request.json() as Record<string, unknown>;
    return ok({ ...seedReview, ...body, id: 2 }, 'Review submitted');
  }),
  http.put(`${BASE}/reviews/:id`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    const body = await request.json() as Record<string, unknown>;
    return ok({ ...seedReview, ...body });
  }),
  http.delete(`${BASE}/reviews/:id`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    return ok(null, 'Review deleted');
  }),
  http.get(`${BASE}/categories`, () => ok({ data: [seedCategory] })),
  http.get(`${BASE}/categories/:slug`, () => ok(seedCategory)),
];

// ── Cart handlers ──
export const cartHandlers = [
  http.get(`${BASE}/cart`, () => ok(seedCart)),
  http.post(`${BASE}/cart/items`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newItem = { ...seedCartItem, id: 2, product_id: body.product_id, quantity: body.quantity };
    return ok({ ...seedCart, items: [...seedCart.items, newItem] });
  }),
  http.put(`${BASE}/cart/items/:id`, async ({ request }) => {
    const body = await request.json() as { quantity: number };
    if (body.quantity > 99) return err(422, 'Exceeds stock', { quantity: ['Not enough stock'] });
    return ok({ ...seedCart, items: [{ ...seedCartItem, quantity: body.quantity }] });
  }),
  http.delete(`${BASE}/cart/items/:id`, () => ok({ ...seedCart, items: [] })),
  http.delete(`${BASE}/cart`, () => ok({ ...seedCart, items: [], subtotal: 0, total: 0 })),
  http.post(`${BASE}/cart/coupon`, async ({ request }) => {
    const body = await request.json() as { code: string };
    if (body.code === 'EXPIRED') return err(422, 'Coupon expired', { code: ['This coupon has expired'] });
    if (body.code === 'INVALID') return err(422, 'Invalid coupon', { code: ['Invalid coupon code'] });
    if (body.code === 'MINORDER') return err(422, 'Minimum not met', { code: ['Minimum order amount ₹1000 required'] });
    return ok({ ...seedCart, discount: 50, total: 599.6, coupon: { code: body.code, discount: 50 } });
  }),
  http.delete(`${BASE}/cart/coupon`, () => ok(seedCart)),
  http.get(`${BASE}/cart/shipping-rates`, () => ok({ data: [seedShippingMethod, { id: 2, name: 'Express', price: 120, estimated_days: '2-3' }] })),
  http.post(`${BASE}/cart/merge`, () => ok(seedCart)),
];

// ── Address handlers ──
export const addressHandlers = [
  http.get(`${BASE}/addresses`, () => ok({ data: [seedAddress] })),
  http.post(`${BASE}/addresses`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    if (!body.line1) return err(422, 'Validation failed', { line1: ['The line1 field is required.'] });
    if (body.line_1 !== undefined) return err(422, 'Validation failed', { line_1: ['Unknown field. Did you mean line1?'] });
    return ok({ ...seedAddress, id: 2, ...body }, 'Address created');
  }),
  http.get(`${BASE}/addresses/:id`, () => ok(seedAddress)),
  http.put(`${BASE}/addresses/:id`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return ok({ ...seedAddress, ...body });
  }),
  http.delete(`${BASE}/addresses/:id`, () => ok(null, 'Address deleted')),
  http.put(`${BASE}/addresses/:id/default`, () => ok({ ...seedAddress, is_default: true })),
];

// ── Checkout handlers ──
export const checkoutHandlers = [
  http.post(`${BASE}/checkout/validate`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    const body = await request.json() as Record<string, unknown>;
    if (!body.address_id) return err(422, 'Validation failed', { address_id: ['The address id field is required.'] });
    if (!body.shipping_method_id) return err(422, 'Validation failed', { shipping_method_id: ['The shipping method id field is required.'] });
    return ok({ valid: true });
  }),
  http.post(`${BASE}/checkout/summary`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    const body = await request.json() as Record<string, unknown>;
    if (!body.address_id || !body.shipping_method_id) return err(422, 'Validation failed', { address_id: ['Required'] });
    return ok({ subtotal: 500, discount: 0, shipping: 60, tax: 89.6, total: 649.6 });
  }),
];

// ── Payment handlers ──
const usedIdempotencyKeys = new Set<string>();
export const paymentHandlers = [
  http.post(`${BASE}/payments/intent`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (idempotencyKey && usedIdempotencyKeys.has(idempotencyKey)) {
      return ok({ order_id: 1, razorpay_order_id: 'order_cached', razorpay_key_id: 'rzp_test', amount: 64960, currency: 'INR' });
    }
    if (idempotencyKey) usedIdempotencyKeys.add(idempotencyKey);
    const body = await request.json() as Record<string, unknown>;
    if (!body.gateway || !body.shipping_address_id || !body.shipping_method_id) return err(422, 'Validation failed');
    return ok({ order_id: 1, razorpay_order_id: 'order_abc123', razorpay_key_id: 'rzp_test', amount: 64960, currency: 'INR' });
  }),
  http.post(`${BASE}/payments/confirm`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    if (!body.order_id || !body.gateway_payment_id || !body.gateway_order_id || !body.signature) {
      return err(422, 'Validation failed');
    }
    if (body.signature === 'bad-signature') return err(400, 'Payment verification failed');
    return ok({ order: seedOrder, payment: { status: 'captured' } });
  }),
  http.get(`${BASE}/payments/:orderId`, () => ok({ order_id: 1, status: 'captured', amount: 64960, gateway: 'razorpay' })),
];

// ── Order handlers ──
export const orderHandlers = [
  http.get(`${BASE}/orders`, () => ok({ data: [seedOrder], meta: { current_page: 1, last_page: 1, total: 1 } })),
  http.get(`${BASE}/orders/:orderNumber`, ({ params }) => {
    if (params.orderNumber === 'NOTFOUND') return err(404, 'Order not found');
    return ok(seedOrder);
  }),
  http.post(`${BASE}/orders/:id/cancel`, async ({ request, params }) => {
    const body = await request.json() as { reason?: string };
    if (!body.reason) return err(422, 'Validation failed', { reason: ['Reason is required'] });
    const id = Number(params.id);
    if (id === 999) return err(422, 'Cannot cancel', { status: ['Order cannot be cancelled in this state'] });
    return ok({ ...seedOrder, status: 'cancelled' });
  }),
  http.get(`${BASE}/orders/:id/invoice`, () => new HttpResponse('%PDF-1.4', { status: 200, headers: { 'Content-Type': 'application/pdf' } })),
  http.get(`${BASE}/orders/:id/tracking`, () => ok([{ id: 1, event_type: 'shipped', description: 'Package shipped', location: 'Chennai', created_at: '2026-03-07T12:00:00Z' }])),
  http.post(`${BASE}/orders/:id/returns`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    const body = await request.json() as Record<string, unknown>;
    if (!body.refund_type) return err(422, 'Validation failed', { refund_type: ['Required'] });
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) return err(422, 'Validation failed', { items: ['At least one item required'] });
    return ok({ id: 1, status: 'requested', ...body }, 'Return request created');
  }),
  http.get(`${BASE}/orders/:id/returns`, () => ok([])),
];

// ── CMS handlers ──
export const cmsHandlers = [
  http.get(`${BASE}/pages/:slug`, ({ params }) => {
    if (params.slug === 'missing') return err(404, 'Page not found');
    return ok({ ...seedPage, slug: params.slug });
  }),
  http.get(`${BASE}/posts`, () => ok({ data: [seedPost], meta: { current_page: 1, last_page: 1, total: 1 } })),
  http.get(`${BASE}/posts/:slug`, () => ok(seedPost)),
  http.get(`${BASE}/posts/category/:slug`, () => ok({ data: [seedPost] })),
  http.get(`${BASE}/banners`, () => ok({ data: [seedBanner] })),
  http.get(`${BASE}/faqs`, () => ok({ data: [seedFaq] })),
  http.get(`${BASE}/menus/:location`, () => ok({ data: { items: [{ label: 'Home', url: '/' }, { label: 'Products', url: '/products' }] } })),
  http.get(`${BASE}/sitemap.xml`, () => new HttpResponse('<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>', { headers: { 'Content-Type': 'application/xml' } })),
  http.get(`${BASE}/robots.txt`, () => new HttpResponse('User-agent: *\nAllow: /', { headers: { 'Content-Type': 'text/plain' } })),
];

// ── Admin handlers ──
export const adminHandlers = [
  // Dashboard
  http.get(`${BASE}/admin/dashboard/summary`, () => ok({ revenue: 25000, orders: 42, customers: 18, avg_order_value: 595 })),
  http.get(`${BASE}/admin/analytics/revenue`, () => ok({ data: [{ date: '2026-03-01', revenue: 5000 }] })),
  http.get(`${BASE}/admin/analytics/orders`, () => ok({ data: [{ date: '2026-03-01', count: 10 }] })),
  http.get(`${BASE}/admin/analytics/customers`, () => ok({ data: [{ date: '2026-03-01', new: 3 }] })),
  http.get(`${BASE}/admin/analytics/products`, () => ok({ data: [{ product_id: 1, name: 'Poondu Thokku', sold: 25, revenue: 6250 }] })),
  http.post(`${BASE}/admin/analytics/export`, () => ok({ export_id: 1, status: 'queued' })),
  http.get(`${BASE}/admin/exports/:id`, () => ok({ id: 1, status: 'completed', download_url: '/exports/1.csv' })),

  // Products
  http.get(`${BASE}/admin/products`, () => ok({ data: [seedProduct], meta: { total: 1 } })),
  http.post(`${BASE}/admin/products`, () => ok(seedProduct, 'Product created')),
  http.post(`${BASE}/admin/products/:id`, () => ok(seedProduct, 'Product updated')), // PUT override
  http.delete(`${BASE}/admin/products/:id`, () => ok(null, 'Product deleted')),
  http.post(`${BASE}/admin/products/:id/images`, () => ok([{ id: 2, url: '/images/new.jpg' }])),
  http.delete(`${BASE}/admin/products/images/:id`, () => ok(null, 'Image deleted')),
  http.put(`${BASE}/admin/products/:id/variants`, () => ok([{ id: 1, name: '200g', price: 250 }])),

  // Categories
  http.get(`${BASE}/admin/categories`, () => ok({ data: [seedCategory] })),
  http.post(`${BASE}/admin/categories`, () => ok(seedCategory, 'Category created')),
  http.put(`${BASE}/admin/categories/:id`, () => ok(seedCategory, 'Category updated')),
  http.delete(`${BASE}/admin/categories/:id`, () => ok(null, 'Category deleted')),

  // Orders
  http.get(`${BASE}/admin/orders`, () => ok({ data: [seedOrder], meta: { total: 1 } })),
  http.get(`${BASE}/admin/orders/:id`, () => ok(seedOrder)),
  http.put(`${BASE}/admin/orders/:id/status`, async ({ request }) => {
    const body = await request.json() as { status: string };
    return ok({ ...seedOrder, status: body.status });
  }),

  // Shipments
  http.post(`${BASE}/admin/orders/:id/shipment`, () => ok({ id: 1, carrier: 'BlueDart', tracking_number: 'BD123' })),
  http.put(`${BASE}/admin/shipments/:id`, () => ok({ id: 1, carrier: 'BlueDart' })),
  http.post(`${BASE}/admin/shipments/:id/events`, () => ok({ id: 1, event_type: 'in_transit' })),

  // Refunds
  http.post(`${BASE}/admin/orders/:id/refund`, () => ok({ id: 1, amount: 64960, status: 'processed' })),

  // Payments
  http.get(`${BASE}/admin/payments`, () => ok({ data: [{ id: 1, order_id: 1, amount: 64960, status: 'captured' }] })),

  // Reviews
  http.get(`${BASE}/admin/reviews`, () => ok({ data: [seedReview], meta: { total: 1 } })),
  http.put(`${BASE}/admin/reviews/:id/status`, async ({ request }) => {
    const body = await request.json() as { status: string };
    return ok({ ...seedReview, status: body.status });
  }),
  http.delete(`${BASE}/admin/reviews/:id`, () => ok(null, 'Review deleted')),

  // Returns
  http.get(`${BASE}/admin/returns`, () => ok({ data: [] })),
  http.put(`${BASE}/admin/returns/:id`, () => ok({ id: 1, status: 'approved' })),

  // Customers
  http.get(`${BASE}/admin/customers`, () => ok({ data: [{ id: 1, name: 'Lakshmi', email: 'lakshmi@example.com', status: 'active' }] })),
  http.get(`${BASE}/admin/customers/:id`, () => ok({ id: 1, name: 'Lakshmi', email: 'lakshmi@example.com', orders_count: 3 })),
  http.put(`${BASE}/admin/customers/:id`, () => ok({ id: 1, name: 'Lakshmi' })),
  http.put(`${BASE}/admin/customers/:id/status`, () => ok({ id: 1, status: 'suspended' })),

  // Inventory
  http.get(`${BASE}/admin/inventory`, () => ok({ data: [{ id: 1, variant_id: 1, sku: 'PT-200', stock_quantity: 50 }] })),
  http.put(`${BASE}/admin/inventory/:id`, () => ok({ id: 1, stock_quantity: 100 })),
  http.get(`${BASE}/admin/inventory/alerts`, () => ok({ data: [{ id: 2, sku: 'MTP-100', stock_quantity: 2, threshold: 10 }] })),
  http.post(`${BASE}/admin/inventory/bulk-update`, () => ok(null, 'Bulk update completed')),

  // CMS
  http.get(`${BASE}/admin/pages`, () => ok({ data: [seedPage] })),
  http.post(`${BASE}/admin/pages`, () => ok(seedPage, 'Page created')),
  http.put(`${BASE}/admin/pages/:id`, () => ok(seedPage, 'Page updated')),
  http.delete(`${BASE}/admin/pages/:id`, () => ok(null, 'Page deleted')),

  http.get(`${BASE}/admin/posts`, () => ok({ data: [seedPost] })),
  http.post(`${BASE}/admin/posts`, () => ok(seedPost, 'Post created')),
  http.put(`${BASE}/admin/posts/:id`, () => ok(seedPost, 'Post updated')),
  http.delete(`${BASE}/admin/posts/:id`, () => ok(null, 'Post deleted')),

  http.get(`${BASE}/admin/post-categories`, () => ok({ data: [{ id: 1, name: 'Health', slug: 'health' }] })),
  http.post(`${BASE}/admin/post-categories`, () => ok({ id: 2, name: 'Recipes' })),
  http.put(`${BASE}/admin/post-categories/:id`, () => ok({ id: 1, name: 'Updated' })),
  http.delete(`${BASE}/admin/post-categories/:id`, () => ok(null)),

  http.get(`${BASE}/admin/banners`, () => ok({ data: [seedBanner] })),
  http.post(`${BASE}/admin/banners`, () => ok(seedBanner, 'Banner created')),
  http.post(`${BASE}/admin/banners/:id`, () => ok(seedBanner, 'Banner updated')),
  http.delete(`${BASE}/admin/banners/:id`, () => ok(null, 'Banner deleted')),

  http.get(`${BASE}/admin/faqs`, () => ok({ data: [seedFaq] })),
  http.post(`${BASE}/admin/faqs`, () => ok(seedFaq, 'FAQ created')),
  http.put(`${BASE}/admin/faqs/:id`, () => ok(seedFaq, 'FAQ updated')),
  http.delete(`${BASE}/admin/faqs/:id`, () => ok(null, 'FAQ deleted')),

  http.get(`${BASE}/admin/menus`, () => ok({ data: [] })),
  http.post(`${BASE}/admin/menus`, () => ok({ id: 1, name: 'Main' })),
  http.put(`${BASE}/admin/menus/:id`, () => ok({ id: 1, name: 'Main' })),
  http.delete(`${BASE}/admin/menus/:id`, () => ok(null)),
  http.put(`${BASE}/admin/menus/:id/items`, () => ok(null)),

  http.get(`${BASE}/admin/media`, () => ok({ data: [{ id: 1, url: '/images/media1.jpg', filename: 'media1.jpg' }] })),
  http.post(`${BASE}/admin/media`, () => ok({ id: 2, url: '/images/uploaded.jpg' })),
  http.delete(`${BASE}/admin/media/:id`, () => ok(null, 'Media deleted')),

  http.post(`${BASE}/admin/seo/analysis`, () => ok({ score: 85, issues: [] })),

  // Settings
  http.get(`${BASE}/admin/settings`, () => ok({ site_name: 'Dhanvanthiri Foods', currency: 'INR' })),
  http.put(`${BASE}/admin/settings`, () => ok(null, 'Settings updated')),

  // Module licenses
  http.get(`${BASE}/admin/modules`, ({ request }) => {
    const role = authRole(request);
    const modules = seedModules.map((module) => serializeModuleForRole(module, role));
    return ok({ data: modules });
  }),
  http.get(`${BASE}/admin/modules/:id`, ({ request, params }) => {
    const role = authRole(request);
    const module = seedModules.find((item) => item.id === Number(params.id));
    if (!module) return err(404, 'Module not found');
    return ok(serializeModuleForRole(module, role));
  }),
  http.post(`${BASE}/admin/modules`, async ({ request }) => {
    if (authRole(request) !== 'super_admin') return err(403, 'Forbidden');
    const body = await request.json() as Record<string, unknown>;
    if (!body.module_code || !body.module_name) return err(422, 'Validation failed');

    const nextId = Math.max(...seedModules.map((m) => m.id), 0) + 1;
    const created: SeedFeatureModule = {
      id: nextId,
      module_code: String(body.module_code),
      module_name: String(body.module_name),
      description: null,
      is_enabled: false,
      license_type: String(body.license_type ?? 'annual'),
      license_key: null,
      valid_from: null,
      valid_to: null,
      integration_status: 'not_configured',
      health_status: 'unknown',
      last_validated_at: null,
      vendor_name: null,
      notes: null,
      config_json: {},
      has_credentials: false,
      activated_by: null,
      activated_by_name: null,
      activated_on: null,
      updated_by: seedItUser.id,
      updated_by_name: seedItUser.name,
      updated_at: new Date().toISOString(),
    };

    seedModules = [...seedModules, created];
    return ok(created, 'Module license created');
  }),
  http.put(`${BASE}/admin/modules/:id`, async ({ request, params }) => {
    if (authRole(request) !== 'super_admin') return err(403, 'Forbidden');
    const body = await request.json() as Record<string, unknown>;
    const id = Number(params.id);
    const idx = seedModules.findIndex((item) => item.id === id);
    if (idx < 0) return err(404, 'Module not found');

    const updated: SeedFeatureModule = {
      ...seedModules[idx],
      module_name: body.module_name !== undefined ? String(body.module_name) : seedModules[idx].module_name,
      license_type: body.license_type !== undefined ? String(body.license_type) : seedModules[idx].license_type,
      license_key: body.license_key !== undefined ? String(body.license_key) : seedModules[idx].license_key,
      valid_to: body.valid_to !== undefined ? (body.valid_to ? String(body.valid_to) : null) : seedModules[idx].valid_to,
      vendor_name: body.vendor_name !== undefined ? (body.vendor_name ? String(body.vendor_name) : null) : seedModules[idx].vendor_name,
      notes: body.notes !== undefined ? (body.notes ? String(body.notes) : null) : seedModules[idx].notes,
      integration_status: body.integration_status !== undefined
        ? toIntegrationStatus(body.integration_status, seedModules[idx].integration_status)
        : seedModules[idx].integration_status,
      updated_by: seedItUser.id,
      updated_by_name: seedItUser.name,
      updated_at: new Date().toISOString(),
    };

    seedModules[idx] = updated;
    return ok(updated, 'Module license updated');
  }),
  http.put(`${BASE}/admin/modules/:id/toggle`, async ({ request, params }) => {
    if (authRole(request) !== 'super_admin') return err(403, 'Forbidden');
    const body = await request.json() as { is_enabled: boolean };
    const id = Number(params.id);
    const idx = seedModules.findIndex((item) => item.id === id);
    if (idx < 0) return err(404, 'Module not found');

    const nextEnabled = Boolean(body.is_enabled);
    const updated: SeedFeatureModule = {
      ...seedModules[idx],
      is_enabled: nextEnabled,
      activated_by: nextEnabled ? seedItUser.id : seedModules[idx].activated_by,
      activated_by_name: nextEnabled ? seedItUser.name : seedModules[idx].activated_by_name,
      activated_on: nextEnabled ? new Date().toISOString() : seedModules[idx].activated_on,
      updated_by: seedItUser.id,
      updated_by_name: seedItUser.name,
      updated_at: new Date().toISOString(),
    };
    seedModules[idx] = updated;
    return ok(updated, nextEnabled ? 'Module activated' : 'Module deactivated');
  }),
  http.post(`${BASE}/admin/modules/:id/validate-license`, async ({ request, params }) => {
    if (authRole(request) !== 'super_admin') return err(403, 'Forbidden');
    const body = await request.json() as { license_key?: string };
    const id = Number(params.id);
    const idx = seedModules.findIndex((item) => item.id === id);
    if (idx < 0) return err(404, 'Module not found');

    const nextLicense = body.license_key ?? seedModules[idx].license_key;
    const valid = Boolean(nextLicense) && !String(nextLicense).startsWith('INVALID');
    const updated: SeedFeatureModule = {
      ...seedModules[idx],
      license_key: nextLicense,
      last_validated_at: new Date().toISOString(),
      integration_status: valid ? (seedModules[idx].has_credentials ? 'configured' : 'not_configured') : 'failed',
      health_status: valid ? 'healthy' : 'failed',
      updated_by: seedItUser.id,
      updated_by_name: seedItUser.name,
      updated_at: new Date().toISOString(),
    };
    seedModules[idx] = updated;

    return ok({
      valid,
      reasons: valid ? [] : ['License key failed validation'],
      module: updated,
    }, valid ? 'License is valid' : 'License validation failed');
  }),
  http.put(`${BASE}/admin/modules/:id/credentials`, async ({ request, params }) => {
    if (authRole(request) !== 'super_admin') return err(403, 'Forbidden');
    const body = await request.json() as Record<string, unknown>;
    const id = Number(params.id);
    const idx = seedModules.findIndex((item) => item.id === id);
    if (idx < 0) return err(404, 'Module not found');

    const updated: SeedFeatureModule = {
      ...seedModules[idx],
      config_json: (body.config_json as Record<string, unknown>) ?? {},
      has_credentials: true,
      integration_status: toIntegrationStatus(body.integration_status, 'configured'),
      updated_by: seedItUser.id,
      updated_by_name: seedItUser.name,
      updated_at: new Date().toISOString(),
    };
    seedModules[idx] = updated;
    return ok(updated, 'Module credentials updated');
  }),
  http.get(`${BASE}/admin/modules/:id/health`, ({ request, params }) => {
    if (authRole(request) !== 'super_admin') return err(403, 'Forbidden');
    const module = seedModules.find((item) => item.id === Number(params.id));
    if (!module) return err(404, 'Module not found');

    const checks = [
      { name: 'enabled', status: module.is_enabled ? 'passed' : 'failed', message: module.is_enabled ? 'Module is enabled' : 'Module is disabled' },
      { name: 'credentials', status: module.has_credentials ? 'passed' : 'failed', message: module.has_credentials ? 'Credentials present' : 'Credentials missing' },
    ];
    const status = !module.is_enabled ? 'degraded' : (module.has_credentials ? 'healthy' : 'degraded');

    return ok({
      module_id: module.id,
      module_code: module.module_code,
      status,
      checked_at: new Date().toISOString(),
      checks,
    });
  }),
  http.post(`${BASE}/admin/modules/:id/activation-request`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    const module = seedModules.find((item) => item.id === Number(params.id));
    if (!module) return err(404, 'Module not found');
    if (module.is_enabled) return err(422, 'Module is already enabled');
    return ok({
      module_id: module.id,
      reason: String(body.reason ?? ''),
      requested_by: authRole(request),
    }, 'Activation request submitted');
  }),

  // Notifications
  http.get(`${BASE}/admin/notifications`, () => ok({ data: [{ id: 1, message: 'New order', read: false }] })),
  http.put(`${BASE}/admin/notifications/read-all`, () => ok(null)),

  // Activity logs
  http.get(`${BASE}/admin/activity-logs`, () => ok({ data: [] })),

  // Admin users (super_admin)
  http.get(`${BASE}/admin/admins`, () => ok({ data: [seedAdmin] })),
  http.post(`${BASE}/admin/admins`, () => ok({ ...seedAdmin, id: 100 })),
  http.put(`${BASE}/admin/admins/:id`, () => ok(seedAdmin)),
  http.delete(`${BASE}/admin/admins/:id`, () => ok(null)),
];

// ── Guest checkout handlers ──
export const guestCheckoutHandlers = [
  http.post(`${BASE}/guest/checkout/validate`, async ({ request }) => {
    const cartToken = request.headers.get('X-Cart-Token');
    if (!cartToken) return err(422, 'Cart not found', { cart: ['No cart token'] });
    const body = await request.json() as Record<string, unknown>;
    if (!body.guest_email) return err(422, 'Validation failed', { guest_email: ['The guest email field is required.'] });
    if (!body.guest_phone) return err(422, 'Validation failed', { guest_phone: ['The guest phone field is required.'] });
    return ok({ valid: true, issues: [] });
  }),
  http.post(`${BASE}/guest/checkout/summary`, async ({ request }) => {
    const cartToken = request.headers.get('X-Cart-Token');
    if (!cartToken) return err(422, 'Cart not found', { cart: ['No cart token'] });
    return ok({ items: [seedCartItem], subtotal: 500, discount: 0, shipping: 60, tax: 89.6, total: 649.6 });
  }),
  http.post(`${BASE}/guest/payments/intent`, async ({ request }) => {
    const cartToken = request.headers.get('X-Cart-Token');
    if (!cartToken) return err(422, 'Cart not found', { cart: ['No cart token'] });
    const body = await request.json() as Record<string, unknown>;
    if (!body.gateway || !body.guest_email || !body.shipping_address) return err(422, 'Validation failed');
    return ok({ order_id: 2, razorpay_order_id: 'order_guest_abc', razorpay_key_id: 'rzp_test', amount: 64960, currency: 'INR' });
  }),
  http.post(`${BASE}/guest/payments/confirm`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    if (!body.order_id || !body.gateway_payment_id || !body.gateway_order_id || !body.signature) return err(422, 'Validation failed');
    if (body.signature === 'bad-signature') return err(400, 'Payment verification failed');
    return ok({ order: { ...seedOrder, id: 2 }, payment: { status: 'captured' } });
  }),
];

// ── Guest order tracking handler ──
export const guestOrderHandlers = [
  http.post(`${BASE}/orders/track`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    if (!body.order_number) return err(422, 'Validation failed', { order_number: ['Required'] });
    if (!body.email && !body.phone) return err(422, 'Validation failed', { email: ['Email or phone is required'], phone: ['Email or phone is required'] });
    if (body.order_number === 'NOTFOUND') return err(404, 'Order not found');
    return ok({
      order_number: body.order_number, status: 'confirmed', grand_total: 649.6, currency: 'INR',
      created_at: '2026-03-07T10:00:00Z',
      items: seedOrder.items, shipping_address: seedAddress,
      shipments: [], status_history: [{ status: 'confirmed', changed_at: '2026-03-07T10:00:00Z' }],
    });
  }),
];

// ── Wishlist handlers ──
export const wishlistHandlers = [
  http.get(`${BASE}/wishlist`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    return ok({ data: [{ id: 1, product_id: 1, variant_id: 1, product: seedProduct, variant: seedProduct.variants[0], added_at: '2026-03-07T10:00:00Z' }] });
  }),
  http.post(`${BASE}/wishlist`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    const body = await request.json() as Record<string, unknown>;
    if (!body.product_id) return err(422, 'Validation failed', { product_id: ['Required'] });
    if (body.product_id === 999) return HttpResponse.json({ success: false, message: 'Already in wishlist' }, { status: 409 });
    return ok({ id: 2, product_id: body.product_id, variant_id: body.variant_id ?? null, added_at: '2026-03-07T10:00:00Z' });
  }),
  http.delete(`${BASE}/wishlist/:id`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return err(401, 'Unauthenticated');
    return ok(null, 'Removed from wishlist');
  }),
];

// ── Recommendations handler ──
export const recommendationHandlers = [
  http.get(`${BASE}/products/recommendations`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || 4;
    const items = Array.from({ length: Math.min(limit, 4) }, (_, i) => ({
      id: 10 + i, name: `Rec Product ${i}`, slug: `rec-product-${i}`,
      price: 200 + i * 50, compare_at_price: null, average_rating: 4.0, review_count: 2, image: `/images/rec${i}.jpg`,
    }));
    return ok(items);
  }),
];

// ── Webhook handler ──
export const webhookHandlers = [
  http.post(`${BASE}/webhooks/razorpay`, () => ok(null, 'Webhook processed')),
];

// ── All handlers combined ──
export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...recommendationHandlers, // before catalogHandlers so /products/recommendations matches before /products/:slug
  ...catalogHandlers,
  ...cartHandlers,
  ...addressHandlers,
  ...checkoutHandlers,
  ...guestCheckoutHandlers,
  ...paymentHandlers,
  ...orderHandlers,
  ...guestOrderHandlers,
  ...wishlistHandlers,
  ...cmsHandlers,
  ...adminHandlers,
  ...webhookHandlers,
];
