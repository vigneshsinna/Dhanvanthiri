import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';

export function useOrdersQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: async () => {
      const res = await api.get('/orders', { params });
      return res.data;
    },
  });
}

export function useOrderQuery(orderNumber: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderNumber),
    enabled: !!orderNumber,
    queryFn: async () => {
      const res = await api.get(`/orders/${orderNumber}`);
      return res.data;
    },
  });
}

export function useOrderTrackingQuery(orderId: number) {
  return useQuery({
    queryKey: queryKeys.orders.tracking(orderId),
    enabled: !!orderId,
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}/tracking`);
      return res.data;
    },
  });
}

export function useCancelOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number; reason: string }) => {
      const res = await api.post(`/orders/${orderId}/cancel`, { reason });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.list() });
    },
  });
}

export function useReturnRequestMutation() {
  return useMutation({
    mutationFn: async ({ orderId, ...payload }: {
      orderId: number;
      refund_type: 'original_payment' | 'store_credit' | 'exchange';
      description?: string;
      items: { order_item_id: number; quantity: number; reason: string; condition: 'unopened' | 'like_new' | 'used' | 'damaged' }[];
    }) => {
      const res = await api.post(`/orders/${orderId}/returns`, payload);
      return res.data;
    },
  });
}

export function useGuestOrderTrackingMutation() {
  return useMutation({
    mutationFn: async (payload: { order_number: string } & ({ email: string } | { phone: string } | { email: string; phone: string })) => {
      const res = await api.post('/orders/track', payload);
      return res.data;
    },
  });
}
