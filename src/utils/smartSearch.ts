// BAMBEH_DEPLOY_TOKEN__SMARTSEARCH_FIX278_CLEAN
// FILE LOCATION: src/utils/smartSearch.ts
//
// FIX278 - ROAD B: ASSISTED SEARCH THAT COSTS NOTHING TO RUN.
//
// A user types a sentence the way they would say it out loud:
//
//   "cheap fridge in Bonaberi under 50000"
//   "frigo pas cher a Douala moins de 50000"
//   "i wan buy fine phone for Yaounde wey no pass 80k"
//
// and this turns it into a real query:
//
//   { text: "fridge", category: "Appliances", location: "Bonaberi",
//     maxPrice: 50000, sort: "price_asc", condition: null }
//
// It runs on the phone, costs nothing per search, needs no API key, and
// still works when the network is poor - which matters here more than
// anywhere. When subscriptions are earning, an LLM can be layered on top
// of this same shape without changing a single caller.
//
// USAGE
//   import { parseSearch, describeSearch } from "@/utils/smartSearch";
//   const q = parseSearch(userTypedText);
//   // then apply q.category / q.maxPrice / q.location to your Supabase query
//   // and show describeSearch(q) so the user sees what was understood.

export interface ParsedSearch {
  /** what is left after the filters were lifted out - use this for text match */
  text: string;
  /** the original sentence, untouched */
  raw: string;
  category: string | null;
  location: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  condition: "New" | "Used" | "Refurbished" | null;
  sort: "price_asc" | "price_desc" | "newest" | null;
  /** true when we lifted at least one filter out of the sentence */
  understood: boolean;
}

/* ------------------------------------------------------------------ *
 * CATEGORY WORDS - English, French and Pidgin, as people actually type.
 * The value on the right must match the CATEGORIES labels in Marketplace.
 * ------------------------------------------------------------------ */
