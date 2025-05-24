import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { UserProfile } from '../services/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: async (email: string, password: string) => {
        try {
          const { token, user } = await api.auth.login({
            username: email,
            password,
          });

          set({
            isAuthenticated: true,
            token: token.access_token,
            user: user,
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      register: async (email: string, password: string, name: string) => {
        try {
          await api.auth.register({
            email,
            password,
            name,
          });

          // After registration, log in automatically
          await useAuthStore.getState().login(email, password);
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },
      logout: async () => {
        try {
          localStorage.removeItem('token');
          set({
            isAuthenticated: false,
            token: null,
            user: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },
      updateProfile: async () => {
        try {
          const user = await api.auth.getProfile();
          set({ user });
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useAuth = () => {
  const {
    isAuthenticated,
    token,
    user,
    login,
    register,
    logout,
    updateProfile,
  } = useAuthStore();

  return {
    isAuthenticated,
    token,
    user,
    login,
    register,
    logout,
    updateProfile,
  };
}; 