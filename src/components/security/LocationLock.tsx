// BAMBEH_DEPLOY_TOKEN__LOCATIONLOCK_FIX272_CLEAN
// FILE LOCATION: src/components/security/LocationLock.tsx
//
// FIX272 - v2. One important change from v1:
//
//   The compact variant is now a plain SPAN, not a Link. Listing cards are
//   already wrapped in a link to the item, and an anchor inside an anchor is
//   invalid HTML - React warns and browsers behave unpredictably. Tapping the
//   card now goes to the detail page, which the guard sends to /subscription.
//   That is the better funnel anyway: they tap the thing they want, and the
//   plans page is what they land on.
//
// USAGE - inside a listing card, replace this:
//     <span className="truncate">{item.location}</span>
// with this:
//     <LocationLock location={item.location} compact />
//
// Full block version, for a detail page or a panel:
//     <LocationLock location={item.location} />
//
// For any other hidden field (phone, exact address, contact name):
//     const canView = useCanViewDetails();
//     {canView ? seller.phone : "Hidden"}
//
// Truth comes from useSubscription(uid) against Supabase. Never localStorage.

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MapPin, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

/* ---------------- language (display only, never security) --------------- */

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

const T: Record<LangCode, { available: string; hidden: string; unlock: string }> = {
  en: {
    available: "Available",
    hidden: "Location hidden",
    unlock: "100 XAF unlocks every listing for 24 hours",
  },
  fr: {
    available: "Disponible",
    hidden: "Localisation masqu\u00E9e",
    unlock: "100 FCFA d\u00E9bloque toutes les annonces pendant 24 heures",
  },
  pcm: {
    available: "E dey",
    hidden: "Location hide",
    unlock: "100 FCFA go open all the listings for 24 hours",
  },
  ar: {
    available: "\u0645\u062A\u0648\u0641\u0631",
    hidden: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u062E\u0641\u064A",
    unlock: "100 \u0641\u0631\u0646\u0643 \u062A\u0641\u062A\u062D \u0643\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0644\u0645\u062F\u0629 24 \u0633\u0627\u0639\u0629",
  },
  ff: {
    available: "Ina woodi",
    hidden: "Nokku suu\u0257ii",
    unlock: "100 XAF ina u\u0253\u0253ita jeeyngeeji fof e waktuuji 24",
  },
};

/* ---------------- the hook, for any other hidden field ------------------ */

export function useCanViewDetails(): boolean {
  const { currentUser } = useAuth();
  const uid = currentUser?.id ?? null;
  const { isActive } = useSubscription(uid);
  return isActive === true;
}

/* ---------------- the component ----------------------------------------- */

interface LocationLockProps {
  /** The real location string. Shown only to subscribers. */
  location?: string | null;
  /** Small inline chip for listing cards. Renders a span, never a link. */
  compact?: boolean;
  /** Optional custom node to render for subscribers instead of plain text. */
  children?: ReactNode;
  className?: string;
}

export default function LocationLock({
  location,
  compact = false,
  children,
  className = "",
}: LocationLockProps) {
  const canView = useCanViewDetails();
  const lang = currentLang();
  const t = T[lang];
  const rtl = lang === "ar";

  // Subscriber - show the truth.
  if (canView) {
    if (children) return <>{children}</>;
    if (!location) return null;
    return (
      <span className={"inline-flex items-center gap-1 " + className}>
        <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-600" />
        <span className="truncate">{location}</span>
      </span>
    );
  }

  // Not a subscriber - availability only. PLAIN SPAN: safe inside a card link.
  if (compact) {
    return (
      <span
        dir={rtl ? "rtl" : "ltr"}
        title={t.unlock}
        className={
          "inline-flex items-center gap-1 rounded-full border border-amber-200 " +
          "bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 " +
          className
        }
      >
        <Lock className="h-2.5 w-2.5 shrink-0" />
        <span>{t.available}</span>
      </span>
    );
  }

  // Full block - used on its own, so a link is fine here.
  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className={
        "flex items-center gap-3 rounded-xl border border-amber-200 " +
        "bg-amber-50 px-4 py-3 " +
        className
      }
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
        <Lock className="h-4 w-4 text-amber-700" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-900">
          {t.available} &middot; {t.hidden}
        </p>
        <Link
          to="/subscription"
          className="text-xs font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800"
        >
          {t.unlock}
        </Link>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__LOCATIONLOCK_FIX272__COMPLETE
