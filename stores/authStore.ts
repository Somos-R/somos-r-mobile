import { create } from 'zustand';
import type { Citizen, Recycler } from '@/types/auth.types';

type AuthUser = Citizen | Recycler;

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
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
  logout: () => {
    globalThis.__authToken = undefined;
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
