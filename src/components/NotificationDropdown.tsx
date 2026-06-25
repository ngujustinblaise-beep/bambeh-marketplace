/**
 * src/components/NotificationDropdown.tsx
 * Bambeh Marketplace — Notification Dropdown
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBambehStore } from "@/utils/BambehStore";

const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifications = useBambehStore((s) => s.notifications);
  const unread = useBambehStore((s) => s.unreadNotificationCount);
  const markAllRead = useBambehStore((s) => s.markAllNotificationsRead);
  const markRead = useBambehStore((s) => s.markNotificationRead);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const iconFor = (type: string) => {
    switch (type) {
      case "order":   return "??";
      case "message": return "??";
      case "promo":   return "??";
      default:        return "??";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="text-4xl mb-3">??</span>
                <p className="text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => { markRead(notif.id); setIsOpen(false); navigate("/notifications"); }}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${!notif.isRead ? "bg-teal-50/50" : ""}`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{iconFor(notif.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"} line-clamp-1`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("fr-CM", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100">
              <button
                onClick={() => { setIsOpen(false); navigate("/notifications"); }}
                className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-1"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;




