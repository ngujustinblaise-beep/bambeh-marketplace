/**
 * MOVABLE CHAT WIDGET - Android Optimized Version
 * FILE LOCATION: src/components/chat/MovableChatWidget.tsx
 *
 * ✅ FIXED: Always starts anchored to BOTTOM-RIGHT corner
 * ✅ Fully draggable — drag handle appears when chat is open
 * ✅ Remembers dragged position via localStorage (new key _v2)
 * ✅ Unread badge, minimizable, touch + mouse optimized
 * ✅ Android-optimized smaller dimensions
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Move, X, Send, Minimize2, Maximize2 } from 'lucide-react';

// ── Position is stored as pixel offset from the LEFT and TOP of the viewport.
// On first load we convert "bottom-right 24px" into left/top coordinates.
function getDefaultPosition() {
  return {
    x: window.innerWidth  - 80,  // 80px from right  (button is 56px wide)
    y: window.innerHeight - 80,  // 80px from bottom (button is 56px tall)
  };
}

export default function MovableChatWidget() {
  // ── v2 key so stale left-biased positions from the old key are ignored ──
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('Bambeh_chat_position_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that saved position is still within current viewport
        if (
          parsed.x >= 0 && parsed.x <= window.innerWidth  - 56 &&
          parsed.y >= 0 && parsed.y <= window.innerHeight - 56
        ) {
          return parsed;
        }
      }
    } catch {}
    return getDefaultPosition();
  });

  const [isDragging, setIsDragging]   = useState(false);
  const [isOpen, setIsOpen]           = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage]         = useState('');
  const [unreadCount, setUnreadCount] = useState(2);

  // dragRef stores the offset between pointer and the widget's top-left corner
  const dragRef = useRef({ startX: 0, startY: 0 });

  // ── Persist position whenever it changes ───────────────────────────────────
  useEffect(() => {
    localStorage.setItem('Bambeh_chat_position_v2', JSON.stringify(position));
  }, [position]);

  // ── Re-clamp position on window resize so widget never goes off-screen ─────
  useEffect(() => {
    const onResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth  - 56),
        y: Math.min(prev.y, window.innerHeight - 56),
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Mouse drag handlers ────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, Math.min(e.clientX - dragRef.current.startX, window.innerWidth  - 56)),
      y: Math.max(0, Math.min(e.clientY - dragRef.current.startY, window.innerHeight - 56)),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ── Touch drag handlers (Android) ─────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragRef.current = {
      startX: touch.clientX - position.x,
      startY: touch.clientY - position.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setPosition({
      x: Math.max(0, Math.min(touch.clientX - dragRef.current.startX, window.innerWidth  - 56)),
      y: Math.max(0, Math.min(touch.clientY - dragRef.current.startY, window.innerHeight - 56)),
    });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: wire to your real chat service
    setMessage('');
  };

  // ── Determine if chat panel opens upward or downward based on position ─────
  // If widget is in the bottom half of screen, panel opens upward (normal).
  // If widget is in top half, panel opens downward.
  const panelOpensUpward = position.y > window.innerHeight / 2;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top:  `${position.y}px`,
        zIndex: 9999,
      }}
      className="select-none"
    >
      {/* ── Drag handle — only visible when chat is open ────────────────────── */}
      {isOpen && (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-teal-700 text-white px-4 py-1 rounded-t-lg cursor-move text-xs flex items-center gap-2 shadow-lg hover:bg-teal-800 transition-colors whitespace-nowrap"
          style={{ touchAction: 'none' }}
        >
          <Move className="w-3 h-3" />
          <span className="font-medium">Drag to move</span>
        </div>
      )}

      {/* ── Floating button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 relative"
        title="Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Chat panel ───────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`
            absolute right-0 bg-white rounded-lg shadow-2xl border-2 border-teal-200
            flex flex-col transition-all duration-300
            ${panelOpensUpward ? 'bottom-16' : 'top-16'}
            ${isMinimized ? 'w-64 h-12' : 'w-72 h-80 sm:w-80 sm:h-96'}
          `}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-3 rounded-t-lg flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Messages</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-1.5 rounded transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized
                  ? <Maximize2 className="w-3.5 h-3.5" />
                  : <Minimize2 className="w-3.5 h-3.5" />
                }
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-lg px-3 py-2 bg-white text-gray-900 border border-gray-200">
                    <p className="text-sm">Hello! Is this item still available?</p>
                    <p className="text-xs text-gray-400 mt-1">10:30 AM</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[75%] rounded-lg px-3 py-2 bg-teal-600 text-white">
                    <p className="text-sm">Yes, it is! Would you like to make an offer?</p>
                    <p className="text-xs text-teal-100 mt-1">10:32 AM</p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="p-2 border-t border-gray-200 bg-white rounded-b-lg flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}




