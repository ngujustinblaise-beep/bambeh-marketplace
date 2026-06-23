/**
 * ---------------------------------------------------------------------------
 * VENDOR LOGIN SECTION COMPONENT
 * ---------------------------------------------------------------------------
 * 
 * This component displays a "Vendor Portal" section on the Login page.
 * It allows vendors to access their dashboard directly after logging in.
 * 
 * HOW TO USE:
 * Add this component to your Login.tsx page by:
 * 1. Import: import VendorLoginSection from '@/components/vendor/VendorLoginSection';
 * 2. Add <VendorLoginSection /> somewhere in your Login page JSX
 * 
 * FILE LOCATION: src/components/vendor/VendorLoginSection.tsx
 * 
 * © 2025 Bambé. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { Link } from 'react-router-dom';
import {
  Store,
  ArrowRight,
  Crown,
  ShieldCheck,
  BarChart3,
  Package
} from 'lucide-react';

// ---------------------------------------------------------------------------
// MAIN COMPONENT (FULL VERSION)
// --------------------

export default function VendorLoginSection() {
  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-3">
          <Store className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">Vendor Portal</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Are you a Vendor?</h3>
        <p className="text-sm text-gray-600 mt-1">
          Access your vendor dashboard to manage your business
        </p>
      </div>

      {/* Vendor Features */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Package className="w-5 h-5 text-teal-600" />
          <span className="text-sm text-gray-700">Manage Listings</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-700">View Analytics</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-700">Secure Dashboard</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Crown className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-gray-700">Premium Tools</span>
        </div>
      </div>

      {/* Vendor Dashboard Button */}
      <Link
        to="/vendor/dashboard"
      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold text-lg transition-all shadow-lg hover:shadow-xl"
      >
        <Store className="w-6 h-6" />
        Go to Vendor Dashboard
        <ArrowRight className="w-5 h-5" />
      </Link>

      {/* Not a Vendor Yet */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">Not a vendor yet?</p>
        <Link
          to="/vendor/register"
      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold text-sm"
        >
          Register as Vendor
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

// ---------------------------------------------------------------------------
// COMPACT VERSION (For smaller spaces)
// ---------------------------------------------------------------------------

}
export function VendorLoginSectionCompact() {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Store className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Vendor Portal</h4>
            <p className="text-xs text-gray-600">Manage your business</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to="/vendor/dashboard"
      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors"
          >
            <Store className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/vendor/register"
      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium text-sm border border-purple-200 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );

// ---------------------------------------------------------------------------
// BUTTON ONLY VERSION (Just a simple button)
// ---------------------------------------------------------------------------

}
export function VendorPortalButton() {
  return (
    <Link
      to="/vendor/dashboard"
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold transition-all shadow-md hover:shadow-lg"
    >
      <Store className="w-5 h-5" />
      Vendor Portal
      <ArrowRight className="w-4 h-4" />
    </Link>
  );

// ---------------------------------------------------------------------------
// INLINE LINK VERSION (Just text link)
// ---------------------------------------------------------------------------

}
export function VendorPortalLink() {
  return (
    <div className="text-center mt-4 pt-4 border-t border-gray-200">
      <Link
        to="/vendor/dashboard"
      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
      >
        <Store className="w-5 h-5" />
        Access Vendor Portal
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}






