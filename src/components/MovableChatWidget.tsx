/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * MOVABLE CHAT WIDGET - Android Optimized Version
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * Â© 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Move,
  X,
  Send,
  Minimize2,
  Maximize2
} from "lucide-react";

export default function MovableChatWidget() {
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("Bambeh_chat_position");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      x: window.innerWidth - 100,
      y: window.innerHeight - 180,
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(2);

  const dragRef = useRef({ startX: 0, startY: 0 });

  useEffect(() => {
    localStorage.setItem("Bambeh_chat_position", JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragRef.current.startX;
      const newY = e.clientY - dragRef.current.startY;
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }}
      className="select-none"
    >
      {/* Drag Handle */}
      {isOpen && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-teal-700 text-white px-4 py-1 rounded-t-lg cursor-move text-xs flex items-center gap-2 shadow-lg hover:bg-teal-800 transition-colors"
        >
          <Move className="w-3 h-3" />
          <span className="font-medium">Drag to move</span>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setUnreadCount(0);
          }
        }}
        className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110"
        title="Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`absolute bottom-16 right-0 bg-white rounded-lg shadow-2xl border-2 border-teal-200 flex flex-col transition-all duration-300 ${
            isMinimized
              ? "w-72 h-12"
              : "w-72 h-80 sm:w-80 sm:h-96 md:w-96 md:h-[450px]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Messages</h3>
            </div>
            <div className="flex items-center gap-2">
              {isMinimized ? (
                <button
                  onClick={() => setIsMinimized(false)}
                  className="hover:bg-teal-700 p-1 rounded transition-colors"
                  title="Maximize"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsMinimized(true)}
                  className="hover:bg-teal-700 p-1 rounded transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-teal-700 p-1 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

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

              <div className="p-2 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send"
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






