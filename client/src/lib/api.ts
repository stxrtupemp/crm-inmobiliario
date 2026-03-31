import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { queryClient } from './queryClient';
import { useAuthStore } from '../stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data:    T;
  error?:  { code: string; message: string; issues?: Array<{ path: string; message: string }> };
  meta?:   PaginationMeta;
}

export interface PaginationMeta {
  page:        number;
  limit:       number;
  total:       number;
  total_pages: number;
  has_next:    boolean;
  has_prev:    boolean;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export { tokenStorage } from './tokenStorage';
import { tokenStorage } from './tokenStorage';

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────

let isRefreshing  = false;
let refreshQueue: Array<(token: string) => void> = [];

function flushQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const is401        = error.response?.status === 401;
    const isAuthRoute  = originalRequest.url?.includes('/auth/login') ||
                         originalRequest.url?.includes('/auth/refresh');

    if (!is401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      handleLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the request until refresh completes
      return new Promise((resolve) => {
        refreshQueue.push((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post<ApiResponse<{ tokens: { access_token: string; refresh_token: string } }>>(
        `${import.meta.env['VITE_API_URL'] ?? '/api'}/auth/refresh`,
        { refresh_token: refreshToken },
      );

      const { access_token, refresh_token } = data.data.tokens;
      tokenStorage.setTokens(access_token, refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      flushQueue(access_token);
      originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch {
      handleLogout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleLogout() {
  tokenStorage.clear();
  queryClient.clear();
  useAuthStore.getState().logout();
}

// ─── Generic request wrappers ─────────────────────────────────────────────────

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  return data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiDelete(url: string): Promise<void> {
  await api.delete(url);
}

// Paginated GET — returns { data, meta }
export async function apiList<T>(url: string, params?: Record<string, unknown>): Promise<{ data: T[]; meta: PaginationMeta }> {
  const { data: res } = await api.get<ApiResponse<T[]>>(url, { params });
  return { data: res.data, meta: res.meta! };
}

// ─── Public API (sin interceptor auth — para endpoints públicos) ──────────────

export const publicApi = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});