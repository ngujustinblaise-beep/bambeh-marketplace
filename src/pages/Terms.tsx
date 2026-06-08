/**
 * TERMS PAGE
 * Accessible from footer and menu
 * Uses official TermsContent component
 */

import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TermsContent from '@/components/TermsContent';
import { useLang, t } from "@/hooks/useAppLang";

export default function Terms() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Terms and Conditions</h1>
                <p className="text-sm text-gray-600">Bambeh Marketplace App</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <TermsContent />
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            For questions about these terms, contact:{' '}
            <a href="mailto:Bambehtheapp@gmail.com" className="text-teal-600 hover:underline">
              Bambehtheapp@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
