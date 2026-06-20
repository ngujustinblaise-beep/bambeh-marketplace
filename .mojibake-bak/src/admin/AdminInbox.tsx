// @ts-nocheck
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * ADMIN INBOX - MESSAGING SYSTEM FOR ADMIN PORTAL
 * FILE LOCATION: src/pages/admin/AdminInbox.tsx
 * Â© 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Inbox, Send, Archive, Trash2, Star, StarOff,
  Mail, MailOpen, Search, Filter, RefreshCw, AlertCircle,
  CheckCircle, Clock, User, MessageSquare, ChevronRight,
  Paperclip, Image, X, Reply, Forward, MoreVertical, Flag,
  Tag, Users, Bell, Settings,
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

// â”€â”€ TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type MessageStatus   = 'unread' | 'read' | 'replied' | 'resolved' | 'archived';
type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
type MessageCategory = 'report' | 'inquiry' | 'complaint' | 'feedback' | 'support' | 'other';

interface MessageAttachment {
  id: string; name: string; type: string; url: string; size: number;
}

interface InboxMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatar?: string;
  subject: string;
  body: string;
  category: MessageCategory;
  priority: MessagePriority;
  status: MessageStatus;
  isStarred: boolean;
  attachments: MessageAttachment[];
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
  reportType?: string;
  reportedItemId?: string;
  reportedItemType?: string;
  threadId?: string;
  parentMessageId?: string;
  replies?: InboxMessage[];
}

// â”€â”€ SAMPLE DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const generateSampleMessages = (): InboxMessage[] => [
  {
    id: 'msg-001',
    fromUserId: 'user-003',
    fromUserName: 'Bob Johnson',
    fromUserEmail: 'bob@example.com',
    subject: 'ðŸš¨ URGENT: Scam Report - Seller not delivering',
    body: `Dear Admin,\n\nI paid 450,000 XAF for an iPhone 13 Pro Max on December 20th, 2024. The seller "TechZone " confirmed my order and promised delivery within 7 days.\n\nIt has now been 2 weeks and the item has not been delivered and the seller stopped responding.\n\nOrder Number: BMB-2024-008765\nPayment Method: MTN Mobile Money\n\nPlease help me urgently.\n\nBob Johnson`,
    category: 'report', priority: 'urgent', status: 'unread', isStarred: true,
    attachments: [
      { id: 'att-1', name: 'payment_screenshot.jpg', type: 'image/jpeg', url: '/attachments/payment.jpg', size: 245000 },
      { id: 'att-2', name: 'chat_history.pdf', type: 'application/pdf', url: '/attachments/chat.pdf', size: 125000 },
    ],
    createdAt: '2025-01-08T09:30:00Z',
    reportType: 'scam', reportedItemId: 'order-004', reportedItemType: 'order',
  },
  {
    id: 'msg-002',
    fromUserId: 'user-005',
    fromUserName: 'Alice Brown',
    fromUserEmail: 'alice@example.com',
    subject: 'Product Quality Issue - Received Damaged Item',
    body: `Hello Support Team,\n\nI received my order yesterday but the item was damaged. The screen of the phone has a crack and the box was already opened.\n\nOrder #: BMB-2025-001122\nItem: Samsung Galaxy A34\nPrice: 120,000 XAF\n\nI would like either a replacement item or a full refund.\n\nThank you,\nAlice Brown`,
    category: 'complaint', priority: 'high', status: 'read', isStarred: false,
    attachments: [
      { id: 'att-3', name: 'damaged_phone.jpg', type: 'image/jpeg', url: '/attachments/damaged.jpg', size: 350000 },
    ],
    createdAt: '2025-01-07T14:20:00Z',
    readAt: '2025-01-07T16:00:00Z',
    reportType: 'damagedItem', reportedItemId: 'order-006', reportedItemType: 'order',
  },
  {
    id: 'msg-003',
    fromUserId: 'user-007',
    fromUserName: 'Charles Mbeki',
    fromUserEmail: 'charles@example.com',
    subject: 'How to become a verified vendor?',
    body: `Good day,\n\nI am interested in selling electronics on Bambeh marketplace.\n\nCan you please tell me the requirements to become a verified vendor?\n\nBest regards,\nCharles Mbeki`,
    category: 'inquiry', priority: 'normal', status: 'replied', isStarred: false,
    attachments: [],
    createdAt: '2025-01-06T10:15:00Z',
    readAt: '2025-01-06T11:00:00Z',
    repliedAt: '2025-01-06T14:30:00Z',
  },
  {
    id: 'msg-004',
    fromUserId: 'user-009',
    fromUserName: 'Diana Fon',
    fromUserEmail: 'diana@example.com',
    subject: 'Great app! Some suggestions',
    body: `Hi Bambeh Team,\n\nI love using your app! It's so much better than Jumia with the lower fees.\n\nSome suggestions:\n1. Add more payment options (Express Union would be great)\n2. Allow saving multiple delivery addresses\n3. Add a wish list feature\n4. Dark mode would be nice\n\nKeep up the great work!\n\nDiana`,
    category: 'feedback', priority: 'low', status: 'read', isStarred: true,
    attachments: [],
    createdAt: '2025-01-05T16:45:00Z',
    readAt: '2025-01-05T18:00:00Z',
  },
  {
    id: 'msg-005',
    fromUserId: 'user-011',
    fromUserName: 'Emmanuel Tabi',
    fromUserEmail: 'emmanuel@example.com',
    subject: 'Cannot verify phone number',
    body: `Hello,\n\nI'm trying to register but the SMS verification code is not arriving to my phone number +237 691 234 567.\n\nI have tried requesting the code 5 times and waiting 30 minutes.\n\nPlease help me complete my registration.\n\nThanks,\nEmmanuel`,
    category: 'support', priority: 'normal', status: 'unread', isStarred: false,
    attachments: [],
    createdAt: '2025-01-08T07:00:00Z',
  },
];

