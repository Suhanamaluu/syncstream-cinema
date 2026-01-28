import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConnectionStatus, SyncMessage, UserRole } from '@/types/room';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRoomConnectionOptions {
  roomCode: string;
  role: UserRole;
  userId: string;
  onSyncMessage: (message: SyncMessage) => void;
  onViewerCountChange: (count: number) => void;
}

export const useRoomConnection = ({
  roomCode,
  role,
  userId,
  onSyncMessage,
  onViewerCountChange,
}: UseRoomConnectionOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<Set<string>>(new Set());

  const sendSyncMessage = useCallback((message: Omit<SyncMessage, 'senderId'>) => {
    if (!channelRef.current) return;

    const fullMessage: SyncMessage = {
      ...message,
      senderId: userId,
    };

    console.log('[Room] Sending sync message:', fullMessage.type);
    channelRef.current.send({
      type: 'broadcast',
      event: 'sync',
      payload: fullMessage,
    });
  }, [userId]);

  const sendWebRTCSignal = useCallback((signal: any) => {
    if (!channelRef.current) return;

    console.log('[Room] Sending WebRTC signal:', signal.type);
    channelRef.current.send({
      type: 'broadcast',
      event: 'webrtc',
      payload: { ...signal, senderId: userId },
    });
  }, [userId]);

  useEffect(() => {
    console.log('[Room] Connecting to room:', roomCode);
    
    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: { key: userId },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        console.log('[Room] Presence sync, viewer count:', count);
        onViewerCountChange(count);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Room] User joined:', key);
        presenceRef.current.add(key);
        onViewerCountChange(presenceRef.current.size);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('[Room] User left:', key);
        presenceRef.current.delete(key);
        onViewerCountChange(presenceRef.current.size);
      })
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        if (payload.senderId !== userId) {
          console.log('[Room] Received sync message:', payload.type);
          onSyncMessage(payload as SyncMessage);
        }
      })
      .on('broadcast', { event: 'webrtc' }, ({ payload }) => {
        if (payload.senderId !== userId) {
          console.log('[Room] Received WebRTC signal:', payload.type);
          // Handle WebRTC signals here
        }
      })
      .subscribe(async (status) => {
        console.log('[Room] Channel status:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          await channel.track({
            online_at: new Date().toISOString(),
            role,
            userId,
          });
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('[Room] Disconnecting from room');
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomCode, userId, role, onSyncMessage, onViewerCountChange]);

  return {
    connectionStatus,
    sendSyncMessage,
    sendWebRTCSignal,
  };
};
