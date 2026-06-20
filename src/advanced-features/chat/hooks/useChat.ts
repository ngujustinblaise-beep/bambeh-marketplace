/**
 * BAMBÉ MARKETPLACE - USE CHAT HOOK
 * Version: 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import ChatService, { ChatMessage, Conversation, TypingIndicator } from '../services/ChatService';

export const useChat = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConnected, setIsConnected]     = useState(false);
  const [isLoading, setIsLoading]         = useState(true);

  useEffect(() => {
    if (!userId) return;
    ChatService.connect(userId);
    setIsConnected(true);
    loadConversations();
    return () => {
      ChatService.disconnect();
      setIsConnected(false);
    };
  }, [userId]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const convos = await ChatService.getConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = ChatService.onMessage((message) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message, updatedAt: message.timestamp }
            : conv,
        ),
      );
    });
    return unsubscribe;
  }, []);

  const startConversation = useCallback(
    async (otherUserId: string, orderId?: string, productId?: string) => {
      try {
        const conversation = await ChatService.getOrCreateConversation(otherUserId, orderId, productId);
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === conversation.id);
          if (exists) return prev;
          return [conversation, ...prev];
        });
        return conversation;
      } catch (error) {
        console.error('Error starting conversation:', error);
        throw error;
      }
    },
    [],
  );

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await ChatService.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }, []);

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return {
    conversations,
    isConnected,
    isLoading,
    unreadCount,
    startConversation,
    deleteConversation,
    refreshConversations: loadConversations,
  };
};

export const useConversation = (conversationId: string) => {
  const [messages, setMessages]               = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [typingUsers, setTypingUsers]         = useState<Set<string>>(new Set());
  const [hasMore, setHasMore]                 = useState(true);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async (before?: string) => {
    try {
      setIsLoadingMessages(true);
      const newMessages = await ChatService.getMessages(conversationId, 50, before);
      if (before) {
        setMessages((prev) => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }
      setHasMore(newMessages.length === 50);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    const unsubscribe = ChatService.onMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        if (message.senderId !== ChatService.getCurrentUserId()) {
          ChatService.markAsRead(conversationId, [message.id]);
        }
      }
    });
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    const unsubscribe = ChatService.onTyping((indicator: TypingIndicator) => {
      if (indicator.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (indicator.isTyping) {
            newSet.add(indicator.userId);
          } else {
            newSet.delete(indicator.userId);
          }
          return newSet;
        });
      }
    });
    return unsubscribe;
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string, receiverId: string) => {
      try {
        const message = await ChatService.sendTextMessage(conversationId, receiverId, content);
        setMessages((prev) => [...prev, message]);
        return message;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    [conversationId],
  );

  const sendImage = useCallback(
    async (imageFile: File, receiverId: string, caption?: string) => {
      try {
        const message = await ChatService.sendImageMessage(conversationId, receiverId, imageFile, caption);
        setMessages((prev) => [...prev, message]);
        return message;
      } catch (error) {
        console.error('Error sending image:', error);
        throw error;
      }
    },
    [conversationId],
  );

  const sendVoice = useCallback(
    async (audioBlob: Blob, receiverId: string, duration: number) => {
      try {
        const message = await ChatService.sendVoiceMessage(conversationId, receiverId, audioBlob, duration);
        setMessages((prev) => [...prev, message]);
        return message;
      } catch (error) {
        console.error('Error sending voice message:', error);
        throw error;
      }
    },
    [conversationId],
  );

  const startTyping = useCallback(() => {
    ChatService.startTyping(conversationId);
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    ChatService.stopTyping(conversationId);
  }, [conversationId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await ChatService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (messages.length > 0 && hasMore) {
      const oldestMessage = messages[0];
      loadMessages(oldestMessage.timestamp);
    }
  }, [messages, hasMore]);

  return {
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
  };
};
