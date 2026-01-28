export type UserRole = 'host' | 'viewer';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export type PlaybackState = 'playing' | 'paused' | 'buffering';
export type ControlMode = 'free' | 'host-only';

export interface RoomState {
  roomCode: string;
  role: UserRole;
  connectionStatus: ConnectionStatus;
  playbackState: PlaybackState;
  currentTime: number;
  controlMode: ControlMode;
  viewerCount: number;
  lastActionBy: string | null;
}

export interface SyncMessage {
  type: 'play' | 'pause' | 'seek' | 'sync-request' | 'sync-response' | 'viewer-joined' | 'viewer-left';
  timestamp: number;
  currentTime: number;
  senderId: string;
  senderRole: UserRole;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  senderId: string;
  targetId?: string;
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
}
