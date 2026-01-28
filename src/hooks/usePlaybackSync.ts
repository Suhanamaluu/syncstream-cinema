import { useCallback, useRef, useState } from 'react';
import { PlaybackState, SyncMessage, UserRole } from '@/types/room';

const SYNC_THRESHOLD = 0.5; // Ignore time differences less than 0.5 seconds

interface UsePlaybackSyncOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  role: UserRole;
  sendSyncMessage: (message: Omit<SyncMessage, 'senderId'>) => void;
  userId: string;
}

export const usePlaybackSync = ({ 
  videoRef, 
  role, 
  sendSyncMessage, 
  userId 
}: UsePlaybackSyncOptions) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('paused');
  const [lastActionBy, setLastActionBy] = useState<string | null>(null);
  const isExternalUpdateRef = useRef(false);
  const lastSyncTimeRef = useRef(0);

  // Prevent infinite loops by marking external updates
  const markExternalUpdate = useCallback(() => {
    isExternalUpdateRef.current = true;
    // Reset after a short delay
    setTimeout(() => {
      isExternalUpdateRef.current = false;
    }, 100);
  }, []);

  const handlePlay = useCallback(() => {
    if (!videoRef.current || isExternalUpdateRef.current) return;
    
    console.log('[Sync] Play triggered locally');
    setPlaybackState('playing');
    setLastActionBy('You');
    
    sendSyncMessage({
      type: 'play',
      timestamp: Date.now(),
      currentTime: videoRef.current.currentTime,
      senderRole: role,
    });
  }, [videoRef, sendSyncMessage, role]);

  const handlePause = useCallback(() => {
    if (!videoRef.current || isExternalUpdateRef.current) return;
    
    console.log('[Sync] Pause triggered locally');
    setPlaybackState('paused');
    setLastActionBy('You');
    
    sendSyncMessage({
      type: 'pause',
      timestamp: Date.now(),
      currentTime: videoRef.current.currentTime,
      senderRole: role,
    });
  }, [videoRef, sendSyncMessage, role]);

  const handleSeek = useCallback(() => {
    if (!videoRef.current || isExternalUpdateRef.current) return;
    
    const now = Date.now();
    // Debounce seek events
    if (now - lastSyncTimeRef.current < 200) return;
    lastSyncTimeRef.current = now;
    
    console.log('[Sync] Seek triggered locally to:', videoRef.current.currentTime);
    setLastActionBy('You');
    
    sendSyncMessage({
      type: 'seek',
      timestamp: now,
      currentTime: videoRef.current.currentTime,
      senderRole: role,
    });
  }, [videoRef, sendSyncMessage, role]);

  const handleSyncMessage = useCallback((message: SyncMessage) => {
    if (!videoRef.current) return;
    if (message.senderId === userId) return; // Ignore own messages
    
    const video = videoRef.current;
    markExternalUpdate();
    
    console.log('[Sync] Received sync message:', message.type);
    setLastActionBy(message.senderRole === 'host' ? 'Host' : 'Viewer');
    
    switch (message.type) {
      case 'play':
        // Sync time if difference is significant
        if (Math.abs(video.currentTime - message.currentTime) > SYNC_THRESHOLD) {
          video.currentTime = message.currentTime;
        }
        video.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('[Sync] Play error:', err);
          }
        });
        setPlaybackState('playing');
        break;
        
      case 'pause':
        video.pause();
        if (Math.abs(video.currentTime - message.currentTime) > SYNC_THRESHOLD) {
          video.currentTime = message.currentTime;
        }
        setPlaybackState('paused');
        break;
        
      case 'seek':
        if (Math.abs(video.currentTime - message.currentTime) > SYNC_THRESHOLD) {
          video.currentTime = message.currentTime;
        }
        break;
        
      case 'sync-response':
        video.currentTime = message.currentTime;
        break;
    }
  }, [videoRef, userId, markExternalUpdate]);

  const requestSync = useCallback(() => {
    sendSyncMessage({
      type: 'sync-request',
      timestamp: Date.now(),
      currentTime: 0,
      senderRole: role,
    });
  }, [sendSyncMessage, role]);

  const respondToSyncRequest = useCallback((requesterId: string) => {
    if (!videoRef.current || role !== 'host') return;
    
    sendSyncMessage({
      type: 'sync-response',
      timestamp: Date.now(),
      currentTime: videoRef.current.currentTime,
      senderRole: role,
    });
  }, [videoRef, sendSyncMessage, role]);

  return {
    playbackState,
    lastActionBy,
    handlePlay,
    handlePause,
    handleSeek,
    handleSyncMessage,
    requestSync,
    respondToSyncRequest,
    setPlaybackState,
  };
};
