/**
 * BAMB? MARKETPLACE - MAIN CHAT APP COMPONENT
 * Version: 1.0.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from './hooks/useChat';
import { Conversation } from './services/ChatService';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import './styles/ChatApp.css';

interface ChatAppProps {
  userId: string;
  userName: string;
}

const ChatApp: React.FC<ChatAppProps> = ({ userId, userName }) => {
  const { t } = useTranslation();
  const {
    conversations,
    isConnected,
    isLoading,
    unreadCount,
    startConversation,
    deleteConversation,
    refreshConversations,
  } = useChat(userId);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
  };

  const handleBack = () => {
    setShowMobileChat(false);
    refreshConversations();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setShowMobileChat(false);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert(t('errors.deleteFailed'));
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    try {
      const conversation = await startConversation(otherUserId);
      handleSelectConversation(conversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert(t('errors.conversationStartFailed'));
    }
  };

  const connectionStatus = (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <span className="status-dot"></span>
      <span className="status-text">
        {isConnected ? t('chat.connected') : t('chat.connecting')}
      </span>
    </div>
  );

  return (
    <div className="chat-app-container">
      {/* Desktop Layout */}
      <div className="chat-app-desktop">
        <div className="chat-panel conversation-panel">
          <ConversationList
            conversations={conversations}
            currentUserId={userId}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>

        <div className="chat-panel chat-panel-main">
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} currentUserId={userId} />
          ) : (
            <div className="no-conversation-selected">
              <div className="empty-state-icon">??</div>
              <h3>{t('chat.selectConversation')}</h3>
              <p>{t('chat.selectConversationDescription')}</p>
              {connectionStatus}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="chat-app-mobile">
        {!showMobileChat ? (
          <div className="mobile-conversation-list">
            <ConversationList
              conversations={conversations}
              currentUserId={userId}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
        ) : selectedConversation ? (
          <div className="mobile-chat-window">
            <ChatWindow conversation={selectedConversation} currentUserId={userId} onBack={handleBack} />
          </div>
        ) : null}
      </div>

      {isLoading && (
        <div className="chat-loading-overlay">
          <div className="loading-spinner"></div>
          <p>{t('chat.loadingConversations')}</p>
        </div>
      )}
    </div>
  );
};

export default ChatApp;





