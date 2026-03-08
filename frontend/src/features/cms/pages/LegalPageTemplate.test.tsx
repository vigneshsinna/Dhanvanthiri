import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { LegalPageTemplate } from './LegalPageTemplate';

const legalPage = {
  title: 'Privacy Policy',
  excerpt: 'How we collect, use, and protect customer information.',
  effective_date: '2026-03-08',
  content: `
    <h2>Information We Collect</h2>
    <p>We collect the details needed to process and deliver orders.</p>
    <h3>Order Details</h3>
    <p>Order references, addresses, and contact information.</p>
  `,
};

describe('LegalPageTemplate', () => {
  it('renders title, effective date, and summary', () => {
    renderWithProviders(<LegalPageTemplate page={legalPage} />);

    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
    expect(screen.getByText(/march 8, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/how we collect, use, and protect customer information/i)).toBeInTheDocument();
  });

  it('renders a table of contents and support callout', () => {
    renderWithProviders(<LegalPageTemplate page={legalPage} />);

    expect(screen.getByRole('navigation', { name: /on this page/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /information we collect/i })).toHaveAttribute('href', '#information-we-collect');
    expect(screen.getByText(/for policy questions/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/pages/contact');
  });
});
