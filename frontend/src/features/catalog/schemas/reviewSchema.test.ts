import { describe, it, expect } from 'vitest';
import { reviewSchema } from './reviewSchema';

describe('reviewSchema', () => {
  it('accepts valid review', () => {
    expect(reviewSchema.safeParse({ rating: 4, body: 'Great!' }).success).toBe(true);
  });

  it('accepts review with optional title', () => {
    expect(reviewSchema.safeParse({ rating: 5, title: 'Excellent', body: 'Loved it' }).success).toBe(true);
  });

  it('rejects rating below 1', () => {
    expect(reviewSchema.safeParse({ rating: 0, body: 'Bad' }).success).toBe(false);
  });

  it('rejects rating above 5', () => {
    expect(reviewSchema.safeParse({ rating: 6, body: 'Too much' }).success).toBe(false);
  });

  it('rejects body shorter than 3 chars', () => {
    expect(reviewSchema.safeParse({ rating: 3, body: 'Hi' }).success).toBe(false);
  });

  it('rejects title longer than 100 chars', () => {
    expect(reviewSchema.safeParse({ rating: 3, title: 'T'.repeat(101), body: 'OK body' }).success).toBe(false);
  });
});
