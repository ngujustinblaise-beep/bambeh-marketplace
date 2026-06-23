/**
 * src/components/Chatbot/chat/ChatInterface.tsx
 * Bambeh Marketplace — Chat Interface
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send, ArrowLeft, Phone, MoreVertical,
  Image as ImageIcon, Loader2, Check, CheckCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  participantName: string;
  participantAvatar?: string;
  listingTitle?: string;
  onBack?: () => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  currentUserId,
  participantName,
  participantAvatar,
  listingTitle,
  onBack,
  className = "",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!error && data) {
        const mapped: ChatMessage[] = data.map((row) => ({
          id: row.id as string,
          conversationId: row.conversation_id as string,
          senderId: row.sender_id as string,
          content: row.content as string,
          imageUrl: row.image_url as string | undefined,
          isRead: Boolean(row.is_read),
          createdAt: row.created_at as string,
        }));
        setMessages(mapped);
        setTimeout(scrollToBottom, 100);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    void loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const newMsg: ChatMessage = {
            id: row.id as string,
            conversationId: row.conversation_id as string,
            senderId: row.sender_id as string,
            content: row.content as string,
            imageUrl: row.image_url as string | undefined,
            isRead: Boolean(row.is_read),
            createdAt: row.created_at as string,
          };
          setMessages((prev) => [...prev, newMsg]);
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadMessages, conversationId, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    const content = inputText.trim();
    if (!content || sending) return;

    setInputText("");
    setSending(true);

    const optimisticId = `opt-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      conversationId,
      senderId: currentUserId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setTimeout(scrollToBottom, 50);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content,
          is_read: false,
        })
        .select("id")
        .single();

      if (!error && data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, id: (data as { id: string }).id } : m
          )
        );
        // Update conversation last message
        await supabase
          .from("conversations")
          .update({
            last_message: content,
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversationId);
      } else {
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setInputText(content);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInputText(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [inputText, sending, conversationId, currentUserId, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage();
      }
    },
    [sendMessage]
  );

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-CM", { hour: "2-digit", minute: "2-digit" });

  const groupByDate = (msgs: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let current = "";
    for (const msg of msgs) {
      const d = new Date(msg.createdAt).toLocaleDateString("fr-CM", {
        weekday: "long", day: "numeric", month: "long",
      });
      if (d !== current) {
        current = d;
        groups.push({ date: d, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  };

  return (
    <div className={`flex flex-col bg-white h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center flex-shrink-0">
          {participantAvatar ? (
            <img src={participantAvatar} alt={participantName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-teal-600 font-bold">{participantName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{participantName}</p>
          {listingTitle && (
            <p className="text-xs text-teal-600 truncate">{listingTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Appeler">
            <Phone className="w-4 h-4 text-gray-500" />
          </button>
          <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Options">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">Dites bonjour à {participantName} 👋</p>
          </div>
        ) : (
          groupByDate(messages).map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center my-3">
                <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-0.5">
                  {group.date}
                </span>
              </div>
              {group.messages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        isOwn
                          ? "bg-teal-600 text-white rounded-br-sm"
                          : "bg-white text-gray-900 rounded-bl-sm border border-gray-100"
                      }`}
                    >
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Image" className="max-w-full rounded-xl mb-1" />
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? "text-teal-200" : "text-gray-400"}`}>
                        <span className="text-xs">{formatTime(msg.createdAt)}</span>
                        {isOwn && (
                          msg.isRead
                            ? <CheckCheck className="w-3.5 h-3.5" />
                            : <Check className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="flex-shrink-0 p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Envoyer une image"
          >
            <ImageIcon className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrire un message..."
              rows={1}
              className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 resize-none max-h-28 overflow-y-auto"
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!inputText.trim() || sending}
            className="flex-shrink-0 w-11 h-11 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center transition-colors"
            aria-label="Envoyer"
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;






