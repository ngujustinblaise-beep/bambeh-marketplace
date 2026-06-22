/**
 * src/components/layout/Footer.tsx â€” Bambeh Marketplace
 * Â© 2026 BAMBEH SARL. All rights reserved.
 *
 * Self-contained 5-language footer (en Â· fr Â· pidgin Â· ar Â· ff).
 *  â€¢ No dotted i18n keys, no dependency on the broken App.tsx dictionary.
 *  â€¢ Icons are literal lucide components â€” never translated.
 *  â€¢ RTL layout applied automatically for Arabic.
 */

import { Link } from "react-router-dom";
import {
  Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart,
  ArrowLeftRight, Briefcase, ShoppingBag, Wrench, Home as HomeIcon, Car,
} from "lucide-react";
import { useLang } from "@/hooks/useAppLang";

// â”€â”€ Translations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FOOTER_T = {
  en: {
    aboutTitle: "About Bambeh",
    aboutDesc: "Online marketplace â€” buy, sell, trade and find jobs, with only a 1% transaction fee.",
    categoriesTitle: "Categories",
    jobs: "Jobs", marketplace: "Marketplace", services: "Services",
    rentals: "Rentals", vehicles: "Vehicles", exchange: "Exchange",
    supportTitle: "Support",
    helpCentre: "Help Center", contactSupport: "Contact Support",
    safetySecurity: "Safety & Security", subscriptionPlans: "Subscription Plans",
    supportBambeh: "Support Bambeh",
    companyTitle: "Company",
    aboutUs: "About Us", viewCompanyProfile: "View Company Profile",
    terms: "Terms & Conditions", privacy: "Privacy Policy",
    allRightsReserved: "All rights reserved.",
    operatedBy: "Operated by BAMBEH SARL",
    qTerms: "Terms", qPrivacy: "Privacy", qContact: "Contact", qSubs: "Subscriptions",
    feeBadge: "Only 1% Transaction Fee!",
  },
  fr: {
    aboutTitle: "Ã€ propos de Bambeh",
    aboutDesc: "Place de marchÃ© en ligne â€” achetez, vendez, Ã©changez et trouvez un emploi, avec seulement 1 % de frais de transaction.",
    categoriesTitle: "CatÃ©gories",
    jobs: "Emplois", marketplace: "MarchÃ©", services: "Services",
    rentals: "Locations", vehicles: "VÃ©hicules", exchange: "Ã‰change",
    supportTitle: "Assistance",
    helpCentre: "Centre d'aide", contactSupport: "Contacter le support",
    safetySecurity: "SÃ©curitÃ©", subscriptionPlans: "Forfaits d'abonnement",
    supportBambeh: "Soutenir Bambeh",
    companyTitle: "Entreprise",
    aboutUs: "Ã€ propos", viewCompanyProfile: "Voir le profil de l'entreprise",
    terms: "Conditions gÃ©nÃ©rales", privacy: "Politique de confidentialitÃ©",
    allRightsReserved: "Tous droits rÃ©servÃ©s.",
    operatedBy: "ExploitÃ© par BAMBEH SARL",
    qTerms: "Conditions", qPrivacy: "ConfidentialitÃ©", qContact: "Contact", qSubs: "Abonnements",
    feeBadge: "Seulement 1 % de frais !",
  },
  pidgin: {
    aboutTitle: "About Bambeh",
    aboutDesc: "Online market â€” buy, sell, trade and find work, with only 1% transaction fee.",
    categoriesTitle: "Categories",
    jobs: "Jobs", marketplace: "Market", services: "Services",
    rentals: "Rentals", vehicles: "Motors", exchange: "Exchange",
    supportTitle: "Support",
    helpCentre: "Help Center", contactSupport: "Contact Support",
    safetySecurity: "Safety & Security", subscriptionPlans: "Subscription Plans",
    supportBambeh: "Support Bambeh",
    companyTitle: "Company",
    aboutUs: "About Us", viewCompanyProfile: "See Company Profile",
    terms: "Terms & Conditions", privacy: "Privacy Policy",
    allRightsReserved: "All rights reserved.",
    operatedBy: "Operated by BAMBEH SARL",
    qTerms: "Terms", qPrivacy: "Privacy", qContact: "Contact", qSubs: "Subscriptions",
    feeBadge: "Only 1% Fee!",
  },
  ar: {
    aboutTitle: "Ø¹Ù† Ø¨Ø§Ù…Ø¨ÙŠÙ‡",
    aboutDesc: "Ø³ÙˆÙ‚ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ â€” Ø§Ø´ØªØ±Ù ÙˆØ¨ÙØ¹ ÙˆÙ‚Ø§ÙŠØ¶ ÙˆØ§Ø¨Ø­Ø« Ø¹Ù† Ø¹Ù…Ù„ØŒ Ø¨Ø±Ø³ÙˆÙ… Ù…Ø¹Ø§Ù…Ù„Ø§Øª 1% ÙÙ‚Ø·.",
    categoriesTitle: "Ø§Ù„ÙØ¦Ø§Øª",
    jobs: "Ø§Ù„ÙˆØ¸Ø§Ø¦Ù", marketplace: "Ø§Ù„Ø³ÙˆÙ‚", services: "Ø§Ù„Ø®Ø¯Ù…Ø§Øª",
    rentals: "Ø§Ù„Ø¥ÙŠØ¬Ø§Ø±Ø§Øª", vehicles: "Ø§Ù„Ù…Ø±ÙƒØ¨Ø§Øª", exchange: "Ø§Ù„Ù…Ù‚Ø§ÙŠØ¶Ø©",
    supportTitle: "Ø§Ù„Ø¯Ø¹Ù…",
    helpCentre: "Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©", contactSupport: "ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¯Ø¹Ù…",
    safetySecurity: "Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ø³Ù„Ø§Ù…Ø©", subscriptionPlans: "Ø¨Ø§Ù‚Ø§Øª Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ",
    supportBambeh: "Ø§Ø¯Ø¹Ù… Ø¨Ø§Ù…Ø¨ÙŠÙ‡",
    companyTitle: "Ø§Ù„Ø´Ø±ÙƒØ©",
    aboutUs: "Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¹Ù†Ø§", viewCompanyProfile: "Ø¹Ø±Ø¶ Ù…Ù„Ù Ø§Ù„Ø´Ø±ÙƒØ©",
    terms: "Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…", privacy: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©",
    allRightsReserved: "Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©.",
    operatedBy: "ØªÙØ¯Ø§Ø± Ø¨ÙˆØ§Ø³Ø·Ø© BAMBEH SARL",
    qTerms: "Ø§Ù„Ø´Ø±ÙˆØ·", qPrivacy: "Ø§Ù„Ø®ØµÙˆØµÙŠØ©", qContact: "Ø§ØªØµÙ„ Ø¨Ù†Ø§", qSubs: "Ø§Ù„Ø§Ø´ØªØ±Ø§ÙƒØ§Øª",
    feeBadge: "Ø±Ø³ÙˆÙ… 1% ÙÙ‚Ø·!",
  },
  ff: {
    aboutTitle: "E dow Bambeh",
    aboutDesc: "Suudu njiydi internet â€” soodu, yoÉ“, wattindir e yiy golle, ko 1% tan njoÉ“di.",
    categoriesTitle: "Teelte",
    jobs: "Golle", marketplace: "Suudu Njiydi", services: "TiiÉ—e",
    rentals: "NjooÉ—am", vehicles: "Otooji", exchange: "Wattindirde",
    supportTitle: "Ballal",
    helpCentre: "LaaÉ“al Ballal", contactSupport: "Æanndital Ballal",
    safetySecurity: "Kisinaare", subscriptionPlans: "Sariyaaji Sooddi",
    supportBambeh: "Wallu Bambeh",
    companyTitle: "Sosirde",
    aboutUs: "E dow min", viewCompanyProfile: "Yiy gamgal sosirde",
    terms: "SarÉ—iiji", privacy: "SarÉ—i Gaasooji",
    allRightsReserved: "Hakke fof kuuÉ—i.",
    operatedBy: "Ardii e BAMBEH SARL",
    qTerms: "SarÉ—iiji", qPrivacy: "Gaasooji", qContact: "Æanndital", qSubs: "Sooddi",
    feeBadge: "Ko 1% njoÉ“di tan!",
  },
} as const;

