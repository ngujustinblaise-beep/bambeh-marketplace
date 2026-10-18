// BAMBEH_DEPLOY_TOKEN__ACTIVITY_PING_FIX807_CLEAN
/**
 * ActivityPing.tsx - FIX807 (replaces FIX780)
 * Tells Bambeh, quietly, that the app is open - so the Command Center can show how many people use Bambeh today,
 * this week, this month, this year, and who is live right now (FIX664 / FIX666 / FIX781).
 *  - one call when the app opens, or comes back after 30 minutes away (an "open")
 *  - one tiny call every 2 minutes while it is on screen (keeps "live now" true)
 *  - nothing while it is hidden. Nothing personal: a random id kept on this phone, the signed-in account if any,
 *    and website / installed website / Android app.
 * FIX780 - THE ANDROID APP IS COUNTED AS THE ANDROID APP (IS_NATIVE_APP, not IS_STORE_APP).
 *
 * FIX807 (Big, 18 Oct 2026: "trace how many views ... which item was viewed most, which one in special features,
 * in free help and in the other sections is reached the most and how many times it is opened"):
 *  EVERY PAGE OPENED IS COUNTED - one small call per page (bambeh_open, FIX806) with the page's shape, never its
 *  details: "/marketplace/:id", "/farm-fresh", "/pharmacies". When the page is an item (an advert, a job, a rental,
 *  a Farm Fresh product, a women's health place...), its id goes too, so the database counts the view - once per
 *  person per hour, never the owner's own look - and the "views" on the item page finally rise.
 *  Staff screens (/admin...) are never counted. The phone's random id is the same one App usage uses (track.ts),
 *  and the database keeps only a fingerprint of it.
 *  Mounted inside the router in App.tsx; if it is ever placed outside, it still pings and simply counts no pages.
 * Every error is ignored on purpose: counting must never disturb anyone.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useRef } from 'react';
import { useInRouterContext, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { IS_NATIVE_APP } from '@/config/storeMode';
import { deviceId } from '@/components/analytics/track';

const LIVE_EVERY_MS = 120000;
const NEW_OPEN_AFTER_MS = 30 * 60 * 1000;

export function platform(): string {
  if (IS_NATIVE_APP) return 'android-app';
  try {
    const installed = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    return installed ? 'installed' : 'web';
  } catch {
    return 'web';
  }
}

const UUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** FIX807 - the pages whose id is an item people look at (FIX806 knows which table holds each). */
export const ITEM_PAGES: readonly string[] = [
  '/marketplace/:id', '/services/:id', '/rentals/:id', '/vehicles/:id', '/jobs/:id', '/exchange/:id',
  '/farm-fresh/:id', '/community/:id', '/group-buying/:id', '/food-gas/place/:id',
  '/womens-health/place/:id', '/womens-health/day/:id',
];

/** FIX807 - a page's shape: ids become ":id", numbers ":n", a store's name ":key"; at most 4 parts. */
export function pageKey(pathname: unknown): { path: string; item: string | null } {
  const raw = String(pathname == null ? '/' : pathname).split('?')[0].split('#')[0].toLowerCase();
  let item: string | null = null;
  const parts = raw.split('/').filter(Boolean).slice(0, 4).map((p) => {
    if (UUID_RX.test(p)) {
      if (!item) item = p;
      return ':id';
    }
    if (/^[0-9]+$/.test(p)) return ':n';
    const s = p.replace(/[^a-z0-9_-]/g, '').slice(0, 30);
    return s || ':x';
  });
  if (parts[0] === 'corporate' && parts[1] === 'store' && parts.length > 2) parts[2] = ':key';
  const path = ('/' + parts.join('/')).slice(0, 80);
  return { path, item: ITEM_PAGES.indexOf(path) >= 0 ? item : null };
}

/** FIX807 - counts each page as it opens. Lives inside the router (it reads the current page). */
function PageOpens(): null {
  const loc = useLocation();
  const last = useRef('');
  useEffect(() => {
    const { path, item } = pageKey(loc.pathname);
    if (path === '/admin' || path.indexOf('/admin/') === 0) return;   // staff screens are not counted
    const sig = path + '|' + (item || '');
    if (sig === last.current) return;                                  // the same page drawn again
    last.current = sig;
    try {
      void Promise.resolve(supabase.rpc('bambeh_open', { p_device: deviceId(), p_path: path, p_item: item }))
        .then(() => undefined, () => undefined);
    } catch {
      /* never disturb the app */
    }
  }, [loc.pathname]);
  return null;
}

export default function ActivityPing() {
  const inRouter = useInRouterContext();
  useEffect(() => {
    const id = deviceId();
    let hiddenSince = 0;
    const send = (newOpen: boolean) => {
      try {
        void Promise.resolve(supabase.rpc('bambeh_ping', { p_device: id, p_platform: platform(), p_new_open: newOpen }))
          .then(() => undefined, () => undefined);
      } catch {
        /* never disturb the app */
      }
    };
    send(true);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') send(false);
    }, LIVE_EVERY_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenSince = Date.now();
        return;
      }
      const away = hiddenSince ? Date.now() - hiddenSince : 0;
      hiddenSince = 0;
      send(away >= NEW_OPEN_AFTER_MS);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  return inRouter ? <PageOpens /> : null;
}
// BAMBEH_END_TOKEN__ACTIVITY_PING_FIX807__COMPLETE
