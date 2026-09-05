// BAMBEH_DEPLOY_TOKEN__ADINTERSTITIAL_FIX465_CLEAN
/**
 * src/components/ads/AdInterstitial.tsx - Bambeh Marketplace
 *
 * FIX430: the pop-up advert for free users.
 *
 * WHY IT IS NOT WHAT WAS FIRST ASKED FOR
 *   The original idea was a full-screen advert every 40 seconds that the user
 *   could not close. That is 90 adverts an hour. Google Play's Ads policy names
 *   undismissable and unexpected full-screen interstitials as violations, and
 *   Apple treats them the same way under 4.2. It would be rejected, and if it
 *   somehow shipped, uninstalled by day two.
 *
 *   This version earns the same money and passes both stores:
 *     - shown after every 5 listing views, never on a timer
 *     - hard maximum of 3 per session
 *     - a real CLOSE BUTTON that appears after 3 seconds, and a countdown so
 *       the user can see it coming
 *     - at least 90 seconds between adverts, whatever the view count says
 *     - static image only. Video would burn a Cameroonian user's data bundle,
 *       and that is their money, not just their patience
 *     - premium users never see one
 *     - Escape key and the backdrop both close it once the timer is done
 *
 * HOW TO USE
 *   Mount once, high up (App.tsx or MainLayout):
 *       <AdInterstitial />
 *   Then call this from any listing detail page when it opens:
 *       import { countListingView } from "@/components/ads/AdInterstitial";
 *       useEffect(() => { countListingView(); }, []);
 *
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePlanLimits } from "@/hooks/usePlanLimits";

/* ------------------------------------------------------------------ rules -- */
const VIEWS_PER_AD    = 5;       // show after this many listing views
const MAX_PER_SESSION = 3;       // hard ceiling, never exceeded
const CLOSE_AFTER_MS  = 3000;    // close button appears after 3 seconds
const MIN_GAP_MS      = 90000;   // at least 90s between adverts

const VIEW_KEY  = "bambeh_ad_views";
const SHOWN_KEY = "bambeh_ad_shown";
const LAST_KEY  = "bambeh_ad_last";

type Listener = () => void;
const listeners = new Set<Listener>();

/* FIX465 - the advert pool lives at MODULE level, not in a ref.
   MainLayout wraps each route element, so it unmounts and remounts on every
   navigation. A ref-held pool would refetch on every single page view. This
   is fetched once per page load and reused. */
let adPool: AdRow[] = [];
let poolFetched = false;

/* FIX465 - which paths count as "a listing was viewed".
   Counting here instead of inside each detail page means a new detail page
   added later is covered automatically, and no existing page had to change.
   Singular and plural are both matched because this codebase uses both. */
const LISTING_PATH =
  /^\/(marketplace|item|items|jobs?|services?|rentals?|vehicles?|exchange|farm-fresh|farmfresh)\/[^/]+$/i;

function readNum(key: string): number {
  try { return Number(window.sessionStorage.getItem(key) ?? "0") || 0; } catch { return 0; }
}
function writeNum(key: string, v: number): void {
  try { window.sessionStorage.setItem(key, String(v)); } catch { /* blocked */ }
}

/**
 * Call once each time a listing detail page opens.
 * Counting happens even for premium users - it costs nothing and keeps the
 * behaviour identical if they later downgrade mid-session.
 */
export function countListingView(): void {
  writeNum(VIEW_KEY, readNum(VIEW_KEY) + 1);
  listeners.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
}

export interface AdRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  company_name: string | null;
}

