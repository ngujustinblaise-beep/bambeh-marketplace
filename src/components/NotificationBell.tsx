// BAMBEH_DEPLOY_TOKEN__NOTIFICATIONBELL_FIX927_CLEAN
/**
 * src/components/NotificationBell.tsx - Bambeh Marketplace
 *
 * FIX927 - THE BELL THAT WORKS (Package 12; Bambeh's own colours - Big, 29 Oct 2026: "the old colour looks ok"). Before:
 *   - the list sat inside the white-text header, so the heading and every notification title were WHITE ON WHITE;
 *   - it read `read`, a field that does not exist (the database says `is_read`), so every notification looked unread
 *     forever and the dot never went away;
 *   - in Arabic the list opened off the left edge of the phone and the whole page zoomed out;
 *   - English only, and emoji for icons.
 * Now: dark words on a white card; `is_read`; on a phone the list spans the screen right under the header (whatever its
 * height), on a computer it opens under the bell on the side the language reads from; five languages; teal line icons.
 * A tap marks it read and opens what it is about (Bambeh's own pages only); "See all" opens the Notifications page.
 * The data is the same hook as before (useNotifications). The look stays Bambeh's: white card, teal, the green count.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingCart, MessageSquare, Star, CreditCard, Settings, Hand, Megaphone } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { BambehNotification } from '@/hooks/useNotifications';
import { useLang } from '@/hooks/useAppLang';

type Icon = ComponentType<{ className?: string }>;

const ICON: Record<string, Icon> = {
  welcome: Hand, subscription: Star, review: Star, new_order: ShoppingCart, order: ShoppingCart,
  new_message: MessageSquare, chat: MessageSquare, promo: Megaphone, system: Settings, payment: CreditCard,
};

// the words of the Notifications page (five languages) and of the old Home time line
const W: Record<string, Record<string, string>> = {
  en: {
    title: 'Notifications', markAll: 'Mark all read', loading: 'Loading notifications...', emptyTitle: 'All caught up!',
    emptyBody: 'Your notifications will appear here.', seeAll: 'See all',
    now: 'Just now', min: '{n} min ago', hour: '{n}h ago', day: '{n}d ago', unread: '{n} unread',
  },
  fr: {
    title: 'Notifications', markAll: 'Tout marquer comme lu', loading: 'Chargement des notifications...',
    emptyTitle: 'Tout est \u00e0 jour !', emptyBody: 'Vos notifications appara\u00eetront ici.', seeAll: 'Voir tout',
    now: '\u00c0 l\'instant', min: 'Il y a {n} min', hour: 'Il y a {n}h', day: 'Il y a {n}j', unread: '{n} non lues',
  },
  pidgin: {
    title: 'Notifications', markAll: 'Mark all as read', loading: 'Notifications dey load...',
    emptyTitle: 'Everything don set!', emptyBody: 'You notifications go show here.', seeAll: 'See all',
    now: 'Just now', min: '{n} min ago', hour: '{n}h ago', day: '{n}d ago', unread: '{n} wey you never read',
  },
  ar: {
    title: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a', markAll: '\u0648\u0636\u0639 \u0627\u0644\u0643\u0644 \u0643\u0645\u0642\u0631\u0648\u0621',
    loading: '\u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a...',
    emptyTitle: '\u0643\u0644 \u0634\u064a\u0621 \u0645\u062d\u062f\u062b!', emptyBody: '\u0633\u062a\u0638\u0647\u0631 \u0625\u0634\u0639\u0627\u0631\u0627\u062a\u0643 \u0647\u0646\u0627.',
    seeAll: '\u0639\u0631\u0636 \u0627\u0644\u0643\u0644',
    now: '\u0644\u0644\u062a\u0648', min: '\u0645\u0646\u0630 {n} \u062f\u0642\u064a\u0642\u0629', hour: '\u0645\u0646\u0630 {n} \u0633\u0627\u0639\u0629',
    day: '\u0645\u0646\u0630 {n} \u064a\u0648\u0645', unread: '{n} \u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621\u0629',
  },
  ff: {
    title: 'Tintinn\u0257e', markAll: 'Wa\u0257o fow ja\u014bde', loading: 'Your notifications are loading...',
    emptyTitle: 'Kuu\u0253e fow oo\u00f1ii!', emptyBody: 'Tintinn\u0257e maa \u0253e wa\u0257o e ndee.', seeAll: 'Yiylo fof',
    now: 'Gooto', min: 'Sekkere {n} ago', hour: 'Lewru {n} ago', day: 'Joom {n} ago', unread: '{n}',
  },
};
const ALIAS: Record<string, string> = { pcm: 'pidgin', pid: 'pidgin', ful: 'ff', fulfulde: 'ff' };

export function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [panelTop, setPanelTop] = useState<number | null>(null);   // FIX927 - on a phone: right under the header
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const raw = String(useLang() || 'en');
  const lang = ALIAS[raw] || raw;
  const w = (k: string, n?: number): string => {
    const v = (W[lang] && W[lang][k]) || W.en[k] || k;
    return n === undefined ? v : v.split('{n}').join(String(n));
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  const ago = (iso: string): string => {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (!Number.isFinite(m) || m < 1) return w('now');
    if (m < 60) return w('min', m);
    const h = Math.floor(m / 60);
    if (h < 24) return w('hour', h);
    return w('day', Math.floor(h / 24));
  };

  const tap = (n: BambehNotification) => {
    if (!n.is_read) void markRead(n.id);
    const link = typeof n.link === 'string' ? n.link : '';
    if (link.startsWith('/')) { setOpen(false); navigate(link); }   // only Bambeh's own pages
  };

  const label = w('title') + (unreadCount > 0 ? ' (' + w('unread', unreadCount) + ')' : '');

  return (
    <div ref={ref} className="relative" data-fix="FIX927">
      <button
        type="button"
        onClick={() => {
          if (!open && ref.current) {
            // the header's real bottom edge (Bambeh's header is taller on some pages and phones)
            const hdr = ref.current.closest('header');
            const box = (hdr || ref.current).getBoundingClientRect();
            const phone = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches;
            setPanelTop(phone ? Math.max(8, Math.round(box.bottom + 6)) : null);
          }
          setOpen((o) => !o);
        }}
        aria-label={label}
        title={label}
        aria-expanded={open}
        data-bell="1"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-current hover:bg-white/10 active:bg-white/20 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            data-bell-count={unreadCount}
            className="absolute top-0.5 end-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1D9E75] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={w('title')}
          data-bell-panel="1"
          style={panelTop === null ? undefined : { top: panelTop }}
          className="fixed inset-x-2 z-[70] flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-start text-gray-900 shadow-2xl top-[4.5rem] md:absolute md:inset-x-auto md:end-0 md:top-full md:mt-2 md:w-[360px]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <span className="text-[15px] font-bold">{w('title')}</span>
            {unreadCount > 0 && (
              <button type="button" onClick={() => void markAllRead()} className="rounded-lg px-2 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50">
                {w('markAll')}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">{w('loading')}</p>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                  <Bell className="h-6 w-6 text-teal-600" />
                </span>
                <p className="mt-3 text-sm font-bold">{w('emptyTitle')}</p>
                <p className="mt-1 text-xs text-gray-500">{w('emptyBody')}</p>
              </div>
            ) : (
              notifications.slice(0, 30).map((n) => {
                const I = ICON[n.type] || Bell;
                const body = String(n.body || '');
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => tap(n)}
                    data-note={n.is_read ? 'read' : 'unread'}
                    className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-start transition-colors hover:bg-gray-50 ${n.is_read ? '' : 'bg-teal-50/60'}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50">
                      <I className="h-4 w-4 text-teal-600" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className={`text-[13px] leading-snug ${n.is_read ? 'font-normal' : 'font-bold'}`}>{n.title}</span>
                        {!n.is_read && <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1D9E75]" />}
                      </span>
                      {body ? <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 line-clamp-2">{body}</span> : null}
                      <span className="mt-0.5 block text-[11px] text-gray-400">{ago(n.created_at)}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => { setOpen(false); navigate('/notifications'); }}
            className="border-t border-gray-100 px-4 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50"
            data-bell-all="1"
          >
            {w('seeAll')}
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
// BAMBEH_END_TOKEN__NOTIFICATIONBELL_FIX927__COMPLETE
