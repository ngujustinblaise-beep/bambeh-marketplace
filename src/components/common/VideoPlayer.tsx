// @ts-nocheck
import React, { useRef, useState } from "react";

interface VideoThumbnailProps {
  src: string;
  alt?: string;
  onClick?: () => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ src, alt, onClick }) => (
  <div className="relative cursor-pointer group" onClick={onClick}>
    <img src={src} alt={alt ?? "Video thumbnail"} className="w-full rounded-xl object-cover" />
    <div className="absolute inset-0 flex items-center justify-center
      bg-black/30 group-hover:bg-black/40 rounded-xl transition-colors">
      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-teal-600 ml-1">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  </div>
);

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src, poster, title, className = "", autoPlay = false, controls = true,
}) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
      {title && (
        <p className="absolute top-2 left-2 z-10 text-white text-xs font-medium
          bg-black/50 px-2 py-1 rounded">
          {title}
        </p>
      )}
      {!playing && poster ? (
        <VideoThumbnail src={poster} alt={title} onClick={handlePlay} />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          className="w-full"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
export { VideoThumbnail };
export type { VideoThumbnailProps };





