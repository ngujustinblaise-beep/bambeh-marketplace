// BAMBEH_DEPLOY_TOKEN__MOMOPHONE_FIX354_CLEAN
/**
 * src/lib/momoPhone.ts — Bambeh Marketplace
 *
 * FIX354 — ONE SOURCE OF TRUTH FOR "IS THIS A NUMBER CAMPAY CAN PAY?"
 *
 * The prefix tables below are copied VERBATIM from the `payments` Edge
 * Function's validatePhone(). That is the whole point: if the browser accepts
 * a number the server would reject, the seller finds out weeks later when
 * their payout silently lands in seller_payouts as `no_phone` and their money
 * sits with Bambeh. Validating in the same way, in both places, makes that
 * impossible.
 *
 * IF THE EDGE FUNCTION'S PREFIX LISTS EVER CHANGE, CHANGE THEM HERE TOO.
 */

export type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
export type MomoOperator = "mtn" | "orange";
export type MomoReason = "empty" | "length" | "prefix";

export type MomoCheck =
  | { valid: true;  normalized: string; operator: MomoOperator; local9: string }
  | { valid: false; reason: MomoReason; prefix?: string };

// ── VERBATIM from the payments Edge Function ────────────────────────────────
const MTN_PREFIXES = [
  "650", "651", "652", "653", "654",
  "670", "671", "672", "673", "674", "675", "676", "677", "678", "679",
  "680", "681", "682", "683", "684", "685", "686", "687", "688", "689",
];
const ORANGE_PREFIXES = [
  "655", "656", "657", "658", "659",
  "690", "691", "692", "693", "694", "695", "696", "697", "698", "699",
];

/**
 * Accepts the same three shapes the server accepts:
 *   237XXXXXXXXX (12 digits) · 0XXXXXXXXX (10 digits) · XXXXXXXXX (9 digits)
 * Returns `normalized` as "+237XXXXXXXXX", matching how profiles.phone is
 * already stored. The server strips non-digits before checking, so the
 * leading "+" is harmless there.
 */
export function checkMomoPhone(raw: unknown): MomoCheck {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return { valid: false, reason: "empty" };

  let local9: string;
  if (digits.startsWith("237") && digits.length === 12) local9 = digits.slice(3);
  else if (digits.startsWith("0") && digits.length === 10) local9 = digits.slice(1);
  else if (digits.length === 9) local9 = digits;
  else return { valid: false, reason: "length" };

  const prefix = local9.slice(0, 3);
  const isMTN = MTN_PREFIXES.includes(prefix);
  const isOrange = ORANGE_PREFIXES.includes(prefix);
  if (!isMTN && !isOrange) return { valid: false, reason: "prefix", prefix };

  return {
    valid: true,
    normalized: "+237" + local9,
    operator: isMTN ? "mtn" : "orange",
    local9,
  };
}

/** Brand names — deliberately NOT translated. */
export function momoOperatorLabel(op: MomoOperator): string {
  return op === "mtn" ? "MTN Mobile Money" : "Orange Money";
}

const ERRORS: Record<MomoReason, Record<Lang, string>> = {
  empty: {
    en:     "Enter your Mobile Money number.",
    fr:     "Saisissez votre numéro Mobile Money.",
    pidgin: "Put your Mobile Money number.",
    ar:     "أدخل رقم المحفظة الإلكترونية الخاص بك.",
    ff:     "Naatnu limngal Mobile Money maa.",
  },
  length: {
    en:     "A Cameroon number has 9 digits, like 6XX XXX XXX.",
    fr:     "Un numéro camerounais compte 9 chiffres, comme 6XX XXX XXX.",
    pidgin: "Cameroon number na 9 numbers, like 6XX XXX XXX.",
    ar:     "الرقم الكاميروني مكون من 9 أرقام، مثل 6XX XXX XXX.",
    ff:     "Limngal Kameruun ina jogii tonnge 9, wano 6XX XXX XXX.",
  },
  prefix: {
    en:     "That is not an MTN or Orange number. Only those two can receive Mobile Money.",
    fr:     "Ce n'est pas un numéro MTN ou Orange. Seuls ces deux opérateurs reçoivent Mobile Money.",
    pidgin: "Dis one no be MTN or Orange number. Na only dem two fit collect Mobile Money.",
    ar:     "هذا ليس رقم MTN أو Orange. هذان المشغلان فقط يمكنهما استلام الأموال.",
    ff:     "Ngal wonaa limngal MTN walla Orange. Ko ɗiin ɗiɗi tan mbaawi jaɓde ceede.",
  },
};

export function momoError(reason: MomoReason, lang: string): string {
  const l = (["en", "fr", "pidgin", "ar", "ff"].includes(lang) ? lang : "en") as Lang;
  return ERRORS[reason][l];
}

/** Convenience: message for a value, or null when the value is fine. */
export function momoErrorFor(raw: unknown, lang: string): string | null {
  const check = checkMomoPhone(raw);
  return check.valid ? null : momoError(check.reason, lang);
}
// BAMBEH_END_TOKEN__MOMOPHONE_FIX354__COMPLETE
