export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "order" | "chat" | "promo" | "system" | "review" | "payment";
  read: boolean;
  timestamp: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  async getNotifications(userId: string): Promise<AppNotification[]> {
    console.debug("[NotifService] getNotifications:", userId);
    return [];
  }

  async markRead(notificationId: string): Promise<void> {
    console.debug("[NotifService] markRead:", notificationId);
  }

  async markAllRead(userId: string): Promise<void> {
    console.debug("[NotifService] markAllRead:", userId);
  }

  async send(notification: Omit<AppNotification, "id" | "read" | "timestamp">): Promise<void> {
    console.debug("[NotifService] send:", notification);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    console.debug("[NotifService] delete:", notificationId);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
