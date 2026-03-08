import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { RegisterPage } from './RegisterPage';

vi.mock('@/features/auth/api', () => ({
  useRegisterMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('RegisterPage', () => {
  it('renders create account heading', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('renders full name input', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders password input', () => {
    renderWithProviders(<RegisterPage />);
    // There will be multiple password inputs - Password and Confirm Password
    const passwordInputs = screen.getAllByLabelText(/password/i);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('shows password requirements hint', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByText(/min 8 chars/i)).toBeInTheDocument();
  });

  it('renders create account button', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('has link to login page', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  it('renders brand name linking to home', () => {
    renderWithProviders(<RegisterPage />);
    const brandLink = screen.getByRole('link', { name: /dhanvanthiri foods/i });
    expect(brandLink).toHaveAttribute('href', '/');
  });
});
