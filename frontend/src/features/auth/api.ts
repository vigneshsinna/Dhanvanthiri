import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    enabled,
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await api.post('/auth/login', payload);
      return res.data;
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string; password_confirmation: string }) => {
      const res = await api.post('/auth/register', payload);
      return res.data;
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/logout');
      return res.data;
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await api.post('/auth/forgot-password', payload);
      return res.data;
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { token: string; email: string; password: string; password_confirmation: string }) => {
      const res = await api.post('/auth/reset-password', payload);
      return res.data;
    },
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; phone?: string }) => {
      const res = await api.put('/profile', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { current_password: string; password: string; password_confirmation: string }) => {
      const res = await api.put('/profile/password', payload);
      return res.data;
    },
  });
}

export function useUploadAvatarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await api.post('/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}
