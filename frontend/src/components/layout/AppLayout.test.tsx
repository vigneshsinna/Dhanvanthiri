import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@/test/test-utils';
import { AppLayout } from './AppLayout';
import { Outlet } from 'react-router-dom';

// Mock API hooks
vi.mock('@/features/auth/api', () => ({
  useMeQuery: () => ({ data: null, isLoading: false }),
  useLogoutMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/features/cart/api', () => ({
  useCartQuery: () => ({ data: null, isLoading: false }),
}));

vi.mock('@/lib/utils/usePageScrollReveal', () => ({
  usePageScrollReveal: vi.fn(),
}));

describe('AppLayout', () => {
  it('renders announcement bar', () => {
    renderWithProviders(<AppLayout />);
    expect(screen.getByText(/free shipping/i)).toBeInTheDocument();
  });

  it('renders brand logo', () => {
    renderWithProviders(<AppLayout />);
    const logo = screen.getAllByAltText(/dhanvanthiri/i);
    expect(logo.length).toBeGreaterThan(0);
  });

  it('renders desktop navigation links', () => {
    renderWithProviders(<AppLayout />);
    const links = screen.getAllByRole('link');
    const productLinks = links.filter(l => l.getAttribute('href') === '/products');
    expect(productLinks.length).toBeGreaterThan(0);
  });

  it('has Products, Blog, FAQ, About nav links', () => {
    renderWithProviders(<AppLayout />);
    // These should exist in either desktop or mobile navbars
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('Products');
    expect(allText).toContain('Blog');
    expect(allText).toContain('FAQ');
    expect(allText).toContain('About');
  });

  it('renders cart icon link', () => {
    renderWithProviders(<AppLayout />);
    const cartLink = screen.getByLabelText(/cart/i);
    expect(cartLink).toBeInTheDocument();
    expect(cartLink.getAttribute('href')).toBe('/cart');
  });

  it('shows Sign In button when not authenticated', () => {
    renderWithProviders(<AppLayout />, {
      preloadedState: {
        auth: { isAuthenticated: false, user: null, accessToken: null },
      },
    });
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('Sign In');
  });

  it('shows user name when authenticated', () => {
    renderWithProviders(<AppLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'customer' },
          accessToken: 'token',
        },
      },
    });
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('Test User');
  });

  it('shows Admin link for admin users', () => {
    renderWithProviders(<AppLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
          accessToken: 'token',
        },
      },
    });
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('Admin');
  });

  it('shows cart badge when items in cart', () => {
    renderWithProviders(<AppLayout />, {
      preloadedState: {
        cart: {
          items: [],
          coupon: null,
          subtotal: 0,
          discountAmount: 0,
          shippingCost: null,
          taxAmount: null,
          grandTotal: 0,
          itemCount: 3,
          cartToken: null,
        },
      },
    });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('has mobile hamburger button', () => {
    renderWithProviders(<AppLayout />);
    const menuBtn = screen.getByLabelText(/toggle menu/i);
    expect(menuBtn).toBeInTheDocument();
  });

  it('renders footer with brand info', () => {
    renderWithProviders(<AppLayout />);
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('Traditional South Indian');
  });

  it('footer has shop links', () => {
    renderWithProviders(<AppLayout />);
    const links = screen.getAllByRole('link');
    const shopLinks = links.filter(l => {
      const href = l.getAttribute('href') ?? '';
      return href === '/products' || href === '/cart' || href === '/faq';
    });
    expect(shopLinks.length).toBeGreaterThanOrEqual(3);
  });
});
