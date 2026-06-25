export interface ChatParticipant {
  id: string;
  name: string;
  image?: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface MessageAttachment {
  id: string;
  type: "image" | "file" | "audio";
  url: string;
  name?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  text?: string;
  timestamp?: string;
  createdAt: string;
  read?: boolean;
  status?: "sent" | "delivered" | "read";
  attachments?: MessageAttachment[];
  chatId?: string;
}

export interface TypingIndicator {
  userId: string;
  chatId: string;
  isTyping: boolean;
}

export interface Chat {
  id: string;
  participants: ChatParticipant[];
  participantDetails?: ChatParticipant[];
  lastMessage?: ChatMessage;
  lastMessageTime?: string;
  unreadCount?: number;
  updatedAt: string;
}

export type Message = ChatMessage;

