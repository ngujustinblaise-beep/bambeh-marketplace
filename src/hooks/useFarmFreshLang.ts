/**
 * src/hooks/useFarmFreshLang.ts — Bambeh Marketplace
 *
 * Shared translation hook for all FarmFresh pages.
 * Reads from localStorage("Bambeh_language") and reacts instantly
 * whenever the user changes language anywhere in the app.
 *
 * Supported: en | fr | pidgin | ar | fulfulde
 */

import { useState, useEffect } from "react";

export type Lang = "en" | "fr" | "pidgin" | "ar" | "fulfulde";

function getLang(): Lang {
  const v = localStorage.getItem("Bambeh_language") ?? "en";
  return (["en", "fr", "pidgin", "ar", "fulfulde"].includes(v) ? v : "en") as Lang;
}

export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>(getLang);

  useEffect(() => {
    function sync() { setLang(getLang()); }
    window.addEventListener("storage", sync);
    window.addEventListener("bambeh-lang-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("bambeh-lang-change", sync);
    };
  }, []);

  return lang;
}

// ─────────────────────────────────────────────────────────────────────────────
// All FarmFresh UI strings — one object per language key
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // ── FarmFreshPage ──────────────────────────────────────────────────────────
  farmFresh: {
    en:       "Farm Fresh",
    fr:       "Ferme Fraîche",
    pidgin:   "Farm Fresh",
    ar:       "منتجات الزراعة",
    fulfulde: "Ley Ladde",
  },
  searchPlaceholder: {
    en:       "Search produce, location…",
    fr:       "Chercher un produit, lieu…",
    pidgin:   "Search wetin you want, wapi…",
    ar:       "ابحث عن المنتجات، الموقع…",
    fulfulde: "Yiylo ko njiꞌi, toon…",
  },
  sell: {
    en:       "Sell",
    fr:       "Vendre",
    pidgin:   "Sell Am",
    ar:       "بيع",
    fulfulde: "Yoɓe",
  },
  buyDirect: {
    en:       "🌿 Buy Direct from Farmers",
    fr:       "🌿 Acheter directement chez les fermiers",
    pidgin:   "🌿 Buy Am Direct for Farmer Hand",
    ar:       "🌿 اشترÙ مباشرة من المزارعين",
    fulfulde: "🌿 Sooddu Tigi e Maccuɓe Ley",
  },
  buyDirectSub: {
    en:       "Fresh produce, fair prices. Visible to buyers worldwide.",
    fr:       "Produits frais, prix justes. Visible par les acheteurs du monde entier.",
    pidgin:   "Fresh thing, correct price. People wey dey everywhere fit see am.",
    ar:       "منتجات طازجة، أسعار عادلة. مرئي للمشترين Ùي جميع أنحاء العالم.",
    fulfulde: "Ko'e keso, njamndi laawol. Yimɓe fof mbaawi yiyde.",
  },
  joinGroup: {
    en:       "Join Group Buying — Save More",
    fr:       "Rejoindre l'achat groupé — Économiser davantage",
    pidgin:   "Join Group Buy — Save Money Pass",
    ar:       "انضم للشراء الجماعي — وÙّر أكثر",
    fulfulde: "Naatir Soodirde e Jaamaare — Fayde Kalan",
  },
  loading: {
    en:       "Loading fresh produce…",
    fr:       "Chargement des produits frais…",
    pidgin:   "E dey load fresh thing…",
    ar:       "جارÙ تحميل المنتجات الطازجة…",
    fulfulde: "E nani ko'e keso…",
  },
  noProduceFound: {
    en:       "No produce found",
    fr:       "Aucun produit trouvé",
    pidgin:   "Nothing dey here so",
    ar:       "لم يÙعثر على منتجات",
    fulfulde: "Alaa ko yi'aa",
  },
  listYourProduce: {
    en:       "List Your Produce",
    fr:       "Lister votre produit",
    pidgin:   "Put Your Thing for List",
    ar:       "أضÙ منتجك",
    fulfulde: "Hollir Ko'am ma",
  },
  realListings: {
    en:       (n: number) => `${n} real listing${n !== 1 ? "s" : ""} + sample items`,
    fr:       (n: number) => `${n} vraie${n !== 1 ? "s" : ""} annonce${n !== 1 ? "s" : ""} + exemples`,
    pidgin:   (n: number) => `${n} real thing${n !== 1 ? "s" : ""} + sample`,
    ar:       (n: number) => `${n} إعلان حقيقي + عناصر نموذجية`,
    fulfulde: (n: number) => `${n} hollirgol tigi + misal`,
  },
  showingSamples: {
    en:       (n: number) => `Showing ${n} sample items — be the first to list real produce!`,
    fr:       (n: number) => `${n} exemples affichés — soyez le premier à lister votre produit !`,
    pidgin:   (n: number) => `${n} sample thing dem dey — you go first put real one!`,
    ar:       (n: number) => `عرض ${n} عناصر نموذجية — كن أول من يضيÙ منتجاً حقيقياً!`,
    fulfulde: (n: number) => `Holliraa ${n} misal — no firo naatirgo ko'e tigi!`,
  },
  addToCart: {
    en:       "Add to Cart",
    fr:       "Ajouter au panier",
    pidgin:   "Put for Cart",
    ar:       "أضÙ إلى السلة",
    fulfulde: "Roŋku e Kartel",
  },
  added: {
    en:       "Added ✓",
    fr:       "Ajouté ✓",
    pidgin:   "E don enter ✓",
    ar:       "تمت الإضاÙة ✓",
    fulfulde: "Roŋkaa ✓",
  },
  views: {
    en:       "views",
    fr:       "vues",
    pidgin:   "people don see am",
    ar:       "مشاهدات",
    fulfulde: "yii'ɗi",
  },
  organic: {
    en:       "Bio",
    fr:       "Bio",
    pidgin:   "Natural",
    ar:       "عضوي",
    fulfulde: "Kese",
  },
  noPhotoYet: {
    en:       "No photo yet",
    fr:       "Pas encore de photo",
    pidgin:   "No photo yet",
    ar:       "لا توجد صورة بعد",
    fulfulde: "Alaa natal hannde",
  },
  cart: {
    en:       "Cart",
    fr:       "Panier",
    pidgin:   "Cart",
    ar:       "السلة",
    fulfulde: "Kartel",
  },
  groupBuyingAd: {
    en:       { title: "Group Buying", subtitle: "Buy together, save more", cta: "Join a Group" },
    fr:       { title: "Achat groupé", subtitle: "Achetez ensemble, économisez plus", cta: "Rejoindre" },
    pidgin:   { title: "Buy Together", subtitle: "Join body, save money", cta: "Join Now" },
    ar:       { title: "شراء جماعي", subtitle: "اشترÙ معاً، وÙّر أكثر", cta: "انضم" },
    fulfulde: { title: "Soodirde Jaamaare", subtitle: "Sooddu e yo'i, fayde", cta: "Naatir" },
  },
  sellProduceAd: {
    en:       { title: "Sell Your Produce", subtitle: "Reach buyers across Cameroon", cta: "List Now" },
    fr:       { title: "Vendez vos produits", subtitle: "Atteignez les acheteurs au Cameroun", cta: "Lister" },
    pidgin:   { title: "Sell Your Thing", subtitle: "Buyers for everywhere go see am", cta: "Put List" },
    ar:       { title: "بÙع منتجاتك", subtitle: "تواصل مع المشترين Ùي الكاميرون", cta: "أضÙ الآن" },
    fulfulde: { title: "Yoɓe Ko'am ma", subtitle: "Soodinooɓe fof mbaawi yiyde", cta: "Hollir" },
  },
  catAll:        { en:"All",        fr:"Tout",      pidgin:"All",        ar:"الكل",        fulfulde:"Fof"         },
  catVegetables: { en:"Vegetables", fr:"Légumes",   pidgin:"Veggies",    ar:"خضروات",      fulfulde:"Lekki Ko'e"  },
  catFruits:     { en:"Fruits",     fr:"Fruits",    pidgin:"Fruits",     ar:"Ùواكه",       fulfulde:"Biccol"      },
  catTubers:     { en:"Tubers",     fr:"Tubercules",pidgin:"Tubers",     ar:"درنات",       fulfulde:"Toɓɓere"    },
  catGrains:     { en:"Grains",     fr:"Céréales",  pidgin:"Grains",     ar:"حبوب",        fulfulde:"Maaro"       },
  catLegumes:    { en:"Legumes",    fr:"Légumineuses",pidgin:"Legumes",  ar:"بقوليات",     fulfulde:"Mboddi"      },
  catHerbs:      { en:"Herbs",      fr:"Herbes",    pidgin:"Herbs",      ar:"أعشاب",       fulfulde:"Lekki Keso"  },
  catDairy:      { en:"Dairy",      fr:"Produits laitiers",pidgin:"Milk Thing",ar:"منتجات الألبان",fulfulde:"Kosam"},

  // ── FarmFreshDetail ────────────────────────────────────────────────────────
  back:            { en:"Back",               fr:"Retour",              pidgin:"Go Back",           ar:"رجوع",               fulfulde:"Waɗtu" },
  seller:          { en:"Seller",             fr:"Vendeur",             pidgin:"Seller",             ar:"البائع",             fulfulde:"Yoɓowo" },
  whatsapp:        { en:"WhatsApp",           fr:"WhatsApp",            pidgin:"WhatsApp",           ar:"واتساب",             fulfulde:"WhatsApp" },
  call:            { en:"Call",               fr:"Appeler",             pidgin:"Call Am",            ar:"اتصل",               fulfulde:"Noddu" },
  joinGroupBuy:    { en:"Join Group Buying",  fr:"Rejoindre l'achat groupé", pidgin:"Join Group Buy", ar:"انضم للشراء الجماعي", fulfulde:"Naatir Soodirde Jaamaare" },
  joinGroupBuySub: { en:"Pool orders with other buyers and save more", fr:"Commandez ensemble et économisez davantage", pidgin:"Join body, buy together, save plenty money", ar:"اجمع الطلبات مع مشترين آخرين ووÙّر أكثر", fulfulde:"Sooddu e yo'i, fayde kalan" },
  aboutProduce:    { en:"About this Produce", fr:"À propos de ce produit", pidgin:"Wetin dis thing be", ar:"عن هذا المنتج", fulfulde:"Ko hollirgol e Ko'oo" },
  safetyTip:       { en:"Safety tip:", fr:"Conseil de sécurité :", pidgin:"Safety advice:", ar:"نصيحة أمان:", fulfulde:"Ladde lafol:" },
  safetyText:      { en:"Always use Bambeh Escrow for payments. Meet in a safe, public place for pickup.", fr:"Utilisez toujours Bambeh Escrow pour les paiements. Rencontrez-vous dans un endroit sûr et public.", pidgin:"Always use Bambeh Escrow for money. Meet for safe place wey people dey.", ar:"استخدم دائمًا Bambeh Escrow للمدÙوعات. التقÙ Ùي مكان آمن وعام.", fulfulde:"Jom Bambeh Escrow ngam ceede fof. Yetto e yimɓe e toon laawol." },
  reportListing:   { en:"Report this listing", fr:"Signaler cette annonce", pidgin:"Report dis thing", ar:"الإبلاغ عن هذا الإعلان", fulfulde:"Hollir Ko'oo e mbayliigu" },
  stock:           { en:"Stock:", fr:"Stock :", pidgin:"Wetin remain:", ar:"المخزون:", fulfulde:"Ko tagi:" },
  deliveryAvail:   { en:"Delivery available", fr:"Livraison disponible", pidgin:"Dem fit deliver am", ar:"التوصيل متاح", fulfulde:"E waawi addude" },
  harvested:       { en:"Harvested:", fr:"Récolté le :", pidgin:"Dem harvest am:", ar:"تاريخ الحصاد:", fulfulde:"Nduri am:" },
  addToCartBtn:    { en:"Add to Cart", fr:"Ajouter au panier", pidgin:"Put for Cart", ar:"أضÙ إلى السلة", fulfulde:"Roŋku e Kartel" },
  addedBtn:        { en:"Added!", fr:"Ajouté !", pidgin:"E don enter!", ar:"تمت الإضاÙة!", fulfulde:"Roŋkaa!" },
  payNow:          { en:"Pay Now", fr:"Payer maintenant", pidgin:"Pay Now", ar:"ادÙع الآن", fulfulde:"Hol Hannde" },
  linkCopied:      { en:"Link copied!", fr:"Lien copié !", pidgin:"Link don copy!", ar:"تم نسخ الرابط!", fulfulde:"Toɓre nawnaa!" },
  addedToCart:     { en:"Added to cart", fr:"Ajouté au panier", pidgin:"E don enter cart", ar:"تمت الإضاÙة إلى السلة", fulfulde:"Roŋkaa e Kartel" },
  total:           { en:"Total", fr:"Total", pidgin:"Total", ar:"المجموع", fulfulde:"Fof" },
  demoSample:      { en:"DEMO — Sample Item", fr:"DÉMO — Article exemple", pidgin:"DEMO — Sample Thing", ar:"تجريبي — عنصر نموذجي", fulfulde:"DEMO — Misal" },
  productNotFound: { en:"Product not found", fr:"Produit introuvable", pidgin:"Dem no find dat thing", ar:"المنتج غير موجود", fulfulde:"Ko'oo alaa" },
  browseFF:        { en:"Browse Farm Fresh", fr:"Parcourir Ferme Fraîche", pidgin:"Check Farm Fresh", ar:"تصÙح منتجات الزراعة", fulfulde:"Yiy Ley Ladde" },
  orderPlaced:     { en:"Order Placed! 🎉", fr:"Commande passée ! 🎉", pidgin:"Order Don Enter! 🎉", ar:"تم تقديم الطلب! 🎉", fulfulde:"Sariya yawtii! 🎉" },
  payConfirmed:    { en:"Payment confirmed. Your order is being processed.", fr:"Paiement confirmé. Votre commande est en cours de traitement.", pidgin:"Payment don confirm. Dem dey process your order.", ar:"تم تأكيد الدÙع. جارÙ معالجة طلبك.", fulfulde:"Ceede hoolnii. Sariyagol am jokki." },
  trackOrder:      { en:"Track Order", fr:"Suivre la commande", pidgin:"Track My Order", ar:"تتبع الطلب", fulfulde:"Tabito Sariya" },
  keepShopping:    { en:"Keep Shopping", fr:"Continuer les achats", pidgin:"Continue Buying", ar:"مواصلة التسوق", fulfulde:"Jokku Soodude" },

  // ── FarmFreshOrderPage ─────────────────────────────────────────────────────
  orderHeader:       { en:"Order:", fr:"Commande :", pidgin:"Order:", ar:"طلب:", fulfulde:"Sariya:" },
  demoWarning:       { en:"⚠ Demo item — no real transaction", fr:"⚠ Article démo — aucune transaction réelle", pidgin:"⚠ Demo thing — no real money", ar:"⚠ عنصر تجريبي — لا معاملة حقيقية", fulfulde:"⚠ Misal — alaa ceede tigi" },
  quantity:          { en:"Quantity", fr:"Quantité", pidgin:"How Much", ar:"الكمية", fulfulde:"Jomlo" },
  deliveryDetails:   { en:"Delivery Details", fr:"Détails de livraison", pidgin:"Delivery Info", ar:"تÙاصيل التوصيل", fulfulde:"Toɓɓe Addirde" },
  deliveryAddress:   { en:"Delivery Address", fr:"Adresse de livraison", pidgin:"Wapi Dem Go Deliver", ar:"عنوان التوصيل", fulfulde:"Toon Addirde" },
  addressPlaceholder:{ en:"e.g. Carrefour Elig-Essono, Quartier Omnisport, Yaoundé", fr:"ex. Carrefour Elig-Essono, Quartier Omnisport, Yaoundé", pidgin:"e.g. Carrefour Elig-Essono, Yaoundé", ar:"مثال: كارÙور إيليغ-إيسونو، ياوندي", fulfulde:"misaali: Carrefour Elig-Essono, Yaoundé" },
  phoneNumber:       { en:"Phone Number", fr:"Numéro de téléphone", pidgin:"Phone Number", ar:"رقم الهاتÙ", fulfulde:"Nomboro Telefon" },
  specialInstructions:{ en:"Special Instructions (optional)", fr:"Instructions spéciales (facultatif)", pidgin:"Special Request (no must)", ar:"تعليمات خاصة (اختياري)", fulfulde:"Kaftaaɗum (haalal)" },
  instructPlaceholder:{ en:"e.g. Call me before delivery, deliver in the morning…", fr:"ex. Appelez-moi avant la livraison, livrez le matin…", pidgin:"e.g. Call me before dem come, bring am for morning…", ar:"مثال: اتصل بلي قبل التوصيل، وصّل Ùي الصباح…", fulfulde:"misaali: Nodduu am kaan addan addude, addirde subaka…" },
  demoNotice:        { en:"⚠ Demo item: This is a sample product. Your order will be saved locally for preview purposes — no real transaction or delivery will occur.", fr:"⚠ Article démo : Il s'agit d'un produit exemple. Votre commande sera enregistrée localement à des fins d'aperçu — aucune transaction ou livraison réelle n'aura lieu.", pidgin:"⚠ Demo thing: Na sample product dis. Your order go save for your phone only — no real money or delivery.", ar:"⚠ عنصر تجريبي: هذا منتج نموذجي. سيتم حÙظ طلبك محليًا لأغراض المعاينة — لن تتم أي معاملة أو تسليم حقيقي.", fulfulde:"⚠ Misal: Ko'oo ko misal. Sariya am sinndidaa e telefon maa tan — alaa ceede wala addirde tigi." },
  placeOrder:        { en:"Place Order", fr:"Passer la commande", pidgin:"Send Order", ar:"تقديم الطلب", fulfulde:"Naat Sariya" },
  placingOrder:      { en:"Placing order…", fr:"Commande en cours…", pidgin:"E dey send order…", ar:"جارÙ تقديم الطلب…", fulfulde:"E nani sariya…" },
  orderPlacedTitle:  { en:"Order Placed! 🌿", fr:"Commande passée ! 🌿", pidgin:"Order Don Enter! 🌿", ar:"تم تقديم الطلب! 🌿", fulfulde:"Sariya yawtii! 🌿" },
  demoOrderNote:     { en:"This was a demo order — no real transaction was made.", fr:"Il s'agissait d'une commande démo — aucune transaction réelle n'a été effectuée.", pidgin:"Na demo order dis — no real money move.", ar:"كان هذا طلبًا تجريبيًا — لم تتم أي معاملة حقيقية.", fulfulde:"Sariya misal tan — alaa ceede tigi." },
  farmerContact:     { en:(phone:string)=>`The farmer will contact you at ${phone} to confirm delivery.`, fr:(phone:string)=>`Le fermier vous contactera au ${phone} pour confirmer la livraison.`, pidgin:(phone:string)=>`Farmer go call you for ${phone} to confirm delivery.`, ar:(phone:string)=>`سيتصل بك المزارع على ${phone} لتأكيد التوصيل.`, fulfulde:(phone:string)=>`Maccuɗo ley noddata ma e ${phone} hanga wallitdo addirde.` },
  backToFarmFresh:   { en:"Back to Farm Fresh", fr:"Retour à Ferme Fraîche", pidgin:"Go Back Farm Fresh", ar:"العودة إلى منتجات الزراعة", fulfulde:"Waɗtu Ley Ladde" },
  viewMyOrders:      { en:"View My Orders", fr:"Voir mes commandes", pidgin:"Check My Orders", ar:"عرض طلباتي", fulfulde:"Yiy Sariyaaɗi Am" },
  enterAddress:      { en:"Please enter your delivery address.", fr:"Veuillez saisir votre adresse de livraison.", pidgin:"Put your delivery address abeg.", ar:"يرجى إدخال عنوان التوصيل.", fulfulde:"Hollir toon addirde maa." },
  enterPhone:        { en:"Please enter a valid phone number.", fr:"Veuillez saisir un numéro de téléphone valide.", pidgin:"Put correct phone number abeg.", ar:"يرجى إدخال رقم هاتÙ صحيح.", fulfulde:"Hollir nomboro telefon moƴƴo." },

  // ── FarmFreshSellerPage ────────────────────────────────────────────────────
  listYourProducePage: { en:"🌿 List Your Produce", fr:"🌿 Lister votre produit", pidgin:"🌿 Put Your Farm Thing", ar:"🌿 أضÙ منتجك الزراعي", fulfulde:"🌿 Hollir Ko'am ma" },
  step1Label:  { en:"Produce Details",             fr:"Détails du produit",          pidgin:"Wetin You Dey Sell",       ar:"تÙاصيل المنتج",          fulfulde:"Toɓɓe Ko'o" },
  step2Label:  { en:"Location & Description",      fr:"Lieu & Description",           pidgin:"Wapi e Wetin E Be",        ar:"الموقع والوصÙ",          fulfulde:"Toon e Haala" },
  step3Label:  { en:"Photos & Review",             fr:"Photos & Révision",            pidgin:"Photos e Check Am",        ar:"الصور والمراجعة",        fulfulde:"Natal e Kuwtoro" },
  produceName: { en:"Produce Name",                fr:"Nom du produit",               pidgin:"Wetin You Dey Sell",       ar:"اسم المنتج",             fulfulde:"Inde Ko'o" },
  produceNamePlaceholder: { en:"e.g. Fresh Tomatoes, Plantains, Cocoyams", fr:"ex. Tomates fraîches, Plantains, Macabo", pidgin:"e.g. Fresh Tomatoes, Plantains", ar:"مثال: طماطم طازجة، موز، قلقاس", fulfulde:"misaali: Tomates, Baana, Macabo" },
  category:    { en:"Category",                    fr:"Catégorie",                    pidgin:"Wetin Kind",               ar:"الÙئة",                  fulfulde:"Gonɗinde" },
  unit:        { en:"Unit",                        fr:"Unité",                        pidgin:"How You Measure Am",       ar:"الوحدة",                 fulfulde:"Ƴeewnude" },
  priceLabel:  { en:"Price (FCFA)",                fr:"Prix (FCFA)",                  pidgin:"Price (FCFA)",             ar:"السعر (Ùرنك)",           fulfulde:"Njamndi (FCFA)" },
  stockQty:    { en:"Stock Quantity",              fr:"Quantité en stock",            pidgin:"How Much You Get",         ar:"كمية المخزون",           fulfulde:"Jomlo Ko Tagi" },
  organicLabel:{ en:"🌿 Organically Grown",        fr:"🌿 Cultivé biologiquement",    pidgin:"🌿 Natural, No Chemical",  ar:"🌿 مزروع عضوياً",        fulfulde:"🌿 Kesoowo Tigi" },
  organicDesc: { en:"No chemical pesticides or fertilisers used", fr:"Aucun pesticide ou engrais chimique utilisé", pidgin:"No chemical, e dey natural", ar:"لا مبيدات أو أسمدة كيميائية", fulfulde:"Alaa lahal kimik" },
  yourLocation:{ en:"Your Location",              fr:"Votre emplacement",            pidgin:"Wapi You Dey",             ar:"موقعك",                  fulfulde:"Toon ma" },
  locationPlaceholder: { en:"e.g. Bafoussam — Marché A, or Ngaoundéré — Centre-ville", fr:"ex. Bafoussam — Marché A, Ngaoundéré — Centre-ville", pidgin:"e.g. Bafoussam Market, Ngaoundéré Town", ar:"مثال: باÙوسام — السوق أ", fulfulde:"misaali: Bafoussam — Luumo A" },
  deliveryToggleLabel: { en:"🚚 Delivery Available", fr:"🚚 Livraison disponible", pidgin:"🚚 I Fit Deliver Am", ar:"🚚 التوصيل متاح", fulfulde:"🚚 E Waawi Addude" },
  deliveryToggleDesc:  { en:"You can deliver to buyers in your area", fr:"Vous pouvez livrer aux acheteurs de votre zone", pidgin:"You fit carry am go buyer house", ar:"يمكنك التوصيل للمشترين Ùي منطقتك", fulfulde:"A waawi addude e soodinooɓe e ley maa" },
  description: { en:"Description",                fr:"Description",                  pidgin:"Explain Wetin E Be",       ar:"الوصÙ",                  fulfulde:"Haala Ko'o" },
  descPlaceholder: { en:"Describe your produce: freshness, harvest date, how it was grown, how to use it, delivery details…", fr:"Décrivez votre produit : fraîcheur, date de récolte, mode de culture, utilisation, détails de livraison…", pidgin:"Explain your thing: fresh or not, when dem pick am, how to use am, delivery info…", ar:"صÙ منتجك: الطازجية، تاريخ الحصاد، طريقة الزراعة، كيÙية الاستخدام، تÙاصيل التوصيل…", fulfulde:"Haal ko'am maa: keso wala ɓuri, bimol nduri am, no addirde…" },
  saveDraft:   { en:"💾 Save Draft",               fr:"💾 Enregistrer le brouillon",  pidgin:"💾 Save Am",               ar:"💾 حÙظ المسودة",         fulfulde:"💾 Dooro Kuwtorka" },
  nextStep:    { en:"Next Step →",                 fr:"Étape suivante →",             pidgin:"Next Step →",              ar:"الخطوة التالية →",       fulfulde:"Toɓɓe Nde →" },
  addPhotos:   { en:"Add Photos →",                fr:"Ajouter des photos →",         pidgin:"Add Photos →",             ar:"أضÙ الصور →",            fulfulde:"Roŋku Natal →" },
  photoHeader: { en:"Add Photos",                  fr:"Ajouter des photos",           pidgin:"Add Photos",               ar:"أضÙ الصور",              fulfulde:"Roŋku Natal" },
  photoSub:    { en:"JPG, PNG or WebP · Max 5 MB each · Up to 6 photos", fr:"JPG, PNG ou WebP · Max 5 Mo chacune · Jusqu'à 6 photos", pidgin:"JPG, PNG or WebP · Max 5MB · Up to 6 photos", ar:"JPG أو PNG أو WebP · 5 ميغا كحد أقصى · حتى 6 صور", fulfulde:"JPG, PNG wala WebP · 5MB kaaɓal · Natal 6" },
  photoSecure: { en:"📸 Photos are uploaded securely to Bambeh servers — not stored on your phone.", fr:"📸 Les photos sont téléchargées en toute sécurité sur les serveurs Bambeh — non stockées sur votre téléphone.", pidgin:"📸 Photos dey upload secure for Bambeh server — no dey save for your phone.", ar:"📸 يتم رÙع الصور بأمان إلى خوادم Bambeh — ولا تÙخزَّن على هاتÙك.", fulfulde:"📸 Natal callinaa hukkaande e Bambeh server — alaa e telefon maa." },
  tapUpload:   { en:"Tap to upload photos of your produce", fr:"Appuyez pour télécharger des photos de votre produit", pidgin:"Tap here to upload photos of your thing", ar:"انقر لرÙع صور منتجك", fulfulde:"Tap hanga callude natal ko'am maa" },
  maxPhotos:   { en:"Maximum 6 photos", fr:"Maximum 6 photos", pidgin:"Max 6 photos", ar:"الحد الأقصى 6 صور", fulfulde:"Natal 6 ko kaaɓal" },
  listingSummary: { en:"📋 Listing Summary", fr:"📋 Résumé de l'annonce", pidgin:"📋 Summary of Wetin You Put", ar:"📋 ملخص الإعلان", fulfulde:"📋 Kuwtoro Hollirgol" },
  produceKey:  { en:"Produce",  fr:"Produit",  pidgin:"Wetin",    ar:"المنتج",  fulfulde:"Ko'o" },
  priceKey:    { en:"Price",    fr:"Prix",     pidgin:"Price",    ar:"السعر",   fulfulde:"Njamndi" },
  stockKey:    { en:"Stock",    fr:"Stock",    pidgin:"Wetin E Remain", ar:"المخزون", fulfulde:"Ko Tagi" },
  organicKey:  { en:"Organic",  fr:"Bio",      pidgin:"Natural",  ar:"عضوي",   fulfulde:"Keso" },
  deliveryKey: { en:"Delivery", fr:"Livraison",pidgin:"Delivery", ar:"التوصيل",fulfulde:"Addirde" },
  locationKey: { en:"Location", fr:"Lieu",     pidgin:"Wapi",     ar:"الموقع", fulfulde:"Toon" },
  photosKey:   { en:"Photos",   fr:"Photos",   pidgin:"Photos",   ar:"الصور",  fulfulde:"Natal" },
  notSpecified:{ en:"Not specified", fr:"Non spécifié", pidgin:"No put", ar:"غير محدد", fulfulde:"Alaa holliraa" },
  yesOrganic:  { en:"Yes 🌿",   fr:"Oui 🌿",   pidgin:"Yes 🌿",  ar:"نعم 🌿",  fulfulde:"Eey 🌿" },
  no:          { en:"No",       fr:"Non",      pidgin:"No",       ar:"لا",      fulfulde:"Alaa" },
  delivAvail:  { en:"Available 🚚", fr:"Disponible 🚚", pidgin:"E dey 🚚", ar:"متاح 🚚", fulfulde:"E Waawi 🚚" },
  pickupOnly:  { en:"Pickup only", fr:"Retrait uniquement", pidgin:"You go come pick am", ar:"استلام Ùقط", fulfulde:"Ko Neldi Tan" },
  noPhotosWarn:{ en:"⚠ None — fewer views without a photo", fr:"⚠ Aucune — moins de vues sans photo", pidgin:"⚠ None — people no go see am well", ar:"⚠ لا يوجد — مشاهدات أقل بدون صورة", fulfulde:"⚠ Alaa — yimɓe keewaa yiyde" },
  descPreview: { en:"Description preview", fr:"Aperçu de la description", pidgin:"See wetin you write", ar:"معاينة الوصÙ", fulfulde:"Yiy Haala" },
  minChars:    { en:"Min 20 characters", fr:"Min 20 caractères", pidgin:"Min 20 letters", ar:"20 حرÙًا كحد أدنى", fulfulde:"Aranɗe 20 ko ɓuri" },
  charCount:   { en:(n:number)=>`${n} chars`, fr:(n:number)=>`${n} car.`, pidgin:(n:number)=>`${n} letters`, ar:(n:number)=>`${n} حرÙ`, fulfulde:(n:number)=>`${n} aranɗe` },
  photosTip:   { en:"📸 Photos = more buyers", fr:"📸 Photos = plus d'acheteurs", pidgin:"📸 Photos = More People Go Buy", ar:"📸 الصور = مزيد من المشترين", fulfulde:"📸 Natal = Soodinooɓe Keewɗi" },
  photosTipBody: { en:"Listings with at least one clear photo get 3× more views than listings without. Buyers trust what they can see.", fr:"Les annonces avec au moins une photo claire obtiennent 3× plus de vues. Les acheteurs font confiance à ce qu'ils voient.", pidgin:"Things wey get photo get 3× more views. Buyers dey trust wetin dem see.", ar:"الإعلانات التي تحتوي على صورة واضحة تحصل على 3 أضعاÙ المشاهدات. المشترون يثقون بما يرونه.", fulfulde:"Hollirgol wona natal heɓa yii'de 3×. Soodinooɓe miimaago ko mbii'a." },
  photosTipSub: { en:"You can still post without a photo — your item will appear with a placeholder and a \"No photo\" badge until you add one.", fr:"Vous pouvez toujours publier sans photo — votre article apparaîtra avec un badge \"Sans photo\" jusqu'à ce que vous en ajoutiez une.", pidgin:"You fit still post am without photo — e go show with \"No photo\" badge till you add one.", ar:"يمكنك النشر بدون صورة — سيظهر منتجك ببادج \"لا توجد صورة\" حتى تضيÙ صورة.", fulfulde:"A waawi hollude hono natal — ko'am maa yii'ata e \"Alaa natal\" hanga a roŋkii." },
  worldwideVis: { en:"🌍 Your listing will be visible worldwide — any Bambeh user on any device can find and buy your produce.", fr:"🌍 Votre annonce sera visible dans le monde entier — tout utilisateur Bambeh peut trouver et acheter votre produit.", pidgin:"🌍 Your thing go show worldwide — any Bambeh person fit see am and buy.", ar:"🌍 سيكون إعلانك مرئيًا Ùي جميع أنحاء العالم — أي مستخدم Bambeh يمكنه العثور عليه وشراءه.", fulfulde:"🌍 Hollirgol maa yii'ataa e aduna fof — Bambeh jom fof waawi yiyde e soodude." },
  listWorldwide:{ en:"🚀 List Produce Worldwide", fr:"🚀 Publier dans le monde entier", pidgin:"🚀 Post Am Worldwide", ar:"🚀 نشر المنتج عالميًا", fulfulde:"🚀 Hollir Ko'o e Aduna Fof" },
  posting:     { en:"Posting…", fr:"Publication…", pidgin:"E dey post…", ar:"جارÙ النشر…", fulfulde:"E nani hollude…" },
  produceListed: { en:"Produce Listed!", fr:"Produit mis en ligne !", pidgin:"Your Thing Don List!", ar:"تم إدراج المنتج!", fulfulde:"Ko'oo Hollinaa!" },
  produceListedSub: { en:"Your produce is now live and visible worldwide to all Bambeh users on any device.", fr:"Votre produit est maintenant en ligne et visible dans le monde entier sur tous les appareils.", pidgin:"Your thing don show worldwide — all Bambeh people fit see am for any device.", ar:"منتجك الآن مباشر ومرئي عالميًا لجميع مستخدمي Bambeh على أي جهاز.", fulfulde:"Ko'am maa hollinii e aduna fof — Bambeh jom fof waawi yiyde e kala binndi." },
  produceListedSub2:{ en:"Buyers can contact you via WhatsApp, call, or place an order directly.", fr:"Les acheteurs peuvent vous contacter par WhatsApp, appel ou passer une commande directement.", pidgin:"Buyers fit reach you for WhatsApp, call, or order direct.", ar:"يمكن للمشترين التواصل معك عبر واتساب أو الاتصال أو تقديم طلب مباشرة.", fulfulde:"Soodinooɓe mbaawi noddude ma e WhatsApp, wala sariyaade tigi." },
  viewFarmFresh: { en:"View Farm Fresh", fr:"Voir Ferme Fraîche", pidgin:"Check Farm Fresh", ar:"عرض منتجات الزراعة", fulfulde:"Yiy Ley Ladde" },
  listAnother: { en:"List Another Produce", fr:"Lister un autre produit", pidgin:"Put Another Thing", ar:"أضÙ منتجًا آخر", fulfulde:"Hollir Koo Saka" },
  loginRequired:{ en:"Login Required", fr:"Connexion requise", pidgin:"You Must Login", ar:"تسجيل الدخول مطلوب", fulfulde:"Log In Ko Waɗata" },
  loginRequiredSub:{ en:"To post a listing that is visible to buyers worldwide, you need to be logged in.", fr:"Pour publier une annonce visible dans le monde entier, vous devez être connecté.", pidgin:"To post wetin people worldwide go see, you must login.", ar:"لنشر إعلان مرئي للمشترين Ùي جميع أنحاء العالم، تحتاج إلى تسجيل الدخول.", fulfulde:"Hange hollirgol yii'ataa e aduna, a waɗii Log In." },
  loginRequiredSub2:{ en:"Guest posts only save on your phone and no one else can see them.", fr:"Les publications en tant qu'invité ne sont enregistrées que sur votre téléphone.", pidgin:"Guest post na only your phone go save am, nobody else fit see.", ar:"المنشورات كضيÙ تÙحÙظ على هاتÙك Ùقط ولا يستطيع أحد رؤيتها.", fulfulde:"Hollirgol béli Log In sinndidaa e telefon maa tan." },
  logInSignUp: { en:"Log In / Sign Up", fr:"Se connecter / S'inscrire", pidgin:"Login / Register", ar:"تسجيل الدخول / التسجيل", fulfulde:"Log In / Winndir" },
  goBack:      { en:"Go Back", fr:"Retour", pidgin:"Go Back", ar:"العودة", fulfulde:"Waɗtu" },
  draftSaved:  { en:"Draft saved to your device ✅", fr:"Brouillon enregistré sur votre appareil ✅", pidgin:"Draft don save for your phone ✅", ar:"تم حÙظ المسودة على جهازك ✅", fulfulde:"Kuwtorka doornaa e binndi maa ✅" },
  required:    { en:"required", fr:"obligatoire", pidgin:"must", ar:"مطلوب", fulfulde:"ko waɗata" },

  // ── DirectPayModal (in FarmFreshDetail) ───────────────────────────────────
  payWithMoMo:   { en:"Pay with Mobile Money", fr:"Payer par Mobile Money", pidgin:"Pay with MoMo", ar:"ادÙع بالنقود المتنقلة", fulfulde:"Hol e Ceede Telefon" },
  poweredBy:     { en:"Powered by CamPay", fr:"Propulsé par CamPay", pidgin:"Na CamPay dey run am", ar:"مدعوم من CamPay", fulfulde:"CamPay hollirii" },
  mtnOrOrange:   { en:"MTN or Orange Money number", fr:"Numéro MTN ou Orange Money", pidgin:"MTN or Orange number", ar:"رقم MTN أو Orange Money", fulfulde:"Nomboro MTN wala Orange" },
  ussdPrompt:    { en:"A USSD prompt will appear on your phone. Enter your PIN to pay.", fr:"Une invite USSD apparaîtra sur votre téléphone. Entrez votre PIN pour payer.", pidgin:"USSD go show for your phone. Put your PIN to pay.", ar:"ستظهر رسالة USSD على هاتÙك. أدخل رمز PIN للدÙع.", fulfulde:"USSD yii'ataa e telefon maa. Roŋku PIN maa hanga holirde." },
  confirmPay:    { en:(n:number)=>`Confirm & Pay ${n.toLocaleString("fr-CM")} XAF`, fr:(n:number)=>`Confirmer & Payer ${n.toLocaleString("fr-CM")} XAF`, pidgin:(n:number)=>`Confirm & Pay ${n.toLocaleString("fr-CM")} XAF`, ar:(n:number)=>`تأكيد ودÙع ${n.toLocaleString("fr-CM")} XAF`, fulfulde:(n:number)=>`Hollu & Hol ${n.toLocaleString("fr-CM")} XAF` },
  checkPhone:    { en:"Check your phone!", fr:"Vérifiez votre téléphone !", pidgin:"Check your phone!", ar:"تحقق من هاتÙك!", fulfulde:"Yiy telefon maa!" },
  enterPin:      { en:"A payment request was sent to your number. Enter your PIN to approve.", fr:"Une demande de paiement a été envoyée à votre numéro. Entrez votre PIN pour approuver.", pidgin:"Payment request don go your number. Put your PIN to approve.", ar:"تم إرسال طلب دÙع إلى رقمك. أدخل رمز PIN للمواÙقة.", fulfulde:"Sariya ceede nawnaa e nomboro maa. Roŋku PIN maa hanga wallitde." },
  sendingRequest:{ en:"Sending payment request…", fr:"Envoi de la demande de paiement…", pidgin:"E dey send payment request…", ar:"جارÙ إرسال طلب الدÙع…", fulfulde:"E nawna sariya ceede…" },
  payFailed:     { en:"Payment Failed", fr:"Paiement échoué", pidgin:"Payment No Work", ar:"Ùشل الدÙع", fulfulde:"Hol Yawtaay" },
  questions:     { en:"Questions?", fr:"Questions ?", pidgin:"You get question?", ar:"أسئلة؟", fulfulde:"Humpitaari?" },
  securedEncrypted: { en:"Secured & encrypted via CamPay", fr:"Sécurisé & chiffré via CamPay", pidgin:"CamPay dey protect am well", ar:"آمن ومشÙّر عبر CamPay", fulfulde:"CamPay holloo am" },
  cancel:        { en:"Cancel", fr:"Annuler", pidgin:"Cancel Am", ar:"إلغاء", fulfulde:"Faggu" },
  paymentConfirmed: { en:"Payment Confirmed! 🎉", fr:"Paiement confirmé ! 🎉", pidgin:"Payment Don Confirm! 🎉", ar:"تم تأكيد الدÙع! 🎉", fulfulde:"Ceede Hoolnii! 🎉" },
  orderProcessed:   { en:"Your order is being processed.", fr:"Votre commande est en cours de traitement.", pidgin:"Dem dey process your order.", ar:"جارÙ معالجة طلبك.", fulfulde:"Sariya am jokki." },
  waiting:          { en:(m:number,s:number)=>`Waiting… ${m}:${String(s).padStart(2,"0")}`, fr:(m:number,s:number)=>`Attente… ${m}:${String(s).padStart(2,"0")}`, pidgin:(m:number,s:number)=>`E dey wait… ${m}:${String(s).padStart(2,"0")}`, ar:(m:number,s:number)=>`جارÙ الانتظار… ${m}:${String(s).padStart(2,"0")}`, fulfulde:(m:number,s:number)=>`E ɗaɓɓi… ${m}:${String(s).padStart(2,"0")}` },
  processing:    { en:"Processing…", fr:"Traitement…", pidgin:"E dey process…", ar:"معالجة…", fulfulde:"E sariyaade…" },
} as const;

/** Grab the right string for the current language. */
export function t<K extends keyof typeof T>(
  key: K,
  lang: Lang,
): (typeof T)[K][Lang] {
  return (T as any)[key]?.[lang] ?? (T as any)[key]?.["en"];
}

