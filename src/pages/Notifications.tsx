import React from 'react';
import { useNotifications, BambehNotification } from '@/hooks/useNotifications';
import { useLang, t } from "@/hooks/useAppLang";

const typeIcon: Record<string, string> = {
  welcome:      '👋',
  subscription: '⭐',
  new_order:    '🛒',
  new_message:  '💬',
};

const typeBg: Record<string, string> = {
  welcome:      'rgba(29,158,117,0.12)',
  subscription: 'rgba(239,159,39,0.12)',
  new_order:    'rgba(55,138,221,0.12)',
  new_message:  'rgba(212,83,126,0.12)',
};

function timeAgo(dateStr: string): string {
  const lang = useLang();
  const isRtl = lang === "ar";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function NotifCard({ notif, onRead }: { notif: BambehNotification; onRead: (id: string) => void }) {
  const icon = typeIcon[notif.type] ?? '🔔';
  const bg   = typeBg[notif.type]   ?? 'rgba(29,158,117,0.12)';

  return (
    <div
      onClick={() => !notif.is_read && onRead(notif.id)}
      style={{
        display: 'flex', gap: 14, padding: '16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
        background: notif.is_read ? 'transparent' : 'rgba(29,158,117,0.04)',
        cursor: notif.is_read ? 'default' : 'pointer',
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 14, fontWeight: notif.is_read ? 500 : 700,
            lineHeight: 1.3, color: 'inherit',
          }}>
            {notif.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: 'rgba(128,128,128,0.75)', whiteSpace: 'nowrap' }}>
              {timeAgo(notif.created_at)}
            </span>
            {!notif.is_read && (
              <div  style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75' }} />
            )}
          </div>
        </div>
        <p style={{
          fontSize: 13, color: 'rgba(100,100,100,0.9)',
          margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {notif.body}
        </p>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--color-background-primary, #fff)',
        borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        padding: '16px 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && (
            <span style={{ fontSize: 12, color: '#1D9E75', fontWeight: 500 }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              fontSize: 13, color: '#1D9E75', background: 'rgba(29,158,117,0.08)',
              border: 'none', borderRadius: 20, padding: '6px 14px',
              cursor: 'pointer', fontWeight: 500,
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(128,128,128,0.7)' }}>Loading notifications…</div>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>All caught up!</div>
          <div style={{ fontSize: 13, color: 'rgba(128,128,128,0.8)' }}>
            Your notifications will appear here
          </div>
        </div>
      ) : (
        <div>
          {notifications.map(n => (
            <NotifCard key={n.id} notif={n} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
