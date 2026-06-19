// @ts-nocheck
import React, { useState } from "react";
import type { Chat, ChatMessage } from "@/types/chat";
import type { AuthUser } from "@/types/auth";

interface ChatInterfaceProps {
  chat: Chat;
  currentUser: AuthUser;
  onSendMessage?: (content: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chat, currentUser, onSendMessage }) => {
  const [input, setInput] = useState("");

  const messages: ChatMessage[] = [];

  const send = () => {
    if (!input.trim()) return;
    onSendMessage?.(input.trim());
    setInput("");
  };

  const other = chat.participants?.find(p => p.id !== currentUser.id);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
          {other?.image ? <img src={other.image} alt={other.name} className="w-full h-full rounded-full object-cover" /> : "ðŸ‘¤"}
        </div>
        <div>
          <p className="font-semibold text-sm">{other?.name ?? "User"}</p>
          <p className="text-xs text-green-500">{other?.isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((m: ChatMessage) => {
          const isMe = m.senderId === currentUser.id;
          return (
            <div key={m.id} className={"flex " + (isMe ? "justify-end" : "justify-start")}>
              <div className={"max-w-xs px-3 py-2 rounded-2xl text-sm " + (isMe ? "bg-teal-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm")}>
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-500"
        />
        <button onClick={send} disabled={!input.trim()}
          className="bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-40">
          âž¤
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
