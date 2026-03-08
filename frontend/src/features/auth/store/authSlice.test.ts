import { describe, it, expect } from 'vitest';
import authReducer, { setCredentials, setAccessToken, clearCredentials, type AuthUser } from './authSlice';

const mockUser: AuthUser = {
  id: 1,
  name: 'Test User',
  email: 'test@dhanvanthiri.com',
  role: 'customer',
};

describe('authSlice', () => {
  it('returns initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  describe('setCredentials', () => {
    it('sets user and token, marks authenticated', () => {
      const state = authReducer(undefined, setCredentials({
        user: mockUser,
        accessToken: 'jwt-token-123',
      }));
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('jwt-token-123');
      expect(state.isAuthenticated).toBe(true);
    });

    it('identifies admin user role', () => {
      const adminUser: AuthUser = { ...mockUser, role: 'admin' };
      const state = authReducer(undefined, setCredentials({
        user: adminUser,
        accessToken: 'admin-token',
      }));
      expect(state.user?.role).toBe('admin');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setAccessToken', () => {
    it('updates token and sets authenticated', () => {
      const state = authReducer(undefined, setAccessToken('new-token'));
      expect(state.accessToken).toBe('new-token');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('clearCredentials', () => {
    it('resets all auth state', () => {
      let state = authReducer(undefined, setCredentials({
        user: mockUser,
        accessToken: 'token',
      }));
      state = authReducer(state, clearCredentials());
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
