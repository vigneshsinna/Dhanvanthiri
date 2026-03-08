import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';

export function useProductsQuery(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.catalog.products(filters),
    queryFn: async () => {
      // Map camelCase filter keys to snake_case for the Laravel API
      const params: Record<string, unknown> = {};
      if (filters.categoryId) params.category_id = filters.categoryId;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;
      if (filters.page) params.page = filters.page;
      if (filters.perPage) params.per_page = filters.perPage;
      if (filters.tags && (filters.tags as string[]).length > 0) params.tag = (filters.tags as string[])[0];
      const res = await api.get('/products', { params });
      return res.data;
    },
  });
}

export function useProductQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.catalog.product(slug),
    enabled: !!slug,
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`);
      return res.data;
    },
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.catalog.categories,
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });
}

export function useFeaturedProductsQuery() {
  return useQuery({
    queryKey: queryKeys.catalog.featured,
    queryFn: async () => {
      const res = await api.get('/products/featured');
      return res.data;
    },
  });
}

export function useReviewsQuery(productId: number) {
  return useQuery({
    queryKey: queryKeys.catalog.reviews(productId),
    enabled: !!productId,
    queryFn: async () => {
      const res = await api.get(`/products/${productId}/reviews`);
      return res.data;
    },
  });
}

export function useSubmitReviewMutation(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rating: number; title?: string; body: string }) => {
      const res = await api.post(`/products/${productId}/reviews`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.catalog.reviews(productId) }),
  });
}

export function useRecommendationsQuery(params?: { product_id?: number; category_id?: number; limit?: number }) {
  return useQuery({
    queryKey: ['catalog', 'recommendations', params] as const,
    queryFn: async () => {
      const res = await api.get('/products/recommendations', { params });
      return res.data;
    },
  });
}
