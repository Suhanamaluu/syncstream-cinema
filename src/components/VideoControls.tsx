import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaybackState } from '@/types/room';

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: () => void;
  disabled?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const VideoControls = ({
  videoRef,
  playbackState,
  onPlay,
  onPause,
  onSeek,
  disabled = false,
}: VideoControlsProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('durationchange', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('durationchange', updateDuration);
    };
  }, [videoRef]);

  const handlePlayPause = useCallback(() => {
    if (playbackState === 'playing') {
      onPause();
    } else {
      onPlay();
    }
  }, [playbackState, onPlay, onPause]);

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    onSeek();
  }, [videoRef, onSeek]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.muted = false;
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [videoRef, isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [videoRef]);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    onSeek();
  }, [videoRef, onSeek]);

  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent",
        "transition-opacity duration-300 z-20",
        showControls ? "opacity-100" : "opacity-0"
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(true)}
    >
      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={disabled}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePlayPause}
            disabled={disabled}
            className="hover:bg-primary/20 hover:text-primary"
          >
            {playbackState === 'playing' ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>

          {/* Skip buttons */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => skip(-10)}
            disabled={disabled}
            className="hover:bg-primary/20 hover:text-primary"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => skip(10)}
            disabled={disabled}
            className="hover:bg-primary/20 hover:text-primary"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          {/* Volume */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            className="hover:bg-primary/20 hover:text-primary"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <div className="w-24 hidden sm:block">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
            className="hover:bg-primary/20 hover:text-primary"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
