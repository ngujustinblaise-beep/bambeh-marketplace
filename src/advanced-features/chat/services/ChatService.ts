/**
 * BAMBÃ‰ MARKETPLACE - CHAT SERVICE
 * Real-time messaging with Socket.io
 * Version: 1.0.0
 */

import { io, Socket } from "socket.io-client";
import axios, { AxiosInstance } from "axios";
import ENV_CONFIG from "../../config/env.config";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  messageType: "text" | "image" | "voice" | "system";
  content: string;
  imageUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  timestamp: string;
  read: boolean;
  delivered: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  productId?: string;
}

export interface Participant {
  userId: string;
  name: string;
  avatar?: string;
  role: "customer" | "vendor" | "admin";
  online: boolean;
  lastSeen?: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

class ChatService {
  private socket: Socket | null = null;
  private apiAxios: AxiosInstance;
  private currentUserId: string | null = null;
  private messageCallbacks: Map<string, (message: ChatMessage) => void> = new Map();
  private typingCallbacks: Map<string, (indicator: TypingIndicator) => void> = new Map();
  private onlineStatusCallbacks: Map<string, (userId: string, online: boolean) => void> = new Map();

  constructor() {
    this.apiAxios = axios.create({
      baseURL: ENV_CONFIG.API.BASE_URL,
      timeout: 30000,
    });

    this.apiAxios.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // â”€â”€ SOCKET CONNECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  connect(userId: string): void {
    if (this.socket?.connected) return;
    this.currentUserId = userId;
    this.socket = io(ENV_CONFIG.API.WEBSOCKET_URL, {
      auth: { userId, token: localStorage.getItem("auth_token") },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    this.setupSocketListeners();
  }

  disconnect(): void {
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
    this.messageCallbacks.clear();
    this.typingCallbacks.clear();
    this.onlineStatusCallbacks.clear();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => { console.log("Chat connected:", this.socket?.id); });
    this.socket.on("disconnect", () => { console.log("Chat disconnected"); });
    this.socket.on("error", (error) => { console.error("Chat error:", error); });
    this.socket.on("new_message", (message: ChatMessage) => { this.handleNewMessage(message); });
    this.socket.on("message_delivered", (messageId: string) => { console.log("Message delivered:", messageId); });
    this.socket.on("message_read", (data: { messageId: string; conversationId: string }) => { console.log("Message read:", data); });
    this.socket.on("user_typing", (data: TypingIndicator) => { this.handleTypingIndicator(data); });
    this.socket.on("user_online", (userId: string) => { this.handleOnlineStatus(userId, true); });
    this.socket.on("user_offline", (userId: string) => { this.handleOnlineStatus(userId, false); });
  }

  // â”€â”€ MESSAGE OPERATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendTextMessage(conversationId: string, receiverId: string, content: string): Promise<ChatMessage> {
    try {
      const message: Partial<ChatMessage> = {
        conversationId, senderId: this.currentUserId!, receiverId,
        messageType: "text", content, timestamp: new Date().toISOString(),
      };
      this.socket?.emit("send_message", message);
      const response = await this.apiAxios.post("/chat/messages", message);
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async sendImageMessage(conversationId: string, receiverId: string, imageFile: File, caption?: string): Promise<ChatMessage> {
    try {
      const imageUrl = await this.uploadImage(imageFile);
      const message: Partial<ChatMessage> = {
        conversationId, senderId: this.currentUserId!, receiverId,
        messageType: "image", content: caption || "Sent an image", imageUrl,
        timestamp: new Date().toISOString(),
      };
      this.socket?.emit("send_message", message);
      const response = await this.apiAxios.post("/chat/messages", message);
      return response.data;
    } catch (error) {
      console.error("Error sending image message:", error);
      throw error;
    }
  }

  async sendVoiceMessage(conversationId: string, receiverId: string, audioBlob: Blob, duration: number): Promise<ChatMessage> {
    try {
      const voiceUrl = await this.uploadVoice(audioBlob);
      const message: Partial<ChatMessage> = {
        conversationId, senderId: this.currentUserId!, receiverId,
        messageType: "voice", content: "Sent a voice message", voiceUrl, voiceDuration: duration,
        timestamp: new Date().toISOString(),
      };
      this.socket?.emit("send_message", message);
      const response = await this.apiAxios.post("/chat/messages", message);
      return response.data;
    } catch (error) {
      console.error("Error sending voice message:", error);
      throw error;
    }
  }

  private async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await this.apiAxios.post("/chat/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  }

  private async uploadVoice(blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append("voice", blob, "voice-message.webm");
    const response = await this.apiAxios.post("/chat/upload-voice", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  }

  async getMessages(conversationId: string, limit: number = 50, before?: string): Promise<ChatMessage[]> {
    try {
      const params: any = { limit };
      if (before) params.before = before;
      const response = await this.apiAxios.get(`/chat/conversations/${conversationId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }

  async markAsRead(conversationId: string, messageIds: string[]): Promise<void> {
    try {
      await this.apiAxios.post(`/chat/conversations/${conversationId}/mark-read`, { messageIds });
      this.socket?.emit("mark_read", { conversationId, messageIds });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await this.apiAxios.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  // â”€â”€ CONVERSATION OPERATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await this.apiAxios.get("/chat/conversations");
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  }

  async getOrCreateConversation(otherUserId: string, orderId?: string, productId?: string): Promise<Conversation> {
    try {
      const response = await this.apiAxios.post("/chat/conversations", { participantId: otherUserId, orderId, productId });
      return response.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const response = await this.apiAxios.get(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return null;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await this.apiAxios.delete(`/chat/conversations/${conversationId}`);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }

  // â”€â”€ TYPING INDICATORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  startTyping(conversationId: string): void {
    this.socket?.emit("start_typing", { conversationId, userId: this.currentUserId });
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit("stop_typing", { conversationId, userId: this.currentUserId });
  }

  // â”€â”€ EVENT HANDLERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private handleNewMessage(message: ChatMessage): void {
    this.messageCallbacks.forEach((callback) => { callback(message); });
    if (message.senderId !== this.currentUserId) this.playNotificationSound();
  }

  private handleTypingIndicator(indicator: TypingIndicator): void {
    this.typingCallbacks.forEach((callback) => { callback(indicator); });
  }

  private handleOnlineStatus(userId: string, online: boolean): void {
    this.onlineStatusCallbacks.forEach((callback) => { callback(userId, online); });
  }

  private playNotificationSound(): void {
    const audio = new Audio("/sounds/message-notification.mp3");
    audio.volume = 0.5;
    audio.play().catch(console.error);
  }

  // â”€â”€ CALLBACK REGISTRATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  onMessage(callback: (message: ChatMessage) => void): () => void {
    const id = Math.random().toString(36);
    this.messageCallbacks.set(id, callback);
    return () => { this.messageCallbacks.delete(id); };
  }

  onTyping(callback: (indicator: TypingIndicator) => void): () => void {
    const id = Math.random().toString(36);
    this.typingCallbacks.set(id, callback);
    return () => { this.typingCallbacks.delete(id); };
  }

  onOnlineStatus(callback: (userId: string, online: boolean) => void): () => void {
    const id = Math.random().toString(36);
    this.onlineStatusCallbacks.set(id, callback);
    return () => { this.onlineStatusCallbacks.delete(id); };
  }

  // â”€â”€ UTILITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  isConnected(): boolean { return this.socket?.connected || false; }
  getCurrentUserId(): string | null { return this.currentUserId; }

  async searchMessages(query: string): Promise<ChatMessage[]> {
    try {
      const response = await this.apiAxios.get("/chat/search", { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error("Error searching messages:", error);
      return [];
    }
  }
}

export default new ChatService();
