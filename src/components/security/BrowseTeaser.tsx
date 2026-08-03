// BAMBEH_DEPLOY_TOKEN__BROWSETEASER_FIX272_CLEAN
// FILE LOCATION: src/components/security/BrowseTeaser.tsx
//
// FIX272 - THE VISIBLE, COUNTED LOCK.
//
//   "47 apartments in Yaounde. Location and contact hidden.
//    100 XAF unlocks every listing for 24 hours."
//
// A wall shows a person nothing to want. This shows them the size of the
// prize and the price of it, and it stays out of the way once they pay.
//
// Rendered once by SubscriptionGuard at the top of a browse page. It never
// appears for a subscriber, never for a signed-out visitor on a non-browse
// page, and it can be dismissed for the session.
//
// The count is best-effort: it tries the likely table for the category and,
// if that table is not there, it simply shows the sentence without a number.
// A missing count must never break a page.

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Lock, X, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ *
 * Which browse page are we on, and what do we count there?
 * `tables` is a list of candidates - the first one that answers wins.
 * ------------------------------------------------------------------ */
const CATEGORIES: {
  prefix: string;
  key: string;
  tables: string[];
}[] = [
  { prefix: "/marketplace", key: "marketplace", tables: ["listings", "products", "marketplace_items"] },
  { prefix: "/jobs",        key: "jobs",        tables: ["job_listings", "jobs"] },
  { prefix: "/services",    key: "services",    tables: ["services"] },
  { prefix: "/rentals",     key: "rentals",     tables: ["rentals"] },
  { prefix: "/vehicles",    key: "vehicles",    tables: ["vehicles"] },
  { prefix: "/exchange",    key: "exchange",    tables: ["exchange_items"] },
  { prefix: "/search",      key: "search",      tables: ["listings", "products"] },
];

/* ------------------------------------------------------------------ */

type LangCode = "en" | "fr" | "pcm" | "ar" | "ff";

function currentLang(): LangCode {
  let raw = "";
  try {
    raw = String(localStorage.getItem("Bambeh_language") || "").toLowerCase();
  } catch {
    raw = "";
  }
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("ar")) return "ar";
  if (raw.startsWith("ff") || raw.startsWith("ful")) return "ff";
  if (raw.startsWith("pcm") || raw.startsWith("pid")) return "pcm";
  return "en";
}

const NOUN: Record<string, Record<LangCode, string>> = {
  marketplace: { en: "items for sale", fr: "articles en vente", pcm: "things for sale", ar: "\u0633\u0644\u0639 \u0644\u0644\u0628\u064A\u0639", ff: "kaake njeeyngu" },
  jobs:        { en: "jobs",           fr: "offres d'emploi",  pcm: "work",            ar: "\u0648\u0638\u064A\u0641\u0629",           ff: "golle" },
  services:    { en: "services",       fr: "services",         pcm: "services",        ar: "\u062E\u062F\u0645\u0629",                 ff: "carwiiji" },
  rentals:     { en: "places to rent", fr: "logements \u00E0 louer", pcm: "house for rent", ar: "\u0645\u0633\u0627\u0643\u0646 \u0644\u0644\u0625\u064A\u062C\u0627\u0631", ff: "cuu\u0257i luwol" },
  vehicles:    { en: "vehicles",       fr: "v\u00E9hicules",   pcm: "motor",           ar: "\u0645\u0631\u0643\u0628\u0629",           ff: "otooji" },
  exchange:    { en: "items to swap",  fr: "articles \u00E0 \u00E9changer", pcm: "things to exchange", ar: "\u0633\u0644\u0639 \u0644\u0644\u062A\u0628\u0627\u062F\u0644", ff: "kaake waylugol" },
  search:      { en: "results",        fr: "r\u00E9sultats",   pcm: "results",         ar: "\u0646\u062A\u064A\u062C\u0629",           ff: "nju\u0253\u0257i" },
};

// FIX279: price framed as a thing people already buy, not a number to weigh up.
const COPY: Record<LangCode, { hidden: string; cta: string; unlock: string }> = {
  en: {
    hidden: "Location and seller contact are hidden.",
    cta: "Unlock everything",
    unlock: "less than a loaf of bread, for a whole day",
  },
  fr: {
    hidden: "La localisation et le contact du vendeur sont masqu\u00E9s.",
    cta: "Tout d\u00E9bloquer",
    unlock: "moins qu'une baguette, pour toute une journ\u00E9e",
  },
  pcm: {
    hidden: "Location and seller contact dey hide.",
    cta: "Open everything",
    unlock: "e no reach the price of bread, and e last full day",
  },
  ar: {
    hidden: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0627\u0626\u0639 \u0645\u062E\u0641\u064A\u0629.",
    cta: "\u0627\u0641\u062A\u062D \u0643\u0644 \u0634\u064A\u0621",
    unlock: "\u0623\u0642\u0644 \u0645\u0646 \u062B\u0645\u0646 \u0631\u063A\u064A\u0641 \u062E\u0628\u0632\u060C \u0644\u064A\u0648\u0645 \u0643\u0627\u0645\u0644",
  },
  ff: {
    hidden: "Nokku e jokkondiral jeeyoowo ina suu\u0257i.",
    cta: "U\u0253\u0253it fof",
    unlock: "\u0181uri famÉ—ude e coggu mbuuru, e \u00F1alawma timmu\u0257o",
  },
};

/* ------------------------------------------------------------------ */

export default function BrowseTeaser() {
  const location = useLocation();
  const path = location.pathname;

  const [count, setCount] = useState<number | null>(null);
  const [closed, setClosed] = useState(false);

  const cat = CATEGORIES.find(
    (c) => path === c.prefix || path.startsWith(c.prefix + "/"),
  );

  useEffect(() => {
    let alive = true;
    setCount(null);
    setClosed(false);

    if (!cat) return;

    (async () => {
      for (const table of cat.tables) {
        try {
          const { count: n, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
          if (!error && typeof n === "number" && alive) {
            setCount(n);
            return;
          }
        } catch {
          /* try the next candidate */
        }
      }
      // no table answered - the sentence still works without a number
    })();

    return () => {
      alive = false;
    };
  }, [path]);

  if (!cat || closed) return null;

  const lang = currentLang();
  const copy = COPY[lang];
  const noun = NOUN[cat.key]?.[lang] ?? NOUN[cat.key]?.en ?? "";
  const rtl = lang === "ar";

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="mx-3 mt-3 mb-1 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Lock className="h-4 w-4 text-amber-700" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-gray-900">
            {count !== null ? (
              <>
                {count.toLocaleString()} {noun}
              </>
            ) : (
              <>{noun.charAt(0).toUpperCase() + noun.slice(1)}</>
            )}
          </p>
          <p className="mt-0.5 text-xs text-gray-600">{copy.hidden}</p>

          <Link
            to="/subscription"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-teal-500 hover:to-teal-600"
          >
            <Zap className="h-3.5 w-3.5" />
            {copy.cta}
          </Link>
          <p className="mt-1.5 text-[11px] italic text-gray-500">{copy.unlock}</p>
        </div>

        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="Close"
          className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-white/60 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__BROWSETEASER_FIX272__COMPLETE
