// BAMBEH_DEPLOY_TOKEN__PUSHNOTIFICATIONS_FIX87_CLEAN
// FILE LOCATION: src/utils/pushNotifications.ts
//
// Registers the device for Firebase push and saves its FCM token to the
// device_tokens table (fix86) so the server can notify this phone. Runs on
// NATIVE only (Android/iOS) — the web build has no FCM and is skipped safely.
//
// Called once by <PushInit /> when a user is signed in. No stubs.

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/lib/supabase';

let started = false;

async function saveToken(token: string): Promise<void> {
  try {
    if (!token) return;
    const { data } = await supabase.auth.getUser();
    const uid = data?.user?.id;
    if (!uid) return;

    // Upsert on the unique token so a device maps to exactly one row, and
    // re-associates to the current user if a different account signs in.
    await supabase.from('device_tokens').upsert(
      {
        user_id: uid,
        token,
        platform: Capacitor.getPlatform(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    );
  } catch (e) {
    console.warn('[push] saveToken failed', e);
  }
}

/**
 * Initialise push notifications. Safe to call multiple times (idempotent) and
 * safe on web (no-op). Pass a callback to run when the user taps a
 * notification (e.g. navigate to the chat screen).
 */
export async function initPush(onNotificationTap?: () => void): Promise<void> {
  if (Capacitor.getPlatform() === 'web') return; // native only
  if (started) return;
  started = true;

  try {
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') {
      started = false; // allow a retry after the user grants permission later
      return;
    }

    // Fresh listeners so repeated calls don't stack handlers.
    await PushNotifications.removeAllListeners();

    PushNotifications.addListener('registration', (t) => {
      void saveToken(t.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.warn('[push] registration error', err);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', () => {
      if (onNotificationTap) onNotificationTap();
    });

    await PushNotifications.register();
  } catch (e) {
    console.warn('[push] init failed', e);
    started = false;
  }
}

export default initPush;
// BAMBEH_END_TOKEN__PUSHNOTIFICATIONS_FIX87__COMPLETE
