// BAMBEH_DEPLOY_TOKEN__AFRICA_COUNTRIES_FIX810_CLEAN
/**
 * src/lib/africa/countries.ts - FIX810 (replaces FIX768)
 *
 * FIX810, Big 18 Oct 2026: "can we make people in the rest of the world create accounts with their phone number.
 * let us make this work."
 *  - THE REST OF THE WORLD CAN BE ADDED: world.ts (FIX811) brings 176 more countries and territories with the same
 *    kind of mobile rule (Google's phone-number data) and calls addPhoneCountries(). Only the pages that take a
 *    phone number load it (sign-up, sign-in, password help, Command Center > Countries), so the pages that only
 *    need African places stay as light as before.
 *  - A NEW GROUP, 'WORLD' ("Rest of the world"), switched in Command Center > Countries like CEMAC or ECOWAS - for
 *    phone sign-up only: places (regions, towns) stay African.
 *  - Calling codes shared by several countries (+1 the USA, Canada, Jamaica...; +7 Russia and Kazakhstan; +44 the UK,
 *    Guernsey, Jersey, the Isle of Man...) are told apart the way Google's data does: by the first digits of the
 *    number. 1-digit calling codes (+1, +7) are read too.
 *  - A number typed WITHOUT + is read in the chosen country first, then as an African number with its code (as
 *    before). A number from outside Africa needs its + (or 00) - or its country chosen in the picker - so a mistyped
 *    Cameroon number is never taken for a number in another part of the world.
 *  - AFRICA AND CAMEROON ARE UNCHANGED: the same 54 countries, the same rules, the same sign-in addresses.
 *  - A country name this phone does not have in the lists is asked from the browser (Intl), never shown as a code.
 *
 * ONE LIST OF AFRICAN COUNTRIES FOR THE WHOLE APP: names (English, French, Arabic), dial codes, flags, the
 * blocs Bambeh opens by (CEMAC, ECOWAS, the Sahel states, all of Africa) and the rule a mobile number must
 * follow in each of the 54 countries.
 *
 * Big, 15 Oct 2026: "we are using the ecowas and cemac phone number system, with Cameroon and a few other
 * countries selected or proposed but most especially cameroon ... add a toggle in the admin section to
 * include all ecowas, cemac and africa or we can select a particular country at a time to include".
 *
 *  - WHICH countries are open is not decided here: Command Center > Countries (FIX771) switches them on and
 *    useOpenCountries (FIX770) reads the switches. Cameroon is always open.
 *  - CAMEROON IS UNCHANGED: 9 digits starting with 6 or 2, exactly what phone sign-in has accepted since FIX283.
 *    Its sign-in address stays 2376XXXXXXXX@phone.bambeh.com, so every existing account keeps working.
 *  - Every other country follows the mobile rules of Google's phone-number data (libphonenumber-js 1.13.10,
 *    July 2026), copied in here so the app needs no new package. A number from another country signs in as
 *    <country code><number>@phone.bambeh.com (2348021234567@phone.bambeh.com for Nigeria) - the address the
 *    password-help functions in the database (FIX653) already understand.
 *  - ECOWAS has 12 members since Burkina Faso, Mali and Niger left it on 29 January 2025; those three are the
 *    "Sahel states" bloc, so they can be opened on their own.
 * Pidgin shows the English names, Fulfulde the French ones, like the rest of Bambeh.
 * Plain ASCII: every accent is an escape, so no editor can break a name.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

export type Bloc = 'CEMAC' | 'ECOWAS' | 'AES' | 'AFRICA' | 'WORLD';
export type CountryLang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

export interface AfricaCountry {
  /** ISO code, 'CM' */
  readonly code: string;
  /** dial code without +, '237' */
  readonly dial: string;
  readonly en: string;
  readonly fr: string;
  readonly ar: string;
  readonly blocs: readonly Bloc[];
  /** the trunk prefix people type at home and drop with the country code ('0' in Nigeria); '' when none */
  readonly np: string;
  /** a mobile number written the national way, without the trunk prefix */
  readonly mobile: RegExp;
  readonly lens: readonly number[];
  /** how the number is grouped when shown: Cameroon 6 71 23 45 67 */
  readonly groups: readonly number[];
  readonly example: string;
  /**
   * FIX810 - only for a calling code several countries share: the first digits that make a number this country's
   * (Jamaica: 658 or 876 after +1). Without it, the number must follow this country's mobile rule.
   */
  readonly lead?: RegExp;
  /** FIX810 - false for every country but the main one of a shared calling code (+1: the USA). */
  readonly main?: boolean;
}

/** Where Bambeh is at home. Always open, can never be switched off. */
export const HOME = 'CM';
export const PHONE_RULES_FROM = 'libphonenumber-js 1.13.10 (Google phone-number data, July 2026)';
/** The last country a phone number was written with on this phone (sign-up, sign-in). */
export const PHONE_COUNTRY_KEY = 'bambeh_phone_country';

