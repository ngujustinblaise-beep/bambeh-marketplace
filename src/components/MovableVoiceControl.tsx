/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * MOVABLE VOICE CONTROL WIDGET
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * Â© 2025 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { useState, useEffect } from "react";
import { Mic, MicOff, X, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MovableVoiceControl() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener("toggleVoiceControl", handleToggle);
    return () => {
      window.removeEventListener("toggleVoiceControl", handleToggle);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== "BUTTON") {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
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
  }, [isDragging, dragOffset]);

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    setTimeout(() => {
      setTranscript("Listening...");
      setTimeout(() => {
        setTranscript("Go to marketplace");
        setTimeout(() => {
          navigate("/marketplace");
          setIsListening(false);
          setTranscript("");
        }, 1000);
      }, 2000);
    }, 500);
  };

  const stopListening = () => {
    setIsListening(false);
    setTranscript("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }}
      className="bg-white rounded-2xl shadow-2xl w-80"
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-2xl cursor-move flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          <h3 className="font-bold">Voice Control</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="text-center mb-6">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {isListening ? "Listening..." : "Click to speak"}
          </p>
          {transcript && (
            <p className="text-purple-600 font-medium">"{transcript}"</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Try saying:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>â€¢ "Go to marketplace"</li>
            <li>â€¢ "Show me jobs"</li>
            <li>â€¢ "Search for iPhone"</li>
            <li>â€¢ "Open my profile"</li>
            <li>â€¢ "Go to cart"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}




