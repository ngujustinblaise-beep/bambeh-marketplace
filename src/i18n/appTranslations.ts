/**
 * src/i18n/appTranslations.ts â€” Bambeh Marketplace
 * Â© 2026 BAMBEH SARL. All rights reserved.
 *
 * MASTER translation dictionary for the entire app.
 * Languages: English (en) Â· French (fr) Â· Cameroonian Pidgin (pcm)
 *            Arabic (ar) Â· Fulfulde (ff)
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helper type: every key maps to a record of the 5 languages.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type TranslationMap = Record<string, Record<AppLang, string | ((...args: any[]) => string)>>;

export const T: TranslationMap = {

  // â”€â”€ COMMON / GLOBAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  back:             { en: "Back", fr: "Retour", pcm: "Go back", ar: "Ø±Ø¬ÙˆØ¹", ff: "Artii" },
  save:             { en: "Save", fr: "Enregistrer", pcm: "Save am", ar: "Ø­ÙØ¸", ff: "Tofno" },
  cancel:           { en: "Cancel", fr: "Annuler", pcm: "No do am", ar: "Ø¥Ù„ØºØ§Ø¡", ff: "HaÉ—tude" },
  confirm:          { en: "Confirm", fr: "Confirmer", pcm: "Confirm am", ar: "ØªØ£ÙƒÙŠØ¯", ff: "JaÉ“É“aade" },
  submit:           { en: "Submit", fr: "Soumettre", pcm: "Send am", ar: "Ø¥Ø±Ø³Ø§Ù„", ff: "Neldude" },
  close:            { en: "Close", fr: "Fermer", pcm: "Close am", ar: "Ø¥ØºÙ„Ø§Ù‚", ff: "Udde" },
  loading:          { en: "Loadingâ€¦", fr: "Chargementâ€¦", pcm: "E dey loadâ€¦", ar: "Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„â€¦", ff: "E heÉ“iiâ€¦" },
  error:            { en: "Something went wrong", fr: "Une erreur est survenue", pcm: "Something go wrong", ar: "Ø­Ø¯Ø« Ø®Ø·Ø£ Ù…Ø§", ff: "Huunde wariima fenaande" },
  retry:            { en: "Try again", fr: "RÃ©essayer", pcm: "Try again", ar: "Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ù‹Ø§", ff: "Taftinoo" },
  search:           { en: "Search", fr: "Rechercher", pcm: "Search", ar: "Ø¨Ø­Ø«", ff: "Yiylaade" },
  filter:           { en: "Filter", fr: "Filtrer", pcm: "Filter", ar: "ØªØµÙÙŠØ©", ff: "SuÉ“ande" },
  sort:             { en: "Sort", fr: "Trier", pcm: "Sort am", ar: "ØªØ±ØªÙŠØ¨", ff: "JuÉ“É“inaade" },
  all:              { en: "All", fr: "Tout", pcm: "All", ar: "Ø§Ù„ÙƒÙ„", ff: "Fof" },
  noResults:        { en: "No results found", fr: "Aucun rÃ©sultat trouvÃ©", pcm: "Nothing dey here", ar: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬", ff: "Walaa huunde e yiytaade" },
  seeAll:           { en: "See all", fr: "Voir tout", pcm: "See all", ar: "Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„", ff: "Yiy fof" },
  viewDetails:      { en: "View details", fr: "Voir les dÃ©tails", pcm: "See details", ar: "Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§ØµÙŠÙ„", ff: "Yiy kaaÉ—e" },
  share:            { en: "Share", fr: "Partager", pcm: "Share am", ar: "Ù…Ø´Ø§Ø±ÙƒØ©", ff: "Wadande" },
  report:           { en: "Report", fr: "Signaler", pcm: "Report am", ar: "Ø¥Ø¨Ù„Ø§Øº", ff: "Haalde" },
  favorite:         { en: "Save to favourites", fr: "Ajouter aux favoris", pcm: "Save for favourites", ar: "Ø­ÙØ¸ ÙÙŠ Ø§Ù„Ù…ÙØ¶Ù„Ø©", ff: "Tofno e heewÉ“e" },
  unfavorite:       { en: "Remove from favourites", fr: "Retirer des favoris", pcm: "Remove from favourites", ar: "Ø¥Ø²Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ù…ÙØ¶Ù„Ø©", ff: "Yottinde e heewÉ“e" },
  linkCopied:       { en: "Link copied!", fr: "Lien copiÃ©!", pcm: "Link don copy!", ar: "ØªÙ… Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø·!", ff: "Naawdi nawnaa!" },
  copied:           { en: "Copied!", fr: "CopiÃ©!", pcm: "E don copy!", ar: "ØªÙ… Ø§Ù„Ù†Ø³Ø®!", ff: "Nawnaa!" },
  yes:              { en: "Yes", fr: "Oui", pcm: "Yes", ar: "Ù†Ø¹Ù…", ff: "Eey" },
  no:               { en: "No", fr: "Non", pcm: "No", ar: "Ù„Ø§", ff: "Alaa" },
  or:               { en: "or", fr: "ou", pcm: "or", ar: "Ø£Ùˆ", ff: "walla" },
  and:              { en: "and", fr: "et", pcm: "and", ar: "Ùˆ", ff: "e" },
  of:               { en: "of", fr: "de", pcm: "of", ar: "Ù…Ù†", ff: "e" },
  by:               { en: "by", fr: "par", pcm: "by", ar: "Ø¨ÙˆØ§Ø³Ø·Ø©", ff: "e" },
  free:             { en: "Free", fr: "Gratuit", pcm: "Free", ar: "Ù…Ø¬Ø§Ù†ÙŠ", ff: "YoÉ“etaake" },
  new:              { en: "New", fr: "Nouveau", pcm: "New", ar: "Ø¬Ø¯ÙŠØ¯", ff: "Kesel" },
  comingSoon:       { en: "Coming soon", fr: "BientÃ´t disponible", pcm: "E go dey soon", ar: "Ù‚Ø±ÙŠØ¨Ù‹Ø§", ff: "Arta dey" },
  optional:         { en: "Optional", fr: "Optionnel", pcm: "Optional", ar: "Ø§Ø®ØªÙŠØ§Ø±ÙŠ", ff: "Ko feewi" },
  required:         { en: "Required", fr: "Obligatoire", pcm: "Required", ar: "Ù…Ø·Ù„ÙˆØ¨", ff: "Ko waÉ—i" },
  selectOne:        { en: "Select one", fr: "SÃ©lectionner", pcm: "Pick one", ar: "Ø§Ø®ØªØ± ÙˆØ§Ø­Ø¯Ù‹Ø§", ff: "SuÉ“o gooto" },
  total:            { en: "Total", fr: "Total", pcm: "Total", ar: "Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹", ff: "Fof" },
  price:            { en: "Price", fr: "Prix", pcm: "Price", ar: "Ø§Ù„Ø³Ø¹Ø±", ff: "Njamndi" },
  location:         { en: "Location", fr: "Localisation", pcm: "Location", ar: "Ø§Ù„Ù…ÙˆÙ‚Ø¹", ff: "JaÉ“irde" },
  posted:           { en: "Posted", fr: "PubliÃ©", pcm: "E post", ar: "Ù†ÙØ´Ø±", ff: "Neldaa" },
  updated:          { en: "Updated", fr: "Mis Ã  jour", pcm: "Updated", ar: "Ù…Ø­Ø¯ÙŽÙ‘Ø«", ff: "Fotnodaa" },
  views:            { en: "views", fr: "vues", pcm: "views", ar: "Ù…Ø´Ø§Ù‡Ø¯Ø§Øª", ff: "yiytaama" },
  active:           { en: "Active", fr: "Actif", pcm: "Active", ar: "Ù†Ø´Ø·", ff: "GollorÉ—o" },
  expired:          { en: "Expired", fr: "ExpirÃ©", pcm: "Expired", ar: "Ù…Ù†ØªÙ‡ÙŠ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ©", ff: "Tiimaa" },
  pending:          { en: "Pending", fr: "En attente", pcm: "Dey wait", ar: "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±", ff: "E yaaÉ—aa" },
  approved:         { en: "Approved", fr: "ApprouvÃ©", pcm: "Dem approve am", ar: "Ù…ÙˆØ§ÙÙ‚ Ø¹Ù„ÙŠÙ‡", ff: "JaÉ“aa" },
  rejected:         { en: "Rejected", fr: "RejetÃ©", pcm: "Dem reject am", ar: "Ù…Ø±ÙÙˆØ¶", ff: "HaÉ—aa" },
  noItemsYet:       { en: "No items yet", fr: "Aucun article pour l'instant", pcm: "Nothing dey here yet", ar: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ù†Ø§ØµØ± Ø¨Ø¹Ø¯", ff: "Walaa fof saa'i hannde" },
  loginRequired:    { en: "Please log in to continue", fr: "Veuillez vous connecter pour continuer", pcm: "Log in first make you continue", ar: "ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„Ù…ØªØ§Ø¨Ø¹Ø©", ff: "Naado tafto soo waÉ—aa" },
  pageNotFound:     { en: "Page not found", fr: "Page introuvable", pcm: "Dis page no dey", ar: "Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©", ff: "Papiye yiytaaka" },
  goHome:           { en: "Go to Home", fr: "Retour Ã  l'accueil", pcm: "Go home", ar: "Ø§Ù„Ø°Ù‡Ø§Ø¨ Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©", ff: "Yahoo galle" },

  // â”€â”€ NAVIGATION / HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  home:             { en: "Home", fr: "Accueil", pcm: "Home", ar: "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©", ff: "Galle" },
  menu:             { en: "Menu", fr: "Menu", pcm: "Menu", ar: "Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©", ff: "Listu" },
  notifications:    { en: "Notifications", fr: "Notifications", pcm: "Notification", ar: "Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª", ff: "KaaÉ—e" },
  messages:         { en: "Messages", fr: "Messages", pcm: "Messages", ar: "Ø§Ù„Ø±Ø³Ø§Ø¦Ù„", ff: "Tiitoonde" },
  profile:          { en: "Profile", fr: "Profil", pcm: "Profile", ar: "Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ", ff: "Gamgal" },
  settings:         { en: "Settings", fr: "ParamÃ¨tres", pcm: "Settings", ar: "Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª", ff: "ToÉ“É“e" },
  logout:           { en: "Log out", fr: "DÃ©connexion", pcm: "Logout", ar: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬", ff: "Wurtude" },
  login:            { en: "Log in", fr: "Connexion", pcm: "Login", ar: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„", ff: "Naanaade" },
  register:         { en: "Register", fr: "S'inscrire", pcm: "Register", ar: "Ø§Ù„ØªØ³Ø¬ÙŠÙ„", ff: "ÆŠaÉ“É“ude" },
  postAd:           { en: "Post an Ad", fr: "Publier une annonce", pcm: "Post Ad", ar: "Ù†Ø´Ø± Ø¥Ø¹Ù„Ø§Ù†", ff: "Neld Gannde" },
  cart:             { en: "Cart", fr: "Panier", pcm: "Cart", ar: "Ø¹Ø±Ø¨Ø© Ø§Ù„ØªØ³ÙˆÙ‚", ff: "Paani" },
  cartEmpty:        { en: "Your cart is empty", fr: "Votre panier est vide", pcm: "Your cart empty", ar: "Ø³Ù„Ø© Ø§Ù„ØªØ³ÙˆÙ‚ ÙØ§Ø±ØºØ©", ff: "Paani maa booÆ´ii" },

  // â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  footerTagline:    { en: "Cameroon's trusted marketplace", fr: "La place de marchÃ© de confiance du Cameroun", pcm: "Cameroon trusted market", ar: "Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ù…ÙˆØ«ÙˆÙ‚ ÙÙŠ Ø§Ù„ÙƒØ§Ù…ÙŠØ±ÙˆÙ†", ff: "Suudu njiydi Kameruun" },
  footerAbout:      { en: "About Bambeh", fr: "Ã€ propos de Bambeh", pcm: "About Bambeh", ar: "Ø¹Ù† Ø¨Ø§Ù…Ø¨ÙŠÙ‡", ff: "E dow Bambeh" },
  footerHelp:       { en: "Help Center", fr: "Centre d'aide", pcm: "Help Center", ar: "Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©", ff: "LaaÉ“al Ballal" },
  footerTerms:      { en: "Terms & Conditions", fr: "Conditions GÃ©nÃ©rales", pcm: "Terms & Conditions", ar: "Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…", ff: "SarÉ—iiji" },
  footerPrivacy:    { en: "Privacy Policy", fr: "Politique de confidentialitÃ©", pcm: "Privacy Policy", ar: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©", ff: "SarÉ—i Gaasooji" },
  footerContact:    { en: "Contact Support", fr: "Contacter le support", pcm: "Contact Support", ar: "ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¯Ø¹Ù…", ff: "Æanndital Ballal" },
  footerSafety:     { en: "Safety & Security", fr: "SÃ©curitÃ©", pcm: "Safety & Security", ar: "Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ø³Ù„Ø§Ù…Ø©", ff: "Kisinaare" },
  footerRights:     { en: "All rights reserved.", fr: "Tous droits rÃ©servÃ©s.", pcm: "All rights reserved.", ar: "Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©.", ff: "Hakke fof kuuÉ—i." },
  footerDownload:   { en: "Download the app", fr: "TÃ©lÃ©charger l'application", pcm: "Download the app", ar: "ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚", ff: "Wurno app É—oo" },
  footerLanguage:   { en: "Language", fr: "Langue", pcm: "Language", ar: "Ø§Ù„Ù„ØºØ©", ff: "Demngal" },
  footerSocial:     { en: "Follow us", fr: "Suivez-nous", pcm: "Follow us", ar: "ØªØ§Ø¨Ø¹Ù†Ø§", ff: "Tullude min" },
  footerCategory:   { en: "Categories", fr: "CatÃ©gories", pcm: "Categories", ar: "Ø§Ù„ÙØ¦Ø§Øª", ff: "Teelte" },

  // â”€â”€ MAIN LAYOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  explore:          { en: "Explore", fr: "Explorer", pcm: "Explore", ar: "Ø§Ø³ØªÙƒØ´Ø§Ù", ff: "Gite" },
  categories:       { en: "Categories", fr: "CatÃ©gories", pcm: "Categories", ar: "Ø§Ù„ÙØ¦Ø§Øª", ff: "Teelte" },
  featured:         { en: "Featured", fr: "Ã€ la une", pcm: "Featured", ar: "Ù…Ù…ÙŠØ²", ff: "TiiÉ—ngal" },
  trending:         { en: "Trending", fr: "Tendances", pcm: "Trending", ar: "Ø±Ø§Ø¦Ø¬", ff: "Reedu" },
  nearby:           { en: "Nearby", fr: "Ã€ proximitÃ©", pcm: "Near me", ar: "Ø¨Ø§Ù„Ù‚Ø±Ø¨ Ù…Ù†ÙŠ", ff: "Ko dow maa" },
  recentlyViewed:   { en: "Recently viewed", fr: "RÃ©cemment consultÃ©s", pcm: "You don see before", ar: "Ø´ÙˆÙ‡Ø¯ Ù…Ø¤Ø®Ø±Ù‹Ø§", ff: "Yiytaama jooni" },
  recommended:      { en: "Recommended for you", fr: "RecommandÃ© pour vous", pcm: "We pick am for you", ar: "Ù…ÙˆØµÙ‰ Ø¨Ù‡ Ù„Ùƒ", ff: "Ko tiiÉ—naa maa" },

  // â”€â”€ MARKETPLACE PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  marketplace:      { en: "Marketplace", fr: "Marketplace", pcm: "Market", ar: "Ø§Ù„Ø³ÙˆÙ‚", ff: "Suudu Njiydi" },
  marketplaceDesc:  { en: "Buy and sell new & used items", fr: "Achetez et vendez des articles neufs ou d'occasion", pcm: "Buy and sell your things", ar: "Ø¨ÙŠØ¹ ÙˆØ´Ø±Ø§Ø¡ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© ÙˆØ§Ù„Ù…Ø³ØªØ¹Ù…Ù„Ø©", ff: "Soodde e yoÉ“de huunde" },
  sellItem:         { en: "Sell an item", fr: "Vendre un article", pcm: "Sell something", ar: "Ø¨ÙŠØ¹ Ø¹Ù†ØµØ±", ff: "YoÉ“du huunde" },
  condition:        { en: "Condition", fr: "Ã‰tat", pcm: "Condition", ar: "Ø§Ù„Ø­Ø§Ù„Ø©", ff: "Himo" },
  conditionNew:     { en: "Brand new", fr: "Neuf", pcm: "Brand new", ar: "Ø¬Ø¯ÙŠØ¯ ØªÙ…Ø§Ù…Ù‹Ø§", ff: "Kesel kesel" },
  conditionUsed:    { en: "Used", fr: "Occasion", pcm: "Used", ar: "Ù…Ø³ØªØ¹Ù…Ù„", ff: "Jokki" },
  brand:            { en: "Brand", fr: "Marque", pcm: "Brand", ar: "Ø§Ù„Ø¹Ù„Ø§Ù…Ø© Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©", ff: "Marke" },
  category:         { en: "Category", fr: "CatÃ©gorie", pcm: "Category", ar: "Ø§Ù„ÙØ¦Ø©", ff: "Teele" },
  description:      { en: "Description", fr: "Description", pcm: "Description", ar: "Ø§Ù„ÙˆØµÙ", ff: "Firo" },
  photos:           { en: "Photos", fr: "Photos", pcm: "Pictures", ar: "Ø§Ù„ØµÙˆØ±", ff: "Foto" },
  addPhoto:         { en: "Add photo", fr: "Ajouter une photo", pcm: "Add picture", ar: "Ø¥Ø¶Ø§ÙØ© ØµÙˆØ±Ø©", ff: "Fodo foto" },
  negotiable:       { en: "Price is negotiable", fr: "Prix nÃ©gociable", pcm: "Price fit change", ar: "Ø§Ù„Ø³Ø¹Ø± Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªÙØ§ÙˆØ¶", ff: "Njamndi hulÉ“inee" },
  contactSeller:    { en: "Contact Seller", fr: "Contacter le vendeur", pcm: "Talk to seller", ar: "Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¨Ø§Ø¦Ø¹", ff: "Æan yiÉ—do yoÉ“de" },
  makeOffer:        { en: "Make an offer", fr: "Faire une offre", pcm: "Make offer", ar: "ØªÙ‚Ø¯ÙŠÙ… Ø¹Ø±Ø¶", ff: "Wallirde" },
  itemSold:         { en: "Mark as sold", fr: "Marquer comme vendu", pcm: "Mark as sold", ar: "ØªØ¹ÙŠÙŠÙ† ÙƒÙ…Ø¨Ø§Ø¹", ff: "Hollito yoÉ“daa" },

  // â”€â”€ JOBS PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  jobs:             { en: "Jobs", fr: "Emplois", pcm: "Jobs", ar: "Ø§Ù„ÙˆØ¸Ø§Ø¦Ù", ff: "Golle" },
  jobsDesc:         { en: "Find your next opportunity", fr: "Trouvez votre prochaine opportunitÃ©", pcm: "Find work here", ar: "Ø§Ø¨Ø­Ø« Ø¹Ù† ÙØ±ØµØªÙƒ Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©", ff: "Yiy golle maa" },
  postJob:          { en: "Post a job", fr: "Publier un emploi", pcm: "Post job", ar: "Ù†Ø´Ø± ÙˆØ¸ÙŠÙØ©", ff: "Neldu Golle" },
  applyNow:         { en: "Apply now", fr: "Postuler maintenant", pcm: "Apply now", ar: "ØªÙ‚Ø¯ÙŽÙ‘Ù… Ø§Ù„Ø¢Ù†", ff: "ÆŠaÉ“É“o hannde" },
  jobType:          { en: "Job type", fr: "Type d'emploi", pcm: "Type of work", ar: "Ù†ÙˆØ¹ Ø§Ù„ÙˆØ¸ÙŠÙØ©", ff: "Mun'de golle" },
  fullTime:         { en: "Full-time", fr: "Plein temps", pcm: "Full time", ar: "Ø¯ÙˆØ§Ù… ÙƒØ§Ù…Ù„", ff: "Fof sahaa" },
  partTime:         { en: "Part-time", fr: "Temps partiel", pcm: "Part time", ar: "Ø¯ÙˆØ§Ù… Ø¬Ø²Ø¦ÙŠ", ff: "Sahaa laabi" },
  remote:           { en: "Remote", fr: "TÃ©lÃ©travail", pcm: "Remote", ar: "Ø¹Ù† Ø¨ÙØ¹Ø¯", ff: "E suudu" },
  contract:         { en: "Contract", fr: "Contrat", pcm: "Contract", ar: "Ø¹Ù‚Ø¯", ff: "WaaÉ“irde" },
  internship:       { en: "Internship", fr: "Stage", pcm: "Internship", ar: "ØªØ¯Ø±ÙŠØ¨", ff: "Janngo golle" },
  salary:           { en: "Salary", fr: "Salaire", pcm: "Salary", ar: "Ø§Ù„Ø±Ø§ØªØ¨", ff: "Tiinde" },
  experience:       { en: "Experience", fr: "ExpÃ©rience", pcm: "Experience", ar: "Ø§Ù„Ø®Ø¨Ø±Ø©", ff: "Janngal" },
  qualification:    { en: "Qualifications", fr: "Qualifications", pcm: "Qualifications", ar: "Ø§Ù„Ù…Ø¤Ù‡Ù„Ø§Øª", ff: "Ndee-ndee" },
  deadline:         { en: "Application deadline", fr: "Date limite de candidature", pcm: "Deadline", ar: "Ø§Ù„Ù…ÙˆØ¹Ø¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ù„Ù„ØªÙ‚Ø¯ÙŠÙ…", ff: "Æennde" },
  jobsFound:        { en: (n: number) => `${n} job${n === 1 ? "" : "s"} found`, fr: (n: number) => `${n} offre${n === 1 ? "" : "s"} trouvÃ©e${n === 1 ? "" : "s"}`, pcm: (n: number) => `${n} job${n === 1 ? "" : "s"} dey`, ar: (n: number) => `ØªÙ… Ø¥ÙŠØ¬Ø§Ø¯ ${n} ÙˆØ¸ÙŠÙØ©`, ff: (n: number) => `${n} golle yiytaa` },

  // â”€â”€ SERVICES PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  services:         { en: "Services", fr: "Services", pcm: "Services", ar: "Ø§Ù„Ø®Ø¯Ù…Ø§Øª", ff: "TiiÉ—e" },
  servicesDesc:     { en: "Hire skilled professionals near you", fr: "Engagez des professionnels qualifiÃ©s prÃ¨s de vous", pcm: "Find skilled people near you", ar: "ÙˆØ¸Ù‘Ù Ù…Ø­ØªØ±ÙÙŠÙ† Ù…Ø§Ù‡Ø±ÙŠÙ† Ø¨Ø§Ù„Ù‚Ø±Ø¨ Ù…Ù†Ùƒ", ff: "Yiy tiiÉ—uÉ“e dow maa" },
  offerService:     { en: "Offer a service", fr: "Proposer un service", pcm: "Post your service", ar: "ØªÙ‚Ø¯ÙŠÙ… Ø®Ø¯Ù…Ø©", ff: "Fod tiiÉ—e maa" },
  bookNow:          { en: "Book now", fr: "RÃ©server maintenant", pcm: "Book am now", ar: "Ø§Ø­Ø¬Ø² Ø§Ù„Ø¢Ù†", ff: "Sooddo hannde" },
  serviceType:      { en: "Service type", fr: "Type de service", pcm: "Type of service", ar: "Ù†ÙˆØ¹ Ø§Ù„Ø®Ø¯Ù…Ø©", ff: "Mun'de tiiÉ—e" },
  availability:     { en: "Availability", fr: "DisponibilitÃ©", pcm: "When dem dey", ar: "Ø§Ù„ØªÙˆÙØ±", ff: "Himo waawi" },
  rate:             { en: "Rate", fr: "Tarif", pcm: "Rate", ar: "Ø§Ù„Ø³Ø¹Ø±", ff: "Njamndi" },
  perHour:          { en: "per hour", fr: "par heure", pcm: "per hour", ar: "ÙÙŠ Ø§Ù„Ø³Ø§Ø¹Ø©", ff: "to saate" },
  perDay:           { en: "per day", fr: "par jour", pcm: "per day", ar: "ÙÙŠ Ø§Ù„ÙŠÙˆÙ…", ff: "to Ã±alorma" },
  perJob:           { en: "per job", fr: "par prestation", pcm: "per job", ar: "Ù„Ù„Ø®Ø¯Ù…Ø© Ø§Ù„ÙƒØ§Ù…Ù„Ø©", ff: "to tiiÉ—e" },
  bookingRequest:   { en: "Booking request sent", fr: "Demande de rÃ©servation envoyÃ©e", pcm: "Booking request don go", ar: "ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø¬Ø²", ff: "ÆŠaÉ“É“udi sooddi neldaa" },
  providerProfile:  { en: "Provider profile", fr: "Profil du prestataire", pcm: "Provider profile", ar: "Ù…Ù„Ù Ù…Ù‚Ø¯Ù… Ø§Ù„Ø®Ø¯Ù…Ø©", ff: "Gamgal boodiiÉ—o" },

  // â”€â”€ RENTALS PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  rentals:          { en: "Rentals", fr: "Locations", pcm: "Rentals", ar: "Ø§Ù„Ø¥ÙŠØ¬Ø§Ø±Ø§Øª", ff: "NjooÉ—am" },
  rentalsDesc:      { en: "Apartments, rooms & houses for rent", fr: "Appartements, chambres et maisons Ã  louer", pcm: "Rent house, room or flat", ar: "Ø´Ù‚Ù‚ ÙˆØºØ±Ù ÙˆÙ…Ù†Ø§Ø²Ù„ Ù„Ù„Ø¥ÙŠØ¬Ø§Ø±", ff: "NjooÉ—am suudu e É—o woni" },
  listProperty:     { en: "List your property", fr: "Publier votre bien", pcm: "Post your property", ar: "Ø£Ø¹Ù„Ù† Ø¹Ù† Ø¹Ù‚Ø§Ø±Ùƒ", ff: "Neldu suudu maa" },
  propertyType:     { en: "Property type", fr: "Type de bien", pcm: "Type of place", ar: "Ù†ÙˆØ¹ Ø§Ù„Ø¹Ù‚Ø§Ø±", ff: "Mun'de suudu" },
  bedrooms:         { en: "Bedrooms", fr: "Chambres", pcm: "Rooms", ar: "ØºØ±Ù Ø§Ù„Ù†ÙˆÙ…", ff: "Suudu Å‹oÉ“É—i" },
  bathrooms:        { en: "Bathrooms", fr: "Salles de bain", pcm: "Bathrooms", ar: "Ø§Ù„Ø­Ù…Ø§Ù…Ø§Øª", ff: "Suudu jiimde" },
  furnished:        { en: "Furnished", fr: "MeublÃ©", pcm: "Furnished", ar: "Ù…ÙØ±ÙˆØ´", ff: "KaaÉ—taa" },
  unfurnished:      { en: "Unfurnished", fr: "Non meublÃ©", pcm: "Not furnished", ar: "ØºÙŠØ± Ù…ÙØ±ÙˆØ´", ff: "KaaÉ—taaka" },
  perMonth:         { en: "per month", fr: "par mois", pcm: "per month", ar: "Ø´Ù‡Ø±ÙŠÙ‹Ø§", ff: "to lewru" },
  perYear:          { en: "per year", fr: "par an", pcm: "per year", ar: "Ø³Ù†ÙˆÙŠÙ‹Ø§", ff: "to hitaande" },
  deposit:          { en: "Deposit", fr: "DÃ©pÃ´t de garantie", pcm: "Deposit", ar: "ÙˆØ¯ÙŠØ¹Ø©", ff: "Sooddi" },
  contactOwner:     { en: "Contact Owner", fr: "Contacter le propriÃ©taire", pcm: "Talk to owner", ar: "Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ù…Ø§Ù„Ùƒ", ff: "Æan boÉ—eejo" },
  bookVisit:        { en: "Book a visit", fr: "Planifier une visite", pcm: "Book visit", ar: "Ø­Ø¬Ø² Ø²ÙŠØ§Ø±Ø©", ff: "Sooddo doolo" },
  included:         { en: "What's included", fr: "Ce qui est inclus", pcm: "Wetin dey inside", ar: "Ù…Ø§ Ù‡Ùˆ Ù…Ø´Ù…ÙˆÙ„", ff: "Ko tagi" },
  subscribe:        { en: "Subscribe now", fr: "S'abonner maintenant", pcm: "Subscribe now", ar: "Ø§Ø´ØªØ±Ùƒ Ø§Ù„Ø¢Ù†", ff: "Sooddo hannde" },
  cancelSub:        { en: "Cancel subscription", fr: "Annuler l'abonnement", pcm: "Cancel subscription", ar: "Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ", ff: "HaÉ—t sooddi" },
  renewsOn:         { en: "Renews on", fr: "Renouvellement le", pcm: "E go renew on", ar: "ÙŠØªØ¬Ø¯Ø¯ ÙÙŠ", ff: "E toÉ“É“oo e" },
  subExpired:       { en: "Your subscription has expired", fr: "Votre abonnement a expirÃ©", pcm: "Your subscription don expire", ar: "Ø§Ù†ØªÙ‡Øª ØµÙ„Ø§Ø­ÙŠØ© Ø§Ø´ØªØ±Ø§ÙƒÙƒ", ff: "Sooddi maa tiimii" },

  // â”€â”€ SUPPORT BAMBEH PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  supportBambeh:    { en: "Support Bambeh", fr: "Soutenir Bambeh", pcm: "Support Bambeh", ar: "Ø¯Ø¹Ù… Ø¨Ø§Ù…Ø¨ÙŠÙ‡", ff: "Ballal Bambeh" },
  supportBambehDesc:{ en: "Help us grow and keep the platform free", fr: "Aidez-nous Ã  grandir et garder la plateforme gratuite", pcm: "Help us grow and keep it free", ar: "Ø³Ø§Ø¹Ø¯Ù†Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ù†Ù…Ùˆ ÙˆØ§Ù„Ø¥Ø¨Ù‚Ø§Ø¡ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØµØ© Ù…Ø¬Ø§Ù†ÙŠØ©", ff: "Ballam, hukk Bambeh teri" },
  donate:           { en: "Donate", fr: "Faire un don", pcm: "Donate", ar: "ØªØ¨Ø±Ø¹", ff: "Rokku" },
  donateAmount:     { en: "Choose amount", fr: "Choisir le montant", pcm: "Choose how much", ar: "Ø§Ø®ØªØ± Ø§Ù„Ù…Ø¨Ù„Øº", ff: "SuÉ“o nde" },
  oneTimeDonation:  { en: "One-time donation", fr: "Don unique", pcm: "One time donation", ar: "ØªØ¨Ø±Ø¹ Ù„Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©", ff: "RokkuÉ—e kootuko" },
  monthlySupport:   { en: "Monthly support", fr: "Soutien mensuel", pcm: "Monthly support", ar: "Ø¯Ø¹Ù… Ø´Ù‡Ø±ÙŠ", ff: "Ballal e lewru" },
  thankYouSupport:  { en: "Thank you for supporting Bambeh!", fr: "Merci de soutenir Bambeh!", pcm: "Thank you for your support!", ar: "Ø´ÙƒØ±Ù‹Ø§ Ù„Ø¯Ø¹Ù…Ùƒ Ø¨Ø§Ù…Ø¨ÙŠÙ‡!", ff: "A jaraama ballal maa!" },
  referFriend:      { en: "Refer a friend", fr: "Parrainer un ami", pcm: "Refer your friend", ar: "Ù‚Ø¯Ù‘Ù… ØµØ¯ÙŠÙ‚Ù‹Ø§", ff: "Æenno yiÉ—É—o" },
  referralBonus:    { en: "Earn coins for each referral", fr: "Gagnez des piÃ¨ces pour chaque parrainage", pcm: "Earn coins when you refer", ar: "Ø§ÙƒØ³Ø¨ Ø¹Ù…Ù„Ø§Øª Ù…Ù‚Ø§Ø¨Ù„ ÙƒÙ„ ØªØ±Ø´ÙŠØ­", ff: "Hoot ceede to É“ennugol" },

  // â”€â”€ ABOUT US PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  about:            { en: "About Us", fr: "Ã€ propos", pcm: "About Us", ar: "Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¹Ù†Ø§", ff: "E dow min" },
  aboutDesc:        { en: "Learn more about BAMBEH SARL", fr: "En savoir plus sur BAMBEH SARL", pcm: "Learn about Bambeh", ar: "ØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø²ÙŠØ¯ Ø­ÙˆÙ„ Ø¨Ø§Ù…Ø¨ÙŠÙ‡ SARL", ff: "Janno e BAMBEH SARL" },
  ourMission:       { en: "Our Mission", fr: "Notre Mission", pcm: "Our Mission", ar: "Ù…Ù‡Ù…ØªÙ†Ø§", ff: "Miijol memen" },
  ourVision:        { en: "Our Vision", fr: "Notre Vision", pcm: "Our Vision", ar: "Ø±Ø¤ÙŠØªÙ†Ø§", ff: "Anniya memen" },
  ourTeam:          { en: "Our Team", fr: "Notre Ã‰quipe", pcm: "Our Team", ar: "ÙØ±ÙŠÙ‚Ù†Ø§", ff: "Koodi memen" },
  ourStory:         { en: "Our Story", fr: "Notre Histoire", pcm: "Our Story", ar: "Ù‚ØµØªÙ†Ø§", ff: "Haala memen" },
  foundedIn:        { en: "Founded in Cameroon", fr: "FondÃ© au Cameroun", pcm: "Founded for Cameroon", ar: "ØªØ£Ø³Ø³Øª ÙÙŠ Ø§Ù„ÙƒØ§Ù…ÙŠØ±ÙˆÙ†", ff: "FuÉ—daa e Kameruun" },
  contactUs:        { en: "Contact us", fr: "Nous contacter", pcm: "Contact us", ar: "ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§", ff: "Æan min" },
  followUs:         { en: "Follow us", fr: "Suivez-nous", pcm: "Follow us", ar: "ØªØ§Ø¨Ø¹Ù†Ø§", ff: "Tullude min" },

  // â”€â”€ VIEW COMPANY PROFILE PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  companyProfile:   { en: "Company Profile", fr: "Profil de l'Entreprise", pcm: "Company Profile", ar: "Ù…Ù„Ù Ø§Ù„Ø´Ø±ÙƒØ©", ff: "Gamgal Sosirde" },
  companyName:      { en: "Company name", fr: "Nom de l'entreprise", pcm: "Company name", ar: "Ø§Ø³Ù… Ø§Ù„Ø´Ø±ÙƒØ©", ff: "Innde sosirde" },
  registrationNo:   { en: "Registration no.", fr: "NumÃ©ro d'immatriculation", pcm: "Reg number", ar: "Ø±Ù‚Ù… Ø§Ù„ØªØ³Ø¬ÙŠÙ„", ff: "Nimero" },
  address:          { en: "Address", fr: "Adresse", pcm: "Address", ar: "Ø§Ù„Ø¹Ù†ÙˆØ§Ù†", ff: "ÆŠo Woni" },
  phone:            { en: "Phone", fr: "TÃ©lÃ©phone", pcm: "Phone", ar: "Ø§Ù„Ù‡Ø§ØªÙ", ff: "Telefon" },
  email:            { en: "Email", fr: "E-mail", pcm: "Email", ar: "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ", ff: "Email" },
  website:          { en: "Website", fr: "Site web", pcm: "Website", ar: "Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ", ff: "LaaÉ“al" },
  established:      { en: "Established", fr: "CrÃ©Ã© en", pcm: "Founded", ar: "ØªØ£Ø³Ø³Øª", ff: "FuÉ—daa" },
  industry:         { en: "Industry", fr: "Secteur", pcm: "Industry", ar: "Ø§Ù„Ù‚Ø·Ø§Ø¹", ff: "Golle" },
  employees:        { en: "Employees", fr: "EmployÃ©s", pcm: "Workers", ar: "Ø§Ù„Ù…ÙˆØ¸ÙÙˆÙ†", ff: "Gollooji" },
  verified:         { en: "Verified company", fr: "Entreprise vÃ©rifiÃ©e", pcm: "Verified company", ar: "Ø´Ø±ÙƒØ© Ù…ÙˆØ«Ù‚Ø©", ff: "Sosirde jaÉ“É“aama" },

  // â”€â”€ HELP CENTER PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  helpCenter:       { en: "Help Center", fr: "Centre d'aide", pcm: "Help Center", ar: "Ù…Ø±ÙƒØ² Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©", ff: "LaaÉ“al Ballal" },
  helpCenterDesc:   { en: "Find answers to your questions", fr: "Trouvez des rÃ©ponses Ã  vos questions", pcm: "Find answers here", ar: "Ø§Ø¨Ø­Ø« Ø¹Ù† Ø¥Ø¬Ø§Ø¨Ø§Øª Ù„Ø£Ø³Ø¦Ù„ØªÙƒ", ff: "Yiy jaabaaji É—aÉ“É“aajamee" },
  faq:              { en: "Frequently asked questions", fr: "Questions frÃ©quemment posÃ©es", pcm: "FAQ", ar: "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©", ff: "ÆŠaÉ“É“aaje heewÉ—e" },
  gettingStarted:   { en: "Getting started", fr: "DÃ©marrer", pcm: "How to start", ar: "Ø§Ù„Ø¨Ø¯Ø¡", ff: "FuÉ—É—ude" },
  accountHelp:      { en: "Account & Profile", fr: "Compte & Profil", pcm: "Account and Profile", ar: "Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØ§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ", ff: "Askon e Gamgal" },
  buyingHelp:       { en: "Buying & Selling", fr: "Achat & Vente", pcm: "Buying and Selling", ar: "Ø§Ù„Ø´Ø±Ø§Ø¡ ÙˆØ§Ù„Ø¨ÙŠØ¹", ff: "Soodde e YoÉ“de" },
  paymentHelp:      { en: "Payments", fr: "Paiements", pcm: "Payments", ar: "Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª", ff: "YoÉ“de ceede" },
  safetyHelp:       { en: "Safety & Scams", fr: "SÃ©curitÃ© & Arnaques", pcm: "Safety and Scams", ar: "Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ø§Ø­ØªÙŠØ§Ù„", ff: "Kisinaare e Fenaande" },
  technicalHelp:    { en: "Technical issues", fr: "ProblÃ¨mes techniques", pcm: "Technical problems", ar: "Ø§Ù„Ù…Ø´ÙƒÙ„Ø§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ©", ff: "Tuma jiiÉ“i" },
  searchHelp:       { en: "Search help articlesâ€¦", fr: "Rechercher des articles d'aideâ€¦", pcm: "Search helpâ€¦", ar: "Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ù…Ù‚Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©â€¦", ff: "Yiy ballalâ€¦" },
  wasHelpful:       { en: "Was this helpful?", fr: "Cela vous a-t-il aidÃ©?", pcm: "E help you?", ar: "Ù‡Ù„ ÙƒØ§Ù† Ù‡Ø°Ø§ Ù…ÙÙŠØ¯Ù‹Ø§ØŸ", ff: "ÆŠon ballii?" },
  stillNeedHelp:    { en: "Still need help? Contact support", fr: "Besoin d'aide? Contactez le support", pcm: "You still need help? Contact us", ar: "Ù„Ø§ ØªØ²Ø§Ù„ Ø¨Ø­Ø§Ø¬Ø© Ù„Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©ØŸ ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¯Ø¹Ù…", ff: "E waÉ—ii? Æan ballal" },

  // â”€â”€ CONTACT SUPPORT PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  contactSupport:   { en: "Contact Support", fr: "Contacter le Support", pcm: "Contact Support", ar: "Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¯Ø¹Ù…", ff: "Æan Ballal" },
  contactSupportDesc:{ en: "We're here to help â€” reach out anytime", fr: "Nous sommes lÃ  pour vous aider â€” contactez-nous Ã  tout moment", pcm: "We dey here to help you anytime", ar: "Ù†Ø­Ù† Ù‡Ù†Ø§ Ù„Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© â€” ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª", ff: "Min É—oo e ballugol â€” Æan saa'i fof" },
  yourName:         { en: "Your name", fr: "Votre nom", pcm: "Your name", ar: "Ø§Ø³Ù…Ùƒ", ff: "Innde maa" },
  yourEmail:        { en: "Your email", fr: "Votre e-mail", pcm: "Your email", ar: "Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ", ff: "Email maa" },
  yourMessage:      { en: "Your message", fr: "Votre message", pcm: "Your message", ar: "Ø±Ø³Ø§Ù„ØªÙƒ", ff: "Haala maa" },
  subject:          { en: "Subject", fr: "Objet", pcm: "Subject", ar: "Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹", ff: "Miijo" },
  sendMessage:      { en: "Send message", fr: "Envoyer le message", pcm: "Send message", ar: "Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø©", ff: "Neldu haala" },
  messageSent:      { en: "Message sent! We'll reply within 24 hours.", fr: "Message envoyÃ©! Nous rÃ©pondrons dans 24 heures.", pcm: "Message don go! We go reply within 24 hours.", ar: "ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø©! Ø³Ù†Ø±Ø¯ Ø®Ù„Ø§Ù„ 24 Ø³Ø§Ø¹Ø©.", ff: "Haala neldiima! Min yettotoo e sahaa 24." },
  liveChat:         { en: "Live chat", fr: "Chat en direct", pcm: "Live chat", ar: "Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©", ff: "Haala hannde" },
  responseTime:     { en: "Average response time: under 2 hours", fr: "DÃ©lai de rÃ©ponse moyen: moins de 2 heures", pcm: "We usually reply in 2 hours", ar: "ÙˆÙ‚Øª Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø© Ø§Ù„Ù…ØªÙˆØ³Ø·: Ø£Ù‚Ù„ Ù…Ù† Ø³Ø§Ø¹ØªÙŠÙ†", ff: "Yettotoo ko É“uri 2 saate" },

  // â”€â”€ SAFETY & SECURITY PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  safetySecurity:   { en: "Safety & Security", fr: "SÃ©curitÃ©", pcm: "Safety & Security", ar: "Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ø³Ù„Ø§Ù…Ø©", ff: "Kisinaare" },
  safetyDesc:       { en: "Your safety is our top priority", fr: "Votre sÃ©curitÃ© est notre prioritÃ© absolue", pcm: "Your safety na our priority", ar: "Ø³Ù„Ø§Ù…ØªÙƒ Ù‡ÙŠ Ø£ÙˆÙ„ÙˆÙŠØªÙ†Ø§ Ø§Ù„Ù‚ØµÙˆÙ‰", ff: "Kisinaare maa ko waÉ—i fof" },
  avoidScams:       { en: "How to avoid scams", fr: "Comment Ã©viter les arnaques", pcm: "How to no fall for scam", ar: "ÙƒÙŠÙÙŠØ© ØªØ¬Ù†Ø¨ Ø§Ù„Ø§Ø­ØªÙŠØ§Ù„", ff: "No haÉ—mi fenaande" },
  reportScam:       { en: "Report a scam", fr: "Signaler une arnaque", pcm: "Report scam", ar: "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø¹Ù…Ù„ÙŠØ© Ø§Ø­ØªÙŠØ§Ù„", ff: "Haald fenaande" },
  securePayments:   { en: "Secure payment tips", fr: "Conseils de paiement sÃ©curisÃ©", pcm: "How to pay safe", ar: "Ù†ØµØ§Ø¦Ø­ Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ø¢Ù…Ù†", ff: "YoÉ“de kisinaare" },
  doNotShare:       { en: "Never share your PIN or password", fr: "Ne partagez jamais votre PIN ou mot de passe", pcm: "Never share your PIN or password", ar: "Ù„Ø§ ØªØ´Ø§Ø±Ùƒ Ø£Ø¨Ø¯Ù‹Ø§ Ø±Ù‚Ù… Ø§Ù„ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø´Ø®ØµÙŠ Ø£Ùˆ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±", ff: "Wayaa wadande PIN maa walla dandal" },
  trustBadge:       { en: "Bambeh trust badge", fr: "Badge de confiance Bambeh", pcm: "Bambeh trust badge", ar: "Ø´Ø§Ø±Ø© Ø§Ù„Ø«Ù‚Ø© Ù…Ù† Ø¨Ø§Ù…Ø¨ÙŠÙ‡", ff: "Kuccam njilmoyam Bambeh" },
  twoFactor:        { en: "Two-factor authentication", fr: "Authentification Ã  deux facteurs", pcm: "Two-factor authentication", ar: "Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© Ø§Ù„Ø«Ù†Ø§Ø¦ÙŠØ©", ff: "Damal É—iÉ—i" },
  blockedUsers:     { en: "Blocked users", fr: "Utilisateurs bloquÃ©s", pcm: "Blocked users", ar: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† Ø§Ù„Ù…Ø­Ø¸ÙˆØ±ÙˆÙ†", ff: "Æe haÉ—taa" },
  safetyTip:        { en: "Safety tip:", fr: "Conseil de sÃ©curitÃ©:", pcm: "Safety tip:", ar: ":Ù†ØµÙŠØ­Ø© Ø£Ù…Ø§Ù†", ff: "Miijo kisinaare:" },
  safetyText:       { en: "Always meet in a public place and inform someone of your plans.", fr: "Rencontrez toujours dans un lieu public et informez quelqu'un de vos plans.", pcm: "Always meet for public place and tell somebody your plans.", ar: "Ø§Ù„ØªÙ‚Ù Ø¯Ø§Ø¦Ù…Ù‹Ø§ ÙÙŠ Ù…ÙƒØ§Ù† Ø¹Ø§Ù… ÙˆØ£Ø®Ø¨Ø± Ø´Ø®ØµÙ‹Ø§ Ù…Ø§ Ø¨Ø®Ø·Ø·Ùƒ.", ff: "Meetir ko e É—o ngoodi fof, min haaldo yiÉ—É—o maa." },

  // â”€â”€ TERMS OF SERVICE PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  termsTitle:       { en: "Terms & Conditions", fr: "Conditions GÃ©nÃ©rales d'Utilisation", pcm: "Terms and Conditions", ar: "Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…", ff: "SarÉ—iiji e Golle" },
  termsDesc:        { en: "Please read these terms carefully before using Bambeh", fr: "Veuillez lire attentivement ces conditions avant d'utiliser Bambeh", pcm: "Read this before you use Bambeh", ar: "ÙŠØ±Ø¬Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø±ÙˆØ· Ø¨Ø¹Ù†Ø§ÙŠØ© Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨Ø§Ù…Ø¨ÙŠÙ‡", ff: "Jan É—ee sarÉ—iiji É“uri waÉ—ugol Bambeh" },
  lastUpdated:      { en: "Last updated", fr: "DerniÃ¨re mise Ã  jour", pcm: "Last updated", ar: "Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«", ff: "Fotnodaa É“enndi" },
  acceptTerms:      { en: "I accept the terms", fr: "J'accepte les conditions", pcm: "I accept am", ar: "Ø£Ù‚Ø¨Ù„ Ø§Ù„Ø´Ø±ÙˆØ·", ff: "JaÉ“mii sarÉ—iiji" },
  tableOfContents:  { en: "Table of contents", fr: "Table des matiÃ¨res", pcm: "Table of contents", ar: "Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù…Ø­ØªÙˆÙŠØ§Øª", ff: "Listu kaaÉ—e" },
  userObligations:  { en: "User obligations", fr: "Obligations de l'utilisateur", pcm: "Your obligations", ar: "Ø§Ù„ØªØ²Ø§Ù…Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…", ff: "Ko gollooje" },
  prohibitedContent:{ en: "Prohibited content", fr: "Contenu interdit", pcm: "What no dey allowed", ar: "Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø­Ø¸ÙˆØ±", ff: "Ko haÉ—aa" },
  disclaimer:       { en: "Disclaimer", fr: "Avertissement", pcm: "Disclaimer", ar: "Ø¥Ø®Ù„Ø§Ø¡ Ù…Ø³Ø¤ÙˆÙ„ÙŠØ©", ff: "Tiitoonde" },
  governingLaw:     { en: "Governing law", fr: "Droit applicable", pcm: "Governing law", ar: "Ø§Ù„Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ø­Ø§ÙƒÙ…", ff: "Laawol keÉ“tinaaÉ—o" },

  // â”€â”€ PRIVACY POLICY PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  privacyTitle:     { en: "Privacy Policy", fr: "Politique de confidentialitÃ©", pcm: "Privacy Policy", ar: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©", ff: "SarÉ—i Gaasooji" },
  privacyDesc:      { en: "How BAMBEH SARL collects and uses your data", fr: "Comment BAMBEH SARL collecte et utilise vos donnÃ©es", pcm: "How Bambeh uses your data", ar: "ÙƒÙŠÙÙŠØ© Ø¬Ù…Ø¹ Ø¨Ø§Ù…Ø¨ÙŠÙ‡ Ù„Ø¨ÙŠØ§Ù†Ø§ØªÙƒ ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§", fr2: "Comment BAMBEH SARL utilise vos donnÃ©es", ff: "No Bambeh waÉ—i É—atum maa" },
  dataCollected:    { en: "Data we collect", fr: "DonnÃ©es que nous collectons", pcm: "Data we dey collect", ar: "Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙŠ Ù†Ø¬Ù…Ø¹Ù‡Ø§", ff: "ÆŠatum min hoÉ—taa" },
  howWeUseData:     { en: "How we use your data", fr: "Comment nous utilisons vos donnÃ©es", pcm: "How we use your data", ar: "ÙƒÙŠÙÙŠØ© Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù†Ø§ Ù„Ø¨ÙŠØ§Ù†Ø§ØªÙƒ", ff: "No waÉ—mi É—atum maa" },
  dataSharing:      { en: "Data sharing", fr: "Partage des donnÃ©es", pcm: "Data sharing", ar: "Ù…Ø´Ø§Ø±ÙƒØ© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª", ff: "Wadande É—atum" },
  yourRights:       { en: "Your rights", fr: "Vos droits", pcm: "Your rights", ar: "Ø­Ù‚ÙˆÙ‚Ùƒ", ff: "Hakke maa" },
  cookies:          { en: "Cookies", fr: "Cookies", pcm: "Cookies", ar: "Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø·", ff: "Cookies" },
  deleteAccount:    { en: "Delete my account", fr: "Supprimer mon compte", pcm: "Delete my account", ar: "Ø­Ø°Ù Ø­Ø³Ø§Ø¨ÙŠ", ff: "Soo askon am" },
  dataDeletion:     { en: "Request data deletion", fr: "Demander la suppression des donnÃ©es", pcm: "Request data deletion", ar: "Ø·Ù„Ø¨ Ø­Ø°Ù Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª", ff: "ÆŠaÉ“É“o sooddi É—atum" },
  privacyContact:   { en: "Privacy questions? Email", fr: "Questions sur la confidentialitÃ©? Ã‰crivez Ã ", pcm: "Privacy question? Email", ar: "Ø£Ø³Ø¦Ù„Ø© Ø¹Ù† Ø§Ù„Ø®ØµÙˆØµÙŠØ©ØŸ Ø£Ø±Ø³Ù„ Ø¨Ø±ÙŠØ¯Ù‹Ø§ Ø¥Ù„Ù‰", ff: "ÆŠaÉ“É“aaje gaasooji? Email" },

  // â”€â”€ PAYMENT UI (shared across pages) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  payWithMoMo:      { en: "Pay with Mobile Money", fr: "Payer avec Mobile Money", pcm: "Pay with Mobile Money", ar: "Ø§Ù„Ø¯ÙØ¹ Ø¨Ø§Ù„Ù…Ø­ÙØ¸Ø© Ø§Ù„Ù…Ø­Ù…ÙˆÙ„Ø©", ff: "YoÉ“o e Mobile Money" },
  poweredBy:        { en: "Powered by CamPay Â· MTN MoMo & Orange Money", fr: "PropulsÃ© par CamPay Â· MTN MoMo & Orange Money", pcm: "Na CamPay power am Â· MTN MoMo & Orange Money", ar: "Ù…Ø¯Ø¹ÙˆÙ… Ø¨Ù€ CamPay Â· MTN MoMo Ùˆ Orange Money", ff: "CamPay saÉ—ii Â· MTN MoMo & Orange Money" },
  mtnOrOrange:      { en: "MTN or Orange phone number", fr: "NumÃ©ro MTN ou Orange", pcm: "MTN or Orange number", ar: "Ø±Ù‚Ù… MTN Ø£Ùˆ Orange", ff: "Nimero MTN walla Orange" },
  ussdPrompt:       { en: "You will receive a USSD prompt to confirm", fr: "Vous recevrez une invite USSD pour confirmer", pcm: "You go receive USSD prompt to confirm", ar: "Ø³ØªØªÙ„Ù‚Ù‰ Ø·Ù„Ø¨ USSD Ù„Ù„ØªØ£ÙƒÙŠØ¯", ff: "E yettoyre USSD e jaÉ“ngol" },
  confirmPay:       { en: (n: number) => `Pay ${n.toLocaleString("fr-CM")} XAF`, fr: (n: number) => `Payer ${n.toLocaleString("fr-CM")} XAF`, pcm: (n: number) => `Pay ${n.toLocaleString("fr-CM")} XAF`, ar: (n: number) => `Ø§Ø¯ÙØ¹ ${n.toLocaleString("ar-DZ")} XAF`, ff: (n: number) => `YoÉ“o ${n.toLocaleString("fr-CM")} XAF` },
  sendingRequest:   { en: "Sending payment requestâ€¦", fr: "Envoi de la demande de paiementâ€¦", pcm: "E dey send payment requestâ€¦", ar: "Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø¯ÙØ¹â€¦", ff: "E neldude É—aÉ“É“aadeâ€¦" },
  checkPhone:       { en: "Check your phone", fr: "VÃ©rifiez votre tÃ©lÃ©phone", pcm: "Check your phone", ar: "ØªØ­Ù‚Ù‚ Ù…Ù† Ù‡Ø§ØªÙÙƒ", ff: "Yiy Telefon maa" },
  enterPin:         { en: "Enter your PIN to confirm the payment", fr: "Entrez votre PIN pour confirmer le paiement", pcm: "Enter your PIN to confirm", ar: "Ø£Ø¯Ø®Ù„ Ø±Ù‚Ù… Ø§Ù„ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø´Ø®ØµÙŠ Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¯ÙØ¹", ff: "Nelo PIN maa e jaÉ“ngol" },
  waiting:          { en: (m: number, s: number) => `Waiting for confirmationâ€¦ ${m}:${String(s).padStart(2, "0")}`, fr: (m: number, s: number) => `En attente de confirmationâ€¦ ${m}:${String(s).padStart(2, "0")}`, pcm: (m: number, s: number) => `Waiting for confirmationâ€¦ ${m}:${String(s).padStart(2, "0")}`, ar: (m: number, s: number) => `Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„ØªØ£ÙƒÙŠØ¯â€¦ ${m}:${String(s).padStart(2, "0")}`, ff: (m: number, s: number) => `E yaÉ—de jaÉ“ngolâ€¦ ${m}:${String(s).padStart(2, "0")}` },
  processing:       { en: "Processingâ€¦", fr: "Traitementâ€¦", pcm: "E processâ€¦", ar: "Ø¬Ø§Ø±Ù Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©â€¦", ff: "E waÉ—deâ€¦" },
  paymentConfirmed: { en: "Payment confirmed!", fr: "Paiement confirmÃ©!", pcm: "Payment don confirm!", ar: "ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¯ÙØ¹!", ff: "YoÉ“de jaÉ“É“ii!" },
  orderProcessed:   { en: "Your order has been processed", fr: "Votre commande a Ã©tÃ© traitÃ©e", pcm: "Your order don process", ar: "ØªÙ…Øª Ù…Ø¹Ø§Ù„Ø¬Ø© Ø·Ù„Ø¨Ùƒ", ff: "ÆŠaÉ“É“aade maa waÉ—aa" },
  payFailed:        { en: "Payment failed", fr: "Ã‰chec du paiement", pcm: "Payment fail", ar: "ÙØ´Ù„ Ø§Ù„Ø¯ÙØ¹", ff: "YoÉ“de fenaanii" },
  questions:        { en: "Questions?", fr: "Des questions?", pcm: "You get question?", ar: "Ù‡Ù„ Ù„Ø¯ÙŠÙƒ Ø£Ø³Ø¦Ù„Ø©ØŸ", ff: "ÆŠaÉ“É“aade fof?" },
  securedEncrypted: { en: "Secured & encrypted", fr: "SÃ©curisÃ© & chiffrÃ©", pcm: "Secured and encrypted", ar: "Ù…Ø­Ù…ÙŠ ÙˆÙ…Ø´ÙØ±", ff: "Kisinaama e É“oggoodaama" },
  orderPlaced:      { en: "Order placed!", fr: "Commande passÃ©e!", pcm: "Order don place!", ar: "ØªÙ… ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø·Ù„Ø¨!", ff: "ÆŠaÉ“É“aade fuÉ—ii!" },
  payConfirmed:     { en: "Payment confirmed. Your order is on its way.", fr: "Paiement confirmÃ©. Votre commande est en route.", pcm: "Payment confirmed. Your order dey come.", ar: "ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¯ÙØ¹. Ø·Ù„Ø¨Ùƒ ÙÙŠ Ø§Ù„Ø·Ø±ÙŠÙ‚.", ff: "YoÉ“de jaÉ“É“ii. ÆŠaÉ“É“aade maa arii." },
  trackOrder:       { en: "Track my order", fr: "Suivre ma commande", pcm: "Track my order", ar: "ØªØªØ¨Ø¹ Ø·Ù„Ø¨ÙŠ", ff: "Takk É—aÉ“É“aade am" },
  keepShopping:     { en: "Keep shopping", fr: "Continuer les achats", pcm: "Continue shopping", ar: "Ù…ÙˆØ§ØµÙ„Ø© Ø§Ù„ØªØ³ÙˆÙ‚", ff: "Jokko soodde" },
  addToCartBtn:     { en: "Add to cart", fr: "Ajouter au panier", pcm: "Add to cart", ar: "Ø£Ø¶Ù Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©", ff: "Fodo e paani" },
  addedBtn:         { en: "Added!", fr: "AjoutÃ©!", pcm: "Added!", ar: "ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ©!", ff: "Fodaa!" },
  addedToCart:      { en: "Added to cart", fr: "AjoutÃ© au panier", pcm: "Added to cart", ar: "ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ© Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©", ff: "Fodaa e paani" },
  buyNow:           { en: "Buy now", fr: "Acheter maintenant", pcm: "Buy am now", ar: "Ø§Ø´ØªØ±Ù Ø§Ù„Ø¢Ù†", ff: "Sooddo hannde" },
  payNow:           { en: "Pay now", fr: "Payer maintenant", pcm: "Pay now", ar: "Ø§Ø¯ÙØ¹ Ø§Ù„Ø¢Ù†", ff: "YoÉ“o hannde" },
  whatsapp:         { en: "WhatsApp", fr: "WhatsApp", pcm: "WhatsApp", ar: "ÙˆØ§ØªØ³Ø§Ø¨", ff: "WhatsApp" },
  call:             { en: "Call", fr: "Appeler", pcm: "Call am", ar: "Ø§ØªØµØ§Ù„", ff: "Nodd" },
  seller:           { en: "Seller", fr: "Vendeur", pcm: "Seller", ar: "Ø§Ù„Ø¨Ø§Ø¦Ø¹", ff: "YiÉ—É—o yoÉ“de" },
  reportListing:    { en: "Report this listing", fr: "Signaler cette annonce", pcm: "Report dis listing", ar: "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†", ff: "Haald gannde É—on" },

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
  if (!entry) return key; // key not found â†’ return raw key
  return entry[lang] ?? entry["en"] ?? key;
}
