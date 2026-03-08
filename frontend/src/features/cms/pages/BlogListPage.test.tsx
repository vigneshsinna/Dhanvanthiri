import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { BlogListPage } from './BlogListPage';
import { fallbackBlogPosts } from '@/lib/fallbackData';

vi.mock('@/features/cms/api', () => ({
  usePostsQuery: () => ({
    data: null,
    isLoading: false,
  }),
}));

describe('BlogListPage', () => {
  it('renders heading', () => {
    renderWithProviders(<BlogListPage />);
    expect(screen.getByRole('heading', { name: /blog/i, level: 1 })).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<BlogListPage />);
    expect(screen.getByText(/recipes, tips, and stories/i)).toBeInTheDocument();
  });

  it('renders fallback blog posts', () => {
    renderWithProviders(<BlogListPage />);
    for (const post of fallbackBlogPosts) {
      expect(screen.getAllByText(post.title).length).toBeGreaterThan(0);
    }
  });

  it('renders blog post links', () => {
    renderWithProviders(<BlogListPage />);
    const links = screen.getAllByRole('link');
    const blogLinks = links.filter(l => l.getAttribute('href')?.startsWith('/blog/'));
    expect(blogLinks.length).toBeGreaterThan(0);
  });

  it('renders published dates', () => {
    renderWithProviders(<BlogListPage />);
    // Dates should be rendered in some format
    for (const post of fallbackBlogPosts) {
      const dt = new Date(post.published_at);
      const expected = dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      expect(screen.getByText(expected)).toBeInTheDocument();
    }
  });
});
