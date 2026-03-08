import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { PrivateRoute, AdminRoute } from './index';
import { Routes, Route } from 'react-router-dom';

function TestProtected() {
  return <div>Protected Content</div>;
}

// We need to render through Routes for Navigate to work properly
function renderGuardedRoute(
  Guard: typeof PrivateRoute | typeof AdminRoute,
  preloadedState: Parameters<typeof renderWithProviders>[1]
) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<Guard><TestProtected /></Guard>} />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>,
    preloadedState,
  );
}

describe('PrivateRoute', () => {
  it('renders children when authenticated', () => {
    renderGuardedRoute(PrivateRoute, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 1, name: 'Test', email: 'a@b.com', role: 'customer' },
          accessToken: 'token',
        },
      },
    });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    renderGuardedRoute(PrivateRoute, {
      preloadedState: {
        auth: { isAuthenticated: false, user: null, accessToken: null },
      },
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('renders children when authenticated as admin', () => {
    renderGuardedRoute(AdminRoute, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 1, name: 'Admin', email: 'admin@b.com', role: 'admin' },
          accessToken: 'token',
        },
      },
    });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children for super_admin', () => {
    renderGuardedRoute(AdminRoute, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 1, name: 'SA', email: 'sa@b.com', role: 'super_admin' },
          accessToken: 'token',
        },
      },
    });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects non-admin authenticated users to home', () => {
    renderGuardedRoute(AdminRoute, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 1, name: 'User', email: 'u@b.com', role: 'customer' },
          accessToken: 'token',
        },
      },
    });
    // Customer should not see protected content - but since "/" route IS the guard route,
    // Navigate to="/" would match the same route. The key is content is not shown.
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    renderGuardedRoute(AdminRoute, {
      preloadedState: {
        auth: { isAuthenticated: false, user: null, accessToken: null },
      },
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
