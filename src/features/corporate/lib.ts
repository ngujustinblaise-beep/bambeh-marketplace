// BAMBEH_DEPLOY_TOKEN__CORPORATELIB_FIX119_CLEAN
/**
 * corporate/lib.ts — Bambeh Corporate shared foundation (FIX119)
 * FILE LOCATION: src/features/corporate/lib.ts
 *
 * Types, 5-language strings, and REAL Supabase data helpers used by every
 * corporate screen. No mock data anywhere — every function hits the DB.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { supabase } from '@/lib/supabase';

// ----------------------------- Types --------------------------------------
export type CorpCategory = 'shopping' | 'services' | 'infrastructure';
export type CorpAudience = 'b2c' | 'b2b' | 'hybrid';
export type CorpStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface CorporateStore {
  id: string;
  owner_id: string;
  registered_name: string;
  trading_name: string | null;
  slug: string | null;
  category: CorpCategory;
  subcategory: string | null;
  rep_name: string | null;
  rep_email: string | null;
  rep_phone: string | null;
  rccm_number: string | null;
  niu_number: string | null;
  document_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  city: string | null;
  address: string | null;
  about: string | null;
  audience: CorpAudience;
  moq_text: string | null;
  min_order_value_xaf: number | null;
  price_mode: 'ttc' | 'ht';
  status: CorpStatus;
  verified: boolean;
  rating: number | null;
  order_count: number | null;
  created_at: string;
}

export interface CorporateProduct {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  category: string | null;
  retail_price_xaf: number | null;
  bulk_price_xaf: number | null;
  bulk_min_qty: number | null;
  unit: string | null;
  is_wholesale: boolean;
  in_stock: boolean;
  status: string;
  created_at: string;
}

export interface CorporateQuote {
  id: string;
  store_id: string;
  buyer_id: string;
  product_id: string | null;
  quantity: number;
  unit: string | null;
  delivery_location: string | null;
  delivery_date: string | null;
  notes: string | null;
  status: string;
  quoted_price_xaf: number | null;
  created_at: string;
}

// ----------------------------- i18n ---------------------------------------
export const CORP_STR = {
  en: {
    corporate: 'Bambeh Corporate', tagline: 'Verified enterprises, wholesale supply & B2B services',
    catShopping: 'Corporate Shopping', catServices: 'Professional Services', catInfra: 'Infrastructure & Logistics',
    subShopping: 'Mega supermarkets, wholesale & bulk supply',
    subServices: 'Tech, finance, legal & advisory',
    subInfra: 'Logistics, transport, facility & energy',
    browseStores: 'Verified Enterprises', searchStores: 'Search corporate stores…',
    registerCta: 'Register your Enterprise', myStore: 'My Corporate Dashboard',
    noStores: 'No verified enterprises here yet.', loadError: 'Could not load. Check your connection.', retry: 'Retry',
    verified: 'Verified Corporate', pending: 'Verification Pending', back: 'Back',
    verifyModal: 'Bambeh Corporate Verified: this enterprise has submitted valid RCCM and Tax ID (NIU) documentation.',
    b2bPortal: 'Corporate B2B Portal', acceptsBulk: 'This enterprise accepts bulk orders and enterprise supply.',
    minOrder: 'Minimum order', reqQuote: 'Request Corporate Quote', chatSales: 'Chat with Sales',
    tabAll: 'All Products', tabBulk: 'Wholesale / Bulk', tabAbout: 'About Us',
    retailPrice: 'Retail', bulkPrice: 'Bulk price', moq: 'MOQ', perUnit: 'per',
    aboutLegal: 'Legal & Registration', rccm: 'RCCM', niu: 'NIU / Tax ID', sector: 'Sector', location: 'Location',
    verifyBanner: 'Verification takes 3–14 business days. Sales can begin now; transacting parties operate under full legal accountability.',
    // registration
    regTitle: 'Register your Enterprise', step: 'Step',
    s1: 'Basic Profile', s2: 'Legal Verification', s3: 'Business Setup',
    fRegName: 'Registered company name', fTradeName: 'Trading name (if different)',
    fCategory: 'Primary category', fRepName: 'Authorized representative', fRepEmail: 'Corporate email',
    fRepPhone: 'Corporate phone', fRccm: 'RCCM number', fNiu: 'Taxpayer ID (NIU)',
    fDoc: 'Registration certificate / Tax card (URL)', fCity: 'City', fAddress: 'Address', fAbout: 'About your company',
    fAudience: 'Who do you sell to?', audB2c: 'Consumers (B2C)', audB2b: 'Businesses (B2B)', audHybrid: 'Both (Hybrid)',
    fMoq: 'Minimum order (e.g. "50 units")', fMinValue: 'Minimum order value (FCFA)',
    fPriceMode: 'Show prices as', ttc: 'TTC (tax incl.)', ht: 'HT (tax excl.)',
    next: 'Next', prevBtn: 'Back', submit: 'Submit for verification', submitting: 'Submitting…',
    regDone: 'Registration submitted! Verification takes 3–14 business days. You can start setting up your store now.',
    needLogin: 'Please log in to register an enterprise.', reqField: 'Please fill the required fields.',
    // quote form
    quoteTitle: 'Request a Corporate Quote', qQty: 'Quantity', qUnit: 'Unit (e.g. cartons)',
    qLocation: 'Delivery location', qDate: 'Preferred delivery date', qNotes: 'Requirements / notes',
    qSend: 'Send quote request', qSending: 'Sending…',
    qDone: 'Your quote request was sent. The vendor\u2019s sales team will respond in your messages.', cancel: 'Cancel',
    // dashboard
    dashTitle: 'Corporate Dashboard', dashStatus: 'Store status', dashProducts: 'Products', dashQuotes: 'Quote requests',
    addProduct: 'Add product', noProducts: 'No products yet.', noQuotes: 'No quote requests yet.',
  },
  fr: {
    corporate: 'Bambeh Corporate', tagline: 'Entreprises vérifiées, vente en gros & services B2B',
    catShopping: 'Achats Entreprise', catServices: 'Services Professionnels', catInfra: 'Infrastructure & Logistique',
    subShopping: 'Supermarchés, vente en gros & approvisionnement',
    subServices: 'Tech, finance, juridique & conseil',
    subInfra: 'Logistique, transport, gestion & énergie',
    browseStores: 'Entreprises Vérifiées', searchStores: 'Rechercher une entreprise…',
    registerCta: 'Enregistrer votre Entreprise', myStore: 'Mon Tableau de Bord',
    noStores: 'Aucune entreprise vérifiée ici.', loadError: 'Chargement impossible. Vérifiez votre connexion.', retry: 'Réessayer',
    verified: 'Corporate Vérifié', pending: 'Vérification en cours', back: 'Retour',
    verifyModal: 'Vérifié par Bambeh Corporate : cette entreprise a soumis des documents RCCM et NIU valides.',
    b2bPortal: 'Portail B2B Entreprise', acceptsBulk: 'Cette entreprise accepte les commandes en gros.',
    minOrder: 'Commande minimum', reqQuote: 'Demander un devis', chatSales: 'Contacter les ventes',
    tabAll: 'Tous les produits', tabBulk: 'Gros / Vrac', tabAbout: 'À propos',
    retailPrice: 'Détail', bulkPrice: 'Prix de gros', moq: 'MOQ', perUnit: 'par',
    aboutLegal: 'Légal & Enregistrement', rccm: 'RCCM', niu: 'NIU / ID fiscal', sector: 'Secteur', location: 'Localisation',
    verifyBanner: 'La vérification prend 3 à 14 jours ouvrables. Les ventes peuvent commencer ; les parties opèrent sous pleine responsabilité légale.',
    regTitle: 'Enregistrer votre Entreprise', step: 'Étape',
    s1: 'Profil de base', s2: 'Vérification légale', s3: 'Configuration',
    fRegName: 'Nom légal de l\u2019entreprise', fTradeName: 'Nom commercial (si différent)',
    fCategory: 'Catégorie principale', fRepName: 'Représentant autorisé', fRepEmail: 'Email professionnel',
    fRepPhone: 'Téléphone professionnel', fRccm: 'Numéro RCCM', fNiu: 'Identifiant fiscal (NIU)',
    fDoc: 'Certificat / Carte de contribuable (URL)', fCity: 'Ville', fAddress: 'Adresse', fAbout: 'À propos de votre entreprise',
    fAudience: 'À qui vendez-vous ?', audB2c: 'Consommateurs (B2C)', audB2b: 'Entreprises (B2B)', audHybrid: 'Les deux (Hybride)',
    fMoq: 'Commande minimum (ex. « 50 unités »)', fMinValue: 'Valeur minimum (FCFA)',
    fPriceMode: 'Afficher les prix en', ttc: 'TTC', ht: 'HT',
    next: 'Suivant', prevBtn: 'Retour', submit: 'Soumettre pour vérification', submitting: 'Envoi…',
    regDone: 'Enregistrement soumis ! La vérification prend 3 à 14 jours ouvrables. Vous pouvez configurer votre boutique.',
    needLogin: 'Connectez-vous pour enregistrer une entreprise.', reqField: 'Veuillez remplir les champs requis.',
    quoteTitle: 'Demander un devis d\u2019entreprise', qQty: 'Quantité', qUnit: 'Unité (ex. cartons)',
    qLocation: 'Lieu de livraison', qDate: 'Date de livraison souhaitée', qNotes: 'Exigences / notes',
    qSend: 'Envoyer la demande', qSending: 'Envoi…',
    qDone: 'Votre demande de devis a été envoyée. L\u2019équipe commerciale répondra dans vos messages.', cancel: 'Annuler',
    dashTitle: 'Tableau de bord', dashStatus: 'Statut', dashProducts: 'Produits', dashQuotes: 'Demandes de devis',
    addProduct: 'Ajouter un produit', noProducts: 'Aucun produit.', noQuotes: 'Aucune demande de devis.',
  },
  pidgin: {
    corporate: 'Bambeh Corporate', tagline: 'Verified big companies, wholesale & B2B service',
    catShopping: 'Corporate Shopping', catServices: 'Professional Service', catInfra: 'Infrastructure & Logistics',
    subShopping: 'Big supermarket, wholesale & bulk supply',
    subServices: 'Tech, finance, legal & advice',
    subInfra: 'Logistics, transport, facility & energy',
    browseStores: 'Verified Companies', searchStores: 'Find corporate store…',
    registerCta: 'Register your Company', myStore: 'My Corporate Dashboard',
    noStores: 'No verified company dey here yet.', loadError: 'E no load. Check your network.', retry: 'Try again',
    verified: 'Verified Corporate', pending: 'Verification dey wait', back: 'Go back',
    verifyModal: 'Bambeh Corporate Verified: dis company don submit correct RCCM and Tax ID (NIU) papers.',
    b2bPortal: 'Corporate B2B Portal', acceptsBulk: 'Dis company dey accept bulk order and enterprise supply.',
    minOrder: 'Minimum order', reqQuote: 'Request Corporate Quote', chatSales: 'Chat with Sales',
    tabAll: 'All Products', tabBulk: 'Wholesale / Bulk', tabAbout: 'About Us',
    retailPrice: 'Retail', bulkPrice: 'Bulk price', moq: 'MOQ', perUnit: 'per',
    aboutLegal: 'Legal & Registration', rccm: 'RCCM', niu: 'NIU / Tax ID', sector: 'Sector', location: 'Location',
    verifyBanner: 'Verification dey take 3\u201314 business days. Sales fit start now; de two parties dey under full legal responsibility.',
    regTitle: 'Register your Company', step: 'Step',
    s1: 'Basic Profile', s2: 'Legal Verification', s3: 'Business Setup',
    fRegName: 'Company registered name', fTradeName: 'Trading name (if e different)',
    fCategory: 'Main category', fRepName: 'Authorized representative', fRepEmail: 'Company email',
    fRepPhone: 'Company phone', fRccm: 'RCCM number', fNiu: 'Tax ID (NIU)',
    fDoc: 'Registration cert / Tax card (URL)', fCity: 'City', fAddress: 'Address', fAbout: 'About your company',
    fAudience: 'Who you dey sell give?', audB2c: 'Normal people (B2C)', audB2b: 'Companies (B2B)', audHybrid: 'Both (Hybrid)',
    fMoq: 'Minimum order (e.g. "50 units")', fMinValue: 'Minimum order value (FCFA)',
    fPriceMode: 'Show price as', ttc: 'TTC (tax inside)', ht: 'HT (no tax)',
    next: 'Next', prevBtn: 'Back', submit: 'Submit for verification', submitting: 'E dey submit…',
    regDone: 'Registration don submit! Verification go take 3\u201314 business days. You fit start set up your store now.',
    needLogin: 'Abeg login to register company.', reqField: 'Abeg fill de required fields.',
    quoteTitle: 'Request Corporate Quote', qQty: 'Quantity', qUnit: 'Unit (e.g. cartons)',
    qLocation: 'Delivery location', qDate: 'Delivery date wey you want', qNotes: 'Requirements / notes',
    qSend: 'Send quote request', qSending: 'E dey send…',
    qDone: 'Your quote request don go. De company sales team go answer for your messages.', cancel: 'Cancel',
    dashTitle: 'Corporate Dashboard', dashStatus: 'Store status', dashProducts: 'Products', dashQuotes: 'Quote requests',
    addProduct: 'Add product', noProducts: 'No product yet.', noQuotes: 'No quote request yet.',
  },
  ar: {
    corporate: 'بامبيه كوربوريت', tagline: 'شركات موثقة، توريد بالجملة وخدمات الأعمال',
    catShopping: 'تسوق الشركات', catServices: 'خدمات مهنية', catInfra: 'البنية التحتية واللوجستيات',
    subShopping: 'أسواق كبرى، جملة وتوريد بالكميات',
    subServices: 'تقنية، مالية، قانونية واستشارية',
    subInfra: 'لوجستيات، نقل، مرافق وطاقة',
    browseStores: 'الشركات الموثقة', searchStores: 'ابحث عن متجر شركة…',
    registerCta: 'سجّل شركتك', myStore: 'لوحة تحكم الشركة',
    noStores: 'لا توجد شركات موثقة هنا بعد.', loadError: 'تعذر التحميل. تحقق من اتصالك.', retry: 'إعادة المحاولة',
    verified: 'شركة موثقة', pending: 'التحقق قيد الانتظار', back: 'رجوع',
    verifyModal: 'موثق من بامبيه كوربوريت: قدمت هذه المؤسسة مستندات RCCM ورقم ضريبي (NIU) صالحة.',
    b2bPortal: 'بوابة الأعمال B2B', acceptsBulk: 'تقبل هذه المؤسسة الطلبات بالجملة وتوريد الشركات.',
    minOrder: 'الحد الأدنى للطلب', reqQuote: 'طلب عرض سعر', chatSales: 'محادثة المبيعات',
    tabAll: 'كل المنتجات', tabBulk: 'الجملة', tabAbout: 'من نحن',
    retailPrice: 'تجزئة', bulkPrice: 'سعر الجملة', moq: 'الحد الأدنى', perUnit: 'لكل',
    aboutLegal: 'قانوني وتسجيل', rccm: 'السجل التجاري', niu: 'الرقم الضريبي', sector: 'القطاع', location: 'الموقع',
    verifyBanner: 'يستغرق التحقق 3–14 يوم عمل. يمكن بدء البيع الآن؛ تعمل الأطراف بمسؤولية قانونية كاملة.',
    regTitle: 'سجّل شركتك', step: 'خطوة',
    s1: 'الملف الأساسي', s2: 'التحقق القانوني', s3: 'إعداد النشاط',
    fRegName: 'الاسم القانوني للشركة', fTradeName: 'الاسم التجاري (إن اختلف)',
    fCategory: 'الفئة الرئيسية', fRepName: 'الممثل المفوض', fRepEmail: 'البريد المهني',
    fRepPhone: 'هاتف الشركة', fRccm: 'رقم السجل التجاري', fNiu: 'الرقم الضريبي (NIU)',
    fDoc: 'شهادة التسجيل / البطاقة الضريبية (رابط)', fCity: 'المدينة', fAddress: 'العنوان', fAbout: 'عن شركتك',
    fAudience: 'لمن تبيع؟', audB2c: 'المستهلكون (B2C)', audB2b: 'الشركات (B2B)', audHybrid: 'كلاهما (مختلط)',
    fMoq: 'الحد الأدنى للطلب (مثال: «50 وحدة»)', fMinValue: 'أدنى قيمة للطلب (FCFA)',
    fPriceMode: 'عرض الأسعار', ttc: 'شامل الضريبة', ht: 'بدون ضريبة',
    next: 'التالي', prevBtn: 'رجوع', submit: 'إرسال للتحقق', submitting: 'جارٍ الإرسال…',
    regDone: 'تم إرسال التسجيل! يستغرق التحقق 3–14 يوم عمل. يمكنك إعداد متجرك الآن.',
    needLogin: 'يرجى تسجيل الدخول لتسجيل شركة.', reqField: 'يرجى ملء الحقول المطلوبة.',
    quoteTitle: 'طلب عرض سعر للشركات', qQty: 'الكمية', qUnit: 'الوحدة (مثل الكراتين)',
    qLocation: 'موقع التسليم', qDate: 'تاريخ التسليم المفضل', qNotes: 'المتطلبات / ملاحظات',
    qSend: 'إرسال الطلب', qSending: 'جارٍ الإرسال…',
    qDone: 'تم إرسال طلب عرض السعر. سيرد فريق المبيعات في رسائلك.', cancel: 'إلغاء',
    dashTitle: 'لوحة التحكم', dashStatus: 'حالة المتجر', dashProducts: 'المنتجات', dashQuotes: 'طلبات عروض الأسعار',
    addProduct: 'إضافة منتج', noProducts: 'لا منتجات بعد.', noQuotes: 'لا طلبات عروض أسعار بعد.',
  },
  ff: {
    corporate: 'Bambeh Corporate', tagline: 'Kawtale tabitinaaɗe, soodgu ɗuuɗngu & golle B2B',
    catShopping: 'Soodgu Kawtal', catServices: 'Golle Karamoko', catInfra: 'Jokkondiral & Eggingol',
    subShopping: 'Marseeji mawɗi, soodgu ɗuuɗngu',
    subServices: 'Tekiniki, ceede, sariya & waajaango',
    subInfra: 'Eggingol, jahdi, suudu & sembe',
    browseStores: 'Kawtale Tabitinaaɗe', searchStores: 'Yiylo dukkan kawtal…',
    registerCta: 'Winndito Kawtal maa', myStore: 'Dashboard Kawtal am',
    noStores: 'Alaa kawtal tabitinaango ɗoo tawo.', loadError: 'Loowaaki. Ƴeew internet maa.', retry: 'Taƴ kadi',
    verified: 'Kawtal Tabitinaango', pending: 'Tabitingol habbii', back: 'Rutto',
    verifyModal: 'Bambeh Corporate Tabitinii: kawtal ngal neldii dereeji RCCM e NIU goongɗi.',
    b2bPortal: 'Portaal B2B Kawtal', acceptsBulk: 'Kawtal ngal ina jaɓa sarɗi ɗuuɗɗi e soodgu kawtale.',
    minOrder: 'Sarɗi ɓuráaɗo', reqQuote: 'Ɗaɓɓo Coggu Kawtal', chatSales: 'Yeewto e Yeeyooɓe',
    tabAll: 'Kuuje Fof', tabBulk: 'Soodgu Ɗuuɗngu', tabAbout: 'Dow Amen',
    retailPrice: 'Coggu tokoson', bulkPrice: 'Coggu ɗuuɗngu', moq: 'MOQ', perUnit: 'e',
    aboutLegal: 'Sariya & Winnditinki', rccm: 'RCCM', niu: 'NIU / Tax ID', sector: 'Feccere', location: 'Nokkuure',
    verifyBanner: 'Tabitingol ina ƴetta balɗe golle 3\u201314. Soodgu ina waawi fuɗɗaade jooni; yimɓe ɗiɗo ina njogii hakke sariya timmuɗo.',
    regTitle: 'Winndito Kawtal maa', step: 'Ɗaɓɓal',
    s1: 'Profil Jaɓɓorde', s2: 'Tabitingol Sariya', s3: 'Eɓɓaango Njulaagu',
    fRegName: 'Innde sariya kawtal', fTradeName: 'Innde njulaagu (so seedi)',
    fCategory: 'Feccere mawnde', fRepName: 'Lomtiiɗo dagiiɗo', fRepEmail: 'Iimeel njulaagu',
    fRepPhone: 'Talifon kawtal', fRccm: 'Limoore RCCM', fNiu: 'Limoore jom-solli (NIU)',
    fDoc: 'Sertifika winnditinki / Karta lampoo (URL)', fCity: 'Saare', fAddress: 'Ñiiɓirde', fAbout: 'Dow kawtal maa',
    fAudience: 'Hombo njeeytaa?', audB2c: 'Yimɓe (B2C)', audB2b: 'Kawtale (B2B)', audHybrid: 'Ɗiɗi fof (Hybrid)',
    fMoq: 'Sarɗi ɓuráaɗo (misal "50 units")', fMinValue: 'Coggu sarɗi ɓuráaɗo (FCFA)',
    fPriceMode: 'Hollir coggu bana', ttc: 'TTC (bee lampoo)', ht: 'HT (aldaa lampoo)',
    next: 'Yeeso', prevBtn: 'Rutto', submit: 'Neldu ngam tabitingol', submitting: 'Neldugol…',
    regDone: 'Winnditinki neldaama! Tabitingol ina ƴetta balɗe golle 3\u201314. A waawi eɓɓude dukkan maa jooni.',
    needLogin: 'Naat ngam winnditinde kawtal.', reqField: 'Hebbin nokke naamnaaɗe.',
    quoteTitle: 'Ɗaɓɓo Coggu Kawtal', qQty: 'Keewal', qUnit: 'Ñuɗɗu (misal karton)',
    qLocation: 'Nokkuure jott ingal', qDate: 'Ñalngu jott ingal', qNotes: 'Naamaaɗi / takke',
    qSend: 'Neldu ɗaɓɓol', qSending: 'Neldugol…',
    qDone: 'Ɗaɓɓol coggu maa neldaama. Terɗe yeeyre njaabotoo e nde ɓatakuuji maa.', cancel: 'Haaytu',
    dashTitle: 'Dashboard Kawtal', dashStatus: 'Ngonka dukkan', dashProducts: 'Kuuje', dashQuotes: 'Ɗaɓɓe coggu',
    addProduct: 'Ɓeydu kuutu', noProducts: 'Alaa kuutu tawo.', noQuotes: 'Alaa ɗaɓɓol coggu tawo.',
  },
};

export type CorpStrings = (typeof CORP_STR)['en'];

export function corpStrings(rawLang: string): { s: CorpStrings; isRtl: boolean } {
  const key = rawLang === 'fulfulde' ? 'ff' : rawLang;
  const s = (CORP_STR as Record<string, CorpStrings>)[key] ?? CORP_STR.en;
  return { s, isRtl: key === 'ar' };
}

export const fmtXAF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? '—'
    : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

// --------------------------- Data helpers ---------------------------------
export async function fetchActiveStores(category?: CorpCategory, search?: string): Promise<CorporateStore[]> {
  let q = supabase.from('corporate_stores').select('*').eq('status', 'active').order('created_at', { ascending: false });
  if (category) q = q.eq('category', category);
  const { data, error } = await q.limit(60);
  if (error) throw error;
  let rows = (data ?? []) as CorporateStore[];
  if (search && search.trim()) {
    const t = search.trim().toLowerCase();
    rows = rows.filter(r =>
      r.registered_name.toLowerCase().includes(t) ||
      (r.trading_name ?? '').toLowerCase().includes(t) ||
      (r.city ?? '').toLowerCase().includes(t));
  }
  return rows;
}

export async function fetchStoreBySlugOrId(key: string): Promise<CorporateStore | null> {
  // try slug first, then id
  const bySlug = await supabase.from('corporate_stores').select('*').eq('slug', key).maybeSingle();
  if (bySlug.data) return bySlug.data as CorporateStore;
  const byId = await supabase.from('corporate_stores').select('*').eq('id', key).maybeSingle();
  return (byId.data as CorporateStore) ?? null;
}

export async function fetchStoreProducts(storeId: string): Promise<CorporateProduct[]> {
  const { data, error } = await supabase
    .from('corporate_products')
    .select('*')
    .eq('store_id', storeId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CorporateProduct[];
}

export async function fetchMyStores(userId: string): Promise<CorporateStore[]> {
  const { data: mem } = await supabase.from('corporate_members').select('store_id').eq('user_id', userId);
  const ids = (mem ?? []).map((m: { store_id: string }) => m.store_id);
  if (ids.length === 0) return [];
  const { data } = await supabase.from('corporate_stores').select('*').in('id', ids).order('created_at', { ascending: false });
  return (data ?? []) as CorporateStore[];
}

export async function submitQuote(input: {
  storeId: string; buyerId: string; productId?: string | null; quantity: number;
  unit?: string; location?: string; date?: string; notes?: string;
}): Promise<void> {
  const { error } = await supabase.from('corporate_quotes').insert({
    store_id: input.storeId, buyer_id: input.buyerId, product_id: input.productId ?? null,
    quantity: input.quantity, unit: input.unit ?? null, delivery_location: input.location ?? null,
    delivery_date: input.date || null, notes: input.notes ?? null, status: 'pending',
  });
  if (error) throw error;
}

export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
    + '-' + Math.random().toString(36).slice(2, 6);
}
// BAMBEH_END_TOKEN__CORPORATELIB__COMPLETE
