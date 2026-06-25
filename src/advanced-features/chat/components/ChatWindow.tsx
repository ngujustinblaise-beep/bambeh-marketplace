/**
 * BAMBÉ MARKETPLACE - CHAT WINDOW COMPONENT
 * Version: 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConversation } from '../hooks/useChat';
import { Conversation, Participant } from '../services/ChatService';
import MessageBubble from './MessageBubble';
import VoiceRecorder from './VoiceRecorder';
import ImagePreview from './ImagePreview';
import {
  groupMessagesByDate,
  getDateSeparatorLabel,
  getInitials,
  getAvatarColor,
  isValidImageFile,
  isValidFileSize,
  compressImage,
} from '../utils/chatUtils';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import '../styles/ChatWindow.css';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUserId, onBack }) => {
  const { t, i18n } = useTranslation();

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId,
  ) as Participant;

  const {
    messages,
    isLoadingMessages,
    typingUsers,
    hasMore,
    sendMessage,
    sendImage,
    sendVoice,
    startTyping,
    stopTyping,
    deleteMessage,
    loadMore,
  } = useConversation(conversation.id);

  const [messageText, setMessageText]           = useState('');
  const [showEmojiPicker, setShowEmojiPicker]   = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [imagePreview, setImagePreview]         = useState<File | null>(null);
  const [isSending, setIsSending]               = useState(false);

  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef         = useRef<HTMLInputElement>(null);
  const typingTimeoutRef     = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop === 0 && hasMore && !isLoadingMessages) {
      loadMore();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    if (e.target.value.length > 0) {
      startTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else {
      stopTyping();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || isSending) return;

    try {
      setIsSending(true);
      stopTyping();
      await sendMessage(messageText.trim(), otherParticipant.userId);
      setMessageText('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(t('errors.messageSendFailed'));
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessageText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidImageFile(file)) { alert(t('errors.invalidImageType')); return; }
    if (!isValidFileSize(file, 5)) { alert(t('errors.fileTooLarge')); return; }
    setImagePreview(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendImage = async (file: File, caption?: string) => {
    try {
      setIsSending(true);
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
      await sendImage(compressedFile, otherParticipant.userId, caption);
      setImagePreview(null);
    } catch (error) {
      console.error('Error sending image:', error);
      alert(t('errors.imageSendFailed'));
    } finally {
      setIsSending(false);
    }
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    try {
      await sendVoice(audioBlob, otherParticipant.userId, duration);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert(t('errors.voiceSendFailed'));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const groupedMessages = groupMessagesByDate(messages);
  const isOtherUserTyping = typingUsers.has(otherParticipant.userId);

  return (
    <div className="chat-window-container">
      {/* Header */}
      <div className="chat-window-header">
        {onBack && (
          <button className="back-button" onClick={onBack}>←</button>
        )}

        <div className="participant-info">
          <div className="participant-avatar">
            {otherParticipant.avatar ? (
              <img src={otherParticipant.avatar} alt={otherParticipant.name} />
            ) : (
              <div
                className="avatar-placeholder"
                style={{ backgroundColor: getAvatarColor(otherParticipant.name) }}
              >
                {getInitials(otherParticipant.name)}
              </div>
            )}
            {otherParticipant.online && <div className="online-indicator" />}
          </div>

          <div className="participant-details">
            <h3>{otherParticipant.name}</h3>
            <span className="participant-status">
              {otherParticipant.online
                ? t('chat.online')
                : otherParticipant.lastSeen
                ? t('chat.lastSeen', { time: new Date(otherParticipant.lastSeen).toLocaleString() })
                : t('chat.offline')}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="header-action-button" title={t('chat.search')}>🔍</button>
          <button className="header-action-button" title={t('chat.info')}>ℹï¸</button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
        {isLoadingMessages && hasMore && (
          <div className="loading-more">
            <div className="spinner-small" />
            <span>{t('chat.loadingMessages')}</span>
          </div>
        )}

        {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
          <div key={dateKey} className="message-date-group">
            <div className="date-separator">
              <span>{getDateSeparatorLabel(dateKey, i18n.language as 'en' | 'fr')}</span>
            </div>

            {dateMessages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const showAvatar = index === 0 || dateMessages[index - 1].senderId !== message.senderId;
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  onDelete={deleteMessage}
                />
              );
            })}
          </div>
        ))}

        {isOtherUserTyping && (
          <div className="typing-indicator">
            <div className="typing-avatar">
              {otherParticipant.avatar ? (
                <img src={otherParticipant.avatar} alt="" />
              ) : (
                <div className="avatar-placeholder-small">
                  {getInitials(otherParticipant.name)}
                </div>
              )}
            </div>
            <div className="typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        {showEmojiPicker && (
          <>
            <div className="emoji-picker-overlay" onClick={() => setShowEmojiPicker(false)} />
            <div className="emoji-picker-wrapper">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" locale={i18n.language} />
            </div>
          </>
        )}

        <div className="chat-input-actions">
          <button className="input-action-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title={t('chat.addEmoji')}>😊</button>
          <button className="input-action-button" onClick={() => fileInputRef.current?.click()} title={t('chat.attachImage')}>📎</button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <textarea
            value={messageText}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.typeMessage')}
            className="chat-input"
            rows={1}
            disabled={isSending}
          />

          {messageText.trim() ? (
            <button type="submit" className="send-button" disabled={isSending}>
              {isSending ? '⏳' : '📤'}
            </button>
          ) : (
            <button type="button" className="voice-button" onClick={() => setShowVoiceRecorder(true)} title={t('chat.voiceMessage')}>
              🎤
            </button>
          )}
        </form>
      </div>

      {showVoiceRecorder && (
        <VoiceRecorder onSend={handleSendVoice} onCancel={() => setShowVoiceRecorder(false)} />
      )}

      {imagePreview && (
        <ImagePreview file={imagePreview} onSend={handleSendImage} onCancel={() => setImagePreview(null)} />
      )}
    </div>
  );
};

export default ChatWindow;



