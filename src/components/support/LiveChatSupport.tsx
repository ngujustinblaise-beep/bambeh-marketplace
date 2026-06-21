/**
 * LIVE CHAT SUPPORT
 * FILE LOCATION: src/components/support/LiveChatSupport.tsx
 */

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Clock, CheckCheck, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string; text: string; sender: 'user' | 'bot' | 'support';
  timestamp: Date; status?: 'sent' | 'delivered' | 'read';
}

interface LiveChatSupportProps { buttonText?: string; className?: string; }

export default function LiveChatSupport({ buttonText = 'Start Live Chat', className = '' }: LiveChatSupportProps) {
  const [isOpen, setIsOpen]                 = useState(false);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [inputValue, setInputValue]         = useState('');
  const [isTyping, setIsTyping]             = useState(false);
  const [supportRequested, setSupportRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages: Message[] = [
        { id: 'welcome_1', text: `Hello${currentUser?.name ? ` ${currentUser.name}` : ''}! 💚 Welcome to Bambeh Support!`, sender: 'bot', timestamp: new Date() },
        { id: 'welcome_2', text: "I'm here to help you with any questions about Bambeh - Online Marketplace! How can I assist you today?", sender: 'bot', timestamp: new Date(Date.now() + 500) },
      ];
      setTimeout(() => { setMessages(welcomeMessages); }, 300);
    }
  }, [isOpen, currentUser]);

  const getAutoResponse = (userMessage: string): string[] => {
    const lc = userMessage.toLowerCase();
    if (lc.match(/^(hi|hello|hey|good morning|good afternoon|good evening|bonjour|bonsoir)/)) {
      return ["Hello! 👋 Thank you for reaching out to Bambeh Support!", "How can I help you today? You can ask about buying, selling, payments, or any other questions!"];
    }
    if (lc.includes('subscription') || lc.includes('premium') || lc.includes('plan')) {
      return ["Great question about subscriptions! 🌟", "Bambeh offers Free, Basic (1,500 XAF/month), Premium (2,500 XAF/month), and Business (5,000 XAF/month) plans.", "Each plan comes with different features. Would you like me to connect you with a support agent for more details?"];
    }
    if (lc.includes('payment') || lc.includes('pay') || lc.includes('momo') || lc.includes('orange money')) {
      return ["For payments, Bambeh accepts: 💳", "• MTN Mobile Money\n• Orange Money\n• Credit/Debit Cards", "We charge only 1% transaction fee - the lowest in ! 💚"];
    }
    if (lc.includes('sell') || lc.includes('list') || lc.includes('post')) {
      return ["Selling on Bambeh is easy! 📦", "1. Create an account\n2. Click 'Post Ad'\n3. Add photos and description\n4. Set your price\n5. Publish!", "Free users can post 1 listing per month. Upgrade for unlimited listings!"];
    }
    if (lc.includes('buy') || lc.includes('purchase') || lc.includes('order')) {
      return ["Buying on Bambeh is safe and simple! 🛒", "Browse products, contact sellers, and complete secure transactions through our escrow system.", "Need help finding something specific?"];
    }
    if (lc.includes('help') || lc.includes('support') || lc.includes('agent') || lc.includes('human') || lc.includes('person')) {
      setSupportRequested(true);
      window.dispatchEvent(new CustomEvent('supportRequested', {
        detail: { user: currentUser, timestamp: new Date().toISOString(), messages: messages.map(m => ({ text: m.text, sender: m.sender })) },
      }));
      return ["I understand you'd like to speak with a human agent. 👨â€💼", "I've notified our support team and someone will be with you shortly!", "Please stay on this chat. Average response time is 5-10 minutes during business hours (8 AM - 8 PM WAT). 🕐"];
    }
    if (lc.includes('zerm') || lc.includes('coin')) {
      return ["Zerm Coins are Bambeh's reward currency! 🪙", "You can earn them through:\n• Daily logins (+50)\n• Completing your profile (+200)\n• Making purchases (+varies)\n• Referrals (+500)", "Use Zerm Coins to boost listings, get discounts, and unlock premium features!"];
    }
    if (lc.includes('thank') || lc.includes('merci')) {
      return ["You're welcome! 💚 It's my pleasure to help!", "Is there anything else I can assist you with?"];
    }
    return ["Thank you for your message! 📩", "I'm still learning, but I want to make sure you get the best help possible.", "Would you like me to connect you with a support agent who can assist you better?"];
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = { id: `user_${Date.now()}`, text: inputValue.trim(), sender: 'user', timestamp: new Date(), status: 'sent' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    const responses = getAutoResponse(userMessage.text);
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (let i = 0; i < responses.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const botMessage: Message = { id: `bot_${Date.now()}_${i}`, text: responses[i], sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    }
    setIsTyping(false);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: 'read' } : m));
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => { setIsOpen(false); };

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl ${className}`}>
        <Headphones className="w-6 h-6" />
        <span>{buttonText}</span>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Headphones className="w-6 h-6" /></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Bambeh Support</h3>
                    <p className="text-teal-100 text-sm flex items-center gap-1">
                      {supportRequested ? (<><Clock className="w-3 h-3" /> Agent notified</>) : (<><span className="w-2 h-2 bg-green-400 rounded-full inline-block" /> Online</>)}
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%]`}>
                    {message.sender !== 'user' && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center"><Bot className="w-4 h-4 text-teal-600" /></div>
                        <span className="text-xs text-gray-500">Bambeh Bot</span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 ${message.sender === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}>
                      <p className="whitespace-pre-line text-sm">{message.text}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.sender === 'user' && message.status === 'read' && <CheckCheck className="w-3 h-3 text-teal-500" />}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center"><Bot className="w-4 h-4 text-teal-600" /></div>
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {supportRequested && (
              <div className="bg-amber-50 border-t border-amber-200 px-4 py-3 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Support agent notified</p>
                  <p className="text-xs text-amber-600">Please wait, someone will join shortly</p>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                <button onClick={handleSend} disabled={!inputValue.trim()}
                  className="p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Powered by Bambeh Support 💚</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



