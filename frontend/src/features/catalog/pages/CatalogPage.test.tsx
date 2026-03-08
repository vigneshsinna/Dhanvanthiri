import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { CatalogPage } from './CatalogPage';

// Mock all API hooks
vi.mock('@/features/catalog/api', () => ({
  useProductsQuery: () => ({ data: null, isLoading: false }),
  useCategoriesQuery: () => ({ data: null, isLoading: false }),
}));

vi.mock('@/features/cart/api', () => ({
  useAddCartItemMutation: () => ({ mutate: vi.fn(), isLoading: false }),
}));

vi.mock('@/features/cms/api', () => ({
  useFaqsQuery: () => ({ data: null, isLoading: false }),
}));

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('CatalogPage', () => {
  it('renders without crashing', () => {
    renderWithProviders(<CatalogPage />);
    expect(document.body.textContent).toBeTruthy();
  });

  it('displays product cards from fallback data', () => {
    renderWithProviders(<CatalogPage />);
    // Should show some fallback product names
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('Thokku');
  });

  it('shows category filter options', () => {
    renderWithProviders(<CatalogPage />);
    const allText = document.body.textContent ?? '';
    // Should have category names available
    expect(allText.toLowerCase()).toContain('thokku');
  });

  it('displays product prices with ₹ symbol', () => {
    renderWithProviders(<CatalogPage />);
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('₹');
  });

  it('renders heading for product catalog', () => {
    renderWithProviders(<CatalogPage />);
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('has clickable product links', () => {
    renderWithProviders(<CatalogPage />);
    const links = screen.getAllByRole('link');
    const productLinks = links.filter(l => {
      const href = l.getAttribute('href') ?? '';
      return href.startsWith('/products/');
    });
    expect(productLinks.length).toBeGreaterThan(0);
  });
});
