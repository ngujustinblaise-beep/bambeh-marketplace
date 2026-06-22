/**
 * ---------------------------------------------------------------------------
 * VENDOR FOOTER ENHANCED - FOOTER FOR ALL VENDOR PAGES
 * ---------------------------------------------------------------------------
 *
 * Features:
 * ? Quick links with CORRECT paths
 * ? Subscription Plans link pointing to /vendor/subscription (FIXED!)
 * ? Support information
 * ? Social media links
 * ? Legal links
 * ? Contact information
 * ? Payment methods display
 *
 * FILE LOCATION: src/components/vendor/VendorFooter.tsx
 * © 2025 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { Link } from "react-router-dom";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  HelpCircle,
  FileText,
  Shield,
  CreditCard,
  Headphones,
  MessageSquare,
  Crown,
  Users,
  BarChart3,
  Package,
  Zap,
  BadgeCheck
} from "lucide-react";

export default function VendorFooter() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            {/* NON-CLICKABLE LOGO */}
            <div className="flex items-center gap-3 mb-4 select-none pointer-events-none">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Bambeh</h3>
                <p className="text-xs text-gray-400">Vendor Portal</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              's #1 Marketplace for buying and selling. Join thousands
              of vendors growing their business with Bambeh.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
      className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
      className="w-9 h-9 bg-gray-800 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
      className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
      className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links - WITH CORRECT PATHS */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/vendor/home"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/manage-listings"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/analytics"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>
              </li>
              <li>
                {/* ---------------------------------------------------------------
                    ?? CUSTOMERS LINK - NOW POINTS TO CORRECT PAGE ??
                    --------------------------------------------------------------- */}
                <Link
                  to="/vendor/customers"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Customers
                </Link>
              </li>
              <li>
                {/* ---------------------------------------------------------------
                    ?? SUBSCRIPTION PLANS - FIXED! NOW POINTS TO CORRECT PAGE ??
                    --------------------------------------------------------------- */}
                <Link
                  to="/vendor/subscription"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/premium-tools"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Premium Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/verification"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Get Verified
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/help/guides"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Seller Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/help/contact"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Headphones className="w-4 h-4" />
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Live Chat
                </Link>
              </li>
              <li>
                <Link
                  to="/help/payment-methods"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link
                  to="/help/safety-security"
      className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Yaoundé, 
                  <br />
                  Centre Region
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <a
                  href="tel:+237600000000"
      className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  +237 6XX XXX XXX
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <a
                  href="mailto:support@bambeh.cm"
      className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  support@bambeh.cm
                </a>
              </li>
            </ul>

            {/* Working Hours */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Support Hours</p>
              <p className="text-sm text-gray-300">
                Mon - Sat: 8:00 AM - 8:00 PM
              </p>
              <p className="text-sm text-gray-300">
                Sunday: 10:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Bambeh. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/privacy-policy"
      className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
      className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
      className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">We accept:</span>
              <div className="flex gap-1">
                <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded">
                  MTN
                </span>
                <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                  Orange
                </span>
                <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded">
                  Zerm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}





