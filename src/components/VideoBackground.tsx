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

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateVideoTime = () => {
      if (!video || !video.duration) return;

      const diff = targetTimeRef.current - currentTimeRef.current;

      if (Math.abs(diff) > 0.001) {
        const smoothingFactor = 0.15;
        currentTimeRef.current = lerp(currentTimeRef.current, targetTimeRef.current, smoothingFactor);

        video.currentTime = currentTimeRef.current;

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

      const videoDuration = video.duration;
      targetTimeRef.current = videoDuration * scrollPercentage;

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      animationIdRef.current = requestAnimationFrame(updateVideoTime);
    };

    video.addEventListener('loadeddata', handleLoadedData);

    if (video.readyState >= 2) {
      handleLoadedData();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

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