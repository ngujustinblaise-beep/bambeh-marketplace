// @ts-nocheck
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * HOME PAGE - BAMBEH MARKETPLACE (FULLY INTERNATIONALIZED)
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * âœ… Featured ads from marketplace (subscription-based)
 * âœ… Posted items appear on home page (localStorage method)
 * âœ… View count tracker on listings
 * âœ… Social sharing integration
 * âœ… All categories with beautiful layout
 * âœ… Special Features Hub â€” links to all Bambeh-exclusive pages
 * âœ… Recent Listings section (from localStorage)
 * âœ… FULL I18N: English, French, Pidgin, Arabic, Fulfulde (5 languages)
 *
 * Â© 2025â€“2026 Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
} from 'lucide-react';
import SocialShareButton from '@/components/social/SocialShareButton';
import { ListingImage } from '@/components/ui/BambehImage';
import { useLanguage } from "@/App";

// â”€â”€â”€ Translation Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HOME_T: Record<string, Record<string, string>> = {
  en: {
    "home.welcomePrefix": "Welcome to ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Online Marketplace",
    "home.feeMsg": "Only 1% Transaction Fee! â€” The lowest you will see online.",
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
    "home.seeAll": "See all â†’",
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
  },
  fr: {
    "home.welcomePrefix": "Bienvenue sur ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Place de marchÃ© en ligne",
    "home.feeMsg": "Seulement 1 % de frais de transaction ! â€” Les plus bas que vous trouverez en ligne.",
    "home.shareBtn": "Partager Bambeh avec des amis",
    "home.jobsTitle": "Emplois",
    "home.jobsDesc": "Trouvez votre prochaine opportunitÃ©",
    "home.marketplaceTitle": "MarchÃ©",
    "home.marketplaceDesc": "Acheter et vendre des articles",
    "home.servicesTitle": "Services",
    "home.servicesDesc": "Embaucher des professionnels",
    "home.rentalsTitle": "Locations",
    "home.rentalsDesc": "Trouvez votre prochain logement",
    "home.vehiclesTitle": "VÃ©hicules",
    "home.vehiclesDesc": "Voitures et motos",
    "home.exchangeTitle": "Ã‰change",
    "home.exchangeDesc": "Troquer des articles",
    "home.featuresHeading": "FonctionnalitÃ©s spÃ©ciales",
    "home.zermCoins": "PiÃ¨ces Zerm",
    "home.farmFresh": "Produits frais",
    "home.community": "CommunautÃ©",
    "home.groupBuying": "Achat collectif",
    "home.compareItems": "Comparer les articles",
    "home.bambehAI": "IA Bambeh",
    "home.flashDeals": "Offres Ã©clair",
    "home.njangi": "Njangi/Tontine",
    "home.meetSafely": "Rencontre sÃ©curisÃ©e",
    "home.escrow": "SÃ©questre",
    "home.recentPosted": "RÃ©cemment publiÃ©",
    "home.seeAll": "Voir tout â†’",
    "home.badgeFeatured": "Ã€ la une",
    "home.badgeUrgent": "Urgent",
    "home.typeExchange": "Ã‰change / Troc",
    "home.typeNegotiable": "NÃ©gociable",
    "home.typeItem": "article",
    "home.whyChoose": "Pourquoi choisir Bambeh ?",
    "home.whyFee": "Frais de transaction de 1 %",
    "home.whyFeeDesc": "Les frais les plus bas partout ! Seulement 1 % par transaction.",
    "home.whyEscrow": "SÃ©questre sÃ©curisÃ©",
    "home.whyEscrowDesc": "Votre argent est protÃ©gÃ© jusqu'Ã  la confirmation de la livraison.",
    "home.whyTracking": "Suivi en temps rÃ©el",
    "home.whyTrackingDesc": "Suivez vos commandes de l'achat Ã  la livraison.",
    "home.ctaTitle": "PrÃªt Ã  commencer ?",
    "home.ctaSubtitle": "Rejoignez des milliers d'utilisateurs achetant, vendant et troquant sur Bambeh !",
    "home.ctaShop": "Commencer les achats",
    "home.ctaSell": "Vendre un article",
    "home.timeJustNow": "Ã€ l'instant",
    "home.timeMinAgo": "Il y a {{m}} min",
    "home.timeHourAgo": "Il y a {{h}}h",
    "home.timeDayAgo": "Il y a {{d}}j",
    "home.viewSingular": "vue",
    "home.viewPlural": "vues",
  },
  ar: {
    "home.welcomePrefix": "Ø£Ù‡Ù„Ø§ ÙˆØ³Ù‡Ù„Ø§ Ø¨ ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Ø³ÙˆÙ‚ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ",
    "home.feeMsg": "ÙÙ‚Ø· Ø±Ø³ÙˆÙ… Ù…Ø¹Ø§Ù…Ù„Ø© Ø¨Ù†Ø³Ø¨Ø© 1 %! â€” Ø§Ù„Ø£Ù‚Ù„ Ø§Ù„Ø°ÙŠ Ø³ØªØ¬Ø¯Ù‡ Ø¹Ø¨Ø± Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª.",
    "home.shareBtn": "Ø´Ø§Ø±Ùƒ Bambeh Ù…Ø¹ Ø§Ù„Ø£ØµØ¯Ù‚Ø§Ø¡",
    "home.jobsTitle": "Ø§Ù„ÙˆØ¸Ø§Ø¦Ù",
    "home.jobsDesc": "Ø§Ø¨Ø­Ø« Ø¹Ù† ÙØ±ØµØªÙƒ Ø§Ù„ØªØ§Ù„ÙŠØ©",
    "home.marketplaceTitle": "Ø§Ù„Ø³ÙˆÙ‚",
    "home.marketplaceDesc": "Ø´Ø±Ø§Ø¡ ÙˆØ¨ÙŠØ¹ Ø§Ù„Ø¹Ù†Ø§ØµØ±",
    "home.servicesTitle": "Ø§Ù„Ø®Ø¯Ù…Ø§Øª",
    "home.servicesDesc": "Ø§Ø³ØªØ¦Ø¬Ø§Ø± Ø§Ù„Ù…Ø­ØªØ±ÙÙŠÙ†",
    "home.rentalsTitle": "Ø§Ù„Ø¥ÙŠØ¬Ø§Ø±Ø§Øª",
    "home.rentalsDesc": "Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ù†Ø²Ù„Ùƒ Ø§Ù„ØªØ§Ù„ÙŠ",
    "home.vehiclesTitle": "Ø§Ù„Ù…Ø±ÙƒØ¨Ø§Øª",
    "home.vehiclesDesc": "Ø§Ù„Ø³ÙŠØ§Ø±Ø§Øª ÙˆØ§Ù„Ø¯Ø±Ø§Ø¬Ø§Øª Ø§Ù„Ù†Ø§Ø±ÙŠØ©",
    "home.exchangeTitle": "Ø§Ù„Ù…Ù‚Ø§ÙŠØ¶Ø©",
    "home.exchangeDesc": "Ù…Ø¨Ø§Ø¯Ù„Ø© Ø§Ù„Ø¹Ù†Ø§ØµØ±",
    "home.featuresHeading": "Ù…ÙŠØ²Ø§Øª Ø®Ø§ØµØ©",
    "home.zermCoins": "Ø¹Ù…Ù„Ø§Øª Zerm",
    "home.farmFresh": "Ù…Ù†ØªØ¬Ø§Øª Ø·Ø§Ø²Ø©",
    "home.community": "Ø§Ù„Ù…Ø¬ØªÙ…Ø¹",
    "home.groupBuying": "Ø§Ù„Ø´Ø±Ø§Ø¡ Ø§Ù„Ø¬Ù…Ø§Ø¹ÙŠ",
    "home.compareItems": "Ù…Ù‚Ø§Ø±Ù†Ø© Ø§Ù„Ø¹Ù†Ø§ØµØ±",
    "home.bambehAI": "Ø°ÙƒØ§Ø¡ Bambeh Ø§Ù„ØµÙ†Ø§Ø¹ÙŠ",
    "home.flashDeals": "ØµÙÙ‚Ø§Øª Ø³Ø±ÙŠØ¹Ø©",
    "home.njangi": "Njangi/Tontine",
    "home.meetSafely": "Ù„Ù‚Ø§Ø¡ Ø¢Ù…Ù†",
    "home.escrow": "Ø§Ù„Ø¶Ù…Ø§Ù†",
    "home.recentPosted": "ØªÙ… Ù†Ø´Ø±Ù‡ Ù…Ø¤Ø®Ø±Ø§",
    "home.seeAll": "Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„ â†",
    "home.badgeFeatured": "Ù…Ù…ÙŠØ²",
    "home.badgeUrgent": "Ø¹Ø§Ø¬Ù„",
    "home.typeExchange": "Ù…Ù‚Ø§ÙŠØ¶Ø© / ØªØ¨Ø¯ÙŠÙ„",
    "home.typeNegotiable": "Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªÙØ§ÙˆØ¶",
    "home.typeItem": "Ø¹Ù†ØµØ±",
    "home.whyChoose": "Ù„Ù…Ø§Ø°Ø§ Ø§Ø®ØªÙŠØ§Ø± BambehØŸ",
    "home.whyFee": "Ø±Ø³ÙˆÙ… Ù…Ø¹Ø§Ù…Ù„Ø© Ø¨Ù†Ø³Ø¨Ø© 1Ùª",
    "home.whyFeeDesc": "Ø£Ù‚Ù„ Ø§Ù„Ø±Ø³ÙˆÙ… ÙÙŠ ÙƒÙ„ Ù…ÙƒØ§Ù†! ÙÙ‚Ø· 1Ùª Ù„ÙƒÙ„ Ù…Ø¹Ø§Ù…Ù„Ø©.",
    "home.whyEscrow": "Ø¶Ù…Ø§Ù† Ø¢Ù…Ù†",
    "home.whyEscrowDesc": "Ø£Ù…ÙˆØ§Ù„Ùƒ Ù…Ø­Ù…ÙŠØ© Ø­ØªÙ‰ ØªØ£ÙƒÙŠØ¯ Ø§Ù„ØªØ³Ù„ÙŠÙ….",
    "home.whyTracking": "ØªØªØ¨Ø¹ ÙÙŠ Ø§Ù„ÙˆÙ‚Øª Ø§Ù„ÙØ¹Ù„ÙŠ",
    "home.whyTrackingDesc": "ØªØ§Ø¨Ø¹ Ø·Ù„Ø¨Ø§ØªÙƒ Ù…Ù† Ø§Ù„Ø´Ø±Ø§Ø¡ Ø¥Ù„Ù‰ Ø§Ù„ØªØ³Ù„ÙŠÙ….",
    "home.ctaTitle": "Ù‡Ù„ Ø£Ù†Øª Ù…Ø³ØªØ¹Ø¯ Ù„Ù„Ø¨Ø¯Ø¡ØŸ",
    "home.ctaSubtitle": "Ø§Ù†Ø¶Ù… Ø¥Ù„Ù‰ Ø¢Ù„Ø§Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø°ÙŠÙ† ÙŠØ´ØªØ±ÙˆÙ† ÙˆÙŠØ¨ÙŠØ¹ÙˆÙ† ÙˆÙŠØªØ§Ø¬Ø±ÙˆÙ† Ø¹Ù„Ù‰ Bambeh!",
    "home.ctaShop": "Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªØ³ÙˆÙ‚",
    "home.ctaSell": "Ø¨ÙŠØ¹ Ø¹Ù†ØµØ±",
    "home.timeJustNow": "Ù„Ù„ØªÙˆ",
    "home.timeMinAgo": "Ù…Ù†Ø° {{m}} Ø¯Ù‚ÙŠÙ‚Ø©",
    "home.timeHourAgo": "Ù…Ù†Ø° {{h}} Ø³Ø§Ø¹Ø©",
    "home.timeDayAgo": "Ù…Ù†Ø° {{d}} ÙŠÙˆÙ…",
    "home.viewSingular": "Ø¹Ø±Ø¶",
    "home.viewPlural": "Ø¹Ø±ÙˆØ¶",
  },
  pidgin: {
    "home.welcomePrefix": "Welcome to ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Online Marketplace",
    "home.feeMsg": "Only 1% money charge! â€” The lowest wey you go see anywhere online.",
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
    "home.seeAll": "See all â†’",
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
  },
  ff: {
    "home.welcomePrefix": "Salamaleekum ",
    "home.welcomeSuffix": "Bambeh",
    "home.tagline": "Taako Janngo Online",
    "home.feeMsg": "Soo 1% ndiyam! â€” Ndiyam gadaa wey a dee gonngol online.",
    "home.shareBtn": "Jedd Bambeh e woot\u0257u",
    "home.jobsTitle": "Suudu",
    "home.jobsDesc": "Yiylo suudu mawngal",
    "home.marketplaceTitle": "Taako",
    "home.marketplaceDesc": "Windu\u0257e nde gummaa",
    "home.servicesTitle": "Dow\u0257e",
    "home.servicesDesc": "Jalaani leydi jogaaku",
    "home.rentalsTitle": "Luwaaji",
    "home.rentalsDesc": "Yiylo wuro mawngal",
    "home.vehiclesTitle": "Mootorji",
    "home.vehiclesDesc": "Finniye e motobare",
    "home.exchangeTitle": "Jayndu",
    "home.exchangeDesc": "Jayndu geÉ—iÉ—i",
    "home.featuresHeading": "Dow\u0257e Sifa",
    "home.zermCoins": "Zerm Coins",
    "home.farmFresh": "Jeema Koli",
    "home.community": "Joyi",
    "home.groupBuying": "Windu\u0257e Golol",
    "home.compareItems": "Danna GeÉ—iÉ—i",
    "home.bambehAI": "Bambeh AI",
    "home.flashDeals": "Taggal Cinnde",
    "home.njangi": "Njangi/Tontine",
    "home.meetSafely": "Haaltu Jibintirde",
    "home.escrow": "Jalaani",
    "home.recentPosted": "WinduÉ—i Gooto",
    "home.seeAll": "Yiylo fof â†’",
    "home.badgeFeatured": "Sifaa",
    "home.badgeUrgent": "Aray",
    "home.typeExchange": "Jayndu / RoÉ“aa",
    "home.typeNegotiable": "E ko yaajanda",
    "home.typeItem": "jeÉ—",
    "home.whyChoose": "Haa yidde Bambeh?",
    "home.whyFee": "1% Ndiyam",
    "home.whyFeeDesc": "Ndiyam gadaa dellal! Soo 1% ko taggal keÉ—.",
    "home.whyEscrow": "Jalaani Haaltu",
    "home.whyEscrowDesc": "Ndiyam\u0227a haaltu haa-to jam nde moto jiyaama.",
    "home.whyTracking": "Jibintirde Real-Time",
    "home.whyTrackingDesc": "Jib\u0257in taggal\u0227a haa-to jam jam nde moto jiyaama.",
    "home.ctaTitle": "A\u0259 jom hanwi?",
    "home.ctaSubtitle": "Lur\u0257u joguwe loowingol, gummingol, e roÉ“aaingol ngon Bambeh!",
    "home.ctaShop": "Hanwi windu\u0257e",
    "home.ctaSell": "Gummaa jeÉ—",
    "home.timeJustNow": "Gooto",
    "home.timeMinAgo": "Sekkere {{m}} ago",
    "home.timeHourAgo": "Lewru {{h}} ago",
    "home.timeDayAgo": "Joom {{d}} ago",
    "home.viewSingular": "yiylo",
    "home.viewPlural": "yiylo",
  },
};

