import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';

export interface AdminFeatureModule {
  id: number;
  module_code: string;
  module_name: string;
  description: string | null;
  is_enabled: boolean;
  license_type: string | null;
  license_key: string | null;
  valid_from: string | null;
  valid_to: string | null;
  integration_status: 'not_configured' | 'configured' | 'healthy' | 'degraded' | 'failed';
  health_status: 'unknown' | 'healthy' | 'degraded' | 'failed';
  last_validated_at: string | null;
  vendor_name: string | null;
  notes: string | null;
  config_json: Record<string, unknown> | null;
  has_credentials: boolean;
  activated_by: number | null;
  activated_by_name: string | null;
  activated_on: string | null;
  updated_by: number | null;
  updated_by_name: string | null;
  updated_at: string | null;
}

export function useDashboardSummaryQuery(period: 'today' | 'week' | 'month' | 'year') {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(period),
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/summary', { params: { period } });
      return res.data;
    },
  });
}

export function useAdminProductsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.products(params),
    queryFn: async () => {
      const res = await api.get('/admin/products', { params });
      return res.data;
    },
  });
}

export function useAdminCreateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useAdminUpdateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      formData.append('_method', 'PUT');
      const res = await api.post(`/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useAdminDeleteProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/products/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });
}

export function useAdminOrdersQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.orders(params),
    queryFn: async () => {
      const res = await api.get('/admin/orders', { params });
      return res.data;
    },
  });
}

export function useAdminUpdateOrderStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const res = await api.put(`/admin/orders/${id}/status`, { status, notes });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });
}

export function useAdminCustomersQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.customers(params),
    queryFn: async () => {
      const res = await api.get('/admin/customers', { params });
      return res.data;
    },
  });
}

export function useAdminInventoryQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.inventory(params),
    queryFn: async () => {
      const res = await api.get('/admin/inventory', { params });
      return res.data;
    },
  });
}

export function useAdminUpdateStockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stock_quantity }: { id: number; stock_quantity: number }) => {
      const res = await api.put(`/admin/inventory/${id}`, { stock_quantity });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'inventory'] }),
  });
}

export function useRevenueChartQuery(params: { period: string; group_by: string }) {
  return useQuery({
    queryKey: queryKeys.admin.analytics('revenue', params),
    queryFn: async () => {
      const res = await api.get('/admin/analytics/revenue', { params });
      return res.data;
    },
  });
}

// ── Categories ──
export function useAdminCategoriesQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.categories(params),
    queryFn: async () => {
      const res = await api.get('/admin/categories', { params });
      return res.data;
    },
  });
}

export function useAdminCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/admin/categories', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

export function useAdminUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await api.put(`/admin/categories/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

export function useAdminDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/categories/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
}

// ── Reviews ──
export function useAdminReviewsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.reviews(params),
    queryFn: async () => {
      const res = await api.get('/admin/reviews', { params });
      return res.data;
    },
  });
}

export function useAdminUpdateReviewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await api.put(`/admin/reviews/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}

export function useAdminDeleteReviewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/reviews/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}

// ── CMS Pages ──
export function useAdminPagesQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.pages(params),
    queryFn: async () => {
      const res = await api.get('/admin/pages', { params });
      return res.data;
    },
  });
}

export function useAdminCreatePageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/admin/pages', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pages'] }),
  });
}

export function useAdminUpdatePageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await api.put(`/admin/pages/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pages'] }),
  });
}

export function useAdminDeletePageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/pages/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pages'] }),
  });
}

// ── CMS Posts ──
export function useAdminPostsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.posts(params),
    queryFn: async () => {
      const res = await api.get('/admin/posts', { params });
      return res.data;
    },
  });
}

export function useAdminCreatePostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/admin/posts', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'posts'] }),
  });
}

