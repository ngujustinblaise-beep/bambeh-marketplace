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
  loading:          { en: "Loading…", fr: "Chargement…", pcm: "E dey load…", ar: "جارٍ التحميل…", ff: "E heɓii…" },
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

  // ── VEHICLES PAGE ────────────────────────────────────────────────────────────
  vehicles:         { en: "Vehicles", fr: "Véhicules", pcm: "Vehicles", ar: "المركبات", ff: "Kaɓɓirgel" },
  vehiclesDesc:     { en: "Cars, motos & transport for sale or rent", fr: "Voitures, motos et transports à vendre ou louer", pcm: "Buy, sell or rent vehicles", ar: "سيارات ودراجات وسيلة نقل للبيع أو الإيجار", ff: "Soodde yoɓde kaɓɓirgel" },
  sellVehicle:      { en: "Sell your vehicle", fr: "Vendre votre véhicule", pcm: "Sell your vehicle", ar: "بيع مركبتك", ff: "Yoɓdu kaɓɓirgel maa" },
  vehicleType:      { en: "Vehicle type", fr: "Type de véhicule", pcm: "Type of vehicle", ar: "نوع المركبة", ff: "Mun'de kaɓɓirgel" },
  make:             { en: "Make", fr: "Marque", pcm: "Brand", ar: "الماركة", ff: "Marke" },
  model:            { en: "Model", fr: "Modèle", pcm: "Model", ar: "الموديل", ff: "Forme" },
  year:             { en: "Year", fr: "Année", pcm: "Year", ar: "السنة", ff: "Hitaande" },
  mileage:          { en: "Mileage", fr: "Kilométrage", pcm: "Mileage", ar: "عدد الكيلومترات", ff: "Ɗo warii" },
  fuelType:         { en: "Fuel type", fr: "Type de carburant", pcm: "Fuel type", ar: "نوع الوقود", ff: "Joom dooɗo" },
  transmission:     { en: "Transmission", fr: "Transmission", pcm: "Gear", ar: "ناقل الحركة", ff: "Juɓɓol" },
  colour:           { en: "Colour", fr: "Couleur", pcm: "Color", ar: "اللون", ff: "Renndu" },
  testDrive:        { en: "Request test drive", fr: "Demander un essai", pcm: "Test drive am", ar: "طلب تجربة قيادة", ff: "Ɗaɓɓo janngol" },
  contactDealer:    { en: "Contact seller", fr: "Contacter le vendeur", pcm: "Talk to seller", ar: "التواصل مع البائع", ff: "Ɓan yiɗdo yoɓde" },

  // ── EXCHANGE PAGE ────────────────────────────────────────────────────────────
  exchange:         { en: "Exchange", fr: "Échange", pcm: "Exchange", ar: "التبادل", ff: "Njiɓrigu" },
  exchangeDesc:     { en: "Swap your items with others", fr: "Échangez vos objets avec d'autres", pcm: "Swap your things with people", ar: "بادل أشياءك مع الآخرين", ff: "Njiɓ huunde maa e ɓe keddii" },
  postExchange:     { en: "Post an exchange", fr: "Publier un échange", pcm: "Post exchange", ar: "نشر عرض تبادل", ff: "Neldu njiɓrigu" },
  lookingFor:       { en: "Looking for", fr: "Recherche", pcm: "I dey find", ar: "أبحث عن", ff: "E yiilaade" },
  offering:         { en: "Offering", fr: "Proposant", pcm: "I go give", ar: "أقدم", ff: "E naaldude" },
  makeOffer2:       { en: "Make swap offer", fr: "Proposer un échange", pcm: "Offer to swap", ar: "عرض مقايضة", ff: "Wallirde njiɓrigu" },
  swapDetails:      { en: "Swap details", fr: "Détails de l'échange", pcm: "Swap details", ar: "تفاصيل المقايضة", ff: "Kaaɗe njiɓrigu" },

  // ── FARM FRESH PAGE ──────────────────────────────────────────────────────────
  farmFresh:        { en: "Farm Fresh", fr: "Produits Frais", pcm: "Farm Fresh", ar: "منتجات طازجة", ff: "Kosam Mbuytooji" },
  farmFreshDesc:    { en: "Fresh produce direct from Cameroonian farmers", fr: "Produits frais directement des agriculteurs camerounais", pcm: "Fresh food from farm", ar: "منتجات طازجة مباشرة من المزارعين الكاميرونيين", ff: "Ko mbuytooji e galleeji" },
  organic:          { en: "Organic", fr: "Biologique", pcm: "Organic", ar: "عضوي", ff: "Ladde" },
  freshness:        { en: "Freshness guaranteed", fr: "Fraîcheur garantie", pcm: "Fresh guaranteed", ar: "مضمون الطازجية", ff: "Mbuytooji garataako" },
  harvestDate:      { en: "Harvest date", fr: "Date de récolte", pcm: "Harvest date", ar: "تاريخ الحصاد", ff: "Ñalnde yillunde" },
  unit:             { en: "Unit", fr: "Unité", pcm: "Unit", ar: "الوحدة", ff: "Darnde" },
  stock:            { en: "In stock:", fr: "En stock:", pcm: "E stock:", ar: ":في المخزن", ff: "E kuuje:" },
  deliveryAvail:    { en: "Delivery available", fr: "Livraison disponible", pcm: "Delivery dey", ar: "التوصيل متاح", ff: "Njangu waawi" },
  sellProduce:      { en: "Sell your produce", fr: "Vendre vos produits", pcm: "Sell your farm things", ar: "بيع منتجاتك", ff: "Yoɓdu ko maa" },
  joinGroupBuy:     { en: "Join Group Buy", fr: "Rejoindre un Achat Groupé", pcm: "Join Group Buy", ar: "انضم لشراء جماعي", ff: "Naado Njiɓrigu" },
  joinGroupBuySub:  { en: "Buy together and save more", fr: "Achetez ensemble et économisez", pcm: "Buy together, save money", ar: "تسوقوا معًا ووفروا المزيد", ff: "Soodde fof, tofno ceeɗu" },
  aboutProduce:     { en: "About this produce", fr: "À propos de ce produit", pcm: "About dis thing", ar: "عن هذا المنتج", ff: "E dow ɗon" },
  demoSample:       { en: "Demo sample", fr: "Exemple de démonstration", pcm: "Demo item", ar: "عينة تجريبية", ff: "Ko janngal" },
  productNotFound:  { en: "Product not found", fr: "Produit introuvable", pcm: "Product no dey", ar: "المنتج غير موجود", ff: "Huunde yiytaaka" },
  browseFF:         { en: "Browse Farm Fresh", fr: "Explorer les produits frais", pcm: "See farm fresh", ar: "تصفح المنتجات الطازجة", ff: "Yiy mbuytooji" },
  harvested:        { en: "Harvested", fr: "Récolté le", pcm: "Harvest on", ar: "حُصد في", ff: "Yillaa e" },

  // ── FLASH DEALS PAGE ─────────────────────────────────────────────────────────
  flashDeals:       { en: "Flash Deals", fr: "Ventes Flash", pcm: "Flash Deals", ar: "صفقات سريعة", ff: "Ɓesngu Jooni" },
  flashDealsDesc:   { en: "Limited-time offers — grab them before they expire!", fr: "Offres à durée limitée — saisissez-les avant expiration!", pcm: "Hot deals wey go expire soon!", ar: "عروض لفترة محدودة — اغتنمها قبل انتهائها!", ff: "Ɓesngu e waɗde — ari jooni!" },
  timeLeft:         { en: "Time left", fr: "Temps restant", pcm: "Time wey remain", ar: "الوقت المتبقي", ff: "Sahaa to wodi" },
  dealEnds:         { en: "Deal ends in", fr: "La vente se termine dans", pcm: "Deal go end in", ar: "ينتهي العرض خلال", ff: "Ɓesngu tiimata e" },
  hours:            { en: "hours", fr: "heures", pcm: "hours", ar: "ساعات", ff: "saate" },
  minutes:          { en: "minutes", fr: "minutes", pcm: "minutes", ar: "دقائق", ff: "munto" },
  seconds:          { en: "seconds", fr: "secondes", pcm: "seconds", ar: "ثوانٍ", ff: "kitaali" },
  discount:         { en: "Discount", fr: "Remise", pcm: "Discount", ar: "تخفيض", ff: "Ɓeyngu" },
  originalPrice:    { en: "Original price", fr: "Prix d'origine", pcm: "Real price", ar: "السعر الأصلي", ff: "Njamndi dummitere" },
  dealPrice:        { en: "Deal price", fr: "Prix de la vente flash", pcm: "Deal price", ar: "سعر العرض", ff: "Njamndi ɓesngu" },
  soldOut:          { en: "Sold out!", fr: "Épuisé!", pcm: "E don finish!", ar: "نفدت الكمية!", ff: "Saree!" },
  hurryUp:          { en: "Hurry! Only a few left", fr: "Vite! Il n'en reste que quelques-uns", pcm: "Quick quick! Small remain", ar: "اسرع! متبقٍّ قليل فقط", ff: "Hiis! Ko huccii wodi" },
  claimDeal:        { en: "Claim this deal", fr: "Saisir cette offre", pcm: "Grab am now", ar: "استرداد هذا العرض", ff: "Hoot ɓesngu ɗon" },

  // ── GROUP BUYING PAGE ────────────────────────────────────────────────────────
  groupBuying:      { en: "Group Buying", fr: "Achat Groupé", pcm: "Group Buying", ar: "الشراء الجماعي", ff: "Soodrigu" },
  groupBuyingDesc:  { en: "Pool together and unlock group discounts", fr: "Regroupez-vous pour débloquer des remises de groupe", pcm: "Join group, get discount", ar: "اشتركوا معًا للحصول على خصومات جماعية", ff: "Naado, hoot njamndi ŋappu" },
  createGroup:      { en: "Create a group deal", fr: "Créer un achat groupé", pcm: "Start a group deal", ar: "إنشاء صفقة جماعية", ff: "Waɗ soodrigu" },
  joinGroup:        { en: "Join this group", fr: "Rejoindre ce groupe", pcm: "Join dis group", ar: "انضم لهذه المجموعة", ff: "Naado ɗoo" },
  membersNeeded:    { en: (n: number) => `${n} more member${n === 1 ? "" : "s"} needed`, fr: (n: number) => `Encore ${n} membre${n === 1 ? "" : "s"} nécessaire${n === 1 ? "" : "s"}`, pcm: (n: number) => `Need ${n} more person`, ar: (n: number) => `${n} عضو آخر مطلوب`, ff: (n: number) => `${n} janaŋ laati` },
  groupProgress:    { en: "Group progress", fr: "Progression du groupe", pcm: "Group progress", ar: "تقدم المجموعة", ff: "Yeeso soodrigu" },
  minMembers:       { en: "Minimum members", fr: "Membres minimum", pcm: "Min members", ar: "الحد الأدنى من الأعضاء", ff: "Hukkundu laati" },
  groupDiscount:    { en: "Group discount", fr: "Remise du groupe", pcm: "Group discount", ar: "خصم المجموعة", ff: "Njamndi ŋappu soodrigu" },
  groupExpiry:      { en: "Group deal expires", fr: "L'offre expire", pcm: "Deal go expire", ar: "تنتهي الصفقة", ff: "Soodrigu tiimata" },
  leaveGroup:       { en: "Leave group", fr: "Quitter le groupe", pcm: "Leave group", ar: "مغادرة المجموعة", ff: "Wurt soodrigu" },

  // ── ZERM COINS PAGE ──────────────────────────────────────────────────────────
  zermCoins:        { en: "Zerm Coins", fr: "Pièces Zerm", pcm: "Zerm Coins", ar: "عملات زيرم", ff: "Ceede Zerm" },
  zermCoinsDesc:    { en: "Earn and spend Zerm Coins across Bambeh", fr: "Gagnez et dépensez des pièces Zerm sur Bambeh", pcm: "Earn and spend your Zerm Coins", ar: "اكسب وأنفق عملات زيرم عبر بامبيه", ff: "Hoɗtu e yoɓde ceede Zerm e Bambeh" },
  yourBalance:      { en: "Your balance", fr: "Votre solde", pcm: "Your balance", ar: "رصيدك", ff: "Ceeɗu maa" },
  earnCoins:        { en: "How to earn coins", fr: "Comment gagner des pièces", pcm: "How to earn coins", ar: "كيفية كسب العملات", ff: "No waɗmi hoɗtu" },
  spendCoins:       { en: "How to spend coins", fr: "Comment dépenser des pièces", pcm: "How to use coins", ar: "كيفية إنفاق العملات", ff: "No waɗmi yoɓde" },
  coinHistory:      { en: "Coin history", fr: "Historique des pièces", pcm: "Coin history", ar: "سجل العملات", ff: "Jaɓɓitooje ceede" },
  coinEarned:       { en: "Earned", fr: "Gagné", pcm: "Earned", ar: "مكتسب", ff: "Hoɗtaama" },
  coinSpent:        { en: "Spent", fr: "Dépensé", pcm: "Spent", ar: "منفق", ff: "Yoɓaa" },
  coinExpiry:       { en: "Coins expire in", fr: "Les pièces expirent dans", pcm: "Coins go expire in", ar: "تنتهي العملات خلال", ff: "Ceede tiimata e" },
  redeemCoins:      { en: "Redeem coins", fr: "Utiliser les pièces", pcm: "Use your coins", ar: "استرداد العملات", ff: "Yoɓo ceede" },
  earnedByPosting:  { en: "Earned by posting ads", fr: "Gagné en publiant des annonces", pcm: "You earn when you post ad", ar: "مكتسب بنشر إعلانات", ff: "Hoɗtaa e neldugol gannde" },
  earnedByReviewing:{ en: "Earned by writing reviews", fr: "Gagné en rédigeant des avis", pcm: "Earn when you write review", ar: "مكتسب بكتابة التقييمات", ff: "Hoɗtaa e windugol jibbannde" },
  earnedByReferral: { en: "Earned by referring friends", fr: "Gagné en parrainant des amis", pcm: "Earn when you refer friend", ar: "مكتسب بدعوة الأصدقاء", ff: "Hoɗtaa e ɓennugol yiɗɓe" },

  // ── COMMUNITY PAGE ───────────────────────────────────────────────────────────
  community:        { en: "Community", fr: "Communauté", pcm: "Community", ar: "المجتمع", ff: "Ngurndam" },
  communityDesc:    { en: "Join groups, connect and share", fr: "Rejoignez des groupes, connectez-vous et partagez", pcm: "Join groups and share", ar: "انضم لمجموعات وتواصل وشارك", ff: "Naado e laawol, wadande" },
  createGroup2:     { en: "Create a group", fr: "Créer un groupe", pcm: "Create group", ar: "إنشاء مجموعة", ff: "Waɗ laawol" },
  joinCommunity:    { en: "Join community", fr: "Rejoindre la communauté", pcm: "Join community", ar: "انضم للمجتمع", ff: "Naado ngurndam" },
  members:          { en: "members", fr: "membres", pcm: "members", ar: "أعضاء", ff: "laati" },
  posts:            { en: "posts", fr: "publications", pcm: "posts", ar: "منشورات", ff: "neldeeje" },
  myGroups:         { en: "My groups", fr: "Mes groupes", pcm: "My groups", ar: "مجموعاتي", ff: "Laawolɗe am" },
  discoverGroups:   { en: "Discover groups", fr: "Découvrir des groupes", pcm: "Find groups", ar: "اكتشف المجموعات", ff: "Yiy laawolɗe" },
  groupName:        { en: "Group name", fr: "Nom du groupe", pcm: "Group name", ar: "اسم المجموعة", ff: "Innde laawol" },
  groupDescription: { en: "Group description", fr: "Description du groupe", pcm: "Group description", ar: "وصف المجموعة", ff: "Firo laawol" },
  writePost:        { en: "Write a post…", fr: "Écrire une publication…", pcm: "Write something…", ar: "اكتب منشورًا…", ff: "Windo huunde…" },
  likedPost:        { en: "liked this", fr: "a aimé ceci", pcm: "like am", ar: "أعجبه هذا", ff: "yiɗi ɗon" },

  // ── NJANGI / TONTINE PAGE ────────────────────────────────────────────────────
  njangi:           { en: "Njangi", fr: "Tontine", pcm: "Njangi", ar: "النجانجي", ff: "Liggel" },
  njangiDesc:       { en: "Your trusted savings circle", fr: "Votre cercle d'épargne de confiance", pcm: "Your trusted saving circle", ar: "دائرة ادخارك الموثوقة", ff: "Lefol ceeɗu maa" },
  createNjangi:     { en: "Start a Njangi", fr: "Créer une tontine", pcm: "Start Njangi", ar: "إنشاء نجانجي", ff: "Fuɗ Liggel" },
  joinNjangi:       { en: "Join a Njangi", fr: "Rejoindre une tontine", pcm: "Join Njangi", ar: "الانضمام لنجانجي", ff: "Naado Liggel" },
  contributionAmount:{ en: "Contribution amount", fr: "Montant de contribution", pcm: "How much to pay", ar: "مبلغ المساهمة", ff: "Nde ceeɗu" },
  frequency:        { en: "Frequency", fr: "Fréquence", pcm: "How often", ar: "التكرار", ff: "Saatol" },
  weekly:           { en: "Weekly", fr: "Hebdomadaire", pcm: "Every week", ar: "أسبوعيًا", ff: "Naange fof" },
  biweekly:         { en: "Bi-weekly", fr: "Bimensuel", pcm: "Every 2 weeks", ar: "كل أسبوعين", ff: "Naange ɗiɗi" },
  monthly2:         { en: "Monthly", fr: "Mensuel", pcm: "Every month", ar: "شهريًا", ff: "Lewru fof" },
  njangiBalance:    { en: "Njangi balance", fr: "Solde de la tontine", pcm: "Njangi balance", ar: "رصيد النجانجي", ff: "Ceeɗu Liggel" },
  nextPayout:       { en: "Next payout", fr: "Prochain versement", pcm: "Next payout", ar: "الدفع التالي", ff: "Njuɓɓudi yeeso" },
  memberRoster:     { en: "Member roster", fr: "Liste des membres", pcm: "Members list", ar: "قائمة الأعضاء", ff: "Listu laati" },
  myTurn:           { en: "My turn", fr: "Mon tour", pcm: "My turn", ar: "دوري", ff: "Laawol am" },

  // ── MEET SAFELY PAGE ─────────────────────────────────────────────────────────
  meetSafely:       { en: "Meet Safely", fr: "Rencontrez en toute sécurité", pcm: "Meet Safely", ar: "التقاء بأمان", ff: "Meetirde Kisinaare" },
  meetSafelyDesc:   { en: "Tips and tools for safe in-person meetings", fr: "Conseils et outils pour des rencontres sécurisées", pcm: "How to meet people safely", ar: "نصائح وأدوات للقاءات الآمنة", ff: "No meetirmi kisinaare" },
  safeMeetingSpot:  { en: "Choose a safe spot", fr: "Choisissez un endroit sûr", pcm: "Pick safe place", ar: "اختر مكانًا آمنًا", ff: "Suɓo ɗo kisi" },
  bringFriend:      { en: "Bring a friend", fr: "Amenez un ami", pcm: "Bring somebody", ar: "أحضر صديقًا معك", ff: "Wad yiɗɗo" },
  meetDaytime:      { en: "Meet during the day", fr: "Rencontrez-vous en journée", pcm: "Meet for daytime", ar: "التقِ خلال النهار", ff: "Meetir e ñalorma" },
  verifyIdentity:   { en: "Verify their identity", fr: "Vérifiez leur identité", pcm: "Check who dem be", ar: "تحقق من هويتهم", ff: "Miiɗo ko minno" },
  shareLocation:    { en: "Share your location", fr: "Partagez votre position", pcm: "Share your location", ar: "شارك موقعك", ff: "Wadande ɗo ngaɗaa" },
  reportUnsafe:     { en: "Report unsafe behaviour", fr: "Signaler un comportement dangereux", pcm: "Report unsafe behavior", ar: "الإبلاغ عن سلوك غير آمن", ff: "Haalde yewre faayre" },
  emergencyContacts:{ en: "Emergency contacts", fr: "Contacts d'urgence", pcm: "Emergency contact", ar: "جهات الاتصال للطوارئ", ff: "Ɓe ɓenndiraa feewaaji" },
  meetingChecklist: { en: "Meeting checklist", fr: "Liste de contrôle pour la rencontre", pcm: "Meeting checklist", ar: "قائمة مراجعة الاجتماع", ff: "Listu meetirde" },

  // ── ESCROW PAGE ──────────────────────────────────────────────────────────────
  escrow:           { en: "Escrow", fr: "Paiement Sécurisé", pcm: "Secure Payment", ar: "الضمان المالي", ff: "Ceede Kisinaare" },
  escrowDesc:       { en: "Pay securely — funds released only after confirmation", fr: "Paiement sécurisé — fonds libérés après confirmation", pcm: "Pay safe, money dey hold till you confirm", ar: "ادفع بأمان — تُحرَّر الأموال بعد التأكيد فقط", ff: "Yoɓo kisinaare — ceede yettaa koo tofnoo" },
  escrowStatus:     { en: "Escrow status", fr: "Statut de l'escrow", pcm: "Escrow status", ar: "حالة الضمان", ff: "Yewre ceede" },
  fundEscrow:       { en: "Fund escrow", fr: "Alimenter l'escrow", pcm: "Put money in escrow", ar: "تمويل الضمان", ff: "Tofno ceede e kisinaare" },
  releasePayment:   { en: "Release payment", fr: "Libérer le paiement", pcm: "Release payment", ar: "الإفراج عن الدفع", ff: "Yeddu ceede" },
  disputeEscrow:    { en: "Open a dispute", fr: "Ouvrir un litige", pcm: "Open dispute", ar: "فتح نزاع", ff: "Fuɗ fenaande" },
  escrowProtected:  { en: "This transaction is escrow-protected", fr: "Cette transaction est protégée par escrow", pcm: "Dis transaction don protect", ar: "هذه المعاملة محمية بالضمان", ff: "Ɗon yewraama kisinaare" },
  buyerProtected:   { en: "Buyer protected until item received", fr: "Acheteur protégé jusqu'à réception", pcm: "Buyer safe till dem receive item", ar: "المشتري محمي حتى استلام الغرض", ff: "Sooduɗo kisaa haa rokkaa" },

  // ── COMPARE ITEMS PAGE ───────────────────────────────────────────────────────
  compare:          { en: "Compare Items", fr: "Comparer des articles", pcm: "Compare Items", ar: "مقارنة العناصر", ff: "Aafde Kuuje" },
  compareDesc:      { en: "Side-by-side comparison of listings", fr: "Comparaison côte à côte des annonces", pcm: "Compare things side by side", ar: "مقارنة جنبًا إلى جنب للإعلانات", ff: "Aafde kuuje keeɓtiinde" },
  addToCompare:     { en: "Add to compare", fr: "Ajouter à la comparaison", pcm: "Add to compare", ar: "إضافة للمقارنة", ff: "Fodo e aafde" },
  clearAll:         { en: "Clear all", fr: "Tout effacer", pcm: "Clear all", ar: "مسح الكل", ff: "Soo fof" },
  compareNow:       { en: "Compare now", fr: "Comparer maintenant", pcm: "Compare now", ar: "قارن الآن", ff: "Aaf hannde" },
  bestValue:        { en: "Best value", fr: "Meilleur rapport qualité-prix", pcm: "Best value", ar: "أفضل قيمة", ff: "Heewre njamndi" },
  similar:          { en: "Similar items", fr: "Articles similaires", pcm: "Similar things", ar: "عناصر مماثلة", ff: "Kuuje nannduɗe" },
  differences:      { en: "Key differences", fr: "Différences principales", pcm: "Key differences", ar: "الاختلافات الرئيسية", ff: "Ɗo kaawtoori" },
  specifications:   { en: "Specifications", fr: "Spécifications", pcm: "Specs", ar: "المواصفات", ff: "Kaaɗe" },

  // ── BAMBEH AI PAGE ───────────────────────────────────────────────────────────
  bambehAI:         { en: "Bambeh AI", fr: "Bambeh IA", pcm: "Bambeh AI", ar: "ذكاء بامبيه الاصطناعي", ff: "Bambeh AI" },
  bambehAIDesc:     { en: "Your AI marketplace assistant", fr: "Votre assistant IA sur le marketplace", pcm: "Your AI helper for the market", ar: "مساعدك الذكي في السوق", ff: "Jaagorɗo maa AI e suudu" },
  askAI:            { en: "Ask Bambeh AI anything…", fr: "Posez n'importe quelle question à Bambeh IA…", pcm: "Ask am anything…", ar: "اسأل ذكاء بامبيه أي شيء…", ff: "Ɗaɓɓo AI fof…" },
  aiThinking:       { en: "Thinking…", fr: "Réflexion…", pcm: "E think…", ar: "يفكر…", ff: "E miijoo…" },
  aiSuggestions:    { en: "Suggested questions", fr: "Questions suggérées", pcm: "Questions you fit ask", ar: "أسئلة مقترحة", ff: "Ɗaɓɓaaje tiiɗnaaɗe" },
  aiClearChat:      { en: "Clear chat", fr: "Effacer la conversation", pcm: "Clear chat", ar: "مسح المحادثة", ff: "Soo haala" },
  aiDisclaimer:     { en: "AI responses may not always be accurate", fr: "Les réponses IA peuvent ne pas toujours être précises", pcm: "AI no always correct", ar: "قد لا تكون استجابات الذكاء الاصطناعي دقيقة دائمًا", ff: "AI daɗaaka fof" },
  aiPoweredBy:      { en: "Powered by Bambeh Intelligence", fr: "Propulsé par Bambeh Intelligence", pcm: "Na Bambeh Intelligence power am", ar: "مدعوم بذكاء بامبيه", ff: "Bambeh Intelligence saɗii" },

  // ── FEATURED ADS PAGE ────────────────────────────────────────────────────────
  featuredAds:      { en: "Featured Ads", fr: "Annonces en vedette", pcm: "Featured Ads", ar: "الإعلانات المميزة", ff: "Gannde Tiiɗnaaɗe" },
  featuredAdsDesc:  { en: "Top promoted listings across all categories", fr: "Meilleures annonces promues dans toutes les catégories", pcm: "Top promoted ads for all categories", ar: "أفضل القوائم المروّجة في جميع الفئات", ff: "Gannde ko tiiɗnaaɗe fof teelte" },
  promoted:         { en: "Promoted", fr: "Promu", pcm: "Promoted", ar: "مروَّج", ff: "Tiiɗnaaɗe" },
  boostAd:          { en: "Boost your ad", fr: "Booster votre annonce", pcm: "Boost your ad", ar: "عزز إعلانك", ff: "Huccin gannde maa" },
  featuredBadge:    { en: "Featured", fr: "À la une", pcm: "Featured", ar: "مميز", ff: "Tiiɗngal" },
  sponsoredBy:      { en: "Sponsored", fr: "Sponsorisé", pcm: "Sponsored", ar: "برعاية", ff: "E dow ballal" },
  adExpiry:         { en: "Ad expires", fr: "L'annonce expire", pcm: "Ad go expire", ar: "ينتهي الإعلان", ff: "Gannde tiimata" },
  getMoreViews:     { en: "Get more views", fr: "Obtenez plus de vues", pcm: "Get more people to see", ar: "احصل على المزيد من المشاهدات", ff: "Hoot yiytaama heewɗo" },

  // ── SUBSCRIPTION PAGE ────────────────────────────────────────────────────────
  subscription:     { en: "Subscription", fr: "Abonnement", pcm: "Subscription", ar: "الاشتراك", ff: "Sooddi" },
  subscriptionDesc: { en: "Unlock premium features on Bambeh", fr: "Débloquez les fonctionnalités premium de Bambeh", pcm: "Get premium features", ar: "افتح الميزات المميزة على بامبيه", ff: "Uddit toɓɓe tiiɗnaaɗe" },
  currentPlan:      { en: "Current plan", fr: "Forfait actuel", pcm: "Your current plan", ar: "الخطة الحالية", ff: "Sooddi hannde" },
  upgradePlan:      { en: "Upgrade plan", fr: "Mettre à jour le forfait", pcm: "Upgrade your plan", ar: "ترقية الخطة", ff: "Fuɗɗoo sooddi" },
  planBasic:        { en: "Basic", fr: "Basique", pcm: "Basic", ar: "أساسي", ff: "Fuɗɗoraaɗe" },
  planSilver:       { en: "Silver", fr: "Argent", pcm: "Silver", ar: "فضي", ff: "Arjaan" },
  planGold:         { en: "Gold", fr: "Or", pcm: "Gold", ar: "ذهبي", ff: "Hol" },
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
  searchHelp:       { en: "Search help articles…", fr: "Rechercher des articles d'aide…", pcm: "Search help…", ar: "البحث في مقالات المساعدة…", ff: "Yiy ballal…" },
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
  privacyDesc:      { en: "How BAMBEH SARL collects and uses your data", fr: "Comment BAMBEH SARL collecte et utilise vos données", pcm: "How Bambeh uses your data", ar: "كيفية جمع بامبيه لبياناتك واستخدامها", fr2: "Comment BAMBEH SARL utilise vos données", ff: "No Bambeh waɗi ɗatum maa" },
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
  sendingRequest:   { en: "Sending payment request…", fr: "Envoi de la demande de paiement…", pcm: "E dey send payment request…", ar: "إرسال طلب الدفع…", ff: "E neldude ɗaɓɓaade…" },
  checkPhone:       { en: "Check your phone", fr: "Vérifiez votre téléphone", pcm: "Check your phone", ar: "تحقق من هاتفك", ff: "Yiy Telefon maa" },
  enterPin:         { en: "Enter your PIN to confirm the payment", fr: "Entrez votre PIN pour confirmer le paiement", pcm: "Enter your PIN to confirm", ar: "أدخل رقم التعريف الشخصي لتأكيد الدفع", ff: "Nelo PIN maa e jaɓngol" },
  waiting:          { en: (m: number, s: number) => `Waiting for confirmation… ${m}:${String(s).padStart(2, "0")}`, fr: (m: number, s: number) => `En attente de confirmation… ${m}:${String(s).padStart(2, "0")}`, pcm: (m: number, s: number) => `Waiting for confirmation… ${m}:${String(s).padStart(2, "0")}`, ar: (m: number, s: number) => `انتظار التأكيد… ${m}:${String(s).padStart(2, "0")}`, ff: (m: number, s: number) => `E yaɗde jaɓngol… ${m}:${String(s).padStart(2, "0")}` },
  processing:       { en: "Processing…", fr: "Traitement…", pcm: "E process…", ar: "جارٍ المعالجة…", ff: "E waɗde…" },
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
