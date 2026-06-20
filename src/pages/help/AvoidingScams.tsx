/**
 * AVOIDING SCAMS PAGE
 */

import { Link } from "react-router-dom";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

export default function AvoidingScams() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Avoiding Scams</h1>
              <p className="text-red-100">Stay safe from fraud</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              Red Flags to Watch For
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>
                  <strong>Too good to be true prices</strong> - Items
                  significantly below market value
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>
                  <strong>Pressure to act quickly</strong> - "Buy now or it's
                  gone!"
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>
                  <strong>Payment before viewing</strong> - Never pay before
                  seeing the item
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>
                  <strong>Wire transfer requests</strong> - These are hard to
                  reverse
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>
                  <strong>Vague descriptions</strong> - Lack of specific details
                  or photos
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Safe Practices
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Meet in public places during daylight hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Verify items before paying</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Use secure payment methods</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Trust your instincts</span>
              </li>
            </ul>
          </section>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">
              🚨 If You Suspect a Scam
            </h3>
            <p className="text-gray-700 mb-3">
              Report it immediately using our reporting system
            </p>
            <Link
              to="/help/reporting-issues"
      className="text-red-600 hover:text-red-700 font-semibold"
            >
              Learn how to report →
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/help"
      className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            ← Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}


