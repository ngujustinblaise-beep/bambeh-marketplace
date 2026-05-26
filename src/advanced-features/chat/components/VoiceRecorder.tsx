/**
 * BAMBÉ MARKETPLACE - VOICE RECORDER COMPONENT
 * Version: 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactMic } from 'react-mic';
import { formatVoiceDuration } from '../utils/chatUtils';
import '../styles/VoiceRecorder.css';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => Promise<void>;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused]       = useState(false);
  const [duration, setDuration]       = useState(0);
  const [isSending, setIsSending]     = useState(false);
  const timerRef     = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDuration(elapsed);
      if (elapsed >= 300) stopRecording();
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now() - duration * 1000;
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);
    } else {
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleStop = (recordedBlob: any) => {
    console.log('Recording complete:', recordedBlob);
  };

  const handleSend = async (recordedBlob: any) => {
    try {
      setIsSending(true);
      await onSend(recordedBlob.blob, duration);
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('Failed to send voice message');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    stopRecording();
    onCancel();
  };

  return (
    <div className="voice-recorder-container">
      <div className="voice-recorder-overlay" onClick={handleCancel} />

      <div className="voice-recorder-modal">
        <div className="voice-recorder-header">
          <h3>{t('chat.recordVoiceMessage')}</h3>
          <button className="close-button" onClick={handleCancel}>✕</button>
        </div>

        <div className="voice-recorder-visualizer">
          <ReactMic
            record={isRecording && !isPaused}
            className="sound-wave"
            onStop={handleStop}
            strokeColor="#667eea"
            backgroundColor="#f5f5f5"
            mimeType="audio/webm"
          />
        </div>

        <div className="voice-recorder-timer">
          <span className={`recording-indicator ${isRecording && !isPaused ? 'active' : ''}`}>⏺</span>
          <span className="timer-text">{formatVoiceDuration(duration)}</span>
          <span className="max-duration">/ 5:00</span>
        </div>

        <div className="voice-recorder-controls">
          <button className="recorder-button delete" onClick={handleCancel} disabled={isSending}>
            🗑️
          </button>

          <button className="recorder-button pause" onClick={togglePause} disabled={isSending || !isRecording}>
            {isPaused ? '▶️' : '⏸️'}
          </button>

          <button
            className="recorder-button send"
            onClick={() => {
              stopRecording();
              setIsRecording(false);
            }}
            disabled={isSending || duration < 1}
          >
            {isSending ? '⏳' : '📤'}
          </button>
        </div>

        <p className="voice-recorder-instructions">{t('chat.voiceRecorderInstructions')}</p>
      </div>
    </div>
  );
};

export default VoiceRecorder;
