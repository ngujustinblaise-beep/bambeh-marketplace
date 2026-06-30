export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  link?: string | null;
  data?: Record<string, unknown> | null;
}