const C = (
  code: string, dial: string, en: string, fr: string, ar: string, blocs: Bloc[], np: string, mobile: RegExp,
  lens: number[], groups: number[], example: string,
): AfricaCountry => Object.freeze({ code, dial, en, fr, ar, blocs: Object.freeze(blocs), np, mobile, lens: Object.freeze(lens), groups: Object.freeze(groups), example });

/** Cameroon, then CEMAC, ECOWAS, the Sahel states, then the rest of Africa A to Z. */
export const AFRICA: readonly AfricaCountry[] = Object.freeze([
  C("CM", "237", "Cameroon", "Cameroun", "\u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0648\u0646", ["CEMAC"], "", /^(?:[26]\d{8})$/, [9], [1, 2, 2, 2, 2], "671234567"),
  C("CF", "236", "Central African Republic", "Centrafrique", "\u062c\u0645\u0647\u0648\u0631\u064a\u0629 \u0623\u0641\u0631\u064a\u0642\u064a\u0627 \u0627\u0644\u0648\u0633\u0637\u0649", ["CEMAC"], "", /^(?:7[02-7]\d{6})$/, [8], [2, 2, 2, 2], "70012345"),
  C("TD", "235", "Chad", "Tchad", "\u062a\u0634\u0627\u062f", ["CEMAC"], "", /^(?:(?:3[01]|[69]\d|77|8[5-7])\d{6})$/, [8], [2, 2, 2, 2], "63012345"),
  C("CG", "242", "Congo (Brazzaville)", "Congo (Brazzaville)", "\u0627\u0644\u0643\u0648\u0646\u063a\u0648 (\u0628\u0631\u0627\u0632\u0627\u0641\u064a\u0644)", ["CEMAC"], "", /^(?:026(?:1[0-5]|6[6-9])\d{4}|0(?:[14-6]\d\d|2(?:40|5[5-8]|6[07-9]))\d{5})$/, [9], [2, 3, 4], "061234567"),
  C("GQ", "240", "Equatorial Guinea", "Guin\u00e9e \u00e9quatoriale", "\u063a\u064a\u0646\u064a\u0627 \u0627\u0644\u0627\u0633\u062a\u0648\u0627\u0626\u064a\u0629", ["CEMAC"], "", /^(?:(?:222|55\d)\d{6})$/, [9], [3, 3, 3], "222123456"),
  C("GA", "241", "Gabon", "Gabon", "\u0627\u0644\u063a\u0627\u0628\u0648\u0646", ["CEMAC"], "", /^(?:(?:(?:0[2-7]|7[467])\d|6(?:0[0-4]|10|[256]\d))\d{5}|[2-7]\d{6})$/, [7, 8], [2, 2, 2, 2], "06031234"),
  C("BJ", "229", "Benin", "B\u00e9nin", "\u0628\u0646\u064a\u0646", ["ECOWAS"], "", /^(?:01(?:2[5-9]|[4-69]\d)\d{6})$/, [10], [2, 2, 2, 2, 2], "0195123456"),
  C("CV", "238", "Cabo Verde", "Cap-Vert", "\u0627\u0644\u0631\u0623\u0633 \u0627\u0644\u0623\u062e\u0636\u0631", ["ECOWAS"], "", /^(?:(?:36|5[1-389]|9\d)\d{5})$/, [7], [3, 2, 2], "9911234"),
  C("CI", "225", "C\u00f4te d'Ivoire", "C\u00f4te d'Ivoire", "\u0643\u0648\u062a \u062f\u064a\u0641\u0648\u0627\u0631", ["ECOWAS"], "", /^(?:0[157]\d{8})$/, [10], [2, 2, 2, 4], "0123456789"),
  C("GM", "220", "The Gambia", "Gambie", "\u063a\u0627\u0645\u0628\u064a\u0627", ["ECOWAS"], "", /^(?:556\d{4}|(?:[23679]\d|4[015]|5[0-489]|8[4-7])\d{5})$/, [7], [3, 4], "3012345"),
  C("GH", "233", "Ghana", "Ghana", "\u063a\u0627\u0646\u0627", ["ECOWAS"], "0", /^(?:(?:2(?:[0346-9]\d|5[67])|5(?:[03-7]\d|9[1-9]))\d{6})$/, [9], [2, 3, 4], "231234567"),
  C("GN", "224", "Guinea", "Guin\u00e9e", "\u063a\u064a\u0646\u064a\u0627", ["ECOWAS"], "", /^(?:6[0-356]\d{7})$/, [9], [3, 2, 2, 2], "601123456"),
  C("GW", "245", "Guinea-Bissau", "Guin\u00e9e-Bissau", "\u063a\u064a\u0646\u064a\u0627 \u0628\u064a\u0633\u0627\u0648", ["ECOWAS"], "", /^(?:9(?:5\d|6[569]|77)\d{6})$/, [9], [3, 3, 3], "955012345"),
  C("LR", "231", "Liberia", "Liberia", "\u0644\u064a\u0628\u064a\u0631\u064a\u0627", ["ECOWAS"], "0", /^(?:(?:(?:(?:22|33)0|555|7(?:6[01]|7\d)|88\d)\d|4(?:240|[67]))\d{5}|[56]\d{6})$/, [7, 9], [2, 3, 4], "770123456"),
  C("NG", "234", "Nigeria", "Nigeria", "\u0646\u064a\u062c\u064a\u0631\u064a\u0627", ["ECOWAS"], "0", /^(?:(?:702[0-24-9]|819[01])\d{6}|(?:7(?:0[13-9]|[12]\d)|8(?:0[1-9]|1[0-8])|9(?:0[1-9]|1[1-6]))\d{7})$/, [10], [3, 3, 4], "8021234567"),
  C("SN", "221", "Senegal", "S\u00e9n\u00e9gal", "\u0627\u0644\u0633\u0646\u063a\u0627\u0644", ["ECOWAS"], "", /^(?:7(?:[015-8]\d|21|90)\d{6})$/, [9], [2, 3, 2, 2], "701234567"),
  C("SL", "232", "Sierra Leone", "Sierra Leone", "\u0633\u064a\u0631\u0627\u0644\u064a\u0648\u0646", ["ECOWAS"], "0", /^(?:(?:25|3[0-5]|66|7\d|8[08]|9[09])\d{6})$/, [8], [2, 6], "25123456"),
  C("TG", "228", "Togo", "Togo", "\u062a\u0648\u063a\u0648", ["ECOWAS"], "", /^(?:(?:7[0-289]|9[0-36-9])\d{6})$/, [8], [2, 2, 2, 2], "90112345"),
  C("BF", "226", "Burkina Faso", "Burkina Faso", "\u0628\u0648\u0631\u0643\u064a\u0646\u0627 \u0641\u0627\u0633\u0648", ["AES"], "", /^(?:(?:0[1-7]|4[4-6]|5[0-8]|[67]\d)\d{6})$/, [8], [2, 2, 2, 2], "70123456"),
  C("ML", "223", "Mali", "Mali", "\u0645\u0627\u0644\u064a", ["AES"], "", /^(?:2(?:0(?:01|79)|17\d)\d{4}|(?:5[0-3]|[679]\d|8[2-59])\d{6})$/, [8], [2, 2, 2, 2], "65012345"),
  C("NE", "227", "Niger", "Niger", "\u0627\u0644\u0646\u064a\u062c\u0631", ["AES"], "", /^(?:(?:23|7[0467]|[89]\d)\d{6})$/, [8], [2, 2, 2, 2], "93123456"),
  C("DZ", "213", "Algeria", "Alg\u00e9rie", "\u0627\u0644\u062c\u0632\u0627\u0626\u0631", [], "0", /^(?:5(?:4[0-29]|6[0-4])\d{6}|(?:55|6\d|7[7-9])\d{7})$/, [9], [3, 2, 2, 2], "551234567"),
  C("AO", "244", "Angola", "Angola", "\u0623\u0646\u063a\u0648\u0644\u0627", [], "", /^(?:9[1-79]\d{7})$/, [9], [3, 3, 3], "923123456"),
  C("BW", "267", "Botswana", "Botswana", "\u0628\u0648\u062a\u0633\u0648\u0627\u0646\u0627", [], "", /^(?:(?:321|7(?:[1-8]\d|9[03]))\d{5})$/, [8], [2, 3, 3], "71123456"),
  C("BI", "257", "Burundi", "Burundi", "\u0628\u0648\u0631\u0648\u0646\u062f\u064a", [], "", /^(?:(?:29|6[1-9]|7[125-9])\d{6})$/, [8], [2, 2, 2, 2], "79561234"),
  C("KM", "269", "Comoros", "Comores", "\u062c\u0632\u0631 \u0627\u0644\u0642\u0645\u0631", [], "", /^(?:[34]\d{6})$/, [7], [3, 2, 2], "3212345"),
  C("CD", "243", "DR Congo", "RD Congo", "\u062c\u0645\u0647\u0648\u0631\u064a\u0629 \u0627\u0644\u0643\u0648\u0646\u063a\u0648 \u0627\u0644\u062f\u064a\u0645\u0642\u0631\u0627\u0637\u064a\u0629", [], "0", /^(?:88\d{5}|(?:8[0-69]|9[016-9])\d{7})$/, [7, 9], [3, 3, 3], "991234567"),
  C("DJ", "253", "Djibouti", "Djibouti", "\u062c\u064a\u0628\u0648\u062a\u064a", [], "", /^(?:77\d{6})$/, [8], [2, 2, 2, 2], "77831001"),
  C("EG", "20", "Egypt", "\u00c9gypte", "\u0645\u0635\u0631", [], "0", /^(?:1[0-25]\d{8})$/, [10], [2, 8], "1001234567"),
  C("ER", "291", "Eritrea", "\u00c9rythr\u00e9e", "\u0625\u0631\u064a\u062a\u0631\u064a\u0627", [], "0", /^(?:(?:17[1-3]|7\d\d)\d{4})$/, [7], [1, 3, 3], "7123456"),
  C("SZ", "268", "Eswatini", "Eswatini", "\u0625\u0633\u0648\u0627\u062a\u064a\u0646\u064a", [], "", /^(?:7[5-9]\d{6})$/, [8], [4, 4], "76123456"),
  C("ET", "251", "Ethiopia", "\u00c9thiopie", "\u0625\u062b\u064a\u0648\u0628\u064a\u0627", [], "0", /^(?:700[1-9]\d{5}|(?:7(?:0[1-9]|1[0-8]|2[1-35-79]|3\d|77|86|99)|(?:8[01]|9\d)\d)\d{6})$/, [9], [2, 3, 4], "911234567"),
  C("KE", "254", "Kenya", "Kenya", "\u0643\u064a\u0646\u064a\u0627", [], "0", /^(?:(?:1(?:0[0-8]|[18]\d|2[014]|30|4[0-5])|7\d\d)\d{6})$/, [9], [3, 6], "712123456"),
  C("LS", "266", "Lesotho", "Lesotho", "\u0644\u064a\u0633\u0648\u062a\u0648", [], "", /^(?:[56]\d{7})$/, [8], [4, 4], "50123456"),
  C("LY", "218", "Libya", "Libye", "\u0644\u064a\u0628\u064a\u0627", [], "0", /^(?:9[1-6]\d{7})$/, [9], [2, 7], "912345678"),
  C("MG", "261", "Madagascar", "Madagascar", "\u0645\u062f\u063a\u0634\u0642\u0631", [], "0", /^(?:3[2-9]\d{7})$/, [9], [2, 2, 3, 2], "321234567"),
  C("MW", "265", "Malawi", "Malawi", "\u0645\u0627\u0644\u0627\u0648\u064a", [], "0", /^(?:111\d{6}|(?:2[12]|31|77|[89][89])\d{7})$/, [9], [3, 2, 2, 2], "991234567"),
  C("MR", "222", "Mauritania", "Mauritanie", "\u0645\u0648\u0631\u064a\u062a\u0627\u0646\u064a\u0627", [], "", /^(?:[2-4][0-46-9]\d{6})$/, [8], [2, 2, 2, 2], "22123456"),
  C("MU", "230", "Mauritius", "Maurice", "\u0645\u0648\u0631\u064a\u0634\u064a\u0648\u0633", [], "", /^(?:5(?:4(?:2[1-389]|7[1-9])|87[15-8])\d{4}|(?:5(?:2[5-9]|4[3-689]|[57]\d|8[0-689]|9[0-8])|7(?:0[0-7]|3[013]))\d{5})$/, [8], [4, 4], "52512345"),
  C("MA", "212", "Morocco", "Maroc", "\u0627\u0644\u0645\u063a\u0631\u0628", [], "0", /^(?:(?:6(?:[0-79]\d|8[0-247-9])|7(?:[016-8]\d|2[0-8]|3[01]|5[0-5]))\d{6})$/, [9], [1, 2, 2, 2, 2], "650123456"),
  C("MZ", "258", "Mozambique", "Mozambique", "\u0645\u0648\u0632\u0645\u0628\u064a\u0642", [], "", /^(?:8(?:[2-79]\d|80)\d{6})$/, [9], [2, 3, 4], "821234567"),
  C("NA", "264", "Namibia", "Namibie", "\u0646\u0627\u0645\u064a\u0628\u064a\u0627", [], "0", /^(?:(?:60|8[1245])\d{7})$/, [9], [2, 3, 4], "811234567"),
  C("RW", "250", "Rwanda", "Rwanda", "\u0631\u0648\u0627\u0646\u062f\u0627", [], "0", /^(?:7[237-9]\d{7})$/, [9], [3, 3, 3], "720123456"),
  C("ST", "239", "S\u00e3o Tom\u00e9 and Pr\u00edncipe", "Sao Tom\u00e9-et-Principe", "\u0633\u0627\u0648 \u062a\u0648\u0645\u064a \u0648\u0628\u0631\u064a\u0646\u0633\u064a\u0628", [], "", /^(?:900[5-9]\d{3}|9(?:0[1-9]|[89]\d)\d{4})$/, [7], [3, 4], "9812345"),
  C("SC", "248", "Seychelles", "Seychelles", "\u0633\u064a\u0634\u0644", [], "", /^(?:2[125-8]\d{5})$/, [7], [1, 3, 3], "2510123"),
  C("SO", "252", "Somalia", "Somalie", "\u0627\u0644\u0635\u0648\u0645\u0627\u0644", [], "0", /^(?:(?:(?:15|(?:3[59]|4[89]|6\d|7[0-35-9]|8[08])\d|9(?:0\d|[2-9]))\d|2(?:4\d|8))\d{5}|(?:[67]\d\d|904)\d{5})$/, [7, 8, 9], [1, 7], "71123456"),
  C("ZA", "27", "South Africa", "Afrique du Sud", "\u062c\u0646\u0648\u0628 \u0623\u0641\u0631\u064a\u0642\u064a\u0627", [], "0", /^(?:(?:1(?:3492[0-25]|4495[0235]|549(?:20|5[01]))|4[34]492[01])\d{3}|8[1-4]\d{3,7}|(?:2[27]|47|54)4950\d{3}|(?:1(?:049[2-4]|9[12]\d\d)|(?:50[0-2]|[67]\d\d)\d\d|8(?:5\d{3}|7(?:08[67]|158|28[5-9]|310)))\d{4}|(?:1[6-8]|28|3[2-69]|4[025689]|5[36-8])4920\d{3}|(?:12|[2-5]1)492\d{4})$/, [5, 6, 7, 8, 9], [2, 3, 4], "711234567"),
  C("SS", "211", "South Sudan", "Soudan du Sud", "\u062c\u0646\u0648\u0628 \u0627\u0644\u0633\u0648\u062f\u0627\u0646", [], "0", /^(?:(?:12|9[1257-9])\d{7})$/, [9], [3, 3, 3], "977123456"),
  C("SD", "249", "Sudan", "Soudan", "\u0627\u0644\u0633\u0648\u062f\u0627\u0646", [], "0", /^(?:(?:1[0-2]|9[0-3569])\d{7})$/, [9], [2, 3, 4], "911231234"),
  C("TZ", "255", "Tanzania", "Tanzanie", "\u062a\u0646\u0632\u0627\u0646\u064a\u0627", [], "0", /^(?:(?:6[1-35-9]|7\d)\d{7})$/, [9], [3, 3, 3], "621234567"),
  C("TN", "216", "Tunisia", "Tunisie", "\u062a\u0648\u0646\u0633", [], "", /^(?:3(?:001|[12]40)\d{4}|(?:(?:[259]\d|4[0-8])\d|3(?:1[1-35]|6[0-4]|91))\d{5})$/, [8], [2, 3, 3], "20123456"),
  C("UG", "256", "Uganda", "Ouganda", "\u0623\u0648\u063a\u0646\u062f\u0627", [], "0", /^(?:7280\d{5}|7(?:[014-8]\d|2[01467]|3[0167]|9[0-589])\d{6})$/, [9], [3, 6], "712345678"),
  C("ZM", "260", "Zambia", "Zambie", "\u0632\u0627\u0645\u0628\u064a\u0627", [], "0", /^(?:(?:[59][5-8]|7[5-9])\d{7})$/, [9], [2, 7], "955123456"),
  C("ZW", "263", "Zimbabwe", "Zimbabwe", "\u0632\u064a\u0645\u0628\u0627\u0628\u0648\u064a", [], "0", /^(?:7(?:[1278]\d|3[1-9]|9[01])\d{6})$/, [9], [2, 3, 4], "712345678"),
]);

