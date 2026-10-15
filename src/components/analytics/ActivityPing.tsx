// BAMBEH_DEPLOY_TOKEN__ACTIVITY_PING_FIX780_CLEAN
/**
 * ActivityPing.tsx - FIX780 (replaces FIX665)
 * Tells Bambeh, quietly, that the app is open - so the Command Center can show how many people use Bambeh today,
 * this week, this month, this year, and who is live right now (FIX664 / FIX666 / FIX781).
 *  - one call when the app opens, or comes back after 30 minutes away (an "open")
 *  - one tiny call every 2 minutes while it is on screen (keeps "live now" true)
 *  - nothing while it is hidden. Nothing personal: a random id kept on this phone, the signed-in account if any,
 *    and website / installed website / Android app.
 * FIX780 - THE ANDROID APP IS COUNTED AS THE ANDROID APP. FIX665 asked IS_STORE_APP, which has been false since
 *  Bambeh left Google Play (FIX682), so every visit from the installed APK was counted as "Website" and the
 *  Command Center showed 0 for the Android app. It now asks IS_NATIVE_APP - "am I inside the installed app?".
 *  The random id is shared with the sign-up and sign-in steps (track.ts, FIX775), so a phone is one phone.
 * Every error is ignored on purpose: counting must never disturb anyone.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect } from 'react';
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

export default function ActivityPing(): null {
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
  return null;
}
// BAMBEH_END_TOKEN__ACTIVITY_PING_FIX780__COMPLETE
