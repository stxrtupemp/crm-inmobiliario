import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { tokenStorage } from '../lib/tokenStorage';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'VIEWER';

export interface AuthUser {
  id:         string;
  email:      string;
  name:       string;
  role:       UserRole;
  phone:      string | null;
  avatar_url: string | null;
  active:     boolean;
  tenant_id:  string | null;
}

interface AuthState {
  user:            AuthUser | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isAuthenticated: boolean;

  setAuth:       (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setUser:       (user: AuthUser) => void;
  logout:        () => void;
  isAdmin:       () => boolean;
  isAgent:       () => boolean;
  isSuperAdmin:  () => boolean;
  hasRole:       (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        tokenStorage.setTokens(accessToken, refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        tokenStorage.clear();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      isAdmin:      () => get().user?.role === 'ADMIN' || get().user?.role === 'SUPER_ADMIN',
      isAgent:      () => get().user?.role === 'AGENT',
      isSuperAdmin: () => get().user?.role === 'SUPER_ADMIN',
      hasRole:      (roles) => {
        const role = get().user?.role;
        return role ? roles.includes(role) : false;
      },
    }),
    {
      name:    'crm_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
