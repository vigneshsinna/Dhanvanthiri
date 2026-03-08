import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'popularity' | 'rating';

interface CatalogState {
  filters: {
    categoryId: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    tags: string[];
    sort: SortOption;
    page: number;
    perPage: number;
  };
  selectedVariant: Record<number, number>;
}

const initialState: CatalogState = {
  filters: {
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    tags: [],
    sort: 'newest',
    page: 1,
    perPage: 20,
  },
  selectedVariant: {},
};

const slice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CatalogState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedVariant: (state, action: PayloadAction<{ productId: number; variantId: number }>) => {
      state.selectedVariant[action.payload.productId] = action.payload.variantId;
    },
  },
});

export const { setFilters, clearFilters, setSelectedVariant } = slice.actions;
export default slice.reducer;
