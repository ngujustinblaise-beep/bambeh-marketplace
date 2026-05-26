/**
 * BAMBÉ MARKETPLACE - CONVERSATION LIST COMPONENT
 * Version: 1.0.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Conversation } from '../services/ChatService';
import { formatConversationTime, truncateText, getInitials, getAvatarColor } from '../utils/chatUtils';
import '../styles/ConversationList.css';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
}) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.userId !== currentUserId);
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    const otherParticipant = getOtherParticipant(conversation);
    const name = otherParticipant?.name.toLowerCase() || '';
    const lastMessage = conversation.lastMessage?.content.toLowerCase() || '';
    return (
      name.includes(searchQuery.toLowerCase()) ||
      lastMessage.includes(searchQuery.toLowerCase())
    );
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return timeB - timeA;
  });

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm(t('chat.confirmDeleteConversation'))) {
      onDeleteConversation?.(conversationId);
    }
  };

  return (
    <div className="conversation-list-container">
      <div className="conversation-list-header">
        <h2>{t('chat.messages')}</h2>
        <div className="conversation-count">{conversations.length}</div>
      </div>

      <div className="conversation-search">
        <input
          type="text"
          placeholder={t('chat.searchConversations')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="conversation-list">
        {sortedConversations.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <p>{t('chat.noConversations')}</p>
          </div>
        ) : (
          sortedConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const isSelected = conversation.id === selectedConversationId;
            if (!otherParticipant) return null;

            return (
              <div
                key={conversation.id}
                className={`conversation-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                {/* Avatar */}
                <div className="conversation-avatar">
                  {otherParticipant.avatar ? (
                    <img src={otherParticipant.avatar} alt={otherParticipant.name} className="avatar-image" />
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

                {/* Content */}
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h3 className="conversation-name">{otherParticipant.name}</h3>
                    <span className="conversation-time">
                      {formatConversationTime(conversation.updatedAt, i18n.language as 'en' | 'fr')}
                    </span>
                  </div>

                  <div className="conversation-footer">
                    <p className="conversation-message">
                      {conversation.lastMessage
                        ? truncateText(conversation.lastMessage.content, 40)
                        : t('chat.noMessages')}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>

                  <span className={`role-badge ${otherParticipant.role}`}>
                    {otherParticipant.role === 'vendor' && '🏪'}
                    {otherParticipant.role === 'customer' && '👤'}
                    {otherParticipant.role === 'admin' && '⚙️'}
                  </span>
                </div>

                {onDeleteConversation && (
                  <button
                    className="delete-conversation-button"
                    onClick={(e) => handleDelete(e, conversation.id)}
                    aria-label="Delete conversation"
                  >
                    🗑️
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
