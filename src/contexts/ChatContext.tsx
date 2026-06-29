import React, { 
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: Date;
  type: "job" | "product" | "service" | "rental" | "general";
  itemId?: string;
  itemTitle?: string;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  unreadCount: number;
  isConnected: boolean;

  // Actions
  setCurrentConversation: (conversation: Conversation | null) => void;
  sendMessage: (
    message: Omit<ChatMessage, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  searchConversations: (query: string) => Conversation[];
  getConversationMessages: (conversationId: string) => ChatMessage[];
  startConversation: (participant: {
    id: string;
    name: string;
    avatar?: string;
    type?: Conversation["type"];
    itemId?: string;
    itemTitle?: string;
  }) => Conversation;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Replace with your actual socket server URL
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

    const newSocket = io(socketUrl, {
      autoConnect: false, // Don't connect until user is authenticated,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("message", (message: ChatMessage) => {
      handleIncomingMessage(message);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem("bambe-conversations");
    const savedMessages = localStorage.getItem("bambe-messages");

    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(
          parsed.map((c: any) => ({
            ...c,
            updatedAt: new Date(c.updatedAt),
            lastMessage: c.lastMessage
              ? {
                  ...c.lastMessage,
                  timestamp: new Date(c.lastMessage.timestamp),
                }
              : undefined,
          })),
        );
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    }

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(
          parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        );
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
  }, []);

  // Save to localStorage whenever conversations or messages change
  useEffect(() => {
    localStorage.setItem("bambe-conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("bambe-messages", JSON.stringify(messages));
  }, [messages]);

  // Calculate total unread count
  const unreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0,
  );

  const handleIncomingMessage = (message: ChatMessage) => {
    // Add message to messages array
    setMessages((prev) => [...prev, message]);

    // Update conversation
    setConversations((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.id === message.conversationId,
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message,
          unreadCount:
            message.conversationId === currentConversation?.id
              ? updated[existingIndex].unreadCount
              : updated[existingIndex].unreadCount + 1,
          updatedAt: message.timestamp,
        };

        // Move to top
        const [conversation] = updated.splice(existingIndex, 1);
        return [conversation, ...updated];
      }

      return prev;
    });
  };

  const sendMessage = (
    messageData: Omit<ChatMessage, "id" | "timestamp" | "read">,
  ) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Add to messages
    setMessages((prev) => [...prev, newMessage]);

    // Update conversation
    setConversations((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.id === messageData.conversationId,
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: newMessage,
          updatedAt: newMessage.timestamp,
        };

        // Move to top
        const [conversation] = updated.splice(existingIndex, 1);
        return [conversation, ...updated];
      }

      return prev;
    });

    // Send via socket if connected
    if (socket?.connected) {
      socket.emit("message", newMessage);
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
      ),
    );

    setMessages((prev) =>
      prev.map((msg) =>
        msg.conversationId === conversationId ? { ...msg, read: true } : msg,
      ),
    );
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    setMessages((prev) =>
      prev.filter((m) => m.conversationId !== conversationId),
    );

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  const searchConversations = (query: string): Conversation[] => {
    const lowerQuery = query.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.participantName.toLowerCase().includes(lowerQuery) ||
        conv.lastMessage?.message.toLowerCase().includes(lowerQuery) ||
        conv.itemTitle?.toLowerCase().includes(lowerQuery),
    );
  };

  const getConversationMessages = (conversationId: string): ChatMessage[] => {
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const startConversation = (participant: {
    id: string;
    name: string;
    avatar?: string;
    type?: Conversation["type"];
    itemId?: string;
    itemTitle?: string;
  }): Conversation => {
    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.participantId === participant.id,
    );
    if (existing) {
      setCurrentConversation(existing);
      return existing;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      participantId: participant.id,
      participantName: participant.name,
      participantAvatar: participant.avatar,
      unreadCount: 0,
      updatedAt: new Date(),
      type: participant.type || "general",
      itemId: participant.itemId,
      itemTitle: participant.itemTitle,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversation(newConversation);

    return newConversation;
  };

  const value: ChatContextType = {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    isConnected,
    setCurrentConversation,
    sendMessage,
    markAsRead,
    deleteConversation,
    searchConversations,
    getConversationMessages,
    startConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};







