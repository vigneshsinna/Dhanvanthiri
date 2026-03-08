import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { DynamicPage } from './DynamicPage';

let currentSlug = 'unknown-page';
let currentQueryResult = {
  data: null,
  isLoading: false,
  error: new Error('not found'),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: currentSlug }),
  };
});

vi.mock('@/features/cms/api', () => ({
  usePageQuery: () => currentQueryResult,
}));

describe('DynamicPage', () => {
  beforeEach(() => {
    currentSlug = 'unknown-page';
    currentQueryResult = {
      data: null,
      isLoading: false,
      error: new Error('not found'),
    };
  });

  it('renders coming soon for unknown page slugs', () => {
    renderWithProviders(<DynamicPage />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('renders a Go Home link', () => {
    renderWithProviders(<DynamicPage />);
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });

  it('shows explanatory text', () => {
    renderWithProviders(<DynamicPage />);
    expect(screen.getByText(/we're working on this page/i)).toBeInTheDocument();
  });

  it('renders fallback content for shipping policy when CMS API is unavailable', () => {
    currentSlug = 'shipping-policy';

    renderWithProviders(<DynamicPage />);

    expect(screen.getByRole('heading', { name: /shipping policy/i })).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(screen.getByText(/this shipping policy explains how dhanvanthiri foods processes/i)).toBeInTheDocument();
  });

  it('renders fallback content for terms and conditions when CMS API is unavailable', () => {
    currentSlug = 'terms-and-conditions';

    renderWithProviders(<DynamicPage />);

    expect(screen.getByRole('heading', { name: /terms/i })).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
    expect(screen.getByText(/these terms .* explain the rules for using the dhanvanthiri foods website/i)).toBeInTheDocument();
  });
});
