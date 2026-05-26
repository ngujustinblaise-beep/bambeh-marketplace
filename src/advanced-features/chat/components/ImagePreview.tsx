/**
 * BAMBÉ MARKETPLACE - IMAGE PREVIEW COMPONENT
 * Version: 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/ImagePreview.css';

interface ImagePreviewProps {
  file: File;
  onSend: (file: File, caption?: string) => Promise<void>;
  onCancel: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onSend, onCancel }) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [caption, setCaption]       = useState('');
  const [isSending, setIsSending]   = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleSend = async () => {
    try {
      setIsSending(true);
      await onSend(file, caption || undefined);
    } catch (error) {
      console.error('Error sending image:', error);
      alert('Failed to send image');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="image-preview-container">
      <div className="image-preview-overlay" onClick={onCancel} />

      <div className="image-preview-modal">
        <div className="image-preview-header">
          <h3>{t('chat.sendImage')}</h3>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <div className="image-preview-content">
          <img src={previewUrl} alt="Preview" className="preview-image" />
        </div>

        <div className="image-caption-input">
          <input
            type="text"
            placeholder={t('chat.addCaption')}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            disabled={isSending}
          />
          <span className="caption-counter">{caption.length}/200</span>
        </div>

        <div className="image-file-info">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>

        <div className="image-preview-actions">
          <button className="cancel-button" onClick={onCancel} disabled={isSending}>
            {t('common.cancel')}
          </button>
          <button className="send-button" onClick={handleSend} disabled={isSending}>
            {isSending ? t('chat.sending') : t('chat.send')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
