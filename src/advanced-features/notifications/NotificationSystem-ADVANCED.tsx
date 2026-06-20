// @ts-nocheck
import React, { useState, useEffect } from "react";
import { NotificationService } from "./NotificationService";
import type { AppNotification } from "./NotificationService";

const service = new NotificationService();

interface NotificationSystemProps {
  userId: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    service.getNotifications(userId).then(data => {
      if (!cancelled) setNotifications(data);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [userId]);

  const handleMarkRead = async (id: string) => {
    await service.markRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  if (loading) return (
    <div className="p-4 flex items-center gap-2">
      <div className="animate-spin h-4 w-4 rounded-full border-2 border-teal-500 border-t-transparent" />
      <span className="text-sm text-gray-500">Loading notifications…</span>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map(n => (
            <li key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-colors
                ${n.read
                  ? "bg-white border-gray-200 text-gray-600"
                  : "bg-teal-50 border-teal-200 text-gray-800"}`}>
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-xs mt-0.5">{n.body}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationSystem;


