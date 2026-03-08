import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, clearCredentials } from '@/features/auth/store/authSlice';
import cartReducer, { setCart, clearCart, setCartToken } from '@/features/cart/store/cartSlice';
import catalogReducer, { setFilters, clearFilters } from '@/features/catalog/store/catalogSlice';
import checkoutReducer, { setStep, setCheckoutData, resetCheckout } from '@/features/checkout/store/checkoutSlice';

function createStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      catalog: catalogReducer,
      cart: cartReducer,
      checkout: checkoutReducer,
    },
  });
}

describe('Store integration', () => {
  it('initialises with correct default state shape', () => {
    const store = createStore();
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.cart.items).toEqual([]);
    expect(state.catalog.filters.sort).toBe('newest');
    expect(state.checkout.step).toBe('address');
  });

  describe('Shopping flow simulation', () => {
    it('simulates browse → add to cart → checkout flow', () => {
      const store = createStore();

      // 1. User browses products (sets filter)
      store.dispatch(setFilters({ categoryId: 1, sort: 'price_asc' }));
      expect(store.getState().catalog.filters.categoryId).toBe(1);

      // 2. User adds item to cart (cart data arrives from API)
      store.dispatch(setCart({
        items: [{
          id: 1,
          quantity: 2,
          unitPrice: 179,
          lineTotal: 358,
          product: { id: 1, name: 'Poondu Thokku' },
          variant: { id: 1, sku: 'PnT-250' },
          isInStock: true,
        }],
        subtotal: 358,
        grandTotal: 358,
        itemCount: 1,
      }));
      expect(store.getState().cart.items).toHaveLength(1);
      expect(store.getState().cart.grandTotal).toBe(358);

      // 3. User logs in
      store.dispatch(setCredentials({
        user: { id: 1, name: 'Test', email: 'test@test.com', role: 'customer' },
        accessToken: 'jwt-token',
      }));
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // 4. User proceeds to checkout
      store.dispatch(setStep('address'));
      store.dispatch(setCheckoutData({ shippingAddressId: 5 }));
      store.dispatch(setStep('shipping'));
      store.dispatch(setCheckoutData({ shippingMethodId: 1 }));
      store.dispatch(setStep('review'));
      store.dispatch(setStep('payment'));

      expect(store.getState().checkout.step).toBe('payment');
      expect(store.getState().checkout.shippingAddressId).toBe(5);
      expect(store.getState().checkout.shippingMethodId).toBe(1);
    });
  });

  describe('Cart token persistence', () => {
    it('sets cart token to localStorage', () => {
      const store = createStore();
      store.dispatch(setCartToken('guest-token-xyz'));
      expect(store.getState().cart.cartToken).toBe('guest-token-xyz');
      expect(localStorage.getItem('cart_token')).toBe('guest-token-xyz');
    });

    it('clears cart token from localStorage', () => {
      const store = createStore();
      store.dispatch(setCartToken('token'));
      store.dispatch(setCartToken(null));
      expect(localStorage.getItem('cart_token')).toBeNull();
    });
  });

  describe('Logout clears auth state', () => {
    it('resets auth on clearCredentials', () => {
      const store = createStore();
      store.dispatch(setCredentials({
        user: { id: 1, name: 'User', email: 'u@u.com', role: 'customer' },
        accessToken: 'token',
      }));
      store.dispatch(clearCredentials());
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.user).toBeNull();
    });
  });

  describe('Reset flows', () => {
    it('clearCart resets cart state', () => {
      const store = createStore();
      store.dispatch(setCart({ items: [{ id: 1, quantity: 1, unitPrice: 100, lineTotal: 100, product: { id: 1, name: 'X' }, variant: null, isInStock: true }], grandTotal: 100, itemCount: 1 }));
      store.dispatch(clearCart());
      expect(store.getState().cart.items).toEqual([]);
      expect(store.getState().cart.grandTotal).toBe(0);
    });

    it('resetCheckout resets checkout state', () => {
      const store = createStore();
      store.dispatch(setCheckoutData({ shippingAddressId: 5, step: 'payment' as any }));
      store.dispatch(resetCheckout());
      expect(store.getState().checkout.step).toBe('address');
      expect(store.getState().checkout.shippingAddressId).toBeNull();
    });

    it('clearFilters resets catalog filters', () => {
      const store = createStore();
      store.dispatch(setFilters({ categoryId: 2, sort: 'price_desc', page: 3 }));
      store.dispatch(clearFilters());
      expect(store.getState().catalog.filters.categoryId).toBeNull();
      expect(store.getState().catalog.filters.sort).toBe('newest');
      expect(store.getState().catalog.filters.page).toBe(1);
    });
  });
});
