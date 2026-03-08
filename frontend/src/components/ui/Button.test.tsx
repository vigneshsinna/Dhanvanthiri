import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Add to Cart</Button>);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-brand-600');
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="secondary">Click</Button>);
    expect(screen.getByRole('button').className).toContain('bg-slate-100');

    rerender(<Button variant="outline">Click</Button>);
    expect(screen.getByRole('button').className).toContain('border-slate-300');

    rerender(<Button variant="danger">Click</Button>);
    expect(screen.getByRole('button').className).toContain('bg-red-600');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">Click</Button>);
    expect(screen.getByRole('button').className).toContain('px-3');

    rerender(<Button size="lg">Click</Button>);
    expect(screen.getByRole('button').className).toContain('px-6');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading prop is true', () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole('button');
    const svg = btn.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.toString()).toContain('animate-spin');
  });

  it('fires onClick handler', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Buy</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Buy</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('accepts additional className', () => {
    render(<Button className="mt-4">Click</Button>);
    expect(screen.getByRole('button').className).toContain('mt-4');
  });
});
