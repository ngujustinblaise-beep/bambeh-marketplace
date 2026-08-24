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

// -----------------------------------------------------------------------------
// All FarmFresh UI strings — one object per language key
// -----------------------------------------------------------------------------

export const T = {
  // -- FarmFreshPage ----------------------------------------------------------
  farmFresh: {
    en:       "Farm Fresh",
    fr:       "Ferme Fraîche",
    pidgin:   "Farm Fresh",
    ar:       "?????? ???????",
    fulfulde: "Ley Ladde",
  },
  searchPlaceholder: {
    en:       "Search produce, location…",
    fr:       "Chercher un produit, lieu…",
    pidgin:   "Search wetin you want, wapi…",
    ar:       "???? ?? ????????? ??????…",
    fulfulde: "Yiylo ko nji?i, toon…",
  },
  sell: {
    en:       "Sell",
    fr:       "Vendre",
    pidgin:   "Sell Am",
    ar:       "???",
    fulfulde: "Yo?e",
  },
  buyDirect: {
    en:       "?? Buy Direct from Farmers",
    fr:       "?? Acheter directement chez les fermiers",
    pidgin:   "?? Buy Am Direct for Farmer Hand",
    ar:       "?? ????Ù ?????? ?? ?????????",
    fulfulde: "?? Sooddu Tigi e Maccu?e Ley",
  },
  buyDirectSub: {
    en:       "Fresh produce, fair prices. Visible to buyers worldwide.",
    fr:       "Produits frais, prix justes. Visible par les acheteurs du monde entier.",
    pidgin:   "Fresh thing, correct price. People wey dey everywhere fit see am.",
    ar:       "?????? ?????? ????? ?????. ???? ???????? Ù? ???? ????? ??????.",
    fulfulde: "Ko'e keso, njamndi laawol. Yim?e fof mbaawi yiyde.",
  },
  joinGroup: {
    en:       "Join Group Buying — Save More",
    fr:       "Rejoindre l'achat groupé — Économiser davantage",
    pidgin:   "Join Group Buy — Save Money Pass",
    ar:       "???? ?????? ??????? — ?Ù?? ????",
    fulfulde: "Naatir Soodirde e Jaamaare — Fayde Kalan",
  },
  loading: {
    en:       "Loading fresh produce…",
    fr:       "Chargement des produits frais…",
    pidgin:   "E dey load fresh thing…",
    ar:       "???Ù ????? ???????? ???????…",
    fulfulde: "E nani ko'e keso…",
  },
  noProduceFound: {
    en:       "No produce found",
    fr:       "Aucun produit trouvé",
    pidgin:   "Nothing dey here so",
    ar:       "?? ?Ù??? ??? ??????",
    fulfulde: "Alaa ko yi'aa",
  },
  listYourProduce: {
    en:       "List Your Produce",
    fr:       "Lister votre produit",
    pidgin:   "Put Your Thing for List",
    ar:       "??Ù ?????",
    fulfulde: "Hollir Ko'am ma",
  },
  realListings: {
    en:       (n: number) => `${n} real listing${n !== 1 ? "s" : ""} + sample items`,
    fr:       (n: number) => `${n} vraie${n !== 1 ? "s" : ""} annonce${n !== 1 ? "s" : ""} + exemples`,
    pidgin:   (n: number) => `${n} real thing${n !== 1 ? "s" : ""} + sample`,
    ar:       (n: number) => `${n} ????? ????? + ????? ???????`,
    fulfulde: (n: number) => `${n} hollirgol tigi + misal`,
  },
  showingSamples: {
    en:       (n: number) => `Showing ${n} sample items — be the first to list real produce!`,
    fr:       (n: number) => `${n} exemples affichés — soyez le premier à lister votre produit !`,
    pidgin:   (n: number) => `${n} sample thing dem dey — you go first put real one!`,
    ar:       (n: number) => `??? ${n} ????? ??????? — ?? ??? ?? ???Ù ?????? ???????!`,
    fulfulde: (n: number) => `Holliraa ${n} misal — no firo naatirgo ko'e tigi!`,
  },
  addToCart: {
    en:       "Add to Cart",
    fr:       "Ajouter au panier",
    pidgin:   "Put for Cart",
    ar:       "??Ù ??? ?????",
    fulfulde: "Ro?ku e Kartel",
  },
  added: {
    en:       "Added ?",
    fr:       "Ajouté ?",
    pidgin:   "E don enter ?",
    ar:       "??? ?????Ù? ?",
    fulfulde: "Ro?kaa ?",
  },
  views: {
    en:       "views",
    fr:       "vues",
    pidgin:   "people don see am",
    ar:       "???????",
    fulfulde: "yii'?i",
  },
  organic: {
    en:       "Bio",
    fr:       "Bio",
    pidgin:   "Natural",
    ar:       "????",
    fulfulde: "Kese",
  },
  noPhotoYet: {
    en:       "No photo yet",
    fr:       "Pas encore de photo",
    pidgin:   "No photo yet",
    ar:       "?? ???? ???? ???",
    fulfulde: "Alaa natal hannde",
  },
  cart: {
    en:       "Cart",
    fr:       "Panier",
    pidgin:   "Cart",
    ar:       "?????",
    fulfulde: "Kartel",
  },
  groupBuyingAd: {
    en:       { title: "Group Buying", subtitle: "Buy together, save more", cta: "Join a Group" },
    fr:       { title: "Achat groupé", subtitle: "Achetez ensemble, économisez plus", cta: "Rejoindre" },
    pidgin:   { title: "Buy Together", subtitle: "Join body, save money", cta: "Join Now" },
    ar:       { title: "???? ?????", subtitle: "????Ù ????? ?Ù?? ????", cta: "????" },
    fulfulde: { title: "Soodirde Jaamaare", subtitle: "Sooddu e yo'i, fayde", cta: "Naatir" },
  },
  sellProduceAd: {
    en:       { title: "Sell Your Produce", subtitle: "Reach buyers across Cameroon", cta: "List Now" },
    fr:       { title: "Vendez vos produits", subtitle: "Atteignez les acheteurs au Cameroun", cta: "Lister" },
    pidgin:   { title: "Sell Your Thing", subtitle: "Buyers for everywhere go see am", cta: "Put List" },
    ar:       { title: "?Ù? ???????", subtitle: "????? ?? ???????? Ù? ?????????", cta: "??Ù ????" },
    fulfulde: { title: "Yo?e Ko'am ma", subtitle: "Soodinoo?e fof mbaawi yiyde", cta: "Hollir" },
  },
  catAll:        { en:"All",        fr:"Tout",      pidgin:"All",        ar:"????",        fulfulde:"Fof"         },
  catVegetables: { en:"Vegetables", fr:"Légumes",   pidgin:"Veggies",    ar:"??????",      fulfulde:"Lekki Ko'e"  },
  catFruits:     { en:"Fruits",     fr:"Fruits",    pidgin:"Fruits",     ar:"Ù????",       fulfulde:"Biccol"      },
  catTubers:     { en:"Tubers",     fr:"Tubercules",pidgin:"Tubers",     ar:"?????",       fulfulde:"To??ere"    },
  catGrains:     { en:"Grains",     fr:"Céréales",  pidgin:"Grains",     ar:"????",        fulfulde:"Maaro"       },
  catLegumes:    { en:"Legumes",    fr:"Légumineuses",pidgin:"Legumes",  ar:"???????",     fulfulde:"Mboddi"      },
  catHerbs:      { en:"Herbs",      fr:"Herbes",    pidgin:"Herbs",      ar:"?????",       fulfulde:"Lekki Keso"  },
  catDairy:      { en:"Dairy",      fr:"Produits laitiers",pidgin:"Milk Thing",ar:"?????? ???????",fulfulde:"Kosam"},

  // -- FarmFreshDetail --------------------------------------------------------
  back:            { en:"Back",               fr:"Retour",              pidgin:"Go Back",           ar:"????",               fulfulde:"Wa?tu" },
  seller:          { en:"Seller",             fr:"Vendeur",             pidgin:"Seller",             ar:"??????",             fulfulde:"Yo?owo" },
  whatsapp:        { en:"WhatsApp",           fr:"WhatsApp",            pidgin:"WhatsApp",           ar:"??????",             fulfulde:"WhatsApp" },
  call:            { en:"Call",               fr:"Appeler",             pidgin:"Call Am",            ar:"????",               fulfulde:"Noddu" },
  joinGroupBuy:    { en:"Join Group Buying",  fr:"Rejoindre l'achat groupé", pidgin:"Join Group Buy", ar:"???? ?????? ???????", fulfulde:"Naatir Soodirde Jaamaare" },
  joinGroupBuySub: { en:"Pool orders with other buyers and save more", fr:"Commandez ensemble et économisez davantage", pidgin:"Join body, buy together, save plenty money", ar:"???? ??????? ?? ?????? ????? ??Ù?? ????", fulfulde:"Sooddu e yo'i, fayde kalan" },
  aboutProduce:    { en:"About this Produce", fr:"À propos de ce produit", pidgin:"Wetin dis thing be", ar:"?? ??? ??????", fulfulde:"Ko hollirgol e Ko'oo" },
  safetyTip:       { en:"Safety tip:", fr:"Conseil de sécurité :", pidgin:"Safety advice:", ar:"????? ????:", fulfulde:"Ladde lafol:" },
  safetyText:      { en:"Always use Bambeh Escrow for payments. Meet in a safe, public place for pickup.", fr:"Utilisez toujours Bambeh Escrow pour les paiements. Rencontrez-vous dans un endroit sûr et public.", pidgin:"Always use Bambeh Escrow for money. Meet for safe place wey people dey.", ar:"?????? ?????? Bambeh Escrow ????Ù????. ????Ù Ù? ???? ??? ????.", fulfulde:"Jom Bambeh Escrow ngam ceede fof. Yetto e yim?e e toon laawol." },
  reportListing:   { en:"Report this listing", fr:"Signaler cette annonce", pidgin:"Report dis thing", ar:"??????? ?? ??? ???????", fulfulde:"Hollir Ko'oo e mbayliigu" },
  stock:           { en:"Stock:", fr:"Stock :", pidgin:"Wetin remain:", ar:"???????:", fulfulde:"Ko tagi:" },
  deliveryAvail:   { en:"Delivery available", fr:"Livraison disponible", pidgin:"Dem fit deliver am", ar:"??????? ????", fulfulde:"E waawi addude" },
  harvested:       { en:"Harvested:", fr:"Récolté le :", pidgin:"Dem harvest am:", ar:"????? ??????:", fulfulde:"Nduri am:" },
  addToCartBtn:    { en:"Add to Cart", fr:"Ajouter au panier", pidgin:"Put for Cart", ar:"??Ù ??? ?????", fulfulde:"Ro?ku e Kartel" },
  addedBtn:        { en:"Added!", fr:"Ajouté !", pidgin:"E don enter!", ar:"??? ?????Ù?!", fulfulde:"Ro?kaa!" },
  payNow:          { en:"Pay Now", fr:"Payer maintenant", pidgin:"Pay Now", ar:"??Ù? ????", fulfulde:"Hol Hannde" },
  linkCopied:      { en:"Link copied!", fr:"Lien copié !", pidgin:"Link don copy!", ar:"?? ??? ??????!", fulfulde:"To?re nawnaa!" },
  addedToCart:     { en:"Added to cart", fr:"Ajouté au panier", pidgin:"E don enter cart", ar:"??? ?????Ù? ??? ?????", fulfulde:"Ro?kaa e Kartel" },
  total:           { en:"Total", fr:"Total", pidgin:"Total", ar:"???????", fulfulde:"Fof" },
  demoSample:      { en:"DEMO — Sample Item", fr:"DÉMO — Article exemple", pidgin:"DEMO — Sample Thing", ar:"?????? — ???? ??????", fulfulde:"DEMO — Misal" },
  productNotFound: { en:"Product not found", fr:"Produit introuvable", pidgin:"Dem no find dat thing", ar:"?????? ??? ?????", fulfulde:"Ko'oo alaa" },
  browseFF:        { en:"Browse Farm Fresh", fr:"Parcourir Ferme Fraîche", pidgin:"Check Farm Fresh", ar:"??Ù? ?????? ???????", fulfulde:"Yiy Ley Ladde" },
  orderPlaced:     { en:"Order Placed! ??", fr:"Commande passée ! ??", pidgin:"Order Don Enter! ??", ar:"?? ????? ?????! ??", fulfulde:"Sariya yawtii! ??" },
  payConfirmed:    { en:"Payment confirmed. Your order is being processed.", fr:"Paiement confirmé. Votre commande est en cours de traitement.", pidgin:"Payment don confirm. Dem dey process your order.", ar:"?? ????? ???Ù?. ???Ù ?????? ????.", fulfulde:"Ceede hoolnii. Sariyagol am jokki." },
  trackOrder:      { en:"Track Order", fr:"Suivre la commande", pidgin:"Track My Order", ar:"???? ?????", fulfulde:"Tabito Sariya" },
  keepShopping:    { en:"Keep Shopping", fr:"Continuer les achats", pidgin:"Continue Buying", ar:"?????? ??????", fulfulde:"Jokku Soodude" },

  // -- FarmFreshOrderPage -----------------------------------------------------
  orderHeader:       { en:"Order:", fr:"Commande :", pidgin:"Order:", ar:"???:", fulfulde:"Sariya:" },
  demoWarning:       { en:"? Demo item — no real transaction", fr:"? Article démo — aucune transaction réelle", pidgin:"? Demo thing — no real money", ar:"? ???? ?????? — ?? ?????? ??????", fulfulde:"? Misal — alaa ceede tigi" },
  quantity:          { en:"Quantity", fr:"Quantité", pidgin:"How Much", ar:"??????", fulfulde:"Jomlo" },
  deliveryDetails:   { en:"Delivery Details", fr:"Détails de livraison", pidgin:"Delivery Info", ar:"?Ù???? ???????", fulfulde:"To??e Addirde" },
  deliveryAddress:   { en:"Delivery Address", fr:"Adresse de livraison", pidgin:"Wapi Dem Go Deliver", ar:"????? ???????", fulfulde:"Toon Addirde" },
  addressPlaceholder:{ en:"e.g. Carrefour Elig-Essono, Quartier Omnisport, Yaoundé", fr:"ex. Carrefour Elig-Essono, Quartier Omnisport, Yaoundé", pidgin:"e.g. Carrefour Elig-Essono, Yaoundé", ar:"????: ???Ù?? ?????-??????? ??????", fulfulde:"misaali: Carrefour Elig-Essono, Yaoundé" },
  phoneNumber:       { en:"Phone Number", fr:"Numéro de téléphone", pidgin:"Phone Number", ar:"??? ?????Ù", fulfulde:"Nomboro Telefon" },
  specialInstructions:{ en:"Special Instructions (optional)", fr:"Instructions spéciales (facultatif)", pidgin:"Special Request (no must)", ar:"??????? ???? (???????)", fulfulde:"Kaftaa?um (haalal)" },
  instructPlaceholder:{ en:"e.g. Call me before delivery, deliver in the morning…", fr:"ex. Appelez-moi avant la livraison, livrez le matin…", pidgin:"e.g. Call me before dem come, bring am for morning…", ar:"????: ???? ??? ??? ???????? ???? Ù? ??????…", fulfulde:"misaali: Nodduu am kaan addan addude, addirde subaka…" },
  demoNotice:        { en:"? Demo item: This is a sample product. Your order will be saved locally for preview purposes — no real transaction or delivery will occur.", fr:"? Article démo : Il s'agit d'un produit exemple. Votre commande sera enregistrée localement à des fins d'aperçu — aucune transaction ou livraison réelle n'aura lieu.", pidgin:"? Demo thing: Na sample product dis. Your order go save for your phone only — no real money or delivery.", ar:"? ???? ??????: ??? ???? ??????. ???? ?Ù? ???? ?????? ?????? ???????? — ?? ??? ?? ?????? ?? ????? ?????.", fulfulde:"? Misal: Ko'oo ko misal. Sariya am sinndidaa e telefon maa tan — alaa ceede wala addirde tigi." },
  placeOrder:        { en:"Place Order", fr:"Passer la commande", pidgin:"Send Order", ar:"????? ?????", fulfulde:"Naat Sariya" },
  placingOrder:      { en:"Placing order…", fr:"Commande en cours…", pidgin:"E dey send order…", ar:"???Ù ????? ?????…", fulfulde:"E nani sariya…" },
  orderPlacedTitle:  { en:"Order Placed! ??", fr:"Commande passée ! ??", pidgin:"Order Don Enter! ??", ar:"?? ????? ?????! ??", fulfulde:"Sariya yawtii! ??" },
  demoOrderNote:     { en:"This was a demo order — no real transaction was made.", fr:"Il s'agissait d'une commande démo — aucune transaction réelle n'a été effectuée.", pidgin:"Na demo order dis — no real money move.", ar:"??? ??? ????? ???????? — ?? ??? ?? ?????? ??????.", fulfulde:"Sariya misal tan — alaa ceede tigi." },
  farmerContact:     { en:(phone:string)=>`The farmer will contact you at ${phone} to confirm delivery.`, fr:(phone:string)=>`Le fermier vous contactera au ${phone} pour confirmer la livraison.`, pidgin:(phone:string)=>`Farmer go call you for ${phone} to confirm delivery.`, ar:(phone:string)=>`????? ?? ??????? ??? ${phone} ?????? ???????.`, fulfulde:(phone:string)=>`Maccu?o ley noddata ma e ${phone} hanga wallitdo addirde.` },
  backToFarmFresh:   { en:"Back to Farm Fresh", fr:"Retour à Ferme Fraîche", pidgin:"Go Back Farm Fresh", ar:"?????? ??? ?????? ???????", fulfulde:"Wa?tu Ley Ladde" },
  viewMyOrders:      { en:"View My Orders", fr:"Voir mes commandes", pidgin:"Check My Orders", ar:"??? ??????", fulfulde:"Yiy Sariyaa?i Am" },
  enterAddress:      { en:"Please enter your delivery address.", fr:"Veuillez saisir votre adresse de livraison.", pidgin:"Put your delivery address abeg.", ar:"???? ????? ????? ???????.", fulfulde:"Hollir toon addirde maa." },
  enterPhone:        { en:"Please enter a valid phone number.", fr:"Veuillez saisir un numéro de téléphone valide.", pidgin:"Put correct phone number abeg.", ar:"???? ????? ??? ???Ù ????.", fulfulde:"Hollir nomboro telefon mo??o." },

  // -- FarmFreshSellerPage ----------------------------------------------------
  listYourProducePage: { en:"?? List Your Produce", fr:"?? Lister votre produit", pidgin:"?? Put Your Farm Thing", ar:"?? ??Ù ????? ???????", fulfulde:"?? Hollir Ko'am ma" },
  step1Label:  { en:"Produce Details",             fr:"Détails du produit",          pidgin:"Wetin You Dey Sell",       ar:"?Ù???? ??????",          fulfulde:"To??e Ko'o" },
  step2Label:  { en:"Location & Description",      fr:"Lieu & Description",           pidgin:"Wapi e Wetin E Be",        ar:"?????? ?????Ù",          fulfulde:"Toon e Haala" },
  step3Label:  { en:"Photos & Review",             fr:"Photos & Révision",            pidgin:"Photos e Check Am",        ar:"????? ?????????",        fulfulde:"Natal e Kuwtoro" },
  produceName: { en:"Produce Name",                fr:"Nom du produit",               pidgin:"Wetin You Dey Sell",       ar:"??? ??????",             fulfulde:"Inde Ko'o" },
  produceNamePlaceholder: { en:"e.g. Fresh Tomatoes, Plantains, Cocoyams", fr:"ex. Tomates fraîches, Plantains, Macabo", pidgin:"e.g. Fresh Tomatoes, Plantains", ar:"????: ????? ?????? ???? ?????", fulfulde:"misaali: Tomates, Baana, Macabo" },
  category:    { en:"Category",                    fr:"Catégorie",                    pidgin:"Wetin Kind",               ar:"??Ù??",                  fulfulde:"Gon?inde" },
  unit:        { en:"Unit",                        fr:"Unité",                        pidgin:"How You Measure Am",       ar:"??????",                 fulfulde:"?eewnude" },
  priceLabel:  { en:"Price (FCFA)",                fr:"Prix (FCFA)",                  pidgin:"Price (FCFA)",             ar:"????? (Ù???)",           fulfulde:"Njamndi (FCFA)" },
  stockQty:    { en:"Stock Quantity",              fr:"Quantité en stock",            pidgin:"How Much You Get",         ar:"???? ???????",           fulfulde:"Jomlo Ko Tagi" },
  organicLabel:{ en:"?? Organically Grown",        fr:"?? Cultivé biologiquement",    pidgin:"?? Natural, No Chemical",  ar:"?? ????? ??????",        fulfulde:"?? Kesoowo Tigi" },
  organicDesc: { en:"No chemical pesticides or fertilisers used", fr:"Aucun pesticide ou engrais chimique utilisé", pidgin:"No chemical, e dey natural", ar:"?? ?????? ?? ????? ????????", fulfulde:"Alaa lahal kimik" },
  yourLocation:{ en:"Your Location",              fr:"Votre emplacement",            pidgin:"Wapi You Dey",             ar:"?????",                  fulfulde:"Toon ma" },
  locationPlaceholder: { en:"e.g. Bafoussam — Marché A, or Ngaoundéré — Centre-ville", fr:"ex. Bafoussam — Marché A, Ngaoundéré — Centre-ville", pidgin:"e.g. Bafoussam Market, Ngaoundéré Town", ar:"????: ??Ù???? — ????? ?", fulfulde:"misaali: Bafoussam — Luumo A" },
  deliveryToggleLabel: { en:"?? Delivery Available", fr:"?? Livraison disponible", pidgin:"?? I Fit Deliver Am", ar:"?? ??????? ????", fulfulde:"?? E Waawi Addude" },
  deliveryToggleDesc:  { en:"You can deliver to buyers in your area", fr:"Vous pouvez livrer aux acheteurs de votre zone", pidgin:"You fit carry am go buyer house", ar:"????? ??????? ???????? Ù? ??????", fulfulde:"A waawi addude e soodinoo?e e ley maa" },
  description: { en:"Description",                fr:"Description",                  pidgin:"Explain Wetin E Be",       ar:"????Ù",                  fulfulde:"Haala Ko'o" },
  descPlaceholder: { en:"Describe your produce: freshness, harvest date, how it was grown, how to use it, delivery details…", fr:"Décrivez votre produit : fraîcheur, date de récolte, mode de culture, utilisation, détails de livraison…", pidgin:"Explain your thing: fresh or not, when dem pick am, how to use am, delivery info…", ar:"?Ù ?????: ????????? ????? ??????? ????? ???????? ??Ù?? ?????????? ?Ù???? ???????…", fulfulde:"Haal ko'am maa: keso wala ?uri, bimol nduri am, no addirde…" },
  saveDraft:   { en:"?? Save Draft",               fr:"?? Enregistrer le brouillon",  pidgin:"?? Save Am",               ar:"?? ?Ù? ???????",         fulfulde:"?? Dooro Kuwtorka" },
  nextStep:    { en:"Next Step ?",                 fr:"Étape suivante ?",             pidgin:"Next Step ?",              ar:"?????? ??????? ?",       fulfulde:"To??e Nde ?" },
  addPhotos:   { en:"Add Photos ?",                fr:"Ajouter des photos ?",         pidgin:"Add Photos ?",             ar:"??Ù ????? ?",            fulfulde:"Ro?ku Natal ?" },
  photoHeader: { en:"Add Photos",                  fr:"Ajouter des photos",           pidgin:"Add Photos",               ar:"??Ù ?????",              fulfulde:"Ro?ku Natal" },
  photoSub:    { en:"JPG, PNG or WebP · Max 5 MB each · Up to 6 photos", fr:"JPG, PNG ou WebP · Max 5 Mo chacune · Jusqu'à 6 photos", pidgin:"JPG, PNG or WebP · Max 5MB · Up to 6 photos", ar:"JPG ?? PNG ?? WebP · 5 ???? ??? ???? · ??? 6 ???", fulfulde:"JPG, PNG wala WebP · 5MB kaa?al · Natal 6" },
  photoSecure: { en:"?? Photos are uploaded securely to Bambeh servers — not stored on your phone.", fr:"?? Les photos sont téléchargées en toute sécurité sur les serveurs Bambeh — non stockées sur votre téléphone.", pidgin:"?? Photos dey upload secure for Bambeh server — no dey save for your phone.", ar:"?? ??? ?Ù? ????? ????? ??? ????? Bambeh — ??? ?Ù????? ??? ???Ù?.", fulfulde:"?? Natal callinaa hukkaande e Bambeh server — alaa e telefon maa." },
  tapUpload:   { en:"Tap to upload photos of your produce", fr:"Appuyez pour télécharger des photos de votre produit", pidgin:"Tap here to upload photos of your thing", ar:"???? ??Ù? ??? ?????", fulfulde:"Tap hanga callude natal ko'am maa" },
  maxPhotos:   { en:"Maximum 6 photos", fr:"Maximum 6 photos", pidgin:"Max 6 photos", ar:"???? ?????? 6 ???", fulfulde:"Natal 6 ko kaa?al" },
  listingSummary: { en:"?? Listing Summary", fr:"?? Résumé de l'annonce", pidgin:"?? Summary of Wetin You Put", ar:"?? ???? ???????", fulfulde:"?? Kuwtoro Hollirgol" },
  produceKey:  { en:"Produce",  fr:"Produit",  pidgin:"Wetin",    ar:"??????",  fulfulde:"Ko'o" },
  priceKey:    { en:"Price",    fr:"Prix",     pidgin:"Price",    ar:"?????",   fulfulde:"Njamndi" },
  stockKey:    { en:"Stock",    fr:"Stock",    pidgin:"Wetin E Remain", ar:"???????", fulfulde:"Ko Tagi" },
  organicKey:  { en:"Organic",  fr:"Bio",      pidgin:"Natural",  ar:"????",   fulfulde:"Keso" },
  deliveryKey: { en:"Delivery", fr:"Livraison",pidgin:"Delivery", ar:"???????",fulfulde:"Addirde" },
  locationKey: { en:"Location", fr:"Lieu",     pidgin:"Wapi",     ar:"??????", fulfulde:"Toon" },
  photosKey:   { en:"Photos",   fr:"Photos",   pidgin:"Photos",   ar:"?????",  fulfulde:"Natal" },
  notSpecified:{ en:"Not specified", fr:"Non spécifié", pidgin:"No put", ar:"??? ????", fulfulde:"Alaa holliraa" },
  yesOrganic:  { en:"Yes ??",   fr:"Oui ??",   pidgin:"Yes ??",  ar:"??? ??",  fulfulde:"Eey ??" },
  no:          { en:"No",       fr:"Non",      pidgin:"No",       ar:"??",      fulfulde:"Alaa" },
  delivAvail:  { en:"Available ??", fr:"Disponible ??", pidgin:"E dey ??", ar:"???? ??", fulfulde:"E Waawi ??" },
  pickupOnly:  { en:"Pickup only", fr:"Retrait uniquement", pidgin:"You go come pick am", ar:"?????? Ù??", fulfulde:"Ko Neldi Tan" },
  noPhotosWarn:{ en:"? None — fewer views without a photo", fr:"? Aucune — moins de vues sans photo", pidgin:"? None — people no go see am well", ar:"? ?? ???? — ??????? ??? ???? ????", fulfulde:"? Alaa — yim?e keewaa yiyde" },
  descPreview: { en:"Description preview", fr:"Aperçu de la description", pidgin:"See wetin you write", ar:"?????? ????Ù", fulfulde:"Yiy Haala" },
  minChars:    { en:"Min 20 characters", fr:"Min 20 caractères", pidgin:"Min 20 letters", ar:"20 ??Ù?? ??? ????", fulfulde:"Aran?e 20 ko ?uri" },
  charCount:   { en:(n:number)=>`${n} chars`, fr:(n:number)=>`${n} car.`, pidgin:(n:number)=>`${n} letters`, ar:(n:number)=>`${n} ??Ù`, fulfulde:(n:number)=>`${n} aran?e` },
  photosTip:   { en:"?? Photos = more buyers", fr:"?? Photos = plus d'acheteurs", pidgin:"?? Photos = More People Go Buy", ar:"?? ????? = ???? ?? ????????", fulfulde:"?? Natal = Soodinoo?e Keew?i" },
  photosTipBody: { en:"Listings with at least one clear photo get 3× more views than listings without. Buyers trust what they can see.", fr:"Les annonces avec au moins une photo claire obtiennent 3× plus de vues. Les acheteurs font confiance à ce qu'ils voient.", pidgin:"Things wey get photo get 3× more views. Buyers dey trust wetin dem see.", ar:"????????? ???? ????? ??? ???? ????? ???? ??? 3 ????Ù ?????????. ???????? ????? ??? ?????.", fulfulde:"Hollirgol wona natal he?a yii'de 3×. Soodinoo?e miimaago ko mbii'a." },
  photosTipSub: { en:"You can still post without a photo — your item will appear with a placeholder and a \"No photo\" badge until you add one.", fr:"Vous pouvez toujours publier sans photo — votre article apparaîtra avec un badge \"Sans photo\" jusqu'à ce que vous en ajoutiez une.", pidgin:"You fit still post am without photo — e go show with \"No photo\" badge till you add one.", ar:"????? ????? ???? ???? — ????? ????? ????? \"?? ???? ????\" ??? ???Ù ????.", fulfulde:"A waawi hollude hono natal — ko'am maa yii'ata e \"Alaa natal\" hanga a ro?kii." },
  worldwideVis: { en:"?? Your listing will be visible worldwide — any Bambeh user on any device can find and buy your produce.", fr:"?? Votre annonce sera visible dans le monde entier — tout utilisateur Bambeh peut trouver et acheter votre produit.", pidgin:"?? Your thing go show worldwide — any Bambeh person fit see am and buy.", ar:"?? ????? ?????? ?????? Ù? ???? ????? ?????? — ?? ?????? Bambeh ????? ?????? ???? ??????.", fulfulde:"?? Hollirgol maa yii'ataa e aduna fof — Bambeh jom fof waawi yiyde e soodude." },
  listWorldwide:{ en:"?? List Produce Worldwide", fr:"?? Publier dans le monde entier", pidgin:"?? Post Am Worldwide", ar:"?? ??? ?????? ???????", fulfulde:"?? Hollir Ko'o e Aduna Fof" },
  posting:     { en:"Posting…", fr:"Publication…", pidgin:"E dey post…", ar:"???Ù ?????…", fulfulde:"E nani hollude…" },
  produceListed: { en:"Produce Listed!", fr:"Produit mis en ligne !", pidgin:"Your Thing Don List!", ar:"?? ????? ??????!", fulfulde:"Ko'oo Hollinaa!" },
  produceListedSub: { en:"Your produce is now live and visible worldwide to all Bambeh users on any device.", fr:"Votre produit est maintenant en ligne et visible dans le monde entier sur tous les appareils.", pidgin:"Your thing don show worldwide — all Bambeh people fit see am for any device.", ar:"????? ???? ????? ????? ??????? ????? ??????? Bambeh ??? ?? ????.", fulfulde:"Ko'am maa hollinii e aduna fof — Bambeh jom fof waawi yiyde e kala binndi." },
  produceListedSub2:{ en:"Buyers can contact you via WhatsApp, call, or place an order directly.", fr:"Les acheteurs peuvent vous contacter par WhatsApp, appel ou passer une commande directement.", pidgin:"Buyers fit reach you for WhatsApp, call, or order direct.", ar:"???? ???????? ??????? ??? ??? ?????? ?? ??????? ?? ????? ??? ??????.", fulfulde:"Soodinoo?e mbaawi noddude ma e WhatsApp, wala sariyaade tigi." },
  viewFarmFresh: { en:"View Farm Fresh", fr:"Voir Ferme Fraîche", pidgin:"Check Farm Fresh", ar:"??? ?????? ???????", fulfulde:"Yiy Ley Ladde" },
  listAnother: { en:"List Another Produce", fr:"Lister un autre produit", pidgin:"Put Another Thing", ar:"??Ù ?????? ???", fulfulde:"Hollir Koo Saka" },
  loginRequired:{ en:"Login Required", fr:"Connexion requise", pidgin:"You Must Login", ar:"????? ?????? ?????", fulfulde:"Log In Ko Wa?ata" },
  loginRequiredSub:{ en:"To post a listing that is visible to buyers worldwide, you need to be logged in.", fr:"Pour publier une annonce visible dans le monde entier, vous devez être connecté.", pidgin:"To post wetin people worldwide go see, you must login.", ar:"???? ????? ???? ???????? Ù? ???? ????? ??????? ????? ??? ????? ??????.", fulfulde:"Hange hollirgol yii'ataa e aduna, a wa?ii Log In." },
  loginRequiredSub2:{ en:"Guest posts only save on your phone and no one else can see them.", fr:"Les publications en tant qu'invité ne sont enregistrées que sur votre téléphone.", pidgin:"Guest post na only your phone go save am, nobody else fit see.", ar:"????????? ???Ù ?Ù?Ù? ??? ???Ù? Ù?? ??? ?????? ??? ??????.", fulfulde:"Hollirgol béli Log In sinndidaa e telefon maa tan." },
  logInSignUp: { en:"Log In / Sign Up", fr:"Se connecter / S'inscrire", pidgin:"Login / Register", ar:"????? ?????? / ???????", fulfulde:"Log In / Winndir" },
  goBack:      { en:"Go Back", fr:"Retour", pidgin:"Go Back", ar:"??????", fulfulde:"Wa?tu" },
  draftSaved:  { en:"Draft saved to your device ?", fr:"Brouillon enregistré sur votre appareil ?", pidgin:"Draft don save for your phone ?", ar:"?? ?Ù? ??????? ??? ????? ?", fulfulde:"Kuwtorka doornaa e binndi maa ?" },
  required:    { en:"required", fr:"obligatoire", pidgin:"must", ar:"?????", fulfulde:"ko wa?ata" },

  // -- DirectPayModal (in FarmFreshDetail) -----------------------------------
  payWithMoMo:   { en:"Pay with Mobile Money", fr:"Payer par Mobile Money", pidgin:"Pay with MoMo", ar:"??Ù? ??????? ????????", fulfulde:"Hol e Ceede Telefon" },
  poweredBy:     { en:"Powered by CamPay", fr:"Propulsé par CamPay", pidgin:"Na CamPay dey run am", ar:"????? ?? CamPay", fulfulde:"CamPay hollirii" },
  mtnOrOrange:   { en:"MTN or Orange Money number", fr:"Numéro MTN ou Orange Money", pidgin:"MTN or Orange number", ar:"??? MTN ?? Orange Money", fulfulde:"Nomboro MTN wala Orange" },
  ussdPrompt:    { en:"A USSD prompt will appear on your phone. Enter your PIN to pay.", fr:"Une invite USSD apparaîtra sur votre téléphone. Entrez votre PIN pour payer.", pidgin:"USSD go show for your phone. Put your PIN to pay.", ar:"????? ????? USSD ??? ???Ù?. ???? ??? PIN ???Ù?.", fulfulde:"USSD yii'ataa e telefon maa. Ro?ku PIN maa hanga holirde." },
  confirmPay:    { en:(n:number)=>`Confirm & Pay ${n.toLocaleString("fr-CM")} XAF`, fr:(n:number)=>`Confirmer & Payer ${n.toLocaleString("fr-CM")} XAF`, pidgin:(n:number)=>`Confirm & Pay ${n.toLocaleString("fr-CM")} XAF`, ar:(n:number)=>`????? ??Ù? ${n.toLocaleString("fr-CM")} XAF`, fulfulde:(n:number)=>`Hollu & Hol ${n.toLocaleString("fr-CM")} XAF` },
  checkPhone:    { en:"Check your phone!", fr:"Vérifiez votre téléphone !", pidgin:"Check your phone!", ar:"???? ?? ???Ù?!", fulfulde:"Yiy telefon maa!" },
  enterPin:      { en:"A payment request was sent to your number. Enter your PIN to approve.", fr:"Une demande de paiement a été envoyée à votre numéro. Entrez votre PIN pour approuver.", pidgin:"Payment request don go your number. Put your PIN to approve.", ar:"?? ????? ??? ?Ù? ??? ????. ???? ??? PIN ?????Ù??.", fulfulde:"Sariya ceede nawnaa e nomboro maa. Ro?ku PIN maa hanga wallitde." },
  sendingRequest:{ en:"Sending payment request…", fr:"Envoi de la demande de paiement…", pidgin:"E dey send payment request…", ar:"???Ù ????? ??? ???Ù?…", fulfulde:"E nawna sariya ceede…" },
  payFailed:     { en:"Payment Failed", fr:"Paiement échoué", pidgin:"Payment No Work", ar:"Ù?? ???Ù?", fulfulde:"Hol Yawtaay" },
  questions:     { en:"Questions?", fr:"Questions ?", pidgin:"You get question?", ar:"??????", fulfulde:"Humpitaari?" },
  securedEncrypted: { en:"Secured & encrypted via CamPay", fr:"Sécurisé & chiffré via CamPay", pidgin:"CamPay dey protect am well", ar:"??? ???Ù?? ??? CamPay", fulfulde:"CamPay holloo am" },
  cancel:        { en:"Cancel", fr:"Annuler", pidgin:"Cancel Am", ar:"?????", fulfulde:"Faggu" },
  paymentConfirmed: { en:"Payment Confirmed! ??", fr:"Paiement confirmé ! ??", pidgin:"Payment Don Confirm! ??", ar:"?? ????? ???Ù?! ??", fulfulde:"Ceede Hoolnii! ??" },
  orderProcessed:   { en:"Your order is being processed.", fr:"Votre commande est en cours de traitement.", pidgin:"Dem dey process your order.", ar:"???Ù ?????? ????.", fulfulde:"Sariya am jokki." },
  waiting:          { en:(m:number,s:number)=>`Waiting… ${m}:${String(s).padStart(2,"0")}`, fr:(m:number,s:number)=>`Attente… ${m}:${String(s).padStart(2,"0")}`, pidgin:(m:number,s:number)=>`E dey wait… ${m}:${String(s).padStart(2,"0")}`, ar:(m:number,s:number)=>`???Ù ????????… ${m}:${String(s).padStart(2,"0")}`, fulfulde:(m:number,s:number)=>`E ?a??i… ${m}:${String(s).padStart(2,"0")}` },
  processing:    { en:"Processing…", fr:"Traitement…", pidgin:"E dey process…", ar:"??????…", fulfulde:"E sariyaade…" },
} as const;

/** Grab the right string for the current language. */
export function t<K extends keyof typeof T>(
  key: K,
  lang: Lang,
): (typeof T)[K][Lang] {
  return (T as any)[key]?.[lang] ?? (T as any)[key]?.["en"];
}



