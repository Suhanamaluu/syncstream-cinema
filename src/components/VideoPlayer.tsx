import { forwardRef, useEffect, useRef, useState } from "react";
import { VideoControls } from "./VideoControls";
import { PlaybackState } from "@/types/room";
import { cn } from "@/lib/utils";
import { Film } from "lucide-react";

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
  (
    {
      src,
      isHost,
      playbackState,
      onPlay,
      onPause,
      onSeek,
      onVideoLoad,
      remoteStream,
      controlsDisabled = false
    },
    ref
  ) => {
    const [isHovering, setIsHovering] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);

    // 🔐 prevents sync loops
    const applyingRemoteRef = useRef(false);

    /* ================================
       Attach MediaStream (VIEWER SIDE)
    ================================= */
    useEffect(() => {
      const video = ref.current;
      if (!video || !remoteStream) return;

      if (!video.srcObject) {
        video.srcObject = remoteStream;
        setHasVideo(true);
      }
    }, [remoteStream, ref]);

    /* ================================
       LOCAL USER EVENTS → SEND SYNC
    ================================= */
    useEffect(() => {
      const video = ref.current;
      if (!video) return;

      const handlePlay = () => {
        if (applyingRemoteRef.current) return;
        onPlay();
      };

      const handlePause = () => {
        if (applyingRemoteRef.current) return;
        onPause();
      };

      const handleSeeked = () => {
        if (applyingRemoteRef.current) return;
        onSeek();
      };

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("seeked", handleSeeked);

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("seeked", handleSeeked);
      };
    }, [onPlay, onPause, onSeek, ref]);

    /* ================================
       REMOTE SYNC → APPLY SAFELY
    ================================= */
    useEffect(() => {
      const video = ref.current;
      if (!video) return;

      applyingRemoteRef.current = true;

      if (Math.abs(video.currentTime - playbackState.time) > 0.5) {
        video.currentTime = playbackState.time;
      }

      if (playbackState.isPlaying) {
        if (video.paused) {
          video.play().catch(() => {});
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }

      const t = setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 150);

      return () => clearTimeout(t);
    }, [playbackState, ref]);

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
              {isHost
                ? "Select a video file to start"
                : "Waiting for host to share video..."}
            </p>
          </div>
        )}

        <video
          ref={ref}
          className="w-full h-full object-contain bg-black"
          autoPlay
          muted
          playsInline
          onLoadedMetadata={() => {
            setHasVideo(true);
            onVideoLoad?.();
          }}
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

VideoPlayer.displayName = "VideoPlayer";
