import React, { useState, useRef, useEffect } from 'react';
import { useNotifications, type BambehNotification } from '@/hooks/useNotifications';

const BellIcon = ({ hasUnread }: { hasUnread: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    {hasUnread && <circle cx="18" cy="6" r="4" fill="#1D9E75" stroke="white" strokeWidth="1.5"/>}
  </svg>
);

const typeIcon: Record<string, string> = {
  welcome: '👋',
  subscription: '⭐',
  new_order: '🛒',
  new_message: '💬',
  order: '🛒',
  chat: '💬',
  promo: '🔔',
  system: '⚙️',
  review: '⭐',
  payment: '💳',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NotifItem({ notif, onRead }: { notif: BambehNotification; onRead: (id: string) => void }) {
  return (
    <div
      onClick={() => !notif.read && onRead(notif.id)}
      style={{
        display: 'flex',
        gap: '10px',
        padding: '12px 16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
        background: notif.read ? 'transparent' : 'rgba(29,158,117,0.05)',
        cursor: notif.read ? 'default' : 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(29,158,117,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {typeIcon[notif.type] ?? '🔔'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: notif.read ? 400 : 600, color: 'inherit', lineHeight: 1.3 }}>
            {notif.title}
          </span>
          {!notif.read && (
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75', flexShrink: 0, marginTop: 4 }} />
          )}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(128,128,128,0.9)', margin: '3px 0 0', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {notif.body.length > 120 ? notif.body.slice(0, 120) + '…' : notif.body}
        </p>
        <span style={{ fontSize: 11, color: 'rgba(128,128,128,0.7)', marginTop: 3, display: 'block' }}>
          {timeAgo(notif.created_at)}
        </span>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '6px', borderRadius: '50%', position: 'relative',
          color: 'inherit', display: 'flex', alignItems: 'center',
          transition: 'background 0.15s',
        }}
      >
        <BellIcon hasUnread={unreadCount > 0} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: '#1D9E75', color: '#fff',
            fontSize: 9, fontWeight: 700,
            borderRadius: 10, padding: '1px 4px',
            minWidth: 14, textAlign: 'center',
            border: '1.5px solid white',
            lineHeight: 1.4,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 340, maxHeight: 480,
          background: 'var(--color-background-primary, #fff)',
          borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 9999, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '0.5px solid rgba(0,0,0,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: 12, color: '#1D9E75', background: 'none',
                  border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'rgba(128,128,128,0.7)', fontSize: 13 }}>
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 13, color: 'rgba(128,128,128,0.8)' }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map(n => (
                <NotifItem key={n.id} notif={n} onRead={markRead} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