// ------------------------------------------------------------------ every country a phone number can come from
// Africa always; the rest of the world once world.ts (FIX811) is loaded.
const ALL: AfricaCountry[] = [];
const BY_CODE: Record<string, AfricaCountry> = {};
/** calling code -> its countries, the main one first ("1": the USA, then Antigua, Anguilla...) */
const BY_DIAL: Record<string, AfricaCountry[]> = {};
const has = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

/** Adds countries to the phone lists (the same country twice is ignored). Called by world.ts (FIX811). */
export function addPhoneCountries(list: readonly AfricaCountry[]): void {
  for (const c of list) {
    if (!c || !/^[A-Z]{2}$/.test(c.code) || !/^\d{1,3}$/.test(c.dial) || has(BY_CODE, c.code)) continue;
    ALL.push(c);
    BY_CODE[c.code] = c;
    const same = has(BY_DIAL, c.dial) ? BY_DIAL[c.dial] : (BY_DIAL[c.dial] = []);
    if (c.main === false) same.push(c);
    else same.unshift(c);
  }
}
addPhoneCountries(AFRICA);

/** Every country a phone number is read for here: Africa, then the rest of the world when it is loaded. */
export function phoneCountries(): readonly AfricaCountry[] {
  return ALL;
}
/** True for the countries of world.ts (FIX811): phone sign-up only, no places. */
export function isWorld(code: unknown): boolean {
  const c = countryByCode(code);
  return !!c && c.blocs.indexOf('WORLD') >= 0;
}

