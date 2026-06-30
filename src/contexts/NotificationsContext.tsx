import React, { createContext, useContext } from "react";
import { useNotifications, type BambehNotification } from "@/hooks/useNotifications";

export interface Notification extends BambehNotification {}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "created_at">
  ) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const api = useNotifications();

  const value: NotificationsContextType = {
    notifications: api.notifications,
    unreadCount: api.unreadCount,
    addNotification: api.addNotification,
    markAsRead: api.markRead,
    markAllAsRead: api.markAllRead,
    removeNotification: api.deleteNotification,
    clearAll: api.clearAll,
    refetch: api.refetch,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotificationsContext must be used within a NotificationsProvider");
  }
  return context;
}

export default NotificationsContext;
