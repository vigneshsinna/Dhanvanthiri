import { describe, it, expect } from 'vitest';
import { loginSchema } from './loginSchema';
import { registerSchema } from './registerSchema';

describe('loginSchema', () => {
  it('accepts valid email + password', () => {
    expect(loginSchema.safeParse({ email: 'test@test.com', password: 'abc' }).success).toBe(true);
  });

  it('rejects empty email', () => {
    expect(loginSchema.safeParse({ email: '', password: 'abc' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'notanemail', password: 'abc' }).success).toBe(false);
  });

  it('rejects empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = { name: 'John Doe', email: 'john@test.com', password: 'Abcdef1!', confirmPassword: 'Abcdef1!' };

  it('accepts valid input', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects name shorter than 2 chars', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'J' }).success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'A'.repeat(101) }).success).toBe(false);
  });

  it('rejects password shorter than 8', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Ab1!', confirmPassword: 'Ab1!' }).success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'abcdefg1', confirmPassword: 'abcdefg1' }).success).toBe(false);
  });

  it('rejects password without digit', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Abcdefgh', confirmPassword: 'Abcdefgh' }).success).toBe(false);
  });

  it('rejects mismatched confirmPassword', () => {
    expect(registerSchema.safeParse({ ...valid, confirmPassword: 'Different1' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false);
  });
});
