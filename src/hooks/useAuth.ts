import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { UserProfile } from '../services/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
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
      register: async (email: string, password: string) => {
        try {
          await api.auth.register({
            email,
            password,
          });

          // After registration, log in automatically
          await useAuthStore.getState().login(email, password);
        } catch (error) {
          console.error('Registration error:', error);
          
          // If registration failed but user might have been created, try to log in
          if (error instanceof Error && 
              (error.message.includes('may have succeeded') || 
               error.message.includes('Network error'))) {
            try {
              console.log('Attempting auto-login after potential registration success...');
              await useAuthStore.getState().login(email, password);
              // If login succeeds, registration actually worked
              return;
            } catch (loginError) {
              // If login fails, registration truly failed
              console.error('Auto-login failed, registration truly failed:', loginError);
              throw new Error('Registration failed. Please try again or contact support if the issue persists.');
            }
          }
          
          throw error;
        }
      },
      logout: async () => {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('businessProfile'); // Clear business profile on logout
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