export function countryByCode(code: unknown): AfricaCountry | null {
  const k = String(code || '').toUpperCase();
  return has(BY_CODE, k) ? BY_CODE[k] : null;
}
export function isCountryCode(code: unknown): boolean {
  return countryByCode(code) !== null;
}
export function homeCountry(): AfricaCountry {
  return BY_CODE[HOME];
}

export function countryLang(v: unknown): CountryLang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

/** FIX810 - a country this phone has no list for yet: the browser knows its name (Intl); else the code itself. */
function intlName(code: string, l: CountryLang): string {
  try {
    const I = (Intl as unknown as { DisplayNames?: new (l: string[], o: { type: string }) => { of: (c: string) => string | undefined } }).DisplayNames;
    if (I && /^[A-Z]{2}$/.test(code)) {
      const n = new I([l === 'fr' || l === 'ff' ? 'fr' : l === 'ar' ? 'ar' : 'en'], { type: 'region' }).of(code);
      if (n && n !== code) return n;
    }
  } catch {
    /* an older browser: the code */
  }
  return code;
}

/** The country's name in the reader's language (Pidgin: English, Fulfulde: French). */
export function countryName(code: unknown, lang: unknown = 'en'): string {
  const c = countryByCode(code);
  const l = countryLang(lang);
  if (!c) return intlName(String(code || '').toUpperCase(), l);
  return l === 'fr' || l === 'ff' ? c.fr : l === 'ar' ? c.ar : c.en;
}

