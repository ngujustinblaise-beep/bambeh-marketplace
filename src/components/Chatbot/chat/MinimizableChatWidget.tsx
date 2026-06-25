import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Minimize2, Maximize2, Send } from 'lucide-react';

const MinimizableChatWidget = () => {
  // 1. FIX: Initialize state with the welcome message directly.
  // This eliminates the need for an "initialization" useEffect entirely.
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! Welcome to Bambe Marketplace ??', isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // 2. SCROLL LOGIC: Keep this, as it only reacts to length changes.
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen, isMinimized]); // Added isOpen/isMinimized so it scrolls when expanded

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  
  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const sendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), text: trimmedInput, isUser: true }
      ]);
      setInputValue('');
    }
  };

  // FAB (Floating Action Button)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        >
          <MessageSquare className="w-7 h-7" />
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
            1
          </span>
        </button>
      </div>
    );

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-96 max-w-[95vw] animate-in slide-in-from-bottom-2 duration-200">
      <div className={`bg-white rounded-3xl shadow-2xl border overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px] max-h-[80vh]'
      }`}>
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Bambe Support</h3>
              <p className="text-xs opacity-90">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleMinimize} className="p-2 hover:bg-white/20 rounded-xl transition-all">
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button onClick={closeChat} className="p-2 hover:bg-white/20 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {!isMinimized && (
          <div className="flex flex-col h-[calc(500px-64px)]"> 
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.isUser ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
      className="flex-1 px-4 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                  className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

}
export default MinimizableChatWidget;






