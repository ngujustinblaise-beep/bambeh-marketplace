/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FOOTER - BAMBEH MARKETPLACE (FIXED)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ✅ FIXED: Subscription link now goes to /subscription (was /subscription-plans)
 * ✅ Correct Facebook link: https://www.facebook.com/profile.php?id=61585316773462
 * ✅ Correct Instagram link: https://www.instagram.com/bambehtheapp?igsh=MW9vNmU1MG84d3dsaA==
 * ✅ Donate/Support Bambeh button
 * ✅ Exchange in categories
 * ✅ Company profile linking
 * ✅ All navigation working
 *
 * © 2025 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowLeftRight,
  Briefcase,
  ShoppingBag,
  Wrench,
  Home as HomeIcon,
  Car
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* ═══════════════════════════════════════════════════════════
              ABOUT SECTION - WITH SOCIAL MEDIA LINKS
              ═══════════════════════════════════════════════════════════ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">About Bambeh</h3>
            <p className="text-sm mb-4">
              Online Marketplace - Buy, Sell, Trade, and Find Jobs with only 1%
              transaction fee!
            </p>

            {/* Social Media Icons - Styled like their platforms */}
            <div className="flex gap-3">
              {/* Facebook - Blue */}
              <a
                href="https://www.facebook.com/profile.php?id=61585316773462"
                target="_blank"
                rel="noopener noreferrer"
      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>

              {/* Instagram - Gradient */}
              <a
                href="https://www.instagram.com/bambehtheapp?igsh=MW9vNmU1MG84d3dsaA=="
                target="_blank"
                rel="noopener noreferrer"
      className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>

              {/* Twitter/X - Black */}
              <a
                href="https://twitter.com/bambehtheapp"
                target="_blank"
                rel="noopener noreferrer"
      className="w-10 h-10 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter/X"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              CATEGORIES - WITH EXCHANGE!
              ═══════════════════════════════════════════════════════════ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/jobs"
      className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
      className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
      className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/rentals"
      className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <HomeIcon className="w-4 h-4" />
                  Rentals
                </Link>
              </li>
              <li>
                <Link
                  to="/vehicles"
      className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  Vehicles
                </Link>
              </li>
              <li>
                <Link
                  to="/exchange"
      className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Exchange
                </Link>
              </li>
            </ul>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SUPPORT - WITH DONATE LINK!
              ═══════════════════════════════════════════════════════════ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/help"
      className="hover:text-teal-400 transition-colors"
                >
                  Help Centre
                </Link>
              </li>
              <li>
                <Link
                  to="/help/contact"
      className="hover:text-teal-400 transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  to="/help/safety-security"
      className="hover:text-teal-400 transition-colors"
                >
                  Safety & Security
                </Link>
              </li>
              {/* ═══════════════════════════════════════════════════════
                  🔧 FIXED: Changed from /subscription-plans to /subscription
                  ═══════════════════════════════════════════════════════ */}
              <li>
                <Link
                  to="/subscription"
      className="hover:text-teal-400 transition-colors"
                >
                  Subscription Plans
                </Link>
              </li>

              {/* ═══════════════════════════════════════════════════════
                  💚 DONATE LINK - SUPPORT BAMBEH!
                  ═══════════════════════════════════════════════════════ */}
              <li>
                <Link
                  to="/donate"
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg transition-colors font-semibold text-white mt-2"
                >
                  <Heart className="w-4 h-4" />
                  Support Bambeh
                </Link>
              </li>
            </ul>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              COMPANY - WITH PROPER WEBSITE LINK!
              ═══════════════════════════════════════════════════════════ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
      className="hover:text-teal-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://www.bambeh.com"
                  target="_blank"
                  rel="noopener noreferrer"
      className="hover:text-teal-400 transition-colors"
                >
                  View Company Profile
                </a>
              </li>
              <li>
                <Link
                  to="/terms-acceptance"
      className="hover:text-teal-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
      className="hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:bambetheapp@gmail.com"
      className="hover:text-teal-400 break-all"
                >
                  bambetheapp@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+237652953607" className="hover:text-teal-400">
                  +237 652 953 607
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Yaoundé, Cameroon</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            BOTTOM BAR
            ═══════════════════════════════════════════════════════════ */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-center md:text-left">
              <p>© {currentYear} Bambeh. All rights reserved.</p>
              <p className="text-xs text-gray-500 mt-1">
                Operated by Bambeh the App
              </p>
            </div>

            {/* Quick Links - FIXED SUBSCRIPTION LINK! */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/terms-acceptance"
      className="hover:text-teal-400 transition-colors"
              >
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/privacy"
      className="hover:text-teal-400 transition-colors"
              >
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/help/contact"
      className="hover:text-teal-400 transition-colors"
              >
                Contact
              </Link>
              <span className="text-gray-600">•</span>
              {/* 🔧 FIXED: Changed from /subscription-plans to /subscription */}
              <Link
                to="/subscription"
      className="hover:text-teal-400 transition-colors"
              >
                Subscriptions
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/donate"
      className="hover:text-teal-400 transition-colors text-pink-400 font-semibold"
              >
                Donate
              </Link>
            </div>

            {/* Transaction Fee Badge */}
            <div className="bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold">
              Only 1% Transaction Fee!
            </div>
          </div>

          {/* Social Media Buttons - Mobile Friendly */}
          <div className="mt-6 flex justify-center gap-3 md:hidden">
            <a
              href="https://www.facebook.com/profile.php?id=61585316773462"
              target="_blank"
              rel="noopener noreferrer"
      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://www.instagram.com/bambehtheapp?igsh=MW9vNmU1MG84d3dsaA=="
              target="_blank"
              rel="noopener noreferrer"
      className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://twitter.com/bambehtheapp"
              target="_blank"
              rel="noopener noreferrer"
      className="w-10 h-10 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors"
            >
              <Twitter className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