type FLang = keyof typeof FOOTER_T;

export default function Footer() {
  const langRaw = useLang() as string;
  const lang: FLang = (langRaw in FOOTER_T ? langRaw : "en") as FLang;
  const s = FOOTER_T[lang];
  const isRtl = lang === "ar";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* ABOUT */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">{s.aboutTitle}</h3>
            <p className="text-sm mb-4">{s.aboutDesc}</p>
            <div className="flex gap-4">
              <a href="https://facebook.com/bambeh" target="_blank" rel="noopener noreferrer"
                className="hover:text-teal-400 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/bambeh" target="_blank" rel="noopener noreferrer"
                className="hover:text-teal-400 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/bambeh" target="_blank" rel="noopener noreferrer"
                className="hover:text-teal-400 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* CATEGORIES */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">{s.categoriesTitle}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-teal-400 transition-colors flex items-center gap-2"><Briefcase className="w-4 h-4" />{s.jobs}</Link></li>
              <li><Link to="/marketplace" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ShoppingBag className="w-4 h-4" />{s.marketplace}</Link></li>
              <li><Link to="/services" className="hover:text-teal-400 transition-colors flex items-center gap-2"><Wrench className="w-4 h-4" />{s.services}</Link></li>
              <li><Link to="/rentals" className="hover:text-teal-400 transition-colors flex items-center gap-2"><HomeIcon className="w-4 h-4" />{s.rentals}</Link></li>
              <li><Link to="/vehicles" className="hover:text-teal-400 transition-colors flex items-center gap-2"><Car className="w-4 h-4" />{s.vehicles}</Link></li>
              <li><Link to="/exchange" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" />{s.exchange}</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">{s.supportTitle}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-teal-400 transition-colors">{s.helpCentre}</Link></li>
              <li><Link to="/help/contact" className="hover:text-teal-400 transition-colors">{s.contactSupport}</Link></li>
              <li><Link to="/help/safety-security" className="hover:text-teal-400 transition-colors">{s.safetySecurity}</Link></li>
              <li><Link to="/subscription" className="hover:text-teal-400 transition-colors">{s.subscriptionPlans}</Link></li>
              <li>
                <Link to="/donate" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="font-semibold">{s.supportBambeh}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">{s.companyTitle}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-teal-400 transition-colors">{s.aboutUs}</Link></li>
              <li><a href="https://www.bambeh.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">{s.viewCompanyProfile}</a></li>
              <li><Link to="/terms" className="hover:text-teal-400 transition-colors">{s.terms}</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-400 transition-colors">{s.privacy}</Link></li>
            </ul>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@bambeh.com" className="hover:text-teal-400" dir="ltr">support@bambeh.com</a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span dir="ltr">+237 652 953 607</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>YaoundÃ©, Cameroon</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-center md:text-left">
              <p>Â© {currentYear} Bambeh. {s.allRightsReserved}</p>
              <p className="text-xs text-gray-500 mt-1">{s.operatedBy} â€” YaoundÃ©, Cameroon</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/terms" className="hover:text-teal-400 transition-colors">{s.qTerms}</Link>
              <span className="text-gray-600">Â·</span>
              <Link to="/privacy" className="hover:text-teal-400 transition-colors">{s.qPrivacy}</Link>
              <span className="text-gray-600">Â·</span>
              <Link to="/help/contact" className="hover:text-teal-400 transition-colors">{s.qContact}</Link>
              <span className="text-gray-600">Â·</span>
              <Link to="/subscription" className="hover:text-teal-400 transition-colors">{s.qSubs}</Link>
            </div>

            <div className="bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold">
              {s.feeBadge}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


