import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, { setCart, setCartToken, clearCart, type CartItem } from './cartSlice';

const sampleItem: CartItem = {
  id: 1,
  quantity: 2,
  unitPrice: 179,
  lineTotal: 358,
  product: { id: 1, name: 'Poondu Thokku', primaryImageUrl: '/img.jpg' },
  variant: { id: 1, sku: 'PnT-250' },
  isInStock: true,
};

describe('cartSlice', () => {
  const initialState = {
    items: [],
    coupon: null,
    subtotal: 0,
    discountAmount: 0,
    shippingCost: null,
    taxAmount: null,
    grandTotal: 0,
    itemCount: 0,
    cartToken: null,
  };

  it('returns initial state', () => {
    const state = cartReducer(undefined, { type: 'unknown' });
    expect(state.items).toEqual([]);
    expect(state.grandTotal).toBe(0);
    expect(state.itemCount).toBe(0);
  });

  describe('setCart', () => {
    it('merges partial cart data', () => {
      const state = cartReducer(initialState, setCart({
        items: [sampleItem],
        subtotal: 358,
        grandTotal: 358,
        itemCount: 2,
      }));
      expect(state.items).toHaveLength(1);
      expect(state.subtotal).toBe(358);
      expect(state.grandTotal).toBe(358);
      expect(state.itemCount).toBe(2);
      // other fields preserved
      expect(state.coupon).toBeNull();
    });

    it('applies coupon data', () => {
      const state = cartReducer(initialState, setCart({
        coupon: { code: 'SAVE10', type: 'percentage', value: 10 },
        discountAmount: 35.8,
        grandTotal: 322.2,
      }));
      expect(state.coupon?.code).toBe('SAVE10');
      expect(state.discountAmount).toBe(35.8);
    });

    it('sets shipping cost', () => {
      const state = cartReducer(initialState, setCart({ shippingCost: 50 }));
      expect(state.shippingCost).toBe(50);
    });
  });

  describe('setCartToken', () => {
    it('saves token to state and localStorage', () => {
      const state = cartReducer(initialState, setCartToken('abc123'));
      expect(state.cartToken).toBe('abc123');
      expect(localStorage.getItem('cart_token')).toBe('abc123');
    });

    it('clears token from state and localStorage', () => {
      localStorage.setItem('cart_token', 'abc123');
      const state = cartReducer(initialState, setCartToken(null));
      expect(state.cartToken).toBeNull();
      expect(localStorage.getItem('cart_token')).toBeNull();
    });
  });

  describe('clearCart', () => {
    it('resets cart to initial state while keeping cartToken', () => {
      const populated = {
        ...initialState,
        items: [sampleItem],
        subtotal: 358,
        grandTotal: 358,
        itemCount: 2,
      };
      const state = cartReducer(populated, clearCart());
      expect(state.items).toEqual([]);
      expect(state.subtotal).toBe(0);
      expect(state.grandTotal).toBe(0);
      expect(state.itemCount).toBe(0);
    });
  });
});
