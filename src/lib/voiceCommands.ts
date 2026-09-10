// BAMBEH_DEPLOY_TOKEN__VOICECOMMANDS_FIX526_CLEAN
/**
 * src/lib/voiceCommands.ts - Bambeh Marketplace
 *
 * FIX526 - WHAT THE WORDS MEAN. The grammar, in five languages.
 * -------------------------------------------------------------
 * Every route below was read out of App.tsx, not invented. If a path is in this
 * file it exists in the router.
 *
 * TWO RULES THAT SHAPE EVERYTHING HERE
 *
 * 1. VOICE NEVER SPENDS MONEY.
 *    "Bambeh, pay" can open the checkout. It cannot press pay. A recogniser that
 *    hears "cinq cents" as "cinq mille" would move real money on a mishearing,
 *    and no amount of confirmation dialogue makes that a good idea on a 2G line
 *    in a noisy market. Navigation, search and filling a field: yes. Committing
 *    a payment: never. This is not a limitation I will be talked out of.
 *
 * 2. IT ALWAYS DOES SOMETHING.
 *    If nothing matches a command, the whole sentence becomes a search. A user
 *    who says "red Toyota Corolla" gets results, not "sorry, I did not
 *    understand". Unmatched speech is the common case, so it has to be the
 *    useful one.
 *
 * MATCHING IS BY MEANING, NOT BY STRING
 *    Accents are folded, punctuation stripped, and the LONGEST phrase wins, so
 *    "farm fresh" is never swallowed by "farm". Every phrase is checked as a
 *    whole word, so "car" cannot match inside "carte".
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

export type VoiceAction =
  | { kind: 'navigate'; path: string; label: string }
  | { kind: 'search'; query: string }
  | { kind: 'back' }
  | { kind: 'help' };

/** fold accents and punctuation so "march\u00e9" and "marche" are one thing */
export function fold(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * phrase -> destination. Keys are already folded.
 * Order does not matter; the longest match wins at lookup time.
 */
interface Dest { path: string; label: string; phrases: string[] }

const DESTINATIONS: Dest[] = [
  { path: '/marketplace', label: 'Marketplace', phrases: [
    'marketplace', 'market place', 'market', 'marche', 'le marche', 'boutique',
    'shop', 'shopping', 'buy something', 'i want to buy', 'go market',
    '\u0627\u0644\u0633\u0648\u0642', 'luumo'] },
  { path: '/marketplace/sell', label: 'Sell an item', phrases: [
    'sell', 'sell something', 'sell an item', 'i want to sell', 'vendre',
    'je veux vendre', 'post item', 'i wan sell', 'yeeyde'] },
  { path: '/jobs', label: 'Jobs', phrases: [
    'jobs', 'job', 'work', 'find work', 'emploi', 'emplois', 'travail',
    'i need work', 'i wan work', 'golle', '\u0648\u0638\u0627\u0626\u0641'] },
  { path: '/jobs/post', label: 'Post a job', phrases: [
    'post a job', 'post job', 'publier une offre', 'hire', 'i want to hire'] },
  { path: '/services', label: 'Services', phrases: [
    'services', 'service', 'artisan', 'repair', 'reparation', 'plumber',
    'electrician', '\u062e\u062f\u0645\u0627\u062a'] },
  { path: '/rentals', label: 'Rentals', phrases: [
    'rentals', 'rental', 'rent', 'house', 'houses', 'room', 'apartment',
    'location', 'maison', 'chambre', 'i wan house', 'suudu'] },
  { path: '/vehicles', label: 'Vehicles', phrases: [
    'vehicles', 'vehicle', 'cars', 'car', 'moto', 'motorcycle', 'bike',
    'voiture', 'voitures', 'vehicule', '\u0633\u064a\u0627\u0631\u0627\u062a'] },
  { path: '/exchange', label: 'Exchange', phrases: [
    'exchange', 'swap', 'trade', 'echange', 'troc'] },
  { path: '/farm-fresh', label: 'Farm Fresh', phrases: [
    'farm fresh', 'farmfresh', 'farm', 'ferme', 'produce', 'vegetables',
    'food', 'nourriture', 'chop', 'ndiyam'] },
  { path: '/community', label: 'Community', phrases: [
    'community', 'communaute', 'groups', 'njangi', 'tontine'] },
  { path: '/cart', label: 'Cart', phrases: [
    'cart', 'my cart', 'basket', 'panier', 'mon panier'] },
  { path: '/orders', label: 'My orders', phrases: [
    'orders', 'my orders', 'commandes', 'mes commandes', 'my order'] },
  { path: '/my-listings', label: 'My listings', phrases: [
    'my listings', 'my ads', 'my items', 'mes annonces', 'my post'] },
  { path: '/chat', label: 'Messages', phrases: [
    'chat', 'messages', 'message', 'inbox', 'discussions', 'my message'] },
  { path: '/notifications', label: 'Notifications', phrases: [
    'notifications', 'alerts me', 'my notifications'] },
  { path: '/profile', label: 'Profile', phrases: [
    'profile', 'my profile', 'profil', 'mon profil', 'account', 'compte'] },
  { path: '/favorites', label: 'Favourites', phrases: [
    'favourites', 'favorites', 'saved', 'favoris', 'wishlist'] },
  { path: '/coins', label: 'Zerm Coins', phrases: [
    'coins', 'zerm', 'zerm coins', 'my coins', 'pieces'] },
  { path: '/referral', label: 'Invite friends', phrases: [
    'referral', 'invite', 'invite friends', 'parrainage', 'inviter'] },
  { path: '/subscription', label: 'Subscription', phrases: [
    'subscription', 'subscribe', 'premium', 'abonnement', "s'abonner"] },
  { path: '/safety', label: 'Safety alerts', phrases: [
    'safety', 'safety alerts', 'danger', 'security', 'securite', 'alerte'] },
  { path: '/pharmacies', label: 'Pharmacies on call', phrases: [
    'pharmacy', 'pharmacies', 'pharmacie', 'chemist', 'medicine', 'drug store'] },
  { path: '/hospitals', label: 'Hospitals on duty', phrases: [
    'hospital', 'hospitals', 'hopital', 'clinic', 'doctor', 'docteur'] },
  { path: '/water-lights', label: 'Water & Lights', phrases: [
    'water', 'light', 'lights', 'water and lights', 'electricity', 'power',
    'eau', 'lumiere', 'courant', 'no light', 'ndiyam e ndiyam'] },
  { path: '/fuel', label: 'Fuel at night', phrases: [
    'fuel', 'petrol', 'gas', 'fuel at night', 'essence', 'carburant', 'filling station'] },
  { path: '/help', label: 'Help', phrases: [
    'help', 'aide', 'support', 'assistance', 'how to use', '\u0645\u0633\u0627\u0639\u062f\u0629'] },
  { path: '/settings', label: 'Settings', phrases: [
    'settings', 'parametres', 'reglages', 'preferences'] },
  { path: '/', label: 'Home', phrases: [
    'home', 'accueil', 'main page', 'go home', 'start'] },
  // Voice may OPEN the checkout. It may never complete it. See rule 1 above.
  { path: '/payment/checkout', label: 'Checkout', phrases: [
    'checkout', 'pay', 'payment', 'payer', 'paiement', 'i want to pay', 'pay now'] },
  { path: '/escrow', label: 'Buyer protection', phrases: [
    'escrow', 'buyer protection', 'protection'] },
];

/** phrases that mean "take me back" */
const BACK_PHRASES = ['back', 'go back', 'retour', 'reviens', 'previous', 'return'];

/** words that introduce a search, stripped before the query is taken */
const SEARCH_PREFIXES = [
  'search for', 'search', 'find me', 'find', 'look for', 'show me', 'show',
  'i am looking for', 'i want', 'i need',
  'cherche', 'chercher', 'recherche', 'rechercher', 'trouve', 'trouver',
  'montre moi', 'montre', 'je cherche', 'je veux', 'il me faut',
  'i wan', 'i dey find', 'find me some',
  '\u0627\u0628\u062d\u062b \u0639\u0646', '\u0627\u0628\u062d\u062b', '\u0623\u0631\u064a\u062f',
  'yiylo', 'njiylo',
];

/** wake words people naturally prefix, removed before matching */
const WAKE_WORDS = ['bambeh', 'bambe', 'hey bambeh', 'ok bambeh'];

/* lookup table built once, longest phrase first so "farm fresh" beats "farm" */
const LOOKUP: Array<{ phrase: string; dest: Dest }> = DESTINATIONS
  .flatMap((d) => d.phrases.map((p) => ({ phrase: fold(p), dest: d })))
  .filter((x) => x.phrase.length > 0)
  .sort((a, b) => b.phrase.length - a.phrase.length);

const SORTED_PREFIXES = SEARCH_PREFIXES.map(fold).sort((a, b) => b.length - a.length);

/**
 * Filler that survives a prefix and would otherwise poison the query.
 * "find me A car" must search for a car, not for "a car"; "i want TO sell"
 * must reach the sell page, not search for "to sell".
 */
const LEADING_FILLER = ['to', 'a', 'an', 'the', 'some', 'for', 'me',
                        'un', 'une', 'des', 'du', 'de', 'le', 'la', 'les'];

function stripFiller(s: string): string {
  let out = s;
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of LEADING_FILLER) {
      if (out === f) return '';
      if (out.startsWith(f + ' ')) { out = out.slice(f.length + 1); changed = true; break; }
    }
  }
  return out.trim();
}

