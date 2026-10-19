// BAMBEH_DEPLOY_TOKEN__FEATUREDADSSTRIP_FIX825_CLEAN
/**
 * FeaturedAdsStrip.tsx - Bambeh Marketplace - FIX825 (replaces FIX470)
 * FILE LOCATION: src/components/ads/FeaturedAdsStrip.tsx
 *
 * FIX825, Big 18 Oct 2026: "we can switch off all free ads running now on the feature ad as well as corporate ads and
 * choose which ads should run based on payments ... the toogle should have an option to put all ads as featured ads or
 * select a few ads ... i think we should make the 10 ADVERTS run pass on the screen before the next set of ads run past."
 *
 * WHAT RUNS HERE is decided in Command Center > Featured ads (FIX827) and read through adControl (FIX824):
 *   'all'      - everything posted, as before (FIX108/FIX470): marketplace, jobs, services, rentals, vehicles, Farm
 *                Fresh, swaps - with the chosen (paid) adverts and items FIRST
 *   'selected' - only the adverts and items chosen in the Command Center
 *   'off'      - nothing: the strip (and its heading on Home) disappears
 * A company advert (made in the Command Center, no Bambeh account needed) runs on Home and on every section's strip,
 * marked "Ad"; tapping it opens it larger, with "Learn more" when it has a link. Seen and tapped are counted once per
 * phone session for the advertiser.
 *
 * SETS OF 10 THAT PASS ACROSS THE SCREEN: the cards of a set move along one by one (every 2.6 s) until the last one
 * has been on screen, then the next set of 10 comes in. A finger on the strip pauses it; it never moves while it is
 * off screen, while the phone's "reduce motion" is on, or while the app is in the background. The arrows and dots
 * still change sets by hand.
 *
 * Earlier: FIX108 real posts from the seven sections; FIX323 expired posts left out; FIX428 the last good set kept for
 * a weak connection; FIX470 paid features first. Same props as before (plus `heading`), so every page keeps working.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Tag, Briefcase, ShoppingBag, Wrench, Home, Car,
  Leaf, Star, Loader2, ArrowLeftRight, Megaphone, X, ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";
import LocationLock from "@/components/security/LocationLock";
import { countAd, itemInCategory, useAdNow } from "@/components/ads/adControl";
import type { AdItem } from "@/components/ads/adControl";

const STRIP_CACHE_KEY = "bambeh_strip_";

// Kept broad so existing callers passing any old category value still compile.
export type AdCategory =
  | "marketplace" | "jobs" | "services" | "rentals" | "vehicles"
  | "exchange" | "flash-deals" | "group-buying" | "farm-fresh";

type Kind = "marketplace" | "job" | "service" | "rental" | "vehicle" | "farm" | "exchange" | "advert";

interface StripItem {
  id: string;
  kind: Kind;
  title: string;
  price: number | null;
  unit?: string | null;
  location: string | null;
  image: string | null;
  created_at: string;
  /** FIX470 - true only while a paid feature is actually running. */
  featured?: boolean;
  /** FIX825 - a company advert: its words, company and link */
  advert?: { company: string | null; description: string | null; link: string | null };
}

interface FeaturedAdsStripProps {
  category?: AdCategory;
  searchQuery?: string;
  maxVisible?: number;      // the size of one set (default 10)
  showHeader?: boolean;
  className?: string;
  /** FIX825 - Home's big heading. Given: the heading shows only when there is something to show. */
  heading?: string;
}

