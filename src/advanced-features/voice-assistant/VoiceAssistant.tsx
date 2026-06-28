/**
 * BAMBÉ MARKETPLACE - MAIN VOICE ASSISTANT COMPONENT
 * Version: 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';
import VoiceButton from './components/VoiceButton';
import TranscriptDisplay from './components/TranscriptDisplay';
import ResponseDisplay from './components/ResponseDisplay';
import VoiceRecognitionService from './services/VoiceRecognitionService';
import { Language } from './types/voice.types';
import './styles/VoiceAssistant.css';

interface VoiceAssistantProps {
  userId: string;
  onNavigate?: (page: string, data?: any) => void;
  onAction?: (action: any) => void;
  minimized?: boolean;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  userId, onNavigate, onAction, minimized = false,
}) => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded]   = useState(!minimized);
  const [showSettings, setShowSettings] = useState(false);

  const {
    isListening, isSpeaking, isProcessing, transcript, response,
    error, conversationHistory, settings, isSupported,
    startListening, stopListening, speakResponse, stopSpeaking,
    updateSettings, clearConversation,
  } = useVoiceAssistant(userId, i18n.language as Language);

  const handleVoiceButtonClick = () => {
    if (isListening) { stopListening(); } else { startListening(); }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await startListening();
  };

  useEffect(() => {
    if (response?.action) {
      if (response.action.type === 'navigate' && onNavigate) {
        onNavigate(response.action.data.page, response.action.data);
      } else if (onAction) {
        onAction(response.action);
      }
    }
  }, [response, onNavigate, onAction]);

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const toggleSettings = () => setShowSettings(!showSettings);

  if (!isSupported) {
    return (
      <div className="voice-assistant-unsupported">
        <div className="unsupported-content">
          <span className="unsupported-icon">🎤</span>
          <h3>{t('voice.notSupported')}</h3>
          <p>{t('voice.notSupportedDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-assistant ${isExpanded ? 'expanded' : 'minimized'}`}>
      {!isExpanded && (
        <div className="voice-assistant-minimized" onClick={toggleExpanded}>
          <div className="minimized-button">
            <span className="mama-icon">🎤</span>
            {isListening && <span className="listening-badge">●</span>}
          </div>
          <span className="minimized-label">Mama</span>
        </div>
      )}

      {isExpanded && (
        <div className="voice-assistant-expanded">
          <div className="voice-header">
            <div className="voice-header-left">
              <div className="mama-branding">
                <span className="mama-icon-large">🎤</span>
                <div className="mama-title">
                  <h2>Mama</h2>
                  <p>{t('voice.voiceAssistant')}</p>
                </div>
              </div>
            </div>
            <div className="voice-header-right">
              <button className="header-button" onClick={toggleSettings} title={t('voice.settings')}>⚙️</button>
              <button className="header-button" onClick={clearConversation} title={t('voice.clearConversation')}>🗑️</button>
              <button className="header-button minimize" onClick={toggleExpanded} title={t('voice.minimize')}>➖</button>
            </div>
          </div>

          {showSettings && (
            <div className="settings-panel">
              <h4>{t('voice.settings')}</h4>
              <div className="setting-item">
                <label>{t('voice.language')}</label>
                <select value={settings.language} onChange={(e) => updateSettings({ language: e.target.value as Language })}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="setting-item">
                <label>{t('voice.voiceSpeed')}</label>
                <input type="range" min="0.5" max="2" step="0.1" value={settings.voiceSpeed}
                  onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })} />
                <span>{settings.voiceSpeed}x</span>
              </div>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input type="checkbox" checked={settings.feedbackSounds} onChange={(e) => updateSettings({ feedbackSounds: e.target.checked })} />
                  <span>{t('voice.feedbackSounds')}</span>
                </label>
              </div>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input type="checkbox" checked={settings.visualFeedback} onChange={(e) => updateSettings({ visualFeedback: e.target.checked })} />
                  <span>{t('voice.visualFeedback')}</span>
                </label>
              </div>
            </div>
          )}

          <div className="voice-content">
            <div className="voice-panel transcript-panel">
              <TranscriptDisplay transcript={transcript} isListening={isListening} conversationHistory={conversationHistory} />
            </div>
            <div className="voice-panel response-panel">
              <ResponseDisplay response={response} onSuggestionClick={handleSuggestionClick} isSpeaking={isSpeaking} />
              {error && (
                <div className="error-display">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                </div>
              )}
              {!response && !error && (
                <div className="help-text">
                  <h4>{t('voice.howToUse')}</h4>
                  <ul>
                    <li>{t('voice.helpTip1')}</li>
                    <li>{t('voice.helpTip2')}</li>
                    <li>{t('voice.helpTip3')}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="voice-button-container">
            <VoiceButton isListening={isListening} isProcessing={isProcessing} onClick={handleVoiceButtonClick} size="large" />
          </div>

          <div className="status-bar">
            <div className="status-item">
              <span className="status-icon">💬</span>
              <span className="status-text">{conversationHistory.length} {t('voice.exchanges')}</span>
            </div>
            {isSpeaking && (
              <div className="status-item speaking">
                <span className="status-icon">🔊</span>
                <span className="status-text">{t('voice.speaking')}</span>
                <button className="stop-speaking-btn" onClick={stopSpeaking}>⏸️</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
