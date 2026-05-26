/**
 * SAFETY & SECURITY PAGE
 */

import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Users, Flag } from "lucide-react";

export default function SafetySecurity() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Safety & Security</h1>
              <p className="text-red-100">Your safety is our priority</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Link
            to="/help/avoiding-scams"
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Avoiding Scams
                </h2>
                <p className="text-gray-600">
                  Learn to identify and avoid fraudulent listings
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/help/meeting-safely"
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Meeting Safely
                </h2>
                <p className="text-gray-600">
                  Best practices for in-person transactions
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/help/reporting-issues"
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Flag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Reporting Issues
                </h2>
                <p className="text-gray-600">
                  Report suspicious activity or content
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">🚨 Emergency</h3>
          <p className="text-gray-700">
            If you feel threatened or unsafe, contact local authorities
            immediately.
          </p>
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
