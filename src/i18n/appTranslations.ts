/**
 * src/i18n/appTranslations.ts — Bambeh Marketplace
 * © 2026 BAMBEH SARL. All rights reserved.
 *
 * MASTER translation dictionary for the entire app.
 * Languages: English (en) · French (fr) · Cameroonian Pidgin (pcm)
 *            Arabic (ar) · Fulfulde (ff)
 *
 * USAGE (in any page/component):
 *   import { useLang, t } from "@/hooks/useAppLang";
 *   const lang = useLang();
 *   <p>{t("save", lang)}</p>
 *
 * Keys are grouped by section for readability.
 * All string values must remain on ONE LINE inside the translation object.
 */

export type AppLang = "en" | "fr" | "pcm" | "ar" | "ff";

// ─────────────────────────────────────────────────────────────────────────────
// Helper type: every key maps to a record of the 5 languages.
// ─────────────────────────────────────────────────────────────────────────────
type TranslationMap = Record<string, Record<AppLang, string | ((...args: any[]) => string)>>;

export const T: TranslationMap = {

  // ── COMMON / GLOBAL ──────────────────────────────────────────────────────────
  back:             { en: "Back", fr: "Retour", pcm: "Go back", ar: "رجوع", ff: "Artii" },
  save:             { en: "Save", fr: "Enregistrer", pcm: "Save am", ar: "حفظ", ff: "Tofno" },
  cancel:           { en: "Cancel", fr: "Annuler", pcm: "No do am", ar: "إلغاء", ff: "Haɗtude" },
  confirm:          { en: "Confirm", fr: "Confirmer", pcm: "Confirm am", ar: "تأكيد", ff: "Jaɓɓaade" },
  submit:           { en: "Submit", fr: "Soumettre", pcm: "Send am", ar: "إرسال", ff: "Neldude" },
  close:            { en: "Close", fr: "Fermer", pcm: "Close am", ar: "إغلاق", ff: "Udde" },
  loading:          { en: "Loading...", fr: "Chargement...", pcm: "Loading...", ar: "جار التحميل...", ff: "Naatirde..." },
  error:            { en: "Something went wrong", fr: "Une erreur est survenue", pcm: "Something go wrong", ar: "حدث خطأ ما", ff: "Huunde wariima fenaande" },
  retry:            { en: "Try again", fr: "Réessayer", pcm: "Try again", ar: "حاول مجددًا", ff: "Taftinoo" },
  search:           { en: "Search", fr: "Rechercher", pcm: "Search", ar: "بحث", ff: "Yiylaade" },
  filter:           { en: "Filter", fr: "Filtrer", pcm: "Filter", ar: "تصفية", ff: "Suɓande" },
  sort:             { en: "Sort", fr: "Trier", pcm: "Sort am", ar: "ترتيب", ff: "Juɓɓinaade" },
  all:              { en: "All", fr: "Tout", pcm: "All", ar: "الكل", ff: "Fof" },
  noResults:        { en: "No results found", fr: "Aucun résultat trouvé", pcm: "Nothing dey here", ar: "لا توجد نتائج", ff: "Walaa huunde e yiytaade" },
  seeAll:           { en: "See all", fr: "Voir tout", pcm: "See all", ar: "عرض الكل", ff: "Yiy fof" },
  viewDetails:      { en: "View details", fr: "Voir les détails", pcm: "See details", ar: "عرض التفاصيل", ff: "Yiy kaaɗe" },
  share:            { en: "Share", fr: "Partager", pcm: "Share am", ar: "مشاركة", ff: "Wadande" },
  report:           { en: "Report", fr: "Signaler", pcm: "Report am", ar: "إبلاغ", ff: "Haalde" },
  favorite:         { en: "Save to favourites", fr: "Ajouter aux favoris", pcm: "Save for favourites", ar: "حفظ في المفضلة", ff: "Tofno e heewɓe" },
  unfavorite:       { en: "Remove from favourites", fr: "Retirer des favoris", pcm: "Remove from favourites", ar: "إزالة من المفضلة", ff: "Yottinde e heewɓe" },
  linkCopied:       { en: "Link copied!", fr: "Lien copié!", pcm: "Link don copy!", ar: "تم نسخ الرابط!", ff: "Naawdi nawnaa!" },
  copied:           { en: "Copied!", fr: "Copié!", pcm: "E don copy!", ar: "تم النسخ!", ff: "Nawnaa!" },
  yes:              { en: "Yes", fr: "Oui", pcm: "Yes", ar: "نعم", ff: "Eey" },
  no:               { en: "No", fr: "Non", pcm: "No", ar: "لا", ff: "Alaa" },
  or:               { en: "or", fr: "ou", pcm: "or", ar: "أو", ff: "walla" },
  and:              { en: "and", fr: "et", pcm: "and", ar: "و", ff: "e" },
  of:               { en: "of", fr: "de", pcm: "of", ar: "من", ff: "e" },
  by:               { en: "by", fr: "par", pcm: "by", ar: "بواسطة", ff: "e" },
  free:             { en: "Free", fr: "Gratuit", pcm: "Free", ar: "مجاني", ff: "Yoɓetaake" },
  new:              { en: "New", fr: "Nouveau", pcm: "New", ar: "جديد", ff: "Kesel" },
  comingSoon:       { en: "Coming soon", fr: "Bientôt disponible", pcm: "E go dey soon", ar: "قريبًا", ff: "Arta dey" },
  optional:         { en: "Optional", fr: "Optionnel", pcm: "Optional", ar: "اختياري", ff: "Ko feewi" },
  required:         { en: "Required", fr: "Obligatoire", pcm: "Required", ar: "مطلوب", ff: "Ko waɗi" },
  selectOne:        { en: "Select one", fr: "Sélectionner", pcm: "Pick one", ar: "اختر واحدًا", ff: "Suɓo gooto" },
  total:            { en: "Total", fr: "Total", pcm: "Total", ar: "المجموع", ff: "Fof" },
  price:            { en: "Price", fr: "Prix", pcm: "Price", ar: "السعر", ff: "Njamndi" },
  location:         { en: "Location", fr: "Localisation", pcm: "Location", ar: "الموقع", ff: "Jaɓirde" },
  posted:           { en: "Posted", fr: "Publié", pcm: "E post", ar: "نُشر", ff: "Neldaa" },
  updated:          { en: "Updated", fr: "Mis à jour", pcm: "Updated", ar: "محدَّث", ff: "Fotnodaa" },
  views:            { en: "views", fr: "vues", pcm: "views", ar: "مشاهدات", ff: "yiytaama" },
  active:           { en: "Active", fr: "Actif", pcm: "Active", ar: "نشط", ff: "Gollorɗo" },
  expired:          { en: "Expired", fr: "Expiré", pcm: "Expired", ar: "منتهي الصلاحية", ff: "Tiimaa" },
  pending:          { en: "Pending", fr: "En attente", pcm: "Dey wait", ar: "قيد الانتظار", ff: "E yaaɗaa" },
  approved:         { en: "Approved", fr: "Approuvé", pcm: "Dem approve am", ar: "موافق عليه", ff: "Jaɓaa" },
  rejected:         { en: "Rejected", fr: "Rejeté", pcm: "Dem reject am", ar: "مرفوض", ff: "Haɗaa" },
  noItemsYet:       { en: "No items yet", fr: "Aucun article pour l'instant", pcm: "Nothing dey here yet", ar: "لا توجد عناصر بعد", ff: "Walaa fof saa'i hannde" },
  loginRequired:    { en: "Please log in to continue", fr: "Veuillez vous connecter pour continuer", pcm: "Log in first make you continue", ar: "يرجى تسجيل الدخول للمتابعة", ff: "Naado tafto soo waɗaa" },
  pageNotFound:     { en: "Page not found", fr: "Page introuvable", pcm: "Dis page no dey", ar: "الصفحة غير موجودة", ff: "Papiye yiytaaka" },
  goHome:           { en: "Go to Home", fr: "Retour à l'accueil", pcm: "Go home", ar: "الذهاب للرئيسية", ff: "Yahoo galle" },

  // ── NAVIGATION / HEADER ──────────────────────────────────────────────────────
  home:             { en: "Home", fr: "Accueil", pcm: "Home", ar: "الرئيسية", ff: "Galle" },
  menu:             { en: "Menu", fr: "Menu", pcm: "Menu", ar: "القائمة", ff: "Listu" },
  notifications:    { en: "Notifications", fr: "Notifications", pcm: "Notification", ar: "الإشعارات", ff: "Kaaɗe" },
  messages:         { en: "Messages", fr: "Messages", pcm: "Messages", ar: "الرسائل", ff: "Tiitoonde" },
  profile:          { en: "Profile", fr: "Profil", pcm: "Profile", ar: "الملف الشخصي", ff: "Gamgal" },
  settings:         { en: "Settings", fr: "Paramètres", pcm: "Settings", ar: "الإعدادات", ff: "Toɓɓe" },
  logout:           { en: "Log out", fr: "Déconnexion", pcm: "Logout", ar: "تسجيل الخروج", ff: "Wurtude" },
  login:            { en: "Log in", fr: "Connexion", pcm: "Login", ar: "تسجيل الدخول", ff: "Naanaade" },
  register:         { en: "Register", fr: "S'inscrire", pcm: "Register", ar: "التسجيل", ff: "Ɗaɓɓude" },
  postAd:           { en: "Post an Ad", fr: "Publier une annonce", pcm: "Post Ad", ar: "نشر إعلان", ff: "Neld Gannde" },
  cart:             { en: "Cart", fr: "Panier", pcm: "Cart", ar: "عربة التسوق", ff: "Paani" },
  cartEmpty:        { en: "Your cart is empty", fr: "Votre panier est vide", pcm: "Your cart empty", ar: "سلة التسوق فارغة", ff: "Paani maa booƴii" },

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  footerTagline:    { en: "Cameroon's trusted marketplace", fr: "La place de marché de confiance du Cameroun", pcm: "Cameroon trusted market", ar: "السوق الموثوق في الكاميرون", ff: "Suudu njiydi Kameruun" },
  footerAbout:      { en: "About Bambeh", fr: "À propos de Bambeh", pcm: "About Bambeh", ar: "عن بامبيه", ff: "E dow Bambeh" },
  footerHelp:       { en: "Help Center", fr: "Centre d'aide", pcm: "Help Center", ar: "مركز المساعدة", ff: "Laaɓal Ballal" },
  footerTerms:      { en: "Terms & Conditions", fr: "Conditions Générales", pcm: "Terms & Conditions", ar: "الشروط والأحكام", ff: "Sarɗiiji" },
  footerPrivacy:    { en: "Privacy Policy", fr: "Politique de confidentialité", pcm: "Privacy Policy", ar: "سياسة الخصوصية", ff: "Sarɗi Gaasooji" },
  footerContact:    { en: "Contact Support", fr: "Contacter le support", pcm: "Contact Support", ar: "تواصل مع الدعم", ff: "Ɓanndital Ballal" },
  footerSafety:     { en: "Safety & Security", fr: "Sécurité", pcm: "Safety & Security", ar: "الأمان والسلامة", ff: "Kisinaare" },
  footerRights:     { en: "All rights reserved.", fr: "Tous droits réservés.", pcm: "All rights reserved.", ar: "جميع الحقوق محفوظة.", ff: "Hakke fof kuuɗi." },
  footerDownload:   { en: "Download the app", fr: "Télécharger l'application", pcm: "Download the app", ar: "تحميل التطبيق", ff: "Wurno app ɗoo" },
  footerLanguage:   { en: "Language", fr: "Langue", pcm: "Language", ar: "اللغة", ff: "Demngal" },
  footerSocial:     { en: "Follow us", fr: "Suivez-nous", pcm: "Follow us", ar: "تابعنا", ff: "Tullude min" },
  footerCategory:   { en: "Categories", fr: "Catégories", pcm: "Categories", ar: "الفئات", ff: "Teelte" },

  // ── MAIN LAYOUT ──────────────────────────────────────────────────────────────
  explore:          { en: "Explore", fr: "Explorer", pcm: "Explore", ar: "استكشاف", ff: "Gite" },
  categories:       { en: "Categories", fr: "Catégories", pcm: "Categories", ar: "الفئات", ff: "Teelte" },
  featured:         { en: "Featured", fr: "À la une", pcm: "Featured", ar: "مميز", ff: "Tiiɗngal" },
  trending:         { en: "Trending", fr: "Tendances", pcm: "Trending", ar: "رائج", ff: "Reedu" },
  nearby:           { en: "Nearby", fr: "À proximité", pcm: "Near me", ar: "بالقرب مني", ff: "Ko dow maa" },
  recentlyViewed:   { en: "Recently viewed", fr: "Récemment consultés", pcm: "You don see before", ar: "شوهد مؤخرًا", ff: "Yiytaama jooni" },
  recommended:      { en: "Recommended for you", fr: "Recommandé pour vous", pcm: "We pick am for you", ar: "موصى به لك", ff: "Ko tiiɗnaa maa" },

  // ── MARKETPLACE PAGE ─────────────────────────────────────────────────────────
  marketplace:      { en: "Marketplace", fr: "Marketplace", pcm: "Market", ar: "السوق", ff: "Suudu Njiydi" },
  marketplaceDesc:  { en: "Buy and sell new & used items", fr: "Achetez et vendez des articles neufs ou d'occasion", pcm: "Buy and sell your things", ar: "بيع وشراء المنتجات الجديدة والمستعملة", ff: "Soodde e yoɓde huunde" },
  sellItem:         { en: "Sell an item", fr: "Vendre un article", pcm: "Sell something", ar: "بيع عنصر", ff: "Yoɓdu huunde" },
  condition:        { en: "Condition", fr: "État", pcm: "Condition", ar: "الحالة", ff: "Himo" },
  conditionNew:     { en: "Brand new", fr: "Neuf", pcm: "Brand new", ar: "جديد تمامًا", ff: "Kesel kesel" },
  conditionUsed:    { en: "Used", fr: "Occasion", pcm: "Used", ar: "مستعمل", ff: "Jokki" },
  brand:            { en: "Brand", fr: "Marque", pcm: "Brand", ar: "العلامة التجارية", ff: "Marke" },
  category:         { en: "Category", fr: "Catégorie", pcm: "Category", ar: "الفئة", ff: "Teele" },
  description:      { en: "Description", fr: "Description", pcm: "Description", ar: "الوصف", ff: "Firo" },
  photos:           { en: "Photos", fr: "Photos", pcm: "Pictures", ar: "الصور", ff: "Foto" },
  addPhoto:         { en: "Add photo", fr: "Ajouter une photo", pcm: "Add picture", ar: "إضافة صورة", ff: "Fodo foto" },
  negotiable:       { en: "Price is negotiable", fr: "Prix négociable", pcm: "Price fit change", ar: "السعر قابل للتفاوض", ff: "Njamndi hulɓinee" },
  contactSeller:    { en: "Contact Seller", fr: "Contacter le vendeur", pcm: "Talk to seller", ar: "التواصل مع البائع", ff: "Ɓan yiɗdo yoɓde" },
  makeOffer:        { en: "Make an offer", fr: "Faire une offre", pcm: "Make offer", ar: "تقديم عرض", ff: "Wallirde" },
  itemSold:         { en: "Mark as sold", fr: "Marquer comme vendu", pcm: "Mark as sold", ar: "تعيين كمباع", ff: "Hollito yoɓdaa" },

  // ── JOBS PAGE ────────────────────────────────────────────────────────────────
  jobs:             { en: "Jobs", fr: "Emplois", pcm: "Jobs", ar: "الوظائف", ff: "Golle" },
  jobsDesc:         { en: "Find your next opportunity", fr: "Trouvez votre prochaine opportunité", pcm: "Find work here", ar: "ابحث عن فرصتك القادمة", ff: "Yiy golle maa" },
  postJob:          { en: "Post a job", fr: "Publier un emploi", pcm: "Post job", ar: "نشر وظيفة", ff: "Neldu Golle" },
  applyNow:         { en: "Apply now", fr: "Postuler maintenant", pcm: "Apply now", ar: "تقدَّم الآن", ff: "Ɗaɓɓo hannde" },
  jobType:          { en: "Job type", fr: "Type d'emploi", pcm: "Type of work", ar: "نوع الوظيفة", ff: "Mun'de golle" },
  fullTime:         { en: "Full-time", fr: "Plein temps", pcm: "Full time", ar: "دوام كامل", ff: "Fof sahaa" },
  partTime:         { en: "Part-time", fr: "Temps partiel", pcm: "Part time", ar: "دوام جزئي", ff: "Sahaa laabi" },
  remote:           { en: "Remote", fr: "Télétravail", pcm: "Remote", ar: "عن بُعد", ff: "E suudu" },
  contract:         { en: "Contract", fr: "Contrat", pcm: "Contract", ar: "عقد", ff: "Waaɓirde" },
  internship:       { en: "Internship", fr: "Stage", pcm: "Internship", ar: "تدريب", ff: "Janngo golle" },
  salary:           { en: "Salary", fr: "Salaire", pcm: "Salary", ar: "الراتب", ff: "Tiinde" },
  experience:       { en: "Experience", fr: "Expérience", pcm: "Experience", ar: "الخبرة", ff: "Janngal" },
  qualification:    { en: "Qualifications", fr: "Qualifications", pcm: "Qualifications", ar: "المؤهلات", ff: "Ndee-ndee" },
  deadline:         { en: "Application deadline", fr: "Date limite de candidature", pcm: "Deadline", ar: "الموعد النهائي للتقديم", ff: "Ɓennde" },
  jobsFound:        { en: (n: number) => `${n} job${n === 1 ? "" : "s"} found`, fr: (n: number) => `${n} offre${n === 1 ? "" : "s"} trouvée${n === 1 ? "" : "s"}`, pcm: (n: number) => `${n} job${n === 1 ? "" : "s"} dey`, ar: (n: number) => `تم إيجاد ${n} وظيفة`, ff: (n: number) => `${n} golle yiytaa` },

  // ── SERVICES PAGE ────────────────────────────────────────────────────────────
  services:         { en: "Services", fr: "Services", pcm: "Services", ar: "الخدمات", ff: "Tiiɗe" },
  servicesDesc:     { en: "Hire skilled professionals near you", fr: "Engagez des professionnels qualifiés près de vous", pcm: "Find skilled people near you", ar: "وظّف محترفين ماهرين بالقرب منك", ff: "Yiy tiiɗuɓe dow maa" },
  offerService:     { en: "Offer a service", fr: "Proposer un service", pcm: "Post your service", ar: "تقديم خدمة", ff: "Fod tiiɗe maa" },
  bookNow:          { en: "Book now", fr: "Réserver maintenant", pcm: "Book am now", ar: "احجز الآن", ff: "Sooddo hannde" },
  serviceType:      { en: "Service type", fr: "Type de service", pcm: "Type of service", ar: "نوع الخدمة", ff: "Mun'de tiiɗe" },
  availability:     { en: "Availability", fr: "Disponibilité", pcm: "When dem dey", ar: "التوفر", ff: "Himo waawi" },
  rate:             { en: "Rate", fr: "Tarif", pcm: "Rate", ar: "السعر", ff: "Njamndi" },
  perHour:          { en: "per hour", fr: "par heure", pcm: "per hour", ar: "في الساعة", ff: "to saate" },
  perDay:           { en: "per day", fr: "par jour", pcm: "per day", ar: "في اليوم", ff: "to ñalorma" },
  perJob:           { en: "per job", fr: "par prestation", pcm: "per job", ar: "للخدمة الكاملة", ff: "to tiiɗe" },
  bookingRequest:   { en: "Booking request sent", fr: "Demande de réservation envoyée", pcm: "Booking request don go", ar: "تم إرسال طلب الحجز", ff: "Ɗaɓɓudi sooddi neldaa" },
  providerProfile:  { en: "Provider profile", fr: "Profil du prestataire", pcm: "Provider profile", ar: "ملف مقدم الخدمة", ff: "Gamgal boodiiɗo" },

  // ── RENTALS PAGE ─────────────────────────────────────────────────────────────
  rentals:          { en: "Rentals", fr: "Locations", pcm: "Rentals", ar: "الإيجارات", ff: "Njooɗam" },
  rentalsDesc:      { en: "Apartments, rooms & houses for rent", fr: "Appartements, chambres et maisons à louer", pcm: "Rent house, room or flat", ar: "شقق وغرف ومنازل للإيجار", ff: "Njooɗam suudu e ɗo woni" },
  listProperty:     { en: "List your property", fr: "Publier votre bien", pcm: "Post your property", ar: "أعلن عن عقارك", ff: "Neldu suudu maa" },
  propertyType:     { en: "Property type", fr: "Type de bien", pcm: "Type of place", ar: "نوع العقار", ff: "Mun'de suudu" },
  bedrooms:         { en: "Bedrooms", fr: "Chambres", pcm: "Rooms", ar: "غرف النوم", ff: "Suudu ŋoɓɗi" },
  bathrooms:        { en: "Bathrooms", fr: "Salles de bain", pcm: "Bathrooms", ar: "الحمامات", ff: "Suudu jiimde" },
  furnished:        { en: "Furnished", fr: "Meublé", pcm: "Furnished", ar: "مفروش", ff: "Kaaɗtaa" },
  unfurnished:      { en: "Unfurnished", fr: "Non meublé", pcm: "Not furnished", ar: "غير مفروش", ff: "Kaaɗtaaka" },
  perMonth:         { en: "per month", fr: "par mois", pcm: "per month", ar: "شهريًا", ff: "to lewru" },
  perYear:          { en: "per year", fr: "par an", pcm: "per year", ar: "سنويًا", ff: "to hitaande" },
  deposit:          { en: "Deposit", fr: "Dépôt de garantie", pcm: "Deposit", ar: "وديعة", ff: "Sooddi" },
  contactOwner:     { en: "Contact Owner", fr: "Contacter le propriétaire", pcm: "Talk to owner", ar: "التواصل مع المالك", ff: "Ɓan boɗeejo" },
  bookVisit:        { en: "Book a visit", fr: "Planifier une visite", pcm: "Book visit", ar: "حجز زيارة", ff: "Sooddo doolo" },
  included:         { en: "What's included", fr: "Ce qui est inclus", pcm: "Wetin dey inside", ar: "ما هو مشمول", ff: "Ko tagi" },
  subscribe:        { en: "Subscribe now", fr: "S'abonner maintenant", pcm: "Subscribe now", ar: "اشترك الآن", ff: "Sooddo hannde" },
  cancelSub:        { en: "Cancel subscription", fr: "Annuler l'abonnement", pcm: "Cancel subscription", ar: "إلغاء الاشتراك", ff: "Haɗt sooddi" },
  renewsOn:         { en: "Renews on", fr: "Renouvellement le", pcm: "E go renew on", ar: "يتجدد في", ff: "E toɓɓoo e" },
  subExpired:       { en: "Your subscription has expired", fr: "Votre abonnement a expiré", pcm: "Your subscription don expire", ar: "انتهت صلاحية اشتراكك", ff: "Sooddi maa tiimii" },

  // ── SUPPORT BAMBEH PAGE ──────────────────────────────────────────────────────
  supportBambeh:    { en: "Support Bambeh", fr: "Soutenir Bambeh", pcm: "Support Bambeh", ar: "دعم بامبيه", ff: "Ballal Bambeh" },
  supportBambehDesc:{ en: "Help us grow and keep the platform free", fr: "Aidez-nous à grandir et garder la plateforme gratuite", pcm: "Help us grow and keep it free", ar: "ساعدنا على النمو والإبقاء على المنصة مجانية", ff: "Ballam, hukk Bambeh teri" },
  donate:           { en: "Donate", fr: "Faire un don", pcm: "Donate", ar: "تبرع", ff: "Rokku" },
  donateAmount:     { en: "Choose amount", fr: "Choisir le montant", pcm: "Choose how much", ar: "اختر المبلغ", ff: "Suɓo nde" },
  oneTimeDonation:  { en: "One-time donation", fr: "Don unique", pcm: "One time donation", ar: "تبرع لمرة واحدة", ff: "Rokkuɗe kootuko" },
  monthlySupport:   { en: "Monthly support", fr: "Soutien mensuel", pcm: "Monthly support", ar: "دعم شهري", ff: "Ballal e lewru" },
  thankYouSupport:  { en: "Thank you for supporting Bambeh!", fr: "Merci de soutenir Bambeh!", pcm: "Thank you for your support!", ar: "شكرًا لدعمك بامبيه!", ff: "A jaraama ballal maa!" },
  referFriend:      { en: "Refer a friend", fr: "Parrainer un ami", pcm: "Refer your friend", ar: "قدّم صديقًا", ff: "Ɓenno yiɗɗo" },
  referralBonus:    { en: "Earn coins for each referral", fr: "Gagnez des pièces pour chaque parrainage", pcm: "Earn coins when you refer", ar: "اكسب عملات مقابل كل ترشيح", ff: "Hoot ceede to ɓennugol" },

  // ── ABOUT US PAGE ────────────────────────────────────────────────────────────
  about:            { en: "About Us", fr: "À propos", pcm: "About Us", ar: "معلومات عنا", ff: "E dow min" },
  aboutDesc:        { en: "Learn more about BAMBEH SARL", fr: "En savoir plus sur BAMBEH SARL", pcm: "Learn about Bambeh", ar: "تعرف على المزيد حول بامبيه SARL", ff: "Janno e BAMBEH SARL" },
  ourMission:       { en: "Our Mission", fr: "Notre Mission", pcm: "Our Mission", ar: "مهمتنا", ff: "Miijol memen" },
  ourVision:        { en: "Our Vision", fr: "Notre Vision", pcm: "Our Vision", ar: "رؤيتنا", ff: "Anniya memen" },
  ourTeam:          { en: "Our Team", fr: "Notre Équipe", pcm: "Our Team", ar: "فريقنا", ff: "Koodi memen" },
  ourStory:         { en: "Our Story", fr: "Notre Histoire", pcm: "Our Story", ar: "قصتنا", ff: "Haala memen" },
  foundedIn:        { en: "Founded in Cameroon", fr: "Fondé au Cameroun", pcm: "Founded for Cameroon", ar: "تأسست في الكاميرون", ff: "Fuɗdaa e Kameruun" },
  contactUs:        { en: "Contact us", fr: "Nous contacter", pcm: "Contact us", ar: "تواصل معنا", ff: "Ɓan min" },
  followUs:         { en: "Follow us", fr: "Suivez-nous", pcm: "Follow us", ar: "تابعنا", ff: "Tullude min" },

  // ── VIEW COMPANY PROFILE PAGE ────────────────────────────────────────────────
  companyProfile:   { en: "Company Profile", fr: "Profil de l'Entreprise", pcm: "Company Profile", ar: "ملف الشركة", ff: "Gamgal Sosirde" },
  companyName:      { en: "Company name", fr: "Nom de l'entreprise", pcm: "Company name", ar: "اسم الشركة", ff: "Innde sosirde" },
  registrationNo:   { en: "Registration no.", fr: "Numéro d'immatriculation", pcm: "Reg number", ar: "رقم التسجيل", ff: "Nimero" },
  address:          { en: "Address", fr: "Adresse", pcm: "Address", ar: "العنوان", ff: "Ɗo Woni" },
  phone:            { en: "Phone", fr: "Téléphone", pcm: "Phone", ar: "الهاتف", ff: "Telefon" },
  email:            { en: "Email", fr: "E-mail", pcm: "Email", ar: "البريد الإلكتروني", ff: "Email" },
  website:          { en: "Website", fr: "Site web", pcm: "Website", ar: "الموقع الإلكتروني", ff: "Laaɓal" },
  established:      { en: "Established", fr: "Créé en", pcm: "Founded", ar: "تأسست", ff: "Fuɗdaa" },
  industry:         { en: "Industry", fr: "Secteur", pcm: "Industry", ar: "القطاع", ff: "Golle" },
  employees:        { en: "Employees", fr: "Employés", pcm: "Workers", ar: "الموظفون", ff: "Gollooji" },
  verified:         { en: "Verified company", fr: "Entreprise vérifiée", pcm: "Verified company", ar: "شركة موثقة", ff: "Sosirde jaɓɓaama" },

  // ── HELP CENTER PAGE ─────────────────────────────────────────────────────────
  helpCenter:       { en: "Help Center", fr: "Centre d'aide", pcm: "Help Center", ar: "مركز المساعدة", ff: "Laaɓal Ballal" },
  helpCenterDesc:   { en: "Find answers to your questions", fr: "Trouvez des réponses à vos questions", pcm: "Find answers here", ar: "ابحث عن إجابات لأسئلتك", ff: "Yiy jaabaaji ɗaɓɓaajamee" },
  faq:              { en: "Frequently asked questions", fr: "Questions fréquemment posées", pcm: "FAQ", ar: "الأسئلة الشائعة", ff: "Ɗaɓɓaaje heewɗe" },
  gettingStarted:   { en: "Getting started", fr: "Démarrer", pcm: "How to start", ar: "البدء", ff: "Fuɗɗude" },
  accountHelp:      { en: "Account & Profile", fr: "Compte & Profil", pcm: "Account and Profile", ar: "الحساب والملف الشخصي", ff: "Askon e Gamgal" },
  buyingHelp:       { en: "Buying & Selling", fr: "Achat & Vente", pcm: "Buying and Selling", ar: "الشراء والبيع", ff: "Soodde e Yoɓde" },
  paymentHelp:      { en: "Payments", fr: "Paiements", pcm: "Payments", ar: "المدفوعات", ff: "Yoɓde ceede" },
  safetyHelp:       { en: "Safety & Scams", fr: "Sécurité & Arnaques", pcm: "Safety and Scams", ar: "الأمان والاحتيال", ff: "Kisinaare e Fenaande" },
  technicalHelp:    { en: "Technical issues", fr: "Problèmes techniques", pcm: "Technical problems", ar: "المشكلات التقنية", ff: "Tuma jiiɓi" },
  searchHelp:       { en: "Search help", fr: "Aide à la recherche", pcm: "Search help", ar: "مساعدة البحث", ff: "Ballal yiylaade" },
  wasHelpful:       { en: "Was this helpful?", fr: "Cela vous a-t-il aidé?", pcm: "E help you?", ar: "هل كان هذا مفيدًا؟", ff: "Ɗon ballii?" },
  stillNeedHelp:    { en: "Still need help? Contact support", fr: "Besoin d'aide? Contactez le support", pcm: "You still need help? Contact us", ar: "لا تزال بحاجة للمساعدة؟ تواصل مع الدعم", ff: "E waɗii? Ɓan ballal" },

  // ── CONTACT SUPPORT PAGE ─────────────────────────────────────────────────────
  contactSupport:   { en: "Contact Support", fr: "Contacter le Support", pcm: "Contact Support", ar: "التواصل مع الدعم", ff: "Ɓan Ballal" },
  contactSupportDesc:{ en: "We're here to help — reach out anytime", fr: "Nous sommes là pour vous aider — contactez-nous à tout moment", pcm: "We dey here to help you anytime", ar: "نحن هنا للمساعدة — تواصل معنا في أي وقت", ff: "Min ɗoo e ballugol — Ɓan saa'i fof" },
  yourName:         { en: "Your name", fr: "Votre nom", pcm: "Your name", ar: "اسمك", ff: "Innde maa" },
  yourEmail:        { en: "Your email", fr: "Votre e-mail", pcm: "Your email", ar: "بريدك الإلكتروني", ff: "Email maa" },
  yourMessage:      { en: "Your message", fr: "Votre message", pcm: "Your message", ar: "رسالتك", ff: "Haala maa" },
  subject:          { en: "Subject", fr: "Objet", pcm: "Subject", ar: "الموضوع", ff: "Miijo" },
  sendMessage:      { en: "Send message", fr: "Envoyer le message", pcm: "Send message", ar: "إرسال الرسالة", ff: "Neldu haala" },
  messageSent:      { en: "Message sent! We'll reply within 24 hours.", fr: "Message envoyé! Nous répondrons dans 24 heures.", pcm: "Message don go! We go reply within 24 hours.", ar: "تم إرسال الرسالة! سنرد خلال 24 ساعة.", ff: "Haala neldiima! Min yettotoo e sahaa 24." },
  liveChat:         { en: "Live chat", fr: "Chat en direct", pcm: "Live chat", ar: "المحادثة المباشرة", ff: "Haala hannde" },
  responseTime:     { en: "Average response time: under 2 hours", fr: "Délai de réponse moyen: moins de 2 heures", pcm: "We usually reply in 2 hours", ar: "وقت الاستجابة المتوسط: أقل من ساعتين", ff: "Yettotoo ko ɓuri 2 saate" },

  // ── SAFETY & SECURITY PAGE ───────────────────────────────────────────────────
  safetySecurity:   { en: "Safety & Security", fr: "Sécurité", pcm: "Safety & Security", ar: "الأمان والسلامة", ff: "Kisinaare" },
  safetyDesc:       { en: "Your safety is our top priority", fr: "Votre sécurité est notre priorité absolue", pcm: "Your safety na our priority", ar: "سلامتك هي أولويتنا القصوى", ff: "Kisinaare maa ko waɗi fof" },
  avoidScams:       { en: "How to avoid scams", fr: "Comment éviter les arnaques", pcm: "How to no fall for scam", ar: "كيفية تجنب الاحتيال", ff: "No haɗmi fenaande" },
  reportScam:       { en: "Report a scam", fr: "Signaler une arnaque", pcm: "Report scam", ar: "الإبلاغ عن عملية احتيال", ff: "Haald fenaande" },
  securePayments:   { en: "Secure payment tips", fr: "Conseils de paiement sécurisé", pcm: "How to pay safe", ar: "نصائح الدفع الآمن", ff: "Yoɓde kisinaare" },
  doNotShare:       { en: "Never share your PIN or password", fr: "Ne partagez jamais votre PIN ou mot de passe", pcm: "Never share your PIN or password", ar: "لا تشارك أبدًا رقم التعريف الشخصي أو كلمة المرور", ff: "Wayaa wadande PIN maa walla dandal" },
  trustBadge:       { en: "Bambeh trust badge", fr: "Badge de confiance Bambeh", pcm: "Bambeh trust badge", ar: "شارة الثقة من بامبيه", ff: "Kuccam njilmoyam Bambeh" },
  twoFactor:        { en: "Two-factor authentication", fr: "Authentification à deux facteurs", pcm: "Two-factor authentication", ar: "المصادقة الثنائية", ff: "Damal ɗiɗi" },
  blockedUsers:     { en: "Blocked users", fr: "Utilisateurs bloqués", pcm: "Blocked users", ar: "المستخدمون المحظورون", ff: "Ɓe haɗtaa" },
  safetyTip:        { en: "Safety tip:", fr: "Conseil de sécurité:", pcm: "Safety tip:", ar: ":نصيحة أمان", ff: "Miijo kisinaare:" },
  safetyText:       { en: "Always meet in a public place and inform someone of your plans.", fr: "Rencontrez toujours dans un lieu public et informez quelqu'un de vos plans.", pcm: "Always meet for public place and tell somebody your plans.", ar: "التقِ دائمًا في مكان عام وأخبر شخصًا ما بخططك.", ff: "Meetir ko e ɗo ngoodi fof, min haaldo yiɗɗo maa." },

  // ── TERMS OF SERVICE PAGE ────────────────────────────────────────────────────
  termsTitle:       { en: "Terms & Conditions", fr: "Conditions Générales d'Utilisation", pcm: "Terms and Conditions", ar: "الشروط والأحكام", ff: "Sarɗiiji e Golle" },
  termsDesc:        { en: "Please read these terms carefully before using Bambeh", fr: "Veuillez lire attentivement ces conditions avant d'utiliser Bambeh", pcm: "Read this before you use Bambeh", ar: "يرجى قراءة هذه الشروط بعناية قبل استخدام بامبيه", ff: "Jan ɗee sarɗiiji ɓuri waɗugol Bambeh" },
  lastUpdated:      { en: "Last updated", fr: "Dernière mise à jour", pcm: "Last updated", ar: "آخر تحديث", ff: "Fotnodaa ɓenndi" },
  acceptTerms:      { en: "I accept the terms", fr: "J'accepte les conditions", pcm: "I accept am", ar: "أقبل الشروط", ff: "Jaɓmii sarɗiiji" },
  tableOfContents:  { en: "Table of contents", fr: "Table des matières", pcm: "Table of contents", ar: "جدول المحتويات", ff: "Listu kaaɗe" },
  userObligations:  { en: "User obligations", fr: "Obligations de l'utilisateur", pcm: "Your obligations", ar: "التزامات المستخدم", ff: "Ko gollooje" },
  prohibitedContent:{ en: "Prohibited content", fr: "Contenu interdit", pcm: "What no dey allowed", ar: "المحتوى المحظور", ff: "Ko haɗaa" },
  disclaimer:       { en: "Disclaimer", fr: "Avertissement", pcm: "Disclaimer", ar: "إخلاء مسؤولية", ff: "Tiitoonde" },
  governingLaw:     { en: "Governing law", fr: "Droit applicable", pcm: "Governing law", ar: "القانون الحاكم", ff: "Laawol keɓtinaaɗo" },

  // ── PRIVACY POLICY PAGE ──────────────────────────────────────────────────────
  privacyTitle:     { en: "Privacy Policy", fr: "Politique de confidentialité", pcm: "Privacy Policy", ar: "سياسة الخصوصية", ff: "Sarɗi Gaasooji" },
  privacyDesc:      { en: "How BAMBEH SARL collects and uses your data", fr: "Comment BAMBEH SARL collecte et utilise vos données", pcm: "How Bambeh uses your data", ar: "كيفية جمع بامبيه لبياناتك واستخدامها", /*fr2*/ _fr2: "Comment BAMBEH SARL utilise vos données", ff: "No Bambeh waɗi ɗatum maa" },
  dataCollected:    { en: "Data we collect", fr: "Données que nous collectons", pcm: "Data we dey collect", ar: "البيانات التي نجمعها", ff: "Ɗatum min hoɗtaa" },
  howWeUseData:     { en: "How we use your data", fr: "Comment nous utilisons vos données", pcm: "How we use your data", ar: "كيفية استخدامنا لبياناتك", ff: "No waɗmi ɗatum maa" },
  dataSharing:      { en: "Data sharing", fr: "Partage des données", pcm: "Data sharing", ar: "مشاركة البيانات", ff: "Wadande ɗatum" },
  yourRights:       { en: "Your rights", fr: "Vos droits", pcm: "Your rights", ar: "حقوقك", ff: "Hakke maa" },
  cookies:          { en: "Cookies", fr: "Cookies", pcm: "Cookies", ar: "ملفات تعريف الارتباط", ff: "Cookies" },
  deleteAccount:    { en: "Delete my account", fr: "Supprimer mon compte", pcm: "Delete my account", ar: "حذف حسابي", ff: "Soo askon am" },
  dataDeletion:     { en: "Request data deletion", fr: "Demander la suppression des données", pcm: "Request data deletion", ar: "طلب حذف البيانات", ff: "Ɗaɓɓo sooddi ɗatum" },
  privacyContact:   { en: "Privacy questions? Email", fr: "Questions sur la confidentialité? Écrivez à", pcm: "Privacy question? Email", ar: "أسئلة عن الخصوصية؟ أرسل بريدًا إلى", ff: "Ɗaɓɓaaje gaasooji? Email" },

  // ── PAYMENT UI (shared across pages) ─────────────────────────────────────────
  payWithMoMo:      { en: "Pay with Mobile Money", fr: "Payer avec Mobile Money", pcm: "Pay with Mobile Money", ar: "الدفع بالمحفظة المحمولة", ff: "Yoɓo e Mobile Money" },
  poweredBy:        { en: "Powered by CamPay · MTN MoMo & Orange Money", fr: "Propulsé par CamPay · MTN MoMo & Orange Money", pcm: "Na CamPay power am · MTN MoMo & Orange Money", ar: "مدعوم بـ CamPay · MTN MoMo و Orange Money", ff: "CamPay saɗii · MTN MoMo & Orange Money" },
  mtnOrOrange:      { en: "MTN or Orange phone number", fr: "Numéro MTN ou Orange", pcm: "MTN or Orange number", ar: "رقم MTN أو Orange", ff: "Nimero MTN walla Orange" },
  ussdPrompt:       { en: "You will receive a USSD prompt to confirm", fr: "Vous recevrez une invite USSD pour confirmer", pcm: "You go receive USSD prompt to confirm", ar: "ستتلقى طلب USSD للتأكيد", ff: "E yettoyre USSD e jaɓngol" },
  confirmPay:       { en: (n: number) => `Pay ${n.toLocaleString("fr-CM")} XAF`, fr: (n: number) => `Payer ${n.toLocaleString("fr-CM")} XAF`, pcm: (n: number) => `Pay ${n.toLocaleString("fr-CM")} XAF`, ar: (n: number) => `ادفع ${n.toLocaleString("ar-DZ")} XAF`, ff: (n: number) => `Yoɓo ${n.toLocaleString("fr-CM")} XAF` },
  sendingRequest:   { en: "Sending...", fr: "Envoi en cours...", pcm: "Dey send...", ar: "جار الإرسال...", ff: "Neldude..." },
  checkPhone:       { en: "Check your phone", fr: "Vérifiez votre téléphone", pcm: "Check your phone", ar: "تحقق من هاتفك", ff: "Yiy Telefon maa" },
  enterPin:         { en: "Enter your PIN to confirm the payment", fr: "Entrez votre PIN pour confirmer le paiement", pcm: "Enter your PIN to confirm", ar: "أدخل رقم التعريف الشخصي لتأكيد الدفع", ff: "Nelo PIN maa e jaɓngol" },
  waiting:          { en: (m: number, s: number) => `Waiting… ${m}:${String(s).padStart(2, "0")}`, fr: (m: number, s: number) => `En attente… ${m}:${String(s).padStart(2, "0")}`, pcm: (m: number, s: number) => `Waiting… ${m}:${String(s).padStart(2, "0")}`, ar: (m: number, s: number) => `انتظار… ${m}:${String(s).padStart(2, "0")}`, ff: (m: number, s: number) => `Yaɗde… ${m}:${String(s).padStart(2, "0")}` },
  processing:       { en: "Processing...", fr: "Traitement en cours...", pcm: "E process...", ar: "جار المعالجة...", ff: "Tiiñude..." },
  paymentConfirmed: { en: "Payment confirmed!", fr: "Paiement confirmé!", pcm: "Payment don confirm!", ar: "تم تأكيد الدفع!", ff: "Yoɓde jaɓɓii!" },
  orderProcessed:   { en: "Your order has been processed", fr: "Votre commande a été traitée", pcm: "Your order don process", ar: "تمت معالجة طلبك", ff: "Ɗaɓɓaade maa waɗaa" },
  payFailed:        { en: "Payment failed", fr: "Échec du paiement", pcm: "Payment fail", ar: "فشل الدفع", ff: "Yoɓde fenaanii" },
  questions:        { en: "Questions?", fr: "Des questions?", pcm: "You get question?", ar: "هل لديك أسئلة؟", ff: "Ɗaɓɓaade fof?" },
  securedEncrypted: { en: "Secured & encrypted", fr: "Sécurisé & chiffré", pcm: "Secured and encrypted", ar: "محمي ومشفر", ff: "Kisinaama e ɓoggoodaama" },
  orderPlaced:      { en: "Order placed!", fr: "Commande passée!", pcm: "Order don place!", ar: "تم تقديم الطلب!", ff: "Ɗaɓɓaade fuɗii!" },
  payConfirmed:     { en: "Payment confirmed. Your order is on its way.", fr: "Paiement confirmé. Votre commande est en route.", pcm: "Payment confirmed. Your order dey come.", ar: "تم تأكيد الدفع. طلبك في الطريق.", ff: "Yoɓde jaɓɓii. Ɗaɓɓaade maa arii." },
  trackOrder:       { en: "Track my order", fr: "Suivre ma commande", pcm: "Track my order", ar: "تتبع طلبي", ff: "Takk ɗaɓɓaade am" },
  keepShopping:     { en: "Keep shopping", fr: "Continuer les achats", pcm: "Continue shopping", ar: "مواصلة التسوق", ff: "Jokko soodde" },
  addToCartBtn:     { en: "Add to cart", fr: "Ajouter au panier", pcm: "Add to cart", ar: "أضف إلى السلة", ff: "Fodo e paani" },
  addedBtn:         { en: "Added!", fr: "Ajouté!", pcm: "Added!", ar: "تمت الإضافة!", ff: "Fodaa!" },
  addedToCart:      { en: "Added to cart", fr: "Ajouté au panier", pcm: "Added to cart", ar: "تمت الإضافة إلى السلة", ff: "Fodaa e paani" },
  buyNow:           { en: "Buy now", fr: "Acheter maintenant", pcm: "Buy am now", ar: "اشترِ الآن", ff: "Sooddo hannde" },
  payNow:           { en: "Pay now", fr: "Payer maintenant", pcm: "Pay now", ar: "ادفع الآن", ff: "Yoɓo hannde" },
  whatsapp:         { en: "WhatsApp", fr: "WhatsApp", pcm: "WhatsApp", ar: "واتساب", ff: "WhatsApp" },
  call:             { en: "Call", fr: "Appeler", pcm: "Call am", ar: "اتصال", ff: "Nodd" },
  seller:           { en: "Seller", fr: "Vendeur", pcm: "Seller", ar: "البائع", ff: "Yiɗɗo yoɓde" },
  reportListing:    { en: "Report this listing", fr: "Signaler cette annonce", pcm: "Report dis listing", ar: "الإبلاغ عن هذا الإعلان", ff: "Haald gannde ɗon" },

};

/**
 * Look up a translation key for the given language.
 * Falls back to English if the key or language is missing.
 */
export function t(
  key: string,
  lang: AppLang
): string | ((...args: any[]) => string) {
  const entry = T[key];
  if (!entry) return key; // key not found → return raw key
  return entry[lang] ?? entry["en"] ?? key;
}

