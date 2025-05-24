import { useState, useEffect, useCallback } from 'react';
import { CallService } from '../services/CallService';
import { CallState, WebSocketMessage } from '../types/call';

interface UseCustomCallProps {
  scenarioId: string;
}

interface UseCustomCallReturn {
  callState: CallState;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
}

export const useCustomCall = ({ scenarioId }: UseCustomCallProps): UseCustomCallReturn => {
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
  });

  const [callService] = useState(() => new CallService(import.meta.env.VITE_API_URL));

  const handleStart = useCallback((streamSid: string) => {
    setCallState((prev) => ({
      ...prev,
      status: 'active',
      streamSid,
    }));
  }, []);

  const handleMedia = useCallback((media: WebSocketMessage['media']) => {
    if (!media) return;

    // Convert base64 audio to audio buffer and play it
    const audioData = atob(media.payload);
    const arrayBuffer = new ArrayBuffer(audioData.length);
    const view = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < audioData.length; i++) {
      view[i] = audioData.charCodeAt(i);
    }

    // Create and play audio
    const audioContext = new AudioContext();
    audioContext.decodeAudioData(arrayBuffer).then((audioBuffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    });
  }, []);

  const handleError = useCallback((error: Error) => {
    setCallState((prev) => ({
      ...prev,
      status: 'idle',
      error: error.message,
    }));
  }, []);

  const acceptCall = useCallback(async () => {
    try {
      setCallState((prev) => ({
        ...prev,
        status: 'connecting',
      }));

      callService.connectToCustomCall(scenarioId, {
        onStart: handleStart,
        onMedia: handleMedia,
        onError: handleError,
        onEnd: () => {
          setCallState((prev) => ({
            ...prev,
            status: 'ended',
          }));
        },
      });
    } catch (error) {
      handleError(error as Error);
    }
  }, [scenarioId, handleStart, handleMedia, handleError, callService]);

  const rejectCall = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      status: 'ended',
    }));
  }, []);

  const endCall = useCallback(() => {
    callService.disconnectCall();
    setCallState((prev) => ({
      ...prev,
      status: 'ended',
    }));
  }, [callService]);

  useEffect(() => {
    return () => {
      callService.disconnectCall();
    };
  }, [callService]);

  return {
    callState,
    acceptCall,
    rejectCall,
    endCall,
  };
}; 