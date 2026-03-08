import axios from 'axios';
import { store } from '@/app/store';
import { clearCredentials, setAccessToken } from '@/features/auth/store/authSlice';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

async function singleFlightRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((res) => (res.data.data?.access_token ?? res.data.access_token ?? null) as string | null)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const cartToken = state.cart.cartToken;
  if (cartToken && (config.url?.startsWith('/cart') || config.url?.startsWith('/guest'))) {
    config.headers['X-Cart-Token'] = cartToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = (error.config ?? {}) as any;
    const url = String(original.url ?? '');
    const isRefreshCall = url.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retry && !isRefreshCall) {
      original._retry = true;

      const token = await singleFlightRefresh();
      if (token) {
        store.dispatch(setAccessToken(token));
        original.headers = {
          ...(original.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${token}`,
        };
        return api(original);
      }

      store.dispatch(clearCredentials());
    }

    return Promise.reject(error);
  }
);
