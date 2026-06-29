/**
 * AUTHLAYOUT.TSX - COMPLETE FIXED VERSION
 * 
 * Layout for authentication pages (Login, Register, Forgot Password)
 * 
 * ✅ BRANDING FIXED:
 * - Single "Bambeh" logo in BLACK
 * - NO teal/turquoise colors
 * - NO "Bambé" with accent
 * - Clean, professional design
 * 
 * COPY THIS FILE TO: src/components/layout/AuthLayout.tsx
 * 
 * Updated: December 10, 2025
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* ============================================
          HEADER - SIMPLE LOGO
          ============================================ */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* SINGLE BLACK LOGO */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-bold">B</span>
              </div>
              <span className="text-2xl font-bold text-black tracking-tight">
                Bambeh
              </span>
            </Link>

            {/* Back to Home Link */}
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================
          MAIN CONTENT AREA
          ============================================ */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* ============================================
          FOOTER - MINIMAL
          ============================================ */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>
              &copy; 2025 <span className="font-semibold text-black">Bambeh</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="hover:text-black transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-black transition-colors">
                Privacy
              </Link>
              <Link to="/help" className="hover:text-black transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
