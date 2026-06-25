/**
 * src/components/layout/Footer.tsx - Bambeh Marketplace
 * (c) 2026 BAMBEH SARL. All rights reserved.
 *
 * Self-contained 5-language footer (en, fr, pidgin, ar, ff). RTL for Arabic.
 * All non-ASCII stored as \u escapes (paste-safe, never mojibakes).
 */

import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/hooks/useAppLang";

const SUPPORT_EMAIL = "support@bambeh.com";
const SUPPORT_PHONE = "+237652953607";        // tel: uses full intl format
const SUPPORT_PHONE_DISPLAY = "652 953 607";

const FOOTER_T = {
  en: {
    aboutTitle: "About Bambeh",
    aboutDesc: "Online marketplace - buy, sell, trade and find jobs, with only a 1% transaction fee.",
    categories: "Categories", jobs: "Jobs", marketplace: "Marketplace", services: "Services",
    support: "Support", helpCentre: "Help Centre", contact: "Contact Support",
    legal: "Legal", terms: "Terms & Conditions", privacy: "Privacy Policy",
    donate: "Donate", allRights: "All rights reserved.",
  },
  fr: {
    aboutTitle: "\u00C0 Propos de Bambeh",
    aboutDesc: "March\u00E9 en ligne - acheter, vendre, \u00E9changer et trouver du travail, avec seulement 1% de frais de transaction.",
    categories: "Cat\u00E9gories", jobs: "Emplois", marketplace: "March\u00E9", services: "Services",
    support: "Assistance", helpCentre: "Centre d'aide", contact: "Nous contacter",
    legal: "Mentions l\u00E9gales", terms: "Conditions d'utilisation", privacy: "Politique de confidentialit\u00E9",
    donate: "Faire un don", allRights: "Tous droits r\u00E9serv\u00E9s.",
  },
  pidgin: {
    aboutTitle: "About Bambeh",
    aboutDesc: "Online market - buy, sell, trade and find work, with only 1% payment fee.",
    categories: "Categories", jobs: "Work", marketplace: "Market", services: "Services",
    support: "Support", helpCentre: "Help", contact: "Call Us",
    legal: "Legal", terms: "Rules & Conditions", privacy: "Privacy",
    donate: "Donate", allRights: "All rights reserved.",
  },
  ar: {
    aboutTitle: "\u062D\u0648\u0644 \u0628\u0645\u0628\u064A\u0647",
    aboutDesc: "\u0633\u0648\u0642 \u0639\u0644\u0649 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A - \u0627\u0634\u062A\u0631\u0650 \u0648\u0628\u0650\u0639 \u0648\u062A\u0628\u0627\u062F\u0644 \u0648\u0627\u0628\u062D\u062B \u0639\u0646 \u0648\u0638\u0627\u0626\u0641\u060C \u0628\u0631\u0633\u0645 \u0645\u0639\u0627\u0645\u0644\u0629 1% \u0641\u0642\u0637.",
    categories: "\u0627\u0644\u0641\u0626\u0627\u062A", jobs: "\u0627\u0644\u0648\u0638\u0627\u0626\u0641", marketplace: "\u0627\u0644\u0633\u0648\u0642", services: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A",
    support: "\u0627\u0644\u062F\u0639\u0645", helpCentre: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629", contact: "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627",
    legal: "\u0642\u0627\u0646\u0648\u0646\u064A", terms: "\u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u0623\u062D\u0643\u0627\u0645", privacy: "\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629",
    donate: "\u062A\u0628\u0631\u0639", allRights: "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.",
  },
  ff: {
    aboutTitle: "Ngam Bambeh",
    aboutDesc: "Jannginay online - kaare, nonnde, jottinde e heewde coggal, jami tan joomre 1%.",
    categories: "Leggal", jobs: "Coggal", marketplace: "Jannginay", services: "Karamal",
    support: "Walawol", helpCentre: "Keere Walawol", contact: "Kontakta Amen",
    legal: "Laawol", terms: "Shartooji", privacy: "Juwi Yimbe",
    donate: "Dokkal", allRights: "Haande fof njuddi.",
  },
};

export default function Footer() {
  const lang = useLang() as keyof typeof FOOTER_T;
  const t = FOOTER_T[lang] || FOOTER_T.en;
  const isRTL = lang === "ar";

  return (
    <footer
      className={`bg-gray-900 text-white py-12 px-4 ${isRTL ? "dir-rtl" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 ${isRTL ? "text-right" : ""}`}>
          <div>
            <h3 className="font-bold text-lg mb-4">{t.aboutTitle}</h3>
            <p className="text-gray-400 text-sm">{t.aboutDesc}</p>
            <div className="flex gap-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={20} className="cursor-pointer hover:text-blue-500" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter size={20} className="cursor-pointer hover:text-blue-400" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={20} className="cursor-pointer hover:text-pink-500" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.categories}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/marketplace" className="hover:text-white">{t.marketplace}</Link></li>
              <li><Link to="/jobs" className="hover:text-white">{t.jobs}</Link></li>
              <li><Link to="/services" className="hover:text-white">{t.services}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.support}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/help" className="hover:text-white">{t.helpCentre}</Link></li>
              <li><Link to="/contact" className="hover:text-white">{t.contact}</Link></li>
              <li><Link to="/donate" className="hover:text-white">{t.donate}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.legal}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/terms" className="hover:text-white">{t.terms}</Link></li>
              <li><Link to="/privacy" className="hover:text-white">{t.privacy}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className={`flex ${isRTL ? "flex-row-reverse" : ""} justify-between items-center text-sm text-gray-400`}>
            <p>&copy; 2026 BAMBEH SARL. {t.allRights}</p>
            <div className={`flex gap-4 items-center ${isRTL ? "flex-row-reverse" : ""}`}>
              <a href={`mailto:${SUPPORT_EMAIL}`} aria-label={`Email ${SUPPORT_EMAIL}`} title={SUPPORT_EMAIL} className="hover:text-white transition-colors">
                <Mail size={18} />
              </a>
              <a href={`tel:${SUPPORT_PHONE}`} aria-label={`Call ${SUPPORT_PHONE_DISPLAY}`} title={SUPPORT_PHONE_DISPLAY} className="hover:text-white transition-colors">
                <Phone size={18} />
              </a>
              <MapPin size={18} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
