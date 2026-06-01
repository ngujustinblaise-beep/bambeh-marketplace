/**
 * Footer.tsx — Bambeh Marketplace
 * ---------------------------------------------------------------------------
 * FIXED in this version:
 *  ✅ Emails now on SEPARATE LINES (support@bambeh.com on one, bambetheapp@gmail.com below)
 *  ✅ Corrupted characters fixed: "Yaound?" → "Yaoundé", "?" → "·", "?" → "©"
 *  ✅ Location: "Yaoundé, Cameroon" (was blank "Yaoundé, ")
 *  ✅ Footer separator dots use proper · character
 *  ✅ Copyright symbol © hardcoded (was rendering as ?)
 *  ✅ All navigation links verified against App.tsx routes
 *  ✅ Terms link → /terms-of-service (matches App.tsx route)
 *  ✅ Privacy link → /privacy-policy (matches App.tsx route, /privacy redirects there)
 * ---------------------------------------------------------------------------
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
  Car,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* ── ABOUT + SOCIAL ─────────────────────────────────────────── */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">About Bambeh</h3>
            <p className="text-sm mb-4">
              Online Marketplace — Buy, Sell, Trade, and Find Jobs with only 1%
              transaction fee!
            </p>

            <div className="flex gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61585316773462"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Bambeh on Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/bambehtheapp?igsh=MW9vNmU1MG84d3dsaA=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Bambeh on Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com/bambehtheapp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Bambeh on Twitter/X"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* ── CATEGORIES ─────────────────────────────────────────────── */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/jobs"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                  Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" aria-hidden="true" />
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/rentals"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <HomeIcon className="w-4 h-4" aria-hidden="true" />
                  Rentals
                </Link>
              </li>
              <li>
                <Link
                  to="/vehicles"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Car className="w-4 h-4" aria-hidden="true" />
                  Vehicles
                </Link>
              </li>
              <li>
                <Link
                  to="/exchange"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
                  Exchange
                </Link>
              </li>
            </ul>
          </div>

          {/* ── SUPPORT ────────────────────────────────────────────────── */}
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
                  Safety &amp; Security
                </Link>
              </li>
              <li>
                <Link
                  to="/subscription"
                  className="hover:text-teal-400 transition-colors"
                >
                  Subscription Plans
                </Link>
              </li>

              {/* Donate / Support Bambeh */}
              <li>
                <Link
                  to="/donate"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg transition-colors font-semibold text-white mt-2"
                >
                  <Heart className="w-4 h-4" aria-hidden="true" />
                  Support Bambeh
                </Link>
              </li>
            </ul>
          </div>

          {/* ── COMPANY + CONTACT ──────────────────────────────────────── */}
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
                {/* FIXED: route is /terms-of-service (matches App.tsx line 1062) */}
                <Link
                  to="/terms-of-service"
                  className="hover:text-teal-400 transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                {/* FIXED: route is /privacy-policy (matches App.tsx line 1060) */}
                <Link
                  to="/privacy-policy"
                  className="hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-3 text-sm">

              {/* ── EMAIL — FIXED: two emails on SEPARATE lines ── */}
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                  <a
                    href="mailto:support@bambeh.com"
                    className="hover:text-teal-400 transition-colors break-all"
                  >
                    support@bambeh.com
                  </a>
                  <a
                    href="mailto:bambetheapp@gmail.com"
                    className="hover:text-teal-400 transition-colors break-all"
                  >
                    bambetheapp@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <a
                  href="tel:+237652953607"
                  className="hover:text-teal-400 transition-colors"
                >
                  +237 652 953 607
                </a>
              </div>

              {/* Location — FIXED: "Yaoundé, Cameroon" (was blank) */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>Yaoundé, Cameroon</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ─────────────────────────────────────────────── */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Copyright — FIXED: © hardcoded, no encoding issues */}
            <div className="text-sm text-center md:text-left">
              <p>© {currentYear} Bambeh. All rights reserved.</p>
              <p className="text-xs text-gray-500 mt-1">
                Operated by ETS BUSHENERGY — Yaoundé, Cameroon
              </p>
            </div>

            {/* Quick Links — FIXED: correct routes, proper · separator */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              <Link
                to="/terms-of-service"
                className="hover:text-teal-400 transition-colors"
              >
                Terms
              </Link>
              <span className="text-gray-600" aria-hidden="true">·</span>
              <Link
                to="/privacy-policy"
                className="hover:text-teal-400 transition-colors"
              >
                Privacy
              </Link>
              <span className="text-gray-600" aria-hidden="true">·</span>
              <Link
                to="/help/contact"
                className="hover:text-teal-400 transition-colors"
              >
                Contact
              </Link>
              <span className="text-gray-600" aria-hidden="true">·</span>
              <Link
                to="/subscription"
                className="hover:text-teal-400 transition-colors"
              >
                Subscriptions
              </Link>
              <span className="text-gray-600" aria-hidden="true">·</span>
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

          {/* Social — Mobile only */}
          <div className="mt-6 flex justify-center gap-3 md:hidden">
            <a
              href="https://www.facebook.com/profile.php?id=61585316773462"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://www.instagram.com/bambehtheapp?igsh=MW9vNmU1MG84d3dsaA=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
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
      </div>
    </footer>
  );
}
