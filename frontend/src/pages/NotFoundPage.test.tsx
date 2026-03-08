import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
  });

  it('shows not found message', () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('has proper heading level', () => {
    renderWithProviders(<NotFoundPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.tagName).toBe('H1');
  });
});
