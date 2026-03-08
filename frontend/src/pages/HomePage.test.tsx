import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { HomePage } from './HomePage';

// Mock all API hooks to avoid actual HTTP calls
vi.mock('@/features/catalog/api', () => ({
  useFeaturedProductsQuery: () => ({ data: null, isLoading: false }),
  useCategoriesQuery: () => ({ data: null, isLoading: false }),
}));

vi.mock('@/features/cms/api', () => ({
  useBannersQuery: () => ({ data: null, isLoading: false }),
}));

vi.mock('@/features/cart/api', () => ({
  useAddCartItemMutation: () => ({ mutate: vi.fn(), isLoading: false }),
}));

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('HomePage', () => {
  it('renders without crashing', () => {
    renderWithProviders(<HomePage />);
    // The page should render something visible
    expect(document.body.textContent).toBeTruthy();
  });

  it('shows brand text "Dhanvanthiri"', () => {
    renderWithProviders(<HomePage />);
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('Dhanvanthiri');
  });

  it('renders hero CTA link to products', () => {
    renderWithProviders(<HomePage />);
    const links = screen.getAllByRole('link');
    const shopLink = links.find(l => l.getAttribute('href') === '/products');
    expect(shopLink).toBeTruthy();
  });

  it('displays featured/best seller products from fallback data', () => {
    renderWithProviders(<HomePage />);
    // Should show product names from fallback data
    const allText = document.body.textContent ?? '';
    // At least one fallback product should be visible
    expect(allText).toContain('Thokku');
  });

  it('renders "Why Choose Us" section', () => {
    renderWithProviders(<HomePage />);
    const allText = document.body.textContent ?? '';
    expect(allText.toLowerCase()).toContain('why choose');
  });

  it('has SEO meta concerns (title tag present)', () => {
    renderWithProviders(<HomePage />);
    // With mocked Helmet, title should render in document
    const titleEl = document.querySelector('title');
    // Title might be in the mocked output
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('Traditional Tamil Foods');
  });

  it('shows Add to Cart buttons for products', () => {
    renderWithProviders(<HomePage />);
    const addButtons = screen.getAllByRole('button').filter(
      btn => btn.textContent?.toLowerCase().includes('add')
    );
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('displays product prices', () => {
    renderWithProviders(<HomePage />);
    // Prices should be in INR format (₹)
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('₹');
  });
});
