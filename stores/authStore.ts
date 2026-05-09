import { create } from 'zustand';
import type { BackendUser } from '@/types/auth.types';

interface AuthState {
  user: BackendUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: BackendUser, token: string) => void;
  updateUser: (updates: Partial<BackendUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    globalThis.__authToken = token;
    set({ user, token, isAuthenticated: true });
  },
  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : state.user,
    }));
  },
  logout: () => {
    globalThis.__authToken = undefined;
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
