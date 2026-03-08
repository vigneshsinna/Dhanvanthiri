import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: { id: number; name: string; primaryImageUrl?: string };
  variant: { id: number; sku: string } | null;
  isInStock: boolean;
}

interface CartState {
  items: CartItem[];
  coupon: { code: string; type: string; value: number } | null;
  subtotal: number;
  discountAmount: number;
  shippingCost: number | null;
  taxAmount: number | null;
  grandTotal: number;
  itemCount: number;
  cartToken: string | null;
}

const initialState: CartState = {
  items: [],
  coupon: null,
  subtotal: 0,
  discountAmount: 0,
  shippingCost: null,
  taxAmount: null,
  grandTotal: 0,
  itemCount: 0,
  cartToken: localStorage.getItem('cart_token'),
};

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<Partial<CartState>>) => ({ ...state, ...action.payload }),
    setCartToken: (state, action: PayloadAction<string | null>) => {
      state.cartToken = action.payload;
      if (action.payload) {
        localStorage.setItem('cart_token', action.payload);
      } else {
        localStorage.removeItem('cart_token');
      }
    },
    clearCart: () => ({ ...initialState, cartToken: initialState.cartToken }),
  },
});

export const { setCart, setCartToken, clearCart } = slice.actions;
export default slice.reducer;
