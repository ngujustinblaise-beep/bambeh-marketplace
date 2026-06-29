/**
 * src/components/Chatbot/chat/MovableChatWidget.tsx
 * Bambeh Marketplace � Floating Movable Chat Widget
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { MessageCircle, X, Minus, ChevronDown } from "lucide-react";
import ChatInterface from "./ChatInterface";

interface MovableChatWidgetProps {
  currentUserId: string;
  conversationId?: string;
  participantName?: string;
  participantAvatar?: string;
  listingTitle?: string;
  onClose?: () => void;
  initialPosition?: { x: number; y: number };
}

type WidgetState = "minimized" | "preview" | "open";

const MovableChatWidget: React.FC<MovableChatWidgetProps> = ({
  currentUserId,
  conversationId,
  participantName = "Chat",
  participantAvatar,
  listingTitle,
  onClose,
  initialPosition,
}) => {
  const [widgetState, setWidgetState] = useState<WidgetState>(
    conversationId ? "preview" : "minimized"
  );
  const [position, setPosition] = useState(
    initialPosition ?? { x: window.innerWidth - 80, y: window.innerHeight - 80 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Clamp position within viewport
  const clamp = useCallback((pos: { x: number; y: number }) => {
    const margin = 10;
    const maxX = window.innerWidth - 68 - margin;
    const maxY = window.innerHeight - 68 - margin;
    return {
      x: Math.max(margin, Math.min(pos.x, maxX)),
      y: Math.max(margin, Math.min(pos.y, maxY)),
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (widgetState !== "minimized") return;
      e.preventDefault();
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: position.x,
        posY: position.y,
      };
      setIsDragging(true);
    },
    [widgetState, position]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setPosition(
        clamp({ x: dragStart.current.posX + dx, y: dragStart.current.posY + dy })
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStart.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, clamp]);

  const handleBubbleClick = useCallback(() => {
    if (isDragging) return;
    setWidgetState(conversationId ? "open" : "minimized");
  }, [isDragging, conversationId]);

  const minimize = useCallback(() => setWidgetState("minimized"), []);
  const toPreview = useCallback(() => setWidgetState("preview"), []);

  if (widgetState === "minimized") {
    return (
      <div
        ref={widgetRef}
        className={`fixed z-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
        onClick={handleBubbleClick}
      >
        <div className="w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full shadow-xl flex items-center justify-center transition-colors select-none">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  }

  if (widgetState === "preview") {
    return (
      <div
        className="fixed bottom-20 right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Preview header */}
        <div className="flex items-center justify-between px-4 py-3 bg-teal-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-400 overflow-hidden flex items-center justify-center">
              {participantAvatar ? (
                <img src={participantAvatar} alt={participantName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {participantName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{participantName}</p>
              {listingTitle && (
                <p className="text-teal-200 text-xs truncate max-w-32">{listingTitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={minimize}
              className="p-1.5 rounded-full hover:bg-teal-500 transition-colors"
              aria-label="R�duire"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-teal-500 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Open button */}
        <button
          type="button"
          onClick={() => setWidgetState("open")}
          className="w-full px-4 py-3 text-sm text-teal-600 font-medium hover:bg-teal-50 transition-colors text-center"
        >
          Ouvrir la conversation
        </button>
      </div>
    );
  }

  // Full open state
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-teal-600 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-400 flex items-center justify-center overflow-hidden">
            {participantAvatar ? (
              <img src={participantAvatar} alt={participantName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">
                {participantName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-white font-semibold text-sm truncate max-w-36">{participantName}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toPreview}
            className="p-1.5 rounded-full hover:bg-teal-500 transition-colors"
            aria-label="R�duire"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-teal-500 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Chat */}
      {conversationId ? (
        <ChatInterface
          conversationId={conversationId}
          currentUserId={currentUserId}
          participantName={participantName}
          participantAvatar={participantAvatar}
          listingTitle={listingTitle}
          className="flex-1 min-h-0"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Aucune conversation s�lectionn�e</p>
        </div>
      )}
    </div>
  );
};

export default MovableChatWidget;





