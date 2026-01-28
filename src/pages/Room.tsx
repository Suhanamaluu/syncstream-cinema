import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RoomHeader } from '@/components/RoomHeader';
import { VideoPlayer } from '@/components/VideoPlayer';
import { FileSelector } from '@/components/FileSelector';
import { useRoomConnection } from '@/hooks/useRoomConnection';
import { usePlaybackSync } from '@/hooks/usePlaybackSync';
import { ControlMode, UserRole, SyncMessage } from '@/types/room';
import { toast } from 'sonner';

const Room = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'viewer';
  
  const userId = useMemo(() => `user_${Math.random().toString(36).substr(2, 9)}`, []);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(1);
  const [controlMode, setControlMode] = useState<ControlMode>('free');

  // Handle sync messages
  const handleSyncMessage = useCallback((message: SyncMessage) => {
    playbackSync.handleSyncMessage(message);
  }, []);

  // Handle viewer count changes
  const handleViewerCountChange = useCallback((count: number) => {
    setViewerCount(count);
  }, []);

  // Room connection
  const { connectionStatus, sendSyncMessage } = useRoomConnection({
    roomCode: roomCode || '',
    role,
    userId,
    onSyncMessage: handleSyncMessage,
    onViewerCountChange: handleViewerCountChange,
  });

  // Playback sync
  const playbackSync = usePlaybackSync({
    videoRef,
    role,
    sendSyncMessage,
    userId,
  });

  // Handle file selection (host only)
  const handleFileSelect = useCallback((file: File, url: string) => {
    setVideoSrc(url);
    toast.success(`Loaded: ${file.name}`);
  }, []);

  // Handle video load
  const handleVideoLoad = useCallback(() => {
    console.log('[Room] Video loaded');
    if (role === 'host') {
      // Notify viewers that video is ready
      sendSyncMessage({
        type: 'sync-response',
        timestamp: Date.now(),
        currentTime: 0,
        senderRole: role,
      });
    }
  }, [role, sendSyncMessage]);

  // Handle leave room
  const handleLeaveRoom = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Toggle control mode (host only)
  const handleToggleControlMode = useCallback(() => {
    setControlMode(prev => prev === 'free' ? 'host-only' : 'free');
    toast.info(`Control mode: ${controlMode === 'free' ? 'Host only' : 'Free control'}`);
  }, [controlMode]);

  // Check if controls should be disabled
  const controlsDisabled = controlMode === 'host-only' && role === 'viewer';

  // Request sync when viewer joins
  useEffect(() => {
    if (role === 'viewer' && connectionStatus === 'connected') {
      playbackSync.requestSync();
    }
  }, [role, connectionStatus, playbackSync.requestSync]);

  if (!roomCode) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <RoomHeader
        roomCode={roomCode}
        role={role}
        connectionStatus={connectionStatus}
        playbackState={playbackSync.playbackState}
        viewerCount={viewerCount}
        controlMode={controlMode}
        lastActionBy={playbackSync.lastActionBy}
        onLeaveRoom={handleLeaveRoom}
        onToggleControlMode={role === 'host' ? handleToggleControlMode : undefined}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl">
          {role === 'host' && !videoSrc ? (
            <div className="glass rounded-2xl p-12 text-center animate-fade-in">
              <h2 className="text-2xl font-display font-semibold mb-6">Select a Video to Share</h2>
              <FileSelector onFileSelect={handleFileSelect} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <VideoPlayer
                ref={videoRef}
                src={videoSrc || undefined}
                isHost={role === 'host'}
                playbackState={playbackSync.playbackState}
                onPlay={playbackSync.handlePlay}
                onPause={playbackSync.handlePause}
                onSeek={playbackSync.handleSeek}
                onVideoLoad={handleVideoLoad}
                controlsDisabled={controlsDisabled}
              />
              
              {controlsDisabled && (
                <p className="text-center text-muted-foreground mt-4 text-sm">
                  Controls are restricted to host only
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Room;