/** The flag, built from the two letters (no picture to load). */
export function flagOf(code: unknown): string {
  const k = String(code || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(k)) return '';
  try {
    return String.fromCodePoint(0x1f1e6 + k.charCodeAt(0) - 65, 0x1f1e6 + k.charCodeAt(1) - 65);
  } catch {
    return k;
  }
}

export const BLOCS: readonly Bloc[] = Object.freeze(['CEMAC', 'ECOWAS', 'AES', 'AFRICA', 'WORLD'] as Bloc[]);
const BLOC_NAMES: Record<Exclude<Bloc, 'WORLD'>, { en: string; fr: string; ar: string }> = {
  CEMAC: { en: "CEMAC - Central Africa (6)", fr: "CEMAC - Afrique centrale (6)", ar: "\u0633\u064a\u0645\u0627\u0643 - \u0648\u0633\u0637 \u0623\u0641\u0631\u064a\u0642\u064a\u0627 (6)" },
  ECOWAS: { en: "ECOWAS - West Africa (12)", fr: "CEDEAO - Afrique de l\u2019Ouest (12)", ar: "\u0625\u064a\u0643\u0648\u0627\u0633 - \u063a\u0631\u0628 \u0623\u0641\u0631\u064a\u0642\u064a\u0627 (12)" },
  AES: { en: "Sahel states - Burkina Faso, Mali, Niger (3)", fr: "\u00c9tats du Sahel - Burkina Faso, Mali, Niger (3)", ar: "\u062f\u0648\u0644 \u0627\u0644\u0633\u0627\u062d\u0644 - \u0628\u0648\u0631\u0643\u064a\u0646\u0627 \u0641\u0627\u0633\u0648\u060c \u0645\u0627\u0644\u064a\u060c \u0627\u0644\u0646\u064a\u062c\u0631 (3)" },
  AFRICA: { en: "All of Africa (54)", fr: "Toute l\u2019Afrique (54)", ar: "\u0643\u0644 \u0623\u0641\u0631\u064a\u0642\u064a\u0627 (54)" },
};
export function blocName(b: Bloc, lang: unknown = 'en'): string {
  const l = countryLang(lang);
  if (b === 'WORLD') {
    // FIX810 - the count is what world.ts brought (0 on a page that did not load it)
    const k = blocMembers('WORLD').length;
    return l === 'fr' || l === 'ff' ? 'Reste du monde (' + k + ')' : l === 'ar' ? '\u0628\u0627\u0642\u064a \u0627\u0644\u0639\u0627\u0644\u0645 (' + k + ')' : 'Rest of the world (' + k + ')';
  }
  const n = has(BLOC_NAMES, b) ? BLOC_NAMES[b as Exclude<Bloc, 'WORLD'>] : null;
  if (!n) return String(b);
  return l === 'fr' || l === 'ff' ? n.fr : l === 'ar' ? n.ar : n.en;
}
/** The codes of a bloc; 'AFRICA' is all 54; 'WORLD' every country world.ts (FIX811) added. */
export function blocMembers(b: Bloc): string[] {
  if (b === 'WORLD') return ALL.filter((c) => c.blocs.indexOf('WORLD') >= 0).map((c) => c.code);
  return AFRICA.filter((c) => b === 'AFRICA' || c.blocs.indexOf(b) >= 0).map((c) => c.code);
}

