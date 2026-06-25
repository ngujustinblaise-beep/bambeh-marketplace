/**
 * TERMS PAGE
 * Accessible from footer and menu
 * Uses official TermsContent component
 */

import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TermsContent from '@/components/TermsContent';
import { useLang } from "@/hooks/useAppLang";

const COMPANY = {
  legalName: "BAMBEH SARL",
  registreDeCommerce: "CM -NSI-02-2026-B13-00179",
  niu: "M022618405804C",
  duns: "850379853",
  emails: ["support@bambeh.com", "bambetheapp@gmail.com"],
};

export default function Terms() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Business Identity</h2>
            <p className="text-sm text-gray-700"><span className="font-semibold">Legal business name:</span> {COMPANY.legalName}</p>
            <p className="text-sm text-gray-700"><span className="font-semibold">Registre de commerce:</span> {COMPANY.registreDeCommerce}</p>
            <p className="text-sm text-gray-700"><span className="font-semibold">NIU:</span> {COMPANY.niu}</p>
            <p className="text-sm text-gray-700"><span className="font-semibold">D-U-N-S No:</span> {COMPANY.duns}</p>
          </section>

          <TermsContent />
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700">Approved contact emails only:</p>
          <p>
            <a href="mailto:support@bambeh.com" className="text-teal-600 hover:underline">
              support@bambeh.com
            </a>
          </p>
          <p>
            <a href="mailto:bambetheapp@gmail.com" className="text-teal-600 hover:underline">
              bambetheapp@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}	
