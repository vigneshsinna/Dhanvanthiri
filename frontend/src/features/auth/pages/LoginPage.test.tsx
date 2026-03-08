import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { LoginPage } from './LoginPage';

// Mock the auth API module
vi.mock('@/features/auth/api', () => ({
  useLoginMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('LoginPage', () => {
  it('renders the sign in heading', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders password input', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('link', { name: /create one/i })).toHaveAttribute('href', '/register');
  });

  it('has link to forgot password page', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('renders remember me checkbox', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('renders brand name linking to home', () => {
    renderWithProviders(<LoginPage />);
    const brandLink = screen.getByRole('link', { name: /dhanvanthiri foods/i });
    expect(brandLink).toHaveAttribute('href', '/');
  });
});
