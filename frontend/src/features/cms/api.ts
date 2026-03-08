import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';

export function usePostsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.cms.posts(params),
    queryFn: async () => {
      const res = await api.get('/posts', { params });
      return res.data;
    },
  });
}

export function usePostQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.cms.post(slug),
    enabled: !!slug,
    queryFn: async () => {
      const res = await api.get(`/posts/${slug}`);
      return res.data;
    },
  });
}

export function usePageQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.cms.page(slug),
    enabled: !!slug,
    queryFn: async () => {
      const res = await api.get(`/pages/${slug}`);
      return res.data;
    },
  });
}

export function useFaqsQuery() {
  return useQuery({
    queryKey: queryKeys.cms.faqs,
    queryFn: async () => {
      const res = await api.get('/faqs');
      return res.data;
    },
  });
}

export function useBannersQuery(position?: string) {
  return useQuery({
    queryKey: queryKeys.cms.banners(position),
    queryFn: async () => {
      const res = await api.get('/banners', { params: position ? { position } : {} });
      return res.data;
    },
  });
}

export function useMenuQuery(location: string) {
  return useQuery({
    queryKey: queryKeys.cms.menus(location),
    enabled: !!location,
    queryFn: async () => {
      const res = await api.get(`/menus/${location}`);
      return res.data;
    },
  });
}