/** Home first, then A to Z in the reader's language. Unknown codes are left out. */
export function sortCountries(codes: readonly string[], lang: unknown = 'en'): AfricaCountry[] {
  const seen: Record<string, boolean> = {};
  const list: AfricaCountry[] = [];
  for (const k of codes) {
    const c = countryByCode(k);
    if (c && !seen[c.code]) { seen[c.code] = true; list.push(c); }
  }
  const l = countryLang(lang);
  return list.sort((a, b) => {
    if (a.code === HOME) return -1;
    if (b.code === HOME) return 1;
    return countryName(a.code, l).localeCompare(countryName(b.code, l), l === 'ar' ? 'ar' : l === 'fr' || l === 'ff' ? 'fr' : 'en');
  });
}

// ------------------------------------------------------------------ phone numbers
export interface ParsedPhone {
  code: string;
  dial: string;
  /** the number without the country code and trunk prefix: 677123456 */
  national: string;
  /** country code + number: 237677123456 (what the sign-in address is made of) */
  digits: string;
}

/** 0803 123 4567 in Nigeria -> 8031234567; anything that is not a mobile number there -> null. */
export function nationalNumber(raw: string, code: unknown): string | null {
  const c = countryByCode(code);
  if (!c) return null;
  const d = String(raw || '').replace(/\D/g, '');
  const tries = [d];
  if (c.np && d.indexOf(c.np) === 0) tries.push(d.slice(c.np.length));
  for (const x of tries) {
    if (c.lens.indexOf(x.length) >= 0 && c.mobile.test(x)) return x;
  }
  return null;
}

