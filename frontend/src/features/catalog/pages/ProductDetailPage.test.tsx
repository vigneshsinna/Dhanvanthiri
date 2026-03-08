import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { ProductDetailPage } from './ProductDetailPage';

// Mock useParams to return a known slug
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'poondu-thokku' }),
  };
});

vi.mock('@/features/catalog/api', () => ({
  useProductQuery: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
  useReviewsQuery: () => ({
    data: null,
    isLoading: false,
  }),
  useSubmitReviewMutation: () => ({
    mutateAsync: vi.fn(),
    isLoading: false,
  }),
  useRecommendationsQuery: () => ({
    data: { data: [] },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/features/cart/api', () => ({
  useAddCartItemMutation: () => ({
    mutate: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ProductDetailPage', () => {
  it('renders product from fallback data when API returns null', () => {
    renderWithProviders(<ProductDetailPage />);
    // Should find "Poondu Thokku" from fallback data (may appear multiple times)
    const matches = screen.getAllByText(/poondu thokku/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('displays product price', () => {
    renderWithProviders(<ProductDetailPage />);
    const allText = document.body.textContent ?? '';
    expect(allText).toContain('₹179');
  });

  it('shows Add to Cart button', () => {
    renderWithProviders(<ProductDetailPage />);
    const addButton = screen.getAllByRole('button').find(
      btn => btn.textContent?.toLowerCase().includes('add to cart')
    );
    expect(addButton).toBeTruthy();
  });

  it('shows product description', () => {
    renderWithProviders(<ProductDetailPage />);
    const allText = document.body.textContent ?? '';
    expect(allText.toLowerCase()).toContain('garlic');
  });

  it('has breadcrumb navigation', () => {
    renderWithProviders(<ProductDetailPage />);
    const links = screen.getAllByRole('link');
    const productsLink = links.find(l => l.getAttribute('href') === '/products');
    expect(productsLink).toBeTruthy();
  });

  it('shows product rating', () => {
    renderWithProviders(<ProductDetailPage />);
    const allText = document.body.textContent ?? '';
    // The rating 4.7 should appear somewhere
    expect(allText).toContain('4.7');
  });
});