const KIND_META: Record<Kind, {
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  text: string;
  route: (id: string) => string | null;
}> = {
  marketplace: { icon: ShoppingBag,    badge: "bg-blue-100",   text: "text-blue-700",   route: (id) => `/marketplace/${id}` },
  job:         { icon: Briefcase,      badge: "bg-amber-100",  text: "text-amber-700",  route: (id) => `/jobs/${id}` },
  service:     { icon: Wrench,         badge: "bg-purple-100", text: "text-purple-700", route: (id) => `/services/${id}` },
  rental:      { icon: Home,           badge: "bg-green-100",  text: "text-green-700",  route: (id) => `/rentals/${id}` },
  vehicle:     { icon: Car,            badge: "bg-red-100",    text: "text-red-700",    route: (id) => `/vehicles/${id}` },
  farm:        { icon: Leaf,           badge: "bg-lime-100",   text: "text-lime-700",   route: (id) => `/farm-fresh/${id}` },
  exchange:    { icon: ArrowLeftRight, badge: "bg-teal-100",   text: "text-teal-700",   route: (id) => `/exchange/${id}` },
  advert:      { icon: Megaphone,      badge: "bg-gray-900",   text: "text-white",      route: () => null },
};

type Words = { header: string; empty: string; more: string; close: string; prev: string; next: string; kind: Record<Kind, string> };
const STRINGS: Record<string, Words> = {
  en:     { header: "Featured Ads", empty: "New ads will appear here soon.", more: "Learn more", close: "Close", prev: "Previous ads", next: "Next ads",
            kind: { marketplace: "Market", job: "Job", service: "Service", rental: "Rental", vehicle: "Vehicle", farm: "Farm Fresh", exchange: "Swap", advert: "Ad" } },
  fr:     { header: "Annonces en vedette", empty: "Les nouvelles annonces appara\u00eetront ici bient\u00f4t.", more: "En savoir plus", close: "Fermer",
            prev: "Annonces pr\u00e9c\u00e9dentes", next: "Annonces suivantes",
            kind: { marketplace: "March\u00e9", job: "Emploi", service: "Service", rental: "Location", vehicle: "V\u00e9hicule", farm: "Ferme", exchange: "Troc", advert: "Pub" } },
  pidgin: { header: "Top Ads dem", empty: "New ads go show for here soon.", more: "Know more", close: "Close am", prev: "Ads wey pass", next: "Next ads",
            kind: { marketplace: "Market", job: "Work", service: "Service", rental: "House", vehicle: "Moto/Car", farm: "Farm", exchange: "Swap", advert: "Ad" } },
  ar:     { header: "\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u0645\u064a\u0632\u0629", empty: "\u0633\u062a\u0638\u0647\u0631 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0647\u0646\u0627 \u0642\u0631\u064a\u0628\u064b\u0627.", more: "\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064a\u062f", close: "\u0625\u063a\u0644\u0627\u0642",
            prev: "\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0633\u0627\u0628\u0642\u0629", next: "\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0627\u0644\u064a\u0629",
            kind: { marketplace: "\u0633\u0648\u0642", job: "\u0648\u0638\u064a\u0641\u0629", service: "\u062e\u062f\u0645\u0629", rental: "\u0625\u064a\u062c\u0627\u0631", vehicle: "\u0645\u0631\u0643\u0628\u0629", farm: "\u0645\u0632\u0631\u0639\u0629", exchange: "\u0645\u0642\u0627\u064a\u0636\u0629", advert: "\u0625\u0639\u0644\u0627\u0646" } },
  ff:     { header: "Jaay\u0257e \u0257uu\u0257\u0257e", empty: "Jaay\u0257e kese \u0257e ngari \u0257oo law.", more: "Yiylo \u0253uri", close: "Uddu", prev: "Jaay\u0257e \u0253ennu\u0257e", next: "Jaay\u0257e garooje",
            kind: { marketplace: "Luumo", job: "Golle", service: "Ballal", rental: "Suudu", vehicle: "Oto", farm: "Ngesa", exchange: "Waylugol", advert: "Jaayngal" } },
};

const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? null
    : new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";

const CATEGORY_TO_KINDS: Partial<Record<AdCategory, Kind[]>> = {
  marketplace: ["marketplace"],
  jobs: ["job"],
  services: ["service"],
  rentals: ["rental"],
  vehicles: ["vehicle"],
  "farm-fresh": ["farm"],
  exchange: ["exchange"],
};

