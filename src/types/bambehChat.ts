/**
 * src/types/bambehChat.ts
 * Bambeh Marketplace - Chat type definitions.
 * These match the LIVE Supabase schema (array participant_ids + jsonb unread_counts).
 */

export type Lang = "en" | "fr" | "pidgin" | "ff" | "ar";

export type MessageType = "text" | "image" | "system";

/** Fixed id used for the "Bambeh Official" sender (welcome / warning / etc.). */
export const OFFICIAL_ID = "00000000-0000-0000-0000-000000000000";

/** A row from the public.messages table. */
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  message_type: MessageType;
  attachments: unknown[] | null;
  system_key: string | null;
  system_params: Record<string, unknown> | null;
  is_read: boolean;
  is_booking_message: boolean;
  created_at: string;
}

/** A row from the public.conversations table. */
export interface Conversation {
  id: string;
  participant_ids: string[];
  product_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_message_time: string | null;
  unread_counts: Record<string, number> | null;
  listing_title: string | null;
  listing_image: string | null;
  created_at: string | null;
}

/** A conversation prepared for display in the conversation list. */
export interface ConversationListItem {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  listingTitle: string | null;
  isOfficial: boolean;
}