/** FIX810 - a calling code several countries share: the one this number belongs to (the main one if unsure). */
function pickShared(list: readonly AfricaCountry[], national: string): AfricaCountry {
  if (list.length > 1) {
    for (const c of list) {
      if (c.lead) {
        if (c.lead.test(national)) return c;
      } else if (c.lens.indexOf(national.length) >= 0 && c.mobile.test(national)) {
        return c;
      }
    }
  }
  return list[0];
}

/**
 * 237677123456 -> Cameroon; the longest known calling code wins (calling codes never start one another, so this is
 * exact). FIX810: 1-digit codes too (+1, +7), and a code several countries share is told apart by the number.
 */
export function countryOfDigits(digits: string): AfricaCountry | null {
  const d = String(digits || '').replace(/\D/g, '');
  for (const n of [3, 2, 1]) {
    const k = d.slice(0, n);
    if (k.length === n && has(BY_DIAL, k) && BY_DIAL[k].length) return pickShared(BY_DIAL[k], d.slice(n));
  }
  return null;
}

/**
 * A phone number as people write it, in any of these forms:
 *   677123456 / 6 77 12 34 56 (in the chosen country)  +237 677 12 34 56  00237677123456  237677123456
 * Spaces, dots, dashes and brackets are ignored; any other letter means it is not a phone number.
 * allowed: the countries accepted here (sign-up: the open ones). Leave it out to accept every country loaded (Africa,
 * and the rest of the world once world.ts is loaded - FIX810).
 */
export function parsePhone(raw: unknown, defaultCode: unknown = HOME, allowed?: readonly string[] | null): ParsedPhone | null {
  let d = String(raw == null ? '' : raw).trim().replace(/[\s.()\u00a0-]/g, '');
  let intl = false;
  if (d.indexOf('+') === 0) { intl = true; d = d.slice(1); } else if (d.indexOf('00') === 0) { intl = true; d = d.slice(2); }
  if (!/^\d{4,16}$/.test(d)) return null;
  const ok = (c: AfricaCountry | null): c is AfricaCountry => !!c && (!allowed || allowed.indexOf(c.code) >= 0);
  const make = (c: AfricaCountry, national: string): ParsedPhone => ({ code: c.code, dial: c.dial, national, digits: c.dial + national });
  if (intl) {
    const c = countryOfDigits(d);
    if (!ok(c)) return null;
    const n = nationalNumber(d.slice(c.dial.length), c.code);
    return n ? make(c, n) : null;
  }
  const home = countryByCode(defaultCode) || BY_CODE[HOME];
  if (ok(home)) {
    const n = nationalNumber(d, home.code);
    if (n) return make(home, n);
  }
  // written with the country code but without + (237677123456, 2348021234567) - African numbers only (FIX810):
  // outside Africa the + (or the country chosen) is needed, so a mistyped Cameroon number never lands elsewhere
  const c = countryOfDigits(d);
  if (ok(c) && c.blocs.indexOf('WORLD') < 0 && d.length > c.dial.length + 4) {
    const n = nationalNumber(d.slice(c.dial.length), c.code);
    if (n) return make(c, n);
  }
  return null;
}

