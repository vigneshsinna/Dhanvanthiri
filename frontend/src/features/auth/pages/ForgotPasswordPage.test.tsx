import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { ForgotPasswordPage } from './ForgotPasswordPage';

vi.mock('@/features/auth/api', () => ({
  useForgotPasswordMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('ForgotPasswordPage', () => {
  it('renders heading', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders send reset link button', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('has back to login link', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
  });

  it('renders instructions text', () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByText(/enter your email and we'll send you a reset link/i)).toBeInTheDocument();
  });
});
