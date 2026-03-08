import { describe, it, expect } from 'vitest';
import { fallbackProducts, fallbackCategories, fallbackFaqs, resolveFallbackImage } from './fallbackData';

describe('fallbackData', () => {
  describe('fallbackProducts', () => {
    it('has 27 products', () => {
      expect(fallbackProducts).toHaveLength(27);
    });

    it('every product has required fields', () => {
      fallbackProducts.forEach((p) => {
        expect(p.id).toBeGreaterThan(0);
        expect(p.name).toBeTruthy();
        expect(p.slug).toBeTruthy();
        expect(p.price).toBeGreaterThan(0);
        expect(p.primary_image_url).toBeTruthy();
        expect(p.status).toBe('active');
        expect(p.variants).toHaveLength(1);
        expect(p.tags.length).toBeGreaterThan(0);
      });
    });

    it('has correct categories: Thokku (10), Urukai (3), Podi (14)', () => {
      const thokku = fallbackProducts.filter(p => p.tags.some(t => t.name === 'Thokku'));
      const urukai = fallbackProducts.filter(p => p.tags.some(t => t.name === 'Urukai'));
      const podi = fallbackProducts.filter(p => p.tags.some(t => t.name === 'Podi'));
      expect(thokku).toHaveLength(10);
      expect(urukai).toHaveLength(3);
      expect(podi).toHaveLength(14);
    });

    it('all slugs are unique', () => {
      const slugs = fallbackProducts.map(p => p.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('all IDs are unique', () => {
      const ids = fallbackProducts.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every product has a rating between 0 and 5', () => {
      fallbackProducts.forEach((p) => {
        expect(p.avg_rating).toBeGreaterThanOrEqual(0);
        expect(p.avg_rating).toBeLessThanOrEqual(5);
      });
    });

    it('compare_at_price is higher than price when present', () => {
      fallbackProducts.forEach((p) => {
        if (p.compare_at_price) {
          expect(p.compare_at_price).toBeGreaterThan(p.price);
        }
      });
    });
  });

  describe('fallbackCategories', () => {
    it('has 3 categories', () => {
      expect(fallbackCategories).toHaveLength(3);
    });

    it('has correct category names', () => {
      const names = fallbackCategories.map(c => c.name);
      expect(names).toContain('Thokku');
      expect(names).toContain('Urukai');
      expect(names).toContain('Podi');
    });

    it('each category has a slug', () => {
      fallbackCategories.forEach(c => {
        expect(c.slug).toBeTruthy();
      });
    });
  });

  describe('fallbackFaqs', () => {
    it('has 8 FAQs', () => {
      expect(fallbackFaqs).toHaveLength(8);
    });

    it('each FAQ has question and answer', () => {
      fallbackFaqs.forEach(faq => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
        expect(faq.category).toBeTruthy();
      });
    });
  });

  describe('resolveFallbackImage', () => {
    it('resolves by slug', () => {
      const img = resolveFallbackImage('Poondu Thokku', 'poondu-thokku');
      expect(img).toContain('Poondu Thokku');
    });

    it('resolves by name', () => {
      const img = resolveFallbackImage('Idly Podi');
      expect(img).toContain('Idly Podi');
    });

    it('falls back deterministically by id', () => {
      const img = resolveFallbackImage(undefined, undefined, 1);
      expect(img).toBeTruthy();
    });

    it('returns a string for unknown product', () => {
      const img = resolveFallbackImage('Unknown Product XYZ', 'unknown-xyz', 999);
      expect(typeof img).toBe('string');
    });
  });
});
