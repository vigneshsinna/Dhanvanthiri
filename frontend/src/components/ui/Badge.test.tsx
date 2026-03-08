import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Bestseller</Badge>);
    expect(screen.getByText('Bestseller')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText('Tag').className).toContain('bg-slate-100');
  });

  it('applies success variant', () => {
    render(<Badge variant="success">In Stock</Badge>);
    expect(screen.getByText('In Stock').className).toContain('bg-green-100');
  });

  it('applies danger variant', () => {
    render(<Badge variant="danger">Out of Stock</Badge>);
    expect(screen.getByText('Out of Stock').className).toContain('bg-red-100');
  });

  it('applies warning variant', () => {
    render(<Badge variant="warning">Low Stock</Badge>);
    expect(screen.getByText('Low Stock').className).toContain('bg-yellow-100');
  });

  it('applies info variant', () => {
    render(<Badge variant="info">New</Badge>);
    expect(screen.getByText('New').className).toContain('bg-blue-100');
  });

  it('accepts additional className', () => {
    render(<Badge className="ml-2">Test</Badge>);
    expect(screen.getByText('Test').className).toContain('ml-2');
  });

  it('renders as inline element', () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText('Tag').tagName).toBe('SPAN');
  });
});
