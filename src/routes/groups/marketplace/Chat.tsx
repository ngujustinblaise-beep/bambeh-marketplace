// BAMBEH_DEPLOY_TOKEN__CHAT_FIX82_CLEAN
// FIX64: (1) conversation list reads participant_ids + a single separate profiles
//        fetch (the conversation_participants embed hit a table that does not
//        exist, so names/avatars were blank). (2) sendMessage now updates the
//        conversation row (last_message/at + recipient unread) AND inserts a
//        recipient notification, so messages actually surface on the other side.
//        (3) startChat no longer writes to the phantom conversation_participants.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  Circle,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  Mic,
  MoreVertical,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/contexts/AuthContext";
import { isSubscribed } from '@/utils/subscriptionUtils';
import { logger } from '@/utils/logger';
import { AvatarImage, BambehImage } from '@/components/ui/BambehImage';

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
  readBy: string[];
  createdAt: string;
  isBookingMessage?: boolean;
}

interface ChatConversation {
  id: string;
  participants: string[];
  participantDetails: ChatParticipant[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  listingTitle?: string;
  listingImage?: string;
}

const TypingIndicator: React.FC<{ name: string }> = ({ name }) => (
  <div className="flex items-end gap-2 px-4 py-1">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex-shrink-0 flex items-center justify-center">
      <span className="text-white text-xs font-bold">{name[0]?.toUpperCase()}</span>
    </div>
    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
    <span className="text-xs text-gray-400 mb-1">{name} is typing…</span>
  </div>
);

const BookingMessageCard: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const lines = message.content.split('\n').filter(Boolean);
  const title = lines[0] ?? 'Booking Request';
  const details = lines.slice(1);
  const time = new Date(message.createdAt).toLocaleTimeString('fr-CM', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex justify-center px-4 py-2">
      <div className="w-full max-w-sm bg-teal-50 border border-teal-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg flex-shrink-0">
            ðŸ“©
          </div>
          <div>
            <p className="font-bold text-teal-800 text-sm leading-tight">{title}</p>
            <p className="text-[10px] text-teal-500">{time}</p>
          </div>
        </div>

        <div className="space-y-1.5 border-t border-teal-100 pt-2">
          {details.length ? (
            details.map((line, i) => {
              const [key, ...rest] = line.split(':');
              const val = rest.join(':').trim();
              return val ? (
                <div key={i} className="flex gap-1.5 text-xs">
                  <span className="text-teal-500 font-semibold min-w-[80px]">{key}:</span>
                  <span className="text-teal-800">{val}</span>
                </div>
              ) : (
                <p key={i} className="text-xs text-teal-700">{line}</p>
              );
            })
          ) : (
            <p className="text-xs text-teal-700">Booking notification</p>
          )}
        </div>

        <p className="text-[10px] text-teal-400 mt-3 pt-2 border-t border-teal-100 italic text-center">
          This is a booking notification — replies are disabled for this message.
        </p>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{
  message: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
  otherParticipant?: ChatParticipant;
}> = ({ message, isMine, showAvatar, otherParticipant }) => {
  if (message.isBookingMessage) return <BookingMessageCard message={message} />;

  const time = new Date(message.createdAt).toLocaleTimeString('fr-CM', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const isRead = message.readBy.length > 1;

  return (
    <div className={`flex items-end gap-2 px-4 py-0.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMine && (
        <div className="w-7 flex-shrink-0">
          {showAvatar && (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              {otherParticipant?.avatar ? (
                <AvatarImage src={otherParticipant.avatar} alt={otherParticipant?.name ?? ''} size={28} />
              ) : (
                <span className="text-white text-xs font-bold">
                  {otherParticipant?.name?.[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className={`max-w-[72%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {message.type === 'image' && message.imageUrl ? (
          <div className={`rounded-2xl overflow-hidden shadow-sm ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
            <BambehImage src={message.imageUrl} alt="Shared image" width={300} height={240} objectFit="cover" />
          </div>
        ) : (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isMine
                ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-sm shadow-teal-200 shadow-md'
                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
            }`}
          >
            {message.content}
          </div>
        )}
        <div className={`flex items-center gap-1 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-gray-400">{time}</span>
          {isMine && (isRead ? <CheckCheck className="w-3 h-3 text-teal-500" /> : <Check className="w-3 h-3 text-gray-400" />)}
        </div>
      </div>
    </div>
  );
};

const ConversationItem: React.FC<{
  conv: ChatConversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}> = ({ conv, isActive, currentUserId, onClick }) => {
  const other = conv.participantDetails.find(p => p.id !== currentUserId);
  const time = conv.lastMessageAt
    ? new Date(conv.lastMessageAt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150 hover:bg-teal-50/60 ${
        isActive ? 'bg-teal-50 border-r-2 border-teal-500' : 'border-r-2 border-transparent'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-sm">
          {other?.avatar ? (
            <AvatarImage src={other.avatar} alt={other?.name ?? ''} size={48} />
          ) : (
            <span className="text-white text-lg font-bold">{other?.name?.[0]?.toUpperCase() ?? '?'}</span>
          )}
        </div>
        {other?.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
            {other?.name ?? 'Unknown'}
          </span>
          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{time}</span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
            {conv.listingTitle ? <span className="text-teal-600 font-medium mr-1">[{conv.listingTitle}]</span> : null}
            {conv.lastMessage || 'No messages yet'}
          </p>
          {conv.unreadCount > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(searchParams.get('chat') ?? null);
  const [startError, setStartError] = useState<string | null>(null); // FIX74: surface startChat failures instead of a silent blank screen
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

  const userIsSubscriber = user ? isSubscribed(user) : false;
  const selectedConv = useMemo(() => conversations.find(c => c.id === selectedChatId), [conversations, selectedChatId]);
  const otherParticipant = selectedConv?.participantDetails.find(p => p.id !== user?.id);
  const lastMessage = messages[messages.length - 1];
  const isBookingOnlyThread = !!lastMessage?.isBookingMessage;

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Open (or create) a conversation when arriving via ?userId= from a
  // "Contact seller" / "Chat" button. Uses the existing startChat() helper,
  // then rewrites the URL to ?chat=<id> so a refresh won't recreate it.
  useEffect(() => {
    const otherId = searchParams.get('userId');
    if (!otherId || !user?.id || otherId === user.id) return;
    let cancelled = false;
    (async () => {
      try {
        const title = searchParams.get('listingTitle') ?? undefined;
        const image = searchParams.get('listingImage') ?? undefined;
        const listingId = searchParams.get('listingId') ?? undefined;
        const convId = await startChat(user.id, otherId, title, image, listingId);
        if (!cancelled) {
          setSelectedChatId(convId);
          navigate(`/chat?chat=${convId}`, { replace: true });
        }
      } catch (e) {
        logger.warn('Could not start conversation from userId param:', e);
        if (!cancelled) setStartError(e instanceof Error ? e.message : 'Could not open this chat. Please try again.');
      }
    })();
    return () => { cancelled = true; };
  }, [searchParams, user?.id, navigate]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, participant_ids, last_message, last_message_at, listing_title, listing_image, unread_counts')
        .contains('participant_ids', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) {
        logger.warn('Conversations fetch error:', error);
        return;
      }

      const rows = data ?? [];

      // Collect every OTHER participant across all conversations and fetch their
      // profiles in ONE query (no phantom conversation_participants table).
      const otherIds = Array.from(
        new Set(
          rows.flatMap((row: any) =>
            (row.participant_ids ?? []).filter((pid: string) => pid !== user.id)
          )
        )
      ) as string[];

      const profileMap: Record<string, any> = {};
      if (otherIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, last_seen')
          .in('id', otherIds);
        (profs ?? []).forEach((p: any) => { profileMap[p.id] = p; });
      }

      setConversations(
        rows.map((row: any) => {
          const ids: string[] = row.participant_ids ?? [];
          return {
            id: row.id,
            participants: ids,
            lastMessage: row.last_message ?? '',
            lastMessageAt: row.last_message_at ?? '',
            unreadCount: row.unread_counts?.[user.id] ?? 0,
            listingTitle: row.listing_title,
            listingImage: row.listing_image,
            participantDetails: ids
              .filter((pid) => pid !== user.id)
              .map((pid) => {
                const p = profileMap[pid];
                return {
                  id: pid,
                  name: p?.full_name ?? `user_${String(pid).slice(0, 8)}`,
                  avatar: p?.avatar_url ?? undefined,
                  isOnline: false,
                  lastSeen: p?.last_seen,
                };
              }),
          };
        })
      );
    };

    fetchConversations();

    const listChannel = supabase
      .channel(`user-conversations:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_ids=cs.{${user.id}}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!selectedChatId || !user?.id) return;

    setIsLoadingMessages(true);
    setMessages([]);
    setTypingUsers([]);

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedChatId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            chatId: m.conversation_id,
            senderId: m.sender_id,
            content: m.content ?? '',
            type: m.message_type ?? 'text',
            imageUrl: m.image_url,
            readBy: m.read_by ?? [],
            createdAt: m.created_at,
            isBookingMessage: m.is_booking_message ?? false,
          }))
        );
      }

      setIsLoadingMessages(false);
    };

