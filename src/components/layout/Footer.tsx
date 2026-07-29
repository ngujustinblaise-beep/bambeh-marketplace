/**
 * src/components/layout/Footer.tsx — Bambeh Marketplace
 * © 2026 BAMBEH SARL. All rights reserved.
 *
 * Self-contained 5-language footer (en · fr · pidgin · ar · ff).
 *  • No dotted i18n keys, no dependency on the broken App.tsx dictionary.
 *  • Icons are literal lucide components — never translated.
 *  • RTL layout applied automatically for Arabic.
 */	

import { Link } from "react-router-dom";
import {	
  Mail, Phone, MapPin, Heart,
  ArrowLeftRight, Briefcase, ShoppingBag, Wrench, Home as HomeIcon, Car,
} from "lucide-react";
import { useLang } from "@/hooks/useAppLang";
import { Facebook, Twitter, Instagram } from "@/components/icons/BrandIcons";

// ── Translations ──────────────────────────────────────────────────────────────
const FOOTER_T = {
  en: {
    aboutTitle: "About Bambeh",
    aboutDesc: "Online marketplace — buy, sell, trade and find jobs, with only a 1% transaction fee.",
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
    aboutTitle: "À propos de Bambeh",
    aboutDesc: "Place de marché en ligne — achetez, vendez, échangez et trouvez un emploi, avec seulement 1 % de frais de transaction.",
    categoriesTitle: "Catégories",
    jobs: "Emplois", marketplace: "Marché", services: "Services",
    rentals: "Locations", vehicles: "Véhicules", exchange: "Échange",
    supportTitle: "Assistance",
    helpCentre: "Centre d'aide", contactSupport: "Contacter le support",
    safetySecurity: "Sécurité", subscriptionPlans: "Forfaits d'abonnement",
    supportBambeh: "Soutenir Bambeh",
    companyTitle: "Entreprise",
    aboutUs: "À propos", viewCompanyProfile: "Voir le profil de l'entreprise",
    terms: "Conditions générales", privacy: "Politique de confidentialité",
    allRightsReserved: "Tous droits réservés.",
    operatedBy: "Exploité par BAMBEH SARL",
    qTerms: "Conditions", qPrivacy: "Confidentialité", qContact: "Contact", qSubs: "Abonnements",
    feeBadge: "Seulement 1 % de frais !",
  },
  pidgin: {
    aboutTitle: "About Bambeh",
    aboutDesc: "Online market — buy, sell, trade and find work, with only 1% transaction fee.",
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
    aboutTitle: "عن بامبيه",
    aboutDesc: "سوق إلكتروني — اشترِ وبِع وقايض وابحث عن عمل، برسوم معاملات 1% فقط.",
    categoriesTitle: "الفئات",
    jobs: "الوظائف", marketplace: "السوق", services: "الخدمات",
    rentals: "الإيجارات", vehicles: "المركبات", exchange: "المقايضة",
    supportTitle: "الدعم",
    helpCentre: "مركز المساعدة", contactSupport: "تواصل مع الدعم",
    safetySecurity: "الأمان والسلامة", subscriptionPlans: "باقات الاشتراك",
    supportBambeh: "ادعم بامبيه",
    companyTitle: "الشركة",
    aboutUs: "معلومات عنا", viewCompanyProfile: "عرض ملف الشركة",
    terms: "الشروط والأحكام", privacy: "سياسة الخصوصية",
    allRightsReserved: "جميع الحقوق محفوظة.",
    operatedBy: "تُدار بواسطة BAMBEH SARL",
    qTerms: "الشروط", qPrivacy: "الخصوصية", qContact: "اتصل بنا", qSubs: "الاشتراكات",
    feeBadge: "رسوم 1% فقط!",
  },
  ff: {
    aboutTitle: "E dow Bambeh",
    aboutDesc: "Suudu njiydi internet — soodu, yoɓ, wattindir e yiy golle, ko 1% tan njoɓdi.",
    categoriesTitle: "Teelte",
    jobs: "Golle", marketplace: "Suudu Njiydi", services: "Tiiɗe",
    rentals: "Njooɗam", vehicles: "Otooji", exchange: "Wattindirde",
    supportTitle: "Ballal",
    helpCentre: "Laaɓal Ballal", contactSupport: "Ɓanndital Ballal",
    safetySecurity: "Kisinaare", subscriptionPlans: "Sariyaaji Sooddi",
    supportBambeh: "Wallu Bambeh",
    companyTitle: "Sosirde",
    aboutUs: "E dow min", viewCompanyProfile: "Yiy gamgal sosirde",
    terms: "Sarɗiiji", privacy: "Sarɗi Gaasooji",
    allRightsReserved: "Hakke fof kuuɗi.",
    operatedBy: "Ardii e BAMBEH SARL",
    qTerms: "Sarɗiiji", qPrivacy: "Gaasooji", qContact: "Ɓanndital", qSubs: "Sooddi",
    feeBadge: "Ko 1% njoɓdi tan!",
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
                <span>Yaoundé, Cameroon</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-center md:text-left">
              <p>© {currentYear} Bambeh. {s.allRightsReserved}</p>
              <p className="text-xs text-gray-500 mt-1">{s.operatedBy} — Yaoundé, Cameroon</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/terms" className="hover:text-teal-400 transition-colors">{s.qTerms}</Link>
              <span className="text-gray-600">·</span>
              <Link to="/privacy" className="hover:text-teal-400 transition-colors">{s.qPrivacy}</Link>
              <span className="text-gray-600">·</span>
              <Link to="/help/contact" className="hover:text-teal-400 transition-colors">{s.qContact}</Link>
              <span className="text-gray-600">·</span>
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
