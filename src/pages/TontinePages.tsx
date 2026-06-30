/**
 * src/pages/TontinePages.tsx ? Bambeh Marketplace
 * FIXED: Was a stub (emoji + title). Now redirects to /tontine.
 * The real tontine listing is in TontinePage.tsx.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

const COPY = {
  en: {
    loading: "Loading Tontine...",
  },
  fr: {
    loading: "Chargement de la tontine...",
  },
  pidgin: {
    loading: "Tontine dey load...",
  },
  ar: {
    loading: "جارٍ تحميل التومبين...",
  },
  ff: {
    loading: "Dey loade Tontine...",
  },
};

export default function TontinePages() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const ui = COPY[(lang === "fr" || lang === "pidgin" || lang === "ar" || lang === "ff") ? lang : "en"];

  useEffect(() => {
    navigate('/tontine', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm text-gray-500">{ui.loading}</p>
      </div>
    </div>
  );
}