const CATEGORY_WORDS: { words: string[]; category: string }[] = [
  {
    category: "Electronics",
    words: [
      "phone", "phones", "telephone", "telephones", "smartphone", "iphone",
      "android", "samsung", "tecno", "itel", "infinix", "laptop", "laptops",
      "computer", "ordinateur", "pc", "tablet", "tablette", "tv", "television",
      "televiseur", "camera", "appareil photo", "speaker", "haut parleur",
      "headphone", "ecouteur", "charger", "chargeur", "powerbank", "console",
      "playstation", "radio", "electronique", "electronics", "electronic",
    ],
  },
  {
    category: "Fashion",
    words: [
      "shoe", "shoes", "chaussure", "chaussures", "sneaker", "sneakers",
      "cloth", "clothes", "clothing", "vetement", "vetements", "dress",
      "robe", "shirt", "chemise", "tshirt", "t-shirt", "trouser", "pantalon",
      "jean", "jeans", "bag", "sac", "watch", "montre", "jewel", "bijou",
      "bijoux", "perfume", "parfum", "wig", "perruque", "fashion", "mode",
      "kaba", "ndop", "boubou",
    ],
  },
  {
    category: "Appliances",
    words: [
      "fridge", "frigo", "refrigerator", "refrigerateur", "freezer",
      "congelateur", "cooker", "cuisiniere", "stove", "gas", "gaz", "oven",
      "four", "microwave", "micro-onde", "blender", "mixeur", "iron", "fer",
      "fan", "ventilateur", "ac", "climatiseur", "clim", "washing machine",
      "machine a laver", "generator", "groupe electrogene", "appliance",
      "appliances", "electromenager",
    ],
  },
  {
    category: "Books",
    words: [
      "book", "books", "livre", "livres", "textbook", "manuel", "novel",
      "roman", "bible", "quran", "coran", "dictionary", "dictionnaire",
      "notebook", "cahier",
    ],
  },
  {
    category: "Furniture",
    words: [
      "chair", "chaise", "table", "sofa", "canape", "bed", "lit", "mattress",
      "matelas", "wardrobe", "armoire", "cupboard", "placard", "shelf",
      "etagere", "desk", "bureau", "furniture", "meuble", "meubles",
    ],
  },
  {
    category: "Vehicles",
    words: [
      "car", "cars", "voiture", "voitures", "toyota", "mercedes", "honda",
      "nissan", "hyundai", "moto", "motorcycle", "motorbike", "bike",
      "bicycle", "velo", "truck", "camion", "bus", "vehicle", "vehicule",
      "tyre", "pneu", "engine", "moteur",
    ],
  },
  {
    category: "Rentals",
    words: [
      "room", "chambre", "studio", "apartment", "appartement", "house",
      "maison", "flat", "rent", "louer", "location", "duplex", "villa",
      "shop", "boutique", "office", "bureau a louer", "land", "terrain",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * PLACES - the towns and quarters people actually search for.
 * ------------------------------------------------------------------ */
const PLACES = [
  "yaounde", "yaound\u00E9", "douala", "bamenda", "bafoussam", "garoua",
  "maroua", "ngaoundere", "ngaound\u00E9r\u00E9", "bertoua", "ebolowa",
  "kribi", "limbe", "buea", "kumba", "edea", "ed\u00E9a", "dschang",
  "foumban", "sangmelima", "nkongsamba", "mbouda", "bafang", "kousseri",
  "guider", "meiganga", "tiko", "mamfe", "wum", "kumbo", "bali",
  // Douala quarters
  "bonaberi", "bonab\u00E9ri", "akwa", "bonanjo", "deido", "bepanda",
  "makepe", "mak\u00E9p\u00E9", "logbessou", "ndogbong", "bonamoussadi",
  "yassa", "pk8", "pk10", "village", "new bell", "nylon", "cite des palmiers",
  // Yaounde quarters
  "bastos", "mvan", "mvog mbi", "mvog-mbi", "biyem assi", "biyem-assi",
  "essos", "nsam", "mokolo", "nlongkak", "obili", "ngousso", "emana",
  "odza", "ekounou", "etoudi", "melen", "briqueterie", "mendong", "soa",
  "nkolbisson", "damas", "tsinga", "elig essono", "olembe", "simbock",
];

/* ------------------------------------------------------------------ *
 * INTENT WORDS
 * ------------------------------------------------------------------ */
const CHEAP_WORDS = ["cheap", "cheapest", "affordable", "low price", "pas cher", "moins cher", "bon marche", "bon march\u00E9", "cheep", "small money", "no cost plenty"];
const EXPENSIVE_WORDS = ["expensive", "premium", "high end", "luxe", "luxury", "cher"];
const NEW_WORDS = ["brand new", "new", "neuf", "neuve", "fresh", "sealed"];
const USED_WORDS = ["used", "second hand", "secondhand", "occasion", "tokunbo", "fairly used", "belgium"];
const REFURB_WORDS = ["refurbished", "reconditionne", "reconditionn\u00E9", "repaired", "renewed"];
const NEWEST_WORDS = ["latest", "newest", "recent", "new post", "r\u00E9cent", "dernier"];

const UNDER_WORDS = ["under", "below", "less than", "not more than", "max", "maximum", "moins de", "en dessous de", "no pass", "wey no pass", "not pass"];
const OVER_WORDS = ["over", "above", "more than", "at least", "min", "minimum", "plus de", "au dessus de"];

/* ------------------------------------------------------------------ */

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // strip accents so "frigo" == "frigó"
    .replace(/\s+/g, " ")
    .trim();
}

/** "80k" -> 80000, "1.5m" -> 1500000, "50 000" -> 50000 */
function readAmount(token: string): number | null {
  const t = token.replace(/[,\s]/g, "").toLowerCase();
  const m = t.match(/^([0-9]+(?:\.[0-9]+)?)(k|m)?$/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  if (m[2] === "k") n *= 1000;
  if (m[2] === "m") n *= 1000000;
  return Math.round(n);
}

/** how many single-character edits apart - used only for short category words */
function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        last + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      last = tmp;
    }
  }
  return prev[b.length];
}

/* ------------------------------------------------------------------ *
 * THE PARSER
 * ------------------------------------------------------------------ */

