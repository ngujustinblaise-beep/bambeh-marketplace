/**
 * CONTACT INFO GUARD ? Hide phone/email until 2 chats exchanged.
 * FILE LOCATION: src/components/contact/ContactInfoGuard.tsx
 */

import { useState, useEffect } from 'react';
import { Phone, Mail, Lock, MessageCircle } from 'lucide-react';

interface ContactInfoGuardProps {
  itemOwnerId: string;
  phoneNumber?: string;
  email?: string;
  className?: string;
}

interface ChatHistory { userId1: string; userId2: string; messageCount: number; lastMessageDate: string; }

export default function ContactInfoGuard({ itemOwnerId, phoneNumber, email, className = '' }: ContactInfoGuardProps) {
  const [canViewContact, setCanViewContact] = useState(false);
  const [chatCount, setChatCount]           = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('Bambeh_current_user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    if (user.role === 'master' || user.isMaster === true) {
      setCanViewContact(true);
      return;
    }

    const chatHistoryStr = localStorage.getItem('Bambeh_chat_history');
    if (!chatHistoryStr) { setCanViewContact(false); return; }

    const chatHistory: ChatHistory[] = JSON.parse(chatHistoryStr);
    const relevantChat = chatHistory.find(
      c => (c.userId1 === user.id && c.userId2 === itemOwnerId) || (c.userId2 === user.id && c.userId1 === itemOwnerId)
    );

    if (relevantChat) {
      setChatCount(relevantChat.messageCount);
      setCanViewContact(relevantChat.messageCount >= 2);
    } else {
      setCanViewContact(false);
      setChatCount(0);
    }
  }, [itemOwnerId]);

  const maskPhone = (phone: string) => phone.length < 4 ? '***' : phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
  const maskEmail = (email: string) => { const p = email.split('@'); return p.length !== 2 ? '***@***.***' : '***@' + p[1]; };

  if (!phoneNumber && !email) return null;

  return (
    <div className={className}>
      {canViewContact ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-700 mb-3">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Contact Information Unlocked</span>
          </div>
          {phoneNumber && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Phone className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-green-700 font-medium">Phone Number</p>
                <a href={`tel:${phoneNumber}`} className="text-sm font-bold text-green-900 hover:underline">{phoneNumber}</a>
              </div>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Mail className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-green-700 font-medium">Email Address</p>
                <a href={`mailto:${email}`} className="text-sm font-bold text-green-900 hover:underline">{email}</a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Contact Information Locked</h4>
              <p className="text-sm text-amber-700">Exchange {2 - chatCount} more message{2 - chatCount === 1 ? '' : 's'} to unlock</p>
            </div>
          </div>
          <div className="space-y-2">
            {phoneNumber && (
              <div className="flex items-center gap-3 p-2 bg-white/50 rounded">
                <Phone className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-mono text-amber-800">{maskPhone(phoneNumber)}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3 p-2 bg-white/50 rounded">
                <Mail className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-mono text-amber-800">{maskEmail(email)}</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
              <span>Progress to unlock:</span><span className="font-bold">{chatCount}/2 messages</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="bg-amber-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(chatCount / 2) * 100}%` }} />
            </div>
          </div>
          <button
            onClick={() => { window.location.href = `/chat?with=${itemOwnerId}`; }}
            className="mt-4 w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Start Conversation
          </button>
        </div>
      )}
    </div>
  );
}

export function trackChatMessage(userId1: string, userId2: string) {
  const chatHistoryStr = localStorage.getItem('Bambeh_chat_history');
  const chatHistory: ChatHistory[] = chatHistoryStr ? JSON.parse(chatHistoryStr) : [];
  const idx = chatHistory.findIndex(c => (c.userId1 === userId1 && c.userId2 === userId2) || (c.userId2 === userId1 && c.userId1 === userId2));
  if (idx !== -1) {
    chatHistory[idx].messageCount++;
    chatHistory[idx].lastMessageDate = new Date().toISOString();
  } else {
    chatHistory.push({ userId1, userId2, messageCount: 1, lastMessageDate: new Date().toISOString() });
  }
  localStorage.setItem('Bambeh_chat_history', JSON.stringify(chatHistory));
}

export function getChatCount(userId1: string, userId2: string): number {
  const chatHistoryStr = localStorage.getItem('Bambeh_chat_history');
  if (!chatHistoryStr) return 0;
  const chat = JSON.parse(chatHistoryStr).find((c: ChatHistory) => (c.userId1 === userId1 && c.userId2 === userId2) || (c.userId2 === userId1 && c.userId1 === userId2));
  return chat ? chat.messageCount : 0;
}





