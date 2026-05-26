import React, { useState, useCallback } from "react";
import TranscriptDisplay from "./components/TranscriptDisplay";

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
}

const VoiceAssistant: React.FC = () => {
  const [isListening,          setIsListening]          = useState(false);
  const [transcript,            setTranscript]            = useState("");
  const [conversationHistory,  setConversationHistory]  = useState<ConversationEntry[]>([]);

  const toggleListen = useCallback(() => {
    setIsListening(prev => {
      if (!prev) {
        setTranscript("Listening…");
      } else {
        if (transcript && transcript !== "Listening…") {
          const userTurn: ConversationEntry = {
            role: "user", text: transcript, timestamp: new Date().toISOString(),
          };
          const botTurn: ConversationEntry = {
            role: "assistant", text: "I heard you! How can I help?", timestamp: new Date().toISOString(),
          };
          setConversationHistory(h => [...h, userTurn, botTurn]);
        }
        setTranscript("");
      }
      return !prev;
    });
  }, [transcript]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-teal-600 text-white p-4 text-center">
        <h1 className="text-xl font-bold">Bambeh Voice Assistant</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TranscriptDisplay
          transcript={transcript}
          isListening={isListening}
          conversationHistory={conversationHistory}
        />
      </div>

      <div className="p-6 flex justify-center">
        <button
          onClick={toggleListen}
          className={`w-20 h-20 rounded-full font-bold text-white shadow-lg transition-all
            ${isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-teal-600 hover:bg-teal-700"}`}>
          {isListening ? "⏹" : "🎤"}
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
