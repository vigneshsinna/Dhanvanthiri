import { describe, it, expect } from 'vitest';
import { addressSchema } from './addressSchema';

describe('addressSchema', () => {
  const valid = {
    recipientName: 'John Doe',
    phone: '9876543210',
    line1: '123 Main Street',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600001',
    countryCode: 'IN',
  };

  it('accepts valid address', () => {
    expect(addressSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional label', () => {
    expect(addressSchema.safeParse({ ...valid, label: 'Home' }).success).toBe(true);
  });

  it('accepts optional line2', () => {
    expect(addressSchema.safeParse({ ...valid, line2: 'Apt 4B' }).success).toBe(true);
  });

  it('rejects recipientName shorter than 2 chars', () => {
    expect(addressSchema.safeParse({ ...valid, recipientName: 'J' }).success).toBe(false);
  });

  it('rejects phone shorter than 7 chars', () => {
    expect(addressSchema.safeParse({ ...valid, phone: '12345' }).success).toBe(false);
  });

  it('rejects line1 shorter than 5 chars', () => {
    expect(addressSchema.safeParse({ ...valid, line1: '123' }).success).toBe(false);
  });

  it('rejects postalCode shorter than 3 chars', () => {
    expect(addressSchema.safeParse({ ...valid, postalCode: '60' }).success).toBe(false);
  });

  it('rejects countryCode not exactly 2 chars', () => {
    expect(addressSchema.safeParse({ ...valid, countryCode: 'IND' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...valid, countryCode: 'I' }).success).toBe(false);
  });

  it('rejects missing required fields', () => {
    expect(addressSchema.safeParse({}).success).toBe(false);
  });
});
