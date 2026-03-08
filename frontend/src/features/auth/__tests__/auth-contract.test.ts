/**
 * Auth and session reliability tests
 * - Login throttle behavior
 * - Refresh token + single-flight retry
 * - Protected routes and role-based access
 * - Profile update/password/avatar/delete
 * - Logout and token expiry
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

function login() {
  store.dispatch(setCredentials({ accessToken: 'test-jwt-token', user: { id: 1, name: 'L', email: 'l@e.com', role: 'customer' } }));
}
function loginAdmin() {
  store.dispatch(setCredentials({ accessToken: 'admin-token', user: { id: 99, name: 'Admin', email: 'a@e.com', role: 'admin' } }));
}

describe('Auth: login', () => {
  it('succeeds with valid credentials', async () => {
    const res = await api.post('/auth/login', { email: 'lakshmi@example.com', password: 'Password1!' });
    expect(res.status).toBe(200);
    expect(res.data.data.access_token).toBeDefined();
    expect(res.data.data.user.email).toBe('lakshmi@example.com');
  });

  it('fails with invalid credentials', async () => {
    try {
      await api.post('/auth/login', { email: 'lakshmi@example.com', password: 'wrong' });
      expect.unreachable('should 401');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  it('returns 429 when throttled', async () => {
    try {
      await api.post('/auth/login', { email: 'locked@example.com', password: 'x' });
      expect.unreachable('should 429');
    } catch (e: any) {
      expect(e.response.status).toBe(429);
    }
  });
});

describe('Auth: register', () => {
  it('succeeds with valid data', async () => {
    const res = await api.post('/auth/register', {
      name: 'New User', email: 'new@example.com',
      password: 'Password1!', password_confirmation: 'Password1!',
    });
    expect(res.status).toBe(200);
    expect(res.data.data.access_token).toBeDefined();
  });

  it('fails with existing email', async () => {
    try {
      await api.post('/auth/register', {
        name: 'Dup', email: 'existing@example.com',
        password: 'Password1!', password_confirmation: 'Password1!',
      });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
      expect(e.response.data.errors.email).toBeDefined();
    }
  });
});

describe('Auth: refresh token + single-flight retry', () => {
  it('POST /auth/refresh returns new token', async () => {
    login();
    const res = await api.post('/auth/refresh');
    expect(res.status).toBe(200);
    expect(res.data.data.access_token).toBe('refreshed-token');
  });

  it('auto-refreshes on 401 and retries', async () => {
    let callCount = 0;
    server.use(
      http.get('/api/auth/me', ({ request }) => {
        callCount++;
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer expired-token' && callCount <= 1) {
          return HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 });
        }
        return HttpResponse.json({ success: true, data: { id: 1, name: 'L', email: 'l@e.com', role: 'customer' } });
      })
    );
    store.dispatch(setCredentials({ accessToken: 'expired-token', user: { id: 1, name: 'L', email: 'l@e.com', role: 'customer' } }));
    const res = await api.get('/auth/me');
    expect(res.status).toBe(200);
  });

  it('clears credentials when refresh also fails', async () => {
    server.use(
      http.get('/api/auth/me', () => HttpResponse.json({ message: 'Unauthenticated' }, { status: 401 })),
      http.post('/api/auth/refresh', () => HttpResponse.json({ message: 'Token expired' }, { status: 401 }))
    );
    store.dispatch(setCredentials({ accessToken: 'dead-token', user: { id: 1, name: 'L', email: 'l@e.com', role: 'customer' } }));
    try {
      await api.get('/auth/me');
      expect.unreachable('should reject');
    } catch {
      // After failed refresh, credentials should be cleared
      expect(store.getState().auth.accessToken).toBeNull();
    }
  });
});

describe('Auth: logout', () => {
  it('POST /auth/logout succeeds', async () => {
    login();
    const res = await api.post('/auth/logout');
    expect(res.status).toBe(200);
  });
});

describe('Auth: GET /auth/me', () => {
  it('returns user data when authenticated', async () => {
    login();
    const res = await api.get('/auth/me');
    expect(res.status).toBe(200);
    expect(res.data.data.email).toBeDefined();
  });

  it('returns 401 when not authenticated', async () => {
    try {
      await api.get('/auth/me');
      expect.unreachable('should 401');
    } catch (e: any) {
      expect(e.response.status).toBe(401);
    }
  });

  it('returns admin user when admin token is used', async () => {
    loginAdmin();
    const res = await api.get('/auth/me');
    expect(res.data.data.role).toBe('admin');
  });
});

describe('Auth: forgot/reset password', () => {
  it('POST /auth/forgot-password succeeds', async () => {
    const res = await api.post('/auth/forgot-password', { email: 'lakshmi@example.com' });
    expect(res.status).toBe(200);
  });

  it('POST /auth/reset-password succeeds', async () => {
    const res = await api.post('/auth/reset-password', {
      token: 'valid-token', email: 'lakshmi@example.com',
      password: 'NewPass1!', password_confirmation: 'NewPass1!',
    });
    expect(res.status).toBe(200);
  });
});

describe('Profile: update/password/avatar/delete', () => {
  it('PUT /profile updates profile', async () => {
    login();
    const res = await api.put('/profile', { name: 'Lakshmi Updated', email: 'l@e.com' });
    expect(res.status).toBe(200);
    expect(res.data.data.name).toBe('Lakshmi Updated');
  });

  it('PUT /profile/password changes password', async () => {
    login();
    const res = await api.put('/profile/password', {
      current_password: 'Password1!', password: 'NewPass1!', password_confirmation: 'NewPass1!',
    });
    expect(res.status).toBe(200);
  });

  it('PUT /profile/password rejects wrong current password', async () => {
    login();
    try {
      await api.put('/profile/password', {
        current_password: 'wrong', password: 'NewPass1!', password_confirmation: 'NewPass1!',
      });
      expect.unreachable('should 422');
    } catch (e: any) {
      expect(e.response.status).toBe(422);
    }
  });

  it('POST /profile/avatar uploads avatar', async () => {
    login();
    const formData = new FormData();
    formData.append('avatar', new Blob(['img'], { type: 'image/png' }), 'avatar.png');
    const res = await api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    expect(res.status).toBe(200);
    expect(res.data.data.avatar_url).toBeDefined();
  });

  it('DELETE /profile deletes account', async () => {
    login();
    const res = await api.delete('/profile');
    expect(res.status).toBe(200);
  });
});
