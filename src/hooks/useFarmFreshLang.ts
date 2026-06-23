/**
 * src/hooks/useFarmFreshLang.ts â€” Bambeh Marketplace
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// All FarmFresh UI strings â€” one object per language key
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const T = {
  // â”€â”€ FarmFreshPage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  farmFresh: {
    en:       "Farm Fresh",
    fr:       "Ferme FraÃ®che",
    pidgin:   "Farm Fresh",
    ar:       "Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø²Ø±Ø§Ø¹Ø©",
    fulfulde: "Ley Ladde",
  },
  searchPlaceholder: {
    en:       "Search produce, locationâ€¦",
    fr:       "Chercher un produit, lieuâ€¦",
    pidgin:   "Search wetin you want, wapiâ€¦",
    ar:       "Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ù†ØªØ¬Ø§ØªØŒ Ø§Ù„Ù…ÙˆÙ‚Ø¹â€¦",
    fulfulde: "Yiylo ko njiêžŒi, toonâ€¦",
  },
  sell: {
    en:       "Sell",
    fr:       "Vendre",
    pidgin:   "Sell Am",
    ar:       "Ø¨ÙŠØ¹",
    fulfulde: "YoÉ“e",
  },
  buyDirect: {
    en:       "ðŸŒ¿ Buy Direct from Farmers",
    fr:       "ðŸŒ¿ Acheter directement chez les fermiers",
    pidgin:   "ðŸŒ¿ Buy Am Direct for Farmer Hand",
    ar:       "ðŸŒ¿ Ø§Ø´ØªØ±Ã™Â Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ù† Ø§Ù„Ù…Ø²Ø§Ø±Ø¹ÙŠÙ†",
    fulfulde: "ðŸŒ¿ Sooddu Tigi e MaccuÉ“e Ley",
  },
  buyDirectSub: {
    en:       "Fresh produce, fair prices. Visible to buyers worldwide.",
    fr:       "Produits frais, prix justes. Visible par les acheteurs du monde entier.",
    pidgin:   "Fresh thing, correct price. People wey dey everywhere fit see am.",
    ar:       "Ù…Ù†ØªØ¬Ø§Øª Ø·Ø§Ø²Ø¬Ø©ØŒ Ø£Ø³Ø¹Ø§Ø± Ø¹Ø§Ø¯Ù„Ø©. Ù…Ø±Ø¦ÙŠ Ù„Ù„Ù…Ø´ØªØ±ÙŠÙ† Ã™ÂÙŠ Ø¬Ù…ÙŠØ¹ Ø£Ù†Ø­Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù„Ù….",
    fulfulde: "Ko'e keso, njamndi laawol. YimÉ“e fof mbaawi yiyde.",
  },
  joinGroup: {
    en:       "Join Group Buying â€” Save More",
    fr:       "Rejoindre l'achat groupÃ© â€” Ã‰conomiser davantage",
    pidgin:   "Join Group Buy â€” Save Money Pass",
    ar:       "Ø§Ù†Ø¶Ù… Ù„Ù„Ø´Ø±Ø§Ø¡ Ø§Ù„Ø¬Ù…Ø§Ø¹ÙŠ â€” ÙˆÃ™ÂÙ‘Ø± Ø£ÙƒØ«Ø±",
    fulfulde: "Naatir Soodirde e Jaamaare â€” Fayde Kalan",
  },
  loading: {
    en:       "Loading fresh produceâ€¦",
    fr:       "Chargement des produits fraisâ€¦",
    pidgin:   "E dey load fresh thingâ€¦",
    ar:       "Ø¬Ø§Ø±Ã™Â ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø·Ø§Ø²Ø¬Ø©â€¦",
    fulfulde: "E nani ko'e kesoâ€¦",
  },
  noProduceFound: {
    en:       "No produce found",
    fr:       "Aucun produit trouvÃ©",
    pidgin:   "Nothing dey here so",
    ar:       "Ù„Ù… ÙŠÃ™ÂØ¹Ø«Ø± Ø¹Ù„Ù‰ Ù…Ù†ØªØ¬Ø§Øª",
    fulfulde: "Alaa ko yi'aa",
  },
  listYourProduce: {
    en:       "List Your Produce",
    fr:       "Lister votre produit",
    pidgin:   "Put Your Thing for List",
    ar:       "Ø£Ø¶Ã™Â Ù…Ù†ØªØ¬Ùƒ",
    fulfulde: "Hollir Ko'am ma",
  },
  realListings: {
    en:       (n: number) => `${n} real listing${n !== 1 ? "s" : ""} + sample items`,
    fr:       (n: number) => `${n} vraie${n !== 1 ? "s" : ""} annonce${n !== 1 ? "s" : ""} + exemples`,
    pidgin:   (n: number) => `${n} real thing${n !== 1 ? "s" : ""} + sample`,
    ar:       (n: number) => `${n} Ø¥Ø¹Ù„Ø§Ù† Ø­Ù‚ÙŠÙ‚ÙŠ + Ø¹Ù†Ø§ØµØ± Ù†Ù…ÙˆØ°Ø¬ÙŠØ©`,
    fulfulde: (n: number) => `${n} hollirgol tigi + misal`,
  },
  showingSamples: {
    en:       (n: number) => `Showing ${n} sample items â€” be the first to list real produce!`,
    fr:       (n: number) => `${n} exemples affichÃ©s â€” soyez le premier Ã  lister votre produit !`,
    pidgin:   (n: number) => `${n} sample thing dem dey â€” you go first put real one!`,
    ar:       (n: number) => `Ø¹Ø±Ø¶ ${n} Ø¹Ù†Ø§ØµØ± Ù†Ù…ÙˆØ°Ø¬ÙŠØ© â€” ÙƒÙ† Ø£ÙˆÙ„ Ù…Ù† ÙŠØ¶ÙŠÃ™Â Ù…Ù†ØªØ¬Ø§Ù‹ Ø­Ù‚ÙŠÙ‚ÙŠØ§Ù‹!`,
    fulfulde: (n: number) => `Holliraa ${n} misal â€” no firo naatirgo ko'e tigi!`,
  },
  addToCart: {
    en:       "Add to Cart",
    fr:       "Ajouter au panier",
    pidgin:   "Put for Cart",
    ar:       "Ø£Ø¶Ã™Â Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©",
    fulfulde: "RoÅ‹ku e Kartel",
  },
  added: {
    en:       "Added âœ“",
    fr:       "AjoutÃ© âœ“",
    pidgin:   "E don enter âœ“",
    ar:       "ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§Ã™ÂØ© âœ“",
    fulfulde: "RoÅ‹kaa âœ“",
  },
  views: {
    en:       "views",
    fr:       "vues",
    pidgin:   "people don see am",
    ar:       "Ù…Ø´Ø§Ù‡Ø¯Ø§Øª",
    fulfulde: "yii'É—i",
  },
  organic: {
    en:       "Bio",
    fr:       "Bio",
    pidgin:   "Natural",
    ar:       "Ø¹Ø¶ÙˆÙŠ",
    fulfulde: "Kese",
  },
  noPhotoYet: {
    en:       "No photo yet",
    fr:       "Pas encore de photo",
    pidgin:   "No photo yet",
    ar:       "Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±Ø© Ø¨Ø¹Ø¯",
    fulfulde: "Alaa natal hannde",
  },
  cart: {
    en:       "Cart",
    fr:       "Panier",
    pidgin:   "Cart",
    ar:       "Ø§Ù„Ø³Ù„Ø©",
    fulfulde: "Kartel",
  },
  groupBuyingAd: {
    en:       { title: "Group Buying", subtitle: "Buy together, save more", cta: "Join a Group" },
    fr:       { title: "Achat groupÃ©", subtitle: "Achetez ensemble, Ã©conomisez plus", cta: "Rejoindre" },
    pidgin:   { title: "Buy Together", subtitle: "Join body, save money", cta: "Join Now" },
    ar:       { title: "Ø´Ø±Ø§Ø¡ Ø¬Ù…Ø§Ø¹ÙŠ", subtitle: "Ø§Ø´ØªØ±Ã™Â Ù…Ø¹Ø§Ù‹ØŒ ÙˆÃ™ÂÙ‘Ø± Ø£ÙƒØ«Ø±", cta: "Ø§Ù†Ø¶Ù…" },
    fulfulde: { title: "Soodirde Jaamaare", subtitle: "Sooddu e yo'i, fayde", cta: "Naatir" },
  },
  sellProduceAd: {
    en:       { title: "Sell Your Produce", subtitle: "Reach buyers across Cameroon", cta: "List Now" },
    fr:       { title: "Vendez vos produits", subtitle: "Atteignez les acheteurs au Cameroun", cta: "Lister" },
    pidgin:   { title: "Sell Your Thing", subtitle: "Buyers for everywhere go see am", cta: "Put List" },
    ar:       { title: "Ø¨Ã™ÂØ¹ Ù…Ù†ØªØ¬Ø§ØªÙƒ", subtitle: "ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ù…Ø´ØªØ±ÙŠÙ† Ã™ÂÙŠ Ø§Ù„ÙƒØ§Ù…ÙŠØ±ÙˆÙ†", cta: "Ø£Ø¶Ã™Â Ø§Ù„Ø¢Ù†" },
    fulfulde: { title: "YoÉ“e Ko'am ma", subtitle: "SoodinooÉ“e fof mbaawi yiyde", cta: "Hollir" },
  },
  catAll:        { en:"All",        fr:"Tout",      pidgin:"All",        ar:"Ø§Ù„ÙƒÙ„",        fulfulde:"Fof"         },
  catVegetables: { en:"Vegetables", fr:"LÃ©gumes",   pidgin:"Veggies",    ar:"Ø®Ø¶Ø±ÙˆØ§Øª",      fulfulde:"Lekki Ko'e"  },
  catFruits:     { en:"Fruits",     fr:"Fruits",    pidgin:"Fruits",     ar:"Ã™ÂÙˆØ§ÙƒÙ‡",       fulfulde:"Biccol"      },
  catTubers:     { en:"Tubers",     fr:"Tubercules",pidgin:"Tubers",     ar:"Ø¯Ø±Ù†Ø§Øª",       fulfulde:"ToÉ“É“ere"    },
  catGrains:     { en:"Grains",     fr:"CÃ©rÃ©ales",  pidgin:"Grains",     ar:"Ø­Ø¨ÙˆØ¨",        fulfulde:"Maaro"       },
  catLegumes:    { en:"Legumes",    fr:"LÃ©gumineuses",pidgin:"Legumes",  ar:"Ø¨Ù‚ÙˆÙ„ÙŠØ§Øª",     fulfulde:"Mboddi"      },
  catHerbs:      { en:"Herbs",      fr:"Herbes",    pidgin:"Herbs",      ar:"Ø£Ø¹Ø´Ø§Ø¨",       fulfulde:"Lekki Keso"  },
  catDairy:      { en:"Dairy",      fr:"Produits laitiers",pidgin:"Milk Thing",ar:"Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø£Ù„Ø¨Ø§Ù†",fulfulde:"Kosam"},

  // â”€â”€ FarmFreshDetail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  back:            { en:"Back",               fr:"Retour",              pidgin:"Go Back",           ar:"Ø±Ø¬ÙˆØ¹",               fulfulde:"WaÉ—tu" },
  seller:          { en:"Seller",             fr:"Vendeur",             pidgin:"Seller",             ar:"Ø§Ù„Ø¨Ø§Ø¦Ø¹",             fulfulde:"YoÉ“owo" },
  whatsapp:        { en:"WhatsApp",           fr:"WhatsApp",            pidgin:"WhatsApp",           ar:"ÙˆØ§ØªØ³Ø§Ø¨",             fulfulde:"WhatsApp" },
  call:            { en:"Call",               fr:"Appeler",             pidgin:"Call Am",            ar:"Ø§ØªØµÙ„",               fulfulde:"Noddu" },
  joinGroupBuy:    { en:"Join Group Buying",  fr:"Rejoindre l'achat groupÃ©", pidgin:"Join Group Buy", ar:"Ø§Ù†Ø¶Ù… Ù„Ù„Ø´Ø±Ø§Ø¡ Ø§Ù„Ø¬Ù…Ø§Ø¹ÙŠ", fulfulde:"Naatir Soodirde Jaamaare" },
  joinGroupBuySub: { en:"Pool orders with other buyers and save more", fr:"Commandez ensemble et Ã©conomisez davantage", pidgin:"Join body, buy together, save plenty money", ar:"Ø§Ø¬Ù…Ø¹ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ù…Ø¹ Ù…Ø´ØªØ±ÙŠÙ† Ø¢Ø®Ø±ÙŠÙ† ÙˆÙˆÃ™ÂÙ‘Ø± Ø£ÙƒØ«Ø±", fulfulde:"Sooddu e yo'i, fayde kalan" },
  aboutProduce:    { en:"About this Produce", fr:"Ã€ propos de ce produit", pidgin:"Wetin dis thing be", ar:"Ø¹Ù† Ù‡Ø°Ø§ Ø§Ù„Ù…Ù†ØªØ¬", fulfulde:"Ko hollirgol e Ko'oo" },
  safetyTip:       { en:"Safety tip:", fr:"Conseil de sÃ©curitÃ© :", pidgin:"Safety advice:", ar:"Ù†ØµÙŠØ­Ø© Ø£Ù…Ø§Ù†:", fulfulde:"Ladde lafol:" },
  safetyText:      { en:"Always use Bambeh Escrow for payments. Meet in a safe, public place for pickup.", fr:"Utilisez toujours Bambeh Escrow pour les paiements. Rencontrez-vous dans un endroit sÃ»r et public.", pidgin:"Always use Bambeh Escrow for money. Meet for safe place wey people dey.", ar:"Ø§Ø³ØªØ®Ø¯Ù… Ø¯Ø§Ø¦Ù…Ù‹Ø§ Bambeh Escrow Ù„Ù„Ù…Ø¯Ã™ÂÙˆØ¹Ø§Øª. Ø§Ù„ØªÙ‚Ã™Â Ã™ÂÙŠ Ù…ÙƒØ§Ù† Ø¢Ù…Ù† ÙˆØ¹Ø§Ù….", fulfulde:"Jom Bambeh Escrow ngam ceede fof. Yetto e yimÉ“e e toon laawol." },
  reportListing:   { en:"Report this listing", fr:"Signaler cette annonce", pidgin:"Report dis thing", ar:"Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†", fulfulde:"Hollir Ko'oo e mbayliigu" },
  stock:           { en:"Stock:", fr:"Stock :", pidgin:"Wetin remain:", ar:"Ø§Ù„Ù…Ø®Ø²ÙˆÙ†:", fulfulde:"Ko tagi:" },
  deliveryAvail:   { en:"Delivery available", fr:"Livraison disponible", pidgin:"Dem fit deliver am", ar:"Ø§Ù„ØªÙˆØµÙŠÙ„ Ù…ØªØ§Ø­", fulfulde:"E waawi addude" },
  harvested:       { en:"Harvested:", fr:"RÃ©coltÃ© le :", pidgin:"Dem harvest am:", ar:"ØªØ§Ø±ÙŠØ® Ø§Ù„Ø­ØµØ§Ø¯:", fulfulde:"Nduri am:" },
  addToCartBtn:    { en:"Add to Cart", fr:"Ajouter au panier", pidgin:"Put for Cart", ar:"Ø£Ø¶Ã™Â Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©", fulfulde:"RoÅ‹ku e Kartel" },
  addedBtn:        { en:"Added!", fr:"AjoutÃ© !", pidgin:"E don enter!", ar:"ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§Ã™ÂØ©!", fulfulde:"RoÅ‹kaa!" },
  payNow:          { en:"Pay Now", fr:"Payer maintenant", pidgin:"Pay Now", ar:"Ø§Ø¯Ã™ÂØ¹ Ø§Ù„Ø¢Ù†", fulfulde:"Hol Hannde" },
  linkCopied:      { en:"Link copied!", fr:"Lien copiÃ© !", pidgin:"Link don copy!", ar:"ØªÙ… Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø·!", fulfulde:"ToÉ“re nawnaa!" },
  addedToCart:     { en:"Added to cart", fr:"AjoutÃ© au panier", pidgin:"E don enter cart", ar:"ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§Ã™ÂØ© Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©", fulfulde:"RoÅ‹kaa e Kartel" },
  total:           { en:"Total", fr:"Total", pidgin:"Total", ar:"Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹", fulfulde:"Fof" },
  demoSample:      { en:"DEMO â€” Sample Item", fr:"DÃ‰MO â€” Article exemple", pidgin:"DEMO â€” Sample Thing", ar:"ØªØ¬Ø±ÙŠØ¨ÙŠ â€” Ø¹Ù†ØµØ± Ù†Ù…ÙˆØ°Ø¬ÙŠ", fulfulde:"DEMO â€” Misal" },
  productNotFound: { en:"Product not found", fr:"Produit introuvable", pidgin:"Dem no find dat thing", ar:"Ø§Ù„Ù…Ù†ØªØ¬ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯", fulfulde:"Ko'oo alaa" },
  browseFF:        { en:"Browse Farm Fresh", fr:"Parcourir Ferme FraÃ®che", pidgin:"Check Farm Fresh", ar:"ØªØµÃ™ÂØ­ Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø²Ø±Ø§Ø¹Ø©", fulfulde:"Yiy Ley Ladde" },
  orderPlaced:     { en:"Order Placed! ðŸŽ‰", fr:"Commande passÃ©e ! ðŸŽ‰", pidgin:"Order Don Enter! ðŸŽ‰", ar:"ØªÙ… ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ù„Ø¨! ðŸŽ‰", fulfulde:"Sariya yawtii! ðŸŽ‰" },
  payConfirmed:    { en:"Payment confirmed. Your order is being processed.", fr:"Paiement confirmÃ©. Votre commande est en cours de traitement.", pidgin:"Payment don confirm. Dem dey process your order.", ar:"ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¯Ã™ÂØ¹. Ø¬Ø§Ø±Ã™Â Ù…Ø¹Ø§Ù„Ø¬Ø© Ø·Ù„Ø¨Ùƒ.", fulfulde:"Ceede hoolnii. Sariyagol am jokki." },
  trackOrder:      { en:"Track Order", fr:"Suivre la commande", pidgin:"Track My Order", ar:"ØªØªØ¨Ø¹ Ø§Ù„Ø·Ù„Ø¨", fulfulde:"Tabito Sariya" },
  keepShopping:    { en:"Keep Shopping", fr:"Continuer les achats", pidgin:"Continue Buying", ar:"Ù…ÙˆØ§ØµÙ„Ø© Ø§Ù„ØªØ³ÙˆÙ‚", fulfulde:"Jokku Soodude" },

  // â”€â”€ FarmFreshOrderPage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  orderHeader:       { en:"Order:", fr:"Commande :", pidgin:"Order:", ar:"Ø·Ù„Ø¨:", fulfulde:"Sariya:" },
  demoWarning:       { en:"âš  Demo item â€” no real transaction", fr:"âš  Article dÃ©mo â€” aucune transaction rÃ©elle", pidgin:"âš  Demo thing â€” no real money", ar:"âš  Ø¹Ù†ØµØ± ØªØ¬Ø±ÙŠØ¨ÙŠ â€” Ù„Ø§ Ù…Ø¹Ø§Ù…Ù„Ø© Ø­Ù‚ÙŠÙ‚ÙŠØ©", fulfulde:"âš  Misal â€” alaa ceede tigi" },
  quantity:          { en:"Quantity", fr:"QuantitÃ©", pidgin:"How Much", ar:"Ø§Ù„ÙƒÙ…ÙŠØ©", fulfulde:"Jomlo" },
  deliveryDetails:   { en:"Delivery Details", fr:"DÃ©tails de livraison", pidgin:"Delivery Info", ar:"ØªÃ™ÂØ§ØµÙŠÙ„ Ø§Ù„ØªÙˆØµÙŠÙ„", fulfulde:"ToÉ“É“e Addirde" },
  deliveryAddress:   { en:"Delivery Address", fr:"Adresse de livraison", pidgin:"Wapi Dem Go Deliver", ar:"Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØªÙˆØµÙŠÙ„", fulfulde:"Toon Addirde" },
  addressPlaceholder:{ en:"e.g. Carrefour Elig-Essono, Quartier Omnisport, YaoundÃ©", fr:"ex. Carrefour Elig-Essono, Quartier Omnisport, YaoundÃ©", pidgin:"e.g. Carrefour Elig-Essono, YaoundÃ©", ar:"Ù…Ø«Ø§Ù„: ÙƒØ§Ø±Ã™ÂÙˆØ± Ø¥ÙŠÙ„ÙŠØº-Ø¥ÙŠØ³ÙˆÙ†ÙˆØŒ ÙŠØ§ÙˆÙ†Ø¯ÙŠ", fulfulde:"misaali: Carrefour Elig-Essono, YaoundÃ©" },
  phoneNumber:       { en:"Phone Number", fr:"NumÃ©ro de tÃ©lÃ©phone", pidgin:"Phone Number", ar:"Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÃ™Â", fulfulde:"Nomboro Telefon" },
  specialInstructions:{ en:"Special Instructions (optional)", fr:"Instructions spÃ©ciales (facultatif)", pidgin:"Special Request (no must)", ar:"ØªØ¹Ù„ÙŠÙ…Ø§Øª Ø®Ø§ØµØ© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)", fulfulde:"KaftaaÉ—um (haalal)" },
  instructPlaceholder:{ en:"e.g. Call me before delivery, deliver in the morningâ€¦", fr:"ex. Appelez-moi avant la livraison, livrez le matinâ€¦", pidgin:"e.g. Call me before dem come, bring am for morningâ€¦", ar:"Ù…Ø«Ø§Ù„: Ø§ØªØµÙ„ Ø¨Ù„ÙŠ Ù‚Ø¨Ù„ Ø§Ù„ØªÙˆØµÙŠÙ„ØŒ ÙˆØµÙ‘Ù„ Ã™ÂÙŠ Ø§Ù„ØµØ¨Ø§Ø­â€¦", fulfulde:"misaali: Nodduu am kaan addan addude, addirde subakaâ€¦" },
  demoNotice:        { en:"âš  Demo item: This is a sample product. Your order will be saved locally for preview purposes â€” no real transaction or delivery will occur.", fr:"âš  Article dÃ©mo : Il s'agit d'un produit exemple. Votre commande sera enregistrÃ©e localement Ã  des fins d'aperÃ§u â€” aucune transaction ou livraison rÃ©elle n'aura lieu.", pidgin:"âš  Demo thing: Na sample product dis. Your order go save for your phone only â€” no real money or delivery.", ar:"âš  Ø¹Ù†ØµØ± ØªØ¬Ø±ÙŠØ¨ÙŠ: Ù‡Ø°Ø§ Ù…Ù†ØªØ¬ Ù†Ù…ÙˆØ°Ø¬ÙŠ. Ø³ÙŠØªÙ… Ø­Ã™ÂØ¸ Ø·Ù„Ø¨Ùƒ Ù…Ø­Ù„ÙŠÙ‹Ø§ Ù„Ø£ØºØ±Ø§Ø¶ Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø© â€” Ù„Ù† ØªØªÙ… Ø£ÙŠ Ù…Ø¹Ø§Ù…Ù„Ø© Ø£Ùˆ ØªØ³Ù„ÙŠÙ… Ø­Ù‚ÙŠÙ‚ÙŠ.", fulfulde:"âš  Misal: Ko'oo ko misal. Sariya am sinndidaa e telefon maa tan â€” alaa ceede wala addirde tigi." },
  placeOrder:        { en:"Place Order", fr:"Passer la commande", pidgin:"Send Order", ar:"ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ù„Ø¨", fulfulde:"Naat Sariya" },
  placingOrder:      { en:"Placing orderâ€¦", fr:"Commande en coursâ€¦", pidgin:"E dey send orderâ€¦", ar:"Ø¬Ø§Ø±Ã™Â ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ù„Ø¨â€¦", fulfulde:"E nani sariyaâ€¦" },
  orderPlacedTitle:  { en:"Order Placed! ðŸŒ¿", fr:"Commande passÃ©e ! ðŸŒ¿", pidgin:"Order Don Enter! ðŸŒ¿", ar:"ØªÙ… ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ù„Ø¨! ðŸŒ¿", fulfulde:"Sariya yawtii! ðŸŒ¿" },
  demoOrderNote:     { en:"This was a demo order â€” no real transaction was made.", fr:"Il s'agissait d'une commande dÃ©mo â€” aucune transaction rÃ©elle n'a Ã©tÃ© effectuÃ©e.", pidgin:"Na demo order dis â€” no real money move.", ar:"ÙƒØ§Ù† Ù‡Ø°Ø§ Ø·Ù„Ø¨Ù‹Ø§ ØªØ¬Ø±ÙŠØ¨ÙŠÙ‹Ø§ â€” Ù„Ù… ØªØªÙ… Ø£ÙŠ Ù…Ø¹Ø§Ù…Ù„Ø© Ø­Ù‚ÙŠÙ‚ÙŠØ©.", fulfulde:"Sariya misal tan â€” alaa ceede tigi." },
  farmerContact:     { en:(phone:string)=>`The farmer will contact you at ${phone} to confirm delivery.`, fr:(phone:string)=>`Le fermier vous contactera au ${phone} pour confirmer la livraison.`, pidgin:(phone:string)=>`Farmer go call you for ${phone} to confirm delivery.`, ar:(phone:string)=>`Ø³ÙŠØªØµÙ„ Ø¨Ùƒ Ø§Ù„Ù…Ø²Ø§Ø±Ø¹ Ø¹Ù„Ù‰ ${phone} Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„ØªÙˆØµÙŠÙ„.`, fulfulde:(phone:string)=>`MaccuÉ—o ley noddata ma e ${phone} hanga wallitdo addirde.` },
  backToFarmFresh:   { en:"Back to Farm Fresh", fr:"Retour Ã  Ferme FraÃ®che", pidgin:"Go Back Farm Fresh", ar:"Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø²Ø±Ø§Ø¹Ø©", fulfulde:"WaÉ—tu Ley Ladde" },
  viewMyOrders:      { en:"View My Orders", fr:"Voir mes commandes", pidgin:"Check My Orders", ar:"Ø¹Ø±Ø¶ Ø·Ù„Ø¨Ø§ØªÙŠ", fulfulde:"Yiy SariyaaÉ—i Am" },
  enterAddress:      { en:"Please enter your delivery address.", fr:"Veuillez saisir votre adresse de livraison.", pidgin:"Put your delivery address abeg.", ar:"ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØªÙˆØµÙŠÙ„.", fulfulde:"Hollir toon addirde maa." },
  enterPhone:        { en:"Please enter a valid phone number.", fr:"Veuillez saisir un numÃ©ro de tÃ©lÃ©phone valide.", pidgin:"Put correct phone number abeg.", ar:"ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø±Ù‚Ù… Ù‡Ø§ØªÃ™Â ØµØ­ÙŠØ­.", fulfulde:"Hollir nomboro telefon moÆ´Æ´o." },

  // â”€â”€ FarmFreshSellerPage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listYourProducePage: { en:"ðŸŒ¿ List Your Produce", fr:"ðŸŒ¿ Lister votre produit", pidgin:"ðŸŒ¿ Put Your Farm Thing", ar:"ðŸŒ¿ Ø£Ø¶Ã™Â Ù…Ù†ØªØ¬Ùƒ Ø§Ù„Ø²Ø±Ø§Ø¹ÙŠ", fulfulde:"ðŸŒ¿ Hollir Ko'am ma" },
  step1Label:  { en:"Produce Details",             fr:"DÃ©tails du produit",          pidgin:"Wetin You Dey Sell",       ar:"ØªÃ™ÂØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬",          fulfulde:"ToÉ“É“e Ko'o" },
  step2Label:  { en:"Location & Description",      fr:"Lieu & Description",           pidgin:"Wapi e Wetin E Be",        ar:"Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØ§Ù„ÙˆØµÃ™Â",          fulfulde:"Toon e Haala" },
  step3Label:  { en:"Photos & Review",             fr:"Photos & RÃ©vision",            pidgin:"Photos e Check Am",        ar:"Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©",        fulfulde:"Natal e Kuwtoro" },
  produceName: { en:"Produce Name",                fr:"Nom du produit",               pidgin:"Wetin You Dey Sell",       ar:"Ø§Ø³Ù… Ø§Ù„Ù…Ù†ØªØ¬",             fulfulde:"Inde Ko'o" },
  produceNamePlaceholder: { en:"e.g. Fresh Tomatoes, Plantains, Cocoyams", fr:"ex. Tomates fraÃ®ches, Plantains, Macabo", pidgin:"e.g. Fresh Tomatoes, Plantains", ar:"Ù…Ø«Ø§Ù„: Ø·Ù…Ø§Ø·Ù… Ø·Ø§Ø²Ø¬Ø©ØŒ Ù…ÙˆØ²ØŒ Ù‚Ù„Ù‚Ø§Ø³", fulfulde:"misaali: Tomates, Baana, Macabo" },
  category:    { en:"Category",                    fr:"CatÃ©gorie",                    pidgin:"Wetin Kind",               ar:"Ø§Ù„Ã™ÂØ¦Ø©",                  fulfulde:"GonÉ—inde" },
  unit:        { en:"Unit",                        fr:"UnitÃ©",                        pidgin:"How You Measure Am",       ar:"Ø§Ù„ÙˆØ­Ø¯Ø©",                 fulfulde:"Æ³eewnude" },
  priceLabel:  { en:"Price (FCFA)",                fr:"Prix (FCFA)",                  pidgin:"Price (FCFA)",             ar:"Ø§Ù„Ø³Ø¹Ø± (Ã™ÂØ±Ù†Ùƒ)",           fulfulde:"Njamndi (FCFA)" },
  stockQty:    { en:"Stock Quantity",              fr:"QuantitÃ© en stock",            pidgin:"How Much You Get",         ar:"ÙƒÙ…ÙŠØ© Ø§Ù„Ù…Ø®Ø²ÙˆÙ†",           fulfulde:"Jomlo Ko Tagi" },
  organicLabel:{ en:"ðŸŒ¿ Organically Grown",        fr:"ðŸŒ¿ CultivÃ© biologiquement",    pidgin:"ðŸŒ¿ Natural, No Chemical",  ar:"ðŸŒ¿ Ù…Ø²Ø±ÙˆØ¹ Ø¹Ø¶ÙˆÙŠØ§Ù‹",        fulfulde:"ðŸŒ¿ Kesoowo Tigi" },
  organicDesc: { en:"No chemical pesticides or fertilisers used", fr:"Aucun pesticide ou engrais chimique utilisÃ©", pidgin:"No chemical, e dey natural", ar:"Ù„Ø§ Ù…Ø¨ÙŠØ¯Ø§Øª Ø£Ùˆ Ø£Ø³Ù…Ø¯Ø© ÙƒÙŠÙ…ÙŠØ§Ø¦ÙŠØ©", fulfulde:"Alaa lahal kimik" },
  yourLocation:{ en:"Your Location",              fr:"Votre emplacement",            pidgin:"Wapi You Dey",             ar:"Ù…ÙˆÙ‚Ø¹Ùƒ",                  fulfulde:"Toon ma" },
  locationPlaceholder: { en:"e.g. Bafoussam â€” MarchÃ© A, or NgaoundÃ©rÃ© â€” Centre-ville", fr:"ex. Bafoussam â€” MarchÃ© A, NgaoundÃ©rÃ© â€” Centre-ville", pidgin:"e.g. Bafoussam Market, NgaoundÃ©rÃ© Town", ar:"Ù…Ø«Ø§Ù„: Ø¨Ø§Ã™ÂÙˆØ³Ø§Ù… â€” Ø§Ù„Ø³ÙˆÙ‚ Ø£", fulfulde:"misaali: Bafoussam â€” Luumo A" },
  deliveryToggleLabel: { en:"ðŸšš Delivery Available", fr:"ðŸšš Livraison disponible", pidgin:"ðŸšš I Fit Deliver Am", ar:"ðŸšš Ø§Ù„ØªÙˆØµÙŠÙ„ Ù…ØªØ§Ø­", fulfulde:"ðŸšš E Waawi Addude" },
  deliveryToggleDesc:  { en:"You can deliver to buyers in your area", fr:"Vous pouvez livrer aux acheteurs de votre zone", pidgin:"You fit carry am go buyer house", ar:"ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„ØªÙˆØµÙŠÙ„ Ù„Ù„Ù…Ø´ØªØ±ÙŠÙ† Ã™ÂÙŠ Ù…Ù†Ø·Ù‚ØªÙƒ", fulfulde:"A waawi addude e soodinooÉ“e e ley maa" },
  description: { en:"Description",                fr:"Description",                  pidgin:"Explain Wetin E Be",       ar:"Ø§Ù„ÙˆØµÃ™Â",                  fulfulde:"Haala Ko'o" },
  descPlaceholder: { en:"Describe your produce: freshness, harvest date, how it was grown, how to use it, delivery detailsâ€¦", fr:"DÃ©crivez votre produit : fraÃ®cheur, date de rÃ©colte, mode de culture, utilisation, dÃ©tails de livraisonâ€¦", pidgin:"Explain your thing: fresh or not, when dem pick am, how to use am, delivery infoâ€¦", ar:"ØµÃ™Â Ù…Ù†ØªØ¬Ùƒ: Ø§Ù„Ø·Ø§Ø²Ø¬ÙŠØ©ØŒ ØªØ§Ø±ÙŠØ® Ø§Ù„Ø­ØµØ§Ø¯ØŒ Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø²Ø±Ø§Ø¹Ø©ØŒ ÙƒÙŠÃ™ÂÙŠØ© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…ØŒ ØªÃ™ÂØ§ØµÙŠÙ„ Ø§Ù„ØªÙˆØµÙŠÙ„â€¦", fulfulde:"Haal ko'am maa: keso wala É“uri, bimol nduri am, no addirdeâ€¦" },
  saveDraft:   { en:"ðŸ’¾ Save Draft",               fr:"ðŸ’¾ Enregistrer le brouillon",  pidgin:"ðŸ’¾ Save Am",               ar:"ðŸ’¾ Ø­Ã™ÂØ¸ Ø§Ù„Ù…Ø³ÙˆØ¯Ø©",         fulfulde:"ðŸ’¾ Dooro Kuwtorka" },
  nextStep:    { en:"Next Step â†’",                 fr:"Ã‰tape suivante â†’",             pidgin:"Next Step â†’",              ar:"Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„ØªØ§Ù„ÙŠØ© â†’",       fulfulde:"ToÉ“É“e Nde â†’" },
  addPhotos:   { en:"Add Photos â†’",                fr:"Ajouter des photos â†’",         pidgin:"Add Photos â†’",             ar:"Ø£Ø¶Ã™Â Ø§Ù„ØµÙˆØ± â†’",            fulfulde:"RoÅ‹ku Natal â†’" },
  photoHeader: { en:"Add Photos",                  fr:"Ajouter des photos",           pidgin:"Add Photos",               ar:"Ø£Ø¶Ã™Â Ø§Ù„ØµÙˆØ±",              fulfulde:"RoÅ‹ku Natal" },
  photoSub:    { en:"JPG, PNG or WebP Â· Max 5 MB each Â· Up to 6 photos", fr:"JPG, PNG ou WebP Â· Max 5 Mo chacune Â· Jusqu'Ã  6 photos", pidgin:"JPG, PNG or WebP Â· Max 5MB Â· Up to 6 photos", ar:"JPG Ø£Ùˆ PNG Ø£Ùˆ WebP Â· 5 Ù…ÙŠØºØ§ ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰ Â· Ø­ØªÙ‰ 6 ØµÙˆØ±", fulfulde:"JPG, PNG wala WebP Â· 5MB kaaÉ“al Â· Natal 6" },
  photoSecure: { en:"ðŸ“¸ Photos are uploaded securely to Bambeh servers â€” not stored on your phone.", fr:"ðŸ“¸ Les photos sont tÃ©lÃ©chargÃ©es en toute sÃ©curitÃ© sur les serveurs Bambeh â€” non stockÃ©es sur votre tÃ©lÃ©phone.", pidgin:"ðŸ“¸ Photos dey upload secure for Bambeh server â€” no dey save for your phone.", ar:"ðŸ“¸ ÙŠØªÙ… Ø±Ã™ÂØ¹ Ø§Ù„ØµÙˆØ± Ø¨Ø£Ù…Ø§Ù† Ø¥Ù„Ù‰ Ø®ÙˆØ§Ø¯Ù… Bambeh â€” ÙˆÙ„Ø§ ØªÃ™ÂØ®Ø²ÙŽÙ‘Ù† Ø¹Ù„Ù‰ Ù‡Ø§ØªÃ™ÂÙƒ.", fulfulde:"ðŸ“¸ Natal callinaa hukkaande e Bambeh server â€” alaa e telefon maa." },
  tapUpload:   { en:"Tap to upload photos of your produce", fr:"Appuyez pour tÃ©lÃ©charger des photos de votre produit", pidgin:"Tap here to upload photos of your thing", ar:"Ø§Ù†Ù‚Ø± Ù„Ø±Ã™ÂØ¹ ØµÙˆØ± Ù…Ù†ØªØ¬Ùƒ", fulfulde:"Tap hanga callude natal ko'am maa" },
  maxPhotos:   { en:"Maximum 6 photos", fr:"Maximum 6 photos", pidgin:"Max 6 photos", ar:"Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 6 ØµÙˆØ±", fulfulde:"Natal 6 ko kaaÉ“al" },
  listingSummary: { en:"ðŸ“‹ Listing Summary", fr:"ðŸ“‹ RÃ©sumÃ© de l'annonce", pidgin:"ðŸ“‹ Summary of Wetin You Put", ar:"ðŸ“‹ Ù…Ù„Ø®Øµ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†", fulfulde:"ðŸ“‹ Kuwtoro Hollirgol" },
  produceKey:  { en:"Produce",  fr:"Produit",  pidgin:"Wetin",    ar:"Ø§Ù„Ù…Ù†ØªØ¬",  fulfulde:"Ko'o" },
  priceKey:    { en:"Price",    fr:"Prix",     pidgin:"Price",    ar:"Ø§Ù„Ø³Ø¹Ø±",   fulfulde:"Njamndi" },
  stockKey:    { en:"Stock",    fr:"Stock",    pidgin:"Wetin E Remain", ar:"Ø§Ù„Ù…Ø®Ø²ÙˆÙ†", fulfulde:"Ko Tagi" },
  organicKey:  { en:"Organic",  fr:"Bio",      pidgin:"Natural",  ar:"Ø¹Ø¶ÙˆÙŠ",   fulfulde:"Keso" },
  deliveryKey: { en:"Delivery", fr:"Livraison",pidgin:"Delivery", ar:"Ø§Ù„ØªÙˆØµÙŠÙ„",fulfulde:"Addirde" },
  locationKey: { en:"Location", fr:"Lieu",     pidgin:"Wapi",     ar:"Ø§Ù„Ù…ÙˆÙ‚Ø¹", fulfulde:"Toon" },
  photosKey:   { en:"Photos",   fr:"Photos",   pidgin:"Photos",   ar:"Ø§Ù„ØµÙˆØ±",  fulfulde:"Natal" },
  notSpecified:{ en:"Not specified", fr:"Non spÃ©cifiÃ©", pidgin:"No put", ar:"ØºÙŠØ± Ù…Ø­Ø¯Ø¯", fulfulde:"Alaa holliraa" },
  yesOrganic:  { en:"Yes ðŸŒ¿",   fr:"Oui ðŸŒ¿",   pidgin:"Yes ðŸŒ¿",  ar:"Ù†Ø¹Ù… ðŸŒ¿",  fulfulde:"Eey ðŸŒ¿" },
  no:          { en:"No",       fr:"Non",      pidgin:"No",       ar:"Ù„Ø§",      fulfulde:"Alaa" },
  delivAvail:  { en:"Available ðŸšš", fr:"Disponible ðŸšš", pidgin:"E dey ðŸšš", ar:"Ù…ØªØ§Ø­ ðŸšš", fulfulde:"E Waawi ðŸšš" },
  pickupOnly:  { en:"Pickup only", fr:"Retrait uniquement", pidgin:"You go come pick am", ar:"Ø§Ø³ØªÙ„Ø§Ù… Ã™ÂÙ‚Ø·", fulfulde:"Ko Neldi Tan" },
  noPhotosWarn:{ en:"âš  None â€” fewer views without a photo", fr:"âš  Aucune â€” moins de vues sans photo", pidgin:"âš  None â€” people no go see am well", ar:"âš  Ù„Ø§ ÙŠÙˆØ¬Ø¯ â€” Ù…Ø´Ø§Ù‡Ø¯Ø§Øª Ø£Ù‚Ù„ Ø¨Ø¯ÙˆÙ† ØµÙˆØ±Ø©", fulfulde:"âš  Alaa â€” yimÉ“e keewaa yiyde" },
  descPreview: { en:"Description preview", fr:"AperÃ§u de la description", pidgin:"See wetin you write", ar:"Ù…Ø¹Ø§ÙŠÙ†Ø© Ø§Ù„ÙˆØµÃ™Â", fulfulde:"Yiy Haala" },
  minChars:    { en:"Min 20 characters", fr:"Min 20 caractÃ¨res", pidgin:"Min 20 letters", ar:"20 Ø­Ø±Ã™ÂÙ‹Ø§ ÙƒØ­Ø¯ Ø£Ø¯Ù†Ù‰", fulfulde:"AranÉ—e 20 ko É“uri" },
  charCount:   { en:(n:number)=>`${n} chars`, fr:(n:number)=>`${n} car.`, pidgin:(n:number)=>`${n} letters`, ar:(n:number)=>`${n} Ø­Ø±Ã™Â`, fulfulde:(n:number)=>`${n} aranÉ—e` },
  photosTip:   { en:"ðŸ“¸ Photos = more buyers", fr:"ðŸ“¸ Photos = plus d'acheteurs", pidgin:"ðŸ“¸ Photos = More People Go Buy", ar:"ðŸ“¸ Ø§Ù„ØµÙˆØ± = Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„Ù…Ø´ØªØ±ÙŠÙ†", fulfulde:"ðŸ“¸ Natal = SoodinooÉ“e KeewÉ—i" },
  photosTipBody: { en:"Listings with at least one clear photo get 3Ã— more views than listings without. Buyers trust what they can see.", fr:"Les annonces avec au moins une photo claire obtiennent 3Ã— plus de vues. Les acheteurs font confiance Ã  ce qu'ils voient.", pidgin:"Things wey get photo get 3Ã— more views. Buyers dey trust wetin dem see.", ar:"Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„ØªÙŠ ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ØµÙˆØ±Ø© ÙˆØ§Ø¶Ø­Ø© ØªØ­ØµÙ„ Ø¹Ù„Ù‰ 3 Ø£Ø¶Ø¹Ø§Ã™Â Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø§Øª. Ø§Ù„Ù…Ø´ØªØ±ÙˆÙ† ÙŠØ«Ù‚ÙˆÙ† Ø¨Ù…Ø§ ÙŠØ±ÙˆÙ†Ù‡.", fulfulde:"Hollirgol wona natal heÉ“a yii'de 3Ã—. SoodinooÉ“e miimaago ko mbii'a." },
  photosTipSub: { en:"You can still post without a photo â€” your item will appear with a placeholder and a \"No photo\" badge until you add one.", fr:"Vous pouvez toujours publier sans photo â€” votre article apparaÃ®tra avec un badge \"Sans photo\" jusqu'Ã  ce que vous en ajoutiez une.", pidgin:"You fit still post am without photo â€” e go show with \"No photo\" badge till you add one.", ar:"ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ù†Ø´Ø± Ø¨Ø¯ÙˆÙ† ØµÙˆØ±Ø© â€” Ø³ÙŠØ¸Ù‡Ø± Ù…Ù†ØªØ¬Ùƒ Ø¨Ø¨Ø§Ø¯Ø¬ \"Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±Ø©\" Ø­ØªÙ‰ ØªØ¶ÙŠÃ™Â ØµÙˆØ±Ø©.", fulfulde:"A waawi hollude hono natal â€” ko'am maa yii'ata e \"Alaa natal\" hanga a roÅ‹kii." },
  worldwideVis: { en:"ðŸŒ Your listing will be visible worldwide â€” any Bambeh user on any device can find and buy your produce.", fr:"ðŸŒ Votre annonce sera visible dans le monde entier â€” tout utilisateur Bambeh peut trouver et acheter votre produit.", pidgin:"ðŸŒ Your thing go show worldwide â€” any Bambeh person fit see am and buy.", ar:"ðŸŒ Ø³ÙŠÙƒÙˆÙ† Ø¥Ø¹Ù„Ø§Ù†Ùƒ Ù…Ø±Ø¦ÙŠÙ‹Ø§ Ã™ÂÙŠ Ø¬Ù…ÙŠØ¹ Ø£Ù†Ø­Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù„Ù… â€” Ø£ÙŠ Ù…Ø³ØªØ®Ø¯Ù… Bambeh ÙŠÙ…ÙƒÙ†Ù‡ Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„ÙŠÙ‡ ÙˆØ´Ø±Ø§Ø¡Ù‡.", fulfulde:"ðŸŒ Hollirgol maa yii'ataa e aduna fof â€” Bambeh jom fof waawi yiyde e soodude." },
  listWorldwide:{ en:"ðŸš€ List Produce Worldwide", fr:"ðŸš€ Publier dans le monde entier", pidgin:"ðŸš€ Post Am Worldwide", ar:"ðŸš€ Ù†Ø´Ø± Ø§Ù„Ù…Ù†ØªØ¬ Ø¹Ø§Ù„Ù…ÙŠÙ‹Ø§", fulfulde:"ðŸš€ Hollir Ko'o e Aduna Fof" },
  posting:     { en:"Postingâ€¦", fr:"Publicationâ€¦", pidgin:"E dey postâ€¦", ar:"Ø¬Ø§Ø±Ã™Â Ø§Ù„Ù†Ø´Ø±â€¦", fulfulde:"E nani holludeâ€¦" },
  produceListed: { en:"Produce Listed!", fr:"Produit mis en ligne !", pidgin:"Your Thing Don List!", ar:"ØªÙ… Ø¥Ø¯Ø±Ø§Ø¬ Ø§Ù„Ù…Ù†ØªØ¬!", fulfulde:"Ko'oo Hollinaa!" },
  produceListedSub: { en:"Your produce is now live and visible worldwide to all Bambeh users on any device.", fr:"Votre produit est maintenant en ligne et visible dans le monde entier sur tous les appareils.", pidgin:"Your thing don show worldwide â€” all Bambeh people fit see am for any device.", ar:"Ù…Ù†ØªØ¬Ùƒ Ø§Ù„Ø¢Ù† Ù…Ø¨Ø§Ø´Ø± ÙˆÙ…Ø±Ø¦ÙŠ Ø¹Ø§Ù„Ù…ÙŠÙ‹Ø§ Ù„Ø¬Ù…ÙŠØ¹ Ù…Ø³ØªØ®Ø¯Ù…ÙŠ Bambeh Ø¹Ù„Ù‰ Ø£ÙŠ Ø¬Ù‡Ø§Ø².", fulfulde:"Ko'am maa hollinii e aduna fof â€” Bambeh jom fof waawi yiyde e kala binndi." },
  produceListedSub2:{ en:"Buyers can contact you via WhatsApp, call, or place an order directly.", fr:"Les acheteurs peuvent vous contacter par WhatsApp, appel ou passer une commande directement.", pidgin:"Buyers fit reach you for WhatsApp, call, or order direct.", ar:"ÙŠÙ…ÙƒÙ† Ù„Ù„Ù…Ø´ØªØ±ÙŠÙ† Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨ Ø£Ùˆ Ø§Ù„Ø§ØªØµØ§Ù„ Ø£Ùˆ ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨ Ù…Ø¨Ø§Ø´Ø±Ø©.", fulfulde:"SoodinooÉ“e mbaawi noddude ma e WhatsApp, wala sariyaade tigi." },
  viewFarmFresh: { en:"View Farm Fresh", fr:"Voir Ferme FraÃ®che", pidgin:"Check Farm Fresh", ar:"Ø¹Ø±Ø¶ Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø²Ø±Ø§Ø¹Ø©", fulfulde:"Yiy Ley Ladde" },
  listAnother: { en:"List Another Produce", fr:"Lister un autre produit", pidgin:"Put Another Thing", ar:"Ø£Ø¶Ã™Â Ù…Ù†ØªØ¬Ù‹Ø§ Ø¢Ø®Ø±", fulfulde:"Hollir Koo Saka" },
  loginRequired:{ en:"Login Required", fr:"Connexion requise", pidgin:"You Must Login", ar:"ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø·Ù„ÙˆØ¨", fulfulde:"Log In Ko WaÉ—ata" },
  loginRequiredSub:{ en:"To post a listing that is visible to buyers worldwide, you need to be logged in.", fr:"Pour publier une annonce visible dans le monde entier, vous devez Ãªtre connectÃ©.", pidgin:"To post wetin people worldwide go see, you must login.", ar:"Ù„Ù†Ø´Ø± Ø¥Ø¹Ù„Ø§Ù† Ù…Ø±Ø¦ÙŠ Ù„Ù„Ù…Ø´ØªØ±ÙŠÙ† Ã™ÂÙŠ Ø¬Ù…ÙŠØ¹ Ø£Ù†Ø­Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù„Ù…ØŒ ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.", fulfulde:"Hange hollirgol yii'ataa e aduna, a waÉ—ii Log In." },
  loginRequiredSub2:{ en:"Guest posts only save on your phone and no one else can see them.", fr:"Les publications en tant qu'invitÃ© ne sont enregistrÃ©es que sur votre tÃ©lÃ©phone.", pidgin:"Guest post na only your phone go save am, nobody else fit see.", ar:"Ø§Ù„Ù…Ù†Ø´ÙˆØ±Ø§Øª ÙƒØ¶ÙŠÃ™Â ØªÃ™ÂØ­Ã™ÂØ¸ Ø¹Ù„Ù‰ Ù‡Ø§ØªÃ™ÂÙƒ Ã™ÂÙ‚Ø· ÙˆÙ„Ø§ ÙŠØ³ØªØ·ÙŠØ¹ Ø£Ø­Ø¯ Ø±Ø¤ÙŠØªÙ‡Ø§.", fulfulde:"Hollirgol bÃ©li Log In sinndidaa e telefon maa tan." },
  logInSignUp: { en:"Log In / Sign Up", fr:"Se connecter / S'inscrire", pidgin:"Login / Register", ar:"ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ / Ø§Ù„ØªØ³Ø¬ÙŠÙ„", fulfulde:"Log In / Winndir" },
  goBack:      { en:"Go Back", fr:"Retour", pidgin:"Go Back", ar:"Ø§Ù„Ø¹ÙˆØ¯Ø©", fulfulde:"WaÉ—tu" },
  draftSaved:  { en:"Draft saved to your device âœ…", fr:"Brouillon enregistrÃ© sur votre appareil âœ…", pidgin:"Draft don save for your phone âœ…", ar:"ØªÙ… Ø­Ã™ÂØ¸ Ø§Ù„Ù…Ø³ÙˆØ¯Ø© Ø¹Ù„Ù‰ Ø¬Ù‡Ø§Ø²Ùƒ âœ…", fulfulde:"Kuwtorka doornaa e binndi maa âœ…" },
  required:    { en:"required", fr:"obligatoire", pidgin:"must", ar:"Ù…Ø·Ù„ÙˆØ¨", fulfulde:"ko waÉ—ata" },

  // â”€â”€ DirectPayModal (in FarmFreshDetail) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  payWithMoMo:   { en:"Pay with Mobile Money", fr:"Payer par Mobile Money", pidgin:"Pay with MoMo", ar:"Ø§Ø¯Ã™ÂØ¹ Ø¨Ø§Ù„Ù†Ù‚ÙˆØ¯ Ø§Ù„Ù…ØªÙ†Ù‚Ù„Ø©", fulfulde:"Hol e Ceede Telefon" },
  poweredBy:     { en:"Powered by CamPay", fr:"PropulsÃ© par CamPay", pidgin:"Na CamPay dey run am", ar:"Ù…Ø¯Ø¹ÙˆÙ… Ù…Ù† CamPay", fulfulde:"CamPay hollirii" },
  mtnOrOrange:   { en:"MTN or Orange Money number", fr:"NumÃ©ro MTN ou Orange Money", pidgin:"MTN or Orange number", ar:"Ø±Ù‚Ù… MTN Ø£Ùˆ Orange Money", fulfulde:"Nomboro MTN wala Orange" },
  ussdPrompt:    { en:"A USSD prompt will appear on your phone. Enter your PIN to pay.", fr:"Une invite USSD apparaÃ®tra sur votre tÃ©lÃ©phone. Entrez votre PIN pour payer.", pidgin:"USSD go show for your phone. Put your PIN to pay.", ar:"Ø³ØªØ¸Ù‡Ø± Ø±Ø³Ø§Ù„Ø© USSD Ø¹Ù„Ù‰ Ù‡Ø§ØªÃ™ÂÙƒ. Ø£Ø¯Ø®Ù„ Ø±Ù…Ø² PIN Ù„Ù„Ø¯Ã™ÂØ¹.", fulfulde:"USSD yii'ataa e telefon maa. RoÅ‹ku PIN maa hanga holirde." },
  confirmPay:    { en:(n:number)=>`Confirm & Pay ${n.toLocaleString("fr-CM")} XAF`, fr:(n:number)=>`Confirmer & Payer ${n.toLocaleString("fr-CM")} XAF`, pidgin:(n:number)=>`Confirm & Pay ${n.toLocaleString("fr-CM")} XAF`, ar:(n:number)=>`ØªØ£ÙƒÙŠØ¯ ÙˆØ¯Ã™ÂØ¹ ${n.toLocaleString("fr-CM")} XAF`, fulfulde:(n:number)=>`Hollu & Hol ${n.toLocaleString("fr-CM")} XAF` },
  checkPhone:    { en:"Check your phone!", fr:"VÃ©rifiez votre tÃ©lÃ©phone !", pidgin:"Check your phone!", ar:"ØªØ­Ù‚Ù‚ Ù…Ù† Ù‡Ø§ØªÃ™ÂÙƒ!", fulfulde:"Yiy telefon maa!" },
  enterPin:      { en:"A payment request was sent to your number. Enter your PIN to approve.", fr:"Une demande de paiement a Ã©tÃ© envoyÃ©e Ã  votre numÃ©ro. Entrez votre PIN pour approuver.", pidgin:"Payment request don go your number. Put your PIN to approve.", ar:"ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø¯Ã™ÂØ¹ Ø¥Ù„Ù‰ Ø±Ù‚Ù…Ùƒ. Ø£Ø¯Ø®Ù„ Ø±Ù…Ø² PIN Ù„Ù„Ù…ÙˆØ§Ã™ÂÙ‚Ø©.", fulfulde:"Sariya ceede nawnaa e nomboro maa. RoÅ‹ku PIN maa hanga wallitde." },
  sendingRequest:{ en:"Sending payment requestâ€¦", fr:"Envoi de la demande de paiementâ€¦", pidgin:"E dey send payment requestâ€¦", ar:"Ø¬Ø§Ø±Ã™Â Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø¯Ã™ÂØ¹â€¦", fulfulde:"E nawna sariya ceedeâ€¦" },
  payFailed:     { en:"Payment Failed", fr:"Paiement Ã©chouÃ©", pidgin:"Payment No Work", ar:"Ã™ÂØ´Ù„ Ø§Ù„Ø¯Ã™ÂØ¹", fulfulde:"Hol Yawtaay" },
  questions:     { en:"Questions?", fr:"Questions ?", pidgin:"You get question?", ar:"Ø£Ø³Ø¦Ù„Ø©ØŸ", fulfulde:"Humpitaari?" },
  securedEncrypted: { en:"Secured & encrypted via CamPay", fr:"SÃ©curisÃ© & chiffrÃ© via CamPay", pidgin:"CamPay dey protect am well", ar:"Ø¢Ù…Ù† ÙˆÙ…Ø´Ã™ÂÙ‘Ø± Ø¹Ø¨Ø± CamPay", fulfulde:"CamPay holloo am" },
  cancel:        { en:"Cancel", fr:"Annuler", pidgin:"Cancel Am", ar:"Ø¥Ù„ØºØ§Ø¡", fulfulde:"Faggu" },
  paymentConfirmed: { en:"Payment Confirmed! ðŸŽ‰", fr:"Paiement confirmÃ© ! ðŸŽ‰", pidgin:"Payment Don Confirm! ðŸŽ‰", ar:"ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¯Ã™ÂØ¹! ðŸŽ‰", fulfulde:"Ceede Hoolnii! ðŸŽ‰" },
  orderProcessed:   { en:"Your order is being processed.", fr:"Votre commande est en cours de traitement.", pidgin:"Dem dey process your order.", ar:"Ø¬Ø§Ø±Ã™Â Ù…Ø¹Ø§Ù„Ø¬Ø© Ø·Ù„Ø¨Ùƒ.", fulfulde:"Sariya am jokki." },
  waiting:          { en:(m:number,s:number)=>`Waitingâ€¦ ${m}:${String(s).padStart(2,"0")}`, fr:(m:number,s:number)=>`Attenteâ€¦ ${m}:${String(s).padStart(2,"0")}`, pidgin:(m:number,s:number)=>`E dey waitâ€¦ ${m}:${String(s).padStart(2,"0")}`, ar:(m:number,s:number)=>`Ø¬Ø§Ø±Ã™Â Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±â€¦ ${m}:${String(s).padStart(2,"0")}`, fulfulde:(m:number,s:number)=>`E É—aÉ“É“iâ€¦ ${m}:${String(s).padStart(2,"0")}` },
  processing:    { en:"Processingâ€¦", fr:"Traitementâ€¦", pidgin:"E dey processâ€¦", ar:"Ù…Ø¹Ø§Ù„Ø¬Ø©â€¦", fulfulde:"E sariyaadeâ€¦" },
} as const;

/** Grab the right string for the current language. */
export function t<K extends keyof typeof T>(
  key: K,
  lang: Lang,
): (typeof T)[K][Lang] {
  return (T[key][lang] ?? T[key]["en"]) as (typeof T)[K][Lang];
}

