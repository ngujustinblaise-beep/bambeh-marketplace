/**
 * AuthLayout.tsx
 * Minimal centered layout for Login, Register, ForgotPassword pages.
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex flex-col">
      {/* Branding strip */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 py-3 px-4 text-center shadow-md">
        <span className="text-white font-bold text-lg tracking-wide">
          🛒 Bambeh Marketplace — 's #1 App
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-gray-500 border-t border-gray-200 bg-white">
        © 2026 Bambeh Marketplace · Only 1% Transaction Fee 💚
      </div>
    </div>
  );
}

