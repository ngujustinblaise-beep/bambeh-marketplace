/**
 * Footer.tsx â€” Bambeh Marketplace
 * FILE LOCATION: src/components/layout/Footer.tsx
 *
 * CHANGES IN THIS VERSION:
 *  âœ… "Lowest in any marketplace" â€” transaction fee badge updated everywhere
 *  âœ… "ETS BUSHENERGY" â†’ "BAMBEH SARL"
 *  âœ… Collapsible bottom bar â€” tap the copyright/links row to fold/unfold
 *  âœ… Full i18n â€” ALL visible strings now pulled from LanguageContext t()
 *     so the footer translates when the user changes language
 *  âœ… All previous fixes preserved (emails, YaoundÃ©, routes, Â© symbol)
 *
 * Â© 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

import { useState } from "react";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const currentYear = new Date().getFullYear();

  // â”€â”€ Collapsible bottom-bar state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [bottomOpen, setBottomOpen] = useState(true);

  return (
    <footer
      className="bg-gray-900 text-gray-300"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* â”€â”€ ABOUT + SOCIAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              {t("footer.aboutTitle") || "About Bambeh"}
            </h3>
            <p className="text-sm mb-4">
              {t("footer.aboutDesc") ||
                "Online Marketplace â€” Buy, Sell, Trade, and Find Jobs with only 1% transaction fee!"}
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

          {/* â”€â”€ CATEGORIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              {t("footer.categoriesTitle") || "Categories"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/jobs"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                  {t("nav.jobs") || "Jobs"}
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  {t("nav.marketplace") || "Marketplace"}
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" aria-hidden="true" />
                  {t("nav.services") || "Services"}
                </Link>
              </li>
              <li>
                <Link
                  to="/rentals"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <HomeIcon className="w-4 h-4" aria-hidden="true" />
                  {t("nav.rentals") || "Rentals"}
                </Link>
              </li>
              <li>
                <Link
                  to="/vehicles"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <Car className="w-4 h-4" aria-hidden="true" />
                  {t("nav.vehicles") || "Vehicles"}
                </Link>
              </li>
              <li>
                <Link
                  to="/exchange"
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
                  {t("nav.exchange") || "Exchange"}
                </Link>
              </li>
            </ul>
          </div>

          {/* â”€â”€ SUPPORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              {t("footer.supportTitle") || "Support"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-teal-400 transition-colors">
                  {t("footer.helpCentre") || "Help Centre"}
                </Link>
              </li>
              <li>
                <Link to="/help/contact" className="hover:text-teal-400 transition-colors">
                  {t("footer.contactSupport") || "Contact Support"}
                </Link>
              </li>
              <li>
                <Link to="/help/safety-security" className="hover:text-teal-400 transition-colors">
                  {t("footer.safetySecurity") || "Safety & Security"}
                </Link>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-teal-400 transition-colors">
                  {t("footer.subscriptionPlans") || "Subscription Plans"}
                </Link>
              </li>

              {/* Donate / Support Bambeh */}
              <li>
                <Link
                  to="/donate"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg transition-colors font-semibold text-white mt-2"
                >
                  <Heart className="w-4 h-4" aria-hidden="true" />
                  {t("footer.supportBambeh") || "Support Bambeh"}
                </Link>
              </li>
            </ul>
          </div>

          {/* â”€â”€ COMPANY + CONTACT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              {t("footer.companyTitle") || "Company"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors">
                  {t("footer.aboutUs") || "About Us"}
                </Link>
              </li>
              <li>
                <a
                  href="https://www.bambeh.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors"
                >
                  {t("footer.viewCompanyProfile") || "View Company Profile"}
                </a>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-teal-400 transition-colors">
                  {t("footer.terms") || "Terms & Conditions"}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-teal-400 transition-colors">
                  {t("footer.privacy") || "Privacy Policy"}
                </Link>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-3 text-sm">
              {/* Email â€” two separate lines */}
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

              {/* Location */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>YaoundÃ©, Cameroon</span>
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ BOTTOM BAR â€” collapsible â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="border-t border-gray-800 mt-12">

          {/* Toggle handle â€” always visible, tappable */}
          <button
            onClick={() => setBottomOpen((prev) => !prev)}
            aria-expanded={bottomOpen}
            aria-label={bottomOpen
              ? (t("footer.collapseFooter") || "Collapse footer details")
              : (t("footer.expandFooter")   || "Expand footer details")}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs text-gray-500 hover:text-gray-300 transition-colors select-none"
          >
            {bottomOpen
              ? <ChevronDown className="w-4 h-4" />
              : <ChevronUp   className="w-4 h-4" />}
            <span>
              {bottomOpen
                ? (t("footer.collapseLabel") || "Collapse")
                : (t("footer.expandLabel")   || "Show details")}
            </span>
          </button>

          {/* Collapsible content */}
          {bottomOpen && (
            <div className="pb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Copyright â€” BAMBEH SARL (was ETS BUSHENERGY) */}
                <div className="text-sm text-center md:text-left">
                  <p>Â© {currentYear} Bambeh. {t("footer.allRightsReserved") || "All rights reserved."}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("footer.operatedBy") || "Operated by"} BAMBEH SARL â€” YaoundÃ©, Cameroon
                  </p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                  <Link to="/terms-of-service" className="hover:text-teal-400 transition-colors">
                    {t("footer.terms") || "Terms"}
                  </Link>
                  <span className="text-gray-600" aria-hidden="true">Â·</span>
                  <Link to="/privacy-policy" className="hover:text-teal-400 transition-colors">
                    {t("footer.privacy") || "Privacy"}
                  </Link>
                  <span className="text-gray-600" aria-hidden="true">Â·</span>
                  <Link to="/help/contact" className="hover:text-teal-400 transition-colors">
                    {t("footer.contact") || "Contact"}
                  </Link>
                  <span className="text-gray-600" aria-hidden="true">Â·</span>
                  <Link to="/subscription" className="hover:text-teal-400 transition-colors">
                    {t("footer.subscriptions") || "Subscriptions"}
                  </Link>
                  <span className="text-gray-600" aria-hidden="true">Â·</span>
                  <Link
                    to="/donate"
                    className="hover:text-teal-400 transition-colors text-pink-400 font-semibold"
                  >
                    {t("footer.donate") || "Donate"}
                  </Link>
                </div>

                {/* Transaction Fee Badge â€” UPDATED TEXT */}
                <div className="bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold text-center">
                  {t("footer.transactionFeeBadge") || "Only 1% Transaction Fee â€” Lowest in Any Marketplace!"}
                </div>
              </div>

              {/* Social â€” Mobile only */}
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
          )}
        </div>
      </div>
    </footer>
  );
}

