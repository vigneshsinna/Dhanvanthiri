import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';

export function useAddressesQuery() {
  return useQuery({
    queryKey: queryKeys.checkout.addresses,
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data;
    },
  });
}

export function useCreateAddressMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      label?: string;
      recipient_name: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country_code: string;
      is_default?: boolean;
    }) => {
      const res = await api.post('/addresses', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.checkout.addresses }),
  });
}

export function useCheckoutSummaryMutation() {
  return useMutation({
    mutationFn: async (payload: { address_id: number; shipping_method_id: number }) => {
      const res = await api.post('/checkout/summary', payload);
      return res.data;
    },
  });
}

export function useValidateCheckoutMutation() {
  return useMutation({
    mutationFn: async (payload: { address_id: number; shipping_method_id: number }) => {
      const res = await api.post('/checkout/validate', payload);
      return res.data;
    },
  });
}

export function useCreatePaymentIntentMutation() {
  return useMutation({
    mutationFn: async (payload: {
      gateway: 'razorpay';
      shipping_address_id: number;
      shipping_method_id: number;
      billing_same_as_shipping: boolean;
    }) => {
      const res = await api.post('/payments/intent', payload, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      });
      return res.data;
    },
  });
}

export function useConfirmPaymentMutation() {
  return useMutation({
    mutationFn: async (payload: {
      order_id: number;
      gateway_payment_id: string;
      gateway_order_id: string;
      signature: string;
    }) => {
      const res = await api.post('/payments/confirm', payload);
      return res.data;
    },
  });
}

export function useOrderPaymentQuery(orderId: number | null) {
  return useQuery({
    queryKey: ['payment', orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const res = await api.get(`/payments/${orderId}`);
      return res.data;
    },
  });
}

// --- Guest Checkout APIs ---

export function useGuestValidateCheckoutMutation() {
  return useMutation({
    mutationFn: async (payload: { guest_email: string; guest_phone: string }) => {
      const res = await api.post('/guest/checkout/validate', payload);
      return res.data;
    },
  });
}

export function useGuestCheckoutSummaryMutation() {
  return useMutation({
    mutationFn: async (payload: { shipping_method_id?: number }) => {
      const res = await api.post('/guest/checkout/summary', payload);
      return res.data;
    },
  });
}

export function useGuestCreatePaymentIntentMutation() {
  return useMutation({
    mutationFn: async (payload: {
      gateway: 'razorpay';
      guest_email: string;
      guest_phone: string;
      shipping_address: {
        recipient_name: string;
        phone: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country_code?: string;
      };
      shipping_method_id?: number;
      shipping_cost?: number;
      notes?: string;
    }) => {
      const res = await api.post('/guest/payments/intent', payload, {
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      });
      return res.data;
    },
  });
}

export function useGuestConfirmPaymentMutation() {
  return useMutation({
    mutationFn: async (payload: {
      order_id: number;
      gateway_payment_id: string;
      gateway_order_id: string;
      signature: string;
    }) => {
      const res = await api.post('/guest/payments/confirm', payload);
      return res.data;
    },
  });
}
