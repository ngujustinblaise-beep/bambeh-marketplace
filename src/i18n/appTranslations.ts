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

// -----------------------------------------------------------------------------
// Helper type: every key maps to a record of the 5 languages.
// -----------------------------------------------------------------------------
type TranslationMap = Record<string, Record<AppLang, string | ((...args: any[]) => string)>>;

export const T: TranslationMap = {

  // -- COMMON / GLOBAL ----------------------------------------------------------
  back:             { en: "Back", fr: "Retour", pcm: "Go back", ar: "????", ff: "Artii" },
  save:             { en: "Save", fr: "Enregistrer", pcm: "Save am", ar: "???", ff: "Tofno" },
  cancel:           { en: "Cancel", fr: "Annuler", pcm: "No do am", ar: "?????", ff: "Ha?tude" },
  confirm:          { en: "Confirm", fr: "Confirmer", pcm: "Confirm am", ar: "?????", ff: "Ja??aade" },
  submit:           { en: "Submit", fr: "Soumettre", pcm: "Send am", ar: "?????", ff: "Neldude" },
  close:            { en: "Close", fr: "Fermer", pcm: "Close am", ar: "?????", ff: "Udde" },
  loading:          { en: "Loading...", fr: "Chargement...", pcm: "Loading...", ar: "??? ???????...", ff: "Naatirde..." },
  error:            { en: "Something went wrong", fr: "Une erreur est survenue", pcm: "Something go wrong", ar: "??? ??? ??", ff: "Huunde wariima fenaande" },
  retry:            { en: "Try again", fr: "Réessayer", pcm: "Try again", ar: "???? ??????", ff: "Taftinoo" },
  search:           { en: "Search", fr: "Rechercher", pcm: "Search", ar: "???", ff: "Yiylaade" },
  filter:           { en: "Filter", fr: "Filtrer", pcm: "Filter", ar: "?????", ff: "Su?ande" },
  sort:             { en: "Sort", fr: "Trier", pcm: "Sort am", ar: "?????", ff: "Ju??inaade" },
  all:              { en: "All", fr: "Tout", pcm: "All", ar: "????", ff: "Fof" },
  noResults:        { en: "No results found", fr: "Aucun résultat trouvé", pcm: "Nothing dey here", ar: "?? ???? ?????", ff: "Walaa huunde e yiytaade" },
  seeAll:           { en: "See all", fr: "Voir tout", pcm: "See all", ar: "??? ????", ff: "Yiy fof" },
  viewDetails:      { en: "View details", fr: "Voir les détails", pcm: "See details", ar: "??? ????????", ff: "Yiy kaa?e" },
  share:            { en: "Share", fr: "Partager", pcm: "Share am", ar: "??????", ff: "Wadande" },
  report:           { en: "Report", fr: "Signaler", pcm: "Report am", ar: "?????", ff: "Haalde" },
  favorite:         { en: "Save to favourites", fr: "Ajouter aux favoris", pcm: "Save for favourites", ar: "??? ?? ???????", ff: "Tofno e heew?e" },
  unfavorite:       { en: "Remove from favourites", fr: "Retirer des favoris", pcm: "Remove from favourites", ar: "????? ?? ???????", ff: "Yottinde e heew?e" },
  linkCopied:       { en: "Link copied!", fr: "Lien copié!", pcm: "Link don copy!", ar: "?? ??? ??????!", ff: "Naawdi nawnaa!" },
  copied:           { en: "Copied!", fr: "Copié!", pcm: "E don copy!", ar: "?? ?????!", ff: "Nawnaa!" },
  yes:              { en: "Yes", fr: "Oui", pcm: "Yes", ar: "???", ff: "Eey" },
  no:               { en: "No", fr: "Non", pcm: "No", ar: "??", ff: "Alaa" },
  or:               { en: "or", fr: "ou", pcm: "or", ar: "??", ff: "walla" },
  and:              { en: "and", fr: "et", pcm: "and", ar: "?", ff: "e" },
  of:               { en: "of", fr: "de", pcm: "of", ar: "??", ff: "e" },
  by:               { en: "by", fr: "par", pcm: "by", ar: "??????", ff: "e" },
  free:             { en: "Free", fr: "Gratuit", pcm: "Free", ar: "?????", ff: "Yo?etaake" },
  new:              { en: "New", fr: "Nouveau", pcm: "New", ar: "????", ff: "Kesel" },
  comingSoon:       { en: "Coming soon", fr: "Bientôt disponible", pcm: "E go dey soon", ar: "??????", ff: "Arta dey" },
  optional:         { en: "Optional", fr: "Optionnel", pcm: "Optional", ar: "???????", ff: "Ko feewi" },
  required:         { en: "Required", fr: "Obligatoire", pcm: "Required", ar: "?????", ff: "Ko wa?i" },
  selectOne:        { en: "Select one", fr: "Sélectionner", pcm: "Pick one", ar: "???? ??????", ff: "Su?o gooto" },
  total:            { en: "Total", fr: "Total", pcm: "Total", ar: "???????", ff: "Fof" },
  price:            { en: "Price", fr: "Prix", pcm: "Price", ar: "?????", ff: "Njamndi" },
  location:         { en: "Location", fr: "Localisation", pcm: "Location", ar: "??????", ff: "Ja?irde" },
  posted:           { en: "Posted", fr: "Publié", pcm: "E post", ar: "????", ff: "Neldaa" },
  updated:          { en: "Updated", fr: "Mis à jour", pcm: "Updated", ar: "??????", ff: "Fotnodaa" },
  views:            { en: "views", fr: "vues", pcm: "views", ar: "???????", ff: "yiytaama" },
  active:           { en: "Active", fr: "Actif", pcm: "Active", ar: "???", ff: "Gollor?o" },
  expired:          { en: "Expired", fr: "Expiré", pcm: "Expired", ar: "????? ????????", ff: "Tiimaa" },
  pending:          { en: "Pending", fr: "En attente", pcm: "Dey wait", ar: "??? ????????", ff: "E yaa?aa" },
  approved:         { en: "Approved", fr: "Approuvé", pcm: "Dem approve am", ar: "????? ????", ff: "Ja?aa" },
  rejected:         { en: "Rejected", fr: "Rejeté", pcm: "Dem reject am", ar: "?????", ff: "Ha?aa" },
  noItemsYet:       { en: "No items yet", fr: "Aucun article pour l'instant", pcm: "Nothing dey here yet", ar: "?? ???? ????? ???", ff: "Walaa fof saa'i hannde" },
  loginRequired:    { en: "Please log in to continue", fr: "Veuillez vous connecter pour continuer", pcm: "Log in first make you continue", ar: "???? ????? ?????? ????????", ff: "Naado tafto soo wa?aa" },
  pageNotFound:     { en: "Page not found", fr: "Page introuvable", pcm: "Dis page no dey", ar: "?????? ??? ??????", ff: "Papiye yiytaaka" },
  goHome:           { en: "Go to Home", fr: "Retour à l'accueil", pcm: "Go home", ar: "?????? ????????", ff: "Yahoo galle" },

  // -- NAVIGATION / HEADER ------------------------------------------------------
  home:             { en: "Home", fr: "Accueil", pcm: "Home", ar: "????????", ff: "Galle" },
  menu:             { en: "Menu", fr: "Menu", pcm: "Menu", ar: "???????", ff: "Listu" },
  notifications:    { en: "Notifications", fr: "Notifications", pcm: "Notification", ar: "?????????", ff: "Kaa?e" },
  messages:         { en: "Messages", fr: "Messages", pcm: "Messages", ar: "???????", ff: "Tiitoonde" },
  profile:          { en: "Profile", fr: "Profil", pcm: "Profile", ar: "????? ??????", ff: "Gamgal" },
  settings:         { en: "Settings", fr: "Paramètres", pcm: "Settings", ar: "?????????", ff: "To??e" },
  logout:           { en: "Log out", fr: "Déconnexion", pcm: "Logout", ar: "????? ??????", ff: "Wurtude" },
  login:            { en: "Log in", fr: "Connexion", pcm: "Login", ar: "????? ??????", ff: "Naanaade" },
  register:         { en: "Register", fr: "S'inscrire", pcm: "Register", ar: "???????", ff: "?a??ude" },
  postAd:           { en: "Post an Ad", fr: "Publier une annonce", pcm: "Post Ad", ar: "??? ?????", ff: "Neld Gannde" },
  cart:             { en: "Cart", fr: "Panier", pcm: "Cart", ar: "???? ??????", ff: "Paani" },
  cartEmpty:        { en: "Your cart is empty", fr: "Votre panier est vide", pcm: "Your cart empty", ar: "??? ?????? ?????", ff: "Paani maa boo?ii" },

  // -- FOOTER -------------------------------------------------------------------
  footerTagline:    { en: "Cameroon's trusted marketplace", fr: "La place de marché de confiance du Cameroun", pcm: "Cameroon trusted market", ar: "????? ??????? ?? ?????????", ff: "Suudu njiydi Kameruun" },
  footerAbout:      { en: "About Bambeh", fr: "À propos de Bambeh", pcm: "About Bambeh", ar: "?? ??????", ff: "E dow Bambeh" },
  footerHelp:       { en: "Help Center", fr: "Centre d'aide", pcm: "Help Center", ar: "???? ????????", ff: "Laa?al Ballal" },
  footerTerms:      { en: "Terms & Conditions", fr: "Conditions Générales", pcm: "Terms & Conditions", ar: "?????? ????????", ff: "Sar?iiji" },
  footerPrivacy:    { en: "Privacy Policy", fr: "Politique de confidentialité", pcm: "Privacy Policy", ar: "????? ????????", ff: "Sar?i Gaasooji" },
  footerContact:    { en: "Contact Support", fr: "Contacter le support", pcm: "Contact Support", ar: "????? ?? ?????", ff: "?anndital Ballal" },
  footerSafety:     { en: "Safety & Security", fr: "Sécurité", pcm: "Safety & Security", ar: "?????? ????????", ff: "Kisinaare" },
  footerRights:     { en: "All rights reserved.", fr: "Tous droits réservés.", pcm: "All rights reserved.", ar: "???? ?????? ??????.", ff: "Hakke fof kuu?i." },
  footerDownload:   { en: "Download the app", fr: "Télécharger l'application", pcm: "Download the app", ar: "????? ???????", ff: "Wurno app ?oo" },
  footerLanguage:   { en: "Language", fr: "Langue", pcm: "Language", ar: "?????", ff: "Demngal" },
  footerSocial:     { en: "Follow us", fr: "Suivez-nous", pcm: "Follow us", ar: "??????", ff: "Tullude min" },
  footerCategory:   { en: "Categories", fr: "Catégories", pcm: "Categories", ar: "??????", ff: "Teelte" },

  // -- MAIN LAYOUT --------------------------------------------------------------
  explore:          { en: "Explore", fr: "Explorer", pcm: "Explore", ar: "???????", ff: "Gite" },
  categories:       { en: "Categories", fr: "Catégories", pcm: "Categories", ar: "??????", ff: "Teelte" },
  featured:         { en: "Featured", fr: "À la une", pcm: "Featured", ar: "????", ff: "Tii?ngal" },
  trending:         { en: "Trending", fr: "Tendances", pcm: "Trending", ar: "????", ff: "Reedu" },
  nearby:           { en: "Nearby", fr: "À proximité", pcm: "Near me", ar: "?????? ???", ff: "Ko dow maa" },
  recentlyViewed:   { en: "Recently viewed", fr: "Récemment consultés", pcm: "You don see before", ar: "???? ??????", ff: "Yiytaama jooni" },
  recommended:      { en: "Recommended for you", fr: "Recommandé pour vous", pcm: "We pick am for you", ar: "???? ?? ??", ff: "Ko tii?naa maa" },

  // -- MARKETPLACE PAGE ---------------------------------------------------------
  marketplace:      { en: "Marketplace", fr: "Marketplace", pcm: "Market", ar: "?????", ff: "Suudu Njiydi" },
  marketplaceDesc:  { en: "Buy and sell new & used items", fr: "Achetez et vendez des articles neufs ou d'occasion", pcm: "Buy and sell your things", ar: "??? ????? ???????? ??????? ??????????", ff: "Soodde e yo?de huunde" },
  sellItem:         { en: "Sell an item", fr: "Vendre un article", pcm: "Sell something", ar: "??? ????", ff: "Yo?du huunde" },
  condition:        { en: "Condition", fr: "État", pcm: "Condition", ar: "??????", ff: "Himo" },
  conditionNew:     { en: "Brand new", fr: "Neuf", pcm: "Brand new", ar: "???? ??????", ff: "Kesel kesel" },
  conditionUsed:    { en: "Used", fr: "Occasion", pcm: "Used", ar: "??????", ff: "Jokki" },
  brand:            { en: "Brand", fr: "Marque", pcm: "Brand", ar: "??????? ????????", ff: "Marke" },
  category:         { en: "Category", fr: "Catégorie", pcm: "Category", ar: "?????", ff: "Teele" },
  description:      { en: "Description", fr: "Description", pcm: "Description", ar: "?????", ff: "Firo" },
  photos:           { en: "Photos", fr: "Photos", pcm: "Pictures", ar: "?????", ff: "Foto" },
  addPhoto:         { en: "Add photo", fr: "Ajouter une photo", pcm: "Add picture", ar: "????? ????", ff: "Fodo foto" },
  negotiable:       { en: "Price is negotiable", fr: "Prix négociable", pcm: "Price fit change", ar: "????? ???? ???????", ff: "Njamndi hul?inee" },
  contactSeller:    { en: "Contact Seller", fr: "Contacter le vendeur", pcm: "Talk to seller", ar: "??????? ?? ??????", ff: "?an yi?do yo?de" },
  makeOffer:        { en: "Make an offer", fr: "Faire une offre", pcm: "Make offer", ar: "????? ???", ff: "Wallirde" },
  itemSold:         { en: "Mark as sold", fr: "Marquer comme vendu", pcm: "Mark as sold", ar: "????? ?????", ff: "Hollito yo?daa" },

  // -- JOBS PAGE ----------------------------------------------------------------
  jobs:             { en: "Jobs", fr: "Emplois", pcm: "Jobs", ar: "???????", ff: "Golle" },
  jobsDesc:         { en: "Find your next opportunity", fr: "Trouvez votre prochaine opportunité", pcm: "Find work here", ar: "???? ?? ????? ???????", ff: "Yiy golle maa" },
  postJob:          { en: "Post a job", fr: "Publier un emploi", pcm: "Post job", ar: "??? ?????", ff: "Neldu Golle" },
  applyNow:         { en: "Apply now", fr: "Postuler maintenant", pcm: "Apply now", ar: "?????? ????", ff: "?a??o hannde" },
  jobType:          { en: "Job type", fr: "Type d'emploi", pcm: "Type of work", ar: "??? ???????", ff: "Mun'de golle" },
  fullTime:         { en: "Full-time", fr: "Plein temps", pcm: "Full time", ar: "???? ????", ff: "Fof sahaa" },
  partTime:         { en: "Part-time", fr: "Temps partiel", pcm: "Part time", ar: "???? ????", ff: "Sahaa laabi" },
  remote:           { en: "Remote", fr: "Télétravail", pcm: "Remote", ar: "?? ????", ff: "E suudu" },
  contract:         { en: "Contract", fr: "Contrat", pcm: "Contract", ar: "???", ff: "Waa?irde" },
  internship:       { en: "Internship", fr: "Stage", pcm: "Internship", ar: "?????", ff: "Janngo golle" },
  salary:           { en: "Salary", fr: "Salaire", pcm: "Salary", ar: "??????", ff: "Tiinde" },
  experience:       { en: "Experience", fr: "Expérience", pcm: "Experience", ar: "??????", ff: "Janngal" },
  qualification:    { en: "Qualifications", fr: "Qualifications", pcm: "Qualifications", ar: "????????", ff: "Ndee-ndee" },
  deadline:         { en: "Application deadline", fr: "Date limite de candidature", pcm: "Deadline", ar: "?????? ??????? ???????", ff: "?ennde" },
  jobsFound:        { en: (n: number) => `${n} job${n === 1 ? "" : "s"} found`, fr: (n: number) => `${n} offre${n === 1 ? "" : "s"} trouvée${n === 1 ? "" : "s"}`, pcm: (n: number) => `${n} job${n === 1 ? "" : "s"} dey`, ar: (n: number) => `?? ????? ${n} ?????`, ff: (n: number) => `${n} golle yiytaa` },

  // -- SERVICES PAGE ------------------------------------------------------------
  services:         { en: "Services", fr: "Services", pcm: "Services", ar: "???????", ff: "Tii?e" },
  servicesDesc:     { en: "Hire skilled professionals near you", fr: "Engagez des professionnels qualifiés près de vous", pcm: "Find skilled people near you", ar: "???? ??????? ?????? ?????? ???", ff: "Yiy tii?u?e dow maa" },
  offerService:     { en: "Offer a service", fr: "Proposer un service", pcm: "Post your service", ar: "????? ????", ff: "Fod tii?e maa" },
  bookNow:          { en: "Book now", fr: "Réserver maintenant", pcm: "Book am now", ar: "???? ????", ff: "Sooddo hannde" },
  serviceType:      { en: "Service type", fr: "Type de service", pcm: "Type of service", ar: "??? ??????", ff: "Mun'de tii?e" },
  availability:     { en: "Availability", fr: "Disponibilité", pcm: "When dem dey", ar: "??????", ff: "Himo waawi" },
  rate:             { en: "Rate", fr: "Tarif", pcm: "Rate", ar: "?????", ff: "Njamndi" },
  perHour:          { en: "per hour", fr: "par heure", pcm: "per hour", ar: "?? ??????", ff: "to saate" },
  perDay:           { en: "per day", fr: "par jour", pcm: "per day", ar: "?? ?????", ff: "to ñalorma" },
  perJob:           { en: "per job", fr: "par prestation", pcm: "per job", ar: "?????? ???????", ff: "to tii?e" },
  bookingRequest:   { en: "Booking request sent", fr: "Demande de réservation envoyée", pcm: "Booking request don go", ar: "?? ????? ??? ?????", ff: "?a??udi sooddi neldaa" },
  providerProfile:  { en: "Provider profile", fr: "Profil du prestataire", pcm: "Provider profile", ar: "??? ???? ??????", ff: "Gamgal boodii?o" },

  // -- RENTALS PAGE -------------------------------------------------------------
  rentals:          { en: "Rentals", fr: "Locations", pcm: "Rentals", ar: "?????????", ff: "Njoo?am" },
  rentalsDesc:      { en: "Apartments, rooms & houses for rent", fr: "Appartements, chambres et maisons à louer", pcm: "Rent house, room or flat", ar: "??? ???? ?????? ???????", ff: "Njoo?am suudu e ?o woni" },
  listProperty:     { en: "List your property", fr: "Publier votre bien", pcm: "Post your property", ar: "???? ?? ?????", ff: "Neldu suudu maa" },
  propertyType:     { en: "Property type", fr: "Type de bien", pcm: "Type of place", ar: "??? ??????", ff: "Mun'de suudu" },
  bedrooms:         { en: "Bedrooms", fr: "Chambres", pcm: "Rooms", ar: "??? ?????", ff: "Suudu ?o??i" },
  bathrooms:        { en: "Bathrooms", fr: "Salles de bain", pcm: "Bathrooms", ar: "????????", ff: "Suudu jiimde" },
  furnished:        { en: "Furnished", fr: "Meublé", pcm: "Furnished", ar: "?????", ff: "Kaa?taa" },
  unfurnished:      { en: "Unfurnished", fr: "Non meublé", pcm: "Not furnished", ar: "??? ?????", ff: "Kaa?taaka" },
  perMonth:         { en: "per month", fr: "par mois", pcm: "per month", ar: "??????", ff: "to lewru" },
  perYear:          { en: "per year", fr: "par an", pcm: "per year", ar: "??????", ff: "to hitaande" },
  deposit:          { en: "Deposit", fr: "Dépôt de garantie", pcm: "Deposit", ar: "?????", ff: "Sooddi" },
  contactOwner:     { en: "Contact Owner", fr: "Contacter le propriétaire", pcm: "Talk to owner", ar: "??????? ?? ??????", ff: "?an bo?eejo" },
  bookVisit:        { en: "Book a visit", fr: "Planifier une visite", pcm: "Book visit", ar: "??? ?????", ff: "Sooddo doolo" },
  included:         { en: "What's included", fr: "Ce qui est inclus", pcm: "Wetin dey inside", ar: "?? ?? ?????", ff: "Ko tagi" },
  subscribe:        { en: "Subscribe now", fr: "S'abonner maintenant", pcm: "Subscribe now", ar: "????? ????", ff: "Sooddo hannde" },
  cancelSub:        { en: "Cancel subscription", fr: "Annuler l'abonnement", pcm: "Cancel subscription", ar: "????? ????????", ff: "Ha?t sooddi" },
  renewsOn:         { en: "Renews on", fr: "Renouvellement le", pcm: "E go renew on", ar: "????? ??", ff: "E to??oo e" },
  subExpired:       { en: "Your subscription has expired", fr: "Votre abonnement a expiré", pcm: "Your subscription don expire", ar: "????? ?????? ???????", ff: "Sooddi maa tiimii" },

  // -- SUPPORT BAMBEH PAGE ------------------------------------------------------
  supportBambeh:    { en: "Support Bambeh", fr: "Soutenir Bambeh", pcm: "Support Bambeh", ar: "??? ??????", ff: "Ballal Bambeh" },
  supportBambehDesc:{ en: "Help us grow and keep the platform free", fr: "Aidez-nous à grandir et garder la plateforme gratuite", pcm: "Help us grow and keep it free", ar: "?????? ??? ????? ???????? ??? ?????? ??????", ff: "Ballam, hukk Bambeh teri" },
  donate:           { en: "Donate", fr: "Faire un don", pcm: "Donate", ar: "????", ff: "Rokku" },
  donateAmount:     { en: "Choose amount", fr: "Choisir le montant", pcm: "Choose how much", ar: "???? ??????", ff: "Su?o nde" },
  oneTimeDonation:  { en: "One-time donation", fr: "Don unique", pcm: "One time donation", ar: "???? ???? ?????", ff: "Rokku?e kootuko" },
  monthlySupport:   { en: "Monthly support", fr: "Soutien mensuel", pcm: "Monthly support", ar: "??? ????", ff: "Ballal e lewru" },
  thankYouSupport:  { en: "Thank you for supporting Bambeh!", fr: "Merci de soutenir Bambeh!", pcm: "Thank you for your support!", ar: "????? ????? ??????!", ff: "A jaraama ballal maa!" },
  referFriend:      { en: "Refer a friend", fr: "Parrainer un ami", pcm: "Refer your friend", ar: "???? ??????", ff: "?enno yi??o" },
  referralBonus:    { en: "Earn coins for each referral", fr: "Gagnez des pièces pour chaque parrainage", pcm: "Earn coins when you refer", ar: "???? ????? ????? ?? ?????", ff: "Hoot ceede to ?ennugol" },

  // -- ABOUT US PAGE ------------------------------------------------------------
  about:            { en: "About Us", fr: "À propos", pcm: "About Us", ar: "??????? ???", ff: "E dow min" },
  aboutDesc:        { en: "Learn more about BAMBEH SARL", fr: "En savoir plus sur BAMBEH SARL", pcm: "Learn about Bambeh", ar: "???? ??? ?????? ??? ?????? SARL", ff: "Janno e BAMBEH SARL" },
  ourMission:       { en: "Our Mission", fr: "Notre Mission", pcm: "Our Mission", ar: "??????", ff: "Miijol memen" },
  ourVision:        { en: "Our Vision", fr: "Notre Vision", pcm: "Our Vision", ar: "??????", ff: "Anniya memen" },
  ourTeam:          { en: "Our Team", fr: "Notre Équipe", pcm: "Our Team", ar: "??????", ff: "Koodi memen" },
  ourStory:         { en: "Our Story", fr: "Notre Histoire", pcm: "Our Story", ar: "?????", ff: "Haala memen" },
  foundedIn:        { en: "Founded in Cameroon", fr: "Fondé au Cameroun", pcm: "Founded for Cameroon", ar: "????? ?? ?????????", ff: "Fu?daa e Kameruun" },
  contactUs:        { en: "Contact us", fr: "Nous contacter", pcm: "Contact us", ar: "????? ????", ff: "?an min" },
  followUs:         { en: "Follow us", fr: "Suivez-nous", pcm: "Follow us", ar: "??????", ff: "Tullude min" },

  // -- VIEW COMPANY PROFILE PAGE ------------------------------------------------
  companyProfile:   { en: "Company Profile", fr: "Profil de l'Entreprise", pcm: "Company Profile", ar: "??? ??????", ff: "Gamgal Sosirde" },
  companyName:      { en: "Company name", fr: "Nom de l'entreprise", pcm: "Company name", ar: "??? ??????", ff: "Innde sosirde" },
  registrationNo:   { en: "Registration no.", fr: "Numéro d'immatriculation", pcm: "Reg number", ar: "??? ???????", ff: "Nimero" },
  address:          { en: "Address", fr: "Adresse", pcm: "Address", ar: "???????", ff: "?o Woni" },
  phone:            { en: "Phone", fr: "Téléphone", pcm: "Phone", ar: "??????", ff: "Telefon" },
  email:            { en: "Email", fr: "E-mail", pcm: "Email", ar: "?????? ??????????", ff: "Email" },
  website:          { en: "Website", fr: "Site web", pcm: "Website", ar: "?????? ??????????", ff: "Laa?al" },
  established:      { en: "Established", fr: "Créé en", pcm: "Founded", ar: "?????", ff: "Fu?daa" },
  industry:         { en: "Industry", fr: "Secteur", pcm: "Industry", ar: "??????", ff: "Golle" },
  employees:        { en: "Employees", fr: "Employés", pcm: "Workers", ar: "????????", ff: "Gollooji" },
  verified:         { en: "Verified company", fr: "Entreprise vérifiée", pcm: "Verified company", ar: "???? ?????", ff: "Sosirde ja??aama" },

  // -- HELP CENTER PAGE ---------------------------------------------------------
  helpCenter:       { en: "Help Center", fr: "Centre d'aide", pcm: "Help Center", ar: "???? ????????", ff: "Laa?al Ballal" },
  helpCenterDesc:   { en: "Find answers to your questions", fr: "Trouvez des réponses à vos questions", pcm: "Find answers here", ar: "???? ?? ?????? ???????", ff: "Yiy jaabaaji ?a??aajamee" },
  faq:              { en: "Frequently asked questions", fr: "Questions fréquemment posées", pcm: "FAQ", ar: "??????? ???????", ff: "?a??aaje heew?e" },
  gettingStarted:   { en: "Getting started", fr: "Démarrer", pcm: "How to start", ar: "?????", ff: "Fu??ude" },
  accountHelp:      { en: "Account & Profile", fr: "Compte & Profil", pcm: "Account and Profile", ar: "?????? ?????? ??????", ff: "Askon e Gamgal" },
  buyingHelp:       { en: "Buying & Selling", fr: "Achat & Vente", pcm: "Buying and Selling", ar: "?????? ??????", ff: "Soodde e Yo?de" },
  paymentHelp:      { en: "Payments", fr: "Paiements", pcm: "Payments", ar: "?????????", ff: "Yo?de ceede" },
  safetyHelp:       { en: "Safety & Scams", fr: "Sécurité & Arnaques", pcm: "Safety and Scams", ar: "?????? ?????????", ff: "Kisinaare e Fenaande" },
  technicalHelp:    { en: "Technical issues", fr: "Problèmes techniques", pcm: "Technical problems", ar: "???????? ???????", ff: "Tuma jii?i" },
  searchHelp:       { en: "Search help", fr: "Aide à la recherche", pcm: "Search help", ar: "?????? ?????", ff: "Ballal yiylaade" },
  wasHelpful:       { en: "Was this helpful?", fr: "Cela vous a-t-il aidé?", pcm: "E help you?", ar: "?? ??? ??? ???????", ff: "?on ballii?" },
  stillNeedHelp:    { en: "Still need help? Contact support", fr: "Besoin d'aide? Contactez le support", pcm: "You still need help? Contact us", ar: "?? ???? ????? ????????? ????? ?? ?????", ff: "E wa?ii? ?an ballal" },

  // -- CONTACT SUPPORT PAGE -----------------------------------------------------
  contactSupport:   { en: "Contact Support", fr: "Contacter le Support", pcm: "Contact Support", ar: "??????? ?? ?????", ff: "?an Ballal" },
  contactSupportDesc:{ en: "We're here to help — reach out anytime", fr: "Nous sommes là pour vous aider — contactez-nous à tout moment", pcm: "We dey here to help you anytime", ar: "??? ??? ???????? — ????? ???? ?? ?? ???", ff: "Min ?oo e ballugol — ?an saa'i fof" },
  yourName:         { en: "Your name", fr: "Votre nom", pcm: "Your name", ar: "????", ff: "Innde maa" },
  yourEmail:        { en: "Your email", fr: "Votre e-mail", pcm: "Your email", ar: "????? ??????????", ff: "Email maa" },
  yourMessage:      { en: "Your message", fr: "Votre message", pcm: "Your message", ar: "??????", ff: "Haala maa" },
  subject:          { en: "Subject", fr: "Objet", pcm: "Subject", ar: "???????", ff: "Miijo" },
  sendMessage:      { en: "Send message", fr: "Envoyer le message", pcm: "Send message", ar: "????? ???????", ff: "Neldu haala" },
  messageSent:      { en: "Message sent! We'll reply within 24 hours.", fr: "Message envoyé! Nous répondrons dans 24 heures.", pcm: "Message don go! We go reply within 24 hours.", ar: "?? ????? ???????! ???? ???? 24 ????.", ff: "Haala neldiima! Min yettotoo e sahaa 24." },
  liveChat:         { en: "Live chat", fr: "Chat en direct", pcm: "Live chat", ar: "???????? ????????", ff: "Haala hannde" },
  responseTime:     { en: "Average response time: under 2 hours", fr: "Délai de réponse moyen: moins de 2 heures", pcm: "We usually reply in 2 hours", ar: "??? ????????? ???????: ??? ?? ??????", ff: "Yettotoo ko ?uri 2 saate" },

  // -- SAFETY & SECURITY PAGE ---------------------------------------------------
  safetySecurity:   { en: "Safety & Security", fr: "Sécurité", pcm: "Safety & Security", ar: "?????? ????????", ff: "Kisinaare" },
  safetyDesc:       { en: "Your safety is our top priority", fr: "Votre sécurité est notre priorité absolue", pcm: "Your safety na our priority", ar: "?????? ?? ???????? ??????", ff: "Kisinaare maa ko wa?i fof" },
  avoidScams:       { en: "How to avoid scams", fr: "Comment éviter les arnaques", pcm: "How to no fall for scam", ar: "????? ???? ????????", ff: "No ha?mi fenaande" },
  reportScam:       { en: "Report a scam", fr: "Signaler une arnaque", pcm: "Report scam", ar: "??????? ?? ????? ??????", ff: "Haald fenaande" },
  securePayments:   { en: "Secure payment tips", fr: "Conseils de paiement sécurisé", pcm: "How to pay safe", ar: "????? ????? ?????", ff: "Yo?de kisinaare" },
  doNotShare:       { en: "Never share your PIN or password", fr: "Ne partagez jamais votre PIN ou mot de passe", pcm: "Never share your PIN or password", ar: "?? ????? ????? ??? ??????? ?????? ?? ???? ??????", ff: "Wayaa wadande PIN maa walla dandal" },
  trustBadge:       { en: "Bambeh trust badge", fr: "Badge de confiance Bambeh", pcm: "Bambeh trust badge", ar: "???? ????? ?? ??????", ff: "Kuccam njilmoyam Bambeh" },
  twoFactor:        { en: "Two-factor authentication", fr: "Authentification à deux facteurs", pcm: "Two-factor authentication", ar: "???????? ????????", ff: "Damal ?i?i" },
  blockedUsers:     { en: "Blocked users", fr: "Utilisateurs bloqués", pcm: "Blocked users", ar: "?????????? ?????????", ff: "?e ha?taa" },
  safetyTip:        { en: "Safety tip:", fr: "Conseil de sécurité:", pcm: "Safety tip:", ar: ":????? ????", ff: "Miijo kisinaare:" },
  safetyText:       { en: "Always meet in a public place and inform someone of your plans.", fr: "Rencontrez toujours dans un lieu public et informez quelqu'un de vos plans.", pcm: "Always meet for public place and tell somebody your plans.", ar: "????? ?????? ?? ???? ??? ????? ????? ?? ?????.", ff: "Meetir ko e ?o ngoodi fof, min haaldo yi??o maa." },

  // -- TERMS OF SERVICE PAGE ----------------------------------------------------
  termsTitle:       { en: "Terms & Conditions", fr: "Conditions Générales d'Utilisation", pcm: "Terms and Conditions", ar: "?????? ????????", ff: "Sar?iiji e Golle" },
  termsDesc:        { en: "Please read these terms carefully before using Bambeh", fr: "Veuillez lire attentivement ces conditions avant d'utiliser Bambeh", pcm: "Read this before you use Bambeh", ar: "???? ????? ??? ?????? ?????? ??? ??????? ??????", ff: "Jan ?ee sar?iiji ?uri wa?ugol Bambeh" },
  lastUpdated:      { en: "Last updated", fr: "Dernière mise à jour", pcm: "Last updated", ar: "??? ?????", ff: "Fotnodaa ?enndi" },
  acceptTerms:      { en: "I accept the terms", fr: "J'accepte les conditions", pcm: "I accept am", ar: "???? ??????", ff: "Ja?mii sar?iiji" },
  tableOfContents:  { en: "Table of contents", fr: "Table des matières", pcm: "Table of contents", ar: "???? ?????????", ff: "Listu kaa?e" },
  userObligations:  { en: "User obligations", fr: "Obligations de l'utilisateur", pcm: "Your obligations", ar: "???????? ????????", ff: "Ko gollooje" },
  prohibitedContent:{ en: "Prohibited content", fr: "Contenu interdit", pcm: "What no dey allowed", ar: "??????? ???????", ff: "Ko ha?aa" },
  disclaimer:       { en: "Disclaimer", fr: "Avertissement", pcm: "Disclaimer", ar: "????? ???????", ff: "Tiitoonde" },
  governingLaw:     { en: "Governing law", fr: "Droit applicable", pcm: "Governing law", ar: "??????? ??????", ff: "Laawol ke?tinaa?o" },

  // -- PRIVACY POLICY PAGE ------------------------------------------------------
  privacyTitle:     { en: "Privacy Policy", fr: "Politique de confidentialité", pcm: "Privacy Policy", ar: "????? ????????", ff: "Sar?i Gaasooji" },
  privacyDesc:      { en: "How BAMBEH SARL collects and uses your data", fr: "Comment BAMBEH SARL collecte et utilise vos données", pcm: "How Bambeh uses your data", ar: "????? ??? ?????? ???????? ??????????", ff: "No Bambeh wa?i ?atum maa" },
  dataCollected:    { en: "Data we collect", fr: "Données que nous collectons", pcm: "Data we dey collect", ar: "???????? ???? ??????", ff: "?atum min ho?taa" },
  howWeUseData:     { en: "How we use your data", fr: "Comment nous utilisons vos données", pcm: "How we use your data", ar: "????? ????????? ????????", ff: "No wa?mi ?atum maa" },
  dataSharing:      { en: "Data sharing", fr: "Partage des données", pcm: "Data sharing", ar: "?????? ????????", ff: "Wadande ?atum" },
  yourRights:       { en: "Your rights", fr: "Vos droits", pcm: "Your rights", ar: "?????", ff: "Hakke maa" },
  cookies:          { en: "Cookies", fr: "Cookies", pcm: "Cookies", ar: "????? ????? ????????", ff: "Cookies" },
  deleteAccount:    { en: "Delete my account", fr: "Supprimer mon compte", pcm: "Delete my account", ar: "??? ?????", ff: "Soo askon am" },
  dataDeletion:     { en: "Request data deletion", fr: "Demander la suppression des données", pcm: "Request data deletion", ar: "??? ??? ????????", ff: "?a??o sooddi ?atum" },
  privacyContact:   { en: "Privacy questions? Email", fr: "Questions sur la confidentialité? Écrivez à", pcm: "Privacy question? Email", ar: "????? ?? ????????? ???? ?????? ???", ff: "?a??aaje gaasooji? Email" },

  // -- PAYMENT UI (shared across pages) -----------------------------------------
  payWithMoMo:      { en: "Pay with Mobile Money", fr: "Payer avec Mobile Money", pcm: "Pay with Mobile Money", ar: "????? ???????? ????????", ff: "Yo?o e Mobile Money" },
  poweredBy:        { en: "Powered by CamPay · MTN MoMo & Orange Money", fr: "Propulsé par CamPay · MTN MoMo & Orange Money", pcm: "Na CamPay power am · MTN MoMo & Orange Money", ar: "????? ?? CamPay · MTN MoMo ? Orange Money", ff: "CamPay sa?ii · MTN MoMo & Orange Money" },
  mtnOrOrange:      { en: "MTN or Orange phone number", fr: "Numéro MTN ou Orange", pcm: "MTN or Orange number", ar: "??? MTN ?? Orange", ff: "Nimero MTN walla Orange" },
  ussdPrompt:       { en: "You will receive a USSD prompt to confirm", fr: "Vous recevrez une invite USSD pour confirmer", pcm: "You go receive USSD prompt to confirm", ar: "?????? ??? USSD ???????", ff: "E yettoyre USSD e ja?ngol" },
  confirmPay:       { en: (n: number) => `Pay ${n.toLocaleString("fr-CM")} XAF`, fr: (n: number) => `Payer ${n.toLocaleString("fr-CM")} XAF`, pcm: (n: number) => `Pay ${n.toLocaleString("fr-CM")} XAF`, ar: (n: number) => `???? ${n.toLocaleString("ar-DZ")} XAF`, ff: (n: number) => `Yo?o ${n.toLocaleString("fr-CM")} XAF` },
  sendingRequest:   { en: "Sending...", fr: "Envoi en cours...", pcm: "Dey send...", ar: "??? ???????...", ff: "Neldude..." },
  checkPhone:       { en: "Check your phone", fr: "Vérifiez votre téléphone", pcm: "Check your phone", ar: "???? ?? ?????", ff: "Yiy Telefon maa" },
  enterPin:         { en: "Enter your PIN to confirm the payment", fr: "Entrez votre PIN pour confirmer le paiement", pcm: "Enter your PIN to confirm", ar: "???? ??? ??????? ?????? ?????? ?????", ff: "Nelo PIN maa e ja?ngol" },
  waiting:          { en: (m: number, s: number) => `Waiting… ${m}:${String(s).padStart(2, "0")}`, fr: (m: number, s: number) => `En attente… ${m}:${String(s).padStart(2, "0")}`, pcm: (m: number, s: number) => `Waiting… ${m}:${String(s).padStart(2, "0")}`, ar: (m: number, s: number) => `??????… ${m}:${String(s).padStart(2, "0")}`, ff: (m: number, s: number) => `Ya?de… ${m}:${String(s).padStart(2, "0")}` },
  processing:       { en: "Processing...", fr: "Traitement en cours...", pcm: "E process...", ar: "??? ????????...", ff: "Tiiñude..." },
  paymentConfirmed: { en: "Payment confirmed!", fr: "Paiement confirmé!", pcm: "Payment don confirm!", ar: "?? ????? ?????!", ff: "Yo?de ja??ii!" },
  orderProcessed:   { en: "Your order has been processed", fr: "Votre commande a été traitée", pcm: "Your order don process", ar: "??? ?????? ????", ff: "?a??aade maa wa?aa" },
  payFailed:        { en: "Payment failed", fr: "Échec du paiement", pcm: "Payment fail", ar: "??? ?????", ff: "Yo?de fenaanii" },
  questions:        { en: "Questions?", fr: "Des questions?", pcm: "You get question?", ar: "?? ???? ??????", ff: "?a??aade fof?" },
  securedEncrypted: { en: "Secured & encrypted", fr: "Sécurisé & chiffré", pcm: "Secured and encrypted", ar: "???? ?????", ff: "Kisinaama e ?oggoodaama" },
  orderPlaced:      { en: "Order placed!", fr: "Commande passée!", pcm: "Order don place!", ar: "?? ????? ?????!", ff: "?a??aade fu?ii!" },
  payConfirmed:     { en: "Payment confirmed. Your order is on its way.", fr: "Paiement confirmé. Votre commande est en route.", pcm: "Payment confirmed. Your order dey come.", ar: "?? ????? ?????. ???? ?? ??????.", ff: "Yo?de ja??ii. ?a??aade maa arii." },
  trackOrder:       { en: "Track my order", fr: "Suivre ma commande", pcm: "Track my order", ar: "???? ????", ff: "Takk ?a??aade am" },
  keepShopping:     { en: "Keep shopping", fr: "Continuer les achats", pcm: "Continue shopping", ar: "?????? ??????", ff: "Jokko soodde" },
  addToCartBtn:     { en: "Add to cart", fr: "Ajouter au panier", pcm: "Add to cart", ar: "??? ??? ?????", ff: "Fodo e paani" },
  addedBtn:         { en: "Added!", fr: "Ajouté!", pcm: "Added!", ar: "??? ???????!", ff: "Fodaa!" },
  addedToCart:      { en: "Added to cart", fr: "Ajouté au panier", pcm: "Added to cart", ar: "??? ??????? ??? ?????", ff: "Fodaa e paani" },
  buyNow:           { en: "Buy now", fr: "Acheter maintenant", pcm: "Buy am now", ar: "????? ????", ff: "Sooddo hannde" },
  payNow:           { en: "Pay now", fr: "Payer maintenant", pcm: "Pay now", ar: "???? ????", ff: "Yo?o hannde" },
  whatsapp:         { en: "WhatsApp", fr: "WhatsApp", pcm: "WhatsApp", ar: "??????", ff: "WhatsApp" },
  call:             { en: "Call", fr: "Appeler", pcm: "Call am", ar: "?????", ff: "Nodd" },
  seller:           { en: "Seller", fr: "Vendeur", pcm: "Seller", ar: "??????", ff: "Yi??o yo?de" },
  reportListing:    { en: "Report this listing", fr: "Signaler cette annonce", pcm: "Report dis listing", ar: "??????? ?? ??? ???????", ff: "Haald gannde ?on" },

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
  if (!entry) return key; // key not found ? return raw key
  return entry[lang] ?? entry["en"] ?? key;
}


