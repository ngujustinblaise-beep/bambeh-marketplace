/**
 * src/pages/vendor/VendorMessages.tsx
 * Bambeh Marketplace — Vendor Messages Page
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatList from "@/advanced-features/chat/ChatList";
import ChatInterface from "@/components/Chatbot/chat/ChatInterface";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

const VendorMessages: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      setUserId(session.session?.user.id ?? null);
    };
    void load();
  }, []);

  const handleSelect = useCallback((convId: string, participantId: string) => {
    setSelectedConvId(convId);
    setSelectedParticipantId(participantId);
    setShowChat(true);
  }, []);

  if (!userId) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-400">Chargement...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Conversation list */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${showChat ? "hidden md:flex" : "flex"}`}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
          <button type="button" onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-gray-100 md:hidden">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <ChatList
          currentUserId={userId}
          onSelectConversation={handleSelect}
          selectedConversationId={selectedConvId ?? undefined}
          className="flex-1 min-h-0"
        />
      </div>

      {/* Chat interface */}
      <div className={`flex-1 flex flex-col ${showChat ? "flex" : "hidden md:flex"}`}>
        {selectedConvId && selectedParticipantId ? (
          <ChatInterface
            conversationId={selectedConvId}
            currentUserId={userId}
            participantName="Client"
            onBack={() => setShowChat(false)}
            className="flex-1 min-h-0"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <ArrowLeft className="w-7 h-7 text-teal-400 rotate-180" />
            </div>
            <p className="text-base font-medium text-gray-400">Sélectionnez une conversation</p>
            <p className="text-sm text-gray-300 mt-1">Choisissez à gauche pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMessages;




