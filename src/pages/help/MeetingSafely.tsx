/**
 * MEETING SAFELY PAGE
 */

import { Link } from "react-router-dom";
import { Users, MapPin, Sun, UserCheck } from "lucide-react";

export default function MeetingSafely() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Meeting Safely</h1>
              <p className="text-blue-100">
                Best practices for in-person transactions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Choose Safe Locations
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li>✓ Shopping malls or busy markets</li>
              <li>✓ Bank lobbies</li>
              <li>✓ Coffee shops or restaurants</li>
              <li>✓ Police stations (many offer safe exchange zones)</li>
              <li>✗ Avoid private homes or isolated areas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sun className="w-6 h-6 text-yellow-600" />
              Meet During Daylight
            </h2>
            <p className="text-gray-700">
              Schedule meetings during daytime hours when areas are well-lit and
              busy with other people.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-green-600" />
              Bring a Friend
            </h2>
            <p className="text-gray-700 mb-4">
              Consider bringing someone with you, especially for high-value
              transactions.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Tip:</strong> Let someone know where you're going and
                when you expect to return
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Safety Checklist
            </h2>
            <div className="space-y-2 text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Chosen a public, well-lit location</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Meeting during daylight hours</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Told someone where I'm going</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Bringing my phone (fully charged)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Trust my instincts</span>
              </label>
            </div>
          </section>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">⚠️ Warning Signs</h3>
            <p className="text-gray-700">
              If the other person seems aggressive, suspicious, or makes you
              uncomfortable in any way, leave immediately and report to Bambeh.
            </p>
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
