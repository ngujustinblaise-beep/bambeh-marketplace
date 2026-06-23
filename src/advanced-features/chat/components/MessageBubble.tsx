/**
 * BAMBÃ‰ MARKETPLACE - MESSAGE BUBBLE COMPONENT
 * Version: 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from '../services/ChatService';
import { formatMessageTime, formatVoiceDuration } from '../utils/chatUtils';
import '../styles/MessageBubble.css';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  onDelete?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onDelete,
}) => {
  const { i18n } = useTranslation();
  const [showMenu, setShowMenu]         = useState(false);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef                        = useRef<HTMLAudioElement>(null);
  const [imageLoaded, setImageLoaded]   = useState(false);

  const handlePlayVoice = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setAudioProgress(progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleDelete = () => {
    if (window.confirm('Delete this message?')) {
      onDelete?.(message.id);
    }
    setShowMenu(false);
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'text':
        return <p className="message-text">{message.content}</p>;

      case 'image':
        return (
          <div className="message-image-container">
            {!imageLoaded && (
              <div className="image-loading">
                <div className="spinner-small" />
              </div>
            )}
            <img
              src={message.imageUrl}
              alt="Shared image"
              className="message-image"
              onLoad={() => setImageLoaded(true)}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
            {message.content !== 'Sent an image' && (
              <p className="image-caption">{message.content}</p>
            )}
          </div>
        );

      case 'voice':
        return (
          <div className="message-voice">
            <audio ref={audioRef} src={message.voiceUrl} preload="metadata" />
            <button className="voice-play-button" onClick={handlePlayVoice} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? 'â¸ï¸' : 'â–¶Ã¯Â¸Â'}
            </button>
            <div className="voice-progress">
              <div className="voice-waveform">
                <div className="voice-progress-bar" style={{ width: `${audioProgress}%` }} />
              </div>
              <span className="voice-duration">{formatVoiceDuration(message.voiceDuration || 0)}</span>
            </div>
          </div>
        );

      case 'system':
        return <p className="message-system">{message.content}</p>;

      default:
        return <p className="message-text">{message.content}</p>;
    }
  };

  if (message.messageType === 'system') {
    return (
      <div className="message-bubble-container system">
        <div className="message-system-content">{renderMessageContent()}</div>
      </div>
    );
  }

  return (
    <div className={`message-bubble-container ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          {message.senderAvatar ? (
            <img src={message.senderAvatar} alt={message.senderName} />
          ) : (
            <div className="avatar-placeholder-small">
              {message.senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div className="message-content-wrapper">
        {!isOwn && (
          <span className="message-sender-name">{message.senderName}</span>
        )}

        <div
          className={`message-bubble ${message.messageType}`}
          onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        >
          {renderMessageContent()}

          {showMenu && (
            <>
              <div className="message-menu-overlay" onClick={() => setShowMenu(false)} />
              <div className="message-menu">
                {isOwn && onDelete && (
                  <button onClick={handleDelete} className="menu-item danger">ðŸ—‘Ã¯Â¸Â Delete</button>
                )}
                <button onClick={() => setShowMenu(false)} className="menu-item">âœ• Close</button>
              </div>
            </>
          )}
        </div>

        <div className="message-info">
          <span className="message-time">
            {formatMessageTime(message.timestamp, i18n.language as 'en' | 'fr')}
          </span>
          {isOwn && (
            <span className="message-status">
              {message.read ? 'âœ“âœ“' : message.delivered ? 'âœ“' : 'â±ï¸'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;






