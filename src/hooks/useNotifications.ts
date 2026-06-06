$content = @'
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface BambehNotification {
  id: string;
  type: 'welcome' | 'subscription' | 'new_order' | 'new_message' | string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

// Global registry to prevent duplicate subscriptions across hook instances
const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<BambehNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const mountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data && mountedRef.current) setNotifications(data as BambehNotification[]);
    if (mountedRef.current) setLoading(false);
  }, [user?.id]);

  const markRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user?.id) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [user?.id]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (!user?.id) return;
    const channelKey = `bambeh-notifications-${user.id}`;

    // If a channel for this user already exists globally, skip creating another
    if (activeChannels.has(channelKey)) return;

    const channel = supabase
      .channel(channelKey)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (mountedRef.current) {
          setNotifications(prev => [payload.new as BambehNotification, ...prev]);
        }
      })
      .subscribe();

    activeChannels.set(channelKey, channel);

    return () => {
      activeChannels.delete(channelKey);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications };
}
'@
Set-Content "C:\Dev\bambe-android\src\hooks\useNotifications.ts" $content