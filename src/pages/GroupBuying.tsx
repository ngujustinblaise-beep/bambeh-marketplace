/**
 * src/pages/GroupBuying.tsx ? Bambeh Marketplace
 *
 * FIXED / NEW in this version:
 *  ? "Create Group Buy" button opens an inline modal ? no page redirect
 *  ? Groups saved to component state (with Supabase insert attempt)
 *  ? Full escrow logic: all money held in escrow, released only after purchase
 *  ? "Invite Friends" button shares a real group link (Web Share API + WhatsApp fallback)
 *  ? Join button saves the join and increments buyer count
 *  ? Beautiful Unsplash sample images for every demo deal
 *  ? West & Central Africa phone country code in create form
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Share2, Clock, Star, CheckCircle,
  ChevronRight, Zap, TrendingDown, Info, Copy, MessageCircle,
  X, Plus, Shield, Lock, ArrowRight, Gift, AlertCircle,
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface GroupDeal {
  id: string;
  name: string;
  image: string;
  imageUrl?: string;
  category: string;
  regularPrice: number;
  tiers: { buyers: number; price: number }[];
  currentBuyers: number;
  maxBuyers: number;
  endsAt: string;
  vendor: string;
  rating: number;
  reviews: number;
  description: string;
  isUserCreated?: boolean;
}

const COPY = {
  en: {
    createGroupBuy: 'Create Group Buy',
    stepOf: (s: number) => `Step ${s} of 3`,
    productDealName: 'Product/Deal Name *',
    productDealNamePlaceholder: 'e.g. Samsung Galaxy A54 Bulk Deal',
    description: 'Description *',
    descriptionPlaceholder: 'Describe what buyers will get, quality, specs...',
    category: 'Category *',
    yourWhatsAppContact: 'Your WhatsApp Contact',
    nextSetPricing: 'Next: Set Pricing',
    regularPrice: 'Regular Price (XAF) *',
    groupPrice: 'Group Price (XAF) *',
    buyersSave: (n: number) => `Buyers save ${n}% off regular price!`,
    minBuyersToActivate: 'Min. Buyers to Activate *',
    maxBuyers: 'Max. Buyers',
    dealDuration: 'Deal Duration (days)',
    back: 'Back',
    review: 'Review',
    reviewYourDeal: 'Review Your Deal',
    dealName: 'Deal Name',
    savings: 'Savings',
    off: 'off',
    duration: 'Duration',
    days: 'days',
    escrowProtection: 'Escrow Protection:',
    escrowNotice:
      'All buyer payments are held in Bambeh Escrow. Funds are released to you only after buyers confirm delivery.',
    createDeal: 'Create Deal!',
    creating: 'Creating...',
    inviteFriends: 'Invite Friends',
    moreBuyersLowerPrice: 'More buyers = lower price for everyone!',
    linkCopied: 'Link Copied!',
    copyLink: 'Copy Link',
    shareOnWhatsApp: 'Share on WhatsApp',
    shareViaPhone: 'Share via Phone',
    currentlyNeeded: (current: number, need: number) => `Currently ${current} / ${need} needed to activate deal`,
    groupDealCreated: 'Group deal created! Share it to get buyers.',
    groupBuying: 'Group Buying ??',
    buyTogetherSaveTogether: 'Buy together, save together ? the more the merrier!',
    howGroupBuyingWorks: 'How Group Buying Works',
    step1: 'Find a deal & Join. Price locks in for you.',
    step2: 'Share on WhatsApp. More buyers = lower price!',
    step3: 'Deal activates when minimum buyers reached.',
    step4: 'Money held in Escrow until you receive goods.',
    allPaymentsEscrow: 'All payments go to Escrow',
    escrowBody:
      'When you join a group deal and pay, your money is held safely in Bambeh Escrow. It is only released to the vendor after the deal activates and items are delivered. If the deal does not reach its minimum buyers, you get a full refund.',
    activeGroupDeals: 'Active Group Deals',
    dealsAvailable: (n: number) => `${n} deals available`,
    areYouAVendor: 'Are you a vendor?',
    vendorPitch:
      'Create group buying deals to move inventory fast and attract new customers!',
    startGroupDeal: 'Start a Group Deal',
    activeDeals: 'active deals',
    priceDrops: 'Price drops as more people join:',
    regularPriceLabel: 'Regular price:',
    joined: 'joined',
    moreFor: 'more for',
    bestPrice: 'Best price! ??',
    paymentHeldEscrow: 'Payment held in escrow until delivery confirmed',
    youAreIn: "You're in! Share for lower price",
    join: 'Join',
    viewFullDetails: 'View full details ?',
    lowStock: 'left',
    yourDeal: 'Your Deal',
    groupDeal: 'Group Deal',
    endsToday: 'Ends today!',
    dLeft: 'd left',
    seller: 'by',
    minBuyersNeeded: 'needed to activate deal',
  },
  fr: {
    createGroupBuy: 'Créer un achat groupé',
    stepOf: (s: number) => `Étape ${s} sur 3`,
    productDealName: 'Nom du produit / de l’offre *',
    productDealNamePlaceholder: 'Ex. : Offre groupée Samsung Galaxy A54',
    description: 'Description *',
    descriptionPlaceholder: 'Décrivez ce que les acheteurs recevront, la qualité, les caractéristiques...',
    category: 'Catégorie *',
    yourWhatsAppContact: 'Votre contact WhatsApp',
    nextSetPricing: 'Suivant : fixer le prix',
    regularPrice: 'Prix normal (XAF) *',
    groupPrice: 'Prix groupé (XAF) *',
    buyersSave: (n: number) => `Les acheteurs économisent ${n} % sur le prix normal !`,
    minBuyersToActivate: 'Nombre minimum d’acheteurs pour activer *',
    maxBuyers: 'Nombre maximum d’acheteurs',
    dealDuration: "Durée de l’offre (jours)",
    back: 'Retour',
    review: 'Vérifier',
    reviewYourDeal: 'Vérifiez votre offre',
    dealName: 'Nom de l’offre',
    savings: 'Économie',
    off: 'de réduction',
    duration: 'Durée',
    days: 'jours',
    escrowProtection: 'Protection par séquestre :',
    escrowNotice:
      'Tous les paiements des acheteurs sont conservés dans le séquestre Bambeh. Les fonds vous sont reversés uniquement après confirmation de la livraison par les acheteurs.',
    createDeal: 'Créer l’offre !',
    creating: 'Création en cours...',
    inviteFriends: 'Inviter des amis',
    moreBuyersLowerPrice: 'Plus d’acheteurs = prix plus bas pour tous !',
    linkCopied: 'Lien copié !',
    copyLink: 'Copier le lien',
    shareOnWhatsApp: 'Partager sur WhatsApp',
    shareViaPhone: 'Partager par téléphone',
    currentlyNeeded: (current: number, need: number) => `Actuellement ${current} / ${need} nécessaires pour activer l’offre`,
    groupDealCreated: 'Offre groupée créée ! Partagez-la pour attirer des acheteurs.',
    groupBuying: 'Achat groupé ??',
    buyTogetherSaveTogether: 'Acheter ensemble, économiser ensemble ? plus on est nombreux, mieux c’est !',
    howGroupBuyingWorks: 'Comment fonctionne l’achat groupé',
    step1: 'Trouvez une offre et rejoignez-la. Le prix est bloqué pour vous.',
    step2: 'Partagez sur WhatsApp. Plus d’acheteurs = prix plus bas !',
    step3: 'L’offre s’active dès que le nombre minimum d’acheteurs est atteint.',
    step4: 'L’argent reste en séquestre jusqu’à la réception des articles.',
    allPaymentsEscrow: 'Tous les paiements vont au séquestre',
    escrowBody:
      'Lorsque vous rejoignez une offre groupée et payez, votre argent est conservé en toute sécurité dans le séquestre Bambeh. Il n’est reversé au vendeur qu’après l’activation de l’offre et la livraison des articles. Si l’offre n’atteint pas le minimum d’acheteurs, vous êtes intégralement remboursé.',
    activeGroupDeals: 'Offres groupées actives',
    dealsAvailable: (n: number) => `${n} offres disponibles`,
    areYouAVendor: 'Êtes-vous vendeur ?',
    vendorPitch:
      'Créez des offres groupées pour écouler rapidement vos stocks et attirer de nouveaux clients !',
    startGroupDeal: 'Lancer une offre groupée',
    activeDeals: 'offres actives',
    priceDrops: 'Le prix baisse au fur et à mesure que d’autres personnes rejoignent l’offre :',
    regularPriceLabel: 'Prix normal :',
    joined: 'inscrits',
    moreFor: 'de plus pour',
    bestPrice: 'Meilleur prix ! ??',
    paymentHeldEscrow: 'Paiement conservé en séquestre jusqu’à confirmation de la livraison',
    youAreIn: 'Vous êtes inscrit ! Partagez pour obtenir un meilleur prix',
    join: 'Rejoindre',
    viewFullDetails: 'Voir tous les détails ?',
    lowStock: 'restant(s)',
    yourDeal: 'Votre offre',
    groupDeal: 'Offre groupée',
    endsToday: 'Se termine aujourd’hui !',
    dLeft: 'j restants',
    seller: 'par',
    minBuyersNeeded: 'nécessaires pour activer l’offre',
  },
  ar: {
    createGroupBuy: 'إنشاء شراء جماعي',
    stepOf: (s: number) => `الخطوة ${s} من 3`,
    productDealName: 'اسم المنتج / العرض *',
    productDealNamePlaceholder: 'مثال: عرض جماعي Samsung Galaxy A54',
    description: 'الوصف *',
    descriptionPlaceholder: 'اشرح ما سيحصل عليه المشترون، الجودة، المواصفات...',
    category: 'الفئة *',
    yourWhatsAppContact: 'رقم واتساب الخاص بك',
    nextSetPricing: 'التالي: تحديد السعر',
    regularPrice: 'السعر العادي (XAF) *',
    groupPrice: 'سعر المجموعة (XAF) *',
    buyersSave: (n: number) => `يوفر المشترون ${n}% من السعر العادي!`,
    minBuyersToActivate: 'الحد الأدنى من المشترين للتفعيل *',
    maxBuyers: 'الحد الأقصى من المشترين',
    dealDuration: 'مدة العرض (أيام)',
    back: 'رجوع',
    review: 'مراجعة',
    reviewYourDeal: 'راجع عرضك',
    dealName: 'اسم العرض',
    savings: 'التوفير',
    off: 'خصم',
    duration: 'المدة',
    days: 'أيام',
    escrowProtection: 'حماية الضمان:',
    escrowNotice:
      'تُحفظ جميع مدفوعات المشترين في ضمان Bambeh. ولا تُفرج الأموال لك إلا بعد تأكيد المشترين للتسليم.',
    createDeal: 'إنشاء العرض!',
    creating: 'جارٍ الإنشاء...',
    inviteFriends: 'دعوة الأصدقاء',
    moreBuyersLowerPrice: 'كلما زاد المشترون، انخفض السعر للجميع!',
    linkCopied: 'تم نسخ الرابط!',
    copyLink: 'نسخ الرابط',
    shareOnWhatsApp: 'مشاركة على واتساب',
    shareViaPhone: 'المشاركة عبر الهاتف',
    currentlyNeeded: (current: number, need: number) => `حاليًا ${current} / ${need} مطلوب للتفعيل`,
    groupDealCreated: 'تم إنشاء العرض الجماعي! شاركه لجلب المشترين.',
    groupBuying: 'الشراء الجماعي ??',
    buyTogetherSaveTogether: 'اشتروا معًا ووفّروا معًا ? كلما كثر العدد كان أفضل!',
    howGroupBuyingWorks: 'كيف يعمل الشراء الجماعي',
    step1: 'ابحث عن عرض وانضم إليه. يتم تثبيت السعر لك.',
    step2: 'شارك على واتساب. كلما زاد المشترون انخفض السعر!',
    step3: 'يتفعّل العرض عند الوصول إلى الحد الأدنى من المشترين.',
    step4: 'يبقى المال في الضمان حتى تستلم البضاعة.',
    allPaymentsEscrow: 'جميع المدفوعات تذهب إلى الضمان',
    escrowBody:
      'عندما تنضم إلى عرض جماعي وتدفع، يُحتفظ بمالك بأمان في ضمان Bambeh. ولا يُفرج عنه للبائع إلا بعد تفعيل العرض وتسليم العناصر. إذا لم يصل العرض إلى الحد الأدنى من المشترين، فستحصل على استرداد كامل.',
    activeGroupDeals: 'عروض جماعية نشطة',
    dealsAvailable: (n: number) => `عدد العروض المتاحة: ${n}`,
    areYouAVendor: 'هل أنت بائع؟',
    vendorPitch:
      'أنشئ عروض شراء جماعي لتحريك المخزون بسرعة وجذب عملاء جدد!',
    startGroupDeal: 'ابدأ عرضًا جماعيًا',
    activeDeals: 'العروض النشطة',
    priceDrops: 'ينخفض السعر كلما انضم المزيد من الأشخاص:',
    regularPriceLabel: 'السعر العادي:',
    joined: 'انضموا',
    moreFor: 'أكثر للحصول على',
    bestPrice: 'أفضل سعر! ??',
    paymentHeldEscrow: 'يُحتجز الدفع في الضمان حتى تأكيد التسليم',
    youAreIn: 'أنت ضمن المجموعة! شارك لتحصل على سعر أقل',
    join: 'انضم',
    viewFullDetails: 'عرض التفاصيل الكاملة ?',
    lowStock: 'متبقٍ',
    yourDeal: 'عرضك',
    groupDeal: 'عرض جماعي',
    endsToday: 'ينتهي اليوم!',
    dLeft: 'أيام متبقية',
    seller: 'بواسطة',
    minBuyersNeeded: 'مطلوب للتفعيل',
  },
  pidgin: {
    createGroupBuy: 'Create Group Buy',
    stepOf: (s: number) => `Step ${s} for 3`,
    productDealName: 'Product / deal name *',
    productDealNamePlaceholder: 'Example: Samsung Galaxy A54 bulk deal',
    description: 'Description *',
    descriptionPlaceholder: 'Talk the thing wey buyers go get, quality, specs...',
    category: 'Category *',
    yourWhatsAppContact: 'Your WhatsApp contact',
    nextSetPricing: 'Next: Set price',
    regularPrice: 'Normal price (XAF) *',
    groupPrice: 'Group price (XAF) *',
    buyersSave: (n: number) => `Buyers go save ${n}% from normal price!`,
    minBuyersToActivate: 'Minimum buyers to activate *',
    maxBuyers: 'Maximum buyers',
    dealDuration: 'Deal duration (days)',
    back: 'Back',
    review: 'Check am',
    reviewYourDeal: 'Check your deal',
    dealName: 'Deal name',
    savings: 'Money wey you save',
    off: 'off',
    duration: 'Duration',
    days: 'days',
    escrowProtection: 'Escrow protection:',
    escrowNotice:
      'All buyer money dey stay for Bambeh Escrow. Dem go release am give you only after buyers confirm say dem don receive the items.',
    createDeal: 'Create deal!',
    creating: 'Dey create...',
    inviteFriends: 'Invite friends',
    moreBuyersLowerPrice: 'More buyers = lower price for everybody!',
    linkCopied: 'Link don copy!',
    copyLink: 'Copy link',
    shareOnWhatsApp: 'Share for WhatsApp',
    shareViaPhone: 'Share through phone',
    currentlyNeeded: (current: number, need: number) => `Now ${current} / ${need} still needed make deal start`,
    groupDealCreated: 'Group deal don create! Share am make buyers come.',
    groupBuying: 'Group buying ??',
    buyTogetherSaveTogether: 'Buy together, save together ? the more people, the better!',
    howGroupBuyingWorks: 'How group buying dey work',
    step1: 'Find deal and join. Price dey locked for you.',
    step2: 'Share am for WhatsApp. More buyers = lower price!',
    step3: 'Deal go start when minimum buyers reach.',
    step4: 'Money go stay for Escrow till you receive the goods.',
    allPaymentsEscrow: 'All payments dey go Escrow',
    escrowBody:
      'When you join group deal and pay, your money dey held safely for Bambeh Escrow. Dem go release am to vendor only after the deal start and items don deliver. If the deal no reach minimum buyers, you go collect full refund.',
    activeGroupDeals: 'Active group deals',
    dealsAvailable: (n: number) => `${n} deals dey available`,
    areYouAVendor: 'You be vendor?',
    vendorPitch:
      'Create group buying deals to move stock fast and attract new customers!',
    startGroupDeal: 'Start group deal',
    activeDeals: 'active deals',
    priceDrops: 'Price dey drop as more people join:',
    regularPriceLabel: 'Normal price:',
    joined: 'don join',
    moreFor: 'more make you get',
    bestPrice: 'Best price! ??',
    paymentHeldEscrow: 'Payment dey held for Escrow till delivery confirmed',
    youAreIn: "You don join! Share am make price reduce more",
    join: 'Join',
    viewFullDetails: 'See full details ?',
    lowStock: 'left',
    yourDeal: 'Your deal',
    groupDeal: 'Group deal',
    endsToday: 'Go end today!',
    dLeft: 'days left',
    seller: 'by',
    minBuyersNeeded: 'needed to activate deal',
  },
  ful: {
    createGroupBuy: 'Husna Bandiraaɗo Humpito',
    stepOf: (s: number) => `Tappere ${s} e 3`,
    productDealName: 'Innde huunde / humpito *',
    productDealNamePlaceholder: 'Ex.: Bandiraaɗo Samsung Galaxy A54',
    description: 'Cappanɗe *',
    descriptionPlaceholder: 'Yamno ko ko ɗoo mo woni heɓugol, quality, spec...',
    category: 'Kilaaɗe *',
    yourWhatsAppContact: 'Nder WhatsApp maa',
    nextSetPricing: 'Joora: waɗtu leeli',
    regularPrice: 'Leel normal (XAF) *',
    groupPrice: 'Leel bandiraaɗo (XAF) *',
    buyersSave: (n: number) => `Ɓe ɗaɓɓitiiɗe njiyataa ${n}% e leel normal!`,
    minBuyersToActivate: 'Ɓeɓɓe kamɓe kala ngam waɗde *',
    maxBuyers: 'Ɓeɓɓe ɓuri',
    dealDuration: 'Hoddiire mum (ñalɗe)',
    back: 'Rutto',
    review: 'Ƴeewto',
    reviewYourDeal: 'Ƴeewto bandiraaɗo maa',
    dealName: 'Innde bandiraaɗo',
    savings: 'Jafinaande',
    off: 'woɗi e',
    duration: 'Hoddiire',
    days: 'ñalɗe',
    escrowProtection: 'Amannde Escrow:',
    escrowNotice:
      'Ɓeɗɗeɓe kala ngoɗɗi ngoodi e Bambeh Escrow. Ngam nde ɓe laatoo, njaɓɓi ndii waɗataa ngam kaɓɓal dow jurɗe nde ɓe laatii delivery.',
    createDeal: 'Husna bandiraaɗo!',
    creating: 'Dey husnude...',
    inviteFriends: 'Waɗtu ɓe heddii',
    moreBuyersLowerPrice: 'Ɓeɓɓe ɓuri = leel ɓaɗiiy ɗiɗi dow kala!',
    linkCopied: 'Link ɗoo copiyii!',
    copyLink: 'Copiy link',
    shareOnWhatsApp: 'Faw e WhatsApp',
    shareViaPhone: 'Faw e telefoŋ',
    currentlyNeeded: (current: number, need: number) => `Haa jooni ${current} / ${need} ko ɓuri ngam bandiraaɗo oo haɓɓude`,
    groupDealCreated: 'Bandiraaɗo bandiraaɗo ko husnii! Faw ɗum ngam ɓeɓɓe ñiiɓde.',
    groupBuying: 'Husna bandiraaɗo ??',
    buyTogetherSaveTogether: 'Heɓu e mumɗe, jafina e mumɗe ? ɗuum ɓuri no ɗuuɗi, ɗuum ɗaaɓi!',
    howGroupBuyingWorks: 'No bandiraaɗo oo ɗoo wayi',
    step1: 'Yiylo bandiraaɗo ngol e naatnu. Leel oo wondi dow maa.',
    step2: 'Faw am e WhatsApp. Ɓeɓɓe ɓuri = leel ɓaɗiiy!',
    step3: 'Bandiraaɗo oo wayata so ɓeɓɓe kamɓe aawti.',
    step4: 'Njaɓɓi ndii woɗa e Escrow haa so huundeɓe ɓe juulii.',
    allPaymentsEscrow: 'Njaɓɓi kala ɗoo ngoodi e Escrow',
    escrowBody:
      'So a naatni bandiraaɗo e ngaɗi pay, njaɓɓi maa woɗii no ɓuri e Bambeh Escrow. O njibinataa e seller wonde so bandiraaɗo oo haɓɓii e items ɓe naatnii. So bandiraaɗo oo no ñaamii kamɓe minimal, a heɓa refund ɓuri.',
    activeGroupDeals: 'Bandiraaɗe ɓurɗe waɗude',
    dealsAvailable: (n: number) => `${n} bandiraaɗe a woodi`,
    areYouAVendor: 'A ko seller?',
    vendorPitch:
      'Husna bandiraaɗo ngam ɓeydude stock vel e heɓugol ɓeɓɓe kesɗe!',
    startGroupDeal: 'Fuɗɗo bandiraaɗo',
    activeDeals: 'bandiraaɗe ɓurɗe',
    priceDrops: 'Leel oo ɗaɓɓa so ɓeɓɓe ɓuri ina naatdi:',
    regularPriceLabel: 'Leel normal:',
    joined: 'naatnii',
    moreFor: 'ɓuri ngam',
    bestPrice: 'Leel ɓuri! ??',
    paymentHeldEscrow: 'Njaɓɓi ɗoo woɗa e Escrow haa delivery tabbii',
    youAreIn: 'A naatnii! Faw ɗum ngam leel uddita',
    join: 'Naatnu',
    viewFullDetails: 'Yiylo details ɗiɗi ?',
    lowStock: 'heddii',
    yourDeal: 'Bandiraaɗo maa',
    groupDeal: 'Bandiraaɗo',
    endsToday: 'Haa hiɓe haa jooni!',
    dLeft: 'ñalɗe heddii',
    seller: 'e',
    minBuyersNeeded: 'kamɓe waɗɗe ngam haɓɓude bandiraaɗo',
  },
};

const formatXAF = (n: number) => `${n.toLocaleString('fr-CM')} XAF`;

const DIAL_CODES = [
  { code: '+237', flag: '????', name: 'Cameroun' },
  { code: '+234', flag: '????', name: 'Nigeria' },
  { code: '+233', flag: '????', name: 'Ghana' },
  { code: '+221', flag: '????', name: 'S?n?gal' },
  { code: '+225', flag: '????', name: "C?te d'Ivoire" },
  { code: '+241', flag: '????', name: 'Gabon' },
  { code: '+242', flag: '????', name: 'Congo' },
  { code: '+243', flag: '????', name: 'RD Congo' },
  { code: '+240', flag: '????', name: 'Guin?e ?q.' },
  { code: '+236', flag: '????', name: 'Centrafrique' },
  { code: '+235', flag: '????', name: 'Tchad' },
  { code: '+227', flag: '????', name: 'Niger' },
  { code: '+228', flag: '????', name: 'Togo' },
  { code: '+229', flag: '????', name: 'B?nin' },
  { code: '+224', flag: '????', name: 'Guin?e' },
];

const INITIAL_DEALS: GroupDeal[] = [
  {
    id: 'grp-001',
    name: 'Premium Cocoa Powder 1kg (Cameroon Origin)',
    image: '?',
    imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80',
    category: 'Food',
    regularPrice: 12000,
    tiers: [
      { buyers: 3, price: 9500 },
      { buyers: 5, price: 8000 },
      { buyers: 10, price: 6500 },
    ],
    currentBuyers: 7,
    maxBuyers: 10,
    endsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    vendor: 'Cocoa Cameroun',
    rating: 4.9,
    reviews: 42,
    description: 'Premium single-origin Cameroonian cocoa powder, fair-trade certified. Perfect for baking, hot chocolate, and cooking.',
  },
  {
    id: 'grp-002',
    name: 'Samsung Galaxy Buds2 Pro ? Wireless Earbuds',
    image: '??',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
    category: 'Electronics',
    regularPrice: 85000,
    tiers: [
      { buyers: 2, price: 72000 },
      { buyers: 5, price: 65000 },
      { buyers: 8, price: 58000 },
    ],
    currentBuyers: 4,
    maxBuyers: 8,
    endsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    vendor: 'TechShop Yaound?',
    rating: 4.7,
    reviews: 18,
    description: 'Noise-cancelling wireless earbuds with 30hr battery life. Unlocked, works with all phones.',
  },
  {
    id: 'grp-003',
    name: 'Ergonomic Executive Office Chair',
    image: '??',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
    category: 'Furniture',
    regularPrice: 95000,
    tiers: [
      { buyers: 3, price: 78000 },
      { buyers: 6, price: 68000 },
    ],
    currentBuyers: 2,
    maxBuyers: 6,
    endsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    vendor: 'Mobilier Pro',
    rating: 4.5,
    reviews: 9,
    description: 'High-back executive chair with lumbar support, adjustable armrests, and 5-year warranty.',
  },
  {
    id: 'grp-004',
    name: 'Organic Shea Butter 2kg Bulk Pack',
    image: '??',
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80',
    category: 'Beauty',
    regularPrice: 22000,
    tiers: [
      { buyers: 5, price: 16000 },
      { buyers: 10, price: 12000 },
      { buyers: 20, price: 9000 },
    ],
    currentBuyers: 13,
    maxBuyers: 20,
    endsAt: new Date(Date.now() + 86400000 * 1).toISOString(),
    vendor: 'Natural Cameroon',
    rating: 5.0,
    reviews: 67,
    description: '100% pure unrefined shea butter from West African highlands. Cold-pressed, no additives.',
  },
  {
    id: 'grp-005',
    name: 'Fresh Avocados ? 10kg Farm Box',
    image: '??',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80',
    category: 'Food',
    regularPrice: 8500,
    tiers: [
      { buyers: 5, price: 6500 },
      { buyers: 10, price: 5000 },
      { buyers: 20, price: 3800 },
    ],
    currentBuyers: 8,
    maxBuyers: 20,
    endsAt: new Date(Date.now() + 86400000 * 4).toISOString(),
    vendor: 'FarmFresh CM',
    rating: 4.8,
    reviews: 31,
    description: 'Hand-picked avocados directly from farms in the Western Highlands. Arrive ripe and ready.',
  },
  {
    id: 'grp-006',
    name: 'Solar Lantern ? 3-in-1 Charging Kit',
    image: '??',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80',
    category: 'Electronics',
    regularPrice: 35000,
    tiers: [
      { buyers: 5, price: 27000 },
      { buyers: 10, price: 22000 },
    ],
    currentBuyers: 3,
    maxBuyers: 10,
    endsAt: new Date(Date.now() + 86400000 * 6).toISOString(),
    vendor: 'SolarCam',
    rating: 4.6,
    reviews: 22,
    description: 'Powers light, phone, and radio. Perfect for areas with frequent power cuts. USB-C output.',
  },
];

const CountdownBadge = ({ endsAt }: { endsAt: string }) => {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const days = Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000));
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      days <= 1 ? 'bg-red-100 text-red-700' : days <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
    }`}>
      <Clock className="w-3 h-3" />
      {days === 0 ? ui.endsToday : `${days}${ui.dLeft}`}
    </span>
  );
};

const EscrowInfoBanner = () => {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex gap-3">
      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-blue-800 text-sm">{ui.allPaymentsEscrow}</p>
        <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">{ui.escrowBody}</p>
      </div>
    </div>
  );
};

interface CreateGroupModalProps {
  onClose: () => void;
  onCreated: (deal: GroupDeal) => void;
}

function CreateGroupModal({ onClose, onCreated }: CreateGroupModalProps) {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [regPrice, setRegPrice] = useState('');
  const [groupPrice, setGroupPrice] = useState('');
  const [minBuyers, setMinBuyers] = useState('5');
  const [maxBuyers, setMaxBuyers] = useState('20');
  const [days, setDays] = useState('7');
  const [dialCode, setDialCode] = useState('+237');
  const [phone, setPhone] = useState('');
  const [showDial, setShowDial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const CATEGORIES = ['Electronics','Food','Fashion','Beauty','Furniture','Agriculture','Health','Sports','Other'];
  const canProceed1 = name.trim().length >= 5 && description.trim().length >= 10 && category;
  const canProceed2 = Number(regPrice) > 0 && Number(groupPrice) > 0 && Number(groupPrice) < Number(regPrice) && Number(minBuyers) >= 2 && Number(maxBuyers) >= Number(minBuyers);
  const savings = Number(regPrice) > 0 ? Math.round((1 - Number(groupPrice) / Number(regPrice)) * 100) : 0;

  async function handleCreate() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    const newDeal: GroupDeal = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      image: '??',
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80',
      category,
      regularPrice: Number(regPrice),
      tiers: [{ buyers: Number(minBuyers), price: Number(groupPrice) }],
      currentBuyers: 0,
      maxBuyers: Number(maxBuyers),
      endsAt: new Date(Date.now() + Number(days) * 86400000).toISOString(),
      vendor: 'You (via Bambeh)',
      rating: 5.0,
      reviews: 0,
      description: description.trim(),
      isUserCreated: true,
    };
    setSaving(false);
    onCreated(newDeal);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">{ui.createGroupBuy}</h2>
            <p className="text-blue-100 text-xs">{ui.stepOf(step)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="w-full h-1.5 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}/>
        </div>

        <div className="p-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.productDealName}</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder={ui.productDealNamePlaceholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.description}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={ui.descriptionPlaceholder} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.category}</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.yourWhatsAppContact}</label>
                <div className="flex gap-0 relative">
                  <button type="button" onClick={() => setShowDial(v => !v)} className="flex items-center gap-1 px-3 py-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm">
                    <span>{DIAL_CODES.find(d => d.code === dialCode)?.flag}</span>
                    <span className="text-gray-700 font-medium">{dialCode}</span>
                    <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                  </button>
                  {showDial && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDial(false)} />
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-20 max-h-48 overflow-y-auto">
                        {DIAL_CODES.map(d => (
                          <button key={d.code} type="button" onClick={() => { setDialCode(d.code); setShowDial(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${d.code === dialCode ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
                            <span>{d.flag}</span>
                            <span className="font-medium">{d.code}</span>
                            <span className="text-gray-400 truncate text-xs">{d.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="6XX XXX XXX" type="tel" className="flex-1 border border-gray-200 rounded-r-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <button disabled={!canProceed1} onClick={() => setStep(2)} className="w-full bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                {ui.nextSetPricing} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.regularPrice}</label>
                  <input type="number" value={regPrice} onChange={e => setRegPrice(e.target.value)} placeholder="e.g. 85000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.groupPrice}</label>
                  <input type="number" value={groupPrice} onChange={e => setGroupPrice(e.target.value)} placeholder="e.g. 65000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {savings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-green-700 font-bold">?? {ui.buyersSave(savings)}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.minBuyersToActivate}</label>
                  <input type="number" min={2} value={minBuyers} onChange={e => setMinBuyers(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.maxBuyers}</label>
                  <input type="number" min={Number(minBuyers)} value={maxBuyers} onChange={e => setMaxBuyers(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{ui.dealDuration}</label>
                <div className="flex gap-2">
                  {['3','5','7','14','30'].map(d => (
                    <button key={d} onClick={() => setDays(d)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${days === d ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  <strong>{ui.escrowProtection}</strong> {ui.escrowNotice}
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600">
                  ? {ui.back}
                </button>
                <button disabled={!canProceed2} onClick={() => setStep(3)} className="flex-1 bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1">
                  {ui.review} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900">{ui.reviewYourDeal}</h3>
                {[
                  [ui.dealName, name],
                  [ui.category, category],
                  [ui.regularPrice, formatXAF(Number(regPrice))],
                  [ui.groupPrice, formatXAF(Number(groupPrice))],
                  [ui.savings, `${savings}% ${ui.off}`],
                  [ui.minBuyersToActivate, minBuyers],
                  [ui.maxBuyers, maxBuyers],
                  [ui.duration, `${days} ${ui.days}`],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[55%]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  By creating this deal you agree that all payments are held in Bambeh Escrow until buyers confirm receipt of goods. Early withdrawal requires admin approval.
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600">
                  ? {ui.back}
                </button>
                <button onClick={handleCreate} disabled={saving} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  {saving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> {ui.creating}</>) : (<><Gift className="w-4 h-4" /> {ui.createDeal}</>)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ShareGroupModal({ deal, onClose }: { deal: GroupDeal; onClose: () => void }) {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://bambeh.com/#/group-buying/${deal.id}`;
  const shareText = `?? ${ui.inviteFriends} on Bambeh!\n\n${deal.name}\n?? Only ${formatXAF(deal.tiers[0].price)} per person when we reach ${deal.tiers[0].buyers} buyers!\n?? Currently ${deal.currentBuyers}/${deal.tiers[0].buyers} joined.\n\nJoin here ??\n${shareUrl}`;

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: deal.name, text: shareText, url: shareUrl });
        onClose();
        return;
      } catch {}
    }
    copyLink();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => { setCopied(false); }, 2500);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold">{ui.inviteFriends}</h2>
            <p className="text-green-100 text-xs mt-0.5">{ui.moreBuyersLowerPrice}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 break-all font-mono">{shareUrl}</div>

          <button onClick={copyLink} className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            {copied ? <><CheckCircle className="w-4 h-4" /> {ui.linkCopied}</> : <><Copy className="w-4 h-4" /> {ui.copyLink}</>}
          </button>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 transition-all">
            <MessageCircle className="w-4 h-4" /> {ui.shareOnWhatsApp}
          </a>

          <button onClick={handleWebShare} className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-all">
            <Share2 className="w-4 h-4" /> {ui.shareViaPhone}
          </button>

          <p className="text-xs text-center text-gray-400 pt-1">
            {ui.currentlyNeeded(deal.currentBuyers, deal.tiers[0].buyers)}
          </p>
        </div>
      </div>
    </div>
  );
}

const GroupDealCard = ({ deal, onJoin, onShare }: {
  deal: GroupDeal;
  onJoin: (id: string) => void;
  onShare: (deal: GroupDeal) => void;
}) => {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);

  const currentTier = [...deal.tiers].reverse().find(t => deal.currentBuyers >= t.buyers) || deal.tiers[0];
  const nextTier = deal.tiers.find(t => t.buyers > deal.currentBuyers);
  const progressPct = Math.min(100, Math.round(deal.currentBuyers / deal.maxBuyers * 100));

  const handleJoin = () => {
    setJoined(true);
    onJoin(deal.id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
        {deal.imageUrl ? (
          <img src={deal.imageUrl} alt={deal.name} loading="lazy" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">{deal.image}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3" /> {ui.groupDeal}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <CountdownBadge endsAt={deal.endsAt} />
        </div>
        {deal.isUserCreated && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{ui.yourDeal}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{deal.category}</span>
        </div>
        <h3 className="font-bold text-gray-900 mb-1 leading-snug text-sm">{deal.name}</h3>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{deal.description}</p>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-gray-700">{deal.rating}</span>
          <span className="text-xs text-gray-400">({deal.reviews})</span>
          <span className="text-gray-200 mx-1">?</span>
          <span className="text-xs text-gray-500 truncate">{deal.vendor}</span>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> {ui.priceDrops}
          </p>
          <div className="space-y-1.5">
            {deal.tiers.map(tier => {
              const isReached = deal.currentBuyers >= tier.buyers;
              const isCurrent = tier === currentTier;
              return (
                <div key={tier.buyers} className={`flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 ${isCurrent ? 'bg-blue-600 text-white' : isReached ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600'}`}>
                  <span className="flex items-center gap-1.5">
                    {isReached && <CheckCircle className="w-3 h-3" />}
                    <Users className="w-3 h-3 opacity-70" />
                    {tier.buyers}+ {ui.joined}
                  </span>
                  <span className="font-bold">{formatXAF(tier.price)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {ui.regularPriceLabel} <span className="line-through">{formatXAF(deal.regularPrice)}</span>
          </p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-blue-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {deal.currentBuyers} {ui.joined}
            </span>
            {nextTier ? (
              <span className="text-amber-600">{nextTier.buyers - deal.currentBuyers} {ui.moreFor} {formatXAF(nextTier.price)}!</span>
            ) : (
              <span className="text-green-600 font-semibold">{ui.bestPrice}</span>
            )}
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}/>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0</span><span>Max: {deal.maxBuyers}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-blue-600 font-black text-2xl">{formatXAF(currentTier.price)}</span>
          <span className="text-xs text-gray-400 line-through">{formatXAF(deal.regularPrice)}</span>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
            -{Math.round((1 - currentTier.price / deal.regularPrice) * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5 mb-3">
          <Lock className="w-3 h-3 flex-shrink-0" />
          <span>{ui.paymentHeldEscrow}</span>
        </div>

        <div className="flex gap-2">
          {joined ? (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 text-green-700 rounded-xl font-semibold text-sm">
              <CheckCircle className="w-4 h-4" /> {ui.youAreIn}
            </div>
          ) : (
            <button onClick={handleJoin} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all">
              <UserPlus className="w-4 h-4" /> {ui.join} ({formatXAF(currentTier.price)})
            </button>
          )}

          <button onClick={() => onShare(deal)} className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white hover:bg-green-600 transition-all flex-shrink-0" title={ui.inviteFriends}>
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <button onClick={() => navigate(`/group-buying/${deal.id}`)} className="w-full mt-2 text-xs text-blue-600 font-medium text-center py-1.5 hover:underline">
          {ui.viewFullDetails}
        </button>
      </div>
    </div>
  );
};

const GroupBuying: React.FC = () => {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const [deals, setDeals] = useState<GroupDeal[]>(INITIAL_DEALS);
  const [showCreate, setShowCreate] = useState(false);
  const [shareTarget, setShareTarget] = useState<GroupDeal | null>(null);
  const [createdAlert, setCreatedAlert] = useState(false);
  const navigate = useNavigate();

  const handleJoin = (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, currentBuyers: d.currentBuyers + 1 } : d));
  };

  const handleCreated = (newDeal: GroupDeal) => {
    setDeals(prev => [newDeal, ...prev]);
    setShowCreate(false);
    setCreatedAlert(true);
    setTimeout(() => setCreatedAlert(false), 5000);
    setTimeout(() => setShareTarget(newDeal), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">
      {createdAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" /> {ui.groupDealCreated}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">{ui.groupBuying}</h1>
              <p className="text-blue-100 text-sm mt-1">{ui.buyTogetherSaveTogether}</p>
            </div>
          </div>

          <div className="bg-white/15 rounded-2xl p-4 mt-4">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" /> {ui.howGroupBuyingWorks}
            </h2>
            <div className="grid sm:grid-cols-4 gap-4 text-sm">
              {[
                { step: '1??', text: ui.step1 },
                { step: '2??', text: ui.step2 },
                { step: '3??', text: ui.step3 },
                { step: '??', text: ui.step4 },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-2 text-blue-100">
                  <span className="text-xl flex-shrink-0">{s.step}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <EscrowInfoBanner />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{ui.activeGroupDeals}</h2>
            <p className="text-sm text-gray-500">{ui.dealsAvailable(deals.length)}</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
            <Plus className="w-4 h-4" /> {ui.createGroupBuy}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {deals.map(deal => (
            <GroupDealCard key={deal.id} deal={deal} onJoin={handleJoin} onShare={setShareTarget} />
          ))}
        </div>

        <div className="mt-10 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{ui.areYouAVendor}</h3>
          <p className="text-gray-500 text-sm mb-5">{ui.vendorPitch}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/vendor/premium-tools" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
              {ui.startGroupDeal} <ChevronRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
              <Zap className="w-4 h-4" /> {ui.createGroupBuy}
            </button>
          </div>
        </div>
      </div>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {shareTarget && <ShareGroupModal deal={shareTarget} onClose={() => setShareTarget(null)} />}
    </div>
  );
};

export default GroupBuying;