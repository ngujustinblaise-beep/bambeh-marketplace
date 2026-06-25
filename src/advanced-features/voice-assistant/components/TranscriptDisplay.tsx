// @ts-nocheck
import React from "react";

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
}

interface TranscriptDisplayProps {
  transcript:          string;
  isListening:         boolean;
  conversationHistory: ConversationEntry[];
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  isListening,
  conversationHistory,
}) => (
  <div className="p-4 max-h-96 overflow-y-auto">
    {conversationHistory.map((entry, i) => (
      <div key={i}
        className={`mb-3 flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm
          ${entry.role === "user"
            ? "bg-teal-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
          {entry.text}
        </div>
      </div>
    ))}
    {transcript && (
      <div className="flex justify-end mb-3">
        <div className="max-w-xs px-3 py-2 rounded-2xl text-sm
          bg-teal-300 text-teal-900 rounded-br-sm opacity-75 italic">
          {transcript}
        </div>
      </div>
    )}
    {isListening && (
      <div className="flex items-center gap-2 text-teal-600 text-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i}
              className="w-1.5 h-4 bg-teal-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        Listening…
      </div>
    )}
  </div>
);

export default TranscriptDisplay;




