/**
 * HOW TO POST AD PAGE
 */

import { Link } from "react-router-dom";
import { PlusCircle, Image, FileText, MapPin } from "lucide-react";

export default function HowToPostAd() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <PlusCircle className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">How to Post an Ad</h1>
              <p className="text-teal-100">Create listings that sell</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Choose Category
            </h2>
            <p className="text-gray-600 ml-10">
              Select the most appropriate category for your item
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Add Photos
            </h2>
            <p className="text-gray-600 ml-10 mb-3">
              Upload clear, well-lit photos from multiple angles
            </p>
            <div className="ml-10 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Pro Tip:</strong> Listings with 5+ photos get 3x more
                views!
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">
                3
              </span>
              Write Description
            </h2>
            <p className="text-gray-600 ml-10 mb-3">
              Include key details like condition, specifications, and features
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm">
                4
              </span>
              Set Location
            </h2>
            <p className="text-gray-600 ml-10">
              Add your location to help buyers find you
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8">
            <h3 className="font-bold text-gray-900 mb-3">?? Earn Zerm Coins</h3>
            <p className="text-gray-700">
              Get 2 Zerm Coins for each approved listing!
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/help"
      className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            ? Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
