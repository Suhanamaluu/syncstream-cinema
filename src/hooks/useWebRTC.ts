import { useCallback, useRef, useState } from 'react';
import { UserRole } from '@/types/room';

const STUN_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface UseWebRTCOptions {
  role: UserRole;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export const useWebRTC = ({ role, onRemoteStream, onConnectionStateChange }: UseWebRTCOptions) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');

  const createPeerConnection = useCallback(() => {
    console.log('[WebRTC] Creating peer connection');
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] ICE candidate generated');
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
      onConnectionStateChange?.(pc.connectionState);
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received');
      if (event.streams[0]) {
        onRemoteStream?.(event.streams[0]);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [onRemoteStream, onConnectionStateChange]);

  const startLocalStream = useCallback(async (videoElement: HTMLVideoElement) => {
    if (role !== 'host') return null;

    try {
      // For host, we capture from the video element using captureStream
      const stream = (videoElement as any).captureStream?.() || 
                     (videoElement as any).mozCaptureStream?.();
      
      if (stream) {
        localStreamRef.current = stream;
        console.log('[WebRTC] Local stream captured from video element');
        return stream;
      }
    } catch (error) {
      console.error('[WebRTC] Error capturing stream:', error);
    }
    return null;
  }, [role]);

  const createOffer = useCallback(async () => {
    const pc = peerConnectionRef.current || createPeerConnection();
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log('[WebRTC] Offer created');
    return offer;
  }, [createPeerConnection]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current || createPeerConnection();
    
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log('[WebRTC] Answer created');
    return answer;
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(answer));
    console.log('[WebRTC] Answer received and set');
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    console.log('[WebRTC] ICE candidate added');
  }, []);

  const getPeerConnection = useCallback(() => {
    return peerConnectionRef.current;
  }, []);

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    console.log('[WebRTC] Cleanup complete');
  }, []);

  return {
    connectionState,
    createPeerConnection,
    startLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    getPeerConnection,
    cleanup,
  };
};
