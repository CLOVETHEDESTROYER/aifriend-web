import { CustomCallConfig, CustomCallResponse, CallHandlers, WebSocketMessage } from '../types/call';

export class CallService {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
  private handlers: CallHandlers = {};
  private isConnecting = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async initiateCustomCall(config: CustomCallConfig): Promise<CustomCallResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/incoming-custom-call/${config.scenario_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: config.phone_number }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      return response.json();
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  connectToCustomCall(scenarioId: string, handlers: CallHandlers): void {
    this.handlers = handlers;
    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/media-stream-custom/${scenarioId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handlers.onError?.(error as Error);
    }
  }

  disconnectCall(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.reconnectAttempts = 0;
      this.handlers = {};
    }
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
      this.isConnecting = false;
    };

    this.ws.onmessage = this.handleWebSocketMessage.bind(this);

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handlers.onError?.(new Error('WebSocket connection error'));
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.reconnectWebSocket();
    };
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.event) {
        case 'start':
          if (message.streamSid) {
            this.handlers.onStart?.(message.streamSid);
          }
          break;

        case 'media':
          if (message.media) {
            this.handlers.onMedia?.(message.media);
          }
          break;

        case 'mark':
          // Handle mark events if needed
          break;

        default:
          console.warn('Unknown message event:', message);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.handlers.onError?.(new Error('Failed to process message'));
    }
  }

  private reconnectWebSocket(): void {
    if (this.isConnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.handlers.onError?.(new Error('Failed to reconnect to WebSocket'));
      return;
    }

    this.isConnecting = true;
    this.reconnectAttempts++;
    this.reconnectTimeout *= 2; // Exponential backoff

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      if (this.ws?.readyState === WebSocket.CLOSED) {
        this.connectToCustomCall(
          this.ws.url.split('/').pop() || '', // Get scenario ID from URL
          this.handlers
        );
      }
    }, this.reconnectTimeout);
  }
} 