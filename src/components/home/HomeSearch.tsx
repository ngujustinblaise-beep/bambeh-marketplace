// BAMBEH_DEPLOY_TOKEN__HOME_SEARCH_FIX820_CLEAN
/**
 * src/components/home/HomeSearch.tsx - FIX820 (new, 18 Oct 2026) - the instant search on Home
 *
 * Big, 18 Oct 2026: "how can we include the instant search pane on the home screen".
 * On a phone the only search box was inside the menu (Header). Now it is the first thing on Home:
 *  - TYPE AND SEE: from 2 letters, while she types (a quarter of a second after she stops):
 *      Sections & free help - straight away, even offline: "gaz" -> Cooking gas, "pharmacie" -> Pharmacies on call,
 *                             "chambre" -> Rentals... (the words people use, in the five languages)
 *      On Bambeh now        - the adverts, rentals, jobs, services, vehicles, Farm Fresh products and swaps whose
 *                             title, category or town has those words (6 at most), each opening its own page
 *      "See all results"    - the full search page (/search, FIX126) with its filters
 *  - Nothing found? "Selling one? Post it free" - the way to the advert form.
 *  - An empty box shows her recent searches (kept on this phone only, with Clear) and popular ones.
 *  - WHAT PEOPLE SEARCH FOR is counted (database FIX818) once she stops typing: the words and how many things were
 *    found - never who searched, never anything that looks like a phone number or an email. Command Center > Views &
 *    visits (FIX819) shows the most searched words and the ones that found nothing.
 *  - Five languages, Arabic right to left. Enter opens the full search; Escape clears; the arrow keys move through
 *    the results.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Loader2, Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { storeAllows } from '@/config/storeMode';

type L = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
export function hsLang(v: unknown): L {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

type Kind = 'marketplace' | 'rental' | 'job' | 'service' | 'vehicle' | 'farm' | 'exchange';
type Words = {
  label: string; ph: string; clear: string; sections: string; items: string; searching: string; nothing: string;
  sell: string; seeAll: string; recent: string; clearRecent: string; popular: string; offline: string;
  kinds: Record<Kind, string>; popularList: string[];
};
export const HS_TEXT: Record<L, Words> = {
  en: {
    label: 'Search Bambeh', ph: 'Search Bambeh: gas, phones, rooms, jobs...', clear: 'Clear the search',
    sections: 'Sections & free help', items: 'On Bambeh now', searching: 'Searching...',
    nothing: 'Nothing on Bambeh for "{q}" yet.', sell: 'Selling one? Post it free', seeAll: 'See all results for "{q}"',
    recent: 'Recent searches', clearRecent: 'Clear', popular: 'Popular', offline: 'Could not reach Bambeh - sections only.',
    kinds: { marketplace: 'Marketplace', rental: 'Rental', job: 'Job', service: 'Service', vehicle: 'Vehicle', farm: 'Farm Fresh', exchange: 'Exchange' },
    popularList: ['Cooking gas', 'Apartment', 'Phone', 'Pharmacy on call', 'Jobs', 'Car'],
  },
  fr: {
    label: 'Rechercher sur Bambeh', ph: 'Rechercher : gaz, t\u00e9l\u00e9phones, chambres, emplois...', clear: 'Effacer la recherche',
    sections: 'Rubriques et aide gratuite', items: 'Sur Bambeh maintenant', searching: 'Recherche...',
    nothing: 'Rien sur Bambeh pour \u00ab {q} \u00bb pour l\u2019instant.', sell: 'Vous en vendez ? Publiez gratuitement',
    seeAll: 'Voir tous les r\u00e9sultats pour \u00ab {q} \u00bb', recent: 'Recherches r\u00e9centes', clearRecent: 'Effacer',
    popular: 'Populaire', offline: 'Impossible de joindre Bambeh - rubriques seulement.',
    kinds: { marketplace: 'March\u00e9', rental: 'Location', job: 'Emploi', service: 'Service', vehicle: 'V\u00e9hicule', farm: 'Produits frais', exchange: '\u00c9change' },
    popularList: ['Gaz', 'Appartement', 'T\u00e9l\u00e9phone', 'Pharmacie de garde', 'Emploi', 'Voiture'],
  },
  pidgin: {
    label: 'Search Bambeh', ph: 'Search Bambeh: gas, phone, room, work...', clear: 'Clear the search',
    sections: 'Sections and free help', items: 'For Bambeh now', searching: 'We dey search...',
    nothing: 'Nothing for Bambeh for "{q}" yet.', sell: 'You get am for sell? Post am free', seeAll: 'See all result for "{q}"',
    recent: 'Wetin you search before', clearRecent: 'Clear am', popular: 'Wetin people dey find', offline: 'We no fit reach Bambeh - na only sections.',
    kinds: { marketplace: 'Market', rental: 'Rent', job: 'Work', service: 'Service', vehicle: 'Motor', farm: 'Farm chop', exchange: 'Swap' },
    popularList: ['Cooking gas', 'House for rent', 'Phone', 'Pharmacy wey open', 'Work', 'Motor'],
  },
  ar: {
    label: '\u0627\u0628\u062d\u062b \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647', ph: '\u0627\u0628\u062d\u062b \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647: \u063a\u0627\u0632\u060c \u0647\u0648\u0627\u062a\u0641\u060c \u063a\u0631\u0641\u060c \u0648\u0638\u0627\u0626\u0641...',
    clear: '\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b',
    sections: '\u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0648\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629', items: '\u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0627\u0644\u0622\u0646',
    searching: '\u062c\u0627\u0631\u064d \u0627\u0644\u0628\u062d\u062b...',
    nothing: '\u0644\u0627 \u0634\u064a\u0621 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0640 \u00ab{q}\u00bb \u062d\u062a\u0649 \u0627\u0644\u0622\u0646.',
    sell: '\u0647\u0644 \u062a\u0628\u064a\u0639 \u0648\u0627\u062d\u062f\u064b\u0627\u061f \u0627\u0646\u0634\u0631\u0647 \u0645\u062c\u0627\u0646\u064b\u0627',
    seeAll: '\u0643\u0644 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0644\u0640 \u00ab{q}\u00bb', recent: '\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0623\u062e\u064a\u0631\u0629',
    clearRecent: '\u0645\u0633\u062d', popular: '\u0627\u0644\u0623\u0643\u062b\u0631 \u0637\u0644\u0628\u064b\u0627',
    offline: '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 - \u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0641\u0642\u0637.',
    kinds: {
      marketplace: '\u0627\u0644\u0633\u0648\u0642', rental: '\u0625\u064a\u062c\u0627\u0631', job: '\u0648\u0638\u064a\u0641\u0629', service: '\u062e\u062f\u0645\u0629',
      vehicle: '\u0645\u0631\u0643\u0628\u0629', farm: '\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0632\u0631\u0639\u0629', exchange: '\u0645\u0642\u0627\u064a\u0636\u0629',
    },
    popularList: ['\u063a\u0627\u0632 \u0627\u0644\u0637\u0628\u062e', '\u0634\u0642\u0629', '\u0647\u0627\u062a\u0641', '\u0635\u064a\u062f\u0644\u064a\u0629 \u0645\u0646\u0627\u0648\u0628\u0629', '\u0648\u0638\u0627\u0626\u0641', '\u0633\u064a\u0627\u0631\u0629'],
  },
  ff: {
    label: 'Yiylo e Bambeh', ph: 'Yiylo e Bambeh: gaas, telefon, suudu, golle...', clear: 'Momtu yiylo',
    sections: 'Bolle e ballal meere', items: 'E Bambeh jooni', searching: 'Ina yiyla...',
    nothing: 'Hay huunde e Bambeh ngam "{q}" tawo.', sell: 'A jeeyay? Bayyin \u0257um meere', seeAll: 'Yiy nje\u00f1tudi fof ngam "{q}"',
    recent: 'Yiylo \u0253ooy\u0257i', clearRecent: 'Momtu', popular: '\u0181ur\u0257i yiyleede', offline: 'Men mbaawaa yottaade Bambeh - bolle tan.',
    kinds: { marketplace: 'Luumo', rental: 'Luwe', job: 'Golle', service: 'Sarwis', vehicle: 'Oto', farm: '\u00d1amdu ndema', exchange: 'Waylugol' },
    popularList: ['Gaas', 'Suudu luwe', 'Telefon', 'Farmasi', 'Golle', 'Oto'],
  },
};

// ------------------------------------------------------------------ the sections, and the words people use for them
type Section = { path: string; emoji: string; name: Record<L, string>; words: string };
const S = (path: string, emoji: string, en: string, fr: string, pidgin: string, ar: string, ff: string, words: string): Section =>
  ({ path, emoji, name: { en, fr, pidgin, ar, ff }, words });
export const HS_SECTIONS: readonly Section[] = [
  S('/marketplace', '\ud83d\udecd\ufe0f', 'Marketplace', 'March\u00e9', 'Market', '\u0627\u0644\u0633\u0648\u0642', 'Luumo',
    'marketplace market marche buy sell acheter vendre shop boutique phone telephone iphone samsung tecno infinix laptop ordinateur computer tv television fridge frigo refrigerateur clothes habits vetements shoes chaussures furniture meuble meubles electronics electronique sood jaay'),
  S('/food-gas/gas', '\ud83d\udd25', 'Cooking gas', 'Gaz domestique', 'Cooking gas', '\u063a\u0627\u0632 \u0627\u0644\u0637\u0628\u062e', 'Gaas defirde',
    'gas gaz cooking bottle bouteille cylinder recharge tradex camgaz camgas glocal sctm gaas \u063a\u0627\u0632'),
  S('/rentals', '\ud83c\udfe0', 'Rentals', 'Locations', 'House for rent', '\u0627\u0644\u0625\u064a\u062c\u0627\u0631\u0627\u062a', 'Luwe',
    'rent rental rentals house maison appartement apartment flat studio chambre room rooms loyer louer logement location duplex villa bureau office suudu \u0634\u0642\u0629 \u0645\u0646\u0632\u0644 \u0625\u064a\u062c\u0627\u0631'),
  S('/jobs', '\ud83d\udcbc', 'Jobs', 'Emplois', 'Work', '\u0648\u0638\u0627\u0626\u0641', 'Golle',
    'job jobs work emploi emplois travail stage internship recrutement hiring vacancy driver chauffeur golle \u0648\u0638\u064a\u0641\u0629 \u0639\u0645\u0644'),
  S('/services', '\ud83d\udd27', 'Services', 'Services', 'Services', '\u062e\u062f\u0645\u0627\u062a', 'Sarwisaaji',
    'service services plumber plombier electrician electricien mechanic mecanicien repair reparation coiffure hairdresser barber tailor couturier cleaning menage mason macon painter peintre carpenter menuisier sarwis \u062e\u062f\u0645\u0629'),
  S('/vehicles', '\ud83d\ude97', 'Vehicles', 'V\u00e9hicules', 'Motor', '\u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062a', 'Otooji',
    'car cars voiture voitures vehicle vehicles vehicule moto motorbike bike truck camion bus toyota oto \u0633\u064a\u0627\u0631\u0629'),
  S('/exchange', '\ud83d\udd04', 'Exchange', '\u00c9change', 'Swap', '\u0627\u0644\u0645\u0642\u0627\u064a\u0636\u0629', 'Waylugol',
    'exchange swap troc echange trade waylugol \u0645\u0642\u0627\u064a\u0636\u0629'),
  S('/food-gas/food', '\ud83c\udf72', 'Food', 'Nourriture', 'Chop', '\u0627\u0644\u0637\u0639\u0627\u0645', '\u00d1amdu',
    'food nourriture chop restaurant resto soya suya grill braise poisson fish ndole eru achu koki okok ekwang poulet chicken \u00f1amdu \u0645\u0637\u0639\u0645 \u0637\u0639\u0627\u0645'),
  S('/farm-fresh', '\ud83e\udd6c', 'Farm Fresh', 'Produits frais', 'Farm chop', '\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0632\u0631\u0639\u0629', '\u00d1amdu ndema',
    'farm fresh ferme tomato tomate tomatoes vegetables legumes fruits plantain banane macabo manioc cassava egg oeufs ndema \u0645\u0632\u0631\u0639\u0629'),
  S('/compare', '\u2696\ufe0f', 'Compare items', 'Comparer', 'Compare', '\u0642\u0627\u0631\u0646', 'Fotondir',
    'compare comparer comparison comparaison price prix cheapest moins cher'),
  S('/group-buying', '\ud83d\udc65', 'Group buying', 'Achat group\u00e9', 'Buy together', '\u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u062c\u0645\u0627\u0639\u064a', 'Soodugol e jamaa',
    'group buying achat groupe together ensemble bulk gros discount reduction'),
  S('/escrow', '\ud83d\udee1\ufe0f', 'Buyer protection', 'Protection acheteur', 'Buyer protection', '\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0645\u0634\u062a\u0631\u064a', 'Ndeenka soodoowo',
    'escrow buyer protection protection acheteur sequestre safe payment paiement securise refund remboursement'),
  S('/coins', '\ud83e\ude99', 'Zerm Coins', 'Pi\u00e8ces Zerm', 'Zerm Coins', '\u0639\u0645\u0644\u0627\u062a \u0632\u064a\u0631\u0645', 'Zerm Coins',
    'zerm coins coin pieces points rewards recompenses'),
  S('/community', '\ud83e\udd1d', 'Community', 'Communaut\u00e9', 'Community', '\u0627\u0644\u0645\u062c\u062a\u0645\u0639', 'Renndo',
    'community communaute group groupe njangi tontine association renndo'),
  S('/ai-chat', '\ud83e\udd16', 'Bambeh AI', 'IA Bambeh', 'Bambeh AI', '\u0630\u0643\u0627\u0621 \u0628\u0627\u0645\u0628\u064a\u0647', 'Bambeh AI',
    'ai ia assistant chatbot robot question help aide'),
  S('/deals', '\u26a1', 'Flash deals', 'Ventes flash', 'Flash deals', '\u0639\u0631\u0648\u0636 \u0633\u0631\u064a\u0639\u0629', 'Coggu leggal',
    'deals flash promo promotion offre offer discount solde soldes'),
  S('/meet-safely', '\ud83d\udccd', 'Meet safely', 'Rencontre s\u00fbre', 'Meet safe', '\u0627\u0644\u062a\u0642\u0650 \u0628\u0623\u0645\u0627\u0646', 'Hawru e kisal',
    'meet safely rencontre safe securite meeting point rendez vous'),
  S('/pharmacies', '\ud83d\udc8a', 'Pharmacies on call', 'Pharmacies de garde', 'Pharmacy wey open', '\u0627\u0644\u0635\u064a\u062f\u0644\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629', 'Farmasiije',
    'pharmacy pharmacie pharmacies medicine medicament medicaments drug garde night nuit farmasi \u0635\u064a\u062f\u0644\u064a\u0629 \u062f\u0648\u0627\u0621'),
  S('/womens-health', '\ud83e\ude7a', "Women's health", 'Sant\u00e9 des femmes', 'Woman health', '\u0635\u062d\u0629 \u0627\u0644\u0645\u0631\u0623\u0629', 'Cellal rew\u0253e',
    'women woman health sante femme femmes maternity maternite pregnancy pregnant grossesse enceinte midwife sage gynecologue antenatal cpn screening depistage \u062d\u0645\u0644'),
  S('/fuel', '\u26fd', 'Fuel at night', 'Carburant la nuit', 'Fuel for night', '\u0648\u0642\u0648\u062f \u0644\u064a\u0644\u0627\u064b', 'Esans jemma',
    'fuel carburant essence petrol gasoil diesel station night nuit \u0648\u0642\u0648\u062f \u0628\u0646\u0632\u064a\u0646'),
  S('/hospitals', '\ud83c\udfe5', 'Hospitals on duty', 'H\u00f4pitaux de garde', 'Hospital', '\u0627\u0644\u0645\u0633\u062a\u0634\u0641\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629', 'Opitaluuji',
    'hospital hospitals hopital hopitaux clinic clinique doctor docteur medecin urgence emergency opitaal \u0645\u0633\u062a\u0634\u0641\u0649 \u0637\u0628\u064a\u0628'),
  S('/water-lights', '\ud83d\udca1', 'Water & lights', 'Eau et \u00e9lectricit\u00e9', 'Water and light', '\u0627\u0644\u0645\u0627\u0621 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621', 'Ndiyam e jaynge',
    'water eau light lights lumiere electricity electricite courant power outage coupure eneo camwater delestage \u0645\u0627\u0621 \u0643\u0647\u0631\u0628\u0627\u0621'),
  S('/safety', '\ud83d\udea8', 'Safety alerts', 'Alertes s\u00e9curit\u00e9', 'Safety alert', '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0633\u0644\u0627\u0645\u0629', 'Jeertine kisal',
    'safety securite alert alerte alerts danger accident insecurity insecurite'),
  S('/safety-button', '\ud83c\udd98', 'Safety button', 'Bouton de s\u00e9curit\u00e9', 'Safety button', '\u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646', 'Buto\u014b kisal',
    'sos safety button bouton emergency urgence help aide panic'),
  S('/taxi-check', '\ud83d\ude95', 'Taxi check', 'V\u00e9rifier un taxi', 'Check taxi', '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u062a\u0627\u0643\u0633\u064a', '\u01b3eewto taksi',
    'taxi cab check verifier plate plaque moto taxi clando \u062a\u0627\u0643\u0633\u064a'),
  S('/marketplace/sell', '\u2795', 'Post an advert', 'Publier une annonce', 'Post advert', '\u0627\u0646\u0634\u0631 \u0625\u0639\u0644\u0627\u0646\u064b\u0627', 'Bayyin anonse',
    'sell post advert annonce publier vendre ad ads listing'),
  S('/how-to-use', '\ud83d\udcd6', 'How to use Bambeh', 'Comment utiliser Bambeh', 'How to use Bambeh', '\u0643\u064a\u0641 \u062a\u0633\u062a\u062e\u062f\u0645 \u0628\u0627\u0645\u0628\u064a\u0647', 'No huutortoo Bambeh',
    'how to use help aide guide tutorial tutoriel comment'),
];

/** "Pharmacie" -> "pharmacie": small letters, no accents (Arabic kept), one space between words. */
export function fold(s: unknown): string {
  let t = String(s == null ? '' : s).toLowerCase();
  try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch { /* an older phone: accents stay */ }
  return t.replace(/[^a-z0-9\u0600-\u06ff\u00f1\u0253\u0257\u01b4\u014b ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** The sections a search points to, best first (at most 4). Every word must start a word of the section. */
export function matchSections(q: string, lang: L, max = 4): Section[] {
  const words = fold(q).split(' ').filter((w) => w.length >= 2);
  if (!words.length) return [];
  const scored: Array<{ s: Section; score: number; i: number }> = [];
  HS_SECTIONS.forEach((s, i) => {
    const own = fold(s.name[lang]);
    const all = (' ' + fold([s.name.en, s.name.fr, s.name.pidgin, s.name.ar, s.name.ff, s.words].join(' ')) + ' ');
    let score = 0;
    for (const w of words) {
      if ((' ' + own).indexOf(' ' + w) >= 0) score += 3;
      else if (all.indexOf(' ' + w) >= 0) score += 1;
      else { score = 0; break; }
    }
    if (score > 0 && storeAllows(s.path)) scored.push({ s, score, i });
  });
  scored.sort((a, b) => b.score - a.score || a.i - b.i);
  return scored.slice(0, max).map((x) => x.s);
}

// ------------------------------------------------------------------ the search itself
/** What is safe to put in the database query: letters, digits, spaces, - and ' only, at most 40 characters. */
export function cleanQuery(raw: unknown): string {
  return String(raw == null ? '' : raw).replace(/[,()*%:\\"`;.\[\]{}<>|&=!?+^$#@~]/g, ' ').replace(/'/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
}
/** A search that could be a person's details (a phone number, an email address) is never noted. */
export function personalLooking(raw: unknown): boolean {
  const s = String(raw == null ? '' : raw);
  return s.indexOf('@') >= 0 || /\d{8,}/.test(s.replace(/[\s.()+-]/g, ''));
}

export interface Hit { id: string; kind: Kind; title: string; price: number | null; place: string | null; image: string | null; href: string; at: string; score: number }

const KIND_HREF: Record<Kind, string> = {
  marketplace: '/marketplace/', rental: '/rentals/', job: '/jobs/', service: '/services/', vehicle: '/vehicles/', farm: '/farm-fresh/', exchange: '/exchange/',
};
function kindOfListing(t: unknown): Kind {
  const s = String(t || '').toLowerCase();
  if (s === 'rental' || s === 'rentals') return 'rental';
  if (s === 'job' || s === 'jobs') return 'job';
  if (s === 'service' || s === 'services') return 'service';
  if (s === 'vehicle' || s === 'vehicles') return 'vehicle';
  return 'marketplace';
}
const firstImage = (imgs: unknown, one?: unknown): string | null => {
  if (typeof one === 'string' && one) return one;
  return Array.isArray(imgs) && typeof imgs[0] === 'string' && imgs[0] ? imgs[0] : null;
};
/** How well a title answers the words: whole-word starts count most. */
export function scoreTitle(title: string, words: string[]): number {
  const t = ' ' + fold(title) + ' ';
  let s = 0;
  for (const w of words) {
    if (t.indexOf(' ' + w) >= 0) s += 3;
    else if (t.indexOf(w) >= 0) s += 1;
  }
  return s;
}

type Row = Record<string, unknown>;
/** Adverts, rentals, jobs, services, vehicles, Farm Fresh products and swaps for the words (6 at most, best first). */
export function queryWords(q: string): { words: string[]; variants: string[] } {
  // as typed (accents kept: "t\u00e9l\u00e9phone" finds "T\u00e9l\u00e9phone") and without accents ("telephone" finds "Telephone")
  const typed = cleanQuery(q).toLowerCase().split(' ').filter((w) => w.length >= 2).slice(0, 3);
  const words = typed.map((w) => fold(w)).filter((w) => w.length >= 2);
  const variants: string[] = [];
  for (const w of typed.concat(words)) if (variants.indexOf(w) < 0) variants.push(w);
  return { words, variants };
}

export async function searchItems(q: string, max = 6): Promise<Hit[]> {
  const { words, variants } = queryWords(q);
  if (!words.length) return [];
  const cond = (cols: string[]) => cols.map((c) => variants.map((w) => c + '.ilike.%' + w + '%').join(',')).join(',');
  const [a, b, c] = await Promise.all([
    Promise.resolve(supabase.from('listings').select('id, type, title, price, location, images, created_at')
      .eq('status', 'active').is('deleted_at', null).or(cond(['title', 'category', 'location']))
      .order('created_at', { ascending: false }).limit(12)).then((r) => r, () => ({ data: null, error: new Error('net') })),
    Promise.resolve(supabase.from('farm_products').select('id, title, name, price_per_unit_xaf, price, location, image_url, images, created_at')
      .eq('is_available', true).is('deleted_at', null).or(cond(['title', 'name', 'category', 'location']))
      .order('created_at', { ascending: false }).limit(6)).then((r) => r, () => ({ data: null, error: new Error('net') })),
    Promise.resolve(supabase.from('exchange_items').select('id, title, location, estimated_value_xaf, images, created_at')
      .eq('status', 'active').is('deleted_at', null).or(cond(['title', 'category', 'location']))
      .order('created_at', { ascending: false }).limit(6)).then((r) => r, () => ({ data: null, error: new Error('net') })),
  ]);
  if (a.error && b.error && c.error) throw new Error('search failed');
  const hits: Hit[] = [];
  const num = (v: unknown): number | null => (typeof v === 'number' && isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && isFinite(Number(v)) ? Number(v) : null);
  for (const r of ((a.data || []) as Row[])) {
    const kind = kindOfListing(r.type);
    const title = String(r.title || '');
    if (!title || !r.id) continue;
    hits.push({ id: String(r.id), kind, title, price: num(r.price), place: r.location ? String(r.location) : null,
      image: firstImage(r.images), href: KIND_HREF[kind] + String(r.id), at: String(r.created_at || ''), score: scoreTitle(title, words) });
  }
  for (const r of ((b.data || []) as Row[])) {
    const title = String(r.title || r.name || '');
    if (!title || !r.id) continue;
    hits.push({ id: String(r.id), kind: 'farm', title, price: num(r.price_per_unit_xaf) ?? num(r.price), place: r.location ? String(r.location) : null,
      image: firstImage(r.images, r.image_url), href: KIND_HREF.farm + String(r.id), at: String(r.created_at || ''), score: scoreTitle(title, words) });
  }
  for (const r of ((c.data || []) as Row[])) {
    const title = String(r.title || '');
    if (!title || !r.id) continue;
    hits.push({ id: String(r.id), kind: 'exchange', title, price: num(r.estimated_value_xaf), place: r.location ? String(r.location) : null,
      image: firstImage(r.images), href: KIND_HREF.exchange + String(r.id), at: String(r.created_at || ''), score: scoreTitle(title, words) });
  }
  return hits
    .filter((h) => storeAllows(h.href))
    .sort((x, y) => y.score - x.score || (y.at > x.at ? 1 : y.at < x.at ? -1 : 0))
    .slice(0, max);
}

// ------------------------------------------------------------------ recent searches (this phone only)
const RECENT_KEY = 'bambeh_recent_searches';
export function readRecent(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(RECENT_KEY) || '[]') as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length >= 2).map((x) => x.slice(0, 40)).slice(0, 6) : [];
  } catch {
    return [];
  }
}
export function rememberSearch(q: string): string[] {
  const s = String(q || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const list = readRecent();
  if (s.length < 2 || personalLooking(s)) return list;
  const next = [s, ...list.filter((x) => x.toLowerCase() !== s.toLowerCase())].slice(0, 6);
  try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* not kept: nothing worse */ }
  return next;
}
function forgetRecent(): void {
  try { window.localStorage.removeItem(RECENT_KEY); } catch { /* nothing kept */ }
}

/** Counts a search for Command Center > Views & visits (FIX818): the words and how many things it found, once. */
const noted: Record<string, boolean> = {};
export function noteSearch(q: string, found: number): void {
  const k = fold(q);
  if (k.length < 2 || noted[k] || personalLooking(q)) return;
  noted[k] = true;
  try {
    void Promise.resolve(supabase.rpc('bambeh_search_note', { p_term: q.trim().slice(0, 40), p_found: found })).then(() => undefined, () => undefined);
  } catch {
    /* never disturb the search */
  }
}

const fmtXAF = (n: number | null): string | null => {
  if (n == null || !isFinite(n) || n <= 0) return null;
  try { return new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n) + ' FCFA'; } catch { return Math.round(n) + ' FCFA'; }
};
const put = (s: string, q: string) => s.replace('{q}', q);

export default function HomeSearch({ className = '' }: { className?: string }) {
  const lang = hsLang(useLang());
  const t = HS_TEXT[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [doneFor, setDoneFor] = useState('');
  const [recent, setRecent] = useState<string[]>(() => readRecent());
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const seq = useRef(0);

  const q = value.trim();
  const active = q.length >= 2;
  const sections = useMemo(() => (active ? matchSections(q, lang) : []), [q, active, lang]);

  // the items: a quarter of a second after she stops typing; an older answer never replaces a newer one
  useEffect(() => {
    if (!active) { setHits([]); setBusy(false); setFailed(false); setDoneFor(''); return undefined; }
    const my = ++seq.current;
    setBusy(true);
    const id = window.setTimeout(() => {
      searchItems(q).then(
        (h) => { if (seq.current === my) { setHits(h); setFailed(false); setBusy(false); setDoneFor(q); } },
        () => { if (seq.current === my) { setHits([]); setFailed(true); setBusy(false); setDoneFor(q); } },
      );
    }, 250);
    return () => window.clearTimeout(id);
  }, [q, active]);

  // what people search for: noted once she has stopped on the words for a moment
  useEffect(() => {
    if (!doneFor || doneFor !== q || failed || q.length < 3) return undefined;
    const id = window.setTimeout(() => noteSearch(q, hits.length), 1500);
    return () => window.clearTimeout(id);
  }, [doneFor, q, failed, hits.length]);

  // a tap outside closes the panel
  useEffect(() => {
    if (!open) return undefined;
    const down = (e: MouseEvent | TouchEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', down);
    document.addEventListener('touchstart', down);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('touchstart', down);
    };
  }, [open]);

  const goAll = useCallback((words: string) => {
    const s = words.trim();
    if (s.length < 2) return;
    setRecent(rememberSearch(s));
    if (s === q && doneFor === q && !failed) noteSearch(s, hits.length);
    setOpen(false);
    navigate('/search?q=' + encodeURIComponent(s));
  }, [navigate, q, doneFor, failed, hits.length]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    goAll(value);
  };
  const picked = () => {
    setRecent(rememberSearch(q));
    if (doneFor === q && !failed) noteSearch(q, hits.length);
    setOpen(false);
  };
  const fill = (s: string) => {
    setValue(s);
    setOpen(true);
    try { input.current?.focus(); } catch { /* fine */ }
  };
  const clear = () => {
    setValue('');
    setOpen(true);
    try { input.current?.focus(); } catch { /* fine */ }
  };

  // the arrow keys move through the results; Escape clears, then closes
  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      if (value) setValue(''); else setOpen(false);
      try { input.current?.focus(); } catch { /* fine */ }
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const list = wrap.current ? Array.prototype.slice.call(wrap.current.querySelectorAll('[data-hs-nav]')) as HTMLElement[] : [];
    if (!list.length) return;
    e.preventDefault();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'ArrowDown' ? (at < 0 ? 0 : Math.min(list.length - 1, at + 1)) : at <= 0 ? -1 : at - 1;
    if (next < 0) { try { input.current?.focus(); } catch { /* fine */ } return; }
    try { list[next].focus(); } catch { /* fine */ }
  };

  const head = (s: string): ReactNode => (
    <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">{s}</p>
  );
  const showPanel = open && (active || recent.length > 0 || t.popularList.length > 0);
  const waitingFirst = busy && doneFor !== q;

  return (
    <div ref={wrap} className={'relative mx-auto w-full max-w-xl text-left ' + className} dir={dir} data-fix="FIX820" data-home-search="1" onKeyDown={keys}>
      <form role="search" onSubmit={submit} aria-label={t.label}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-teal-600 ltr:left-4 rtl:right-4" aria-hidden="true" />
          <input
            ref={input}
            type="text"
            inputMode="search"
            value={value}
            onChange={(e) => { setValue(e.target.value.slice(0, 60)); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={t.ph}
            aria-label={t.label}
            aria-expanded={showPanel}
            aria-controls="home-search-panel"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            maxLength={60}
            data-hs-input="1"
            className="w-full rounded-2xl border-2 border-teal-500 bg-white py-3.5 text-base text-gray-900 shadow-md outline-none placeholder:text-gray-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 ltr:pl-12 ltr:pr-12 rtl:pr-12 rtl:pl-12"
          />
          {value && (
            <button type="button" onClick={clear} aria-label={t.clear} data-hs-clear="1"
                    className="absolute top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 ltr:right-3 rtl:left-3">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {showPanel && (
        <div id="home-search-panel" role="region" aria-label={t.label} aria-live="polite" data-hs-panel="1"
             className="mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white pb-2 shadow-xl">
          {!active ? (
            <>
              {recent.length > 0 && (
                <div data-hs-recent="1">
                  <div className="flex items-center justify-between pe-3">
                    {head(t.recent)}
                    <button type="button" className="pt-2 text-xs font-semibold text-teal-700 hover:underline" data-hs-clear-recent="1"
                            onClick={() => { forgetRecent(); setRecent([]); }}>{t.clearRecent}</button>
                  </div>
                  {recent.map((r) => (
                    <button key={r} type="button" data-hs-nav="1" onClick={() => fill(r)}
                            className="flex w-full items-center gap-3 px-4 py-2 text-start text-sm text-gray-800 hover:bg-gray-50 focus:bg-teal-50 focus:outline-none">
                      <Clock className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      <span className="truncate">{r}</span>
                    </button>
                  ))}
                </div>
              )}
              <div data-hs-popular="1">
                {head(t.popular)}
                <div className="flex flex-wrap gap-2 px-4 pb-1">
                  {t.popularList.map((p) => (
                    <button key={p} type="button" data-hs-nav="1" onClick={() => fill(p)}
                            className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 ring-1 ring-teal-100 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {sections.length > 0 && (
                <div data-hs-sections="1">
                  {head(t.sections)}
                  {sections.map((s) => (
                    <Link key={s.path} to={s.path} onClick={picked} data-hs-nav="1" data-hs-section={s.path}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:bg-teal-50 focus:outline-none">
                      <span className="w-6 text-center text-lg leading-none" aria-hidden="true">{s.emoji}</span>
                      <span className="min-w-0 flex-1 truncate">{s.name[lang]}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
              <div data-hs-items="1">
                {head(t.items)}
                {waitingFirst ? (
                  <p className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500" data-hs-busy="1">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t.searching}
                  </p>
                ) : failed ? (
                  <p className="px-4 py-3 text-sm text-gray-500" data-hs-offline="1">{t.offline}</p>
                ) : hits.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600" data-hs-nothing="1">
                    <p>{put(t.nothing, q)}</p>
                    <Link to="/marketplace/sell" onClick={picked} data-hs-nav="1" data-hs-sell="1"
                          className="mt-1 inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-300">
                      {t.sell} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  hits.map((h) => {
                    const price = fmtXAF(h.price);
                    return (
                      <Link key={h.kind + h.id} to={h.href} onClick={picked} data-hs-nav="1" data-hs-item={h.kind}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 focus:bg-teal-50 focus:outline-none">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                          {h.image ? (
                            <img src={h.image} alt="" loading="lazy" className="h-full w-full object-cover"
                                 onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <Search className="h-5 w-5 text-gray-300" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-gray-900">{h.title}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">{t.kinds[h.kind]}</span>
                            {price ? <span className="font-bold text-teal-700" dir="ltr">{price}</span> : null}
                            {h.place ? <span className="truncate">{h.place}</span> : null}
                          </span>
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
              <button type="button" onClick={() => goAll(q)} data-hs-nav="1" data-hs-all="1"
                      className="mx-3 mt-2 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200">
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">{put(t.seeAll, q)}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__HOME_SEARCH_FIX820__COMPLETE