/** FIX825 - a chosen advert or item from the Command Center, in the strip's own shape. */
function fromChosen(a: AdItem, lang: string): StripItem | null {
  if (a.kind === "advert") {
    const fr = lang === "fr";
    return {
      id: a.id, kind: "advert", title: (fr && a.title_fr) || a.title, price: null, location: null, image: a.image,
      created_at: a.until || "", featured: true,
      advert: { company: a.company || null, description: (fr && a.description_fr) || a.description || null, link: a.link || null },
    };
  }
  const kind: Kind | null = a.kind === "farm" ? "farm" : a.kind === "exchange" ? "exchange"
    : (["marketplace", "job", "service", "rental", "vehicle"].indexOf(a.type) >= 0 ? (a.type as Kind) : null);
  if (!kind) return null;
  return { id: a.id, kind, title: a.title, price: a.price, unit: a.unit || null, location: a.location, image: a.image, created_at: a.until || "", featured: true };
}

const STEP_MS = 2600;

export const FeaturedAdsStrip: React.FC<FeaturedAdsStripProps> = ({
  category,
  searchQuery = "",
  maxVisible = 10,
  showHeader = true,
  className = "",
  heading,
}) => {
  const navigate = useNavigate();
  const lang = useLang();
  const isRtl = lang === "ar";
  const s = STRINGS[lang] ?? STRINGS.en;
  const { now: adNow, ready: adReady } = useAdNow();
  const mode = adNow.mode;

  const [items, setItems] = useState<StripItem[]>([]);
  // FIX428 - remember the last set that actually arrived. On a weak
  // connection the user keeps seeing real adverts instead of an empty box.
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState(0);
  const [open, setOpen] = useState<StripItem | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const pausedUntil = useRef(0);
  const onScreen = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const wanted = category ? CATEGORY_TO_KINDS[category] : undefined;
      const collected: StripItem[] = [];

      const needListings = !wanted || wanted.some((k) => k !== "farm" && k !== "exchange");
      if (needListings) {
        const typeFilter = wanted
          ? wanted.filter((k) => k !== "farm" && k !== "exchange").map((k) => (k === "marketplace" ? "marketplace" : k))
          : ["marketplace", "job", "service", "rental", "vehicle"];
        const { data, error } = await supabase
          .from("listings")
          // FIX470 - is_featured and featured_until were never requested, so
          // this strip could not tell a paid feature from an ordinary post.
          .select("id, type, title, price, location, images, status, created_at, expires_at, is_featured, featured_until")
          .in("type", typeFilter)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(50);
        if (!error && Array.isArray(data)) {
          // FIX323 - an expired listing never sits in the shop window.
          const nowMs = Date.now();
          for (const r of data as {
            id: string; type: string; title: string; price: number | null;
            location: string | null; images: string[] | null; created_at: string;
            expires_at: string | null;
            is_featured: boolean | null; featured_until: string | null;
          }[]) {
            const kind = (r.type === "marketplace" ? "marketplace" : r.type) as Kind;
            if (!KIND_META[kind] || kind === "advert") continue;
            if (r.expires_at && new Date(r.expires_at).getTime() < nowMs) continue;
            // FIX470 - a feature that has run out is NOT featured any more.
            const stillFeatured =
              r.is_featured === true &&
              (!r.featured_until || new Date(r.featured_until).getTime() > nowMs);
            collected.push({
              id: r.id, kind, title: r.title, price: r.price, location: r.location,
              image: Array.isArray(r.images) && r.images[0] ? r.images[0] : null,
              created_at: r.created_at,
              featured: stillFeatured,
            });
          }
        }
      }

      const needFarm = !wanted || wanted.includes("farm");
      if (needFarm) {
        try {
          const { data } = await supabase
            .from("farm_products")
            .select("id, title, price_per_unit_xaf, unit, location, image_url, images, is_available, created_at")
            .eq("is_available", true)
            .order("created_at", { ascending: false })
            .limit(15);
          for (const r of ((data ?? []) as {
            id: string; title: string; price_per_unit_xaf: number | null; unit: string | null;
            location: string | null; image_url: string | null; images: string[] | null; created_at: string;
          }[])) {
            collected.push({
              id: r.id, kind: "farm", title: r.title, price: r.price_per_unit_xaf,
              unit: r.unit, location: r.location,
              image: r.image_url || (Array.isArray(r.images) && r.images[0] ? r.images[0] : null),
              created_at: r.created_at,
            });
          }
        } catch {
          /* farm strip is best-effort - never break the whole strip */
        }
      }

      const needExchange = !wanted || wanted.includes("exchange");
      if (needExchange) {
        try {
          const { data } = await supabase
            .from("exchange_items")
            .select("id, title, estimated_value_xaf, location, images, status, created_at")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(15);
          for (const r of ((data ?? []) as {
            id: string; title: string; estimated_value_xaf: number | null;
            location: string | null; images: string[] | null; created_at: string;
          }[])) {
            collected.push({
              id: r.id, kind: "exchange", title: r.title,
              price: r.estimated_value_xaf, location: r.location,
              image: Array.isArray(r.images) && r.images[0] ? r.images[0] : null,
              created_at: r.created_at,
            });
          }
        } catch {
          /* exchange strip is best-effort - never break the whole strip */
        }
      }

      // FIX470 - featured items hold the front, newest-first among themselves.
      collected.sort((a, b) => {
        if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setItems(collected);
      setLoadFailed(false);
      try {
        if (collected.length > 0) {
          window.sessionStorage.setItem(
            STRIP_CACHE_KEY + (category ?? "all"),
            JSON.stringify(collected.slice(0, 12)),
          );
        }
      } catch { /* storage blocked - not fatal */ }
    } catch {
      // FIX428 - a failure is not "no adverts": show the last real set we had.
      setLoadFailed(true);
      let restored: StripItem[] = [];
      try {
        const cached = window.sessionStorage.getItem(STRIP_CACHE_KEY + (category ?? "all"));
        if (cached) restored = JSON.parse(cached) as StripItem[];
      } catch { restored = []; }
      setItems(restored);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // FIX825 - the free posts are only fetched when the control says everything runs ('all').
  useEffect(() => {
    if (!adReady) return;
    if (mode === "all") void load();
    else setLoading(false);
  }, [adReady, mode, load]);

  // FIX825 - the chosen (paid) adverts and items for this strip, first, then (in 'all') everything posted.
  const chosen = useMemo(() => {
    const out: StripItem[] = [];
    for (const a of adNow.items) {
      if (!itemInCategory(a, category)) continue;
      const it = fromChosen(a, lang);
      if (it) out.push(it);
    }
    return out;
  }, [adNow.items, category, lang]);

  const all = useMemo(() => {
    if (mode === "off") return [] as StripItem[];
    if (mode === "selected") return chosen;
    const seen = new Set(chosen.map((c) => c.kind + ":" + c.id));
    return chosen.concat(items.filter((i) => !seen.has(i.kind + ":" + i.id)));
  }, [mode, chosen, items]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((i) => i.title.toLowerCase().includes(q) || (i.location ?? "").toLowerCase().includes(q));
  }, [all, searchQuery]);

  const size = Math.max(maxVisible, 1);
  const batches = Math.max(Math.ceil(filtered.length / size), 1);
  const safeBatch = Math.min(batch, batches - 1);
  const visible = filtered.slice(safeBatch * size, safeBatch * size + size);

  // a new set always starts from its first card
  useEffect(() => {
    const el = scroller.current;
    if (el && typeof el.scrollTo === "function") {
      try { el.scrollTo({ left: 0 }); } catch { /* old web view */ }
    }
  }, [safeBatch]);

  // FIX825 - the strip is only moved while somebody can see it
  useEffect(() => {
    const el = root.current;
    if (!el || typeof window === "undefined" || typeof (window as { IntersectionObserver?: unknown }).IntersectionObserver !== "function") return;
    const io = new IntersectionObserver((es) => { for (const e of es) onScreen.current = e.isIntersecting; }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [visible.length]);

  // FIX825 - the cards of a set pass across the screen one by one, then the next set of 10 comes in
  useEffect(() => {
    if (filtered.length === 0) return;
    let reduce = false;
    try { reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { reduce = false; }
    if (reduce) return;
    let atEndTicks = 0;
    const t = window.setInterval(() => {
      if (Date.now() < pausedUntil.current || !onScreen.current) return;
      try { if (typeof document !== "undefined" && document.visibilityState === "hidden") return; } catch { /* ignore */ }
      const el = scroller.current;
      const room = el ? el.scrollWidth - el.clientWidth : 0;
      if (!el || typeof el.scrollBy !== "function" || room <= 4) {
        // everything fits on the screen: give it a moment, then the next set
        atEndTicks += 1;
        if (atEndTicks >= 4 && batches > 1) { atEndTicks = 0; setBatch((b) => (b + 1) % batches); }
        return;
      }
      const pos = Math.abs(el.scrollLeft);
      if (pos >= room - 4) {
        atEndTicks += 1;
        if (atEndTicks >= 2) {
          atEndTicks = 0;
          if (batches > 1) setBatch((b) => (b + 1) % batches);
          else { try { el.scrollTo({ left: 0, behavior: "smooth" }); } catch { el.scrollLeft = 0; } }
        }
        return;
      }
      atEndTicks = 0;
      const card = el.firstElementChild as HTMLElement | null;
      const step = card ? card.getBoundingClientRect().width + 12 : 156;
      try { el.scrollBy({ left: isRtl ? -step : step, behavior: "smooth" }); } catch { el.scrollLeft += isRtl ? -step : step; }
    }, STEP_MS);
    return () => window.clearInterval(t);
  }, [filtered.length, batches, isRtl]);

  const pause = (ms: number) => { pausedUntil.current = Date.now() + ms; };

  const go = (item: StripItem) => {
    if (item.kind === "advert") {
      countAd("click", item.id);
      setOpen(item);
      return;
    }
    const to = KIND_META[item.kind].route(item.id);
    if (to) navigate(to);
  };

  const learnMore = (item: StripItem) => {
    const url = item.advert?.link || "";
    setOpen(null);
    if (url.startsWith("/")) navigate(url);
    else if (/^https:\/\//i.test(url)) window.open(url, "_blank", "noopener,noreferrer");
  };

  // FIX825 - nothing to show: with Home's heading, nothing at all; on a section page, the old quiet line (only when
  // everything posted runs - a switched-off or choose-only strip with nothing chosen simply is not there)
  if (mode === "off") return null;
  if (heading && !adReady) return null;
  if (!loading && filtered.length === 0) {
    if (heading || mode === "selected" || !adReady) return null;
    return (
      <div className={`px-4 ${className}`} dir={isRtl ? "rtl" : "ltr"} data-featured-strip="empty">
        {showHeader ? (
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-800">{s.header}</h2>
          </div>
        ) : null}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400">{s.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={root} className={`${className}`} dir={isRtl ? "rtl" : "ltr"} data-featured-strip={mode} data-fix="FIX825">
      {heading ? <h2 className="text-2xl font-bold text-gray-900 mb-6">{heading}</h2> : null}
      {showHeader || (heading && batches > 1) ? (
        <div className="flex items-center justify-between px-4 mb-2">
          {showHeader ? (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-gray-800">{s.header}</h2>
            </div>
          ) : <span />}
          {batches > 1 ? (
            <div className="flex items-center gap-1">
              <button type="button" aria-label={s.prev} onClick={() => { pause(8000); setBatch((b) => (b - 1 + batches) % batches); }} className="p-1 text-gray-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-gray-400" data-set={safeBatch + 1}>{safeBatch + 1}/{batches}</span>
              <button type="button" aria-label={s.next} onClick={() => { pause(8000); setBatch((b) => (b + 1) % batches); }} className="p-1 text-gray-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {loading && filtered.length === 0 ? (
        <div className="flex justify-center py-6 text-amber-500"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : (
        <>
          <div
            ref={scroller}
            className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar"
            onPointerDown={() => pause(8000)}
            onTouchStart={() => pause(8000)}
            onWheel={() => pause(8000)}
            onMouseEnter={() => pause(60000)}
            onMouseLeave={() => pause(1500)}
            onFocus={() => pause(15000)}
            data-strip-row="1"
          >
            {visible.map((item) => {
              const meta = KIND_META[item.kind];
              const Icon = meta.icon;
              const price = fmtXAF(item.price);
              const isAd = item.kind === "advert";
              return (
                <button
                  type="button"
                  key={`${item.kind}-${item.id}`}
                  onClick={() => go(item)}
                  className="w-36 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm text-start"
                  data-strip-item={item.kind}
                  data-id={item.id}
                >
                  <div className="relative h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.image
                      ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy"
                             onLoad={isAd ? () => countAd("view", item.id) : undefined} />
                      : <Tag className="w-7 h-7 text-gray-300" />}
                    {item.featured && !isAd ? <Star className="absolute top-1.5 end-1.5 w-3.5 h-3.5 text-amber-400 drop-shadow" /> : null}
                  </div>
                  <div className="p-2">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold rounded-full px-1.5 py-0.5 ${meta.badge} ${meta.text}`}>
                      <Icon className="w-2.5 h-2.5" /> {s.kind[item.kind]}
                    </span>
                    {isAd && item.advert?.company ? (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700 mt-1 truncate">{item.advert.company}</p>
                    ) : null}
                    <p className="text-xs font-semibold text-gray-800 mt-1 leading-tight line-clamp-2">{item.title}</p>
                    {price ? (
                      <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                        {price}{item.unit ? `/${item.unit}` : ""}
                      </p>
                    ) : null}
                    {item.location ? <LocationLock location={item.location} compact /> : null}
                  </div>
                </button>
              );
            })}
          </div>

          {batches > 1 ? (
            <div className="flex justify-center gap-1 mt-2">
              {Array.from({ length: batches }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  aria-label={String(i + 1) + "/" + String(batches)}
                  onClick={() => { pause(8000); setBatch(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === safeBatch ? "w-4 bg-amber-500" : "w-1.5 bg-gray-300"}`}
                />
              ))}
            </div>
          ) : null}
          {loadFailed && filtered.length > 0 ? <span className="sr-only" data-strip-offline="1" /> : null}
        </>
      )}

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
             role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)} data-ad-sheet="1">
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(null)} aria-label={s.close}
                    className="absolute top-3 end-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow">
              <X className="h-5 w-5" />
            </button>
            <span className="absolute top-3 start-3 z-10 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {s.kind.advert}
            </span>
            {open.image ? <img src={open.image} alt={open.title} className="w-full max-h-[55vh] object-cover bg-gray-100" /> : null}
            <div className="p-4 pb-6">
              {open.advert?.company ? <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{open.advert.company}</p> : null}
              <h3 className="mt-0.5 text-lg font-bold text-gray-900">{open.title}</h3>
              {open.advert?.description ? <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{open.advert.description}</p> : null}
              {open.advert?.link ? (
                <button type="button" onClick={() => learnMore(open)} data-ad-more="1"
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white active:scale-95">
                  {s.more} {open.advert.link.startsWith("/") ? null : <ExternalLink className="h-4 w-4" />}
                </button>
              ) : (
                <button type="button" onClick={() => setOpen(null)}
                        className="mt-4 w-full rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700">{s.close}</button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FeaturedAdsStrip;
// BAMBEH_END_TOKEN__FEATUREDADSSTRIP_FIX825__COMPLETE
