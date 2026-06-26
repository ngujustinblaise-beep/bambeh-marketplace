/**
 * TERMS PAGE
 * Accessible from footer and menu
 * Uses official TermsContent component
 */

import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TermsContent from '@/components/TermsContent';

export default function Terms() {
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
            <a href="mailto:support@gmail.com" className="text-teal-600 hover:underline">
              support@gmail.com
            </a>{' '}
            or{' '}
            <a href="mailto:bambetheapp@gmail.com" className="text-teal-600 hover:underline">
              bambetheapp@gmail.com
            </a>
          </p>
          <p className="mt-2">
            BAMBEH SARL · RC: CM -NSI-02-2026-B13-00179 · NIU: M022618405804C · DUNS: 850379853
          </p>
        </div>
      </div>
    </div>
  );
}