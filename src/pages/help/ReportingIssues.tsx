/**
 * REPORTING ISSUES PAGE
 */

import { Link } from 'react-router-dom';
import { Flag, AlertCircle, MessageCircle, Clock } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function ReportingIssues() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Flag className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Reporting Issues</h1>
              <p className="text-purple-100">Help keep Bambeh safe for everyone</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Can You Report?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Scams & Fraud</h3>
                <p className="text-sm text-gray-600">Fake listings, payment scams, identity theft</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Inappropriate Content</h3>
                <p className="text-sm text-gray-600">Prohibited items, offensive material</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Harassment</h3>
                <p className="text-sm text-gray-600">Threatening messages, spam</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Other Issues</h3>
                <p className="text-sm text-gray-600">Technical problems, account issues</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Report</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Click the Report Button</h3>
                  <p className="text-gray-600 text-sm">Found on every listing and profile</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Select Report Type</h3>
                  <p className="text-gray-600 text-sm">Choose the most appropriate category</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Provide Details</h3>
                  <p className="text-gray-600 text-sm">Explain what happened and add screenshots if possible</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Submit Report</h3>
                  <p className="text-gray-600 text-sm">Your report will be reviewed by our team</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600" />
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Our moderation team reviews your report within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Serious violations are handled immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Violators may be warned, suspended, or banned</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>You'll be notified of the outcome</span>
              </li>
            </ul>
          </section>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              Need Immediate Help?
            </h3>
            <p className="text-gray-700 mb-4">For urgent safety concerns, contact our support team directly</p>
            <Link
              to="/contact"
      className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">
            ← Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
