import React, { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  className?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      console.log('Video loaded, duration:', video.duration);
      setIsVideoReady(true);
      video.currentTime = 0;
      handleScroll();
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
      const targetTime = videoDuration * scrollPercentage;

      if (!isNaN(targetTime) && isFinite(targetTime) && Math.abs(targetTime - lastTimeRef.current) > 0.01) {
        video.currentTime = targetTime;
        lastTimeRef.current = targetTime;
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);

    if (video.readyState >= 2) {
      handleLoadedData();
    }

    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      window.removeEventListener('scroll', scrollHandler);
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