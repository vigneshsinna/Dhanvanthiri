import { describe, it, expect } from 'vitest';
import { couponSchema } from './couponSchema';

describe('couponSchema', () => {
  it('accepts valid coupon code', () => {
    expect(couponSchema.safeParse({ code: 'SUMMER20' }).success).toBe(true);
  });

  it('rejects code shorter than 2 chars', () => {
    expect(couponSchema.safeParse({ code: 'A' }).success).toBe(false);
  });

  it('rejects code longer than 50 chars', () => {
    expect(couponSchema.safeParse({ code: 'X'.repeat(51) }).success).toBe(false);
  });

  it('accepts 2-char code', () => {
    expect(couponSchema.safeParse({ code: 'AB' }).success).toBe(true);
  });

  it('accepts 50-char code', () => {
    expect(couponSchema.safeParse({ code: 'X'.repeat(50) }).success).toBe(true);
  });
});
