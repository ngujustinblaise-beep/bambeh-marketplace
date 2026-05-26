import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, X, ExternalLink } from "lucide-react";
import "./VideoAd.css";

const VideoAd = ({
  videoUrl,
  productId,
  productName,
  productLink,
  duration = 15, // Maximum 15 seconds
  autoPlay = true,
  onClose,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    // Start playing if autoplay
    if (autoPlay && videoRef.current) {
      videoRef.current
        .play()
        .catch((err) => console.log("Autoplay prevented:", err));
    }

    // Enable skip after 5 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 5000);

    return () => {
      clearTimeout(skipTimer);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [autoPlay]);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Update progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  // Handle close
  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (onClose) {
      onClose();
    }
  };

  // Handle product link click
  const handleProductClick = () => {
    // Track click analytics
    console.log("Video ad clicked:", productId);

    // Open product page
    if (productLink) {
      window.location.href = productLink;
    }
  };

  return (
    <div className="video-ad-overlay">
      <div className="video-ad-container">
        {/* Close button (after 5 seconds) */}
        {canSkip && (
          <button className="video-ad-close" onClick={handleClose}>
            <X size={24} />
          </button>
        )}

        {/* Skip countdown */}
        {!canSkip && (
          <div className="skip-countdown">
            Skip in {Math.ceil((5000 - progress * 50) / 1000)}s
          </div>
        )}

        {/* Video player */}
        <div className="video-player">
          <video
            ref={videoRef}
            src={videoUrl}
            className="video-element"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            playsInline
            preload="auto"
          />

          {/* Play/Pause overlay */}
          {!isPlaying && (
            <div className="video-overlay" onClick={togglePlay}>
              <button className="play-btn-large">
                <Play size={48} fill="white" />
              </button>
            </div>
          )}

          {/* Progress bar */}
          <div className="video-progress-bar">
            <div
              className="video-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="video-controls">
            <button className="control-btn" onClick={togglePlay}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button className="control-btn" onClick={toggleMute}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <div className="video-info">
              <span className="video-ad-badge">AD</span>
              <span className="product-name">{productName}</span>
            </div>

            <button className="shop-now-btn" onClick={handleProductClick}>
              <ExternalLink size={16} />
              <span>Shop Now</span>
            </button>
          </div>
        </div>

        {/* Product CTA */}
        <div className="video-ad-cta">
          <h3>{productName}</h3>
          <button className="cta-button" onClick={handleProductClick}>
            View Product →
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoAd;
