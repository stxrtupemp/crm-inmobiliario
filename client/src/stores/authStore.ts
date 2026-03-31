import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { tokenStorage } from '../lib/tokenStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'AGENT' | 'VIEWER';

export interface AuthUser {
  id:         string;
  email:      string;
  name:       string;
  role:       UserRole;
  phone:      string | null;
  avatar_url: string | null;
  active:     boolean;
}

interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth:  (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setUser:  (user: AuthUser) => void;
  logout:   () => void;

  // Helpers
  isAdmin:  () => boolean;
  isAgent:  () => boolean;
  hasRole:  (roles: UserRole[]) => boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

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

      isAdmin:  () => get().user?.role === 'ADMIN',
      isAgent:  () => get().user?.role === 'AGENT',
      hasRole:  (roles) => {
        const role = get().user?.role;
        return role ? roles.includes(role) : false;
      },
    }),
    {
      name:    'crm_auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist user metadata — tokens are in tokenStorage (also localStorage)
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
