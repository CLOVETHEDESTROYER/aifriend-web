import React, { useEffect, useRef, useState } from 'react';
import { useCallStore } from '../../store/callStore';
import { MicrophoneIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { MicrophoneIcon as MicrophoneIconOutline } from '@heroicons/react/24/outline';

interface CallInterfaceProps {
  sessionId: string;
  scenario: string;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  sessionId,
  scenario,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    activeCall,
    startCall,
    endCall,
    toggleMute,
  } = useCallStore();

  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsConnecting(true);
        setError(null);
        await startCall(sessionId, scenario);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start call');
      } finally {
        setIsConnecting(false);
      }
    };

    if (sessionId && scenario) {
      initializeCall();
    }

    return () => {
      endCall();
    };
  }, [sessionId, scenario, startCall, endCall]);

  const handleEndCall = async () => {
    try {
      await endCall();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end call');
    }
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle mute');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <audio ref={audioRef} autoPlay />
      
      <div className="flex-1 flex items-center justify-center">
        {isConnecting ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting...</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {activeCall ? 'In Call' : 'Call Ended'}
            </h2>
            <p className="text-gray-400">{scenario}</p>
            {activeCall && (
              <p className="text-sm text-gray-400 mt-2">
                Duration: {formatDuration(new Date().getTime() - activeCall.startTime.getTime())}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-8 flex justify-center space-x-6">
        <button
          onClick={handleToggleMute}
          disabled={!activeCall || isConnecting}
          className={`p-4 rounded-full ${
            activeCall?.isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {activeCall?.isMuted ? (
            <MicrophoneIconOutline className="h-6 w-6" />
          ) : (
            <MicrophoneIcon className="h-6 w-6" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          disabled={!activeCall || isConnecting}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PhoneIcon className="h-6 w-6 transform rotate-135" />
        </button>
      </div>
    </div>
  );
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const pad = (n: number): string => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
  }
  return `${pad(minutes)}:${pad(seconds % 60)}`;
}; 