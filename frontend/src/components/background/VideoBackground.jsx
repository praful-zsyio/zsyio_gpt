import React, { useRef, useEffect } from 'react';
import bgVideo from '../../assets/zsyiogpt.mp4';

/**
 * VideoBackground – Fullscreen muted autoplay video behind all content.
 * Renders a fixed, edge-to-edge <video> element with a dark overlay
 * so text remains readable. The video loops forever, has no audio,
 * and is optimised for performance with playsInline for mobile.
 */
export default function VideoBackground({ theme = 'dark' }) {
  const videoRef = useRef(null);

  // Guarantee playback even if autoPlay attribute is blocked by browser
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked — will start on first user interaction
      });
    };

    tryPlay();

    // Some browsers require a user gesture; retry on first interaction
    const handleInteraction = () => {
      tryPlay();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const isLight = theme === 'light';

  return (
    <div className="video-background-wrapper">
      {/* The actual video element */}
      <video
        ref={videoRef}
        className="video-background-media"
        src={bgVideo}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Dark / light overlay for contrast & readability */}
      <div
        className="video-background-overlay"
        style={{
          background: isLight
            ? 'linear-gradient(180deg, rgba(240,249,255,0.82) 0%, rgba(255,255,255,0.75) 50%, rgba(224,242,254,0.85) 100%)'
            : 'linear-gradient(180deg, rgba(4,12,26,0.78) 0%, rgba(6,21,43,0.72) 50%, rgba(3,10,22,0.82) 100%)',
        }}
      />
    </div>
  );
}
