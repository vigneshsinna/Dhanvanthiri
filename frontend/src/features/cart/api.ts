import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';

export function useCartQuery() {
  return useQuery({
    queryKey: queryKeys.cart.current,
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data;
    },
  });
}

export function useAddCartItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { product_id: number; variant_id?: number; quantity: number }) => {
      const res = await api.post('/cart/items', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}

export function useUpdateCartItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}

export function useRemoveCartItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: number) => {
      const res = await api.delete(`/cart/items/${itemId}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}

export function useClearCartMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete('/cart');
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}

export function useApplyCouponMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string }) => {
      const res = await api.post('/cart/coupon', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}

export function useRemoveCouponMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete('/cart/coupon');
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}

export function useShippingRatesQuery(addressId: number) {
  return useQuery({
    queryKey: queryKeys.cart.shippingRates(addressId),
    enabled: !!addressId,
    queryFn: async () => {
      const res = await api.get('/cart/shipping-rates', { params: { address_id: addressId } });
      return res.data;
    },
  });
}
