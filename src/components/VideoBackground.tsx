import React, { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  className?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('loadedmetadata', () => {
      setIsVideoReady(true);
      video.currentTime = 0;
    });

    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        if (!video || !isVideoReady) return;

        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        const scrollPercentage = scrollPosition / scrollHeight;

        const videoDuration = video.duration;
        const targetTime = videoDuration * scrollPercentage;

        if (!isNaN(targetTime) && isFinite(targetTime)) {
          video.currentTime = Math.min(targetTime, videoDuration);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVideoReady]);

  return (
    <div className={`video-background-container ${className}`}>
      <video
        ref={videoRef}
        className="video-background"
        muted
        playsInline
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoBackground;