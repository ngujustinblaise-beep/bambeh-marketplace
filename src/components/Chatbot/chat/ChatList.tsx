/**
 * src/advanced-features/chat/ChatList.tsx
 * Bambeh Marketplace — Chat Conversation List
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useEffect, useState, useCallback } from "react";
import { MessageCircle, Search, RefreshCw, CheckCheck, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- Types --------------------------------------------------------------------
interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
  listingTitle?: string;
  isRead: boolean;
}

interface ChatListProps {
  currentUserId: string;
  onSelectConversation: (conversationId: string, participantId: string) => void;
  selectedConversationId?: string;
  className?: string;
}

// --- Component ----------------------------------------------------------------
const ChatList: React.FC<ChatListProps> = ({
  currentUserId,
  onSelectConversation,
  selectedConversationId,
  className = "",
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          participant1_id,
          participant2_id,
          last_message,
          last_message_at,
          unread_count_p1,
          unread_count_p2,
          listing_title
        `)
        .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
        .order("last_message_at", { ascending: false })
        .limit(50);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const enriched: ChatConversation[] = await Promise.all(
        data.map(async (row) => {
          const otherId =
            row.participant1_id === currentUserId
              ? row.participant2_id
              : row.participant1_id;

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", otherId as string)
            .single();

          const unread =
            row.participant1_id === currentUserId
              ? (row.unread_count_p1 as number) ?? 0
              : (row.unread_count_p2 as number) ?? 0;

          return {
            id: row.id as string,
            participantId: otherId as string,
            participantName: (profile?.display_name as string) ?? "Utilisateur",
            participantAvatar: profile?.avatar_url as string | undefined,
            lastMessage: (row.last_message as string) ?? "",
            lastMessageAt: (row.last_message_at as string) ?? new Date().toISOString(),
            unreadCount: unread,
            isOnline: false,
            listingTitle: row.listing_title as string | undefined,
            isRead: unread === 0,
          };
        })
      );

      setConversations(enriched);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  const formatTime = (iso: string): string => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString("fr-CM", { day: "numeric", month: "short" });
  };

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.participantName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      (c.listingTitle ?? "").toLowerCase().includes(q)
    );
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className={`flex flex-col bg-white ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-gray-900">Messages</h2>
            {totalUnread > 0 && (
              <span className="w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={loadConversations}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          <div className="py-8 text-center">
            <RefreshCw className="w-5 h-5 text-gray-300 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center px-4">
            <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">
              {searchQuery ? "Aucune conversation trouvée" : "Aucun message pour le moment"}
            </p>
            {!searchQuery && (
              <p className="text-xs text-gray-300 mt-1">
                Commencez à discuter en contactant un vendeur
              </p>
            )}
          </div>
        ) : (
          filtered.map((conv) => {
            const isSelected = conv.id === selectedConversationId;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id, conv.participantId)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                  isSelected ? "bg-teal-50 border-r-2 border-teal-600" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-teal-100 overflow-hidden flex items-center justify-center">
                    {conv.participantAvatar ? (
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-teal-600 font-bold text-base">
                        {conv.participantName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                      {conv.participantName}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  {conv.listingTitle && (
                    <p className="text-xs text-teal-600 truncate mb-0.5">{conv.listingTitle}</p>
                  )}
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                      {conv.lastMessage || "Démarrer la conversation..."}
                    </p>
                    {conv.unreadCount > 0 ? (
                      <span className="flex-shrink-0 w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    ) : conv.isRead ? (
                      <CheckCheck className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;




