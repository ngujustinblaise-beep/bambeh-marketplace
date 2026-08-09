// BAMBEH_DEPLOY_TOKEN__SMARTSEARCH_FIX306_CLEAN
// FILE LOCATION: src/utils/smartSearch.ts
//
// FIX306 - FIVE LANGUAGES, NOT THREE.
//
// WHAT WAS BROKEN, PROVEN BY TEST
//   The FIX278 parser split words with /[^a-z0-9]+/ - every character that is
//   not a Latin letter or a digit was treated as a separator. Arabic script IS
//   those characters, so an entire Arabic sentence was deleted before anything
//   could be read from it. Measured on the old parser:
//
//     "cheap fridge in Bonaberi under 50000"      -> 6 words, category YES, place YES, price YES
//     "frigo pas cher a Douala moins de 50k"      -> 8 words, category YES, place YES, price YES
//     "i wan buy fine phone for Yaounde no pass 80k" -> 11 words, all YES
//     Arabic: "cheap fridge in Douala under 50000" -> 1 word, category no, place no, price no
//     Fulfulde: "firiiseer jaasudum Douala ..."    -> place YES only, by luck (Douala is Latin)
//
//   The Arabic sentence collapsed to the single token "50000". An Arabic
//   speaker got a search that ignored everything they typed.
//
// THE THREE CHANGES
//   1. The splitter keeps Arabic (U+0600-U+06FF) and the Fulfulde hooked
//      letters the old one also deleted: b-hook, d-hook, y-hook, eng.
//   2. normalise() now folds Arabic properly: strips the harakat marks, and
//      unifies the alef forms, ta marbuta and alef maksura - so a word typed
//      with or without them still matches.
//   3. Arabic and Fulfulde word lists for categories, places, prices,
//      condition and sort intent.
//
// ON THE FULFULDE
//   Anchored on the translations already in this project - Footer.tsx has
//   verified Fulfulde for the six categories (Golle, Suudu Njiydi, Tiide,
//   Njoodam, Otooji, Wattindirde), so the vocabulary is the app's own, not
//   invented. Loan words Cameroonians actually type are included alongside.
//   A native speaker should still read the list; the STRUCTURE is right and
//   adding a word later is one line.
//
// Everything from FIX278 still works exactly as it did. This only adds.

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
 * CATEGORY WORDS - en, fr, pidgin, arabic, fulfulde.
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
      // arabic
      "هاتف", "هواتف", "تلفون", "جوال", "حاسوب", "لابتوب", "كمبيوتر",
      "تلفاز", "تلفزيون", "كاميرا", "شاحن", "سماعة", "الكترونيات",
      // fulfulde
      "telefon", "telefol", "ordinatoor", "telewisiyon", "kamera", "radiyo",
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
      // arabic
      "حذاء", "احذية", "ملابس", "قميص", "فستان", "بنطلون", "حقيبة",
      "ساعة", "عطر", "مجوهرات", "ازياء",
      // fulfulde
      "pade", "padal", "comci", "saaku", "montoor", "wutte", "tuuba",
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
      // arabic
      "ثلاجة", "براد", "فريزر", "موقد", "فرن", "مكيف", "مروحة",
      "غسالة", "خلاط", "مكواة", "مولد", "اجهزة منزلية",
      // fulfulde
      "firiiseer", "furne", "masin", "gaas", "wentilateer", "kilimatizeer",
    ],
  },
  {
    category: "Books",
    words: [
      "book", "books", "livre", "livres", "textbook", "manuel", "novel",
      "roman", "bible", "quran", "coran", "dictionary", "dictionnaire",
      "notebook", "cahier",
      // arabic
      "كتاب", "كتب", "قاموس", "مصحف", "قران", "رواية", "دفتر",
      // fulfulde
      "deftere", "defte", "kaaye",
    ],
  },
  {
    category: "Furniture",
    words: [
      "chair", "chaise", "table", "sofa", "canape", "bed", "lit", "mattress",
      "matelas", "wardrobe", "armoire", "cupboard", "placard", "shelf",
      "etagere", "desk", "bureau", "furniture", "meuble", "meubles",
      // arabic
      "كرسي", "طاولة", "اريكة", "سرير", "خزانة", "دولاب", "رف", "اثاث",
      // fulfulde
      "joodorde", "taabal", "leeso", "armuwaar", "danki",
    ],
  },
  {
    category: "Vehicles",
    words: [
      "car", "cars", "voiture", "voitures", "toyota", "mercedes", "honda",
      "nissan", "hyundai", "moto", "motorcycle", "motorbike", "bike",
      "bicycle", "velo", "truck", "camion", "bus", "vehicle", "vehicule",
      "tyre", "pneu", "engine", "moteur",
      // arabic
      "سيارة", "سيارات", "دراجة", "شاحنة", "حافلة", "مركبة", "محرك", "اطار",
      // fulfulde - Footer.tsx uses Otooji for Vehicles
      "oto", "otooji", "bisikleet", "kamiyon", "moto",
    ],
  },
  {
    category: "Rentals",
    words: [
      "room", "chambre", "studio", "apartment", "appartement", "house",
      "maison", "flat", "rent", "louer", "location", "duplex", "villa",
      "shop", "boutique", "office", "bureau a louer", "land", "terrain",
      // arabic
      "غرفة", "شقة", "منزل", "بيت", "ايجار", "محل", "مكتب", "ارض", "فيلا",
      // fulfulde - Footer.tsx uses Njoodam for Rentals
      "suudu", "galle", "njoodam", "luumo", "leydi",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * PLACES - towns and quarters, in Latin and in Arabic script.
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

/** Arabic spellings map back to the Latin name the database stores. */
const PLACES_AR: { ar: string; latin: string }[] = [
  { ar: "ياوندي", latin: "yaounde" },
  { ar: "دوالا", latin: "douala" },
  { ar: "بامندا", latin: "bamenda" },
  { ar: "بافوسام", latin: "bafoussam" },
  { ar: "غاروا", latin: "garoua" },
  { ar: "ماروا", latin: "maroua" },
  { ar: "نغاونديري", latin: "ngaoundere" },
  { ar: "كريبي", latin: "kribi" },
  { ar: "ليمبي", latin: "limbe" },
  { ar: "بوea", latin: "buea" },
  { ar: "كومبا", latin: "kumba" },
  { ar: "بونابيري", latin: "bonaberi" },
  { ar: "اكوا", latin: "akwa" },
  { ar: "باستوس", latin: "bastos" },
];

/* ------------------------------------------------------------------ *
 * INTENT WORDS
 * ------------------------------------------------------------------ */
const CHEAP_WORDS = [
  "cheap", "cheapest", "affordable", "low price", "pas cher", "moins cher",
  "bon marche", "bon march\u00E9", "cheep", "small money", "no cost plenty",
  "رخيص", "رخيصة", "ارخص", "بسعر منخفض",
  "jaasudum", "coggu", "jaasde",
];
const EXPENSIVE_WORDS = [
  "expensive", "premium", "high end", "luxe", "luxury", "cher",
  "غالي", "غالية", "فاخر", "باهظ",
  "tiide", "sattude",
];
const NEW_WORDS = [
  "brand new", "new", "neuf", "neuve", "fresh", "sealed",
  "جديد", "جديدة", "جديدر",
  "keso", "kesum", "hesere",
];
const USED_WORDS = [
  "used", "second hand", "secondhand", "occasion", "tokunbo", "fairly used",
  "belgium",
  "مستعمل", "مستعملة", "مستخدم",
  "huutorado", "gado", "okkasiyon",
];
const REFURB_WORDS = [
  "refurbished", "reconditionne", "reconditionn\u00E9", "repaired", "renewed",
  "مجدد", "مصلح", "معاد تصنيعه",
  "moftado", "reparee",
];
const NEWEST_WORDS = [
  "latest", "newest", "recent", "new post", "r\u00E9cent", "dernier",
  "احدث", "الاحدث", "جديد النشر",
  "sakitiido", "kesum sakitiingum",
];

const UNDER_WORDS = [
  "under", "below", "less than", "not more than", "max", "maximum",
  "moins de", "en dessous de", "no pass", "wey no pass", "not pass",
  "اقل من", "تحت", "حتى", "لا يزيد عن", "بحد اقصى",
  "les de", "buri famdude", "famdi de", "hade",
];
const OVER_WORDS = [
  "over", "above", "more than", "at least", "min", "minimum",
  "plus de", "au dessus de",
  "اكثر من", "فوق", "على الاقل", "بحد ادنى",
  "buri heewde", "heewi de", "dow",
];

/* ------------------------------------------------------------------ *
 * FIX306 - the two lines that decide whether a language works at all.
 * ------------------------------------------------------------------ */

/** Letters we must NOT treat as separators. Arabic block + Fulfulde hooks. */
const WORD_CHARS = "a-z0-9\u0600-\u06FF\u0253\u0257\u01B4\u014B\u1E7F";
const SPLITTER = new RegExp("[^" + WORD_CHARS + "]+");

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")     // latin accents: frigó -> frigo
    .replace(/[\u064B-\u0652\u0670]/g, "") // arabic harakat: َ ً ّ ْ
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627") // آ أ إ -> ا
    .replace(/\u0629/g, "\u0647")        // ة -> ه
    .replace(/\u0649/g, "\u064A")        // ى -> ي
    .replace(/\u0640/g, "")              // tatweel, a decorative stretch
    .replace(/\s+/g, " ")
    .trim();
}

/** "80k" -> 80000, "1.5m" -> 1500000, "50 000" -> 50000. Arabic digits too. */
function readAmount(token: string): number | null {
  // Arabic-Indic digits ٠١٢٣٤٥٦٧٨٩ -> 0123456789
  const west = token.replace(/[\u0660-\u0669]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660));
  const t = west.replace(/[,\s]/g, "").toLowerCase();
  const m = t.match(/^([0-9]+(?:\.[0-9]+)?)(k|m)?$/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  if (m[2] === "k") n *= 1000;
  if (m[2] === "m") n *= 1000000;
  return Math.round(n);
}

/** how many single-character edits apart - used only for typo forgiveness */
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

  // A digit run in either western or Arabic-Indic numerals.
  const NUM = "([0-9\u0660-\u0669][0-9\u0660-\u0669.,\\s]*[km]?)";

  /* ---- price: "under 50000", "moins de 50k", "اقل من 50000" ---- */
  for (const w of UNDER_WORDS) {
    const re = new RegExp(normalise(w).replace(/ /g, "\\s+") + "\\s*" + NUM, "i");
    const m = s.match(re);
    if (m) {
      const n = readAmount(m[1]);
      if (n) { out.maxPrice = n; s = s.replace(m[0], " "); out.understood = true; }
      break;
    }
  }
  for (const w of OVER_WORDS) {
    const re = new RegExp(normalise(w).replace(/ /g, "\\s+") + "\\s*" + NUM, "i");
    const m = s.match(re);
    if (m) {
      const n = readAmount(m[1]);
      if (n) { out.minPrice = n; s = s.replace(m[0], " "); out.understood = true; }
      break;
    }
  }

  /* ---- "between 20000 and 50000" ---- */
  const between = s.match(
    new RegExp("(?:between|entre|بين)\\s+" + NUM + "\\s+(?:and|et|to|a|و)\\s+" + NUM, "i"));
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

  /* ---- location, Arabic spellings first so they map to the Latin name ---- */
  for (const p of PLACES_AR) {
    if (lift(p.ar)) { out.location = p.latin; out.understood = true; break; }
  }
  if (!out.location) {
    for (const place of PLACES) {
      const near = new RegExp(
        "\\b(?:in|at|for|a|au|\u00E0|dans|في|ب|to)\\s+" + place.replace(/ /g, "\\s+") + "\\b", "i");
      const m = s.match(near);
      if (m) { out.location = place; s = s.replace(m[0], " "); out.understood = true; break; }
    }
  }
  if (!out.location) {
    for (const place of PLACES) {
      if (lift(place)) { out.location = place; out.understood = true; break; }
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
  const words = s.split(SPLITTER).filter(Boolean);
  outer:
  for (const group of CATEGORY_WORDS) {
    for (const w of group.words) {
      const nw = normalise(w);
      if (nw.includes(" ")) {
        if (s.includes(" " + nw + " ")) { out.category = group.category; out.understood = true; break outer; }
      } else if (words.indexOf(nw) !== -1) {
        out.category = group.category;
        out.understood = true;
        break outer;
      }
    }
  }

  /* ---- category, forgiving of typos - now in every script ---- */
  if (!out.category) {
    let best: { cat: string; d: number } | null = null;
    for (const group of CATEGORY_WORDS) {
      for (const w of group.words) {
        const nw = normalise(w);
        if (nw.length < 4 || nw.includes(" ")) continue;
        for (const typed of words) {
          if (typed.length < 3) continue;
          const d = editDistance(typed, nw);
          if (d <= (nw.length >= 8 ? 2 : 1) && (!best || d < best.d)) {
            best = { cat: group.category, d };
          }
        }
      }
    }
    if (best) { out.category = best.cat; out.understood = true; }
  }

  /* ---- what is left is the free text ---- */
  const filler = [
    "i", "want", "wan", "need", "buy", "looking", "look", "for", "search",
    "find", "me", "a", "an", "the", "some", "any", "please", "abeg", "make",
    "je", "veux", "cherche", "un", "une", "des", "le", "la", "les", "de",
    "du", "pour", "avec", "qui", "que", "wey", "dey", "get", "fine", "good",
    // arabic
    "اريد", "ابحث", "عن", "في", "من", "الى", "هل", "هذا", "هذه", "مع",
    // fulfulde
    "mi", "yidi", "soodu", "e", "nder", "ngam", "no", "wonaa", "kadi",
  ];
  out.text = s
    .split(SPLITTER)
    .filter((w) => w && filler.indexOf(w) === -1)
    .join(" ")
    .trim();

  // never hand back an empty search when the person typed something real
  if (!out.text && !out.understood) out.text = normalise(raw);

  return out;
}

/* ------------------------------------------------------------------ *
 * A short line telling the user what was understood, so the app never
 * silently changes their search behind their back. Five languages.
 * ------------------------------------------------------------------ */

type DescBits = {
  in: string; under: string; over: string;
  cheapest: string; dearest: string; newest: string; cat: string;
};

const DESC: Record<string, DescBits> = {
  en: { in: "in ", under: "under ", over: "over ", cheapest: "cheapest first", dearest: "most expensive first", newest: "newest first", cat: "" },
  fr: { in: "\u00E0 ", under: "moins de ", over: "plus de ", cheapest: "moins cher d'abord", dearest: "plus cher d'abord", newest: "plus r\u00E9cent", cat: "cat\u00E9gorie : " },
  pidgin: { in: "for ", under: "no pass ", over: "pass ", cheapest: "cheap one first", dearest: "expensive one first", newest: "new one first", cat: "" },
  ar: { in: "في ", under: "اقل من ", over: "اكثر من ", cheapest: "الارخص اولا", dearest: "الاغلى اولا", newest: "الاحدث اولا", cat: "الفئة: " },
  ff: { in: "to ", under: "les de ", over: "buri ", cheapest: "jaasdum artata", dearest: "sattudum artata", newest: "kesum artata", cat: "" },
};

export function describeSearch(q: ParsedSearch, lang: string = "en"): string {
  const key = lang === "fulfulde" ? "ff" : (lang === "pcm" ? "pidgin" : lang);
  const d = DESC[key] ?? DESC.en;
  const bits: string[] = [];

  if (q.category) bits.push(d.cat + q.category);
  if (q.location) bits.push(d.in + titleCase(q.location));
  if (q.maxPrice) bits.push(d.under + q.maxPrice.toLocaleString() + " XAF");
  if (q.minPrice) bits.push(d.over + q.minPrice.toLocaleString() + " XAF");
  if (q.condition) bits.push(q.condition);
  if (q.sort === "price_asc") bits.push(d.cheapest);
  if (q.sort === "price_desc") bits.push(d.dearest);
  if (q.sort === "newest") bits.push(d.newest);

  return bits.join(" \u00B7 ");
}

function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
// BAMBEH_END_TOKEN__SMARTSEARCH_FIX306__COMPLETE
