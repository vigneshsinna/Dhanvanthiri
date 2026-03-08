import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { FaqPage } from './FaqPage';
import { fallbackFaqs } from '@/lib/fallbackData';

// Mock the CMS API - return empty so fallback data is used
vi.mock('@/features/cms/api', () => ({
  useFaqsQuery: () => ({
    data: null,
    isLoading: false,
  }),
}));

describe('FaqPage', () => {
  it('renders heading', () => {
    renderWithProviders(<FaqPage />);
    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<FaqPage />);
    expect(screen.getByText(/find answers to common questions/i)).toBeInTheDocument();
  });

  it('renders fallback FAQ questions', () => {
    renderWithProviders(<FaqPage />);
    // Each fallback FAQ question should be rendered
    for (const faq of fallbackFaqs) {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
    }
  });

  it('groups FAQs by category', () => {
    renderWithProviders(<FaqPage />);
    const categories = [...new Set(fallbackFaqs.map(f => f.category))];
    for (const cat of categories) {
      expect(screen.getByRole('heading', { name: cat })).toBeInTheDocument();
    }
  });

  it('toggles FAQ answer on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FaqPage />);
    const firstQuestion = screen.getByText(fallbackFaqs[0].question);
    // Answer should not be visible initially
    expect(screen.queryByText(fallbackFaqs[0].answer)).not.toBeInTheDocument();
    // Click question
    await user.click(firstQuestion);
    expect(screen.getByText(fallbackFaqs[0].answer)).toBeInTheDocument();
  });

  it('closes answer when clicking again', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FaqPage />);
    const firstQuestion = screen.getByText(fallbackFaqs[0].question);
    await user.click(firstQuestion);
    expect(screen.getByText(fallbackFaqs[0].answer)).toBeInTheDocument();
    await user.click(firstQuestion);
    expect(screen.queryByText(fallbackFaqs[0].answer)).not.toBeInTheDocument();
  });
});