    fetchMessages();

    supabase.rpc('mark_conversation_read', {
      p_conversation_id: selectedChatId,
      p_user_id: user.id,
    }).then(() => {
      setConversations(prev => prev.map(c => (c.id === selectedChatId ? { ...c, unreadCount: 0 } : c)));
    });

    const channel = supabase.channel(`chat:${selectedChatId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedChatId}`,
      },
      (payload) => {
        const m = payload.new as any;
        const newMsg: ChatMessage = {
          id: m.id,
          chatId: m.conversation_id,
          senderId: m.sender_id,
          content: m.content ?? '',
          type: m.message_type ?? 'text',
          imageUrl: m.image_url,
          readBy: m.read_by ?? [],
          createdAt: m.created_at,
          isBookingMessage: m.is_booking_message ?? false,
        };
        setMessages(prev => [...prev, newMsg]);
        if (m.sender_id !== user.id) {
          setTypingUsers(prev => prev.filter(u => u !== m.sender_id));
        }
      }
    );

    channel.on('broadcast', { event: 'typing' }, (payload) => {
      const { userId, isTyping } = payload.payload as { userId: string; isTyping: boolean };
      if (userId === user.id) return;

      setTypingUsers(prev =>
        isTyping ? (prev.includes(userId) ? prev : [...prev, userId]) : prev.filter(u => u !== userId)
      );
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [selectedChatId, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const presenceChannel = supabase.channel('online-users', {
      config: { presence: { key: user.id } },
    });

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState() as Record<string, any[]>;
      const onlineIds = Object.keys(state);
      setConversations(prev =>
        prev.map(conv => ({
          ...conv,
          participantDetails: conv.participantDetails.map(p => ({
            ...p,
            isOnline: onlineIds.includes(p.id),
          })),
        }))
      );
    });

    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({ userId: user.id, online_at: new Date().toISOString() });
      }
    });

    presenceChannelRef.current = presenceChannel;

    return () => {
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!showScrollDown) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers, showScrollDown]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distFromBottom > 200);
  }, []);

  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current || !user?.id) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, isTyping },
    });
  }, [user?.id]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    broadcastTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => broadcastTyping(false), 2000);
  }, [broadcastTyping]);

  const sendMessage = useCallback(async () => {
    const content = newMessage.trim();
    if (!content || !selectedChatId || !user?.id) return;

    setNewMessage('');
    broadcastTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    const optimisticMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      chatId: selectedChatId,
      senderId: user.id,
      content,
      type: 'text',
      readBy: [user.id],
      createdAt: new Date().toISOString(),
      isBookingMessage: false,
    };

    setMessages(prev => [...prev, optimisticMsg]);

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedChatId,
      sender_id: user.id,
      content,
      message_type: 'text',
      read_by: [user.id],
      is_booking_message: false,
    });

    if (error) {
      logger.warn('Message send error:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      return;
    }

    // FIX64: keep the conversation row in sync and notify the recipient, so the
    // message actually surfaces on their side (this was the missing delivery step).
    try {
      const { data: convo } = await supabase
        .from('conversations')
        .select('participant_ids, unread_counts')
        .eq('id', selectedChatId)
        .maybeSingle();

      const recipientId = (convo?.participant_ids ?? []).find((pid: string) => pid !== user.id);
      const nextUnread = { ...(convo?.unread_counts ?? {}) };
      if (recipientId) nextUnread[recipientId] = (nextUnread[recipientId] ?? 0) + 1;

      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          unread_counts: nextUnread,
        })
        .eq('id', selectedChatId);

      if (recipientId) {
        await supabase.from('notifications').insert({
          user_id: recipientId,
          title: 'New message',
          body: content.slice(0, 120),
          type: 'message',
          data: { conversation_id: selectedChatId },
          action_url: '/chat',
          is_read: false,
        });
      }
    } catch (e) {
      logger.warn('Conversation update / notify failed:', e);
    }
  }, [newMessage, selectedChatId, user?.id, broadcastTyping]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-sm px-6">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="w-10 h-10 text-teal-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to chat</h2>
          <p className="text-gray-500 mb-6">Connect with sellers and buyers directly</p>
          <Button onClick={() => navigate('/login')} className="bg-teal-600 hover:bg-teal-700 w-full">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!userIsSubscriber) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-3xl p-8 text-white text-center max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Chat is Premium</h2>
          <p className="text-teal-100 mb-6">Subscribe to message sellers and buyers directly in real-time</p>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-6 text-left space-y-2">
            {['Real-time messaging', 'Typing indicators', 'Image sharing', 'Online status'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCheck className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => navigate('/subscription')} className="bg-white text-teal-700 hover:bg-teal-50 w-full font-semibold">
            View Plans
          </Button>
        </div>
      </div>
    );
  }

  const filteredConvs = conversations.filter(c => {
    if (!searchQuery) return true;
    const other = c.participantDetails.find(p => p.id !== user.id);
    return (
      other?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.listingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const ConversationList = (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {startError && (
          <div className="mx-4 mt-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
            {startError}
          </div>
        )}
        {filteredConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">No conversations yet</p>
            <p className="text-gray-400 text-xs mt-1">Contact a seller to start chatting</p>
          </div>
        ) : (
          <div>
            {filteredConvs.map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={selectedChatId === conv.id}
                currentUserId={user.id}
                onClick={() => setSelectedChatId(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ChatInterface = selectedChatId ? (
    <div className="flex flex-col h-full bg-[#f0f4f8]">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        {isMobileView && (
          <button
            onClick={() => setSelectedChatId(null)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-1"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            {otherParticipant?.avatar ? (
              <AvatarImage src={otherParticipant.avatar} alt={otherParticipant?.name ?? ''} size={40} />
            ) : (
              <span className="text-white font-bold text-sm">
                {otherParticipant?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          {otherParticipant?.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{otherParticipant?.name ?? 'User'}</p>
          <p className="text-xs text-gray-500">
            {otherParticipant?.isOnline ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <Circle className="w-2 h-2 fill-green-500" /> Online
              </span>
            ) : (
              'Offline'
            )}
          </p>
        </div>

        {selectedConv?.listingTitle && (
          <div className="hidden sm:block bg-teal-50 border border-teal-100 rounded-xl px-3 py-1.5 text-xs text-teal-700 font-medium max-w-[180px] truncate">
            Re: {selectedConv.listingTitle}
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-4 space-y-0.5 relative">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
              <p className="text-sm text-gray-400">Loading messages…</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-teal-500" />
            </div>
            <p className="font-semibold text-gray-700">Start the conversation</p>
            <p className="text-sm text-gray-400 mt-1">
              {selectedConv?.listingTitle ? `Ask about "${selectedConv.listingTitle}"` : 'Say hello to get started'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMine={msg.senderId === user.id}
                  showAvatar={isLastInGroup && msg.senderId !== user.id}
                  otherParticipant={otherParticipant}
                />
              );
            })}

            {typingUsers.map(userId => {
              const typer = selectedConv?.participantDetails.find(p => p.id === userId);
              return typer ? <TypingIndicator key={userId} name={typer.name} /> : null;
            })}
          </>
        )}

        <div ref={messagesEndRef} />

        {showScrollDown && (
          <button
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-24 right-6 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition border border-gray-200"
          >
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {isBookingOnlyThread ? (
        <div className="bg-teal-50 border-t border-teal-100 px-4 py-4 text-center">
          <p className="text-xs text-teal-600 font-medium">
            Booking request sent. The host will contact you directly to confirm.
          </p>
        </div>
      ) : (
        <div className="bg-white border-t border-gray-100 px-3 py-3">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors flex-shrink-0">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors flex-shrink-0">
              <ImageIcon className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>

            {newMessage.trim() ? (
              <button
                onClick={sendMessage}
                className="w-10 h-10 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-95 shadow-md shadow-teal-200"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button className="p-2 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors flex-shrink-0">
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center h-full bg-[#f0f4f8]">
      <div className="text-center">
        <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-10 h-10 text-teal-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Select a conversation</h3>
        <p className="text-sm text-gray-400">Choose from the list to start messaging</p>
      </div>
    </div>
  );

  if (isMobileView) {
    return <div className="h-[calc(100vh-64px)]">{selectedChatId ? ChatInterface : ConversationList}</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden shadow-inner">
      <div className="w-80 border-r border-gray-200 flex-shrink-0 overflow-hidden">{ConversationList}</div>
      <div className="flex-1 relative overflow-hidden">{ChatInterface}</div>
    </div>
  );
}

export async function startChat(
  currentUserId: string,
  otherUserId: string,
  listingTitle?: string,
  listingImage?: string,
  listingId?: string
): Promise<string> {
  // FIX74: limit(1) instead of maybeSingle - duplicate conversations from
  // earlier testing made maybeSingle throw ("multiple rows"), which silently
  // blanked the chat screen (no input box).
  // FIX82: per-item chats. Match on the item so each listing gets its own
  // thread between the same two people. When no listingId is supplied (a
  // generic contact) match the legacy null-listing thread instead of
  // grabbing whichever item-specific thread happens to be newest.
  let existingQuery = supabase
    .from('conversations')
    .select('id')
    .contains('participant_ids', [currentUserId, otherUserId]);
  existingQuery = listingId
    ? existingQuery.eq('listing_id', listingId)
    : existingQuery.is('listing_id', null);
  const { data: existingRows, error: existingError } = await existingQuery
    .order('last_message_at', { ascending: false })
    .limit(1);

  if (existingError) {
    throw new Error(`Failed to find conversation: ${existingError.message}`);
  }

  if (existingRows && existingRows.length > 0) return existingRows[0].id;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_ids: [currentUserId, otherUserId],
      buyer_id: currentUserId,
      seller_id: otherUserId,
      last_message: '',
      last_message_at: new Date().toISOString(),
      listing_id: listingId ?? null,
      listing_title: listingTitle ?? null,
      listing_image: listingImage ?? null,
      unread_counts: { [currentUserId]: 0, [otherUserId]: 0 },
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  // FIX64: no conversation_participants table exists — participant_ids on the
  // conversation row is the single source of truth.
  return data.id;
}

// BAMBEH_END_TOKEN__CHAT_FIX82__COMPLETE
