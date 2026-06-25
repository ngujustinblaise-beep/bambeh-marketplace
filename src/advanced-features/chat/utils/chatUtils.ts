/**
 * BAMBÉ MARKETPLACE - CHAT UTILITY FUNCTIONS
 * Helper functions for chat functionality
 * Version: 1.0.0
 */

import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { enUS, fr } from "date-fns/locale";

/**
 * Format timestamp for message display
 */
export const formatMessageTime = (
  timestamp: string,
  language: "en" | "fr" = "en",
): string => {
  const date = new Date(timestamp);
  const locale = language === "fr" ? fr : enUS;

  if (isToday(date)) {
    return format(date, "HH:mm", { locale });
  } else if (isYesterday(date)) {
    return language === "fr" ? "Hier" : "Yesterday";
  } else {
    return format(date, "dd/MM/yyyy", { locale });
  }
};

/**
 * Format timestamp for conversation list
 */
export const formatConversationTime = (
  timestamp: string,
  language: "en" | "fr" = "en",
): string => {
  const date = new Date(timestamp);
  const locale = language === "fr" ? fr : enUS;

  if (isToday(date)) {
    return format(date, "HH:mm", { locale });
  } else if (isYesterday(date)) {
    return language === "fr" ? "Hier" : "Yesterday";
  } else {
    return formatDistanceToNow(date, { addSuffix: true, locale });
  }
};

/**
 * Format voice message duration
 */
export const formatVoiceDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Truncate long text
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generate avatar color based on name
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#43e97b",
    "#fa709a",
    "#30cfd0",
    "#a8edea",
    "#ff6a88",
    "#feca57",
    "#48dbfb",
    "#ff9ff3",
  ];

  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Group messages by date
 */
export const groupMessagesByDate = (
  messages: any[],
): { [key: string]: any[] } => {
  const groups: { [key: string]: any[] } = {};

  messages.forEach((message) => {
    const date = new Date(message.timestamp);
    const dateKey = format(date, "yyyy-MM-dd");

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(message);
  });

  return groups;
};

/**
 * Get date separator label
 */
export const getDateSeparatorLabel = (
  dateKey: string,
  language: "en" | "fr" = "en",
): string => {
  const date = new Date(dateKey);
  const locale = language === "fr" ? fr : enUS;

  if (isToday(date)) {
    return language === "fr" ? "Aujourd'hui" : "Today";
  } else if (isYesterday(date)) {
    return language === "fr" ? "Hier" : "Yesterday";
  } else {
    return format(date, "EEEE, MMMM d, yyyy", { locale });
  }
};

/**
 * Compress image before upload
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1024,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          0.8,
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate file type
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return validTypes.includes(file.type);
};

/**
 * Validate file size (max 5MB)
 */
export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Play notification sound
 */
export const playNotificationSound = (): void => {
  const audio = new Audio("/sounds/message-notification.mp3");
  audio.volume = 0.5;
  audio.play().catch(console.error);
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

/**
 * Show browser notification
 */
export const showNotification = (
  title: string,
  body: string,
  icon?: string,
): void => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/logo192.png",
      badge: "/logo192.png",
      // vibrate: [200, 100, 200] // not in TS NotificationOptions
    });
  }
};
