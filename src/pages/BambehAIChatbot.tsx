/**
 * src/pages/BambehAIChatbot.tsx — Bambeh Marketplace
 *
 * FIXED: No longer calls Anthropic API directly from browser (was blocked by CSP).
 * Now routes through Railway backend: /api/ai/chat
 *
 * YOU MUST ADD THIS ROUTE TO YOUR RAILWAY BACKEND:
 *
 *   app.post('/api/ai/chat', async (req, res) => {
 *     const { message } = req.body;
 *     const response = await fetch('https://api.anthropic.com/v1/messages', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'x-api-key': process.env.ANTHROPIC_API_KEY,
 *         'anthropic-version': '2023-06-01'
 *       },
 *       body: JSON.stringify({
 *         model: 'claude-haiku-4-5-20251001',
 *         max_tokens: 500,
 *         messages: [{ role: 'user', content: message }]
 *       })
 *     });
 *     const data = await response.json();
 *     res.json({ reply: data.content?.[0]?.text || 'I am here to help!' });
 *   });
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';

const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ||
  'https://bambeh-backend-production.up.railway.app';

const SYSTEM_PROMPT =
  'You are Bambeh AI, a helpful and friendly assistant for the Bambeh Marketplace app in Cameroon. ' +
  'Help users with buying, selling, finding jobs, rentals, vehicles, services, and using the app. ' +
  'Keep answers concise. Use XAF for prices. Be culturally aware of Cameroonian context.';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export default function BambehAIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonjour! I'm Bambeh AI, your marketplace assistant. I can help you find products, post listings, understand pricing, and navigate the app. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id:      Date.now().toString(),
      role:    'user',
      content: input.trim(),
      time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // ── Route through Railway backend (NOT directly to Anthropic) ────────
      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message: SYSTEM_PROMPT + '\n\nUser: ' + userMsg.content,
        }),
      });

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);

      const data = await res.json();
      const reply = data.reply || "I'm here to help! Ask me anything about Bambeh Marketplace.";

      setMessages(prev => [...prev, {
        id:      (Date.now() + 1).toString(),
        role:    'assistant',
        content: reply,
        time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);

    } catch (e) {
      setMessages(prev => [...prev, {
        id:      (Date.now() + 1).toString(),
        role:    'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([{
      id:      Date.now().toString(),
      role:    'assistant',
      content: "Chat cleared! How can I help you?",
      time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Bambeh AI</h1>
            <p className="text-teal-100 text-xs">Your marketplace assistant</p>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-lg" title="Clear chat">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              m.role === 'user'
                ? 'bg-teal-600 text-white rounded-tr-sm'
                : 'bg-white shadow-sm border rounded-tl-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
              <p className={`text-xs mt-1 ${m.role === 'user' ? 'text-teal-100' : 'text-gray-400'}`}>
                {m.time}
              </p>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-4 py-2 bg-white border-t">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            'How do I post a listing?',
            'How does escrow work?',
            'What is a tontine?',
            'How to subscribe?',
          ].map(q => (
            <button key={q} onClick={() => { setInput(q); }}
              className="flex-shrink-0 text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 transition">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask Bambeh AI anything..."
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-teal-600 text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-teal-700 transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
