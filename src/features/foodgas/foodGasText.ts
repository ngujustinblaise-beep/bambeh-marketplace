// BAMBEH_DEPLOY_TOKEN__FOOD_GAS_TEXT_FIX688_CLEAN
/**
 * src/features/foodgas/foodGasText.ts - FIX688
 *
 * GAS & FOOD - every word in the five app languages (English, French, Pidgin,
 * Arabic right-to-left, Fulfulde), the cities and neighbourhoods, and the small
 * helpers the pages share: "open now" in Cameroon time, prices, dates, and the
 * phone-number check (contact is Bambeh chat only).
 *
 * Launch neighbourhoods (Big, 9 Oct 2026): Up Station (Bamenda) and Mimboman
 * (Yaounde) come first; the rest of the list follows; "Other" lets an owner type
 * any neighbourhood.
 *
 * Words are written as \\u escapes on purpose, so the file stays plain ASCII.
 * Fulfulde and Pidgin are best effort - a native speaker should read them.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { Beef, Fish, Flame, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

export type FoodLang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
export type FoodKind = 'gas' | 'restaurant' | 'grill' | 'fish';
export type CityKey = 'yaounde' | 'bamenda' | 'douala' | 'limbe' | 'southwest';

export const FOOD_KINDS: readonly FoodKind[] = ['gas', 'restaurant', 'grill', 'fish'];
export const CITY_KEYS: readonly CityKey[] = ['yaounde', 'bamenda', 'douala', 'limbe', 'southwest'];

/** The app language (Bambeh_language, any spelling) as one of the five. */
export function normFoodLang(v: unknown): FoodLang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