export const PHONE_DOMAIN = '@phone.bambeh.com';

/** The sign-in address of a phone number: 237677123456@phone.bambeh.com. */
export function phoneIdentity(p: ParsedPhone): string {
  return p.digits + PHONE_DOMAIN;
}

export function looksLikeEmail(s: unknown): boolean {
  return /^\S+@\S+\.\S+$/.test(String(s || '').trim());
}

/**
 * What the sign-in page sends: an email as typed, or the phone's sign-in address. Any number of a country loaded
 * here is accepted (an account made while a country was open must always be able to sign in); a number written
 * without its country code is read as a number of defaultCode first, then of Cameroon.
 */
export function signInIdentity(input: unknown, defaultCode: unknown = HOME): string | null {
  const s = String(input == null ? '' : input).trim();
  if (looksLikeEmail(s)) return s;
  const p = parsePhone(s, defaultCode) || (String(defaultCode || '').toUpperCase() !== HOME ? parsePhone(s, HOME) : null);
  return p ? phoneIdentity(p) : null;
}

/**
 * FIX810 - every way a sign-in box entry can be read, most likely first: an email as typed; a number in the phone's
 * remembered country, then - when that is not Cameroon and the number was written without + - as a Cameroon number
 * too (677 12 34 56 is a valid number in France AND in Cameroon). The sign-in and password-help pages try them in turn.
 */
export function phoneReadings(input: unknown, defaultCode: unknown = HOME): string[] {
  const s = String(input == null ? '' : input).trim();
  const out: string[] = [];
  const first = signInIdentity(s, defaultCode);
  if (first) out.push(first);
  if (!looksLikeEmail(s) && !/^(\+|00)/.test(s) && String(defaultCode || '').toUpperCase() !== HOME) {
    const p = parsePhone(s, HOME);
    if (p && p.code === HOME && out.indexOf(phoneIdentity(p)) < 0) out.push(phoneIdentity(p));
  }
  return out;
}

/** "2348021234567@phone.bambeh.com" -> "2348021234567"; an email -> null. */
export function digitsOfIdentity(identity: unknown): string | null {
  const m = /^\+?(\d{6,16})@phone\.bambeh\.com$/i.exec(String(identity || '').trim());
  return m ? m[1] : null;
}

/** 677123456 in Cameroon -> "6 77 12 34 56" (the way people write it there). */
export function formatNational(national: string, code: unknown): string {
  const c = countryByCode(code);
  const d = String(national || '').replace(/\D/g, '');
  if (!c || !d) return d;
  const out: string[] = [];
  let i = 0;
  const g = c.groups.slice();
  const total = g.reduce((a, b) => a + b, 0);
  if (d.length !== total) {
    // another length than the example: keep the first groups, the rest in one piece
    for (let k = 0; k < g.length - 1 && i < d.length; k++) { out.push(d.slice(i, i + g[k])); i += g[k]; }
    if (i < d.length) out.push(d.slice(i));
    return out.join(' ');
  }
  for (const n of g) { out.push(d.slice(i, i + n)); i += n; }
  return out.join(' ');
}

/** "237677123456" -> "+237 6 77 12 34 56". */
export function prettyPhone(digits: unknown): string {
  const d = String(digits || '').replace(/\D/g, '');
  const c = countryOfDigits(d);
  if (!c) return d ? '+' + d : '';
  return '+' + c.dial + ' ' + formatNational(d.slice(c.dial.length), c.code);
}

/** What to show in an empty box: Cameroon "6XX XXX XXX" (as always), elsewhere a real-looking example. */
export function phonePlaceholder(code: unknown): string {
  const c = countryByCode(code);
  if (!c || c.code === HOME) return '6XX XXX XXX';
  return formatNational(c.example, c.code);
}

/** "9" or "7 / 9": how many digits a number has there. */
export function lengthsText(code: unknown): string {
  const c = countryByCode(code);
  return c ? c.lens.join(' / ') : '';
}

export function rememberPhoneCountry(code: unknown): void {
  const c = countryByCode(code);
  if (!c) return;
  try { window.localStorage.setItem(PHONE_COUNTRY_KEY, c.code); } catch { /* not kept: Cameroon next time */ }
}
/**
 * FIX810 - the country this phone wrote a number with, or null if it never did. Any two-letter code is kept, so a
 * country of the rest of the world is remembered even on a page that has not loaded world.ts (FIX811).
 */
export function rememberedPhoneCountryOrNull(): string | null {
  try {
    const v = String(window.localStorage.getItem(PHONE_COUNTRY_KEY) || '').toUpperCase();
    return /^[A-Z]{2}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}
export function rememberedPhoneCountry(): string {
  return rememberedPhoneCountryOrNull() || HOME;
}
// BAMBEH_END_TOKEN__AFRICA_COUNTRIES_FIX810__COMPLETE
