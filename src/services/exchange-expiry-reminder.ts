/**
 * src/services/exchange-expiry-reminder.ts — Bambeh Marketplace
 *
 * Call scheduleExpiryReminders() once at app start (App.tsx useEffect).
 * Call renewExchangeListing(itemId) from the detail page "Renew" button.
 *
 * ✅ Idempotent upsert — safe to call on every app open
 * ✅ In-app notification row per expiring item
 * ✅ renewExchangeListing resets expires_at + clears the notification
 */

import { supabase } from '@/lib/supabase';

const REMINDER_DAYS = 3;

export async function scheduleExpiryReminders(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const userId = session.user.id;
    const now    = new Date();
    const cutoff = new Date(now.getTime() + REMINDER_DAYS * 24 * 3600 * 1000).toISOString();

    const { data: expiring, error } = await supabase
      .from('exchange_items')
      .select('id, title, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lte('expires_at', cutoff)
      .gte('expires_at', now.toISOString());

    if (error || !expiring?.length) return;

    for (const item of expiring) {
      const daysLeft = Math.ceil(
        (new Date(item.expires_at as string).getTime() - now.getTime()) / 86_400_000
      );
      const message = daysLeft <= 1
        ? `Your listing "${item.title}" expires today! Renew it to keep receiving offers.`
        : `Your listing "${item.title}" expires in ${daysLeft} days. Renew it to keep receiving offers.`;

      await supabase
        .from('notifications')
        .upsert(
          {
            user_id:  userId,
            type:     'exchange_expiry',
            title:    'Listing Expiring Soon',
            body:     message,
            link:     `/exchange/${item.id as string}`,
            is_read:  false,
            metadata: { exchange_item_id: item.id, expires_at: item.expires_at },
          },
          {
            onConflict:       'user_id,type,metadata->exchange_item_id',
            ignoreDuplicates: true,
          }
        );
    }
  } catch {
    // Best-effort — never crash the app
  }
}

export async function renewExchangeListing(itemId: string): Promise<{ error: string | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { error: 'Not authenticated.' };

    const newExpiry = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    const { error } = await supabase
      .from('exchange_items')
      .update({ expires_at: newExpiry, status: 'active' })
      .eq('id', itemId)
      .eq('user_id', session.user.id);

    if (error) return { error: error.message };

    // Mark the expiry reminder as read/dismissed
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('type', 'exchange_expiry')
      .contains('metadata', { exchange_item_id: itemId });

    return { error: null };
  } catch (e: any) {
    return { error: e.message || 'Failed to renew listing.' };
  }
}
