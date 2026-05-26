/**
 * supabase/functions/saved-search-alerts/index.ts — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * Saved Search Alert Engine
 * ─────────────────────────
 * Triggered by a Supabase pg_cron job every 15 minutes OR by a
 * Postgres trigger on INSERT to the `listings` table.
 *
 * For each user's saved searches, it:
 *   1. Finds new listings posted in the last 15 minutes
 *   2. Matches them against the saved search query + filters
 *   3. Sends a push notification via FCM (Firebase Cloud Messaging)
 *   4. Stores the alert in `notification_logs` for the in-app bell
 *
 * ─────────────────────────────────────────────────────────────────
 * SETUP INSTRUCTIONS
 * ─────────────────────────────────────────────────────────────────
 *
 * 1. Deploy this function:
 *      supabase functions deploy saved-search-alerts --project-ref rbjbdxefwzvgmioearie
 *
 * 2. Set up pg_cron in Supabase SQL Editor (run once):
 *      SELECT cron.schedule(
 *        'saved-search-alerts',
 *        '* /15 * * * *',
 *        $$
 *        SELECT net.http_post(
 *          url := 'https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/saved-search-alerts',
 *          headers := '{"Content-Type":"application/json","Authorization":"Bearer ' ||
 *                     current_setting('app.service_role_key') || '"}'::jsonb,
 *          body := '{}'::jsonb
 *        );
 *        $$
 *      );
 *
 * 3. Required secrets (already set via supabase secrets set):
 *      SUPABASE_URL
 *      SUPABASE_SERVICE_ROLE_KEY
 *      FCM_SERVER_KEY (Firebase Cloud Messaging server key)
 *
 * ─────────────────────────────────────────────────────────────────
 * DATABASE TABLES REQUIRED
 * ─────────────────────────────────────────────────────────────────
 *
 * saved_searches:
 *   id, user_id, query (text), category (text), min_price (int),
 *   max_price (int), location (text), created_at, last_alerted_at
 *
 * listings:
 *   id, title, description, price, category, location, created_at, status
 *
 * profiles:
 *   id (= user_id), fcm_token (text), full_name, notification_alerts (bool)
 *
 * notification_logs:
 *   id, user_id, type, title, body, data (jsonb), read, created_at
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── CORS ─────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface SavedSearch {
  id: string;
  user_id: string;
  query: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  location?: string;
  last_alerted_at?: string;
}

interface Listing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  location?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  fcm_token?: string;
  notification_alerts?: boolean;
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log("[saved-search-alerts] Starting alert run at", new Date().toISOString());

  // ── Step 1: Get all active saved searches ─────────────────────────────────
  const { data: savedSearches, error: ssError } = await supabase
    .from("saved_searches")
    .select("id, user_id, query, category, min_price, max_price, location, last_alerted_at")
    .eq("is_active", true);

  if (ssError) {
    console.error("[saved-search-alerts] Error fetching saved searches:", ssError.message);
    return new Response(JSON.stringify({ error: ssError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!savedSearches || savedSearches.length === 0) {
    console.log("[saved-search-alerts] No active saved searches found");
    return new Response(JSON.stringify({ processed: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`[saved-search-alerts] Processing ${savedSearches.length} saved searches`);

  // ── Step 2: Get new listings from the last 15 minutes ─────────────────────
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data: newListings, error: listError } = await supabase
    .from("listings")
    .select("id, title, description, price, category, location, created_at")
    .eq("status", "active")
    .gte("created_at", fifteenMinsAgo)
    .order("created_at", { ascending: false });

  if (listError) {
    console.error("[saved-search-alerts] Error fetching listings:", listError.message);
    return new Response(JSON.stringify({ error: listError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!newListings || newListings.length === 0) {
    console.log("[saved-search-alerts] No new listings in last 15 minutes");
    return new Response(JSON.stringify({ processed: 0, newListings: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`[saved-search-alerts] Found ${newListings.length} new listings`);

  // ── Step 3: Match listings against each saved search ──────────────────────
  let totalAlertsSent = 0;

  // Group saved searches by user to send one notification per user
  const userSearchMap = new Map<string, { searches: SavedSearch[]; matches: Listing[] }>();

  for (const search of savedSearches as SavedSearch[]) {
    const matches = matchListings(search, newListings as Listing[]);
    if (matches.length === 0) continue;

    const existing = userSearchMap.get(search.user_id) ?? { searches: [], matches: [] };
    existing.searches.push(search);
    // Deduplicate matches across multiple saved searches
    for (const match of matches) {
      if (!existing.matches.find(m => m.id === match.id)) {
        existing.matches.push(match);
      }
    }
    userSearchMap.set(search.user_id, existing);
  }

  if (userSearchMap.size === 0) {
    console.log("[saved-search-alerts] No matches found");
    return new Response(JSON.stringify({ processed: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Step 4: Fetch user profiles for FCM tokens ────────────────────────────
  const userIds = Array.from(userSearchMap.keys());

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, fcm_token, notification_alerts")
    .in("id", userIds);

  const profileMap = new Map<string, UserProfile>();
  for (const p of (profiles ?? []) as UserProfile[]) {
    profileMap.set(p.id, p);
  }

  // ── Step 5: Send notifications ────────────────────────────────────────────
  const fcmKey = Deno.env.get("FCM_SERVER_KEY");
  const notificationLogs: object[] = [];

  for (const [userId, { searches, matches }] of userSearchMap) {
    const profile = profileMap.get(userId);

    // Skip if user has disabled alerts
    if (profile?.notification_alerts === false) continue;

    const count = matches.length;
    const firstMatch = matches[0];
    const searchQuery = searches[0].query;

    const title = `🔔 ${count} new listing${count > 1 ? "s" : ""} for "${searchQuery}"`;
    const body = count === 1
      ? `${firstMatch.title}${firstMatch.price ? ` — ${firstMatch.price.toLocaleString()} XAF` : ""}`
      : `${firstMatch.title} and ${count - 1} more match${count - 1 > 1 ? "es" : ""}`;

    const notifData = {
      type: "saved_search_alert",
      search_query: searchQuery,
      listing_id: firstMatch.id,
      count: String(count),
      path: `/search?q=${encodeURIComponent(searchQuery)}`,
    };

    // Store in notification_logs for in-app bell icon
    notificationLogs.push({
      user_id: userId,
      type: "saved_search_alert",
      title,
      body,
      data: notifData,
      read: false,
    });

    // Send FCM push notification if token exists
    if (profile?.fcm_token && fcmKey) {
      try {
        const fcmResponse = await fetch(
          "https://fcm.googleapis.com/fcm/send",
          {
            method: "POST",
            headers: {
              "Authorization": `key=${fcmKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: profile.fcm_token,
              notification: { title, body, sound: "default", badge: "1" },
              data: notifData,
              android: {
                priority: "normal",
                notification: {
                  channel_id: "bambeh_alerts",
                  click_action: "FLUTTER_NOTIFICATION_CLICK",
                },
              },
            }),
          }
        );

        if (fcmResponse.ok) {
          totalAlertsSent++;
          console.log(`[saved-search-alerts] FCM sent to user ${userId}: ${count} match(es)`);
        }
      } catch (fcmErr) {
        console.warn(`[saved-search-alerts] FCM failed for user ${userId}:`, fcmErr);
      }
    } else {
      totalAlertsSent++;
    }
  }

  // ── Step 6: Batch insert notification logs ────────────────────────────────
  if (notificationLogs.length > 0) {
    const { error: logError } = await supabase
      .from("notification_logs")
      .insert(notificationLogs);

    if (logError) {
      console.warn("[saved-search-alerts] Failed to insert notification logs:", logError.message);
    }
  }

  // ── Step 7: Update last_alerted_at for matched saved searches ─────────────
  const matchedSearchIds = (savedSearches as SavedSearch[])
    .filter(s => userSearchMap.has(s.user_id))
    .map(s => s.id);

  if (matchedSearchIds.length > 0) {
    await supabase
      .from("saved_searches")
      .update({ last_alerted_at: new Date().toISOString() })
      .in("id", matchedSearchIds);
  }

  console.log(`[saved-search-alerts] Done — ${totalAlertsSent} alerts sent to ${userSearchMap.size} users`);

  return new Response(
    JSON.stringify({
      success: true,
      alertsSent: totalAlertsSent,
      usersNotified: userSearchMap.size,
      newListingsChecked: newListings.length,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});

// ─── MATCHING ENGINE ──────────────────────────────────────────────────────────

/**
 * Checks whether a listing matches a saved search's criteria.
 * Matching is case-insensitive and checks title + description.
 */
function matchListings(search: SavedSearch, listings: Listing[]): Listing[] {
  const queryWords = search.query.toLowerCase().split(/\s+/).filter(Boolean);

  return listings.filter(listing => {
    const searchableText = [
      listing.title,
      listing.description ?? "",
    ].join(" ").toLowerCase();

    // All query words must appear in the listing text
    const textMatches = queryWords.every(word => searchableText.includes(word));
    if (!textMatches) return false;

    // Category filter
    if (search.category && listing.category) {
      if (listing.category.toLowerCase() !== search.category.toLowerCase()) {
        return false;
      }
    }

    // Price range filter
    if (search.min_price && listing.price !== undefined) {
      if (listing.price < search.min_price) return false;
    }
    if (search.max_price && listing.price !== undefined) {
      if (listing.price > search.max_price) return false;
    }

    // Location filter (partial match)
    if (search.location && listing.location) {
      if (!listing.location.toLowerCase().includes(search.location.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}
