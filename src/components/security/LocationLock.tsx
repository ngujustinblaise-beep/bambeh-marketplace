// BAMBEH_DEPLOY_TOKEN__LOCATIONLOCK_FIX250_CLEAN
// FILE LOCATION: src/components/security/LocationLock.tsx
//
// FIX250 - HIDE THE ITEM LOCATION FROM UNSUBSCRIBED USERS.
//
// Routing cannot hide a field inside a page, so this is a component you
// drop in wherever a listing's town/quarter is printed. A subscriber sees
// the real location. Everyone else sees that the item is available, plus a
// tap that leads to the plans page.
//
// USAGE - replace this:
//     <span>{item.location}</span>
// with this:
//     <LocationLock location={item.location} />
//
// Compact version for listing cards:
//     <LocationLock location={item.location} compact />
//
// There is also a hook for anything else you need to hide (phone numbers,
// exact addresses, contact names):
//     const canView = useCanViewDetails();
//     {canView ? seller.phone : <LocationLock location={null} compact />}
//
// Truth source is unchanged: useSubscription(uid) against Supabase.
// Nothing here is decided by localStorage.

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
    unlock: "Subscribe to see where this item is",
  },
  fr: {
    available: "Disponible",
    hidden: "Localisation masqu\u00E9e",
    unlock: "Abonnez-vous pour voir o\u00F9 se trouve cet article",
  },
  pcm: {
    available: "E dey available",
    hidden: "Location hide",
    unlock: "Subscribe make you see where the thing dey",
  },
  ar: {
    available: "\u0645\u062A\u0648\u0641\u0631",
    hidden: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u062E\u0641\u064A",
    unlock: "\u0627\u0634\u062A\u0631\u0643 \u0644\u0645\u0639\u0631\u0641\u0629 \u0645\u0643\u0627\u0646 \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C",
  },
  ff: {
    available: "Ina woodi",
    hidden: "Nokku suu\u0257ii",
    unlock: "Abonno ngam yiide nokku mum",
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
  /** Small inline chip for listing cards. */
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
        <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
        <span>{location}</span>
      </span>
    );
  }

  // Not a subscriber - availability only, plus a way to pay.
  if (compact) {
    return (
      <Link
        to="/subscription"
        dir={rtl ? "rtl" : "ltr"}
        title={t.unlock}
        className={
          "inline-flex items-center gap-1 rounded-full border border-amber-200 " +
          "bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 " +
          "hover:bg-amber-100 " +
          className
        }
      >
        <Lock className="h-3 w-3 shrink-0" />
        <span>{t.available}</span>
      </Link>
    );
  }

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
// BAMBEH_END_TOKEN__LOCATIONLOCK_FIX250__COMPLETE