// â”€â”€â”€ Language Normalization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const homeNormLang = (l: string): string => {
  l = String(l || 'en').toLowerCase();
  if (l.indexOf('fr') === 0) return 'fr';
  if (l.indexOf('ar') === 0) return 'ar';
  if (l === 'ff' || l.indexOf('ful') === 0) return 'ff';
  if (l === 'pcm' || l === 'pidgin') return 'pidgin';
  return 'en';
};

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface FeaturedAd {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subscriptionLevel: string;
  featured: boolean;
  posted: string;
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

export default function Home() {
  const { language } = useLanguage();
  const _rl = homeNormLang(language);
  const isRtl = _rl === "ar";
  
  // Translation helper
  const t = (k: string, o?: Record<string, any>) => {
    let v = ((HOME_T[_rl] || HOME_T.en)[k]) ?? HOME_T.en[k] ?? k;
    if (o) {
      for (const _p in o) v = v.split('{{' + _p + '}}').join(String(o[_p]));
    }
    return v;
  };

  const [featuredAds, setFeaturedAds] = useState<FeaturedAd[]>([]);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);

  // â”€â”€ Categories (translated names & descriptions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const categories = [
    { nameKey: 'home.jobsTitle', descKey: 'home.jobsDesc', icon: Briefcase,  link: '/jobs',        color: 'bg-blue-500'   },
    { nameKey: 'home.marketplaceTitle', descKey: 'home.marketplaceDesc', icon: ShoppingBag, link: '/marketplace', color: 'bg-green-500'  },
    { nameKey: 'home.servicesTitle', descKey: 'home.servicesDesc', icon: Wrench,      link: '/services',    color: 'bg-purple-500' },
    { nameKey: 'home.rentalsTitle', descKey: 'home.rentalsDesc', icon: HomeIcon,    link: '/rentals',     color: 'bg-orange-500' },
    { nameKey: 'home.vehiclesTitle', descKey: 'home.vehiclesDesc', icon: Car,         link: '/vehicles',    color: 'bg-red-500'    },
    { nameKey: 'home.exchangeTitle', descKey: 'home.exchangeDesc', icon: TrendingUp,  link: '/exchange',    color: 'bg-teal-500'   },
  ];

  // â”€â”€ Special Features tiles (translated labels) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const specialFeatures = [
    { labelKey: 'home.zermCoins',    link: '/coins',        emoji: 'âš¡', bg: 'bg-yellow-50',  text: 'text-yellow-800'  },
    { labelKey: 'home.farmFresh',    link: '/farm-fresh',   emoji: 'ðŸŒ¿', bg: 'bg-green-50',   text: 'text-green-800'   },
    { labelKey: 'home.community',     link: '/community',    emoji: 'ðŸ˜ï¸', bg: 'bg-teal-50',    text: 'text-teal-800'    },
    { labelKey: 'home.groupBuying',  link: '/group-buying', emoji: 'ðŸ‘¥', bg: 'bg-blue-50',    text: 'text-blue-800'    },
    { labelKey: 'home.compareItems', link: '/compare',      emoji: 'âš–ï¸', bg: 'bg-purple-50',  text: 'text-purple-800'  },
    { labelKey: 'home.bambehAI',     link: '/ai-chat',      emoji: 'ðŸ¤–', bg: 'bg-indigo-50',  text: 'text-indigo-800'  },
    { labelKey: 'home.flashDeals',   link: '/deals',        emoji: 'âš¡', bg: 'bg-yellow-50',  text: 'text-yellow-800'  },
    { labelKey: 'home.njangi',link: '/tontine',      emoji: 'ðŸ’°', bg: 'bg-amber-50',   text: 'text-amber-800'   },
    { labelKey: 'home.meetSafely',   link: '/meet-safely',  emoji: 'ðŸ›¡ï¸', bg: 'bg-sky-50',     text: 'text-sky-800'     },
    { labelKey: 'home.escrow',        link: '/escrow',       emoji: 'ðŸ”’', bg: 'bg-emerald-50', text: 'text-emerald-800' },
  ];

  useEffect(() => {
    // â”€â”€ Featured ads (mock â€” replace with Supabase in production) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    setFeaturedAds([
      { id: '1', title: 'iPhone 15 Pro Max - 256GB',  price: 850000,   location: 'Bastos, YaoundÃ©', category: 'Electronics', subscriptionLevel: 'platinum', featured: true, posted: '2 hours ago' },
      { id: '2', title: 'Toyota Camry 2020',           price: 15000000, location: 'Douala',          category: 'Vehicles',    subscriptionLevel: 'premium',  featured: true, posted: '5 hours ago' },
      { id: '3', title: '3 Bedroom Apartment',         price: 450000,   location: 'Bastos, YaoundÃ©', category: 'Rentals',     subscriptionLevel: 'platinum', featured: true, posted: '1 day ago'   },
    ]);

    // â”€â”€ Load recently posted listings from localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    } catch (e) {
      // silent fail
    }
  }, []);

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return t('home.timeJustNow');
    if (m < 60) return t('home.timeMinAgo', { m });
    const h = Math.floor(m / 60);
    if (h < 24) return t('home.timeHourAgo', { h });
    const d = Math.floor(h / 24);
    return t('home.timeDayAgo', { d });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">

        {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {t('home.welcomePrefix')}<span className="text-teal-600">{t('home.welcomeSuffix')}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">{t('home.tagline')}</p>
          <p className="text-lg text-gray-500">
            ðŸŽ‰ <span className="font-bold text-green-600">{t('home.feeMsg')}</span> ðŸ’š
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

        {/* â”€â”€ Special Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">âœ¨ {t('home.featuresHeading')}</h2>
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

        {/* â”€â”€ Featured Ads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {featuredAds.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">â­ Featured</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAds.map((ad) => (
                <Link
                  key={ad.id}
                  to={`/marketplace/${ad.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-teal-200" />
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold">â­ {t('home.badgeFeatured')}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{ad.title}</h3>
                    <p className="text-lg font-bold text-teal-600 mb-1">{Number(ad.price).toLocaleString()} XAF</p>
                    <p className="text-sm text-gray-500">{ad.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* â”€â”€ Recently Posted â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {recentListings.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">ðŸ†• {t('home.recentPosted')}</h2>
              <Link to="/marketplace" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">{t('home.seeAll')}</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={
                    listing.type === 'job'      ? `/jobs/${listing.id}` :
                    listing.type === 'vehicle'  ? `/vehicles/${listing.id}` :
                    listing.type === 'exchange' ? `/exchange/${listing.id}` :
                    listing.type === 'rental'   ? `/rentals/${listing.id}` :
                    listing.type === 'service'  ? `/services/${listing.id}` :
                    `/marketplace/${listing.id}`
                  }
                  className="bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className="relative h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center overflow-hidden">
                    {listing.primaryImage ? (
                      <ListingImage src={listing.primaryImage} alt={listing.title} width={320} height={144} imgClassName="group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <ShoppingBag className="w-14 h-14 text-teal-200 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {listing.featured && (
                        <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded">â­ {t('home.badgeFeatured')}</span>
                      )}
                      {listing.urgent && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">ðŸ”¥ {t('home.badgeUrgent')}</span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className={`px-2 py-0.5 text-white text-xs font-bold rounded capitalize ${
                        listing.type === 'vehicle'  ? 'bg-green-700'  :
                        listing.type === 'exchange' ? 'bg-purple-700' :
                        listing.type === 'rental'   ? 'bg-orange-600' :
                        listing.type === 'service'  ? 'bg-blue-600'   :
                        listing.type === 'job'      ? 'bg-indigo-600' :
                        'bg-teal-600'
                      }`}>{listing.type || t('home.typeItem')}</span>
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
                          <span className="font-bold text-purple-600 text-sm">ðŸ”„ {t('home.typeExchange')}</span>
                        ) : (
                          <>
                            <span className="font-bold text-teal-600 text-sm">{Number(listing.price).toLocaleString()} {listing.currency || 'XAF'}</span>
                            {listing.negotiable && <span className="ml-1 text-xs text-green-600">Â· {t('home.typeNegotiable')}</span>}
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

        {/* â”€â”€ Categories Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category) => (
            <Link
              key={category.nameKey}
              to={category.link}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
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

        {/* â”€â”€ Why Bambeh â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t('home.whyChoose')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">ðŸ’š</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.whyFee')}</h3>
              <p className="text-gray-600">{t('home.whyFeeDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">ðŸ”’</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.whyEscrow')}</h3>
              <p className="text-gray-600">{t('home.whyEscrowDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">ðŸ“¦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.whyTracking')}</h3>
              <p className="text-gray-600">{t('home.whyTrackingDesc')}</p>
            </div>
          </div>
        </div>

        {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-xl mb-8">{t('home.ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace" className="px-8 py-4 bg-white text-teal-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              {t('home.ctaShop')}
            </Link>
            <Link to="/marketplace/sell" className="px-8 py-4 bg-teal-700 text-white rounded-lg font-bold text-lg hover:bg-teal-800 transition-colors shadow-lg">
              {t('home.ctaSell')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// â”€â”€ ViewCount Sub-Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
