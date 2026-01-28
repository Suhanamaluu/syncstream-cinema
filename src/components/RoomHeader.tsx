import { Button } from '@/components/ui/button';
import { StatusIndicator } from './StatusIndicator';
import { ConnectionStatus, ControlMode, PlaybackState, UserRole } from '@/types/room';
import { Copy, LogOut, Lock, Unlock, Check } from 'lucide-react';
import { useState } from 'react';

interface RoomHeaderProps {
  roomCode: string;
  role: UserRole;
  connectionStatus: ConnectionStatus;
  playbackState: PlaybackState;
  viewerCount: number;
  controlMode: ControlMode;
  lastActionBy?: string | null;
  onLeaveRoom: () => void;
  onToggleControlMode?: () => void;
}

export const RoomHeader = ({
  roomCode,
  role,
  connectionStatus,
  playbackState,
  viewerCount,
  controlMode,
  lastActionBy,
  onLeaveRoom,
  onToggleControlMode,
}: RoomHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="glass border-b border-border/50 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Logo and Room info */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-display font-bold gradient-text">WatchTogether</h1>
          
          <div className="flex items-center gap-2">
            <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Room:</span>
              <span className="font-mono font-bold text-foreground tracking-wider">{roomCode}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:bg-primary/20"
                onClick={copyRoomCode}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              role === 'host' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {role === 'host' ? 'Host' : 'Viewer'}
            </span>
          </div>
        </div>

        {/* Right side - Status and controls */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <StatusIndicator
            connectionStatus={connectionStatus}
            playbackState={playbackState}
            viewerCount={viewerCount}
            lastActionBy={lastActionBy}
          />
          
          <div className="flex items-center gap-2">
            {role === 'host' && onToggleControlMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleControlMode}
                className="hidden sm:flex items-center gap-2 hover:bg-primary/20"
              >
                {controlMode === 'host-only' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Host Only</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Free Control</span>
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeaveRoom}
              className="text-destructive hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
