import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/context/LanguageContext";

type RequireLevel = "user" | "subscription" | "vendor" | "admin";

interface AuthGateProps {
  require: RequireLevel;
  children: React.ReactNode;
}

const STRINGS = {
  en: {
    loading: "Checking access...",
    loginRedirect: "Redirecting to login...",
    denied: "Access denied.",
  },
  fr: {
    loading: "Vérification de l'accès...",
    loginRedirect: "Redirection vers la connexion...",
    denied: "Accès refusé.",
  },
  ar: {
    loading: "جارٍ التحقق من الوصول...",
    loginRedirect: "جارٍ التوجيه إلى تسجيل الدخول...",
    denied: "تم رفض الوصول.",
  },
  pidgin: {
    loading: "Dey check access...",
    loginRedirect: "Dey send you go login...",
    denied: "Access no dey allowed.",
  },
  ff: {
    loading: "Ɓeydo en, njaŋtude e njaatigi...",
    loginRedirect: "Nde gollorde e login...",
    denied: "Alaa jam.",
  },
} as const;

const AuthGate: React.FC<AuthGateProps> = ({ require: level, children }) => {
  const location = useLocation();
  const { language } = useLanguage();
  const t = STRINGS[language as keyof typeof STRINGS] ?? STRINGS.en;
  const { user, loading, authReady, isAdmin, isVendor } = useAuth();

  const userId = user?.id ?? null;

  // FIX233 - was: const isSubscribed = true;  A paywall that could never fire.
  // Now verified against the Supabase subscriptions table, using the same
  // hook SubscriptionGuard uses. One source of truth for access, not four.
  const { isActive: isSubscribed, isLoading: subLoading } = useSubscription(userId);

  // FIX320 - AuthGate used to redirect the instant it got a "no".
  // SubscriptionGuard, the OUTER gate, holds 1.5s before bouncing anyone,
  // for exactly the reason its own comment gives: a member who has genuinely
  // paid must never be thrown out mid-verification. AuthGate had no such
  // hold - so in the seconds between a payment succeeding and the webhook
  // writing the subscription row, a paying member clicking an item was sent
  // straight back to the subscription page, over and over, until the row
  // finally landed. "No answer yet" now means WAIT, never NO.
  const [graceOver, setGraceOver] = useState(false);
  useEffect(() => {
    setGraceOver(false);
    const timer = setTimeout(() => setGraceOver(true), 2500);
    return () => clearTimeout(timer);
  }, [location.pathname, userId]);


  if (loading || authReady === false || (level === "subscription" && subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (level === "admin" && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  // FIX233 - the vendor branch is gone. It redirected to /vendor/register,
  // which is not a declared route, so it landed on Page Not Found.

  // FIX397 - an admin is never held at the paywall.
  if (level === "subscription" && !isSubscribed && !isAdmin) {
    // FIX320 - hold the spinner until the grace window closes. Only after
    // that is a "no" treated as a real answer.
    if (!graceOver) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            <span>{t.loading}</span>
          </div>
        </div>
      );
    }
    return <Navigate to="/subscription" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGate;



