/**
 * BAMB� MARKETPLACE - VOICE BUTTON COMPONENT
 * Animated microphone button for voice input
 * Version: 1.0.0
 */

import React from 'react';
import '../styles/VoiceButton.css';

interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isProcessing,
  onClick,
  size = 'large',
  disabled = false
}) => {
  return (
    <button
      className={`voice-button ${size} ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
      onClick={onClick}
      disabled={disabled || isProcessing}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      <div className="voice-button-inner">
        {/* Microphone Icon */}
        <svg
          className="microphone-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z"
            fill="currentColor"
          />
          <path
            d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z"
            fill="currentColor"
          />
        </svg>

        {/* Animated Waves */}
        {isListening && (
          <>
            <div className="wave wave-1" />
            <div className="wave wave-2" />
            <div className="wave wave-3" />
          </>
        )},
        {/* Processing Spinner */}
        {isProcessing && (
          <div className="processing-spinner" />
        )}
      </div>

      {/* Status Text */}
      <div className="voice-button-status">
        {isProcessing ? (
          <span className="status-text processing">Processing...</span>
        ) : isListening ? (
          <span className="status-text listening">Listening...</span>
        ) : (
          <span className="status-text idle">Tap to speak</span>
        )}
      </div>
    </button>
  );

}
export default VoiceButton;





