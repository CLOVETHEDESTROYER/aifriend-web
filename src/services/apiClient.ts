import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: false,
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure content type is set correctly for form data
    if (config.data instanceof URLSearchParams) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
    });

    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      if (!error.config._retry && !error.config.url?.includes('/token')) {
        error.config._retry = true;
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
    }

    const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';
    throw new Error(errorMessage);
  }
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface TranscriptRecord {
  id: string;
  transcript_sid: string;
  status: string;
  full_text: string;
  date_created: string;
  duration: number;
  sentences?: Array<{
    text: string;
    speaker: string;
    timestamp: string;
  }>;
}

export const api = {
  auth: {
    login: async (credentials: LoginCredentials): Promise<{token: TokenResponse; user: UserProfile}> => {
      try {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        
        const tokenResponse = await apiClient.post<TokenResponse>('/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        
        localStorage.setItem('token', tokenResponse.data.access_token);
        
        // Get user profile with the new token
        const userResponse = await apiClient.get<UserProfile>('/users/me');
        
        return {
          token: tokenResponse.data,
          user: userResponse.data
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Incorrect email or password');
          }
          throw new Error(error.response?.data?.detail || 'Login failed');
        }
        throw error;
      }
    },
    register: async (data: RegisterData) => {
      try {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.detail || 'Registration failed');
        }
        throw error;
      }
    },
    getProfile: async (): Promise<UserProfile> => {
      const response = await apiClient.get('/users/me');
      return response.data;
    },
    refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
      const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
      return response.data;
    }
  },
  calls: {
    makeCall: async (phoneNumber: string, scenario: string) => {
      const response = await apiClient.get(`/make-call/${phoneNumber}/${scenario}`);
      return response.data;
    },
    scheduleCall: async (data: {
      phone_number: string;
      scheduled_time: string;
      scenario: string;
    }) => {
      const response = await apiClient.post('/schedule-call', data);
      return response.data;
    },
    getTranscripts: async (skip = 0, limit = 10) => {
      const response = await apiClient.get<TranscriptRecord[]>('/stored-transcripts/', {
        params: { skip, limit }
      });
      return response.data;
    },
    getTranscriptById: async (transcriptSid: string) => {
      const response = await apiClient.get<TranscriptRecord>(`/stored-transcripts/${transcriptSid}`);
      return response.data;
    }
  },
  scenarios: {
    list: async () => {
      const response = await apiClient.get('/custom-scenarios');
      return response.data;
    },
    create: async (data: {
      persona: string;
      prompt: string;
      voice_type: string;
      temperature?: number;
    }) => {
      const response = await apiClient.post('/realtime/custom-scenarios', data);
      return response.data;
    },
    get: async (id: string) => {
      const response = await apiClient.get(`/custom-scenarios/${id}`);
      return response.data;
    },
    update: async (id: string, data: {
      persona?: string;
      prompt?: string;
      voice_type?: string;
      temperature?: number;
    }) => {
      const response = await apiClient.put(`/custom-scenarios/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await apiClient.delete(`/custom-scenarios/${id}`);
    },
    makeCustomCall: async (phoneNumber: string, scenarioId: string) => {
      const response = await apiClient.get(`/make-custom-call/${phoneNumber}/${scenarioId}`);
      return response.data;
    }
  },
  calendar: {
    authorize: async () => {
      window.location.href = `${import.meta.env.VITE_API_URL}/google-calendar/auth`;
    },
    getEvents: async () => {
      const response = await apiClient.get('/google-calendar/events');
      return response.data;
    },
    checkCredentials: async () => {
      const response = await apiClient.get('/google-calendar/credentials-status');
      return response.data;
    },
    revokeAccess: async () => {
      await apiClient.post('/google-calendar/revoke');
    }
  }
};

export default api; 