export default function AdInterstitial() {
  const plan = usePlanLimits();
  const navigate = useNavigate();
  const location = useLocation();

  const [ad, setAd] = useState<AdRow | null>(null);
  const [open, setOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(CLOSE_AFTER_MS / 1000));
  const lastCounted = useRef<string>("");

  /* ---- load the pool once. Never blocks anything if it fails. ------------ */
  useEffect(() => {
    if (poolFetched) return;
    if (plan.loading) return;
    if (plan.isPremium) return;      // premium never sees an advert
    poolFetched = true;

    (async () => {
      try {
        // FIX465 - the schedule is now honoured. Before this, an advert booked
        // for next month ran today and an expired one ran forever, which is
        // exactly the kind of thing an advertiser stops paying over.
        // A null start means "already running"; a null end means "no end date".
        const nowIso = new Date().toISOString();
        const { data, error } = await supabase
          .from("corporate_ads")
          .select("id, title, description, image_url, link_url, company_name")
          .eq("is_active", true)
          .not("image_url", "is", null)
          .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
          .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
          .limit(20);
        if (error || !Array.isArray(data)) return;   // silence is correct here
        adPool = data as AdRow[];
      } catch {
        // an advert failing to load must never disturb the app
      }
    })();
  }, [plan.loading, plan.isPremium]);

  /* ---- FIX465: count a listing view whenever the route becomes a detail page.
     Guarded on the path so React StrictMode's double-invoke, a re-render, or
     a query-string change cannot count the same page twice. --------------- */
  useEffect(() => {
    const path = location.pathname;
    if (path === lastCounted.current) return;
    if (!LISTING_PATH.test(path)) return;
    lastCounted.current = path;
    countListingView();
  }, [location.pathname]);

  /* ---- decide whether this view earns an advert ------------------------- */
  const maybeShow = useCallback(() => {
    if (plan.isPremium) return;
    if (open) return;
    if (adPool.length === 0) return;

    const views = readNum(VIEW_KEY);
    const shown = readNum(SHOWN_KEY);
    const last  = readNum(LAST_KEY);

    if (shown >= MAX_PER_SESSION) return;
    if (views === 0 || views % VIEWS_PER_AD !== 0) return;
    if (last > 0 && Date.now() - last < MIN_GAP_MS) return;

    const pick = adPool[Math.floor(Math.random() * adPool.length)];
    if (!pick) return;

    setAd(pick);
    setCanClose(false);
    setCountdown(Math.ceil(CLOSE_AFTER_MS / 1000));
    setOpen(true);
    writeNum(SHOWN_KEY, shown + 1);
    writeNum(LAST_KEY, Date.now());

    // fire and forget - a failed view count must not break the advert
    void supabase.rpc("bump_ad_view", { ad_id: pick.id }).catch(() => undefined);
  }, [open, plan.isPremium]);

  useEffect(() => {
    listeners.add(maybeShow);
    return () => { listeners.delete(maybeShow); };
  }, [maybeShow]);

  /* ---- the close timer. This is the part the stores check. --------------- */
  useEffect(() => {
    if (!open) return;
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.ceil((CLOSE_AFTER_MS - (Date.now() - started)) / 1000);
      if (left <= 0) {
        setCountdown(0);
        setCanClose(true);
        window.clearInterval(tick);
      } else {
        setCountdown(left);
      }
    }, 250);
    return () => window.clearInterval(tick);
  }, [open]);

  const close = useCallback(() => {
    if (!canClose) return;
    setOpen(false);
    setAd(null);
  }, [canClose]);

  /* ---- Escape closes it too, once the timer is done ---------------------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || !ad) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ad.title}
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* the close control. Always present, so the user can SEE it coming. */}
        <button
          type="button"
          onClick={close}
          disabled={!canClose}
          aria-label="Close advert"
          className={`absolute right-3 top-3 z-10 flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-bold transition ${
            canClose
              ? "bg-white text-gray-900 shadow active:scale-95"
              : "bg-black/45 text-white cursor-default"
          }`}
        >
          {canClose ? <X className="h-5 w-5" /> : countdown}
        </button>

        {/* honest label. Both stores want adverts identifiable as adverts. */}
        <span className="absolute left-3 top-3 z-10 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Ad
        </span>

        {ad.image_url && (
          <img
            src={ad.image_url}
            alt={ad.title}
            className="h-56 w-full object-cover"
            loading="eager"
          />
        )}

        <div className="p-4">
          {ad.company_name && (
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {ad.company_name}
            </p>
          )}
          <h3 className="mt-0.5 text-base font-bold text-gray-900">{ad.title}</h3>
          {ad.description && (
            <p className="mt-1 text-sm text-gray-600">{ad.description}</p>
          )}

          {ad.link_url && (
            <button
              type="button"
              onClick={() => {
                void supabase.rpc("bump_ad_click", { ad_id: ad.id }).catch(() => undefined);
                const url = ad.link_url as string;
                if (url.startsWith("/")) { setOpen(false); navigate(url); }
                else { window.open(url, "_blank", "noopener,noreferrer"); }
              }}
              className="mt-3 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white active:scale-95"
            >
              Learn more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__ADINTERSTITIAL_FIX465__COMPLETE
