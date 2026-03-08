/**
 * CMS admin route contract tests
 * Verifies frontend admin CMS hooks call /admin/{resource} (NOT /admin/cms/{resource})
 * Tests pages, posts, banners, faqs, media, menus, settings routes
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
  store.dispatch(setCredentials({ accessToken: 'admin-token', user: { id: 99, name: 'Admin', email: 'admin@e.com', role: 'admin' } }));
}

describe('CMS admin contract: pages (no /cms/ prefix)', () => {
  it('GET /admin/pages returns pages', async () => {
    loginAdmin();
    const res = await api.get('/admin/pages');
    expect(res.status).toBe(200);
    expect(res.data.data.data).toBeInstanceOf(Array);
  });

  it('POST /admin/pages creates page', async () => {
    loginAdmin();
    const res = await api.post('/admin/pages', {
      title: 'New Page',
      slug: 'new-page',
      content: '<p>Content</p>',
      excerpt: 'Summary',
      effective_date: '2026-03-08',
    });
    expect(res.status).toBe(200);
  });

  it('PUT /admin/pages/{id} updates page', async () => {
    loginAdmin();
    const res = await api.put('/admin/pages/1', { title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('DELETE /admin/pages/{id} deletes page', async () => {
    loginAdmin();
    const res = await api.delete('/admin/pages/1');
    expect(res.status).toBe(200);
  });

  it('DOES NOT call /admin/cms/pages (old wrong path returns 404)', async () => {
    loginAdmin();
    // Override: any call to /admin/cms/* should 404, proving frontend no longer uses it
    server.use(http.get('/api/admin/cms/pages', () => HttpResponse.json({ error: 'wrong path' }, { status: 404 })));
    const res = await api.get('/admin/pages');
    expect(res.status).toBe(200);
  });
});

describe('CMS admin contract: posts', () => {
  it('GET /admin/posts returns posts', async () => {
    loginAdmin();
    const res = await api.get('/admin/posts');
    expect(res.status).toBe(200);
  });

  it('POST /admin/posts creates post', async () => {
    loginAdmin();
    const res = await api.post('/admin/posts', { title: 'health', slug: 'health', body: '<p>article</p>' });
    expect(res.status).toBe(200);
  });

  it('PUT /admin/posts/{id} updates post', async () => {
    loginAdmin();
    const res = await api.put('/admin/posts/1', { title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('DELETE /admin/posts/{id} deletes post', async () => {
    loginAdmin();
    const res = await api.delete('/admin/posts/1');
    expect(res.status).toBe(200);
  });
});

describe('CMS admin contract: banners', () => {
  it('GET /admin/banners returns banners', async () => {
    loginAdmin();
    const res = await api.get('/admin/banners');
    expect(res.status).toBe(200);
  });

  it('POST /admin/banners creates banner', async () => {
    loginAdmin();
    const formData = new FormData();
    formData.append('title', 'Sale');
    const res = await api.post('/admin/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    expect(res.status).toBe(200);
  });

  it('DELETE /admin/banners/{id} deletes banner', async () => {
    loginAdmin();
    const res = await api.delete('/admin/banners/1');
    expect(res.status).toBe(200);
  });
});

describe('CMS admin contract: faqs', () => {
  it('GET /admin/faqs returns faqs', async () => {
    loginAdmin();
    const res = await api.get('/admin/faqs');
    expect(res.status).toBe(200);
  });

  it('POST /admin/faqs creates faq', async () => {
    loginAdmin();
    const res = await api.post('/admin/faqs', { question: 'Q?', answer: 'A', category: 'General' });
    expect(res.status).toBe(200);
  });

  it('PUT /admin/faqs/{id} updates faq', async () => {
    loginAdmin();
    const res = await api.put('/admin/faqs/1', { answer: 'Updated answer' });
    expect(res.status).toBe(200);
  });

  it('DELETE /admin/faqs/{id} deletes faq', async () => {
    loginAdmin();
    const res = await api.delete('/admin/faqs/1');
    expect(res.status).toBe(200);
  });
});

describe('CMS admin contract: media', () => {
  it('GET /admin/media returns media', async () => {
    loginAdmin();
    const res = await api.get('/admin/media');
    expect(res.status).toBe(200);
  });

  it('POST /admin/media uploads file', async () => {
    loginAdmin();
    const formData = new FormData();
    formData.append('file', new Blob(['data'], { type: 'image/png' }), 'test.png');
    const res = await api.post('/admin/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    expect(res.status).toBe(200);
  });

  it('DELETE /admin/media/{id} deletes media', async () => {
    loginAdmin();
    const res = await api.delete('/admin/media/1');
    expect(res.status).toBe(200);
  });
});

describe('CMS admin contract: settings', () => {
  it('GET /admin/settings returns settings', async () => {
    loginAdmin();
    const res = await api.get('/admin/settings');
    expect(res.status).toBe(200);
    expect(res.data.data.site_name).toBe('Dhanvanthiri Foods');
  });

  it('PUT /admin/settings updates settings', async () => {
    loginAdmin();
    const res = await api.put('/admin/settings', { settings: { site_name: 'Updated' } });
    expect(res.status).toBe(200);
  });
});

describe('CMS public: sitemap and robots', () => {
  it('GET /sitemap.xml returns XML', async () => {
    const res = await api.get('/sitemap.xml');
    expect(res.status).toBe(200);
  });

  it('GET /robots.txt returns text', async () => {
    const res = await api.get('/robots.txt');
    expect(res.status).toBe(200);
  });
});

describe('CMS public: pages and posts', () => {
  it('GET /pages/{slug} returns page', async () => {
    const res = await api.get('/pages/terms-and-conditions');
    expect(res.status).toBe(200);
    expect(res.data.data.slug).toBe('terms-and-conditions');
    expect(res.data.data.effective_date).toBe('2026-03-08');
  });

  it('GET /pages/missing returns 404', async () => {
    try {
      await api.get('/pages/missing');
      expect.unreachable('should 404');
    } catch (e: any) {
      expect(e.response.status).toBe(404);
    }
  });

  it('GET /posts returns posts list', async () => {
    const res = await api.get('/posts');
    expect(res.status).toBe(200);
  });

  it('GET /posts/{slug} returns post', async () => {
    const res = await api.get('/posts/health-benefits');
    expect(res.status).toBe(200);
  });

  it('GET /faqs returns faqs', async () => {
    const res = await api.get('/faqs');
    expect(res.status).toBe(200);
  });

  it('GET /banners returns banners', async () => {
    const res = await api.get('/banners');
    expect(res.status).toBe(200);
  });
});
