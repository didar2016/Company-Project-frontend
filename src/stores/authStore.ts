import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@/types';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  clearError: () => void;
  forceLogout: (message?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { user, tokens } = response.data.data;
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          toast({
            variant: 'success',
            title: 'Welcome back!',
            description: `Logged in as ${user.name}`,
          });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed';
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, role?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(email, password, name, role);
          const { user, tokens } = response.data.data;
          
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          toast({
            variant: 'success',
            title: 'Account created!',
            description: 'Your account has been created successfully.',
          });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Registration failed';
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('website-storage');
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          toast({
            title: 'Logged out',
            description: 'You have been logged out successfully.',
          });
        }
      },

      forceLogout: (message?: string) => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('website-storage');
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        toast({
          variant: 'destructive',
          title: 'Session Expired',
          description: message || 'Your session has expired. Please log in again.',
        });
      },

      getMe: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getMe();
          set({
            user: response.data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
