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
      serverError: (error.response?.data as any)?.detail || error.response?.data
    });

    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      if (!(error.config as any)?._retry && !error.config?.url?.includes('/token')) {
        (error.config as any)._retry = true;
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
    }

    // Handle 500 Internal Server Error
    if (error.response.status === 500) {
      const errorDetail = (error.response.data as any)?.detail || error.response.data;
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

    const errorMessage = (error.response?.data as any)?.detail || error.response?.data || error.message || 'An error occurred';
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
          if (error.response?.status === 400) {
            const detail = error.response?.data?.detail;
            if (detail && detail.includes('already registered')) {
              throw new Error('Email already registered');
            }
            throw new Error(detail || 'Registration failed - invalid data');
          }
          if (error.response?.status === 500) {
            // Backend has a bug where it creates the user but returns 500
            // We'll treat this as a potential success and let the auto-login handle it
            console.warn('Registration returned 500 but user may have been created. Attempting auto-login...');
            return { message: 'Registration may have succeeded despite server error' };
          }
          if (error.code === 'ERR_NETWORK' || !error.response) {
            // Network error or no response - could be a 500 that didn't get through
            console.warn('Network error during registration. User may have been created. Attempting auto-login...');
            return { message: 'Registration may have succeeded despite network error' };
          }
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
    },
    // New stored Twilio transcript methods (same format as Twilio API)
    getStoredTwilioTranscripts: async (skip = 0, limit = 10) => {
      // Use the working endpoint from backend logs: /stored-transcripts/
      const response = await apiClient.get('/stored-transcripts/', {
        params: { skip, limit } // Use skip/limit format like other endpoints
      });
      
      // Transform to match Twilio API format expected by frontend
      return {
        transcripts: response.data || []
      };
    },
    getStoredTwilioTranscriptById: async (transcriptSid: string) => {
      try {
        // Use the working endpoint from backend logs: /stored-transcripts/{id}
        const response = await apiClient.get<TranscriptRecord>(`/stored-transcripts/${transcriptSid}`);
        
        // Transform legacy format to Twilio format if needed
        const legacyData = response.data;
        
        // Check if it's already in Twilio format (has sentences property)
        if ('sentences' in legacyData && Array.isArray((legacyData as any).sentences)) {
          return legacyData as unknown as TwilioTranscriptResponse;
        }
        
        // Otherwise, transform legacy format to Twilio format
        const twilioFormat: TwilioTranscriptResponse = {
          sid: legacyData.transcript_sid,
          status: legacyData.status,
          date_created: legacyData.date_created,
          date_updated: legacyData.date_updated,
          duration: legacyData.duration,
          language_code: legacyData.language_code,
          sentences: legacyData.full_text ? 
            // Convert full_text to sentences format
            legacyData.full_text.split('.').filter(s => s.trim()).map((sentence, index) => ({
              text: sentence.trim() + '.',
              speaker: index % 2, // Alternate speakers
              start_time: (index * legacyData.duration) / legacyData.full_text!.split('.').length,
              end_time: ((index + 1) * legacyData.duration) / legacyData.full_text!.split('.').length,
              confidence: 0.85
            })) : []
        };
        
        return twilioFormat;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          throw new Error(`Failed to fetch stored transcript: ${error.response.data?.detail || 'Server error'}`);
        }
        throw error;
      }
    },
    // Twilio Account Management
    getTwilioAccount: async () => {
      const response = await apiClient.get('/twilio/account');
      return response.data;
    },
    provisionPhoneNumber: async (areaCode?: string) => {
      const response = await apiClient.post('/twilio/provision-number', { area_code: areaCode });
      return response.data;
    },
    releasePhoneNumber: async (phoneNumber: string) => {
      const response = await apiClient.delete(`/twilio/release-number/${phoneNumber}`);
      return response.data;
    },
    getUserPhoneNumbers: async () => {
      const response = await apiClient.get('/twilio/user-numbers');
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
      try {
        const response = await apiClient.get('/google-calendar/auth');
        const { authorization_url } = response.data;
        window.location.href = authorization_url;
      } catch (error) {
        console.error('Error getting authorization URL:', error);
        throw new Error('Failed to initiate Google Calendar authorization');
      }
    },
    getEvents: async (maxResults = 50) => {
      try {
        // Get events from 2 years ago to 1 year in the future to maintain full history
        const timeMin = new Date();
        timeMin.setFullYear(timeMin.getFullYear() - 2);
        
        const timeMax = new Date();
        timeMax.setFullYear(timeMax.getFullYear() + 1);
        
        const params = new URLSearchParams({
          max_results: maxResults.toString(),
          time_min: timeMin.toISOString(),
          time_max: timeMax.toISOString()
        });
        
        // Debug: Log the parameters being sent
        console.log('📅 Calendar API request parameters:', {
          max_results: maxResults,
          time_min: timeMin.toISOString(),
          time_max: timeMax.toISOString(),
          url: `/google-calendar/events?${params}`,
          currentDate: new Date().toISOString()
        });
        
        const response = await apiClient.get(`/google-calendar/events?${params}`);
        
        // Debug: Log the response in detail
        const events = response.data || [];
        console.log('📅 Calendar API response details:', {
          eventCount: events.length,
          requestedRange: {
            from: timeMin.toISOString(),
            to: timeMax.toISOString()
          },
          actualEventDates: events.length > 0 ? {
            earliest: Math.min(...events.map((e: any) => new Date(e.start).getTime())),
            latest: Math.max(...events.map((e: any) => new Date(e.start).getTime())),
            earliestFormatted: new Date(Math.min(...events.map((e: any) => new Date(e.start).getTime()))).toISOString(),
            latestFormatted: new Date(Math.max(...events.map((e: any) => new Date(e.start).getTime()))).toISOString()
          } : 'No events found',
          eventsInLastWeek: events.filter((e: any) => {
            const eventDate = new Date(e.start);
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            return eventDate >= lastWeek;
          }).length,
          eventsInJune2025: events.filter((e: any) => {
            const eventDate = new Date(e.start);
            return eventDate.getFullYear() === 2025 && eventDate.getMonth() === 5; // June = month 5
          }).length,
          sampleEventDates: events.slice(0, 5).map((e: any) => ({
            summary: e.summary,
            start: e.start,
            parsed: new Date(e.start).toISOString()
          }))
        });
        
        return events;
      } catch (error) {
        console.error('Calendar API error:', error);
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          const errorDetail = (error.response?.data as any)?.detail as string;
          if (errorDetail && errorDetail.includes('invalid_grant')) {
            // Token has expired or is invalid, need to re-authorize
            throw new Error('REAUTH_REQUIRED');
          }
        }
        throw error;
      }
    },
    // Add a new method to get events without date restrictions for testing
    getAllEventsUnfiltered: async (maxResults = 1000) => {
      try {
        // Try to get events without any date filtering parameters
        const params = new URLSearchParams({
          max_results: maxResults.toString()
        });
        
        console.log('📅 Attempting to get ALL events without date filters...');
        
        const response = await apiClient.get(`/google-calendar/events?${params}`);
        const events = response.data || [];
        
        console.log('📅 Unfiltered events response:', {
          totalEvents: events.length,
          eventsByYear: events.reduce((acc: any, event: any) => {
            const year = new Date(event.start).getFullYear();
            acc[year] = (acc[year] || 0) + 1;
            return acc;
          }, {}),
          eventsByMonth: events.reduce((acc: any, event: any) => {
            const date = new Date(event.start);
            const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {})
        });
        
        return events;
      } catch (error) {
        console.error('Unfiltered calendar API error:', error);
        throw error;
      }
    },
    // Check credentials by trying to fetch events - if it fails, user needs to authenticate
    checkCredentials: async () => {
      try {
        // Use same time range as getEvents to test full historical access
        const timeMin = new Date();
        timeMin.setFullYear(timeMin.getFullYear() - 2);
        
        const timeMax = new Date();
        timeMax.setFullYear(timeMax.getFullYear() + 1);
        
        const params = new URLSearchParams({
          max_results: '1',
          time_min: timeMin.toISOString(),
          time_max: timeMax.toISOString()
        });
        
        await apiClient.get(`/google-calendar/events?${params}`);
        return true;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          const errorDetail = (error.response?.data as any)?.detail as string;
          if (errorDetail && errorDetail.includes('invalid_grant')) {
            return false;
          }
        }
        throw error;
      }
    },
    makeCalendarCall: async (phoneNumber: string) => {
      try {
        const response = await apiClient.get(`/make-calendar-call-scenario/${phoneNumber}`);
        return response.data;
      } catch (error) {
        console.error('Error making calendar call:', error);
        throw error;
      }
    }
  },
};

export default api;