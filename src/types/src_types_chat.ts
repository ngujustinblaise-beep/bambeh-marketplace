/**
 * CHAT & MESSAGING TYPE DEFINITIONS
 *
 * Type definitions for the real-time chat and messaging system
 * (Subscribers only feature)
 */

// ==================== CHAT TYPES ====================

/**
 * Chat conversation
 */
export interface Chat {
  id: string;
  participants: string[]; // User IDs (always 2 for one-on-one),
  participantDetails: ChatParticipant[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
  archived?: boolean;
  muted?: { [userId: string]: boolean };
}

/**
 * Chat participant information
 */
export interface ChatParticipant {
  id: string;
  name: string;
  image?: string;
  isOnline: boolean;
  lastSeen?: Date;
  isSubscriber: boolean; // For verification
}

// ==================== MESSAGE TYPES ====================

/**
 * Message type
 */
export type MessageType =
  | "text"
  | "image"
  | "voice"
  | "document"
  | "location"
  | "item_share";

/**
 * Message status
 */
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

/**
 * Chat message
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  type: MessageType;
  text?: string;
  timestamp: Date;
  status: MessageStatus;
  attachments?: MessageAttachment[];
  replyTo?: string; // Message ID being replied to
  edited?: boolean;
  editedAt?: Date;
  deleted?: boolean;
  deletedAt?: Date;
}

/**
 * Message attachment
 */
export interface MessageAttachment {
  id: string;
  type: "image" | "voice" | "document" | "location";
  url: string;
  name: string;
  size: number; // in bytes,
  duration?: number; // for voice messages (in seconds)
  thumbnail?: string; // for images
  mimeType?: string;
  uploadProgress?: number; // 0-100 for uploading files
}

// ==================== TYPING INDICATOR ====================

/**
 * Typing indicator
 */
export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

// ==================== CHAT CREATION ====================

/**
 * Data for creating a new chat
 */
export interface CreateChatData {
  participantId: string; // Other user's ID,
  initialMessage?: string;
}

/**
 * Chat invitation (when starting new conversation)
 */
export interface ChatInvitation {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  message?: string;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: Date;
  expiresAt: Date;
}

// ==================== MESSAGE SENDING ====================

/**
 * Data for sending a message
 */
export interface SendMessageData {
  chatId: string;
  type: MessageType;
  text?: string;
  attachments?: File[];
  replyTo?: string; // Message ID being replied to
}

/**
 * Message draft (saved but not sent)
 */
export interface MessageDraft {
  chatId: string;
  text: string;
  attachments?: File[];
  savedAt: Date;
}

// ==================== CHAT FILTERS ====================

/**
 * Chat list filters
 */
export interface ChatFilters {
  unreadOnly?: boolean;
  archived?: boolean;
  search?: string; // Search in participant names or messages
  sortBy?: "recent" | "unread" | "alphabetical";
}

/**
 * Chat search result
 */
export interface ChatSearchResult {
  chats: Chat[];
  total: number;
  hasMore: boolean;
}

// ==================== MESSAGE SEARCH ====================

/**
 * Message search filters
 */
export interface MessageSearchFilters {
  chatId?: string; // Search within specific chat,
  query: string;
  type?: MessageType;
  dateRange?: {
    start: Date;
    end: Date;
  };
  senderId?: string;
}

/**
 * Message search result
 */
export interface MessageSearchResult {
  messages: Message[];
  total: number;
  chats: { [chatId: string]: Chat }; // Associated chats
}

// ==================== CHAT SETTINGS ====================

/**
 * Chat settings for a user
 */
export interface ChatSettings {
  userId: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  showReadReceipts: boolean;
  showTypingIndicator: boolean;
  autoDownloadImages: boolean;
  autoDownloadDocuments: boolean;
  theme?: "light" | "dark" | "auto";
}

/**
 * Per-chat settings
 */
export interface PerChatSettings {
  chatId: string;
  userId: string;
  muted: boolean;
  customNotifications?: boolean;
  archived: boolean;
  starred?: boolean;
}

// ==================== NOTIFICATIONS ====================

/**
 * Chat notification
 */
export interface ChatNotification {
  id: string;
  userId: string;
  chatId: string;
  messageId: string;
  type: "new_message" | "new_chat" | "message_read";
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

// ==================== BLOCKED USERS ====================

/**
 * Blocked user
 */
export interface BlockedUser {
  userId: string; // User who blocked,
  blockedUserId: string; // User who is blocked,
  reason?: string;
  blockedAt: Date;
}

/**
 * Block status check
 */
export interface BlockStatus {
  isBlocked: boolean;
  blockedBy?: string; // Who initiated the block
  blockedAt?: Date;
}

// ==================== VOICE MESSAGES ====================

/**
 * Voice message recording state
 */
export interface VoiceRecording {
  isRecording: boolean;
  duration: number; // in seconds,
  audioBlob?: Blob;
  startTime?: Date;
}

// ==================== MEDIA SHARING ====================

/**
 * Shared item in chat
 */
export interface SharedItem {
  id: string;
  chatId: string;
  messageId: string;
  itemId: string; // Reference to marketplace/job/service/rental item,
  itemType: "job" | "marketplace" | "service" | "rental";
  sharedBy: string;
  sharedAt: Date;
}

// ==================== CHAT ANALYTICS ====================

/**
 * Chat statistics for a user
 */
export interface ChatStatistics {
  userId: string;
  totalChats: number;
  activeChats: number;
  totalMessages: number;
  messagesSent: number;
  messagesReceived: number;
  averageResponseTime: number; // in minutes,
  mostActiveChat?: string; // Chat ID,
  totalUnread: number;
}

/**
 * Chat activity
 */
export interface ChatActivity {
  chatId: string;
  messageCount: number;
  lastActivityDate: Date;
  averageResponseTime: number;
  mostActiveParticipant: string;
}

// ==================== PRESENCE ====================

/**
 * User presence/online status
 */
export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  currentActivity?: "typing" | "recording" | "idle";
}

/**
 * Presence update event
 */
export interface PresenceUpdate {
  userId: string;
  isOnline: boolean;
  timestamp: Date;
}

// ==================== REAL-TIME EVENTS ====================

/**
 * Chat event types for real-time updates
 */
export type ChatEventType =
  | "new_message"
  | "message_read"
  | "message_deleted"
  | "user_typing"
  | "user_online"
  | "user_offline"
  | "chat_archived"
  | "chat_muted";

/**
 * Chat event
 */
export interface ChatEvent {
  type: ChatEventType;
  chatId: string;
  userId?: string;
  data: any;
  timestamp: Date;
}

// ==================== MESSAGE REACTIONS ====================

/**
 * Message reaction (emoji)
 */
export interface MessageReaction {
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

/**
 * Message with reactions
 */
export interface MessageWithReactions extends Message {
  reactions?: {
    [emoji: string]: string[]; // emoji -> array of user IDs
  };
}

// ==================== CHAT BACKUP ====================

/**
 * Chat export/backup
 */
export interface ChatExport {
  chatId: string;
  participants: ChatParticipant[];
  messages: Message[];
  exportedAt: Date;
  format: "json" | "txt" | "pdf";
}

// ==================== CONSTANTS ====================

/**
 * Message limits
 */
export const MESSAGE_LIMITS = {
  MAX_TEXT_LENGTH: 5000,
  MAX_ATTACHMENTS: 5,
  MAX_FILE_SIZE_MB: 10,
  MAX_VOICE_DURATION_SECONDS: 300, // 5 minutes,
  MAX_IMAGE_SIZE_MB: 5,
} as const;

/**
 * Chat limits
 */
export const CHAT_LIMITS = {
  MAX_PARTICIPANTS: 2, // One-on-one only for now,
  MAX_ACTIVE_CHATS: 50,
  MESSAGE_HISTORY_DAYS: 90, // Keep last 90 days,
  TYPING_TIMEOUT_MS: 3000, // Hide typing indicator after 3s
} as const;

/**
 * Notification settings
 */
export const NOTIFICATION_SETTINGS = {
  SOUND_ENABLED_DEFAULT: true,
  VIBRATE_ENABLED_DEFAULT: true,
  PREVIEW_ENABLED_DEFAULT: true,
  QUIET_HOURS_START: "22:00",
  QUIET_HOURS_END: "08:00",
} as const;

// ==================== HELPER TYPES ====================

/**
 * Chat list item (for display)
 */
export interface ChatListItem {
  chat: Chat;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
  otherParticipant: ChatParticipant;
}

/**
 * Message group (messages grouped by date)
 */
export interface MessageGroup {
  date: Date;
  dateLabel: string; // "Today", "Yesterday", "May 1, 2024",
  messages: Message[];
}

/**
 * Chat permission check
 */
export interface ChatPermissions {
  canSendMessages: boolean;
  canSendAttachments: boolean;
  canMakeVoiceCalls: boolean;
  canMakeVideoCalls: boolean;
  reason?: string; // If permission denied
}

/**
 * Delivery receipt
 */
export interface DeliveryReceipt {
  messageId: string;
  chatId: string;
  deliveredTo: string; // User ID,
  deliveredAt: Date;
  readAt?: Date;
}
