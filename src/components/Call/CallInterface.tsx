import React, { useEffect, useRef, useState } from 'react';
import { PhoneXMarkIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { AudioVisualizer } from './AudioVisualizer';

interface CallInterfaceProps {
  scenarioId: string;
  streamSid: string;
  onEnd: () => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  scenarioId,
  streamSid,
  onEnd,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Initialize Web Audio API
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const updateAudioVisualization = () => {
    if (!analyserRef.current) return;

    const dataArray = new Float32Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getFloatFrequencyData(dataArray);
    setAudioData(dataArray);

    animationFrameRef.current = requestAnimationFrame(updateAudioVisualization);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implement actual muting logic here
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full">
            <h2 className="text-xl font-semibold text-center mb-2">
              Active Call
            </h2>
            <p className="text-gray-500 text-center">
              Stream ID: {streamSid}
            </p>
          </div>

          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <AudioVisualizer
              audioData={audioData}
              width={400}
              height={128}
            />
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full ${
                isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              } hover:bg-opacity-75`}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-6 w-6" />
              ) : (
                <SpeakerWaveIcon className="h-6 w-6" />
              )}
            </button>

            <button
              onClick={onEnd}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              <PhoneXMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 