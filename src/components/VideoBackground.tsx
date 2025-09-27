import React, { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  className?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const targetTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const animationIdRef = useRef<number>();
  const lastScrollTimeRef = useRef<number>(0);
  const playbackSpeedRef = useRef<number>(2.0); // Playback speed multiplier (1.0 = normal, 2.0 = 2x speed)
  const isPlayingRef = useRef<boolean>(false);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      console.log('Video loaded, duration:', video.duration);
      setIsVideoReady(true);
      video.currentTime = 0;
      currentTimeRef.current = 0;
      targetTimeRef.current = 0;
    };

    const updateVideoTime = (timestamp: number) => {
      if (!video || !video.duration) return;

      const deltaTime = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      const diff = targetTimeRef.current - currentTimeRef.current;
      const absDiff = Math.abs(diff);

      if (absDiff > 0.001) {
        // Calculate the playback increment based on time passed and speed
        const frameRate = 30; // Assumed frame rate
        const timeIncrement = (deltaTime / 1000) * playbackSpeedRef.current;

        if (diff > 0) {
          // Forward scrolling - play forward
          currentTimeRef.current = Math.min(currentTimeRef.current + timeIncrement, targetTimeRef.current);
        } else {
          // Backward scrolling - play backward
          currentTimeRef.current = Math.max(currentTimeRef.current - timeIncrement, targetTimeRef.current);
        }

        currentTimeRef.current = Math.max(0, Math.min(currentTimeRef.current, video.duration));
        video.currentTime = currentTimeRef.current;

        isPlayingRef.current = true;
      } else {
        isPlayingRef.current = false;
      }

      // Continue animation if we're still catching up
      if (absDiff > 0.001 || isPlayingRef.current) {
        animationIdRef.current = requestAnimationFrame(updateVideoTime);
      }
    };

    const handleScroll = () => {
      if (!video || !video.duration) return;

      const scrollHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.min(Math.max(scrollPosition / scrollHeight, 0), 1);

      const currentTime = Date.now();
      const timeSinceLastScroll = currentTime - lastScrollTimeRef.current;
      lastScrollTimeRef.current = currentTime;

      // Adjust playback speed based on scroll velocity
      if (timeSinceLastScroll < 50) {
        // Fast scrolling - increase playback speed
        playbackSpeedRef.current = 4.0;
      } else if (timeSinceLastScroll < 100) {
        // Medium scrolling
        playbackSpeedRef.current = 2.5;
      } else {
        // Slow scrolling
        playbackSpeedRef.current = 1.5;
      }

      const videoDuration = video.duration;
      targetTimeRef.current = videoDuration * scrollPercentage;

      // Start animation if not already running
      if (!animationIdRef.current) {
        lastFrameTimeRef.current = performance.now();
        animationIdRef.current = requestAnimationFrame(updateVideoTime);
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);

    if (video.readyState >= 2) {
      handleLoadedData();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial animation start
    lastFrameTimeRef.current = performance.now();
    animationIdRef.current = requestAnimationFrame(updateVideoTime);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      window.removeEventListener('scroll', handleScroll);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [videoUrl]);

  return (
    <div className={`video-background-container ${className}`}>
      <video
        ref={videoRef}
        className="video-background"
        muted
        playsInline
        preload="auto"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoBackground;