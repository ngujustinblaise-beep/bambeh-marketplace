// BAMBEH_DEPLOY_TOKEN__FEATUREDADSSTRIP_FIX470_WAS_FIX108_CLEAN
/**
 * FeaturedAdsStrip.tsx — Bambeh Marketplace (FIX108, REAL data + EXCHANGE)
 * FILE LOCATION: src/components/ads/FeaturedAdsStrip.tsx
 * Supersedes FIX107 (delete the FIX107 copy from Downloads).
 *
 * FIX108 change: the strip now ALSO pulls live swap posts from the
 * `exchange_items` table (verified 2026-07-18 SQL screenshot), so all
 * SEVEN modules feed the shop window:
 *  • marketplace / jobs / services / rentals / vehicles  → `listings`
 *  • Farm Fresh                                          → `farm_products`
 *  • Exchange (item swaps, e.g. iPhone-for-laptop)       → `exchange_items`
 *    — cards show estimated value (if set) and navigate to /exchange/:id
 *  • Batches of 10, auto-rotate 10 s, chevrons + dots, 5 languages,
 *    same props as before — existing pages keep working unchanged.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Tag, Briefcase, ShoppingBag, Wrench, Home, Car,
  Leaf, Star, Loader2, ArrowLeftRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/hooks/useAppLang";

const STRIP_CACHE_KEY = "bambeh_strip_";

import LocationLock from "@/components/security/LocationLock";
// Kept broad so existing callers passing any old category value still compile.
export type AdCategory =
  | "marketplace" | "jobs" | "services" | "rentals" | "vehicles"
  | "exchange" | "flash-deals" | "group-buying" | "farm-fresh";

interface StripItem {
  id: string;
  kind: "marketplace" | "job" | "service" | "rental" | "vehicle" | "farm" | "exchange";
  title: string;
  price: number | null;
  unit?: string | null;
  location: string | null;
  image: string | null;
  created_at: string;
  /** FIX470 - true only while a paid feature is actually running. */
  featured?: boolean;
}

interface FeaturedAdsStripProps {
  category?: AdCategory;
  searchQuery?: string;
  maxVisible?: number;      // batch size (default 10)
  showHeader?: boolean;
  className?: string;
}

const KIND_META: Record<StripItem["kind"], {
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  text: string;
  route: (id: string) => string;
}> = {
  marketplace: { icon: ShoppingBag,    badge: "bg-blue-100",   text: "text-blue-700",   route: (id) => `/marketplace/${id}` },
  job:         { icon: Briefcase,      badge: "bg-amber-100",  text: "text-amber-700",  route: (id) => `/jobs/${id}` },
  service:     { icon: Wrench,         badge: "bg-purple-100", text: "text-purple-700", route: (id) => `/services/${id}` },
  rental:      { icon: Home,           badge: "bg-green-100",  text: "text-green-700",  route: (id) => `/rentals/${id}` },
  vehicle:     { icon: Car,            badge: "bg-red-100",    text: "text-red-700",    route: (id) => `/vehicles/${id}` },
  farm:        { icon: Leaf,           badge: "bg-lime-100",   text: "text-lime-700",   route: (id) => `/farm-fresh/${id}` },
  exchange:    { icon: ArrowLeftRight, badge: "bg-teal-100",   text: "text-teal-700",   route: (id) => `/exchange/${id}` },
};

const STRINGS: Record<string, { header: string; empty: string; kind: Record<StripItem["kind"], string> }> = {
  en:     { header: "Featured Ads", empty: "New ads will appear here soon.",
            kind: { marketplace: "Market", job: "Job", service: "Service", rental: "Rental", vehicle: "Vehicle", farm: "Farm Fresh", exchange: "Swap" } },
  fr:     { header: "Annonces en vedette", empty: "Les nouvelles annonces apparaîtront ici bientôt.",
            kind: { marketplace: "Marché", job: "Emploi", service: "Service", rental: "Location", vehicle: "Véhicule", farm: "Ferme", exchange: "Troc" } },
  pidgin: { header: "Top Ads dem", empty: "New ads go show for here soon.",
            kind: { marketplace: "Market", job: "Work", service: "Service", rental: "House", vehicle: "Moto/Car", farm: "Farm", exchange: "Swap" } },
  ar:     { header: "إعلانات مميزة", empty: "ستظهر الإعلانات الجديدة هنا قريبًا.",
            kind: { marketplace: "سوق", job: "وظيفة", service: "خدمة", rental: "إيجار", vehicle: "مركبة", farm: "مزرعة", exchange: "مقايضة" } },
  ff:     { header: "Jaayɗe ɗuuɗɗe", empty: "Jaayɗe kese ɗe ngari ɗoo law.",
            kind: { marketplace: "Luumo", job: "Golle", service: "Ballal", rental: "Suudu", vehicle: "Oto", farm: "Ngesa", exchange: "Waylugol" } },
};

const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? null
    : new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";

const CATEGORY_TO_KINDS: Partial<Record<AdCategory, StripItem["kind"][]>> = {
  marketplace: ["marketplace"],
  jobs: ["job"],
  services: ["service"],
  rentals: ["rental"],
  vehicles: ["vehicle"],
  "farm-fresh": ["farm"],
  exchange: ["exchange"],
};

export const FeaturedAdsStrip: React.FC<FeaturedAdsStripProps> = ({
  category,
  searchQuery = "",
  maxVisible = 10,
  showHeader = true,
  className = "",
}) => {
  const navigate = useNavigate();
  const lang = useLang();
  const isRtl = lang === "ar";
  const s = STRINGS[lang] ?? STRINGS.en;

  const [items, setItems] = useState<StripItem[]>([]);
  // FIX428 - remember the last set that actually arrived. On a weak
  // connection the user keeps seeing real adverts instead of an empty box.
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState(0);

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
          // FIX323 - this strip never asked for expires_at, so a listing that
          // had run out still sat in the shop window and still opened when
          // tapped. Home already filters these out; the strip did not. A buyer
          // chasing something that is gone is how trust quietly leaks away.
          const nowMs = Date.now();
          for (const r of data as {
            id: string; type: string; title: string; price: number | null;
            location: string | null; images: string[] | null; created_at: string;
            expires_at: string | null;
            is_featured: boolean | null; featured_until: string | null;
          }[]) {
            const kind = (r.type === "marketplace" ? "marketplace" : r.type) as StripItem["kind"];
            if (!KIND_META[kind]) continue;
            if (r.expires_at && new Date(r.expires_at).getTime() < nowMs) continue;
            // FIX470 - a feature that has run out is NOT featured any more,
            // whatever the flag still says. The sweeper clears the flag on its
            // own schedule; this makes sure an expired feature never occupies
            // the shop window even for the minutes in between.
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
          /* farm strip is best-effort — never break the whole strip */
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
          /* exchange strip is best-effort — never break the whole strip */
        }
      }

      // FIX470 - THE POINT OF THIS FIX. Until now the sort was newest-first
      // only, so a seller who PAID to be featured sank down the strip the
      // moment somebody else posted. Featured items now hold the front,
      // newest-first among themselves, and everything else follows behind in
      // the same newest-first order it always had.
      collected.sort((a, b) => {
        if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setItems(collected);
      setBatch(0);
      setLoadFailed(false);
      // FIX428 - keep a copy so a later failure has something real to show
      try {
        if (collected.length > 0) {
          window.sessionStorage.setItem(
            STRIP_CACHE_KEY + (category ?? "all"),
            JSON.stringify(collected.slice(0, 12)),
          );
        }
      } catch { /* storage blocked - not fatal */ }
    } catch {
      // FIX428 - THE BUG. This used to be setItems([]), which told the user
      // there are no adverts when the truth was that we could not ask.
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

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.title.toLowerCase().includes(q) || (i.location ?? "").toLowerCase().includes(q));
  }, [items, searchQuery]);

  const size = Math.max(maxVisible, 1);
  const batches = Math.max(Math.ceil(filtered.length / size), 1);
  const safeBatch = Math.min(batch, batches - 1);
  const visible = filtered.slice(safeBatch * size, safeBatch * size + size);

  // Auto-rotate through ALL batches every 10 s
  useEffect(() => {
    if (batches <= 1) return;
    const t = setInterval(() => setBatch((b) => (b + 1) % batches), 10000);
    return () => clearInterval(t);
  }, [batches]);

  if (!loading && filtered.length === 0) {
    return (
      <div className={`px-4 ${className}`} dir={isRtl ? "rtl" : "ltr"}>
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
    <div className={`${className}`} dir={isRtl ? "rtl" : "ltr"}>
      {showHeader ? (
        <div className="flex items-center justify-between px-4 mb-2">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-800">{s.header}</h2>
          </div>
          {batches > 1 ? (
            <div className="flex items-center gap-1">
              <button onClick={() => setBatch((b) => (b - 1 + batches) % batches)} className="p-1 text-gray-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-gray-400">{safeBatch + 1}/{batches}</span>
              <button onClick={() => setBatch((b) => (b + 1) % batches)} className="p-1 text-gray-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-6 text-amber-500"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
            {visible.map((item) => {
              const meta = KIND_META[item.kind];
              const Icon = meta.icon;
              const price = fmtXAF(item.price);
              return (
                <button
                  key={`${item.kind}-${item.id}`}
                  onClick={() => navigate(meta.route(item.id))}
                  className="w-36 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm text-left"
                >
                  <div className="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.image
                      ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                      : <Tag className="w-7 h-7 text-gray-300" />}
                  </div>
                  <div className="p-2">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold rounded-full px-1.5 py-0.5 ${meta.badge} ${meta.text}`}>
                      <Icon className="w-2.5 h-2.5" /> {s.kind[item.kind]}
                    </span>
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
                  key={i}
                  onClick={() => setBatch(i)}
                  className={`h-1.5 rounded-full transition-all ${i === safeBatch ? "w-4 bg-amber-500" : "w-1.5 bg-gray-300"}`}
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default FeaturedAdsStrip;
// BAMBEH_END_TOKEN__FEATUREDADSSTRIP__COMPLETE