export function foodDir(lang: FoodLang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export interface FoodStrings {
  nav: string;
  title: string;
  subtitle: string;
  searchPh: string;
  searchBtn: string;
  addBusiness: string;
  myBusinesses: string;
  kAll: string;
  k_gas: string;
  k_restaurant: string;
  k_grill: string;
  k_fish: string;
  one_gas: string;
  one_restaurant: string;
  one_grill: string;
  one_fish: string;
  city: string;
  allCities: string;
  area: string;
  allAreas: string;
  otherArea: string;
  startHere: string;
  gasTodayFilter: string;
  openNowFilter: string;
  countPlaces: string;
  countOne: string;
  featured: string;
  gasYes: string;
  gasNo: string;
  gasUnknown: string;
  openNow: string;
  closedNow: string;
  opensAt: string;
  hoursUnknown: string;
  fromPrice: string;
  emptyTitle: string;
  emptyBody: string;
  loadMore: string;
  loading: string;
  loadError: string;
  retry: string;
  clearFilters: string;
  back: string;
  share: string;
  shared: string;
  howToFind: string;
  hours: string;
  everyDay: string;
  menu: string;
  noMenu: string;
  unavailable: string;
  about: string;
  delivers: string;
  pickupOnly: string;
  chat: string;
  book: string;
  safety: string;
  notFound: string;
  yourBusiness: string;
  manage: string;
  featureIt: string;
  featuredUntil: string;
  statusPending: string;
  statusRejected: string;
  statusHiddenOwner: string;
  statusHiddenStaff: string;
  statusChanged: string;
  gasSwitchYes: string;
  gasSwitchNo: string;
  gasUpdated: string;
  chatOpening: string;
  bookTitle: string;
  bTable: string;
  bOrder: string;
  bGas: string;
  day: string;
  time: string;
  people: string;
  whatOrder: string;
  whatOrderPh: string;
  whatGas: string;
  whatGasPh: string;
  deliverMe: string;
  pickUp: string;
  note: string;
  send: string;
  sending: string;
  cancel: string;
  errTime: string;
  errPeople: string;
  errWhat: string;
  msgTable: string;
  msgOrder: string;
  msgGas: string;
  lDay: string;
  lTime: string;
  lPeople: string;
  lOrder: string;
  lGas: string;
  lNote: string;
  bookedOk: string;
  mineTitle: string;
  mineEmpty: string;
  addFirst: string;
  stPending: string;
  stLive: string;
  stRejected: string;
  stHidden: string;
  stChanged: string;
  asAgent: string;
  edit: string;
  menuEdit: string;
  hide: string;
  show: string;
  feature: string;
  openBookings: string;
  view: string;
  formNew: string;
  formEdit: string;
  whoOwns: string;
  ownMe: string;
  ownOther: string;
  ownerId: string;
  ownerHint: string;
  agentId: string;
  fName: string;
  fKinds: string;
  fDesc: string;
  fCity: string;
  fArea: string;
  fAreaOther: string;
  fLandmark: string;
  fLandmarkPh: string;
  fPhotos: string;
  addPhoto: string;
  removePhoto: string;
  uploading: string;
  fDays: string;
  fOpens: string;
  fCloses: string;
  fKeyPrice: string;
  fKeyLabel: string;
  fKeyLabelPh: string;
  fBookings: string;
  fDelivers: string;
  noPhone: string;
  save: string;
  saving: string;
  saved: string;
  sentForApproval: string;
  menuTitle: string;
  itemName: string;
  itemPrice: string;
  itemNote: string;
  itemAvail: string;
  addItem: string;
  removeItem: string;
  saveMenu: string;
  menuSaved: string;
  bkTitleOwner: string;
  bkTitleMine: string;
  bkNone: string;
  bkFrom: string;
  bkConfirm: string;
  bkDecline: string;
  bkCancel: string;
  bkOpenChat: string;
  bs_sent: string;
  bs_confirmed: string;
  bs_declined: string;
  bs_cancelled: string;
  ansConfirm: string;
  ansDecline: string;
  ansCancel: string;
  dayToday: string;
  d0: string;
  d1: string;
  d2: string;
  d3: string;
  d4: string;
  d5: string;
  d6: string;
  ftTitle: string;
  ftBody: string;
  ftDay: string;
  ftDayPrice: string;
  ftWeek: string;
  ftWeekPrice: string;
  ftMonth: string;
  ftMonthPrice: string;
  ftMin: string;
  ftPhone: string;
  ftPay: string;
  ftWaiting: string;
  ftPaid: string;
  ftFailed: string;
  ftUnderpaid: string;
  ftTimeout: string;
  ftPayErr: string;
  ftPhoneErr: string;
  close: string;
  e_not_signed_in: string;
  e_not_found: string;
  e_not_allowed: string;
  e_bad_name: string;
  e_bad_kinds: string;
  e_bad_description: string;
  e_bad_city: string;
  e_bad_area: string;
  e_bad_landmark: string;
  e_bad_photos: string;
  e_bad_open_days: string;
  e_bad_hours: string;
  e_bad_price: string;
  e_phone_in_text: string;
  e_owner_not_found: string;
  e_owner_ambiguous: string;
  e_agent_not_found: string;
  e_agent_ambiguous: string;
  e_too_many_lookups: string;
  e_owner_limit: string;
  e_daily_limit: string;
  e_bad_items: string;
  e_not_gas: string;
  e_staff_hidden: string;
  e_own_business: string;
  e_no_bookings: string;
  e_bad_kind: string;
  e_bad_time: string;
  e_bad_people: string;
  e_too_long: string;
  e_already_waiting: string;
  e_chat_failed: string;
  e_already_answered: string;
  e_bad_message: string;
  e_not_live: string;
  e_bad_plan: string;
  e_bad_days: string;
  e_too_many: string;
  e_network: string;
  e_generic: string;
  e_upload: string;
}
export type FoodKey = keyof FoodStrings;

export const FOOD_TEXT: Record<FoodLang, FoodStrings> = {
  en: {
    nav: "Gas & food",
    title: "Gas, food & grills near you",
    subtitle: "Cooking gas, restaurants, soya and roasted fish in your neighbourhood.",
    searchPh: "Search: soya, fish, 12.5 kg, a name...",
    searchBtn: "Search",
    addBusiness: "Add a business",
    myBusinesses: "My businesses",
    kAll: "All",
    k_gas: "Cooking gas",
    k_restaurant: "Restaurants",
    k_grill: "Grill & soya",
    k_fish: "Roasted fish",
    one_gas: "Cooking gas",
    one_restaurant: "Restaurant",
    one_grill: "Grill & soya",
    one_fish: "Roasted fish",
    city: "City",
    allCities: "All cities",
    area: "Neighbourhood",
    allAreas: "All neighbourhoods",
    otherArea: "Other neighbourhood",
    startHere: "Start here",
    gasTodayFilter: "Gas available today",
    openNowFilter: "Open now",
    countPlaces: "{n} places",
    countOne: "1 place",
    featured: "Featured",
    gasYes: "Gas available today",
    gasNo: "No gas today",
    gasUnknown: "Gas not confirmed today",
    openNow: "Open now",
    closedNow: "Closed now",
    opensAt: "Opens at {t}",
    hoursUnknown: "Hours not given",
    fromPrice: "{n} XAF",
    emptyTitle: "No business listed here yet",
    emptyBody: "Know a good gas seller, restaurant or soya spot? Add it - it is free.",
    loadMore: "Show more",
    loading: "Loading...",
    loadError: "Could not load. Check your connection and try again.",
    retry: "Try again",
    clearFilters: "Clear filters",
    back: "Back",
    share: "Share",
    shared: "Link copied. Paste it anywhere.",
    howToFind: "How to find it",
    hours: "Opening hours",
    everyDay: "Every day",
    menu: "Menu and prices",
    noMenu: "No prices listed yet. Ask in the chat.",
    unavailable: "Not available now",
    about: "About",
    delivers: "Delivers",
    pickupOnly: "Pick-up on site",
    chat: "Chat",
    book: "Book",
    safety: "Keep your talks in Bambeh chat. Bambeh never asks for your PIN or a secret code.",
    notFound: "This business is not available.",
    yourBusiness: "This is your business",
    manage: "Manage",
    featureIt: "Feature it at the top",
    featuredUntil: "Featured until {d}",
    statusPending: "Waiting for approval by Bambeh staff. Buyers will see it once approved.",
    statusRejected: "Not approved: {r}",
    statusHiddenOwner: "Hidden. Buyers cannot see it.",
    statusHiddenStaff: "Hidden by Bambeh staff: {r}",
    statusChanged: "Your last changes will be checked by Bambeh staff. It stays visible.",
    gasSwitchYes: "I have gas today",
    gasSwitchNo: "No gas today",
    gasUpdated: "Updated {t}",
    chatOpening: "Opening the chat...",
    bookTitle: "Book with {name}",
    bTable: "Book a table",
    bOrder: "Order ahead",
    bGas: "Reserve a gas refill",
    day: "Day",
    time: "Time",
    people: "Number of people",
    whatOrder: "What do you want?",
    whatOrderPh: "e.g. 2 roasted fish, 1 plate of soya",
    whatGas: "Bottle size and brand",
    whatGasPh: "e.g. 12.5 kg refill",
    deliverMe: "Deliver to me",
    pickUp: "I will pick it up",
    note: "Note for the business (optional)",
    send: "Send the booking",
    sending: "Sending...",
    cancel: "Cancel",
    errTime: "Choose a day and a time from now on.",
    errPeople: "Say how many people.",
    errWhat: "Say what you want.",
    msgTable: "Table booking - {name}",
    msgOrder: "Order ahead - {name}",
    msgGas: "Gas reservation - {name}",
    lDay: "Day",
    lTime: "Time",
    lPeople: "People",
    lOrder: "Order",
    lGas: "Gas",
    lNote: "Note",
    bookedOk: "Booking sent. The answer comes in your chat.",
    mineTitle: "My businesses",
    mineEmpty: "You have no business on Bambeh yet.",
    addFirst: "Add your business - it is free",
    stPending: "Waiting for approval",
    stLive: "Live",
    stRejected: "Not approved",
    stHidden: "Hidden",
    stChanged: "Changes being checked",
    asAgent: "Added by you for {name}",
    edit: "Edit",
    menuEdit: "Menu and prices",
    hide: "Hide",
    show: "Show again",
    feature: "Feature",
    openBookings: "{n} new bookings",
    view: "View",
    formNew: "Add a business",
    formEdit: "Edit the business",
    whoOwns: "Who owns this business?",
    ownMe: "I own it",
    ownOther: "Someone else - I am a Bambeh agent",
    ownerId: "Owner\u2019s Bambeh phone number or email",
    ownerHint: "The owner needs a Bambeh account: chats and bookings go to them.",
    agentId: "Helped by a Bambeh agent? Their phone or email (optional)",
    fName: "Business name",
    fKinds: "What do you sell?",
    fDesc: "Describe it: what you sell, prices, specials",
    fCity: "City",
    fArea: "Neighbourhood",
    fAreaOther: "Type the neighbourhood",
    fLandmark: "How to find it (a landmark)",
    fLandmarkPh: "e.g. Behind the Total station, next to the pharmacy",
    fPhotos: "Photos (up to 6)",
    addPhoto: "Add a photo",
    removePhoto: "Remove",
    uploading: "Uploading...",
    fDays: "Open days",
    fOpens: "Opens at",
    fCloses: "Closes at",
    fKeyPrice: "Main price (XAF)",
    fKeyLabel: "For what?",
    fKeyLabelPh: "e.g. 12.5 kg refill, plate of soya",
    fBookings: "Accept bookings",
    fDelivers: "We deliver",
    noPhone: "Do not write any phone number: buyers reach you by Bambeh chat.",
    save: "Save",
    saving: "Saving...",
    saved: "Saved.",
    sentForApproval: "Sent to Bambeh staff for approval. You can add your menu now.",
    menuTitle: "Menu and prices",
    itemName: "Item",
    itemPrice: "Price (XAF)",
    itemNote: "Detail",
    itemAvail: "Available",
    addItem: "Add a line",
    removeItem: "Remove",
    saveMenu: "Save the menu",
    menuSaved: "Menu saved.",
    bkTitleOwner: "Bookings for your businesses",
    bkTitleMine: "My bookings",
    bkNone: "No bookings yet.",
    bkFrom: "From {name}",
    bkConfirm: "Confirm",
    bkDecline: "Decline",
    bkCancel: "Cancel the booking",
    bkOpenChat: "Open chat",
    bs_sent: "Waiting for an answer",
    bs_confirmed: "Confirmed",
    bs_declined: "Declined",
    bs_cancelled: "Cancelled",
    ansConfirm: "Your booking is confirmed: {when}. See you soon!",
    ansDecline: "Sorry, we cannot take this booking ({when}). Write to us here to find another time.",
    ansCancel: "I am cancelling my booking ({when}). Sorry for that.",
    dayToday: "Today",
    d0: "Sun",
    d1: "Mon",
    d2: "Tue",
    d3: "Wed",
    d4: "Thu",
    d5: "Fri",
    d6: "Sat",
    ftTitle: "Feature at the top of {area}",
    ftBody: "Your business shows first in {area}, with a Featured badge. It stops by itself at the end.",
    ftDay: "Days",
    ftDayPrice: "50 XAF a day (2 to 5 days)",
    ftWeek: "One week",
    ftWeekPrice: "300 XAF",
    ftMonth: "One month",
    ftMonthPrice: "1,000 XAF",
    ftMin: "Mobile money cannot take less than 100 XAF, so the shortest is 2 days.",
    ftPhone: "Mobile money number (MTN or Orange)",
    ftPay: "Pay {n} XAF",
    ftWaiting: "Approve the payment on your phone. If no prompt comes, open your mobile money menu and approve the pending payment.",
    ftPaid: "Paid. Featured until {d}.",
    ftFailed: "The payment did not go through. Nothing was taken.",
    ftUnderpaid: "We received less than the price. Bambeh staff will contact you in chat.",
    ftTimeout: "Still waiting for mobile money. It switches on by itself as soon as the payment arrives.",
    ftPayErr: "The payment could not start: {e}",
    ftPhoneErr: "Enter an MTN or Orange number (9 digits).",
    close: "Close",
    e_not_signed_in: "Sign in first.",
    e_not_found: "This business is not available.",
    e_not_allowed: "You cannot change this business.",
    e_bad_name: "Give the business a name (2 to 80 letters).",
    e_bad_kinds: "Choose at least one: gas, restaurant, grill & soya or roasted fish.",
    e_bad_description: "The description is too long (800 letters at most).",
    e_bad_city: "Choose the city.",
    e_bad_area: "Choose or type the neighbourhood.",
    e_bad_landmark: "The landmark is too long (160 letters at most).",
    e_bad_photos: "One of the photos could not be used. Remove it and add it again.",
    e_bad_open_days: "Choose the open days.",
    e_bad_hours: "Give both the opening and closing time, or neither.",
    e_bad_price: "Check the prices (from 25 to 1,000,000 XAF).",
    e_phone_in_text: "Remove the phone number or chat link: buyers reach you by Bambeh chat.",
    e_owner_not_found: "No Bambeh account uses this number or email. Help the owner sign up first.",
    e_owner_ambiguous: "More than one account matches. Use the owner\u2019s email instead.",
    e_agent_not_found: "No Bambeh account uses the agent\u2019s number or email.",
    e_agent_ambiguous: "More than one account matches the agent. Use their email.",
    e_too_many_lookups: "Too many tries with phone numbers. Wait an hour, then try again.",
    e_owner_limit: "This owner already has 5 businesses on Bambeh.",
    e_daily_limit: "Too many today. Try again tomorrow.",
    e_bad_items: "Check the menu lines (a name of 2 to 60 letters, 40 lines at most).",
    e_not_gas: "Only gas sellers have this switch.",
    e_staff_hidden: "Bambeh staff hid this business. Write to Bambeh support to show it again.",
    e_own_business: "This is your own business.",
    e_no_bookings: "This business does not take bookings.",
    e_bad_kind: "This business does not take this kind of booking.",
    e_bad_time: "Choose a day and a time from now on (30 days at most).",
    e_bad_people: "Say how many people (1 to 50).",
    e_too_long: "The text is too long.",
    e_already_waiting: "You already have bookings waiting with this business. Wait for the answer in chat.",
    e_chat_failed: "The chat could not open. Try again.",
    e_already_answered: "This booking was already answered.",
    e_bad_message: "Write a short message.",
    e_not_live: "The business must be approved before it can be featured.",
    e_bad_plan: "Choose a plan.",
    e_bad_days: "Choose from 2 to 5 days.",
    e_too_many: "Too many payment tries. Wait a little and try again.",
    e_network: "No connection. Check your internet and try again.",
    e_generic: "Something went wrong. Try again.",
    e_upload: "The photo could not be uploaded. Try again.",
  },
  fr: {
    nav: "Gaz & resto",
    title: "Gaz, restos et grillades pr\u00e8s de chez vous",
    subtitle: "Gaz domestique, restaurants, soya et poisson brais\u00e9 dans votre quartier.",
    searchPh: "Rechercher : soya, poisson, 12,5 kg, un nom...",
    searchBtn: "Rechercher",
    addBusiness: "Ajouter un commerce",
    myBusinesses: "Mes commerces",
    kAll: "Tout",
    k_gas: "Gaz domestique",
    k_restaurant: "Restaurants",
    k_grill: "Grillades & soya",
    k_fish: "Poisson brais\u00e9",
    one_gas: "Gaz domestique",
    one_restaurant: "Restaurant",
    one_grill: "Grillades & soya",
    one_fish: "Poisson brais\u00e9",
    city: "Ville",
    allCities: "Toutes les villes",
    area: "Quartier",
    allAreas: "Tous les quartiers",
    otherArea: "Autre quartier",
    startHere: "Commencez ici",
    gasTodayFilter: "Gaz disponible aujourd\u2019hui",
    openNowFilter: "Ouvert maintenant",
    countPlaces: "{n} adresses",
    countOne: "1 adresse",
    featured: "\u00c0 la une",
    gasYes: "Gaz disponible aujourd\u2019hui",
    gasNo: "Pas de gaz aujourd\u2019hui",
    gasUnknown: "Gaz non confirm\u00e9 aujourd\u2019hui",
    openNow: "Ouvert maintenant",
    closedNow: "Ferm\u00e9 maintenant",
    opensAt: "Ouvre \u00e0 {t}",
    hoursUnknown: "Horaires non indiqu\u00e9s",
    fromPrice: "{n} XAF",
    emptyTitle: "Aucun commerce ici pour le moment",
    emptyBody: "Vous connaissez un bon vendeur de gaz, un restaurant ou un coin soya ? Ajoutez-le, c\u2019est gratuit.",
    loadMore: "Voir plus",
    loading: "Chargement...",
    loadError: "Chargement impossible. V\u00e9rifiez votre connexion et r\u00e9essayez.",
    retry: "R\u00e9essayer",
    clearFilters: "Effacer les filtres",
    back: "Retour",
    share: "Partager",
    shared: "Lien copi\u00e9. Collez-le o\u00f9 vous voulez.",
    howToFind: "Comment s\u2019y rendre",
    hours: "Horaires",
    everyDay: "Tous les jours",
    menu: "Menu et prix",
    noMenu: "Aucun prix indiqu\u00e9 pour le moment. Demandez dans le chat.",
    unavailable: "Indisponible pour le moment",
    about: "\u00c0 propos",
    delivers: "Livre \u00e0 domicile",
    pickupOnly: "\u00c0 retirer sur place",
    chat: "Discuter",
    book: "R\u00e9server",
    safety: "Gardez vos \u00e9changes dans le chat Bambeh. Bambeh ne demande jamais votre code PIN ni un code secret.",
    notFound: "Ce commerce n\u2019est pas disponible.",
    yourBusiness: "C\u2019est votre commerce",
    manage: "G\u00e9rer",
    featureIt: "Le mettre \u00e0 la une",
    featuredUntil: "\u00c0 la une jusqu\u2019au {d}",
    statusPending: "En attente de validation par l\u2019\u00e9quipe Bambeh. Les clients le verront une fois valid\u00e9.",
    statusRejected: "Non valid\u00e9 : {r}",
    statusHiddenOwner: "Masqu\u00e9. Les clients ne le voient pas.",
    statusHiddenStaff: "Masqu\u00e9 par l\u2019\u00e9quipe Bambeh : {r}",
    statusChanged: "Vos derni\u00e8res modifications seront v\u00e9rifi\u00e9es par l\u2019\u00e9quipe Bambeh. Il reste visible.",
    gasSwitchYes: "J\u2019ai du gaz aujourd\u2019hui",
    gasSwitchNo: "Pas de gaz aujourd\u2019hui",
    gasUpdated: "Mis \u00e0 jour {t}",
    chatOpening: "Ouverture du chat...",
    bookTitle: "R\u00e9server chez {name}",
    bTable: "R\u00e9server une table",
    bOrder: "Commander \u00e0 l\u2019avance",
    bGas: "R\u00e9server une recharge de gaz",
    day: "Jour",
    time: "Heure",
    people: "Nombre de personnes",
    whatOrder: "Que voulez-vous ?",
    whatOrderPh: "ex. 2 poissons brais\u00e9s, 1 assiette de soya",
    whatGas: "Taille et marque de la bouteille",
    whatGasPh: "ex. recharge 12,5 kg",
    deliverMe: "Livrez-moi",
    pickUp: "Je viens le chercher",
    note: "Note pour le commerce (facultatif)",
    send: "Envoyer la r\u00e9servation",
    sending: "Envoi...",
    cancel: "Annuler",
    errTime: "Choisissez un jour et une heure \u00e0 partir de maintenant.",
    errPeople: "Indiquez le nombre de personnes.",
    errWhat: "Indiquez ce que vous voulez.",
    msgTable: "R\u00e9servation de table - {name}",
    msgOrder: "Commande \u00e0 l\u2019avance - {name}",
    msgGas: "R\u00e9servation de gaz - {name}",
    lDay: "Jour",
    lTime: "Heure",
    lPeople: "Personnes",
    lOrder: "Commande",
    lGas: "Gaz",
    lNote: "Note",
    bookedOk: "R\u00e9servation envoy\u00e9e. La r\u00e9ponse arrive dans votre chat.",
    mineTitle: "Mes commerces",
    mineEmpty: "Vous n\u2019avez encore aucun commerce sur Bambeh.",
    addFirst: "Ajoutez votre commerce, c\u2019est gratuit",
    stPending: "En attente de validation",
    stLive: "En ligne",
    stRejected: "Non valid\u00e9",
    stHidden: "Masqu\u00e9",
    stChanged: "Modifications en v\u00e9rification",
    asAgent: "Ajout\u00e9 par vous pour {name}",
    edit: "Modifier",
    menuEdit: "Menu et prix",
    hide: "Masquer",
    show: "Afficher \u00e0 nouveau",
    feature: "Mettre \u00e0 la une",
    openBookings: "{n} nouvelles r\u00e9servations",
    view: "Voir",
    formNew: "Ajouter un commerce",
    formEdit: "Modifier le commerce",
    whoOwns: "\u00c0 qui appartient ce commerce ?",
    ownMe: "C\u2019est le mien",
    ownOther: "Quelqu\u2019un d\u2019autre - je suis agent Bambeh",
    ownerId: "Num\u00e9ro ou e-mail Bambeh du propri\u00e9taire",
    ownerHint: "Le propri\u00e9taire doit avoir un compte Bambeh : les messages et r\u00e9servations lui arrivent.",
    agentId: "Aid\u00e9 par un agent Bambeh ? Son num\u00e9ro ou e-mail (facultatif)",
    fName: "Nom du commerce",
    fKinds: "Que vendez-vous ?",
    fDesc: "D\u00e9crivez-le : ce que vous vendez, prix, sp\u00e9cialit\u00e9s",
    fCity: "Ville",
    fArea: "Quartier",
    fAreaOther: "Saisissez le quartier",
    fLandmark: "Comment le trouver (un rep\u00e8re)",
    fLandmarkPh: "ex. Derri\u00e8re la station Total, \u00e0 c\u00f4t\u00e9 de la pharmacie",
    fPhotos: "Photos (jusqu\u2019\u00e0 6)",
    addPhoto: "Ajouter une photo",
    removePhoto: "Retirer",
    uploading: "Envoi...",
    fDays: "Jours d\u2019ouverture",
    fOpens: "Ouvre \u00e0",
    fCloses: "Ferme \u00e0",
    fKeyPrice: "Prix principal (XAF)",
    fKeyLabel: "Pour quoi ?",
    fKeyLabelPh: "ex. recharge 12,5 kg, assiette de soya",
    fBookings: "Accepter les r\u00e9servations",
    fDelivers: "Nous livrons",
    noPhone: "N\u2019\u00e9crivez aucun num\u00e9ro de t\u00e9l\u00e9phone : les clients vous joignent par le chat Bambeh.",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Enregistr\u00e9.",
    sentForApproval: "Envoy\u00e9 \u00e0 l\u2019\u00e9quipe Bambeh pour validation. Vous pouvez ajouter votre menu maintenant.",
    menuTitle: "Menu et prix",
    itemName: "Article",
    itemPrice: "Prix (XAF)",
    itemNote: "D\u00e9tail",
    itemAvail: "Disponible",
    addItem: "Ajouter une ligne",
    removeItem: "Retirer",
    saveMenu: "Enregistrer le menu",
    menuSaved: "Menu enregistr\u00e9.",
    bkTitleOwner: "R\u00e9servations pour vos commerces",
    bkTitleMine: "Mes r\u00e9servations",
    bkNone: "Aucune r\u00e9servation pour le moment.",
    bkFrom: "De {name}",
    bkConfirm: "Confirmer",
    bkDecline: "Refuser",
    bkCancel: "Annuler la r\u00e9servation",
    bkOpenChat: "Ouvrir le chat",
    bs_sent: "En attente de r\u00e9ponse",
    bs_confirmed: "Confirm\u00e9e",
    bs_declined: "Refus\u00e9e",
    bs_cancelled: "Annul\u00e9e",
    ansConfirm: "Votre r\u00e9servation est confirm\u00e9e : {when}. \u00c0 bient\u00f4t !",
    ansDecline: "D\u00e9sol\u00e9, nous ne pouvons pas prendre cette r\u00e9servation ({when}). \u00c9crivez-nous ici pour trouver un autre moment.",
    ansCancel: "J\u2019annule ma r\u00e9servation ({when}). D\u00e9sol\u00e9.",
    dayToday: "Aujourd\u2019hui",
    d0: "dim.",
    d1: "lun.",
    d2: "mar.",
    d3: "mer.",
    d4: "jeu.",
    d5: "ven.",
    d6: "sam.",
    ftTitle: "\u00c0 la une en t\u00eate de {area}",
    ftBody: "Votre commerce appara\u00eet en premier \u00e0 {area}, avec le badge \u00ab \u00c0 la une \u00bb. Cela s\u2019arr\u00eate tout seul \u00e0 la fin.",
    ftDay: "Jours",
    ftDayPrice: "50 XAF par jour (2 \u00e0 5 jours)",
    ftWeek: "Une semaine",
    ftWeekPrice: "300 XAF",
    ftMonth: "Un mois",
    ftMonthPrice: "1 000 XAF",
    ftMin: "Le mobile money ne prend pas moins de 100 XAF : la dur\u00e9e minimale est donc de 2 jours.",
    ftPhone: "Num\u00e9ro mobile money (MTN ou Orange)",
    ftPay: "Payer {n} XAF",
    ftWaiting: "Validez le paiement sur votre t\u00e9l\u00e9phone. Si rien ne s\u2019affiche, ouvrez le menu mobile money et validez le paiement en attente.",
    ftPaid: "Pay\u00e9. \u00c0 la une jusqu\u2019au {d}.",
    ftFailed: "Le paiement n\u2019a pas abouti. Rien n\u2019a \u00e9t\u00e9 pr\u00e9lev\u00e9.",
    ftUnderpaid: "Nous avons re\u00e7u moins que le prix. L\u2019\u00e9quipe Bambeh vous contactera dans le chat.",
    ftTimeout: "Toujours en attente du mobile money. Cela s\u2019active tout seul d\u00e8s que le paiement arrive.",
    ftPayErr: "Le paiement n\u2019a pas pu d\u00e9marrer : {e}",
    ftPhoneErr: "Saisissez un num\u00e9ro MTN ou Orange (9 chiffres).",
    close: "Fermer",
    e_not_signed_in: "Connectez-vous d\u2019abord.",
    e_not_found: "Ce commerce n\u2019est pas disponible.",
    e_not_allowed: "Vous ne pouvez pas modifier ce commerce.",
    e_bad_name: "Donnez un nom au commerce (2 \u00e0 80 lettres).",
    e_bad_kinds: "Choisissez au moins un : gaz, restaurant, grillades & soya ou poisson brais\u00e9.",
    e_bad_description: "La description est trop longue (800 lettres au plus).",
    e_bad_city: "Choisissez la ville.",
    e_bad_area: "Choisissez ou saisissez le quartier.",
    e_bad_landmark: "Le rep\u00e8re est trop long (160 lettres au plus).",
    e_bad_photos: "Une des photos est inutilisable. Retirez-la et ajoutez-la \u00e0 nouveau.",
    e_bad_open_days: "Choisissez les jours d\u2019ouverture.",
    e_bad_hours: "Indiquez l\u2019heure d\u2019ouverture et de fermeture, ou aucune des deux.",
    e_bad_price: "V\u00e9rifiez les prix (de 25 \u00e0 1 000 000 XAF).",
    e_phone_in_text: "Retirez le num\u00e9ro de t\u00e9l\u00e9phone ou le lien de messagerie : les clients vous joignent par le chat Bambeh.",
    e_owner_not_found: "Aucun compte Bambeh n\u2019utilise ce num\u00e9ro ou cet e-mail. Aidez d\u2019abord le propri\u00e9taire \u00e0 s\u2019inscrire.",
    e_owner_ambiguous: "Plusieurs comptes correspondent. Utilisez plut\u00f4t l\u2019e-mail du propri\u00e9taire.",
    e_agent_not_found: "Aucun compte Bambeh n\u2019utilise le num\u00e9ro ou l\u2019e-mail de l\u2019agent.",
    e_agent_ambiguous: "Plusieurs comptes correspondent \u00e0 l\u2019agent. Utilisez son e-mail.",
    e_too_many_lookups: "Trop d\u2019essais de num\u00e9ros. Attendez une heure, puis r\u00e9essayez.",
    e_owner_limit: "Ce propri\u00e9taire a d\u00e9j\u00e0 5 commerces sur Bambeh.",
    e_daily_limit: "Trop pour aujourd\u2019hui. R\u00e9essayez demain.",
    e_bad_items: "V\u00e9rifiez les lignes du menu (un nom de 2 \u00e0 60 lettres, 40 lignes au plus).",
    e_not_gas: "Seuls les vendeurs de gaz ont ce bouton.",
    e_staff_hidden: "L\u2019\u00e9quipe Bambeh a masqu\u00e9 ce commerce. \u00c9crivez au support Bambeh pour le r\u00e9afficher.",
    e_own_business: "C\u2019est votre propre commerce.",
    e_no_bookings: "Ce commerce ne prend pas de r\u00e9servations.",
    e_bad_kind: "Ce commerce ne prend pas ce type de r\u00e9servation.",
    e_bad_time: "Choisissez un jour et une heure \u00e0 partir de maintenant (30 jours au plus).",
    e_bad_people: "Indiquez le nombre de personnes (1 \u00e0 50).",
    e_too_long: "Le texte est trop long.",
    e_already_waiting: "Vous avez d\u00e9j\u00e0 des r\u00e9servations en attente chez ce commerce. Attendez la r\u00e9ponse dans le chat.",
    e_chat_failed: "Le chat n\u2019a pas pu s\u2019ouvrir. R\u00e9essayez.",
    e_already_answered: "Cette r\u00e9servation a d\u00e9j\u00e0 re\u00e7u une r\u00e9ponse.",
    e_bad_message: "\u00c9crivez un court message.",
    e_not_live: "Le commerce doit \u00eatre valid\u00e9 avant d\u2019\u00eatre mis \u00e0 la une.",
    e_bad_plan: "Choisissez une formule.",
    e_bad_days: "Choisissez de 2 \u00e0 5 jours.",
    e_too_many: "Trop de tentatives de paiement. Patientez un peu et r\u00e9essayez.",
    e_network: "Pas de connexion. V\u00e9rifiez votre internet et r\u00e9essayez.",
    e_generic: "Un probl\u00e8me est survenu. R\u00e9essayez.",
    e_upload: "La photo n\u2019a pas pu \u00eatre envoy\u00e9e. R\u00e9essayez.",
  },
  pidgin: {
    nav: "Gas & chop",
    title: "Gas, chop and grill near you",
    subtitle: "Cooking gas, chop house, soya and roast fish for your quarter.",
    searchPh: "Find: soya, fish, 12.5 kg, one name...",
    searchBtn: "Find",
    addBusiness: "Add your business",
    myBusinesses: "My business dem",
    kAll: "All",
    k_gas: "Cooking gas",
    k_restaurant: "Chop house",
    k_grill: "Grill & soya",
    k_fish: "Roast fish",
    one_gas: "Cooking gas",
    one_restaurant: "Chop house",
    one_grill: "Grill & soya",
    one_fish: "Roast fish",
    city: "Town",
    allCities: "All the towns",
    area: "Quarter",
    allAreas: "All the quarters",
    otherArea: "Another quarter",
    startHere: "Start here",
    gasTodayFilter: "Gas dey today",
    openNowFilter: "Open now",
    countPlaces: "{n} places",
    countOne: "1 place",
    featured: "For top",
    gasYes: "Gas dey today",
    gasNo: "Gas no dey today",
    gasUnknown: "Dem never confirm gas today",
    openNow: "Open now",
    closedNow: "E don close now",
    opensAt: "E go open for {t}",
    hoursUnknown: "Dem no give the time",
    fromPrice: "{n} XAF",
    emptyTitle: "No business dey here yet",
    emptyBody: "You sabi one fine gas seller, chop house or soya spot? Add am - e free.",
    loadMore: "Show more",
    loading: "E dey load...",
    loadError: "E no fit load. Check your connection and try again.",
    retry: "Try again",
    clearFilters: "Clear the filter dem",
    back: "Go back",
    share: "Share",
    shared: "Link don copy. Paste am anywhere.",
    howToFind: "How to find am",
    hours: "Open time",
    everyDay: "Every day",
    menu: "Menu and price",
    noMenu: "Dem never put price yet. Ask for chat.",
    unavailable: "E no dey now",
    about: "About am",
    delivers: "Dem dey deliver",
    pickupOnly: "Come take am for there",
    chat: "Chat",
    book: "Book",
    safety: "Make all your talk stay for Bambeh chat. Bambeh no go ever ask your PIN or secret code.",
    notFound: "This business no dey available.",
    yourBusiness: "Na your business be this",
    manage: "Manage am",
    featureIt: "Put am for top",
    featuredUntil: "For top until {d}",
    statusPending: "E dey wait make Bambeh staff approve am. Buyers go see am after.",
    statusRejected: "Dem no approve am: {r}",
    statusHiddenOwner: "E don hide. Buyers no fit see am.",
    statusHiddenStaff: "Bambeh staff don hide am: {r}",
    statusChanged: "Bambeh staff go check your last change dem. E still dey show.",
    gasSwitchYes: "I get gas today",
    gasSwitchNo: "Gas no dey today",
    gasUpdated: "Update {t}",
    chatOpening: "E dey open the chat...",
    bookTitle: "Book for {name}",
    bTable: "Book table",
    bOrder: "Order before",
    bGas: "Book gas refill",
    day: "Day",
    time: "Time",
    people: "How many people",
    whatOrder: "Wetin you want?",
    whatOrderPh: "e.g. 2 roast fish, 1 plate soya",
    whatGas: "Bottle size and brand",
    whatGasPh: "e.g. 12.5 kg refill",
    deliverMe: "Bring am give me",
    pickUp: "I go come take am",
    note: "Message for the business (if you want)",
    send: "Send the booking",
    sending: "E dey send...",
    cancel: "Leave am",
    errTime: "Choose day and time from now go.",
    errPeople: "Talk how many people.",
    errWhat: "Talk wetin you want.",
    msgTable: "Table booking - {name}",
    msgOrder: "Order before - {name}",
    msgGas: "Gas booking - {name}",
    lDay: "Day",
    lTime: "Time",
    lPeople: "People",
    lOrder: "Order",
    lGas: "Gas",
    lNote: "Message",
    bookedOk: "Booking don go. The answer go come for your chat.",
    mineTitle: "My business dem",
    mineEmpty: "You never get business for Bambeh yet.",
    addFirst: "Add your business - e free",
    stPending: "E dey wait for approve",
    stLive: "E dey show",
    stRejected: "Dem no approve am",
    stHidden: "E don hide",
    stChanged: "Dem dey check the change",
    asAgent: "You add am for {name}",
    edit: "Change am",
    menuEdit: "Menu and price",
    hide: "Hide am",
    show: "Show am again",
    feature: "Put for top",
    openBookings: "{n} new booking dem",
    view: "See am",
    formNew: "Add your business",
    formEdit: "Change the business",
    whoOwns: "Who get this business?",
    ownMe: "Na my own",
    ownOther: "Another person own - I be Bambeh agent",
    ownerId: "The owner Bambeh number or email",
    ownerHint: "The owner must get Bambeh account: chat and booking dey go meet am.",
    agentId: "Bambeh agent help you? Im number or email (if you want)",
    fName: "Business name",
    fKinds: "Wetin you dey sell?",
    fDesc: "Talk about am: wetin you sell, price, special thing dem",
    fCity: "Town",
    fArea: "Quarter",
    fAreaOther: "Write the quarter",
    fLandmark: "How to find am (one landmark)",
    fLandmarkPh: "e.g. Behind Total station, near the pharmacy",
    fPhotos: "Photos (reach 6)",
    addPhoto: "Add photo",
    removePhoto: "Remove am",
    uploading: "E dey upload...",
    fDays: "Open days",
    fOpens: "E dey open for",
    fCloses: "E dey close for",
    fKeyPrice: "Main price (XAF)",
    fKeyLabel: "For wetin?",
    fKeyLabelPh: "e.g. 12.5 kg refill, plate soya",
    fBookings: "Accept booking",
    fDelivers: "We dey deliver",
    noPhone: "No write any phone number: buyers go reach you for Bambeh chat.",
    save: "Save",
    saving: "E dey save...",
    saved: "E don save.",
    sentForApproval: "E don go meet Bambeh staff for approve. You fit add your menu now.",
    menuTitle: "Menu and price",
    itemName: "Thing",
    itemPrice: "Price (XAF)",
    itemNote: "Detail",
    itemAvail: "E dey",
    addItem: "Add one line",
    removeItem: "Remove am",
    saveMenu: "Save the menu",
    menuSaved: "Menu don save.",
    bkTitleOwner: "Booking for your business dem",
    bkTitleMine: "My booking dem",
    bkNone: "No booking dey yet.",
    bkFrom: "From {name}",
    bkConfirm: "Confirm am",
    bkDecline: "Refuse am",
    bkCancel: "Cancel the booking",
    bkOpenChat: "Open chat",
    bs_sent: "E dey wait answer",
    bs_confirmed: "E don confirm",
    bs_declined: "Dem refuse am",
    bs_cancelled: "E don cancel",
    ansConfirm: "Your booking don confirm: {when}. We go see soon!",
    ansDecline: "Sorry, we no fit take this booking ({when}). Write we here make we find another time.",
    ansCancel: "I don cancel my booking ({when}). Sorry o.",
    dayToday: "Today",
    d0: "Sun",
    d1: "Mon",
    d2: "Tue",
    d3: "Wed",
    d4: "Thu",
    d5: "Fri",
    d6: "Sat",
    ftTitle: "Put am for top for {area}",
    ftBody: "Your business go show first for {area}, with \"For top\" badge. E go stop by imsef for the end.",
    ftDay: "Days",
    ftDayPrice: "50 XAF each day (2 reach 5 days)",
    ftWeek: "One week",
    ftWeekPrice: "300 XAF",
    ftMonth: "One month",
    ftMonthPrice: "1,000 XAF",
    ftMin: "Mobile money no dey take less than 100 XAF, so the smallest na 2 days.",
    ftPhone: "Mobile money number (MTN or Orange)",
    ftPay: "Pay {n} XAF",
    ftWaiting: "Approve the payment for your phone. If nothing show, open your mobile money menu and approve the payment wey dey wait.",
    ftPaid: "E don pay. E go dey for top until {d}.",
    ftFailed: "The payment no pass. Dem no take anything.",
    ftUnderpaid: "We receive less than the price. Bambeh staff go contact you for chat.",
    ftTimeout: "We still dey wait mobile money. E go on by imsef as the payment reach.",
    ftPayErr: "The payment no fit start: {e}",
    ftPhoneErr: "Put MTN or Orange number (9 numbers).",
    close: "Close",
    e_not_signed_in: "Sign in first.",
    e_not_found: "This business no dey available.",
    e_not_allowed: "You no fit change this business.",
    e_bad_name: "Give the business name (2 reach 80 letters).",
    e_bad_kinds: "Choose at least one: gas, chop house, grill & soya or roast fish.",
    e_bad_description: "The description too long (800 letters max).",
    e_bad_city: "Choose the town.",
    e_bad_area: "Choose or write the quarter.",
    e_bad_landmark: "The landmark too long (160 letters max).",
    e_bad_photos: "One photo no fit work. Remove am and add am again.",
    e_bad_open_days: "Choose the open days.",
    e_bad_hours: "Give both open and close time, or none.",
    e_bad_price: "Check the price dem (25 reach 1,000,000 XAF).",
    e_phone_in_text: "Remove the phone number or chat link: buyers go reach you for Bambeh chat.",
    e_owner_not_found: "No Bambeh account dey use this number or email. Help the owner sign up first.",
    e_owner_ambiguous: "Plenty account match. Use the owner email.",
    e_agent_not_found: "No Bambeh account dey use the agent number or email.",
    e_agent_ambiguous: "Plenty account match the agent. Use im email.",
    e_too_many_lookups: "Too many try with phone numbers. Wait one hour, then try again.",
    e_owner_limit: "This owner don already get 5 business for Bambeh.",
    e_daily_limit: "E too plenty today. Try again tomorrow.",
    e_bad_items: "Check the menu line dem (name 2 reach 60 letters, 40 lines max).",
    e_not_gas: "Na only gas sellers get this switch.",
    e_staff_hidden: "Bambeh staff don hide this business. Write Bambeh support make dem show am again.",
    e_own_business: "Na your own business.",
    e_no_bookings: "This business no dey take booking.",
    e_bad_kind: "This business no dey take this kind booking.",
    e_bad_time: "Choose day and time from now go (30 days max).",
    e_bad_people: "Talk how many people (1 reach 50).",
    e_too_long: "The text too long.",
    e_already_waiting: "You don already get booking wey dey wait for this business. Wait the answer for chat.",
    e_chat_failed: "The chat no fit open. Try again.",
    e_already_answered: "Dem don already answer this booking.",
    e_bad_message: "Write small message.",
    e_not_live: "Dem must approve the business before e fit go for top.",
    e_bad_plan: "Choose one plan.",
    e_bad_days: "Choose 2 reach 5 days.",
    e_too_many: "Too many payment try. Wait small and try again.",
    e_network: "No connection. Check your internet and try again.",
    e_generic: "Something no work well. Try again.",
    e_upload: "The photo no fit upload. Try again.",
  },
  ar: {
    nav: "\u0627\u0644\u063a\u0627\u0632 \u0648\u0627\u0644\u0637\u0639\u0627\u0645",
    title: "\u0627\u0644\u063a\u0627\u0632 \u0648\u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0645\u0634\u0648\u064a\u0627\u062a \u0628\u0627\u0644\u0642\u0631\u0628 \u0645\u0646\u0643",
    subtitle: "\u063a\u0627\u0632 \u0627\u0644\u0637\u0628\u062e \u0648\u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0635\u0648\u064a\u0627 \u0648\u0627\u0644\u0633\u0645\u0643 \u0627\u0644\u0645\u0634\u0648\u064a \u0641\u064a \u062d\u064a\u0651\u0643.",
    searchPh: "\u0627\u0628\u062d\u062b: \u0635\u0648\u064a\u0627\u060c \u0633\u0645\u0643\u060c 12.5 \u0643\u063a\u060c \u0627\u0633\u0645...",
    searchBtn: "\u0628\u062d\u062b",
    addBusiness: "\u0623\u0636\u0641 \u0646\u0634\u0627\u0637\u064b\u0627 \u062a\u062c\u0627\u0631\u064a\u064b\u0627",
    myBusinesses: "\u0623\u0646\u0634\u0637\u062a\u064a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629",
    kAll: "\u0627\u0644\u0643\u0644",
    k_gas: "\u063a\u0627\u0632 \u0627\u0644\u0637\u0628\u062e",
    k_restaurant: "\u0627\u0644\u0645\u0637\u0627\u0639\u0645",
    k_grill: "\u0627\u0644\u0645\u0634\u0648\u064a\u0627\u062a \u0648\u0627\u0644\u0635\u0648\u064a\u0627",
    k_fish: "\u0627\u0644\u0633\u0645\u0643 \u0627\u0644\u0645\u0634\u0648\u064a",
    one_gas: "\u063a\u0627\u0632 \u0627\u0644\u0637\u0628\u062e",
    one_restaurant: "\u0645\u0637\u0639\u0645",
    one_grill: "\u0645\u0634\u0648\u064a\u0627\u062a \u0648\u0635\u0648\u064a\u0627",
    one_fish: "\u0633\u0645\u0643 \u0645\u0634\u0648\u064a",
    city: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629",
    allCities: "\u0643\u0644 \u0627\u0644\u0645\u062f\u0646",
    area: "\u0627\u0644\u062d\u064a",
    allAreas: "\u0643\u0644 \u0627\u0644\u0623\u062d\u064a\u0627\u0621",
    otherArea: "\u062d\u064a \u0622\u062e\u0631",
    startHere: "\u0627\u0628\u062f\u0623 \u0645\u0646 \u0647\u0646\u0627",
    gasTodayFilter: "\u0627\u0644\u063a\u0627\u0632 \u0645\u062a\u0648\u0641\u0631 \u0627\u0644\u064a\u0648\u0645",
    openNowFilter: "\u0645\u0641\u062a\u0648\u062d \u0627\u0644\u0622\u0646",
    countPlaces: "{n} \u0623\u0645\u0627\u0643\u0646",
    countOne: "\u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f",
    featured: "\u0645\u0645\u064a\u0651\u0632",
    gasYes: "\u0627\u0644\u063a\u0627\u0632 \u0645\u062a\u0648\u0641\u0631 \u0627\u0644\u064a\u0648\u0645",
    gasNo: "\u0644\u0627 \u064a\u0648\u062c\u062f \u063a\u0627\u0632 \u0627\u0644\u064a\u0648\u0645",
    gasUnknown: "\u0644\u0645 \u064a\u064f\u0624\u0643\u064e\u0651\u062f \u062a\u0648\u0641\u0631 \u0627\u0644\u063a\u0627\u0632 \u0627\u0644\u064a\u0648\u0645",
    openNow: "\u0645\u0641\u062a\u0648\u062d \u0627\u0644\u0622\u0646",
    closedNow: "\u0645\u063a\u0644\u0642 \u0627\u0644\u0622\u0646",
    opensAt: "\u064a\u0641\u062a\u062d \u0627\u0644\u0633\u0627\u0639\u0629 {t}",
    hoursUnknown: "\u0644\u0645 \u062a\u064f\u062d\u062f\u064e\u0651\u062f \u0627\u0644\u0633\u0627\u0639\u0627\u062a",
    fromPrice: "{n} \u0641\u0631\u0646\u0643",
    emptyTitle: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0623\u064a \u0646\u0634\u0627\u0637 \u0647\u0646\u0627 \u0628\u0639\u062f",
    emptyBody: "\u0647\u0644 \u062a\u0639\u0631\u0641 \u0628\u0627\u0626\u0639 \u063a\u0627\u0632 \u062c\u064a\u062f\u064b\u0627 \u0623\u0648 \u0645\u0637\u0639\u0645\u064b\u0627 \u0623\u0648 \u0645\u0643\u0627\u0646\u064b\u0627 \u0644\u0644\u0635\u0648\u064a\u0627\u061f \u0623\u0636\u0641\u0647 \u0645\u062c\u0627\u0646\u064b\u0627.",
    loadMore: "\u0639\u0631\u0636 \u0627\u0644\u0645\u0632\u064a\u062f",
    loading: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...",
    loadError: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644. \u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    retry: "\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649",
    clearFilters: "\u0645\u0633\u062d \u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u062a\u0635\u0641\u064a\u0629",
    back: "\u0631\u062c\u0648\u0639",
    share: "\u0645\u0634\u0627\u0631\u0643\u0629",
    shared: "\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637. \u0627\u0644\u0635\u0642\u0647 \u062d\u064a\u062b \u062a\u0634\u0627\u0621.",
    howToFind: "\u0643\u064a\u0641 \u062a\u0635\u0644 \u0625\u0644\u064a\u0647",
    hours: "\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644",
    everyDay: "\u0643\u0644 \u064a\u0648\u0645",
    menu: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631",
    noMenu: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0633\u0639\u0627\u0631 \u0628\u0639\u062f. \u0627\u0633\u0623\u0644 \u0641\u064a \u0627\u0644\u062f\u0631\u062f\u0634\u0629.",
    unavailable: "\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631 \u0627\u0644\u0622\u0646",
    about: "\u0646\u0628\u0630\u0629",
    delivers: "\u064a\u0648\u0635\u0651\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062a",
    pickupOnly: "\u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0645\u0646 \u0627\u0644\u0645\u0643\u0627\u0646",
    chat: "\u062f\u0631\u062f\u0634\u0629",
    book: "\u0627\u062d\u062c\u0632",
    safety: "\u0623\u0628\u0642\u0650 \u0645\u062d\u0627\u062f\u062b\u0627\u062a\u0643 \u062f\u0627\u062e\u0644 \u062f\u0631\u062f\u0634\u0629 \u0628\u0627\u0645\u0628\u064a\u0647. \u0644\u0627 \u062a\u0637\u0644\u0628 \u0628\u0627\u0645\u0628\u064a\u0647 \u0623\u0628\u062f\u064b\u0627 \u0631\u0645\u0632\u0643 \u0627\u0644\u0633\u0631\u064a.",
    notFound: "\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d.",
    yourBusiness: "\u0647\u0630\u0627 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062a\u062c\u0627\u0631\u064a",
    manage: "\u0625\u062f\u0627\u0631\u0629",
    featureIt: "\u0627\u062c\u0639\u0644\u0647 \u0645\u0645\u064a\u0651\u0632\u064b\u0627 \u0641\u064a \u0627\u0644\u0623\u0639\u0644\u0649",
    featuredUntil: "\u0645\u0645\u064a\u0651\u0632 \u062d\u062a\u0649 {d}",
    statusPending: "\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0648\u0627\u0641\u0642\u0629 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647. \u0633\u064a\u0631\u0627\u0647 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u0628\u0639\u062f \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629.",
    statusRejected: "\u0644\u0645 \u062a\u062a\u0645 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629: {r}",
    statusHiddenOwner: "\u0645\u062e\u0641\u064a. \u0644\u0627 \u064a\u0633\u062a\u0637\u064a\u0639 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u0631\u0624\u064a\u062a\u0647.",
    statusHiddenStaff: "\u0623\u062e\u0641\u0627\u0647 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647: {r}",
    statusChanged: "\u0633\u064a\u062a\u062d\u0642\u0642 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u0646 \u062a\u0639\u062f\u064a\u0644\u0627\u062a\u0643 \u0627\u0644\u0623\u062e\u064a\u0631\u0629. \u064a\u0628\u0642\u0649 \u0638\u0627\u0647\u0631\u064b\u0627.",
    gasSwitchYes: "\u0644\u062f\u064a \u063a\u0627\u0632 \u0627\u0644\u064a\u0648\u0645",
    gasSwitchNo: "\u0644\u0627 \u064a\u0648\u062c\u062f \u063a\u0627\u0632 \u0627\u0644\u064a\u0648\u0645",
    gasUpdated: "\u062d\u064f\u062f\u0650\u0651\u062b {t}",
    chatOpening: "\u062c\u0627\u0631\u064d \u0641\u062a\u062d \u0627\u0644\u062f\u0631\u062f\u0634\u0629...",
    bookTitle: "\u0627\u062d\u062c\u0632 \u0644\u062f\u0649 {name}",
    bTable: "\u0627\u062d\u062c\u0632 \u0637\u0627\u0648\u0644\u0629",
    bOrder: "\u0627\u0637\u0644\u0628 \u0645\u0633\u0628\u0642\u064b\u0627",
    bGas: "\u0627\u062d\u062c\u0632 \u062a\u0639\u0628\u0626\u0629 \u063a\u0627\u0632",
    day: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e",
    time: "\u0627\u0644\u0633\u0627\u0639\u0629",
    people: "\u0639\u062f\u062f \u0627\u0644\u0623\u0634\u062e\u0627\u0635",
    whatOrder: "\u0645\u0627\u0630\u0627 \u062a\u0631\u064a\u062f\u061f",
    whatOrderPh: "\u0645\u062b\u0627\u0644: \u0633\u0645\u0643\u062a\u0627\u0646 \u0645\u0634\u0648\u064a\u062a\u0627\u0646\u060c \u0637\u0628\u0642 \u0635\u0648\u064a\u0627",
    whatGas: "\u062d\u062c\u0645 \u0627\u0644\u0642\u0627\u0631\u0648\u0631\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u0645\u0629",
    whatGasPh: "\u0645\u062b\u0627\u0644: \u062a\u0639\u0628\u0626\u0629 12.5 \u0643\u063a",
    deliverMe: "\u0648\u0635\u0651\u0644\u0648\u0627 \u0625\u0644\u064a\u0651",
    pickUp: "\u0633\u0623\u0633\u062a\u0644\u0645\u0647 \u0628\u0646\u0641\u0633\u064a",
    note: "\u0645\u0644\u0627\u062d\u0638\u0629 \u0644\u0644\u0646\u0634\u0627\u0637 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
    send: "\u0623\u0631\u0633\u0644 \u0627\u0644\u062d\u062c\u0632",
    sending: "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...",
    cancel: "\u0625\u0644\u063a\u0627\u0621",
    errTime: "\u0627\u062e\u062a\u0631 \u064a\u0648\u0645\u064b\u0627 \u0648\u0633\u0627\u0639\u0629 \u0645\u0646 \u0627\u0644\u0622\u0646 \u0641\u0635\u0627\u0639\u062f\u064b\u0627.",
    errPeople: "\u062d\u062f\u0651\u062f \u0639\u062f\u062f \u0627\u0644\u0623\u0634\u062e\u0627\u0635.",
    errWhat: "\u062d\u062f\u0651\u062f \u0645\u0627 \u062a\u0631\u064a\u062f.",
    msgTable: "\u062d\u062c\u0632 \u0637\u0627\u0648\u0644\u0629 - {name}",
    msgOrder: "\u0637\u0644\u0628 \u0645\u0633\u0628\u0642 - {name}",
    msgGas: "\u062d\u062c\u0632 \u063a\u0627\u0632 - {name}",
    lDay: "\u0627\u0644\u062a\u0627\u0631\u064a\u062e",
    lTime: "\u0627\u0644\u0633\u0627\u0639\u0629",
    lPeople: "\u0627\u0644\u0623\u0634\u062e\u0627\u0635",
    lOrder: "\u0627\u0644\u0637\u0644\u0628",
    lGas: "\u0627\u0644\u063a\u0627\u0632",
    lNote: "\u0645\u0644\u0627\u062d\u0638\u0629",
    bookedOk: "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062d\u062c\u0632. \u0633\u064a\u0635\u0644\u0643 \u0627\u0644\u0631\u062f \u0641\u064a \u0627\u0644\u062f\u0631\u062f\u0634\u0629.",
    mineTitle: "\u0623\u0646\u0634\u0637\u062a\u064a \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629",
    mineEmpty: "\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u0623\u064a \u0646\u0634\u0627\u0637 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0639\u062f.",
    addFirst: "\u0623\u0636\u0641 \u0646\u0634\u0627\u0637\u0643 \u0645\u062c\u0627\u0646\u064b\u0627",
    stPending: "\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
    stLive: "\u0645\u0646\u0634\u0648\u0631",
    stRejected: "\u0645\u0631\u0641\u0648\u0636",
    stHidden: "\u0645\u062e\u0641\u064a",
    stChanged: "\u0627\u0644\u062a\u0639\u062f\u064a\u0644\u0627\u062a \u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
    asAgent: "\u0623\u0636\u0641\u062a\u0647 \u0623\u0646\u062a \u0644\u0640 {name}",
    edit: "\u062a\u0639\u062f\u064a\u0644",
    menuEdit: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631",
    hide: "\u0625\u062e\u0641\u0627\u0621",
    show: "\u0625\u0638\u0647\u0627\u0631 \u0645\u0646 \u062c\u062f\u064a\u062f",
    feature: "\u062a\u0645\u064a\u064a\u0632",
    openBookings: "{n} \u062d\u062c\u0648\u0632\u0627\u062a \u062c\u062f\u064a\u062f\u0629",
    view: "\u0639\u0631\u0636",
    formNew: "\u0623\u0636\u0641 \u0646\u0634\u0627\u0637\u064b\u0627 \u062a\u062c\u0627\u0631\u064a\u064b\u0627",
    formEdit: "\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0646\u0634\u0627\u0637",
    whoOwns: "\u0645\u0646 \u064a\u0645\u0644\u0643 \u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637\u061f",
    ownMe: "\u0623\u0646\u0627 \u0627\u0644\u0645\u0627\u0644\u0643",
    ownOther: "\u0634\u062e\u0635 \u0622\u062e\u0631 - \u0623\u0646\u0627 \u0648\u0643\u064a\u0644 \u0628\u0627\u0645\u0628\u064a\u0647",
    ownerId: "\u0631\u0642\u0645 \u0647\u0627\u062a\u0641 \u0627\u0644\u0645\u0627\u0644\u0643 \u0623\u0648 \u0628\u0631\u064a\u062f\u0647 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647",
    ownerHint: "\u064a\u062d\u062a\u0627\u062c \u0627\u0644\u0645\u0627\u0644\u0643 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628 \u0628\u0627\u0645\u0628\u064a\u0647: \u062a\u0635\u0644\u0647 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0648\u0627\u0644\u062d\u062c\u0648\u0632\u0627\u062a.",
    agentId: "\u0633\u0627\u0639\u062f\u0643 \u0648\u0643\u064a\u0644 \u0628\u0627\u0645\u0628\u064a\u0647\u061f \u0631\u0642\u0645\u0647 \u0623\u0648 \u0628\u0631\u064a\u062f\u0647 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)",
    fName: "\u0627\u0633\u0645 \u0627\u0644\u0646\u0634\u0627\u0637",
    fKinds: "\u0645\u0627\u0630\u0627 \u062a\u0628\u064a\u0639\u061f",
    fDesc: "\u0635\u0650\u0641\u0647: \u0645\u0627 \u062a\u0628\u064a\u0639\u0647 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u0639\u0631\u0648\u0636",
    fCity: "\u0627\u0644\u0645\u062f\u064a\u0646\u0629",
    fArea: "\u0627\u0644\u062d\u064a",
    fAreaOther: "\u0627\u0643\u062a\u0628 \u0627\u0633\u0645 \u0627\u0644\u062d\u064a",
    fLandmark: "\u0643\u064a\u0641 \u064a\u064f\u0639\u062b\u0631 \u0639\u0644\u064a\u0647 (\u0639\u0644\u0627\u0645\u0629 \u0645\u0645\u064a\u0632\u0629)",
    fLandmarkPh: "\u0645\u062b\u0627\u0644: \u062e\u0644\u0641 \u0645\u062d\u0637\u0629 \u062a\u0648\u062a\u0627\u0644\u060c \u0628\u062c\u0627\u0646\u0628 \u0627\u0644\u0635\u064a\u062f\u0644\u064a\u0629",
    fPhotos: "\u0635\u0648\u0631 (\u062d\u062a\u0649 6)",
    addPhoto: "\u0623\u0636\u0641 \u0635\u0648\u0631\u0629",
    removePhoto: "\u0625\u0632\u0627\u0644\u0629",
    uploading: "\u062c\u0627\u0631\u064d \u0627\u0644\u0631\u0641\u0639...",
    fDays: "\u0623\u064a\u0627\u0645 \u0627\u0644\u0639\u0645\u0644",
    fOpens: "\u064a\u0641\u062a\u062d \u0627\u0644\u0633\u0627\u0639\u0629",
    fCloses: "\u064a\u063a\u0644\u0642 \u0627\u0644\u0633\u0627\u0639\u0629",
    fKeyPrice: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0631\u0626\u064a\u0633\u064a (\u0641\u0631\u0646\u0643)",
    fKeyLabel: "\u0645\u0642\u0627\u0628\u0644 \u0645\u0627\u0630\u0627\u061f",
    fKeyLabelPh: "\u0645\u062b\u0627\u0644: \u062a\u0639\u0628\u0626\u0629 12.5 \u0643\u063a\u060c \u0637\u0628\u0642 \u0635\u0648\u064a\u0627",
    fBookings: "\u0642\u0628\u0648\u0644 \u0627\u0644\u062d\u062c\u0648\u0632\u0627\u062a",
    fDelivers: "\u0646\u0648\u0635\u0651\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062a",
    noPhone: "\u0644\u0627 \u062a\u0643\u062a\u0628 \u0623\u064a \u0631\u0642\u0645 \u0647\u0627\u062a\u0641: \u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u0639\u0628\u0631 \u062f\u0631\u062f\u0634\u0629 \u0628\u0627\u0645\u0628\u064a\u0647.",
    save: "\u062d\u0641\u0638",
    saving: "\u062c\u0627\u0631\u064d \u0627\u0644\u062d\u0641\u0638...",
    saved: "\u062a\u0645 \u0627\u0644\u062d\u0641\u0638.",
    sentForApproval: "\u0623\u064f\u0631\u0633\u0644 \u0625\u0644\u0649 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0644\u0645\u0648\u0627\u0641\u0642\u0629. \u064a\u0645\u0643\u0646\u0643 \u0625\u0636\u0627\u0641\u0629 \u0642\u0627\u0626\u0645\u062a\u0643 \u0627\u0644\u0622\u0646.",
    menuTitle: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631",
    itemName: "\u0627\u0644\u0635\u0646\u0641",
    itemPrice: "\u0627\u0644\u0633\u0639\u0631 (\u0641\u0631\u0646\u0643)",
    itemNote: "\u062a\u0641\u0627\u0635\u064a\u0644",
    itemAvail: "\u0645\u062a\u0648\u0641\u0631",
    addItem: "\u0623\u0636\u0641 \u0633\u0637\u0631\u064b\u0627",
    removeItem: "\u0625\u0632\u0627\u0644\u0629",
    saveMenu: "\u062d\u0641\u0638 \u0627\u0644\u0642\u0627\u0626\u0645\u0629",
    menuSaved: "\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0642\u0627\u0626\u0645\u0629.",
    bkTitleOwner: "\u062d\u062c\u0648\u0632\u0627\u062a \u0623\u0646\u0634\u0637\u062a\u0643",
    bkTitleMine: "\u062d\u062c\u0648\u0632\u0627\u062a\u064a",
    bkNone: "\u0644\u0627 \u062a\u0648\u062c\u062f \u062d\u062c\u0648\u0632\u0627\u062a \u0628\u0639\u062f.",
    bkFrom: "\u0645\u0646 {name}",
    bkConfirm: "\u062a\u0623\u0643\u064a\u062f",
    bkDecline: "\u0631\u0641\u0636",
    bkCancel: "\u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062d\u062c\u0632",
    bkOpenChat: "\u0627\u0641\u062a\u062d \u0627\u0644\u062f\u0631\u062f\u0634\u0629",
    bs_sent: "\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u0631\u062f",
    bs_confirmed: "\u0645\u0624\u0643\u064e\u0651\u062f",
    bs_declined: "\u0645\u0631\u0641\u0648\u0636",
    bs_cancelled: "\u0645\u0644\u063a\u0649",
    ansConfirm: "\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u062d\u062c\u0632\u0643: {when}. \u0646\u0631\u0627\u0643 \u0642\u0631\u064a\u0628\u064b\u0627!",
    ansDecline: "\u0639\u0630\u0631\u064b\u0627\u060c \u0644\u0627 \u064a\u0645\u0643\u0646\u0646\u0627 \u0642\u0628\u0648\u0644 \u0647\u0630\u0627 \u0627\u0644\u062d\u062c\u0632 ({when}). \u0627\u0643\u062a\u0628 \u0644\u0646\u0627 \u0647\u0646\u0627 \u0644\u0646\u062c\u062f \u0648\u0642\u062a\u064b\u0627 \u0622\u062e\u0631.",
    ansCancel: "\u0623\u0644\u063a\u064a \u062d\u062c\u0632\u064a ({when}). \u0623\u0639\u062a\u0630\u0631 \u0639\u0646 \u0630\u0644\u0643.",
    dayToday: "\u0627\u0644\u064a\u0648\u0645",
    d0: "\u0627\u0644\u0623\u062d\u062f",
    d1: "\u0627\u0644\u0627\u062b\u0646\u064a\u0646",
    d2: "\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621",
    d3: "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621",
    d4: "\u0627\u0644\u062e\u0645\u064a\u0633",
    d5: "\u0627\u0644\u062c\u0645\u0639\u0629",
    d6: "\u0627\u0644\u0633\u0628\u062a",
    ftTitle: "\u062a\u0645\u064a\u064a\u0632 \u0641\u064a \u0623\u0639\u0644\u0649 {area}",
    ftBody: "\u064a\u0638\u0647\u0631 \u0646\u0634\u0627\u0637\u0643 \u0623\u0648\u0644\u064b\u0627 \u0641\u064a {area} \u0645\u0639 \u0634\u0627\u0631\u0629 \u00ab\u0645\u0645\u064a\u0651\u0632\u00bb. \u064a\u062a\u0648\u0642\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627 \u0641\u064a \u0627\u0644\u0646\u0647\u0627\u064a\u0629.",
    ftDay: "\u0623\u064a\u0627\u0645",
    ftDayPrice: "50 \u0641\u0631\u0646\u0643\u064b\u0627 \u064a\u0648\u0645\u064a\u064b\u0627 (\u0645\u0646 2 \u0625\u0644\u0649 5 \u0623\u064a\u0627\u0645)",
    ftWeek: "\u0623\u0633\u0628\u0648\u0639 \u0648\u0627\u062d\u062f",
    ftWeekPrice: "300 \u0641\u0631\u0646\u0643",
    ftMonth: "\u0634\u0647\u0631 \u0648\u0627\u062d\u062f",
    ftMonthPrice: "1000 \u0641\u0631\u0646\u0643",
    ftMin: "\u0644\u0627 \u064a\u0642\u0628\u0644 \u0627\u0644\u0645\u0627\u0644 \u0639\u0628\u0631 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0642\u0644 \u0645\u0646 100 \u0641\u0631\u0646\u0643\u060c \u0644\u0630\u0627 \u0641\u0623\u0642\u0635\u0631 \u0645\u062f\u0629 \u0647\u064a \u064a\u0648\u0645\u0627\u0646.",
    ftPhone: "\u0631\u0642\u0645 \u0627\u0644\u0645\u0627\u0644 \u0639\u0628\u0631 \u0627\u0644\u0647\u0627\u062a\u0641 (MTN \u0623\u0648 Orange)",
    ftPay: "\u0627\u062f\u0641\u0639 {n} \u0641\u0631\u0646\u0643",
    ftWaiting: "\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0627\u0644\u062f\u0641\u0639 \u0645\u0646 \u0647\u0627\u062a\u0641\u0643. \u0625\u0630\u0627 \u0644\u0645 \u064a\u0638\u0647\u0631 \u0637\u0644\u0628\u060c \u0627\u0641\u062a\u062d \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0627\u0644 \u0639\u0628\u0631 \u0627\u0644\u0647\u0627\u062a\u0641 \u0648\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0627\u0644\u062f\u0641\u0639\u0629 \u0627\u0644\u0645\u0639\u0644\u0651\u0642\u0629.",
    ftPaid: "\u062a\u0645 \u0627\u0644\u062f\u0641\u0639. \u0645\u0645\u064a\u0651\u0632 \u062d\u062a\u0649 {d}.",
    ftFailed: "\u0644\u0645 \u062a\u062a\u0645 \u0639\u0645\u0644\u064a\u0629 \u0627\u0644\u062f\u0641\u0639. \u0644\u0645 \u064a\u064f\u0642\u062a\u0637\u0639 \u0623\u064a \u0645\u0628\u0644\u063a.",
    ftUnderpaid: "\u0627\u0633\u062a\u0644\u0645\u0646\u0627 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0633\u0639\u0631. \u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0641\u064a \u0627\u0644\u062f\u0631\u062f\u0634\u0629.",
    ftTimeout: "\u0645\u0627 \u0632\u0644\u0646\u0627 \u0646\u0646\u062a\u0638\u0631 \u0627\u0644\u0645\u0627\u0644 \u0639\u0628\u0631 \u0627\u0644\u0647\u0627\u062a\u0641. \u064a\u062a\u0641\u0639\u0651\u0644 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627 \u0641\u0648\u0631 \u0648\u0635\u0648\u0644 \u0627\u0644\u062f\u0641\u0639\u0629.",
    ftPayErr: "\u062a\u0639\u0630\u0651\u0631 \u0628\u062f\u0621 \u0627\u0644\u062f\u0641\u0639: {e}",
    ftPhoneErr: "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 MTN \u0623\u0648 Orange (9 \u0623\u0631\u0642\u0627\u0645).",
    close: "\u0625\u063a\u0644\u0627\u0642",
    e_not_signed_in: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u064b\u0627.",
    e_not_found: "\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d.",
    e_not_allowed: "\u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u062a\u0639\u062f\u064a\u0644 \u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637.",
    e_bad_name: "\u0623\u0639\u0637\u0650 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0633\u0645\u064b\u0627 (\u0645\u0646 2 \u0625\u0644\u0649 80 \u062d\u0631\u0641\u064b\u0627).",
    e_bad_kinds: "\u0627\u062e\u062a\u0631 \u0648\u0627\u062d\u062f\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644: \u063a\u0627\u0632\u060c \u0645\u0637\u0639\u0645\u060c \u0645\u0634\u0648\u064a\u0627\u062a \u0648\u0635\u0648\u064a\u0627 \u0623\u0648 \u0633\u0645\u0643 \u0645\u0634\u0648\u064a.",
    e_bad_description: "\u0627\u0644\u0648\u0635\u0641 \u0637\u0648\u064a\u0644 \u062c\u062f\u064b\u0627 (800 \u062d\u0631\u0641 \u0643\u062d\u062f \u0623\u0642\u0635\u0649).",
    e_bad_city: "\u0627\u062e\u062a\u0631 \u0627\u0644\u0645\u062f\u064a\u0646\u0629.",
    e_bad_area: "\u0627\u062e\u062a\u0631 \u0627\u0644\u062d\u064a \u0623\u0648 \u0627\u0643\u062a\u0628 \u0627\u0633\u0645\u0647.",
    e_bad_landmark: "\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0645\u0645\u064a\u0632\u0629 \u0637\u0648\u064a\u0644\u0629 \u062c\u062f\u064b\u0627 (160 \u062d\u0631\u0641\u064b\u0627 \u0643\u062d\u062f \u0623\u0642\u0635\u0649).",
    e_bad_photos: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0625\u062d\u062f\u0649 \u0627\u0644\u0635\u0648\u0631. \u0623\u0632\u0644\u0647\u0627 \u0648\u0623\u0636\u0641\u0647\u0627 \u0645\u0646 \u062c\u062f\u064a\u062f.",
    e_bad_open_days: "\u0627\u062e\u062a\u0631 \u0623\u064a\u0627\u0645 \u0627\u0644\u0639\u0645\u0644.",
    e_bad_hours: "\u062d\u062f\u0651\u062f \u0633\u0627\u0639\u0629 \u0627\u0644\u0641\u062a\u062d \u0648\u0627\u0644\u0625\u063a\u0644\u0627\u0642 \u0645\u0639\u064b\u0627\u060c \u0623\u0648 \u0644\u0627 \u062a\u062d\u062f\u062f \u0623\u064a\u064b\u0651\u0627 \u0645\u0646\u0647\u0645\u0627.",
    e_bad_price: "\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 (\u0645\u0646 25 \u0625\u0644\u0649 1000000 \u0641\u0631\u0646\u0643).",
    e_phone_in_text: "\u0627\u062d\u0630\u0641 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0648 \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629: \u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u0639\u0628\u0631 \u062f\u0631\u062f\u0634\u0629 \u0628\u0627\u0645\u0628\u064a\u0647.",
    e_owner_not_found: "\u0644\u0627 \u064a\u0648\u062c\u062f \u062d\u0633\u0627\u0628 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u0623\u0648 \u0627\u0644\u0628\u0631\u064a\u062f. \u0633\u0627\u0639\u062f \u0627\u0644\u0645\u0627\u0644\u0643 \u0639\u0644\u0649 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0623\u0648\u0644\u064b\u0627.",
    e_owner_ambiguous: "\u064a\u0648\u062c\u062f \u0623\u0643\u062b\u0631 \u0645\u0646 \u062d\u0633\u0627\u0628 \u0645\u0637\u0627\u0628\u0642. \u0627\u0633\u062a\u062e\u062f\u0645 \u0628\u0631\u064a\u062f \u0627\u0644\u0645\u0627\u0644\u0643 \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643.",
    e_agent_not_found: "\u0644\u0627 \u064a\u0648\u062c\u062f \u062d\u0633\u0627\u0628 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0631\u0642\u0645 \u0627\u0644\u0648\u0643\u064a\u0644 \u0623\u0648 \u0628\u0631\u064a\u062f\u0647.",
    e_agent_ambiguous: "\u064a\u0648\u062c\u062f \u0623\u0643\u062b\u0631 \u0645\u0646 \u062d\u0633\u0627\u0628 \u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0648\u0643\u064a\u0644. \u0627\u0633\u062a\u062e\u062f\u0645 \u0628\u0631\u064a\u062f\u0647.",
    e_too_many_lookups: "\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u0628\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0647\u0648\u0627\u062a\u0641. \u0627\u0646\u062a\u0638\u0631 \u0633\u0627\u0639\u0629 \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.",
    e_owner_limit: "\u0644\u062f\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u0627\u0644\u0643 5 \u0623\u0646\u0634\u0637\u0629 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0627\u0644\u0641\u0639\u0644.",
    e_daily_limit: "\u0639\u062f\u062f \u0643\u0628\u064a\u0631 \u062c\u062f\u064b\u0627 \u0627\u0644\u064a\u0648\u0645. \u062d\u0627\u0648\u0644 \u063a\u062f\u064b\u0627.",
    e_bad_items: "\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0623\u0633\u0637\u0631 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 (\u0627\u0633\u0645 \u0645\u0646 2 \u0625\u0644\u0649 60 \u062d\u0631\u0641\u064b\u0627\u060c 40 \u0633\u0637\u0631\u064b\u0627 \u0643\u062d\u062f \u0623\u0642\u0635\u0649).",
    e_not_gas: "\u0647\u0630\u0627 \u0627\u0644\u0632\u0631 \u0644\u0628\u0627\u0626\u0639\u064a \u0627\u0644\u063a\u0627\u0632 \u0641\u0642\u0637.",
    e_staff_hidden: "\u0623\u062e\u0641\u0649 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637. \u0631\u0627\u0633\u0644 \u062f\u0639\u0645 \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0625\u0638\u0647\u0627\u0631\u0647 \u0645\u0646 \u062c\u062f\u064a\u062f.",
    e_own_business: "\u0647\u0630\u0627 \u0646\u0634\u0627\u0637\u0643 \u0623\u0646\u062a.",
    e_no_bookings: "\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637 \u0644\u0627 \u064a\u0642\u0628\u0644 \u0627\u0644\u062d\u062c\u0648\u0632\u0627\u062a.",
    e_bad_kind: "\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637 \u0644\u0627 \u064a\u0642\u0628\u0644 \u0647\u0630\u0627 \u0627\u0644\u0646\u0648\u0639 \u0645\u0646 \u0627\u0644\u062d\u062c\u0632.",
    e_bad_time: "\u0627\u062e\u062a\u0631 \u064a\u0648\u0645\u064b\u0627 \u0648\u0633\u0627\u0639\u0629 \u0645\u0646 \u0627\u0644\u0622\u0646 \u0641\u0635\u0627\u0639\u062f\u064b\u0627 (30 \u064a\u0648\u0645\u064b\u0627 \u0643\u062d\u062f \u0623\u0642\u0635\u0649).",
    e_bad_people: "\u062d\u062f\u0651\u062f \u0639\u062f\u062f \u0627\u0644\u0623\u0634\u062e\u0627\u0635 (\u0645\u0646 1 \u0625\u0644\u0649 50).",
    e_too_long: "\u0627\u0644\u0646\u0635 \u0637\u0648\u064a\u0644 \u062c\u062f\u064b\u0627.",
    e_already_waiting: "\u0644\u062f\u064a\u0643 \u0628\u0627\u0644\u0641\u0639\u0644 \u062d\u062c\u0648\u0632\u0627\u062a \u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u0631\u062f \u0644\u062f\u0649 \u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637. \u0627\u0646\u062a\u0638\u0631 \u0627\u0644\u0631\u062f \u0641\u064a \u0627\u0644\u062f\u0631\u062f\u0634\u0629.",
    e_chat_failed: "\u062a\u0639\u0630\u0651\u0631 \u0641\u062a\u062d \u0627\u0644\u062f\u0631\u062f\u0634\u0629. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    e_already_answered: "\u062a\u0645 \u0627\u0644\u0631\u062f \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062d\u062c\u0632 \u0628\u0627\u0644\u0641\u0639\u0644.",
    e_bad_message: "\u0627\u0643\u062a\u0628 \u0631\u0633\u0627\u0644\u0629 \u0642\u0635\u064a\u0631\u0629.",
    e_not_live: "\u064a\u062c\u0628 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0646\u0634\u0627\u0637 \u0642\u0628\u0644 \u062a\u0645\u064a\u064a\u0632\u0647.",
    e_bad_plan: "\u0627\u062e\u062a\u0631 \u062e\u0637\u0629.",
    e_bad_days: "\u0627\u062e\u062a\u0631 \u0645\u0646 \u064a\u0648\u0645\u064a\u0646 \u0625\u0644\u0649 5 \u0623\u064a\u0627\u0645.",
    e_too_many: "\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u062f\u0641\u0639 \u0643\u062b\u064a\u0631\u0629. \u0627\u0646\u062a\u0638\u0631 \u0642\u0644\u064a\u0644\u064b\u0627 \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.",
    e_network: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u062a\u0635\u0627\u0644. \u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    e_generic: "\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
    e_upload: "\u062a\u0639\u0630\u0651\u0631 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
  },
  ff: {
    nav: "Gaas e \u00f1aamdu",
    title: "Gaas, \u00f1aamdu e ju\u0257aa\u0257i \u0253adii\u0257i ma",
    subtitle: "Gaas defirde, restoran, soya e liingu ju\u0257aa\u0257o e kartiye maa.",
    searchPh: "Yiilo: soya, liingu, 12.5 kg, innde...",
    searchBtn: "Yiilo",
    addBusiness: "\u0181eydu nokkuure",
    myBusinesses: "Nokkuuje am",
    kAll: "Fof",
    k_gas: "Gaas defirde",
    k_restaurant: "Restoran",
    k_grill: "Soya e ju\u0257aa\u0257i",
    k_fish: "Liingu ju\u0257aa\u0257o",
    one_gas: "Gaas defirde",
    one_restaurant: "Restoran",
    one_grill: "Soya e ju\u0257aa\u0257i",
    one_fish: "Liingu ju\u0257aa\u0257o",
    city: "Saare",
    allCities: "Saareeji fof",
    area: "Kartiye",
    allAreas: "Kartiyeeji fof",
    otherArea: "Kartiye go\u0257\u0257o",
    startHere: "Fu\u0257\u0257o \u0257oo",
    gasTodayFilter: "Gaas woodi hannde",
    openNowFilter: "Udditii jooni",
    countPlaces: "Nokkuuje {n}",
    countOne: "Nokkuure 1",
    featured: "\u0181ur\u0257o yiyeede",
    gasYes: "Gaas woodi hannde",
    gasNo: "Gaas alaa hannde",
    gasUnknown: "Gaas tee\u014btinaaka hannde",
    openNow: "Udditii jooni",
    closedNow: "Uddii jooni",
    opensAt: "Ina uddita saa\u2019a {t}",
    hoursUnknown: "Saa\u2019aaji ndokkaaka",
    fromPrice: "{n} XAF",
    emptyTitle: "Nokkuure alaa \u0257oo tawo",
    emptyBody: "A anndi jeeyoowo gaas, restoran walla nokkuure soya mo\u01b4\u01b4o? \u0181eydu mo - ko yo\u0253aaki.",
    loadMore: "Hollu \u0253ur\u0257o",
    loading: "Ina loowa...",
    loadError: "Waawaa loowde. \u01b3eewto connexion maa, eto kadi.",
    retry: "Eto kadi",
    clearFilters: "Momtu cu\u0253ol",
    back: "Rutto",
    share: "Rentin",
    shared: "Link nattaama. \u00d1ippu \u0257um \u0257o nji\u0257\u0257aa.",
    howToFind: "No tawrata nokkuure nde",
    hours: "Saa\u2019aaji uddital",
    everyDay: "\u00d1alawma kala",
    menu: "Menu e coggu",
    noMenu: "Coggu winndaaka tawo. Naamno e chat.",
    unavailable: "Alaa jooni",
    about: "Ko faati e mum",
    delivers: "Ina roondoo",
    pickupOnly: "\u01b3ettu \u0257oon",
    chat: "Haal",
    book: "Hokku",
    safety: "Haal fof e chat Bambeh. Bambeh naamnataa PIN maa walla code suu\u0257ii\u0257o.",
    notFound: "Nokkuure nde alaa.",
    yourBusiness: "Ndee ko nokkuure maa",
    manage: "Toppito",
    featureIt: "Wa\u0257 mo dow",
    featuredUntil: "\u0181ur\u0257o yiyeede haa {d}",
    statusPending: "Ina habba ja\u0253\u0253ugol golloo\u2019en Bambeh. Soodoo\u0253e yiyan mo so ja\u0253aama.",
    statusRejected: "Ja\u0253aaka: {r}",
    statusHiddenOwner: "Suu\u0257aama. Soodoo\u0253e yiyataa mo.",
    statusHiddenStaff: "Golloo\u2019en Bambeh suu\u0257ii mo: {r}",
    statusChanged: "Golloo\u2019en Bambeh \u01b4eewtan ko mbayli\u0257aa. Ina jokki yiyeede.",
    gasSwitchYes: "Mi woodi gaas hannde",
    gasSwitchNo: "Gaas alaa hannde",
    gasUpdated: "Hes\u0257itinaama {t}",
    chatOpening: "Ina uddita chat...",
    bookTitle: "Hokku e {name}",
    bTable: "Hokku taabal",
    bOrder: "Yamir adii",
    bGas: "Hokku he\u0253tinde gaas",
    day: "\u00d1alawma",
    time: "Saa\u2019a",
    people: "Limoore yim\u0253e",
    whatOrder: "Ko nji\u0257\u0257aa?",
    whatOrderPh: "misal: liingu ju\u0257aa\u0257o 2, soya 1",
    whatGas: "Mawngu e innde gaas",
    whatGasPh: "misal: he\u0253tinde 12.5 kg",
    deliverMe: "Roondu mi",
    pickUp: "Mi \u01b4ettan \u0257um",
    note: "Konngol e nokkuure (so a faalaa)",
    send: "Neldu hokkere",
    sending: "Ina nelda...",
    cancel: "Accu",
    errTime: "Su\u0253o \u00f1alawma e saa\u2019a gila jooni.",
    errPeople: "Wiy limoore yim\u0253e.",
    errWhat: "Wiy ko nji\u0257\u0257aa.",
    msgTable: "Hokkere taabal - {name}",
    msgOrder: "Yamiroore adii - {name}",
    msgGas: "Hokkere gaas - {name}",
    lDay: "\u00d1alawma",
    lTime: "Saa\u2019a",
    lPeople: "Yim\u0253e",
    lOrder: "Yamiroore",
    lGas: "Gaas",
    lNote: "Konngol",
    bookedOk: "Hokkere neldaama. Jaabawol arataa e chat maa.",
    mineTitle: "Nokkuuje am",
    mineEmpty: "A alaa nokkuure e Bambeh tawo.",
    addFirst: "\u0181eydu nokkuure maa - ko yo\u0253aaki",
    stPending: "Ina habba ja\u0253\u0253ugol",
    stLive: "Ina yiyee",
    stRejected: "Ja\u0253aaka",
    stHidden: "Suu\u0257aama",
    stChanged: "Ina \u01b4eewee ko mbayli",
    asAgent: "A \u0253eydii mo ngam {name}",
    edit: "Waylu",
    menuEdit: "Menu e coggu",
    hide: "Suu\u0257",
    show: "Hollu kadi",
    feature: "Wa\u0257 dow",
    openBookings: "Hokkereeji kesi {n}",
    view: "\u01b3eew",
    formNew: "\u0181eydu nokkuure",
    formEdit: "Waylu nokkuure",
    whoOwns: "Moy jogii nokkuure nde?",
    ownMe: "Ko am",
    ownOther: "Go\u0257\u0257o - mi ajan Bambeh",
    ownerId: "Limoore walla email Bambeh jom mayre",
    ownerHint: "Jom mayre faali konte Bambeh: chat e hokkereeji ina njaha e makko.",
    agentId: "Ajan Bambeh walli ma? Limoore makko walla email (so a faalaa)",
    fName: "Innde nokkuure",
    fKinds: "Ko njeeyataa?",
    fDesc: "Sifo: ko njeeyataa, coggu, ko \u0253uri",
    fCity: "Saare",
    fArea: "Kartiye",
    fAreaOther: "Winndu kartiye",
    fLandmark: "No tawrata mo (maande)",
    fLandmarkPh: "misal: Caggal station Total, \u0253adii\u0257o farmasi",
    fPhotos: "Natalle (haa 6)",
    addPhoto: "\u0181eydu natal",
    removePhoto: "Itt",
    uploading: "Ina nelda...",
    fDays: "\u00d1al\u0257i uddital",
    fOpens: "Ina uddita saa\u2019a",
    fCloses: "Ina udda saa\u2019a",
    fKeyPrice: "Coggu mawngu (XAF)",
    fKeyLabel: "Ngam ko?",
    fKeyLabelPh: "misal: he\u0253tinde 12.5 kg, soya",
    fBookings: "Ja\u0253 hokkereeji",
    fDelivers: "Min ndoondoo",
    noPhone: "Winndaa limoore telefon: soodoo\u0253e ina njokkondira e maa e chat Bambeh.",
    save: "Danndu",
    saving: "Ina danndee...",
    saved: "Danndaama.",
    sentForApproval: "Nelda e golloo\u2019en Bambeh ngam ja\u0253\u0253ugol. A waawi \u0253eydude menu maa jooni.",
    menuTitle: "Menu e coggu",
    itemName: "Huunde",
    itemPrice: "Coggu (XAF)",
    itemNote: "Cifol",
    itemAvail: "Woodi",
    addItem: "\u0181eydu diidol",
    removeItem: "Itt",
    saveMenu: "Danndu menu",
    menuSaved: "Menu danndaama.",
    bkTitleOwner: "Hokkereeji nokkuuje maa",
    bkTitleMine: "Hokkereeji am",
    bkNone: "Hokkere alaa tawo.",
    bkFrom: "Iwde e {name}",
    bkConfirm: "Tee\u014btin",
    bkDecline: "Salo",
    bkCancel: "Momtu hokkere",
    bkOpenChat: "Uddit chat",
    bs_sent: "Ina habba jaabawol",
    bs_confirmed: "Tee\u014btinaama",
    bs_declined: "Salaama",
    bs_cancelled: "Momtaama",
    ansConfirm: "Hokkere maa tee\u014btinaama: {when}. Min ndaarete!",
    ansDecline: "Accu haa yaafo, min mbaawaa ja\u0253de hokkere nde ({when}). Winndu min \u0257oo ngam he\u0253de saa\u2019a go\u0257\u0257o.",
    ansCancel: "Mi momtii hokkere am ({when}). Yaafo.",
    dayToday: "Hannde",
    d0: "Lah",
    d1: "Alt",
    d2: "Tal",
    d3: "Alr",
    d4: "Alk",
    d5: "Jum",
    d6: "Asa",
    ftTitle: "Wa\u0257 dow e {area}",
    ftBody: "Nokkuure maa yiyetee adii e {area}. \u018aum daran e hoore mum so timmii.",
    ftDay: "\u00d1al\u0257i",
    ftDayPrice: "50 XAF e \u00f1alawma (2 haa 5)",
    ftWeek: "Yontere wootere",
    ftWeekPrice: "300 XAF",
    ftMonth: "Lewru wootere",
    ftMonthPrice: "1 000 XAF",
    ftMin: "Mobile money ja\u0253ataa ko ustii 100 XAF, \u0257um wa\u0257i \u00f1al\u0257i 2 \u0253uri see\u0257a.",
    ftPhone: "Limoore mobile money (MTN walla Orange)",
    ftPay: "Yo\u0253 {n} XAF",
    ftWaiting: "Ja\u0253 njo\u0253di ndi e telefon maa. So hay huunde fe\u2019aani, uddit menu mobile money maa, ja\u0253 njo\u0253di habbiindi.",
    ftPaid: "Yo\u0253aama. \u0181ur\u0257o yiyeede haa {d}.",
    ftFailed: "Njo\u0253di ndi rewaani. Hay huunde \u01b4ettaaka.",
    ftUnderpaid: "Min ke\u0253ii ko ustii coggu. Golloo\u2019en Bambeh njokkondirta e maa e chat.",
    ftTimeout: "Min \u0257on habba mobile money. \u018aum fu\u0257\u0257an e hoore mum so njo\u0253di yottii.",
    ftPayErr: "Njo\u0253di waawaa fu\u0257\u0257aade: {e}",
    ftPhoneErr: "Winndu limoore MTN walla Orange (tonngooje 9).",
    close: "Uddu",
    e_not_signed_in: "Naatu e konte maa adii.",
    e_not_found: "Nokkuure nde alaa.",
    e_not_allowed: "A waawaa waylude nokkuure nde.",
    e_bad_name: "Hokku nokkuure innde (alkule 2 haa 80).",
    e_bad_kinds: "Su\u0253o hay gooto: gaas, restoran, soya walla liingu ju\u0257aa\u0257o.",
    e_bad_description: "Sifaa ndee juuti no feewi (alkule 800 \u0253uri).",
    e_bad_city: "Su\u0253o saare.",
    e_bad_area: "Su\u0253o walla winndu kartiye.",
    e_bad_landmark: "Maande nde juuti no feewi (alkule 160 \u0253uri).",
    e_bad_photos: "Natal gootal waawaa huutoreede. Itt ngal, \u0253eydu ngal kadi.",
    e_bad_open_days: "Su\u0253o \u00f1al\u0257i uddital.",
    e_bad_hours: "Hokku saa\u2019a uddital e saa\u2019a uddugol, walla hay gootal.",
    e_bad_price: "\u01b3eewto coggu (25 haa 1 000 000 XAF).",
    e_phone_in_text: "Itt limoore telefon walla link chat: soodoo\u0253e ina njokkondira e maa e chat Bambeh.",
    e_owner_not_found: "Konte Bambeh alaa e limoore walla email ngal. Wallu jom mayre winndaade adii.",
    e_owner_ambiguous: "Konteeji \u0257i\u0257i walla \u0253uri ina njaabi. Huutoro email jom mayre.",
    e_agent_not_found: "Konte Bambeh alaa e limoore walla email ajan.",
    e_agent_ambiguous: "Konteeji \u0257uu\u0257i ina njaabi ajan. Huutoro email makko.",
    e_too_many_lookups: "Etooje limoore \u0257uu\u0257i. Habbo saa\u2019a wootere, eto kadi.",
    e_owner_limit: "Jom mayre o jogii nokkuuje 5 e Bambeh.",
    e_daily_limit: "\u018auu\u0257i hannde. Eto jango.",
    e_bad_items: "\u01b3eewto diidi menu (innde alkule 2 haa 60, diidi 40 \u0253uri).",
    e_not_gas: "Jeeyoo\u0253e gaas tan njogii \u0257um.",
    e_staff_hidden: "Golloo\u2019en Bambeh suu\u0257ii nokkuure nde. Winndu wallitoo\u0253e Bambeh ngam hollude mo kadi.",
    e_own_business: "Ndee ko nokkuure maa.",
    e_no_bookings: "Nokkuure nde ja\u0253ataa hokkereeji.",
    e_bad_kind: "Nokkuure nde ja\u0253ataa \u0257uum hokkere.",
    e_bad_time: "Su\u0253o \u00f1alawma e saa\u2019a gila jooni (\u00f1al\u0257i 30 \u0253uri).",
    e_bad_people: "Wiy limoore yim\u0253e (1 haa 50).",
    e_too_long: "Binndi \u0257i juuti no feewi.",
    e_already_waiting: "A jogii hokkereeji habbii\u0257i e nokkuure nde. Habbo jaabawol e chat.",
    e_chat_failed: "Chat waawaa udditeede. Eto kadi.",
    e_already_answered: "Hokkere nde jaabaama ko adii.",
    e_bad_message: "Winndu bataake \u0257akkii\u0257o.",
    e_not_live: "Nokkuure nde foti ja\u0253eede ado mo wa\u0257eede dow.",
    e_bad_plan: "Su\u0253o feere.",
    e_bad_days: "Su\u0253o \u00f1al\u0257i 2 haa 5.",
    e_too_many: "Etooje njo\u0253di \u0257uu\u0257i. Habbo see\u0257a, eto kadi.",
    e_network: "Connexion alaa. \u01b3eewto internet maa, eto kadi.",
    e_generic: "Huunde mo\u01b4\u01b4aani. Eto kadi.",
    e_upload: "Natal ngal waawaa nelde. Eto kadi.",
  },
};

/** One sentence in the given language; {n}, {name}... are filled from vars. */
export function ft(lang: FoodLang, key: FoodKey, vars?: Record<string, string | number>): string {
  const table = FOOD_TEXT[lang] || FOOD_TEXT.en;
  let s: string = table[key] || FOOD_TEXT.en[key] || String(key);
  if (vars) {
    for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
  }
  return s;
}

/** The menu label ("Gas & food") for the header, in the app language. */
export function foodNavLabel(raw: unknown): string {
  return ft(normFoodLang(raw), 'nav');
}

/** The server's reason ("bad_name", "phone_in_text"...) as a sentence. */
export function reasonText(lang: FoodLang, reason: unknown): string {
  const key = ('e_' + String(reason || 'generic')) as FoodKey;
  return key in FOOD_TEXT.en ? ft(lang, key) : ft(lang, 'e_generic');
}

/** The language, its direction and a t() for the gas & food pages; follows language changes. */
export function useFoodText(): { lang: FoodLang; dir: 'rtl' | 'ltr'; t: (key: FoodKey, vars?: Record<string, string | number>) => string } {
  const lang = normFoodLang(useLang());
  return { lang, dir: foodDir(lang), t: (key: FoodKey, vars?: Record<string, string | number>) => ft(lang, key, vars) };
}

/** The picture beside each kind: a flame for gas, cutlery, a cut of meat, a fish. */
export const KIND_ICON: Record<FoodKind, LucideIcon> = { gas: Flame, restaurant: UtensilsCrossed, grill: Beef, fish: Fish };

export function kindLabel(lang: FoodLang, kind: string, plural = false): string {
  const k = (FOOD_KINDS as readonly string[]).indexOf(kind) >= 0 ? kind : 'restaurant';
  return ft(lang, ((plural ? 'k_' : 'one_') + k) as FoodKey);
}

// ------------------------------------------------------------------ cities and neighbourhoods
export interface AreaDef { key: string; label: string; launch: boolean }

const CITY_LABELS: Record<CityKey, Record<FoodLang, string>> = {
  yaounde: { en: "Yaound\u00e9", fr: "Yaound\u00e9", pidgin: "Yaound\u00e9", ar: "\u064a\u0627\u0648\u0646\u062f\u064a", ff: "Yaound\u00e9" },
  bamenda: { en: "Bamenda", fr: "Bamenda", pidgin: "Bamenda", ar: "\u0628\u0627\u0645\u064a\u0646\u062f\u0627", ff: "Bamenda" },
  douala: { en: "Douala", fr: "Douala", pidgin: "Douala", ar: "\u062f\u0648\u0627\u0644\u0627", ff: "Douala" },
  limbe: { en: "Limbe", fr: "Limb\u00e9", pidgin: "Limbe", ar: "\u0644\u064a\u0645\u0628\u064a", ff: "Limbe" },
  southwest: { en: "South West (Buea, Kumba)", fr: "Sud-Ouest (Buea, Kumba)", pidgin: "South West (Buea, Kumba)", ar: "\u0627\u0644\u062c\u0646\u0648\u0628 \u0627\u0644\u063a\u0631\u0628\u064a (\u0628\u0648\u064a\u0627\u060c \u0643\u0648\u0645\u0628\u0627)", ff: "Sud-Ouest (Buea, Kumba)" },
};

export const AREAS: Record<CityKey, readonly AreaDef[]> = {
  yaounde: [{ key: "mimboman", label: "Mimboman", launch: true }, { key: "essos", label: "Essos", launch: false }, { key: "bastos", label: "Bastos", launch: false }, { key: "obili", label: "Obili", launch: false }],
  bamenda: [{ key: "up_station", label: "Up Station", launch: true }, { key: "old_town", label: "Old Town", launch: false }, { key: "nkwen", label: "Nkwen", launch: false }, { key: "bambili", label: "Bambili", launch: false }, { key: "azire", label: "Azire", launch: false }],
  douala: [{ key: "bonaberi", label: "Bonab\u00e9ri", launch: false }, { key: "bonapriso", label: "Bonapriso", launch: false }, { key: "new_bell", label: "New Bell", launch: false }],
  limbe: [{ key: "down_beach", label: "Down Beach", launch: false }, { key: "limbe_town", label: "Limbe Town", launch: false }],
  southwest: [{ key: "sandpit", label: "Sandpit", launch: false }, { key: "malingo", label: "Malingo", launch: false }, { key: "ub_junction", label: "UB Junction", launch: false }, { key: "checkpoint", label: "Checkpoint", launch: false }, { key: "mile_17", label: "Mile 17", launch: false }, { key: "muea", label: "Muea", launch: false }, { key: "ekona", label: "Ekona", launch: false }, { key: "fiango", label: "Fiango", launch: false }, { key: "ccass_junction", label: "CCASS Junction", launch: false }],
};

export function isCityKey(v: unknown): v is CityKey {
  return (CITY_KEYS as readonly string[]).indexOf(String(v)) >= 0;
}

export function cityLabel(city: unknown, lang: FoodLang): string {
  return isCityKey(city) ? CITY_LABELS[city][lang] || CITY_LABELS[city].en : String(city || '');
}

/** Up Station and Mimboman first: where Bambeh starts. */
export const LAUNCH_AREAS: ReadonlyArray<{ city: CityKey; area: AreaDef }> = CITY_KEYS.reduce(
  (acc: Array<{ city: CityKey; area: AreaDef }>, city) => acc.concat(AREAS[city].filter((a) => a.launch).map((a) => ({ city, area: a }))),
  [],
).sort((a, b) => (a.city === 'bamenda' ? -1 : 0) - (b.city === 'bamenda' ? -1 : 0));

/** "Mile 17" -> "mile_17"; the key the database stores for a typed neighbourhood. */
export function slugArea(label: string): string {
  const s = String(label || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40).replace(/_+$/g, '');
  return s.length >= 2 ? s : '';
}

export function knownArea(city: unknown, key: unknown): AreaDef | null {
  if (!isCityKey(city)) return null;
  const hit = AREAS[city].filter((a) => a.key === key);
  return hit.length ? hit[0] : null;
}

// ------------------------------------------------------------------ Cameroon time (UTC+1, no summer time)
export function doualaNow(d: Date = new Date()): { day: number; minutes: number; ymd: string } {
  const x = new Date(d.getTime() + 3600 * 1000);
  return {
    day: x.getUTCDay(),
    minutes: x.getUTCHours() * 60 + x.getUTCMinutes(),
    ymd: x.toISOString().slice(0, 10),
  };
}

function toMinutes(hhmm: string | null | undefined): number | null {
  const m = /^([01]?[0-9]|2[0-3]):([0-5][0-9])/.exec(String(hhmm || ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** open / closed now, or unknown when no hours were given. Handles grills open past midnight. */
export function openState(days: readonly number[] | null | undefined, opens: string | null | undefined,
                          closes: string | null | undefined, now: Date = new Date()): 'open' | 'closed' | 'unknown' {
  const o = toMinutes(opens);
  const c = toMinutes(closes);
  if (o === null || c === null) return 'unknown';
  const list = Array.isArray(days) && days.length ? days : [0, 1, 2, 3, 4, 5, 6];
  const { day, minutes } = doualaNow(now);
  const prev = (day + 6) % 7;
  if (c > o) return list.indexOf(day) >= 0 && minutes >= o && minutes < c ? 'open' : 'closed';
  if (list.indexOf(day) >= 0 && minutes >= o) return 'open';
  if (list.indexOf(prev) >= 0 && minutes < c) return 'open';
  return 'closed';
}

/** "Opens at 17:00" when it opens later today, else null. */
export function opensLaterToday(days: readonly number[] | null | undefined, opens: string | null | undefined,
                                now: Date = new Date()): string | null {
  const o = toMinutes(opens);
  if (o === null) return null;
  const list = Array.isArray(days) && days.length ? days : [0, 1, 2, 3, 4, 5, 6];
  const { day, minutes } = doualaNow(now);
  return list.indexOf(day) >= 0 && minutes < o ? String(opens).slice(0, 5) : null;
}

export function dayShort(lang: FoodLang, i: number): string {
  return ft(lang, ('d' + (((i % 7) + 7) % 7)) as FoodKey);
}

/** "Mon, Tue, Wed..." in week order starting Monday, or "Every day". */
export function daysText(lang: FoodLang, days: readonly number[] | null | undefined): string {
  const list = Array.isArray(days) ? days : [];
  if (list.length === 0 || list.length === 7) return ft(lang, 'everyDay');
  return [1, 2, 3, 4, 5, 6, 0].filter((d) => list.indexOf(d) >= 0).map((d) => dayShort(lang, d)).join(', ');
}

// ------------------------------------------------------------------ numbers and dates
export function fmtXaf(n: number | null | undefined, lang: FoodLang): string {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  const sep = lang === 'fr' || lang === 'ff' ? ' ' : ',';
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

function localeOf(lang: FoodLang): string {
  return lang === 'fr' || lang === 'ff' ? 'fr-FR' : lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
}

/** "Sat 12 Oct, 19:30" in Cameroon time. */
export function fmtWhen(iso: string | null | undefined, lang: FoodLang): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    const day = d.toLocaleDateString(localeOf(lang), { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Douala' });
    const time = d.toLocaleTimeString(localeOf(lang), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Douala' });
    return day + ', ' + time;
  } catch {
    const x = new Date(d.getTime() + 3600 * 1000);
    return x.toISOString().slice(0, 16).replace('T', ' ');
  }
}

/** "12 Oct 2026" in Cameroon time. */
export function fmtDate(iso: string | null | undefined, lang: FoodLang): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Douala' });
  } catch {
    return new Date(d.getTime() + 3600 * 1000).toISOString().slice(0, 10);
  }
}

/** "Today 14:05" or "12 Oct 14:05" - when the gas answer was given. */
export function fmtSince(iso: string | null | undefined, lang: FoodLang): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const today = doualaNow().ymd === doualaNow(d).ymd;
  let time = '';
  try {
    time = d.toLocaleTimeString(localeOf(lang), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Douala' });
  } catch {
    time = new Date(d.getTime() + 3600 * 1000).toISOString().slice(11, 16);
  }
  return (today ? ft(lang, 'dayToday') : fmtDate(iso, lang)) + ' ' + time;
}

// ------------------------------------------------------------------ Bambeh chat only
/** Same rule as the database: a Cameroon phone number or a WhatsApp / Telegram link. */
export function hasPhoneNumber(text: string | null | undefined): boolean {
  const v = String(text || '');
  if (/(wa\.me|whatsapp\.com|t\.me\/|chat\.whatsapp)/i.test(v)) return true;
  const joined = v.replace(/([0-9])[\s.()\/-]+(?=[0-9+])/g, '$1');
  return /(^|[^0-9])(\+?237|00237)?[26][0-9]{8}([^0-9]|$)/.test(joined);
}

/** Cameroon mobile money number (MTN or Orange), as 9 digits, or null. */
export function momoNumber(raw: string | null | undefined): string | null {
  let d = String(raw || '').replace(/[^0-9]/g, '');
  if (d.indexOf('00237') === 0) d = d.slice(5);
  else if (d.indexOf('237') === 0 && d.length === 12) d = d.slice(3);
  return /^6[5-9][0-9]{7}$/.test(d) ? d : null;
}
// BAMBEH_END_TOKEN__FOOD_GAS_TEXT_FIX688__COMPLETE
