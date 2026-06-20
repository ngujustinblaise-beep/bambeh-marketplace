/**
 * src/pages/CompanyNotFound.tsx — Bambeh Marketplace
 *
 * FIXES applied:
 *  ✅ CRITICAL: Removed usage-example comments placed AFTER the closing brace — they
 *     were inside the function body in the original, which caused a TypeScript parse
 *     error: "Unreachable code detected" / code after return statement.
 *  ✅ Stray comma after the conditional paragraph block removed (JSX syntax error).
 *  ✅ Contact support link uses navigate() instead of bare <a href> for SPA routing.
 *  ✅ Component is now usable both as a full-page route and as an inline modal.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Building, AlertCircle } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface CompanyNotFoundProps {
  companyName?: string;
  onClose?: () => void;
}

export default function CompanyNotFound({ companyName, onClose }: CompanyNotFoundProps) {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* 404 Icon */}
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>

          {/* Error Code */}
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>

          {/* Error Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Company Profile Not Found
          </h2>

          {companyName ? (
            <p className="text-gray-600 mb-6">
              Sorry, we couldn't find a profile for <strong>{companyName}</strong>
            </p>
          ) : (
            <p className="text-gray-600 mb-6">
              The company profile you're looking for doesn't exist or has been removed.
            </p>
          )}

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-900 mb-1">What happened?</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• The company may not have created a profile yet</li>
                  <li>• The profile link may be incorrect</li>
                  <li>• The company may have removed their profile</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>

          {/* Close Button (if used as modal) */}
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close this message
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Need help finding a company?</p>
          <button
            onClick={() => navigate('/help/contact')}
            className="text-teal-600 hover:text-teal-700 font-semibold text-sm"
          >
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );
}


