import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user, loading, isAdmin, isVendor } = useAuth();

  const userId = user?.id ?? null;

  const isSubscribed = true;

  if (loading) {
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

  if (level === "vendor") {
    const ok = isVendor || (user?.role ?? "").toLowerCase() === "vendor";
    if (!ok) return <Navigate to="/vendor/register" state={{ from: location }} replace />;
  }

  if (level === "subscription" && !isSubscribed) {
    return <Navigate to="/subscription" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGate;