export function useAdminUpdatePostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await api.put(`/admin/posts/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'posts'] }),
  });
}

export function useAdminDeletePostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/posts/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'posts'] }),
  });
}

// ── CMS Banners ──
export function useAdminBannersQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.banners(params),
    queryFn: async () => {
      const res = await api.get('/admin/banners', { params });
      return res.data;
    },
  });
}

export function useAdminCreateBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/admin/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'banners'] }),
  });
}

export function useAdminUpdateBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      formData.append('_method', 'PUT');
      const res = await api.post(`/admin/banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'banners'] }),
  });
}

export function useAdminDeleteBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/banners/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'banners'] }),
  });
}

// ── CMS FAQs ──
export function useAdminFaqsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.faqs(params),
    queryFn: async () => {
      const res = await api.get('/admin/faqs', { params });
      return res.data;
    },
  });
}

export function useAdminCreateFaqMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/admin/faqs', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] }),
  });
}

export function useAdminUpdateFaqMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await api.put(`/admin/faqs/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] }),
  });
}

export function useAdminDeleteFaqMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/faqs/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] }),
  });
}

// ── Media ──
export function useAdminMediaQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.media(params),
    queryFn: async () => {
      const res = await api.get('/admin/media', { params });
      return res.data;
    },
  });
}

export function useAdminUploadMediaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/admin/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'media'] }),
  });
}

export function useAdminDeleteMediaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/media/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'media'] }),
  });
}

// ── Settings ──
export function useAdminSettingsQuery(group?: string) {
  return useQuery({
    queryKey: queryKeys.admin.settings(group),
    queryFn: async () => {
      const res = await api.get('/admin/settings', { params: group ? { group } : {} });
      return res.data;
    },
  });
}

export function useAdminUpdateSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, unknown>) => {
      const res = await api.put('/admin/settings', { settings });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });
}

// -- Module License Management --
export function useAdminModulesQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.modules(params),
    queryFn: async () => {
      const res = await api.get('/admin/modules', { params });
      return res.data;
    },
  });
}

export function useAdminModuleQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.module(id),
    queryFn: async () => {
      const res = await api.get(`/admin/modules/${id}`);
      return res.data;
    },
    enabled,
  });
}

export function useAdminCreateModuleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.post('/admin/modules', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'modules'] });
    },
  });
}

export function useAdminUpdateModuleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Record<string, unknown>) => {
      const res = await api.put(`/admin/modules/${id}`, payload);
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'modules'] });
      qc.invalidateQueries({ queryKey: queryKeys.admin.module(vars.id) });
    },
  });
}

export function useAdminToggleModuleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_enabled, notes }: { id: number; is_enabled: boolean; notes?: string }) => {
      const res = await api.put(`/admin/modules/${id}/toggle`, { is_enabled, notes });
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'modules'] });
      qc.invalidateQueries({ queryKey: queryKeys.admin.module(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.admin.moduleHealth(vars.id) });
    },
  });
}

export function useAdminValidateModuleLicenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, license_key }: { id: number; license_key?: string }) => {
      const res = await api.post(`/admin/modules/${id}/validate-license`, { license_key });
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'modules'] });
      qc.invalidateQueries({ queryKey: queryKeys.admin.module(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.admin.moduleHealth(vars.id) });
    },
  });
}

export function useAdminUpdateModuleCredentialsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, config_json, integration_status, notes }: {
      id: number;
      config_json: Record<string, unknown>;
      integration_status?: 'not_configured' | 'configured' | 'healthy' | 'degraded' | 'failed';
      notes?: string;
    }) => {
      const res = await api.put(`/admin/modules/${id}/credentials`, { config_json, integration_status, notes });
      return res.data;
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'modules'] });
      qc.invalidateQueries({ queryKey: queryKeys.admin.module(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.admin.moduleHealth(vars.id) });
    },
  });
}

export function useAdminModuleHealthQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.moduleHealth(id),
    queryFn: async () => {
      const res = await api.get(`/admin/modules/${id}/health`);
      return res.data;
    },
    enabled,
    retry: false,
  });
}

export function useAdminRequestModuleActivationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await api.post(`/admin/modules/${id}/activation-request`, { reason });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'modules'] }),
  });
}
