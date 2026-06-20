/**
 * src/pages/TontinePages.tsx — Bambeh Marketplace
 * FIXED: Was a stub (emoji + title). Now redirects to /tontine.
 * The real tontine listing is in TontinePage.tsx.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function TontinePages() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/tontine', { replace: true });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm text-gray-500">Loading Tontine...</p>
      </div>
    </div>
  );
}


