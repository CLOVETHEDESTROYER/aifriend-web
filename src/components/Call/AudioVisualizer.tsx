import React, { useEffect, useRef } from 'react';
import { AudioVisualizerProps } from '../../types/call';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioData,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Set up the visualization style
    ctx.fillStyle = '#4F46E5'; // Indigo color
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2;

    // Calculate bar width and spacing
    const bufferLength = audioData.length;
    const barWidth = (width / bufferLength) * 2.5;
    const barSpacing = 1;

    let x = 0;

    // Draw the visualization
    for (let i = 0; i < bufferLength; i++) {
      // Convert dB value to height
      // audioData values typically range from -100 to 0
      const db = audioData[i];
      const barHeight = ((db + 100) / 100) * height;

      ctx.fillRect(
        x,
        height - barHeight,
        barWidth - barSpacing,
        barHeight
      );

      x += barWidth;
    }
  }, [audioData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
}; 