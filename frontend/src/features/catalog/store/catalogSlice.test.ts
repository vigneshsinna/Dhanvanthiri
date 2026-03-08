import { describe, it, expect } from 'vitest';
import catalogReducer, { setFilters, clearFilters, setSelectedVariant } from './catalogSlice';

describe('catalogSlice', () => {
  const initialFilters = {
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    tags: [],
    sort: 'newest' as const,
    page: 1,
    perPage: 20,
  };

  it('returns initial state', () => {
    const state = catalogReducer(undefined, { type: 'unknown' });
    expect(state.filters).toEqual(initialFilters);
    expect(state.selectedVariant).toEqual({});
  });

  describe('setFilters', () => {
    it('sets category filter', () => {
      const state = catalogReducer(undefined, setFilters({ categoryId: 1 }));
      expect(state.filters.categoryId).toBe(1);
      // other filters unchanged
      expect(state.filters.sort).toBe('newest');
      expect(state.filters.page).toBe(1);
    });

    it('sets sort option', () => {
      const state = catalogReducer(undefined, setFilters({ sort: 'price_asc' }));
      expect(state.filters.sort).toBe('price_asc');
    });

    it('sets price range', () => {
      const state = catalogReducer(undefined, setFilters({ minPrice: 100, maxPrice: 200 }));
      expect(state.filters.minPrice).toBe(100);
      expect(state.filters.maxPrice).toBe(200);
    });

    it('sets page', () => {
      const state = catalogReducer(undefined, setFilters({ page: 3 }));
      expect(state.filters.page).toBe(3);
    });

    it('merges multiple filter fields', () => {
      const state = catalogReducer(undefined, setFilters({
        categoryId: 2,
        sort: 'price_desc',
        page: 2,
      }));
      expect(state.filters.categoryId).toBe(2);
      expect(state.filters.sort).toBe('price_desc');
      expect(state.filters.page).toBe(2);
    });
  });

  describe('clearFilters', () => {
    it('resets filters to initial values', () => {
      let state = catalogReducer(undefined, setFilters({ categoryId: 1, sort: 'price_asc', page: 5 }));
      state = catalogReducer(state, clearFilters());
      expect(state.filters).toEqual(initialFilters);
    });
  });

  describe('setSelectedVariant', () => {
    it('sets variant for a product', () => {
      const state = catalogReducer(undefined, setSelectedVariant({ productId: 1, variantId: 5 }));
      expect(state.selectedVariant[1]).toBe(5);
    });

    it('can track multiple product variants', () => {
      let state = catalogReducer(undefined, setSelectedVariant({ productId: 1, variantId: 5 }));
      state = catalogReducer(state, setSelectedVariant({ productId: 2, variantId: 10 }));
      expect(state.selectedVariant[1]).toBe(5);
      expect(state.selectedVariant[2]).toBe(10);
    });

    it('updates variant for same product', () => {
      let state = catalogReducer(undefined, setSelectedVariant({ productId: 1, variantId: 5 }));
      state = catalogReducer(state, setSelectedVariant({ productId: 1, variantId: 8 }));
      expect(state.selectedVariant[1]).toBe(8);
    });
  });
});
