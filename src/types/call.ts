export interface CustomCallConfig {
  scenario_id: string;
  phone_number: string;
}

export interface CustomCallResponse {
  message: string;
  call_sid: string;
}

export interface WebSocketMessage {
  event: 'media' | 'start' | 'mark';
  streamSid?: string;
  media?: {
    payload: string; // base64 encoded audio
    timestamp: number;
  };
}

export interface CallState {
  status: 'idle' | 'connecting' | 'active' | 'ended';
  error?: string;
  streamSid?: string;
}

export interface CallHandlers {
  onStart?: (streamSid: string) => void;
  onMedia?: (media: WebSocketMessage['media']) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
}

export interface AudioVisualizerProps {
  audioData: Float32Array | null;
  height: number;
  width: number;
}

export interface SavedPrompt {
  id: string;
  name: string;
  scenarioId: string;
  prompt: string;
  timestamp: Date;
}

export interface CustomScenarioResponse {
  scenarioId: string;
  message: string;
} 