export function parseSearch(input: string): ParsedSearch {
  const raw = String(input || "");
  let s = " " + normalise(raw) + " ";

  const out: ParsedSearch = {
    text: "", raw, category: null, location: null,
    minPrice: null, maxPrice: null, condition: null, sort: null,
    understood: false,
  };

  const lift = (phrase: string) => {
    const p = " " + normalise(phrase) + " ";
    const at = s.indexOf(p);
    if (at !== -1) {
      s = s.slice(0, at) + " " + s.slice(at + p.length);
      return true;
    }
    return false;
  };

  /* ---- price: "under 50000", "moins de 50k", "wey no pass 80k" ---- */
  for (const w of UNDER_WORDS) {
    const re = new RegExp("\\b" + w.replace(/ /g, "\\s+") + "\\s+([0-9][0-9.,\\s]*[km]?)", "i");
    const m = s.match(re);
    if (m) {
      const n = readAmount(m[1]);
      if (n) {
        out.maxPrice = n;
        s = s.replace(m[0], " ");
        out.understood = true;
      }
      break;
    }
  }
  for (const w of OVER_WORDS) {
    const re = new RegExp("\\b" + w.replace(/ /g, "\\s+") + "\\s+([0-9][0-9.,\\s]*[km]?)", "i");
    const m = s.match(re);
    if (m) {
      const n = readAmount(m[1]);
      if (n) {
        out.minPrice = n;
        s = s.replace(m[0], " ");
        out.understood = true;
      }
      break;
    }
  }

  /* ---- "between 20000 and 50000" ---- */
  const between = s.match(/\b(?:between|entre)\s+([0-9][0-9.,\s]*[km]?)\s+(?:and|et|to|a)\s+([0-9][0-9.,\s]*[km]?)/i);
  if (between) {
    const lo = readAmount(between[1]);
    const hi = readAmount(between[2]);
    if (lo && hi) {
      out.minPrice = Math.min(lo, hi);
      out.maxPrice = Math.max(lo, hi);
      s = s.replace(between[0], " ");
      out.understood = true;
    }
  }

  /* ---- location: "in Bonaberi", "a Douala", or the bare place name ---- */
  for (const place of PLACES) {
    const near = new RegExp("\\b(?:in|at|for|a|au|\u00E0|dans)\\s+" + place.replace(/ /g, "\\s+") + "\\b", "i");
    const m = s.match(near);
    if (m) {
      out.location = place;
      s = s.replace(m[0], " ");
      out.understood = true;
      break;
    }
  }
  if (!out.location) {
    for (const place of PLACES) {
      if (lift(place)) {
        out.location = place;
        out.understood = true;
        break;
      }
    }
  }

  /* ---- condition ---- */
  for (const w of REFURB_WORDS) if (lift(w)) { out.condition = "Refurbished"; out.understood = true; break; }
  if (!out.condition) for (const w of USED_WORDS) if (lift(w)) { out.condition = "Used"; out.understood = true; break; }
  if (!out.condition) for (const w of NEW_WORDS) if (lift(w)) { out.condition = "New"; out.understood = true; break; }

  /* ---- sort intent ---- */
  for (const w of CHEAP_WORDS) if (lift(w)) { out.sort = "price_asc"; out.understood = true; break; }
  if (!out.sort) for (const w of EXPENSIVE_WORDS) if (lift(w)) { out.sort = "price_desc"; out.understood = true; break; }
  if (!out.sort) for (const w of NEWEST_WORDS) if (lift(w)) { out.sort = "newest"; out.understood = true; break; }

  /* ---- category, exact word first ---- */
  const words = s.split(/[^a-z0-9]+/).filter(Boolean);
  outer:
  for (const group of CATEGORY_WORDS) {
    for (const w of group.words) {
      if (w.includes(" ")) {
        if (s.includes(" " + w + " ")) { out.category = group.category; out.understood = true; break outer; }
      } else if (words.indexOf(w) !== -1) {
        out.category = group.category;
        out.understood = true;
        break outer;
      }
    }
  }

  /* ---- category, forgiving of typos: "fridg", "telefone", "chausure" ---- */
  if (!out.category) {
    let best: { cat: string; d: number } | null = null;
    for (const group of CATEGORY_WORDS) {
      for (const w of group.words) {
        if (w.length < 5 || w.includes(" ")) continue;
        for (const typed of words) {
          if (typed.length < 4) continue;
          const d = editDistance(typed, w);
          if (d <= (w.length >= 8 ? 2 : 1) && (!best || d < best.d)) {
            best = { cat: group.category, d };
          }
        }
      }
    }
    if (best) {
      out.category = best.cat;
      out.understood = true;
    }
  }

  /* ---- what is left is the free text ---- */
  const filler = [
    "i", "want", "wan", "need", "buy", "looking", "look", "for", "search",
    "find", "me", "a", "an", "the", "some", "any", "please", "abeg", "make",
    "je", "veux", "cherche", "un", "une", "des", "le", "la", "les", "de",
    "du", "pour", "avec", "qui", "que", "wey", "dey", "get", "fine", "good",
  ];
  out.text = s
    .split(/[^a-z0-9]+/)
    .filter((w) => w && filler.indexOf(w) === -1)
    .join(" ")
    .trim();

  // never hand back an empty search when the person typed something real
  if (!out.text && !out.understood) out.text = normalise(raw);

  return out;
}

/* ------------------------------------------------------------------ *
 * A short line telling the user what was understood, so the app never
 * silently changes their search behind their back.
 * ------------------------------------------------------------------ */

export function describeSearch(q: ParsedSearch, lang: string = "en"): string {
  const fr = lang === "fr";
  const bits: string[] = [];

  if (q.category) bits.push(fr ? "cat\u00E9gorie : " + q.category : q.category);
  if (q.location) bits.push((fr ? "\u00E0 " : "in ") + titleCase(q.location));
  if (q.maxPrice) bits.push((fr ? "moins de " : "under ") + q.maxPrice.toLocaleString() + " XAF");
  if (q.minPrice) bits.push((fr ? "plus de " : "over ") + q.minPrice.toLocaleString() + " XAF");
  if (q.condition) bits.push(q.condition);
  if (q.sort === "price_asc") bits.push(fr ? "moins cher d'abord" : "cheapest first");
  if (q.sort === "price_desc") bits.push(fr ? "plus cher d'abord" : "most expensive first");
  if (q.sort === "newest") bits.push(fr ? "plus r\u00E9cent" : "newest first");

  return bits.join(" \u00B7 ");
}

function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
// BAMBEH_END_TOKEN__SMARTSEARCH_FIX278__COMPLETE
