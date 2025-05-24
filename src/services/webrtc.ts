import { io, Socket } from 'socket.io-client';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export class WebRTCService {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private config: WebRTCConfig;

  constructor(config: WebRTCConfig) {
    this.config = config;
  }

  async initializeCall(sessionId: string): Promise<void> {
    try {
      // Connect to signaling server
      this.socket = io(import.meta.env.VITE_WS_URL, {
        query: { sessionId },
        transports: ['websocket'],
      });

      // Set up socket event handlers
      this.setupSocketHandlers();

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Create and configure RTCPeerConnection
      this.peerConnection = new RTCPeerConnection(this.config);
      this.setupPeerConnectionHandlers();

      // Add local stream tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.cleanup();
      throw error;
    }
  }

  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });

    this.socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
      if (!this.peerConnection) return;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket?.emit('answer', answer);
    });

    this.socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
      if (!this.peerConnection) return;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    this.socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      if (!this.peerConnection) return;
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }

  private setupPeerConnectionHandlers(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('ice-candidate', event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      // Handle remote stream (e.g., play audio)
      const audioElement = new Audio();
      audioElement.srcObject = remoteStream;
      audioElement.play();
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
    };
  }

  async toggleMute(): Promise<boolean> {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return false;

    audioTrack.enabled = !audioTrack.enabled;
    return !audioTrack.enabled;
  }

  async closeConnection(): Promise<void> {
    // Stop all tracks
    this.localStream?.getTracks().forEach(track => track.stop());
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.localStream = null;
  }

  private cleanup(): void {
    this.closeConnection();
  }
} 