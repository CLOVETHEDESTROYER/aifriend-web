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
  async (error: AxiosError) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
      serverError: error.response?.data?.detail || error.response?.data
    });

    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      if (!error.config?._retry && !error.config?.url?.includes('/token')) {
        error.config._retry = true;
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
    }

    // Handle 500 Internal Server Error
    if (error.response.status === 500) {
      const errorDetail = error.response.data?.detail || error.response.data;
      console.error('Server Error Details:', errorDetail);
      throw new Error(`Server error: ${errorDetail || 'An unexpected error occurred'}`);
    }

    // Handle CORS errors
    if (error.message.includes('Network Error') || error.message.includes('CORS')) {
      console.error('CORS/Network Error Details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });
      throw new Error('Unable to connect to the server. Please try again later.');
    }

    const errorMessage = error.response?.data?.detail || error.response?.data || error.message || 'An error occurred';
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
  id: number;
  transcript_sid: string;
  status: string;
  full_text: string;
  date_created: string;
  date_updated: string;
  duration: number;
  language_code: string;
  created_at: string;
}

// New enhanced transcript interfaces
export interface EnhancedTranscriptRecord {
  transcript_sid: string;
  call_date: string;
  duration: number;
  call_direction: string;
  scenario_name: string;
  participant_info: {
    [channel: string]: {
      channel: number;
      role: string;
      name: string;
      total_speaking_time: number;
      word_count: number;
      sentence_count: number;
    };
  };
  conversation_flow: Array<{
    sequence: number;
    speaker: {
      channel: number;
      role: string;
      name: string;
    };
    text: string;
    start_time: number;
    end_time: number;
    duration: number;
    confidence: number;
    word_count: number;
  }>;
  summary_data: {
    total_duration_seconds: number;
    total_sentences: number;
    total_words: number;
    participant_count: number;
    average_confidence: number;
    conversation_stats: {
      turns: number;
      avg_words_per_turn: number;
      speaking_time_distribution: {
        [channel: string]: {
          percentage: number;
          seconds: number;
        };
      };
    };
  };
  media_url?: string;
  source_type: string;
  status: string;
  full_text: string;
  date_created: string;
  date_updated: string;
  language_code: string;
  created_at: string;
}

export interface EnhancedTranscriptListItem {
  transcript_sid: string;
  call_date: string;
  duration: number;
  call_direction: string;
  scenario_name: string;
  status: string;
  participant_count: number;
  total_words: number;
  average_confidence: number;
}

// Twilio transcript interfaces (for the working endpoint)
export interface TwilioTranscriptSentence {
  text: string;
  speaker: number;
  start_time: number;
  end_time: number;
  confidence: number;
}

export interface TwilioTranscriptResponse {
  sid: string;
  status: string;
  date_created: string;
  date_updated: string;
  duration: number;
  language_code: string;
  sentences: TwilioTranscriptSentence[];
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
    // Legacy transcript methods (keeping for backward compatibility)
    getTranscripts: async (skip = 0, limit = 10) => {
      const response = await apiClient.get<TranscriptRecord[]>('/stored-transcripts/', {
        params: { skip, limit }
      });
      return response.data;
    },
    getTranscriptById: async (transcriptSid: string) => {
      try {
        const response = await apiClient.get<TranscriptRecord>(`/stored-transcripts/${transcriptSid}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          throw new Error(`Failed to fetch transcript: ${error.response.data?.detail || 'Server error'}`);
        }
        throw error;
      }
    },
    // New enhanced transcript methods
    getEnhancedTranscripts: async (
      skip = 0, 
      limit = 10, 
      filters?: {
        call_direction?: string;
        scenario_name?: string;
        date_from?: string;
        date_to?: string;
      }
    ) => {
      const params: any = { skip, limit };
      if (filters) {
        Object.assign(params, filters);
      }
      
      const response = await apiClient.get<EnhancedTranscriptListItem[]>('/api/enhanced-transcripts/', {
        params
      });
      return response.data;
    },
    getEnhancedTranscriptById: async (transcriptSid: string) => {
      try {
        const response = await apiClient.get<EnhancedTranscriptRecord>(`/api/enhanced-transcripts/${transcriptSid}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          throw new Error(`Failed to fetch enhanced transcript: ${error.response.data?.detail || 'Server error'}`);
        }
        throw error;
      }
    },
    // Working Twilio transcript methods
    getTwilioTranscripts: async (skip = 0, limit = 10) => {
      const response = await apiClient.get('/twilio-transcripts', {
        params: { page_size: limit, page_token: skip > 0 ? skip.toString() : undefined }
      });
      return response.data;
    },
    getTwilioTranscriptById: async (transcriptSid: string) => {
      try {
        const response = await apiClient.get<TwilioTranscriptResponse>(`/twilio-transcripts/${transcriptSid}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          throw new Error(`Failed to fetch Twilio transcript: ${error.response.data?.detail || 'Server error'}`);
        }
        throw error;
      }
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
      try {
        const response = await apiClient.get('/google-calendar/auth');
        const { authorization_url } = response.data;
        window.location.href = authorization_url;
      } catch (error) {
        console.error('Error getting authorization URL:', error);
        throw new Error('Failed to initiate Google Calendar authorization');
      }
    },
    getEvents: async () => {
      const response = await apiClient.get('/google-calendar/events');
      return response.data;
    },
    // Check credentials by trying to fetch events - if it fails, user needs to authenticate
    checkCredentials: async () => {
      try {
        await apiClient.get('/google-calendar/events');
        return { has_credentials: true };
      } catch (error) {
        return { has_credentials: false };
      }
    },
    // Note: The backend doesn't have a revoke endpoint, so we'll just redirect to re-auth
    revokeAccess: async () => {
      // Since there's no revoke endpoint, we'll just clear any local state
      // and the user will need to re-authenticate
      throw new Error('Revoke access not implemented in backend. Please re-authenticate.');
    }
  }
};

export default api;