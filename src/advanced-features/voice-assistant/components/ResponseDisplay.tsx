/**
 * BAMBÃ‰ MARKETPLACE - RESPONSE DISPLAY COMPONENT
 * Shows Mama's response with suggestions
 * Version: 1.0.0
 */

import React from "react";
import { VoiceResponse } from "../types/voice.types";
import "../styles/ResponseDisplay.css";

interface ResponseDisplayProps {
  response: VoiceResponse | null;
  onSuggestionClick: (suggestion: string) => void;
  isSpeaking: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  onSuggestionClick,
  isSpeaking
}) => {
  if (!response) return null;

  return (
    <div className="response-display">
      {/* Response Text */}
      <div className="response-card">
        <div className="response-header">
          <div className="mama-avatar">
            <span className="avatar-icon">ðŸŽ¤</span>
            {isSpeaking && (
              <div className="speaking-indicator">
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </div>
            )}
          </div>
          <div className="mama-info">
            <h4>Mama</h4>
            <p>Voice Assistant</p>
          </div>
        </div>

        <div className="response-text">{response.text}</div>

        {/* Confirmation Required */}
        {response.requiresConfirmation && (
          <div className="confirmation-badge">â³ Awaiting confirmation</div>
        )}
      </div>

      {/* Suggestions */}
      {response.suggestions && response.suggestions.length > 0 && (
        <div className="suggestions-section">
          <h5>ðŸ’¡ Try saying:</h5>
          <div className="suggestions-list">
            {response.suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => onSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

}
export default ResponseDisplay;




