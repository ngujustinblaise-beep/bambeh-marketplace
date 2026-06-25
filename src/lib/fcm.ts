/**
 * src/lib/fcm.ts � Bambeh Marketplace
 *
 * FILE LOCATION: C:\Dev\bambe-android\src\lib\fcm.ts
 *
 * Registers this Android device for Firebase push notifications.
 * Called once after every successful login.
 *
 * FIXED: uses "@/lib/supabase" (your project's correct import path)
 * instead of "./supabaseClient" (which does not exist).
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';  // ? FIXED � matches your project

export async function registerFCM(userId: string): Promise<void> {
  // Only run on a real Android/iOS device � skip entirely on web/browser
  if (!Capacitor.isNativePlatform()) {
    console.log('[FCM] Skipping registration � not a native platform');
    return;
  }

  // Ask the user for permission to send notifications
  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== 'granted') {
    console.warn('[FCM] Push notification permission denied by user');
    return;
  }

  // Register with the device's push service (FCM on Android)
  await PushNotifications.register();

  // When registration succeeds, save the token to Supabase
  // so the backend can look it up when sending push notifications
  PushNotifications.addListener('registration', async ({ value: token }) => {
    console.log('[FCM] Token received, saving to Supabase...');
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert(
        { user_id: userId, token, platform: 'android', updated_at: new Date().toISOString() },
        { onConflict: 'token' }
      );
    if (error) {
      console.warn('[FCM] Failed to save token:', error.message);
    } else {
      console.log('[FCM] Token saved successfully');
    }
  });

  // Log registration errors (don't show to user � non-critical)
  PushNotifications.addListener('registrationError', (err) => {
    console.warn('[FCM] Registration error:', err.error);
  });

  // Handle notification received while app is OPEN (foreground)
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[FCM] Notification received in foreground:', notification.title);
    // The bell icon (useNotifications hook) handles in-app display via Supabase Realtime.
    // No extra action needed here unless you want a toast popup.
  });

  // Handle user TAPPING a notification (app was in background or closed)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data ?? {};
    console.log('[FCM] Notification tapped, navigating...', data);

    // Deep link to the relevant screen based on notification type
    if (data.order_id) {
      window.location.hash = `/orders/${data.order_id}`;
    } else if (data.conversation_id) {
      window.location.hash = `/chat/${data.conversation_id}`;
    } else if (data.listing_id) {
      window.location.hash = `/marketplace/${data.listing_id}`;
    }
  });
}

