/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BambehAIChatbot.tsx — BAMBEH MARKETPLACE
 * AI-powered customer support chatbot using Claude API
 * Accessible as a standalone page at /ai-chat
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, User, Sparkles, RefreshCw, ThumbsUp, ThumbsDown,
  MessageSquare, Zap, X, Minimize2, Maximize2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  liked?: boolean;
}

const SYSTEM_PROMPT = `You are Bambeh Assistant, the friendly AI helper for Bambeh Marketplace — Cameroon's #1 online marketplace. You speak English and French (switch based on user's language).

Your personality: Warm, helpful, knowledgeable about Cameroon. Use occasional local expressions.

You help with:
- Finding products, jobs, services, rentals on Bambeh
- Understanding Zerm Coins (1 Zerm = 100 XAF, the platform's digital currency)
- Vendor registration and store setup
- Payment methods: MTN Mobile Money, Orange Money, Cash on Delivery
- Delivery, tracking, and orders
- Account issues and security
- Pricing in XAF
- Local areas: Yaoundé, Douala, Bafoussam, Garoua, Ngaoundéré, Maroua, etc.

When unsure: Say "Let me find that for you" or suggest contacting support at help.bambeh.cm
Keep responses concise (2-4 sentences) unless the user asks for detail.
Always end with a follow-up question or offer to help more.`;

const WELCOME_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "Bonjour! Hello! 👋 I'm **Bambeh Assistant**, your AI helper for Cameroon's favorite marketplace!\n\nI can help you find products, understand Zerm Coins, set up your vendor store, track orders, and much more. What can I do for you today?",
    timestamp: new Date(),
  },
];

const QUICK_QUESTIONS = [
  "How do Zerm Coins work?",
  "How do I become a vendor?",
  "What payment methods are accepted?",
  "How do I track my order?",
  "What are the vendor subscription plans?",
];

const formatContent = (text: string) => {
  // Basic markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
};

const BambehAIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history for Claude API
      const history = [...messages, userMsg]
        .filter(m => m.role !== 'system' && m.id !== 'welcome')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      // If only the welcome message exists, history may be empty; add the user message
      const apiMessages = history.length > 0
        ? history
        : [{ role: 'user' as const, content: text.trim() }];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      console.error('Chatbot error:', err);

      // Fallback response when API is unavailable
      const fallbacks: Record<string, string> = {
        zerm: "Zerm Coins are Bambeh's digital currency! 1 Zerm = 100 XAF. You earn coins by selling, referring friends, and completing your profile. Use them to boost listings or pay for subscriptions. Want to learn more about earning Zerm Coins?",
        vendor: "To become a vendor, go to bambeh.cm/vendor and click 'Register as Vendor'. You'll need your business name, contact info, and a valid Cameroon ID. Verification takes 24 hours. Shall I walk you through the process?",
        payment: "Bambeh accepts MTN Mobile Money, Orange Money, and Cash on Delivery. All transactions are secured with encryption. Which payment method would you like to know more about?",
        order: "You can track your order at bambeh.cm/track-orders or in your Orders section under your profile. You'll also receive SMS updates for each status change. Do you need help tracking a specific order?",
        delivery: "Delivery is available across all 10 Cameroon regions! Delivery time varies: same-day in Yaoundé and Douala, 2-5 days for other cities. Is there anything specific about delivery you'd like to know?",
      };

      const lowerInput = text.toLowerCase();
      let fallbackContent = "I'm having trouble connecting right now, but I'm here to help! For immediate assistance, please visit help.bambeh.cm or call our support team. Is there anything I can help you with offline?";

      for (const [key, response] of Object.entries(fallbacks)) {
        if (lowerInput.includes(key)) {
          fallbackContent = response;
          break;
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const likeMessage = (id: string, liked: boolean) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked } : m));
  };

  const resetChat = () => {
    setMessages(WELCOME_MESSAGES);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl flex flex-col transition-all duration-300 ${isMinimized ? 'h-20' : 'h-[85vh] max-h-[750px]'}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Bambeh Assistant</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-100 text-xs">Powered by Claude AI</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              title="New conversation"
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {isMinimized
                ? <Maximize2 className="w-4 h-4 text-white" />
                : <Minimize2 className="w-4 h-4 text-white" />
              }
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

              {/* Quick questions (shown at start) */}
              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Quick questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-100 border border-blue-100 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600'
                      : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-white" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                    />

                    <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs text-gray-400">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && msg.id !== 'welcome' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => likeMessage(msg.id, true)}
                            className={`w-5 h-5 flex items-center justify-center rounded transition-all ${msg.liked === true ? 'text-green-600' : 'text-gray-300 hover:text-green-500'}`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => likeMessage(msg.id, false)}
                            className={`w-5 h-5 flex items-center justify-center rounded transition-all ${msg.liked === false ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="flex gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about Bambeh..."
                  className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400 px-2"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by Claude AI — Bambeh Marketplace
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BambehAIChatbot;