/** exact destination hit only - used to rescue "je veux VENDRE" from search */
function exactDestination(t: string): Dest | null {
  for (const { phrase, dest } of LOOKUP) if (t === phrase) return dest;
  return null;
}

/** whole-phrase match, so "car" cannot fire inside "carte" */
function containsPhrase(haystack: string, needle: string): boolean {
  const i = haystack.indexOf(needle);
  if (i < 0) return false;
  const before = i === 0 ? ' ' : haystack[i - 1];
  const after = i + needle.length >= haystack.length ? ' ' : haystack[i + needle.length];
  return before === ' ' && after === ' ';
}

/**
 * Turn what was heard into something the app can do.
 * Returns null only for an empty transcript - never for "I did not understand".
 */
export function interpret(rawTranscript: string): VoiceAction | null {
  let t = fold(rawTranscript);
  if (!t) return null;

  // drop a wake word if they used one
  for (const w of WAKE_WORDS.map(fold).sort((a, b) => b.length - a.length)) {
    if (t === w) return { kind: 'help' };
    if (t.startsWith(w + ' ')) { t = t.slice(w.length + 1); break; }
  }
  if (!t) return { kind: 'help' };

  if (BACK_PHRASES.map(fold).some((p) => t === p)) return { kind: 'back' };

  // an explicit search beats a destination: "find me a car" is a search for a
  // car, not a jump to the Vehicles page.
  for (const p of SORTED_PREFIXES) {
    if (t === p) break;                       // just the verb, nothing to search
    if (t.startsWith(p + ' ')) {
      const q = stripFiller(t.slice(p.length + 1).trim());
      if (!q) break;
      // "find me a car" and "je veux vendre" name a WHOLE section, not a thing
      // to search for. Taking them to the section is the better answer.
      const d = exactDestination(q);
      if (d) return { kind: 'navigate', path: d.path, label: d.label };
      return { kind: 'search', query: q };
    }
  }

  // a destination, longest phrase first
  for (const { phrase, dest } of LOOKUP) {
    if (t === phrase || containsPhrase(t, phrase)) {
      return { kind: 'navigate', path: dest.path, label: dest.label };
    }
  }

  // rule 2: anything else is a search. Never a dead end.
  const q = stripFiller(t);
  return { kind: 'search', query: q || t };
}

/** where an action sends the user. Search goes through the real /search route. */
export function actionToPath(a: VoiceAction): string | null {
  if (a.kind === 'navigate') return a.path;
  if (a.kind === 'search') return '/search?q=' + encodeURIComponent(a.query);
  return null;
}
// BAMBEH_END_TOKEN__VOICECOMMANDS_FIX526__COMPLETE
