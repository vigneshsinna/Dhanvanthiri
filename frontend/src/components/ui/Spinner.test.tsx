import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner, PageLoader } from './Spinner';

describe('Spinner', () => {
  it('renders a spinning SVG', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.toString()).toContain('animate-spin');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="h-12 w-12" />);
    const svg = container.querySelector('svg');
    expect(svg?.classList.toString()).toContain('h-12');
  });
});

describe('PageLoader', () => {
  it('renders centered spinner', () => {
    const { container } = render(<PageLoader />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.toString()).toContain('animate-spin');
  });

  it('has min-height container', () => {
    const { container } = render(<PageLoader />);
    expect(container.firstChild).toHaveClass('min-h-[40vh]');
  });
});
