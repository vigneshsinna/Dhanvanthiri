import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type CheckoutStep = 'address' | 'shipping' | 'review' | 'payment' | 'confirmation';

interface CheckoutState {
  step: CheckoutStep;
  shippingAddressId: number | null;
  billingAddressId: number | null;
  billingSameAsShipping: boolean;
  shippingMethodId: number | null;
  gateway: 'razorpay' | null;
  orderId: number | null;
  razorpayOrderId: string | null;
  isProcessing: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  step: 'address',
  shippingAddressId: null,
  billingAddressId: null,
  billingSameAsShipping: true,
  shippingMethodId: null,
  gateway: 'razorpay',
  orderId: null,
  razorpayOrderId: null,
  isProcessing: false,
  error: null,
};

const slice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.step = action.payload;
    },
    setCheckoutData: (state, action: PayloadAction<Partial<CheckoutState>>) => {
      Object.assign(state, action.payload);
    },
    resetCheckout: () => initialState,
  },
});

export const { setStep, setCheckoutData, resetCheckout } = slice.actions;
export default slice.reducer;
