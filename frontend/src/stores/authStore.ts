import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { api, apiClient, tokenManager } from '@/lib/api';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),

      setToken: (token) => {
        set({ token });
        // Update token manager (in-memory storage)
        tokenManager.setToken(token);
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login(email, password);
          const { token, user } = response.data;

          set({
            user: user,
            token: token,
            isLoading: false,
          });

          // Update token manager immediately
          tokenManager.setToken(token);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(username, email, password);
          const { token, user } = response.data;

          set({
            user: user,
            token: token,
            isLoading: false,
          });

          // Update token manager immediately
          tokenManager.setToken(token);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
        // Clear token from both memory and localStorage
        tokenManager.setToken(null);
      },

      checkAuth: async () => {
        const tokens = get().token;
        if (!tokens) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient.getCurrentUser();
          set({ user: response.data, isLoading: false });
        } catch (error) {
          // If 401, clear auth state
          if (error instanceof Error && error.message.includes('401')) {
            set({ user: null, token: null, isLoading: false });
            tokenManager.setToken(null);
          } else {
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
