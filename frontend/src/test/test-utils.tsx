import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '@/features/auth/store/authSlice';
import catalogReducer from '@/features/catalog/store/catalogSlice';
import cartReducer from '@/features/cart/store/cartSlice';
import checkoutReducer from '@/features/checkout/store/checkoutSlice';
import adminReducer from '@/features/admin/store/adminSlice';
import type { RootState } from '@/app/store';

/**
 * Create a fresh Redux store with optional preloaded state.
 */
export function createTestStore(preloadedState?: Partial<RootState>): EnhancedStore {
  return configureStore({
    reducer: {
      auth: authReducer,
      catalog: catalogReducer,
      cart: cartReducer,
      checkout: checkoutReducer,
      admin: adminReducer,
    },
    preloadedState: preloadedState as RootState,
  });
}

/**
 * Create a fresh React Query client for testing.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: EnhancedStore;
  queryClient?: QueryClient;
  route?: string;
}

/**
 * Custom render that wraps component in Provider, QueryClientProvider,
 * HelmetProvider, and MemoryRouter.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    queryClient = createTestQueryClient(),
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <HelmetProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[route]}>
              {children}
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      </HelmetProvider>
    );
  }
  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
