import { cn } from '@/lib/utils';
import { ConnectionStatus, PlaybackState } from '@/types/room';
import { Wifi, WifiOff, Play, Pause, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  connectionStatus: ConnectionStatus;
  playbackState: PlaybackState;
  viewerCount: number;
  lastActionBy?: string | null;
}

export const StatusIndicator = ({
  connectionStatus,
  playbackState,
  viewerCount,
  lastActionBy,
}: StatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Connection Status */}
      <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
        {connectionStatus === 'connected' ? (
          <>
            <div className="status-dot status-dot-connected" />
            <Wifi className="w-4 h-4 text-success" />
            <span className="text-sm text-success font-medium">Connected</span>
          </>
        ) : connectionStatus === 'connecting' ? (
          <>
            <Loader2 className="w-4 h-4 text-warning animate-spin" />
            <span className="text-sm text-warning font-medium">Connecting...</span>
          </>
        ) : (
          <>
            <div className="status-dot status-dot-disconnected" />
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">Disconnected</span>
          </>
        )}
      </div>

      {/* Playback Status */}
      <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
        {playbackState === 'playing' ? (
          <>
            <Play className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm text-foreground font-medium">Playing</span>
          </>
        ) : playbackState === 'buffering' ? (
          <>
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm text-foreground font-medium">Buffering</span>
          </>
        ) : (
          <>
            <Pause className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Paused</span>
          </>
        )}
      </div>

      {/* Viewer Count */}
      <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm text-foreground font-medium">
          {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
        </span>
      </div>

      {/* Last Action */}
      {lastActionBy && (
        <div className="text-xs text-muted-foreground italic">
          {playbackState === 'paused' ? 'Paused' : 'Played'} by {lastActionBy}
        </div>
      )}
    </div>
  );
};
