// BAMBEH_DEPLOY_TOKEN__PHONEAUTH_FIX283_CLEAN
// FILE LOCATION: src/utils/phoneAuth.ts
//
// FIX283 - SIGN UP AND SIGN IN WITH A PHONE NUMBER.
//
// A trader in Mokolo knows her phone number by heart. She may not have an
// email address, and if she does she probably mistypes it. So the phone
// becomes the account.
//
// HOW IT WORKS
//   Supabase Auth needs an email. We give it one built from the phone:
//       670757326  ->  237670757326@phone.bambeh.com
//   The user never sees this and never types it. It is stable, unique per
//   number, and needs no SMS, no provider and no monthly cost.
//
//   Their REAL email, if they give one, is stored in profiles.email so we
//   can reach them and so password recovery still works for them.
//
// WHAT IT ACCEPTS
//   670757326 · 6 70 75 73 26 · +237670757326 · 237670757326 · 00237670757326
//   All become 237670757326.

/** The domain is one you own, so nothing here can ever bounce to a stranger. */
const PHONE_DOMAIN = "phone.bambeh.com";

/**
 * Turn anything a Cameroonian might type into 237XXXXXXXXX.
 * Returns null when it is not a usable Cameroon number.
 */
export function normalisePhone(input: string): string | null {
  if (!input) return null;

  let d = String(input).replace(/[^\d]/g, "");

  if (d.startsWith("00237")) d = d.slice(5);
  else if (d.startsWith("237") && d.length > 9) d = d.slice(3);

  // Cameroon: 9 digits. Mobile starts 6, landline starts 2.
  if (!/^[62]\d{8}$/.test(d)) return null;

  return "237" + d;
}

/** Pretty form for showing back to the user: 6 70 75 73 26 */
export function prettyPhone(input: string): string {
  const n = normalisePhone(input);
  if (!n) return input;
  const local = n.slice(3);
  return local.replace(/(\d)(\d\d)(\d\d)(\d\d)(\d\d)/, "$1 $2 $3 $4 $5");
}

/** Does this look like someone trying to type a phone rather than an email? */
export function looksLikePhone(input: string): boolean {
  if (!input) return false;
  if (input.includes("@")) return false;
  const digits = input.replace(/[^\d]/g, "");
  return digits.length >= 9;
}

/** Is this a well-formed email? Empty counts as false. */
export function looksLikeEmail(input: string): boolean {
  return /^\S+@\S+\.\S+$/.test(String(input || "").trim());
}

/**
 * The identity Supabase signs in. Never shown to the user.
 * Pass a phone and you get the synthetic address; pass an email and you
 * get it back unchanged, so existing accounts keep working.
 */
export function authIdentity(input: string): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;

  if (looksLikeEmail(raw)) return raw.toLowerCase();

  const phone = normalisePhone(raw);
  if (!phone) return null;

  return phone + "@" + PHONE_DOMAIN;
}

/** True when an address was generated from a phone rather than typed by a person. */
export function isPhoneIdentity(email: string): boolean {
  return String(email || "").toLowerCase().endsWith("@" + PHONE_DOMAIN);
}
// BAMBEH_END_TOKEN__PHONEAUTH_FIX283__COMPLETE
