/**
 * AuthLayout.tsx
 * FILE LOCATION: src/components/layout/AuthLayout.tsx
 *
 * CHANGES IN THIS VERSION:
 *  ✅ Fixed broken branding string "— 's #1 App" → proper translated text via t()
 *  ✅ Full i18n — branding strip and footer line now use LanguageContext t()
 *  ✅ "Only 1% Transaction Fee" → "Lowest in any marketplace"
 *  ✅ RTL direction applied when language is Arabic
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

import React from "react";
import { useLanguage } from '@/App';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex flex-col"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Branding strip */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 py-3 px-4 text-center shadow-md">
        <span className="text-white font-bold text-lg tracking-wide">
          {t("auth.brandingStrip")}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-gray-500 border-t border-gray-200 bg-white">
        &copy; 2026 Bambeh Marketplace &middot; {t("footer.transactionFeeBadge")}
      </div>
    </div>
  );
}







