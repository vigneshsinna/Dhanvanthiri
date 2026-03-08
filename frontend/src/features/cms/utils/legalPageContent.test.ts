import { describe, expect, it } from 'vitest';
import { buildLegalPageContent, isLegalPageSlug } from './legalPageContent';

describe('legalPageContent', () => {
  it('recognizes supported legal slugs', () => {
    expect(isLegalPageSlug('privacy-policy')).toBe(true);
    expect(isLegalPageSlug('terms-and-conditions')).toBe(true);
    expect(isLegalPageSlug('faq')).toBe(false);
  });

  it('sanitizes unsafe html and creates heading anchors', () => {
    const result = buildLegalPageContent(`
      <script>alert('x')</script>
      <h2>Privacy Rights</h2>
      <p onclick="evil()">Hello</p>
      <a href="javascript:alert('x')">Bad link</a>
      <h3>Request Access</h3>
    `);

    expect(result.html).not.toContain('<script');
    expect(result.html).not.toContain('onclick=');
    expect(result.html).not.toContain('javascript:');
    expect(result.html).toContain('id="privacy-rights"');
    expect(result.html).toContain('id="request-access"');
    expect(result.headings).toEqual([
      { id: 'privacy-rights', level: 2, text: 'Privacy Rights' },
      { id: 'request-access', level: 3, text: 'Request Access' },
    ]);
  });

  it('keeps duplicate heading ids unique', () => {
    const result = buildLegalPageContent(`
      <h2>Contact</h2>
      <h2>Contact</h2>
    `);

    expect(result.headings).toEqual([
      { id: 'contact', level: 2, text: 'Contact' },
      { id: 'contact-2', level: 2, text: 'Contact' },
    ]);
  });
});
