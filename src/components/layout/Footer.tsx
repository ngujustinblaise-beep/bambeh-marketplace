/**
 * src/components/layout/Footer.tsx – Bambeh Marketplace
 * © 2026 BAMBEH SARL. All rights reserved.
 *
 * Self-contained 5-language footer (en, fr, pidgin, ar, ff).
 * No dotted i18next keys. RTL for Arabic.
 */

import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/hooks/useAppLang";

const FOOTER_T = {
  en: {
    aboutTitle: "About Bambeh",
    aboutDesc: "Online marketplace — buy, sell, trade and find jobs, with only a 1% transaction fee.",
    categories: "Categories",
    jobs: "Jobs",
    marketplace: "Marketplace",
    services: "Services",
    support: "Support",
    helpCentre: "Help Centre",
    contact: "Contact Support",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    allRights: "All rights reserved.",
  },
  fr: {
    aboutTitle: "À Propos de Bambeh",
    aboutDesc: "Marché en ligne — acheter, vendre, échanger et trouver du travail, avec seulement 1% de frais de transaction.",
    categories: "Catégories",
    jobs: "Emplois",
    marketplace: "Marché",
    services: "Services",
    support: "Assistance",
    helpCentre: "Centre d'aide",
    contact: "Nous contacter",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
    allRights: "Tous droits réservés.",
  },
  pidgin: {
    aboutTitle: "About Bambeh",
    aboutDesc: "Online market — buy, sell, trade and find work, with only 1% payment fee.",
    categories: "Categories",
    jobs: "Work",
    marketplace: "Market",
    services: "Services",
    support: "Support",
    helpCentre: "Help",
    contact: "Call Us",
    terms: "Rules & Conditions",
    privacy: "Privacy",
    allRights: "All rights reserved.",
  },
  ar: {
    aboutTitle: "حول بمبيه",
    aboutDesc: "سوق على الإنترنت — اشتري وبيّع وتبادل وابحث عن وظائف، برسم معاملة 1% فقط.",
    categories: "الفئات",
    jobs: "الوظائف",
    marketplace: "السوق",
    services: "الخدمات",
    support: "الدعم",
    helpCentre: "مركز المساعدة",
    contact: "اتصل بنا",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    allRights: "جميع الحقوق محفوظة.",
  },
  ff: {
    aboutTitle: "Ngam Bambeh",
    aboutDesc: "Jannginay online — kaare, nonnde, jottinde e heewde coggal, jami tan joomre 1%.",
    categories: "Leggal",
    jobs: "Coggal",
    marketplace: "Jannginay",
    services: "Karamal",
    support: "Walawol",
    helpCentre: "Keere Walawol",
    contact: "Kontakta Amen",
    terms: "Shartooɗi",
    privacy: "Juwi Yimɓe",
    allRights: "Haande fof njuɗɗi.",
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
              <Facebook size={20} className="cursor-pointer hover:text-blue-500" />
              <Twitter size={20} className="cursor-pointer hover:text-blue-400" />
              <Instagram size={20} className="cursor-pointer hover:text-pink-500" />
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.categories}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/#/marketplace" className="hover:text-white">{t.marketplace}</Link></li>
              <li><Link to="/#/jobs" className="hover:text-white">{t.jobs}</Link></li>
              <li><Link to="/#/services" className="hover:text-white">{t.services}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t.support}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/help" className="hover:text-white">{t.helpCentre}</Link></li>
              <li><Link to="/contact" className="hover:text-white">{t.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/terms" className="hover:text-white">{t.terms}</Link></li>
              <li><Link to="/privacy" className="hover:text-white">{t.privacy}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className={`flex ${isRTL ? "flex-row-reverse" : ""} justify-between items-center text-sm text-gray-400`}>
            <p>&copy; 2026 BAMBEH SARL. {t.allRights}</p>
            <div className={`flex gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Mail size={18} />
              <Phone size={18} />
              <MapPin size={18} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

