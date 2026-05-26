// @ts-nocheck
import React from "react";
import type { Chat } from "@/types/chat";

interface ChatListProps {
  chats: Chat[];
  activeId?: string;
  onSelect?: (chat: Chat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, activeId, onSelect }) => {
  if (chats.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p className="text-3xl mb-2">💬</p>
        <p className="text-sm">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {chats.map((chat: Chat) => {
        const other = chat.participants?.[0];
        const lastMsg = chat.lastMessage?.content ?? "No messages yet";
        const isActive = chat.id === activeId;
        return (
          <div key={chat.id}
            onClick={() => onSelect?.(chat)}
            className={"flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors " + (isActive ? "bg-teal-50 border-l-4 border-teal-500" : "")}>
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              {other?.image ? (
                <img src={other.image} alt={other.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm truncate">{other?.name ?? "User"}</p>
                {chat.unreadCount ? (
                  <span className="bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {chat.unreadCount}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