// â”€â”€ CATEGORY & PRIORITY CONFIG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const categoryConfig: Record<MessageCategory, { label: string; color: string; icon: React.ElementType }> = {
  report:    { label: 'Report',    color: 'bg-red-100 text-red-700',    icon: Flag         },
  inquiry:   { label: 'Inquiry',   color: 'bg-blue-100 text-blue-700',  icon: MessageSquare},
  complaint: { label: 'Complaint', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  feedback:  { label: 'Feedback',  color: 'bg-green-100 text-green-700',icon: Star         },
  support:   { label: 'Support',   color: 'bg-purple-100 text-purple-700', icon: Settings   },
  other:     { label: 'Other',     color: 'bg-gray-100 text-gray-700',  icon: Mail         },
};

const priorityConfig: Record<MessagePriority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'bg-gray-100 text-gray-600'                  },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-600'                  },
  high:   { label: 'High',   color: 'bg-orange-100 text-orange-600'              },
  urgent: { label: 'URGENT', color: 'bg-red-100 text-red-600 animate-pulse'      },
};

// â”€â”€ MESSAGE ITEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface MessageItemProps {
  message: InboxMessage;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isSelected, onSelect, onToggleStar }) => {
  const category = categoryConfig[message.category];
  const priority = priorityConfig[message.priority];
  const CategoryIcon = category.icon;

  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b cursor-pointer transition-all hover:bg-gray-50 ${
        isSelected ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
      } ${message.status === 'unread' ? 'bg-blue-50/50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
          className="mt-1"
        >
          {message.isStarred ? (
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          ) : (
            <StarOff className="w-5 h-5 text-gray-300 hover:text-yellow-500" />
          )}
        </button>

        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {message.fromUserName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
              {message.fromUserName}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${category.color}`}>
              {category.label}
            </span>
            {message.priority !== 'normal' && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${priority.color}`}>
                {priority.label}
              </span>
            )}
          </div>

          <p className={`text-sm truncate ${message.status === 'unread' ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
            {message.subject}
          </p>

          <p className="text-xs text-gray-500 truncate mt-1">
            {message.body.substring(0, 80)}...
          </p>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleDateString()}
            </span>
            {message.attachments.length > 0 && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {message.attachments.length}
              </span>
            )}
            {message.status === 'unread' && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

// â”€â”€ COMPOSE MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: InboxMessage;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, replyTo }) => {
  const [to, setTo]         = useState(replyTo?.fromUserEmail || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody]     = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Message sent successfully!');
    setIsSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Send className="w-5 h-5" />
            {replyTo ? 'Reply to Message' : 'New Message'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Type your message here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">
            <Paperclip className="w-5 h-5" />
            Attach
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!to || !subject || !body || isSending}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
              ) : (
                <><Send className="w-4 h-4" />Send</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminInbox() {
  const { currentAdmin } = useAdmin();
  const [messages, setMessages]               = useState<InboxMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [isLoading, setIsLoading]             = useState(true);
  const [searchQuery, setSearchQuery]         = useState('');
  const [filterCategory, setFilterCategory]   = useState<MessageCategory | 'all'>('all');
  const [showCompose, setShowCompose]         = useState(false);
  const [replyTo, setReplyTo]                 = useState<InboxMessage | undefined>();

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(generateSampleMessages());
      setIsLoading(false);
    };
    loadMessages();
  }, []);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch =
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.fromUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || msg.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const urgentCount = messages.filter(m => m.priority === 'urgent').length;

  const toggleStar = (msgId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, isStarred: !m.isStarred } : m
    ));
  };

  const markAsRead = (msgId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, status: 'read' as MessageStatus, readAt: new Date().toISOString() } : m
    ));
  };

  const handleSelectMessage = (msg: InboxMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') markAsRead(msg.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Inbox className="w-6 h-6 text-purple-600" />
                  Admin Inbox
                </h1>
                <p className="text-sm text-gray-600">{unreadCount} unread â€¢ {urgentCount} urgent</p>
              </div>
            </div>
            <button
              onClick={() => { setReplyTo(undefined); setShowCompose(true); }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Compose
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', ...Object.keys(categoryConfig)] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      filterCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : categoryConfig[cat as MessageCategory].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No messages found</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isSelected={selectedMessage?.id === msg.id}
                    onSelect={() => handleSelectMessage(msg)}
                    onToggleStar={() => toggleStar(msg.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedMessage.fromUserName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">{selectedMessage.fromUserName}</h2>
                        <p className="text-sm text-gray-500">{selectedMessage.fromUserEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryConfig[selectedMessage.category].color}`}>
                        {categoryConfig[selectedMessage.category].label}
                      </span>
                      {selectedMessage.priority !== 'normal' && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${priorityConfig[selectedMessage.priority].color}`}>
                          {priorityConfig[selectedMessage.priority].label}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-500">
                    Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="p-6 border-b">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.body}</p>
                  {selectedMessage.attachments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Paperclip className="w-5 h-5" />
                        Attachments ({selectedMessage.attachments.length})
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedMessage.attachments.map((att) => (
                          <div key={att.id} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                            {att.type.startsWith('image') ? (
                              <Image className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Paperclip className="w-5 h-5 text-gray-600" />
                            )}
                            <span className="text-sm font-medium">{att.name}</span>
                            <span className="text-xs text-gray-500">({(att.size / 1024).toFixed(0)} KB)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50 flex flex-wrap gap-3">
                  <button
                    onClick={() => { setReplyTo(selectedMessage); setShowCompose(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Reply className="w-5 h-5" />
                    Reply
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    <Forward className="w-5 h-5" />
                    Forward
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    <Archive className="w-5 h-5" />
                    Archive
                  </button>
                  {selectedMessage.reportType && (
                    <Link
                      to={`/admin/dispute/${selectedMessage.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Create Dispute
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Message</h3>
                <p className="text-gray-600">Click on a message to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ComposeModal
        isOpen={showCompose}
        onClose={() => { setShowCompose(false); setReplyTo(undefined); }}
        replyTo={replyTo}
      />
    </div>
  );
}



