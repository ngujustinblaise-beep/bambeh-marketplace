/**
 * src/pages/MessagesPage.tsx
 * Bambeh Marketplace - Chat screen (conversation list + live thread + input).
 *
 * Self-contained: it uses chatService for data and chatI18n for the 5 languages
 * (English, French, Pidgin, Fulfulde, Arabic with right-to-left). Human messages
 * are shown as typed; system messages render localized from their key.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Send,
  Loader2,
  MessageCircle,
  Check,
  CheckCheck,
  ShieldCheck,
} from "lucide-react";
import { useChatLang } from "@/i18n/chatI18n";
import {
  OFFICIAL_ID,
  type ChatMessage,
  type ConversationListItem,
} from "@/types/bambehChat";
import {
  getCurrentUserId,
  listConversations,
  loadMessages,
  markRead,
  sendText,
  subscribeToConversation,
} from "@/services/chatService";

const MessagesPage: React.FC = () => {
  const { t, tSystem, dir } = useChatLang();

  const [myId, setMyId] = useState<string | null>(null);
  const [userResolved, setUserResolved] = useState(false);

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");

  const [active, setActive] = useState<ConversationListItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Merge a message in, avoiding duplicates (realtime + own send can both arrive).
  const mergeMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((x) => x.id === m.id)) return prev;
      return [...prev, m].sort((a, b) => a.created_at.localeCompare(b.created_at));
    });
  }, []);

  // Resolve the logged-in user, then load the conversation list.
  useEffect(() => {
    let alive = true;
    (async () => {
      const id = await getCurrentUserId();
      if (!alive) return;
      setMyId(id);
      setUserResolved(true);
      if (id) {
        setLoadingList(true);
        const list = await listConversations(id);
        if (alive) {
          setConversations(list);
          setLoadingList(false);
        }
      } else {
        setLoadingList(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // When a conversation is opened: load messages, mark read, subscribe live.
  useEffect(() => {
    if (!active) return;
    let alive = true;
    setLoadingMessages(true);
    setMessages([]);

    (async () => {
      const msgs = await loadMessages(active.id);
      if (!alive) return;
      setMessages(msgs);
      setLoadingMessages(false);
      scrollToBottom();
      await markRead(active.id);
      // reflect the cleared badge in the list
      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, unreadCount: 0 } : c))
      );
    })();

    const unsubscribe = subscribeToConversation(active.id, (m) => {
      mergeMessage(m);
      scrollToBottom();
      if (myId && m.sender_id !== myId) void markRead(active.id);
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [active, myId, scrollToBottom, mergeMessage]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || !active || !myId || sending) return;
    setSending(true);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    const sent = await sendText(active.id, myId, content);
    if (sent) {
      mergeMessage(sent);
      scrollToBottom();
    } else {
      setInput(content); // restore on failure
    }
    setSending(false);
    inputRef.current?.focus();
  }, [input, active, myId, sending, mergeMessage, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend]
  );

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.otherUserName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      (c.listingTitle || "").toLowerCase().includes(q)
    );
  });

  const nameFor = (c: ConversationListItem) => (c.isOfficial ? t("officialName") : c.otherUserName);

  // --- Not logged in -------------------------------------------------------
  if (userResolved && !myId) {
    return (
      <div dir={dir} className="flex h-full items-center justify-center bg-gray-50 p-8 text-center">
        <p className="text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  // --- Conversation list ---------------------------------------------------
  if (!active) {
    return (
      <div dir={dir} className="flex h-full flex-col bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-teal-600" />
            <h1 className="text-lg font-bold text-gray-900">{t("messages")}</h1>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-400">{t("noConversations")}</p>
              <p className="mt-1 text-xs text-gray-300">{t("noConversationsHint")}</p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c)}
                className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-start transition-colors hover:bg-gray-50"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100">
                  {c.isOfficial ? (
                    <ShieldCheck className="h-6 w-6 text-teal-600" />
                  ) : c.otherUserAvatar ? (
                    <img src={c.otherUserAvatar} alt={nameFor(c)} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-teal-600">
                      {nameFor(c).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-sm ${
                        c.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"
                      }`}
                    >
                      {nameFor(c)}
                    </p>
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      {formatTime(c.lastMessageAt)}
                    </span>
                  </div>
                  {c.listingTitle && (
                    <p className="mb-0.5 truncate text-xs text-teal-600">{c.listingTitle}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-xs ${
                        c.unreadCount > 0 ? "font-medium text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {c.lastMessage || t("startConversation")}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                        {c.unreadCount > 9 ? "9+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- Active conversation (thread) ---------------------------------------
  return (
    <div dir={dir} className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-3 py-3">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 rtl:rotate-180" />
        </button>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100">
          {active.isOfficial ? (
            <ShieldCheck className="h-5 w-5 text-teal-600" />
          ) : active.otherUserAvatar ? (
            <img src={active.otherUserAvatar} alt={nameFor(active)} className="h-full w-full object-cover" />
          ) : (
            <span className="font-bold text-teal-600">{nameFor(active).charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{nameFor(active)}</p>
          {active.listingTitle && (
            <p className="truncate text-xs text-teal-600">{active.listingTitle}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">{t("sayHello")}</div>
        ) : (
          messages.map((m) => {
            if (m.message_type === "system" || m.sender_id === OFFICIAL_ID) {
              return (
                <div key={m.id} className="my-2 flex justify-center">
                  <div className="max-w-[85%] rounded-2xl bg-teal-50 px-4 py-2 text-center text-xs text-teal-800">
                    {tSystem(m.system_key || "", (m.system_params as any) || {})}
                  </div>
                </div>
              );
            }
            const isOwn = m.sender_id === myId;
            return (
              <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    isOwn
                      ? "rounded-br-sm bg-teal-600 text-white"
                      : "rounded-bl-sm border border-gray-100 bg-white text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 ${
                      isOwn ? "text-teal-200" : "text-gray-400"
                    }`}
                  >
                    <span className="text-[11px]">{formatTime(m.created_at)}</span>
                    {isOwn &&
                      (m.is_read ? (
                        <CheckCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-3 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-2.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("typeMessage")}
              rows={1}
              className="max-h-28 w-full resize-none overflow-y-auto bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:bg-gray-200"
            aria-label={t("send")}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 rtl:rotate-180" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

