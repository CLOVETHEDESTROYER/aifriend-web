import { create } from 'zustand';
import { WebRTCService } from '../services/webrtc';
import { ApiService } from '../services/api';

interface ActiveCall {
  sessionId: string;
  scenario: string;
  startTime: Date;
  isMuted: boolean;
}

interface CallState {
  activeCall: ActiveCall | null;
  isConnecting: boolean;
  error: Error | null;
  webrtcService: WebRTCService | null;
  apiService: ApiService | null;
  initializeServices: (webrtc: WebRTCService, api: ApiService) => void;
  startCall: (sessionId: string, scenario: string) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  setError: (error: Error | null) => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  isConnecting: false,
  error: null,
  webrtcService: null,
  apiService: null,

  initializeServices: (webrtc: WebRTCService, api: ApiService) => {
    set({ webrtcService: webrtc, apiService: api });
  },

  startCall: async (sessionId: string, scenario: string) => {
    const { webrtcService, apiService } = get();
    if (!webrtcService || !apiService) {
      throw new Error('Services not initialized');
    }

    try {
      set({ isConnecting: true, error: null });

      // Initialize WebRTC connection
      await webrtcService.initializeCall(sessionId);

      set({
        activeCall: {
          sessionId,
          scenario,
          startTime: new Date(),
          isMuted: false,
        },
        isConnecting: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('Failed to start call'),
        isConnecting: false,
      });
      throw error;
    }
  },

  endCall: async () => {
    const { webrtcService, activeCall } = get();
    if (!webrtcService || !activeCall) return;

    try {
      await webrtcService.closeConnection();
      set({ activeCall: null, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('Failed to end call'),
      });
      throw error;
    }
  },

  toggleMute: async () => {
    const { webrtcService, activeCall } = get();
    if (!webrtcService || !activeCall) return;

    try {
      const isMuted = await webrtcService.toggleMute();
      set({
        activeCall: {
          ...activeCall,
          isMuted,
        },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('Failed to toggle mute'),
      });
      throw error;
    }
  },

  setError: (error: Error | null) => set({ error }),
})); 