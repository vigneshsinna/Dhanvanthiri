import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { AboutPage } from './AboutPage';

// Mock react-helmet-async to avoid HelmetProvider warnings
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('AboutPage', () => {
  it('renders main heading', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows brand name "Dhanvanthiri"', () => {
    renderWithProviders(<AboutPage />);
    const matches = screen.getAllByText(/dhanvanthiri/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('has About Dhanvanthiri Foods section heading', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByText(/about dhanvanthiri foods/i)).toBeInTheDocument();
  });

  it('mentions traditional Tamil foods', () => {
    renderWithProviders(<AboutPage />);
    const matches = screen.getAllByText(/traditional tamil foods/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders logo image with alt text', () => {
    renderWithProviders(<AboutPage />);
    const logo = screen.getByAltText(/dhanvanthiri logo/i);
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe('IMG');
  });

  it('has background image for hero section', () => {
    renderWithProviders(<AboutPage />);
    const bgImage = screen.getByAltText(/traditional tamil kitchen/i);
    expect(bgImage).toBeInTheDocument();
  });
});
