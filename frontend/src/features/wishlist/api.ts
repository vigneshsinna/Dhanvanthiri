import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

const wishlistKeys = {
  list: ['wishlist'] as const,
};

export function useWishlistQuery() {
  return useQuery({
    queryKey: wishlistKeys.list,
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data;
    },
  });
}

export function useAddToWishlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { product_id: number; variant_id?: number | null }) => {
      const res = await api.post('/wishlist', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: wishlistKeys.list }),
  });
}

export function useRemoveFromWishlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/wishlist/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: wishlistKeys.list }),
  });
}
