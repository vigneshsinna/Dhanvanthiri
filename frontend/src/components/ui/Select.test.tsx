import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const options = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

describe('Select', () => {
  it('renders all options', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('renders label when provided', () => {
    render(<Select label="Sort By" options={options} />);
    expect(screen.getByText('Sort By')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Select options={options} error="Please select" />);
    expect(screen.getByText('Please select')).toBeInTheDocument();
  });

  it('displays option labels correctly', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Newest')).toBeInTheDocument();
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
    expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
  });

  it('can change selection', async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'price_asc');
    expect(select).toHaveValue('price_asc');
  });
});
