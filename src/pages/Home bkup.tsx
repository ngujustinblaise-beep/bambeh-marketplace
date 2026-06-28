// @ts-nocheck
/**
 * ---------------------------------------------------------------------------
 * HOME PAGE - BAMBEH MARKETPLACE (FULLY INTERNATIONALIZED)
 * ---------------------------------------------------------------------------
 *
 * Featured ads from marketplace
 * Posted items appear on home page (localStorage method)
 * View count tracker on listings
 * Social sharing integration
 * All categories with beautiful layout
 * Special Features Hub — links to all Bambeh-exclusive pages
 * Recent Listings section (from localStorage)
 * FULL I18N: English, French, Pidgin, Arabic, Fulfulde (5 languages)
 *
 * © 2025–2026 Bambeh. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  ShoppingBag,
  Wrench,
  Home as HomeIcon,
  Car,
  TrendingUp,
  MapPin,
  Share2,
  Clock,
  Eye,
  RefreshCcw,
  AlertCircle,
} from 'lucide-react';
import SocialShareButton from '@/components/social/SocialShareButton';
import { ListingImage } from '@/components/ui/BambehImage';
import { useLanguage } from "@/context/LanguageContext";

// --- Translation Table -----------------------------------------------------
const HOME_T: Record<string, Record<string, string>> = {
  en: {
    "home.welcomePrefix": "Welcome to ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Online Marketplace",
    "home.feeMsg": "Only 1% Transaction Fee! — The lowest you will see online.",
    "home.shareBtn": "Share Bambeh with Friends",
    "home.jobsTitle": "Jobs",
    "home.jobsDesc": "Find your next opportunity",
    "home.marketplaceTitle": "Marketplace",
    "home.marketplaceDesc": "Buy & sell items",
    "home.servicesTitle": "Services",
    "home.servicesDesc": "Hire professionals",
    "home.rentalsTitle": "Rentals",
    "home.rentalsDesc": "Find your next home",
    "home.vehiclesTitle": "Vehicles",
    "home.vehiclesDesc": "Cars & motorcycles",
    "home.exchangeTitle": "Exchange",
    "home.exchangeDesc": "Trade items",
    "home.featuresHeading": "Special Features",
    "home.zermCoins": "Zerm Coins",
    "home.farmFresh": "Farm Fresh",
    "home.community": "Community",
    "home.groupBuying": "Group Buying",
    "home.compareItems": "Compare Items",
    "home.bambehAI": "Bambeh AI",
    "home.flashDeals": "Flash Deals",
    "home.njangi": "Njangi/Tontine",
    "home.meetSafely": "Meet Safely",
    "home.escrow": "Escrow",
    "home.recentPosted": "Recently Posted",
    "home.seeAll": "See all",
    "home.badgeFeatured": "Featured",
    "home.badgeUrgent": "Urgent",
    "home.typeExchange": "Exchange / Trade",
    "home.typeNegotiable": "Negotiable",
    "home.typeItem": "item",
    "home.whyChoose": "Why Choose Bambeh?",
    "home.whyFee": "1% Transaction Fee",
    "home.whyFeeDesc": "Lowest fees anywhere! Only 1% per transaction.",
    "home.whyEscrow": "Secure Escrow",
    "home.whyEscrowDesc": "Your money is protected until delivery confirmation.",
    "home.whyTracking": "Real-Time Tracking",
    "home.whyTrackingDesc": "Track your orders from purchase to delivery.",
    "home.ctaTitle": "Ready to Get Started?",
    "home.ctaSubtitle": "Join thousands of users buying, selling, and trading on Bambeh!",
    "home.ctaShop": "Start Shopping",
    "home.ctaSell": "Sell an Item",
    "home.timeJustNow": "Just now",
    "home.timeMinAgo": "{{m}} min ago",
    "home.timeHourAgo": "{{h}}h ago",
    "home.timeDayAgo": "{{d}}d ago",
    "home.viewSingular": "view",
    "home.viewPlural": "views",
    "home.featuredLoading": "Loading featured ads...",
    "home.featuredErrorTitle": "Could not load featured ads",
    "home.featuredEmptyTitle": "No featured ads yet",
    "home.featuredEmptyDesc": "Featured ads will appear here when users post promoted listings.",
    "home.retry": "Retry",
  },
  fr: {
    "home.welcomePrefix": "Bienvenue sur ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Place de marché en ligne",
    "home.feeMsg": "Seulement 1 % de frais de transaction ! — Les plus bas que vous trouverez en ligne.",
    "home.shareBtn": "Partager Bambeh avec des amis",
    "home.jobsTitle": "Emplois",
    "home.jobsDesc": "Trouvez votre prochaine opportunité",
    "home.marketplaceTitle": "Marché",
    "home.marketplaceDesc": "Acheter et vendre des articles",
    "home.servicesTitle": "Services",
    "home.servicesDesc": "Embaucher des professionnels",
    "home.rentalsTitle": "Locations",
    "home.rentalsDesc": "Trouvez votre prochain logement",
    "home.vehiclesTitle": "Véhicules",
    "home.vehiclesDesc": "Voitures et motos",
    "home.exchangeTitle": "Échange",
    "home.exchangeDesc": "Troquer des articles",
    "home.featuresHeading": "Fonctionnalités spéciales",
    "home.zermCoins": "Pièces Zerm",
    "home.farmFresh": "Produits frais",
    "home.community": "Communauté",
    "home.groupBuying": "Achat collectif",
    "home.compareItems": "Comparer les articles",
    "home.bambehAI": "IA Bambeh",
    "home.flashDeals": "Offres éclair",
    "home.njangi": "Njangi/Tontine",
    "home.meetSafely": "Rencontre sécurisée",
    "home.escrow": "Séquestre",
    "home.recentPosted": "Récemment publié",
    "home.seeAll": "Voir tout",
    "home.badgeFeatured": "À la une",
    "home.badgeUrgent": "Urgent",
    "home.typeExchange": "Échange / Troc",
    "home.typeNegotiable": "Négociable",
    "home.typeItem": "article",
    "home.whyChoose": "Pourquoi choisir Bambeh ?",
    "home.whyFee": "Frais de transaction de 1 %",
    "home.whyFeeDesc": "Les frais les plus bas partout ! Seulement 1 % par transaction.",
    "home.whyEscrow": "Séquestre sécurisé",
    "home.whyEscrowDesc": "Votre argent est protégé jusqu'à la confirmation de la livraison.",
    "home.whyTracking": "Suivi en temps réel",
    "home.whyTrackingDesc": "Suivez vos commandes de l'achat à la livraison.",
    "home.ctaTitle": "Prêt à commencer ?",
    "home.ctaSubtitle": "Rejoignez des milliers d'utilisateurs achetant, vendant et troquant sur Bambeh !",
    "home.ctaShop": "Commencer les achats",
    "home.ctaSell": "Vendre un article",
    "home.timeJustNow": "À l'instant",
    "home.timeMinAgo": "Il y a {{m}} min",
    "home.timeHourAgo": "Il y a {{h}}h",
    "home.timeDayAgo": "Il y a {{d}}j",
    "home.viewSingular": "vue",
    "home.viewPlural": "vues",
    "home.featuredLoading": "Chargement des annonces mises en avant...",
    "home.featuredErrorTitle": "Impossible de charger les annonces mises en avant",
    "home.featuredEmptyTitle": "Aucune annonce mise en avant pour le moment",
    "home.featuredEmptyDesc": "Les annonces mises en avant s'afficheront ici lorsque les utilisateurs publieront des annonces sponsorisées.",
    "home.retry": "Réessayer",
  },
  ar: {
    "home.welcomePrefix": "مرحبًا بكم في ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "سوق إلكتروني",
    "home.feeMsg": "رسوم المعاملة 1% فقط! — من أقل الرسوم التي ستجدها عبر الإنترنت.",
    "home.shareBtn": "شارك Bambeh مع الأصدقاء",
    "home.jobsTitle": "الوظائف",
    "home.jobsDesc": "اعثر على فرصتك التالية",
    "home.marketplaceTitle": "السوق",
    "home.marketplaceDesc": "اشترِ وبِع المنتجات",
    "home.servicesTitle": "الخدمات",
    "home.servicesDesc": "استعن بمحترفين",
    "home.rentalsTitle": "الإيجارات",
    "home.rentalsDesc": "اعثر على منزلك التالي",
    "home.vehiclesTitle": "المركبات",
    "home.vehiclesDesc": "السيارات والدراجات النارية",
    "home.exchangeTitle": "المبادلة",
    "home.exchangeDesc": "تبادل المنتجات",
    "home.featuresHeading": "الميزات الخاصة",
    "home.zermCoins": "عملات Zerm",
    "home.farmFresh": "منتجات زراعية طازجة",
    "home.community": "المجتمع",
    "home.groupBuying": "الشراء الجماعي",
    "home.compareItems": "مقارنة المنتجات",
    "home.bambehAI": "Bambeh AI",
    "home.flashDeals": "عروض سريعة",
    "home.njangi": "نجانجي / تومبيني",
    "home.meetSafely": "التقابل بأمان",
    "home.escrow": "الضمان",
    "home.recentPosted": "أحدث المنشورات",
    "home.seeAll": "عرض الكل",
    "home.badgeFeatured": "مميز",
    "home.badgeUrgent": "عاجل",
    "home.typeExchange": "تبادل / مقايضة",
    "home.typeNegotiable": "قابل للتفاوض",
    "home.typeItem": "منتج",
    "home.whyChoose": "لماذا تختار Bambeh؟",
    "home.whyFee": "رسوم 1% فقط",
    "home.whyFeeDesc": "أقل رسوم في أي مكان! 1% فقط لكل معاملة.",
    "home.whyEscrow": "ضمان آمن",
    "home.whyEscrowDesc": "أموالك محمية حتى تأكيد التسليم.",
    "home.whyTracking": "تتبع لحظي",
    "home.whyTrackingDesc": "تابع طلبك من الشراء حتى التسليم.",
    "home.ctaTitle": "هل أنت مستعد للبدء؟",
    "home.ctaSubtitle": "انضم إلى آلاف المستخدمين الذين يشترون ويبيعون ويتبادلون على Bambeh!",
    "home.ctaShop": "ابدأ التسوق",
    "home.ctaSell": "اعرض منتجًا",
    "home.timeJustNow": "الآن",
    "home.timeMinAgo": "منذ {{m}} دقيقة",
    "home.timeHourAgo": "منذ {{h}} ساعة",
    "home.timeDayAgo": "منذ {{d}} يوم",
    "home.viewSingular": "مشاهدة",
    "home.viewPlural": "مشاهدات",
    "home.featuredLoading": "جارٍ تحميل الإعلانات المميزة...",
    "home.featuredErrorTitle": "تعذر تحميل الإعلانات المميزة",
    "home.featuredEmptyTitle": "لا توجد إعلانات مميزة بعد",
    "home.featuredEmptyDesc": "ستظهر الإعلانات المميزة هنا عندما ينشر المستخدمون إعلانات مدفوعة.",
    "home.retry": "إعادة المحاولة",
  },
  pidgin: {
    "home.welcomePrefix": "Welcome to ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Online Marketplace",
    "home.feeMsg": "Only 1% money charge! — The lowest wey you go see anywhere online.",
    "home.shareBtn": "Share Bambeh with your friends dem",
    "home.jobsTitle": "Work",
    "home.jobsDesc": "Find your next work opportunity",
    "home.marketplaceTitle": "Marketplace",
    "home.marketplaceDesc": "Buy and sell things",
    "home.servicesTitle": "Services",
    "home.servicesDesc": "Hire person wey get skill",
    "home.rentalsTitle": "Rentals",
    "home.rentalsDesc": "Find your next house for rent",
    "home.vehiclesTitle": "Vehicles",
    "home.vehiclesDesc": "Cars and bikes",
    "home.exchangeTitle": "Exchange",
    "home.exchangeDesc": "Swap your things",
    "home.featuresHeading": "Special Things We Get",
    "home.zermCoins": "Zerm Coins",
    "home.farmFresh": "Farm Fresh",
    "home.community": "Community",
    "home.groupBuying": "Group Buying",
    "home.compareItems": "Compare Things",
    "home.bambehAI": "Bambeh AI",
    "home.flashDeals": "Flash Deals",
    "home.njangi": "Njangi/Tontine",
    "home.meetSafely": "Meet Safe",
    "home.escrow": "Escrow",
    "home.recentPosted": "Recently Posted",
    "home.seeAll": "See all",
    "home.badgeFeatured": "Featured",
    "home.badgeUrgent": "Urgent",
    "home.typeExchange": "Exchange / Swap",
    "home.typeNegotiable": "E get room to negotiate",
    "home.typeItem": "thing",
    "home.whyChoose": "Why you go choose Bambeh?",
    "home.whyFee": "1% Money Charge",
    "home.whyFeeDesc": "The lowest money charge anywhere! Only 1% for every transaction.",
    "home.whyEscrow": "Safe Money Holding",
    "home.whyEscrowDesc": "Your money safe until person confirm say e don arrive.",
    "home.whyTracking": "Real-Time Tracking",
    "home.whyTrackingDesc": "Follow your order from when you buy until person deliver am.",
    "home.ctaTitle": "You ready to start?",
    "home.ctaSubtitle": "Join plenty people wey dey buy, sell, and swap things on Bambeh!",
    "home.ctaShop": "Start shopping",
    "home.ctaSell": "Sell something",
    "home.timeJustNow": "Just now",
    "home.timeMinAgo": "{{m}} min ago",
    "home.timeHourAgo": "{{h}}h ago",
    "home.timeDayAgo": "{{d}}d ago",
    "home.viewSingular": "view",
    "home.viewPlural": "views",
    "home.featuredLoading": "Loading featured ads...",
    "home.featuredErrorTitle": "Could not load featured ads",
    "home.featuredEmptyTitle": "No featured ads yet",
    "home.featuredEmptyDesc": "Featured ads go show here when users post promoted listings.",
    "home.retry": "Retry",
  },
  ff: {
    "home.welcomePrefix": "On jaraama e ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Taakol Ndeenal Online",
    "home.feeMsg": "Hakkunde 1% suudu! — Ko woɗi e jamtannde moƴƴere online.",
    "home.shareBtn": "Parti Bambeh e rewɓe maa",
    "home.jobsTitle": "Liggey",
    "home.jobsDesc": "Yiylo liggey maa fuɗɗo",
    "home.marketplaceTitle": "Taakol",
    "home.marketplaceDesc": "Jaɓ e waɗde e sonndu",
    "home.servicesTitle": "Ceeɗtugol",
    "home.servicesDesc": "Woto yimɓe ñiiɓɓe",
    "home.rentalsTitle": "Cuɓoraaɗe",
    "home.rentalsDesc": "Yiylo suudu maa fuɗɗo",
    "home.vehiclesTitle": "Kaaru",
    "home.vehiclesDesc": "Kaaru e moto",
    "home.exchangeTitle": "Paalagol",
    "home.exchangeDesc": "Soppito ɓeyngu maa",
    "home.featuresHeading": "Kadi Dollaaji",
    "home.zermCoins": "Zerm Coins",
    "home.farmFresh": "Golle Maayo Caahu",
    "home.community": "Jamaa",
    "home.groupBuying": "Alaaɗe Hokkugol",
    "home.compareItems": "Wiiro Dollaaji",
    "home.bambehAI": "Bambeh AI",
    "home.flashDeals": "Saɗe Yaɗe",
    "home.njangi": "Njangi/Tontine",
    "home.meetSafely": "Renndo e hotoore",
    "home.escrow": "Daɓɓital",
    "home.recentPosted": "Coɓɓi fuɗɗi",
    "home.seeAll": "Yiɗo fof",
    "home.badgeFeatured": "Moƴƴi",
    "home.badgeUrgent": "Humpito",
    "home.typeExchange": "Paalagol / Soppitol",
    "home.typeNegotiable": "Maa waawaa soppude",
    "home.typeItem": "ɗemngal",
    "home.whyChoose": "Ko honɗun waɗi no foti Bambeh?",
    "home.whyFee": "Hakkunde 1% tan",
    "home.whyFeeDesc": "Hakkunde ɗo woɗi ɗii! 1% tan e kala muuma.",
    "home.whyEscrow": "Daɓɓital hotoore",
    "home.whyEscrowDesc": "Humpito maa wurtata haa nde arɗo feewi.",
    "home.whyTracking": "Rewtere e jam",
    "home.whyTrackingDesc": "Rewtu muumde maa fotde e ceede haa nder.",
    "home.ctaTitle": "A waawi fuɗɗude?",
    "home.ctaSubtitle": "Lanja e junuɓe yimɓe ɗiiyata, njiɗata, e soppitata e Bambeh!",
    "home.ctaShop": "Fuɗɗo soodde",
    "home.ctaSell": "Faalay ɗemngal",
    "home.timeJustNow": "Jooni tan",
    "home.timeMinAgo": "{{m}} min ago",
    "home.timeHourAgo": "{{h}}h ago",
    "home.timeDayAgo": "{{d}}d ago",
    "home.viewSingular": "yiylo",
    "home.viewPlural": "yiylo",
    "home.featuredLoading": "Loading featured ads...",
    "home.featuredErrorTitle": "Could not load featured ads",
    "home.featuredEmptyTitle": "No featured ads yet",
    "home.featuredEmptyDesc": "Featured ads go show here when users post promoted listings.",
    "home.retry": "Retry",
  },
};

// --- Language Normalization -----------------------------------------------
const homeNormLang = (l: string): string => {
  l = String(l || 'en').toLowerCase();
  if (l.indexOf('fr') === 0) return 'fr';
  if (l.indexOf('ar') === 0) return 'ar';
  if (l === 'ff' || l.indexOf('ful') === 0) return 'ff';
  if (l === 'pcm' || l === 'pidgin') return 'pidgin';
  return 'en';
};

// --- Types ----------------------------------------------------------------
interface FeaturedAd {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subscriptionLevel?: string;
  featured?: boolean;
  posted?: string;
  primaryImage?: string;
}

interface RecentListing {
  id: string | number;
  type?: string;
  title: string;
  price: number;
  currency?: string;
  location?: string;
  category?: string;
  primaryImage?: string;
  featured?: boolean;
  urgent?: boolean;
  negotiable?: boolean;
  condition?: string;
  createdAt: string;
  expiresAt?: string;
}

type FeaturedState = {
  loading: boolean;
  error: string | null;
  items: FeaturedAd[];
};

export default function Home() {
  const { language } = useLanguage();
  const _rl = homeNormLang(language);
  const isRtl = _rl === "ar";

  const t = (k: string, o?: Record<string, any>) => {
    let v = ((HOME_T[_rl] || HOME_T.en)[k]) ?? HOME_T.en[k] ?? k;
    if (o) {
      for (const _p in o) v = v.split('{{' + _p + '}}').join(String(o[_p]));
    }
    return v;
  };

  const [featuredState, setFeaturedState] = useState<FeaturedState>({
    loading: true,
    error: null,
    items: [],
  });
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);

  const categories = [
    { nameKey: 'home.jobsTitle', descKey: 'home.jobsDesc', icon: Briefcase, link: '/jobs', color: 'bg-blue-500' },
    { nameKey: 'home.marketplaceTitle', descKey: 'home.marketplaceDesc', icon: ShoppingBag, link: '/marketplace', color: 'bg-green-500' },
    { nameKey: 'home.servicesTitle', descKey: 'home.servicesDesc', icon: Wrench, link: '/services', color: 'bg-purple-500' },
    { nameKey: 'home.rentalsTitle', descKey: 'home.rentalsDesc', icon: HomeIcon, link: '/rentals', color: 'bg-orange-500' },
    { nameKey: 'home.vehiclesTitle', descKey: 'home.vehiclesDesc', icon: Car, link: '/vehicles', color: 'bg-red-500' },
    { nameKey: 'home.exchangeTitle', descKey: 'home.exchangeDesc', icon: TrendingUp, link: '/exchange', color: 'bg-teal-500' },
  ];

  const specialFeatures = [
    { labelKey: 'home.zermCoins', link: '/coins', emoji: '💰', bg: 'bg-yellow-50', text: 'text-yellow-800' },
    { labelKey: 'home.farmFresh', link: '/farm-fresh', emoji: '🌿', bg: 'bg-green-50', text: 'text-green-800' },
    { labelKey: 'home.community', link: '/community', emoji: '👥', bg: 'bg-teal-50', text: 'text-teal-800' },
    { labelKey: 'home.groupBuying', link: '/group-buying', emoji: '🛒', bg: 'bg-blue-50', text: 'text-blue-800' },
    { labelKey: 'home.compareItems', link: '/compare', emoji: '⚖️', bg: 'bg-purple-50', text: 'text-purple-800' },
    { labelKey: 'home.bambehAI', link: '/ai-chat', emoji: '🤖', bg: 'bg-indigo-50', text: 'text-indigo-800' },
    { labelKey: 'home.flashDeals', link: '/deals', emoji: '⚡', bg: 'bg-yellow-50', text: 'text-yellow-800' },
    { labelKey: 'home.njangi', link: '/tontine', emoji: '🤝', bg: 'bg-amber-50', text: 'text-amber-800' },
    { labelKey: 'home.meetSafely', link: '/meet-safely', emoji: '🛡️', bg: 'bg-sky-50', text: 'text-sky-800' },
    { labelKey: 'home.escrow', link: '/escrow', emoji: '🔒', bg: 'bg-emerald-50', text: 'text-emerald-800' },
  ];

  const loadFeaturedAds = async (signal?: AbortSignal) => {
    setFeaturedState({ loading: true, error: null, items: [] });
    try {
      const res = await fetch('/api/featured-ads', { signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setFeaturedState({ loading: false, error: null, items });
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setFeaturedState({
        loading: false,
        error: err?.message || 'Failed to load featured ads',
        items: [],
      });
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadFeaturedAds(controller.signal);

    try {
      const stored = localStorage.getItem('Bambeh_listings');
      if (stored) {
        const listings: RecentListing[] = JSON.parse(stored);
        const now = Date.now();
        const active = listings.filter(l => {
          if (l.expiresAt && new Date(l.expiresAt).getTime() < now) return false;
          return true;
        });
        setRecentListings(active.slice(0, 10));
      }
    } catch (e) {}

    return () => controller.abort();
  }, []);

  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t('home.timeJustNow');
    if (m < 60) return t('home.timeMinAgo', { m });
    const h = Math.floor(m / 60);
    if (h < 24) return t('home.timeHourAgo', { h });
    const d = Math.floor(h / 24);
    return t('home.timeDayAgo', { d });
  };

  const featuredLoading = featuredState.loading;
  const featuredError = featuredState.error;
  const featuredAds = featuredState.items;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {t('home.welcomePrefix')}<span className="text-teal-600">{t('home.welcomeSuffix')}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">{t('home.tagline')}</p>
          <p className="text-lg text-gray-500">
            <span className="font-bold text-green-600">{t('home.feeMsg')}</span>
          </p>

          <div className="mt-6">
            <SocialShareButton
              title="Bambeh - Online Marketplace"
              description="Join thousands buying, selling, and trading on Bambeh with only 1% transaction fee!"
              itemType="app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Share2 className="w-5 h-5" />
              {t('home.shareBtn')}
            </SocialShareButton>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('home.featuresHeading')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {specialFeatures.map((feature) => (
              <Link
                key={feature.labelKey}
                to={feature.link}
                className={`${feature.bg} ${feature.text} rounded-xl p-4 text-center hover:shadow-md transition-all duration-200`}
              >
                <div className="text-2xl mb-2">{feature.emoji}</div>
                <p className="text-xs sm:text-sm font-semibold line-clamp-2">{t(feature.labelKey)}</p>
              </Link>
            ))}
          </div>
        </div>

        <section className="mb-16" aria-busy={featuredLoading ? 'true' : 'false'}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
            {featuredLoading && (
              <span className="text-sm text-gray-500">{t('home.featuredLoading')}</span>
            )}
          </div>

          {featuredLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-live="polite">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!featuredLoading && featuredError && (
            <div className="bg-white rounded-xl shadow p-6 border border-red-200" role="alert">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">{t('home.featuredErrorTitle')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{featuredError}</p>
                  <button
                    type="button"
                    onClick={() => loadFeaturedAds()}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {t('home.retry')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!featuredLoading && !featuredError && featuredAds.length === 0 && (
            <div className="bg-white rounded-xl shadow p-6" role="status" aria-live="polite">
              <h3 className="font-semibold text-gray-900">{t('home.featuredEmptyTitle')}</h3>
              <p className="text-sm text-gray-600 mt-1">{t('home.featuredEmptyDesc')}</p>
            </div>
          )}

          {!featuredLoading && !featuredError && featuredAds.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAds.map((ad) => (
                <Link
                  key={ad.id}
                  to={`/marketplace/${ad.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label={`${ad.title}, ${ad.location}, ${ad.category}`}
                >
                  <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                    {ad.primaryImage ? (
                      <ListingImage src={ad.primaryImage} alt={ad.title} width={400} height={192} />
                    ) : (
                      <ShoppingBag className="w-16 h-16 text-teal-200" />
                    )}
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold">
                      {t('home.badgeFeatured')}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{ad.title}</h3>
                    <p className="text-lg font-bold text-teal-600 mb-1">{Number(ad.price).toLocaleString()} XAF</p>
                    <p className="text-sm text-gray-500">{ad.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {recentListings.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('home.recentPosted')}</h2>
              <Link to="/marketplace" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">{t('home.seeAll')}</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={
                    listing.type === 'job' ? `/jobs/${listing.id}` :
                    listing.type === 'vehicle' ? `/vehicles/${listing.id}` :
                    listing.type === 'exchange' ? `/exchange/${listing.id}` :
                    listing.type === 'rental' ? `/rentals/${listing.id}` :
                    listing.type === 'service' ? `/services/${listing.id}` :
                    `/marketplace/${listing.id}`
                  }
                  className="bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden group focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <div className="relative h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center overflow-hidden">
                    {listing.primaryImage ? (
                      <ListingImage src={listing.primaryImage} alt={listing.title} width={320} height={144} imgClassName="group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <ShoppingBag className="w-14 h-14 text-teal-200 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {listing.featured && (
                        <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded">{t('home.badgeFeatured')}</span>
                      )}
                      {listing.urgent && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">{t('home.badgeUrgent')}</span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className={`px-2 py-0.5 text-white text-xs font-bold rounded capitalize ${
                        listing.type === 'vehicle' ? 'bg-green-700' :
                        listing.type === 'exchange' ? 'bg-purple-700' :
                        listing.type === 'rental' ? 'bg-orange-600' :
                        listing.type === 'service' ? 'bg-blue-600' :
                        listing.type === 'job' ? 'bg-indigo-600' :
                        'bg-teal-600'
                      }`}>
                        {listing.type || t('home.typeItem')}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{listing.title}</h3>
                    {listing.location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" />{listing.location}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        {listing.type === 'exchange' ? (
                          <span className="font-bold text-purple-600 text-sm">{t('home.typeExchange')}</span>
                        ) : (
                          <>
                            <span className="font-bold text-teal-600 text-sm">{Number(listing.price).toLocaleString()} {listing.currency || 'XAF'}</span>
                            {listing.negotiable && <span className="ml-1 text-xs text-green-600">· {t('home.typeNegotiable')}</span>}
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{timeAgo(listing.createdAt)}
                      </span>
                    </div>
                    <ViewCount listingId={String(listing.id)} t={t} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category) => (
            <Link
              key={category.nameKey}
              to={category.link}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <div className="p-8">
                <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t(category.nameKey)}</h3>
                <p className="text-gray-600">{t(category.descKey)}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t('home.whyChoose')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💸</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.whyFee')}</h3>
              <p className="text-gray-600">{t('home.whyFeeDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.whyEscrow')}</h3>
              <p className="text-gray-600">{t('home.whyEscrowDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.whyTracking')}</h3>
              <p className="text-gray-600">{t('home.whyTrackingDesc')}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-xl mb-8">{t('home.ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace" className="px-8 py-4 bg-white text-teal-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-white">
              {t('home.ctaShop')}
            </Link>
            <Link to="/marketplace/sell" className="px-8 py-4 bg-teal-700 text-white rounded-lg font-bold text-lg hover:bg-teal-800 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-white">
              {t('home.ctaSell')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewCount({ listingId, t }: { listingId: string; t: (k: string) => string }) {
  const key = `Bambeh_views_${listingId}`;
  const count = parseInt(localStorage.getItem(key) || '0');
  if (count === 0) return null;
  return (
    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
      <Eye className="w-3 h-3" />{count} {count === 1 ? t('home.viewSingular') : t('home.viewPlural')}
    </p>
  );
}	