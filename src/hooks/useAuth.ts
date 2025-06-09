import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { UserProfile } from '../services/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      isInitialized: false,
      
      login: async (email: string, password: string) => {
        try {
          console.log('🔐 Starting login process...');
          const { token, user } = await api.auth.login({
            username: email,
            password,
          });

          // Synchronize token storage
          localStorage.setItem('token', token.access_token);
          
          const newState = {
            isAuthenticated: true,
            token: token.access_token,
            user: user,
            isInitialized: true,
          };
          
          set(newState);
          console.log('🔐 Login successful, auth state updated:', { 
            isAuthenticated: true, 
            hasToken: !!token.access_token,
            hasUser: !!user 
          });
        } catch (error) {
          console.error('🔐 Login error:', error);
          throw error;
        }
      },
      
      register: async (email: string, password: string) => {
        try {
          console.log('🔐 Starting registration process...');
          await api.auth.register({
            email,
            password,
          });

          // After registration, log in automatically
          await get().login(email, password);
          console.log('🔐 Registration and auto-login successful');
        } catch (error) {
          console.error('🔐 Registration error:', error);
          
          // If registration failed but user might have been created, try to log in
          if (error instanceof Error && 
              (error.message.includes('may have succeeded') || 
               error.message.includes('Network error'))) {
            try {
              console.log('🔐 Attempting auto-login after potential registration success...');
              await get().login(email, password);
              return;
            } catch (loginError) {
              console.error('🔐 Auto-login failed, registration truly failed:', loginError);
              throw new Error('Registration failed. Please try again or contact support if the issue persists.');
            }
          }
          
          throw error;
        }
      },
      
      logout: async () => {
        try {
          console.log('🔐 Logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('businessProfile');
          
          set({
            isAuthenticated: false,
            token: null,
            user: null,
            isInitialized: true,
          });
          
          console.log('🔐 Logout successful');
        } catch (error) {
          console.error('🔐 Logout error:', error);
          throw error;
        }
      },
      
      updateProfile: async () => {
        try {
          const user = await api.auth.getProfile();
          set({ user });
        } catch (error) {
          console.error('🔐 Update profile error:', error);
          // If profile update fails, might be token issue
          if (error instanceof Error && error.message.includes('401')) {
            console.log('🔐 Token appears invalid, logging out');
            await get().logout();
          }
          throw error;
        }
      },
      
      initializeAuth: async () => {
        try {
          console.log('🔐 Initializing authentication...');
          const storedToken = localStorage.getItem('token');
          
          if (storedToken) {
            console.log('🔐 Found stored token, validating...');
            try {
              // Validate token by fetching user profile
              const user = await api.auth.getProfile();
              
              // Token is valid, update state
              set({
                isAuthenticated: true,
                token: storedToken,
                user: user,
                isInitialized: true,
              });
              
              console.log('🔐 Token validation successful, user authenticated');
            } catch (error) {
              console.log('🔐 Token validation failed, clearing auth state');
              localStorage.removeItem('token');
              set({
                isAuthenticated: false,
                token: null,
                user: null,
                isInitialized: true,
              });
            }
          } else {
            console.log('🔐 No stored token found');
            set({
              isAuthenticated: false,
              token: null,
              user: null,
              isInitialized: true,
            });
          }
        } catch (error) {
          console.error('🔐 Auth initialization error:', error);
          set({
            isAuthenticated: false,
            token: null,
            user: null,
            isInitialized: true,
          });
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
      // Ensure localStorage sync on state changes
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('token', state.token);
        }
      },
    }
  )
);

export const useAuth = () => {
  const {
    isAuthenticated,
    token,
    user,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    initializeAuth,
  } = useAuthStore();

  return {
    isAuthenticated,
    token,
    user,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    initializeAuth,
  };
}; 