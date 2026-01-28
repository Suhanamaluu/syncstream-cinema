import { forwardRef, useEffect, useState } from 'react';
import { VideoControls } from './VideoControls';
import { PlaybackState } from '@/types/room';
import { cn } from '@/lib/utils';
import { Film } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  isHost: boolean;
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: () => void;
  onVideoLoad?: () => void;
  remoteStream?: MediaStream | null;
  controlsDisabled?: boolean;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ 
    src, 
    isHost, 
    playbackState, 
    onPlay, 
    onPause, 
    onSeek,
    onVideoLoad,
    remoteStream,
    controlsDisabled = false 
  }, ref) => {
    const [isHovering, setIsHovering] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);

    useEffect(() => {
      const videoEl = (ref as React.RefObject<HTMLVideoElement>)?.current;
      if (!videoEl) return;

      if (remoteStream && !isHost) {
        videoEl.srcObject = remoteStream;
        setHasVideo(true);
      } else if (src && isHost) {
        videoEl.srcObject = null;
        videoEl.src = src;
        setHasVideo(true);
      }
    }, [src, remoteStream, isHost, ref]);

    const handleLoadedMetadata = () => {
      onVideoLoad?.();
      setHasVideo(true);
    };

    return (
      <div 
        className={cn(
          "video-container relative w-full aspect-video bg-surface rounded-2xl overflow-hidden",
          "transition-all duration-300",
          isHovering && "ring-2 ring-primary/30"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {!hasVideo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10">
            <Film className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {isHost ? 'Select a video file to start' : 'Waiting for host to share video...'}
            </p>
          </div>
        )}
        
        <video
          ref={ref}
          className="w-full h-full object-contain bg-black"
          playsInline
          muted={true}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={onPlay}
          onPause={onPause}
          onSeeked={onSeek}
        />
        
        <VideoControls
          videoRef={ref as React.RefObject<HTMLVideoElement>}
          playbackState={playbackState}
          onPlay={onPlay}
          onPause={onPause}
          onSeek={onSeek}
          disabled={controlsDisabled}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
