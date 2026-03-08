import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { OrderListPage } from './OrderListPage';

vi.mock('@/features/orders/api', () => ({
  useOrdersQuery: () => ({
    data: null,
    isLoading: false,
  }),
}));

describe('OrderListPage', () => {
  it('renders heading', () => {
    renderWithProviders(<OrderListPage />);
    expect(screen.getByRole('heading', { name: /my orders/i })).toBeInTheDocument();
  });

  it('renders empty state when no orders', () => {
    renderWithProviders(<OrderListPage />);
    expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
  });

  it('renders browse products link in empty state', () => {
    renderWithProviders(<OrderListPage />);
    expect(screen.getByRole('link', { name: /browse products/i })).toHaveAttribute('href', '/products');
  });

  it('renders encouragement message', () => {
    renderWithProviders(<OrderListPage />);
    expect(screen.getByText(/start shopping to see your orders/i)).toBeInTheDocument();
  });
});
