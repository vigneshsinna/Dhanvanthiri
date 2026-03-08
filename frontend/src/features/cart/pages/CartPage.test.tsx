import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { CartPage } from './CartPage';

// Mock cart API hooks
const mockMutate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('@/features/cart/api', () => ({
  useCartQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useUpdateCartItemMutation: () => ({ mutate: mockMutate, isLoading: false }),
  useRemoveCartItemMutation: () => ({ mutate: mockMutate, isLoading: false }),
  useClearCartMutation: () => ({ mutate: mockMutate, isLoading: false }),
  useApplyCouponMutation: () => ({ mutateAsync: mockMutateAsync, isLoading: false }),
  useRemoveCouponMutation: () => ({ mutate: mockMutate, isLoading: false }),
}));

import { useCartQuery } from '@/features/cart/api';
const mockUseCartQuery = vi.mocked(useCartQuery);

describe('CartPage', () => {
  it('shows empty cart state when no items', () => {
    mockUseCartQuery.mockReturnValue({
      data: { data: { items: [], subtotal: 0, grand_total: 0 } },
      isLoading: false,
    } as any);

    renderWithProviders(<CartPage />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('shows "Continue Shopping" button on empty cart', () => {
    mockUseCartQuery.mockReturnValue({
      data: { data: { items: [], subtotal: 0, grand_total: 0 } },
      isLoading: false,
    } as any);

    renderWithProviders(<CartPage />);
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });

  it('links to products page from empty cart', () => {
    mockUseCartQuery.mockReturnValue({
      data: { data: { items: [], subtotal: 0, grand_total: 0 } },
      isLoading: false,
    } as any);

    renderWithProviders(<CartPage />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/products');
  });

  it('shows cart items when present', () => {
    mockUseCartQuery.mockReturnValue({
      data: {
        data: {
          items: [{
            id: 1,
            quantity: 2,
            unit_price: 179,
            line_total: 358,
            product: { id: 1, name: 'Poondu Thokku', slug: 'poondu-thokku', primary_image_url: '/img.jpg' },
            variant: { id: 1, sku: 'PnT-250', name: '250g Jar' },
          }],
          subtotal: 358,
          discount_amount: 0,
          shipping_cost: null,
          tax_amount: null,
          grand_total: 358,
          coupon: null,
        },
      },
      isLoading: false,
    } as any);

    renderWithProviders(<CartPage />);
    expect(screen.getByText(/poondu thokku/i)).toBeInTheDocument();
  });

  it('displays product price in cart', () => {
    mockUseCartQuery.mockReturnValue({
      data: {
        data: {
          items: [{
            id: 1,
            quantity: 1,
            unit_price: 179,
            line_total: 179,
            product: { id: 1, name: 'Poondu Thokku', slug: 'poondu-thokku' },
            variant: null,
          }],
          subtotal: 179,
          grand_total: 179,
        },
      },
      isLoading: false,
    } as any);

    renderWithProviders(<CartPage />);
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('179');
  });
});
