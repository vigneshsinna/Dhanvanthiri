import { describe, it, expect } from 'vitest';
import checkoutReducer, { setStep, setCheckoutData, resetCheckout } from './checkoutSlice';

describe('checkoutSlice', () => {
  const initialState = {
    step: 'address' as const,
    shippingAddressId: null,
    billingAddressId: null,
    billingSameAsShipping: true,
    shippingMethodId: null,
    gateway: 'razorpay' as const,
    orderId: null,
    razorpayOrderId: null,
    isProcessing: false,
    error: null,
  };

  it('returns initial state', () => {
    const state = checkoutReducer(undefined, { type: 'unknown' });
    expect(state.step).toBe('address');
    expect(state.gateway).toBe('razorpay');
    expect(state.isProcessing).toBe(false);
  });

  describe('setStep', () => {
    it('sets step to shipping', () => {
      const state = checkoutReducer(undefined, setStep('shipping'));
      expect(state.step).toBe('shipping');
    });

    it('progresses through checkout steps', () => {
      let state = checkoutReducer(undefined, setStep('address'));
      state = checkoutReducer(state, setStep('shipping'));
      state = checkoutReducer(state, setStep('review'));
      state = checkoutReducer(state, setStep('payment'));
      state = checkoutReducer(state, setStep('confirmation'));
      expect(state.step).toBe('confirmation');
    });
  });

  describe('setCheckoutData', () => {
    it('sets shipping address', () => {
      const state = checkoutReducer(undefined, setCheckoutData({ shippingAddressId: 5 }));
      expect(state.shippingAddressId).toBe(5);
    });

    it('sets processing state', () => {
      const state = checkoutReducer(undefined, setCheckoutData({ isProcessing: true }));
      expect(state.isProcessing).toBe(true);
    });

    it('sets razorpay data', () => {
      const state = checkoutReducer(undefined, setCheckoutData({
        orderId: 100,
        razorpayOrderId: 'order_abc123',
      }));
      expect(state.orderId).toBe(100);
      expect(state.razorpayOrderId).toBe('order_abc123');
    });

    it('sets error', () => {
      const state = checkoutReducer(undefined, setCheckoutData({ error: 'Payment failed' }));
      expect(state.error).toBe('Payment failed');
    });
  });

  describe('resetCheckout', () => {
    it('resets to initial state', () => {
      let state = checkoutReducer(undefined, setCheckoutData({
        shippingAddressId: 5,
        step: 'payment' as any,
        isProcessing: true,
      }));
      state = checkoutReducer(state, resetCheckout());
      expect(state).toEqual(initialState);
    });
  });
});
