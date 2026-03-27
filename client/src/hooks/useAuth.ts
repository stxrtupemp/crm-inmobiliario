import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { apiPost, apiGet } from '../lib/api';
import type { AuthUser } from '../stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginPayload  { email: string; password: string; }
interface LoginResponse { user: AuthUser; tokens: { access_token: string; refresh_token: string; expires_in: string }; }

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const store       = useAuthStore();

  // ── Login mutation ────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiPost<LoginResponse>('/auth/login', payload),

    onSuccess: ({ user, tokens }) => {
      store.setAuth(user, tokens.access_token, tokens.refresh_token);
      toast.success(`Bienvenido, ${user.name.split(' ')[0]}`);
      navigate('/admin/dashboard', { replace: true });
    },

    onError: () => {
      // Global mutation error handler in queryClient will show toast
    },
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await apiPost('/auth/logout');
    } catch {
      // Ignore — we still clear local state
    } finally {
      store.logout();
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  };

  // ── Profile (sync store from server on mount) ─────────────────────────────
  const profileQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn:  () => apiGet<{ user: AuthUser }>('/auth/me').then((d) => d.user),
    enabled:  store.isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 min
    retry:    false,
  });

  // Sync server user into store if it changed
  if (profileQuery.data && JSON.stringify(profileQuery.data) !== JSON.stringify(store.user)) {
    store.setUser(profileQuery.data);
  }

  return {
    user:            store.user,
    isAuthenticated: store.isAuthenticated,
    isAdmin:         store.isAdmin(),
    isAgent:         store.isAgent(),
    hasRole:         store.hasRole,
    login:           loginMutation.mutate,
    loginAsync:      loginMutation.mutateAsync,
    isLoggingIn:     loginMutation.isPending,
    loginError:      loginMutation.error,
    logout,
  };
}
