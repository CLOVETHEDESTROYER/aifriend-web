interface ApiConfig {
  baseURL: string;
  wsURL: string;
}

interface RealtimeSession {
  id: string;
  scenario: string;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
}

interface IncomingCallData {
  sessionId: string;
  caller: {
    id: string;
    name: string;
  };
  scenario: string;
}

export class ApiService {
  private config: ApiConfig;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  public async createRealtimeSession(
    scenario: string
  ): Promise<RealtimeSession> {
    return this.request<RealtimeSession>('/realtime-session/create', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  }

  public async handleIncomingCall(callData: IncomingCallData): Promise<void> {
    await this.request('/incoming-call', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  }

  public async scheduleCall(data: {
    scenario: string;
    scheduledTime: string;
    duration: number;
  }): Promise<RealtimeSession> {
    return this.request<RealtimeSession>('/schedule-call', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getUserProfile(): Promise<{
    id: string;
    name: string;
    email: string;
  }> {
    return this.request('/user/profile');
  }

  public async updateUserProfile(data: {
    name?: string;
    email?: string;
  }): Promise<void> {
    await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async getCallHistory(): Promise<RealtimeSession[]> {
    return this.request('/calls/history');
  }
} 