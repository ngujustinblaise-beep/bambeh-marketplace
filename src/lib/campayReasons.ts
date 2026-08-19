// BAMBEH_DEPLOY_TOKEN__CAMPAYREASONS_FIX352_CLEAN
/**
 * src/lib/campayReasons.ts - Bambeh Marketplace
 *
 * FIX352 - CamPay always tells us WHY a payment failed. Bambeh threw that away
 * and showed one English sentence: "Payment was declined. Please check your
 * balance and try again." Proven from Big's own CamPay export, the real
 * reasons were:
 *
 *   Wrong PIN                                            <- fixable in 10 seconds
 *   LOW_BALANCE_OR_PAYEE_LIMIT_REACHED_OR_NOT_ALLOWED    <- fixable by topping up
 *   INTERNAL_PROCESSING_ERROR                            <- not the user's fault
 *
 * The first two are mistakes a buyer could correct immediately if anyone told
 * them. Telling them costs nothing and wins back the sale.
 *
 * Matching is done on a NORMALISED substring, because CamPay's wording varies
 * between operators and versions ("Wrong PIN", "WRONG_PIN", "incorrect pin").
 * Anything unrecognised falls back to a truthful generic line - never a guess.
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 */

export type PayLang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

export type FailureKind =
  | 'wrong_pin' | 'low_balance' | 'limit' | 'cancelled'
  | 'timeout' | 'bad_number' | 'operator' | 'unknown';

/** Order matters: the most specific patterns are tested first. */
const RULES: { kind: FailureKind; patterns: string[] }[] = [
  { kind: 'wrong_pin',   patterns: ['wrongpin', 'incorrectpin', 'invalidpin', 'badpin', 'pinincorrect'] },
  { kind: 'low_balance', patterns: ['lowbalance', 'insufficient', 'notenoughfunds', 'nofunds', 'solde'] },
  { kind: 'limit',       patterns: ['limitreached', 'payeelimit', 'exceedslimit', 'dailylimit', 'ceiling'] },
  { kind: 'cancelled',   patterns: ['cancel', 'rejected', 'declinedbyuser', 'refused', 'aborted'] },
  { kind: 'timeout',     patterns: ['timeout', 'timedout', 'expired', 'noresponse'] },
  { kind: 'bad_number',  patterns: ['subscribernotfound', 'invalidnumber', 'wrongnumber', 'notregistered', 'notallowed'] },
  { kind: 'operator',    patterns: ['internalprocessingerror', 'systemerror', 'serviceunavailable', 'operatorerror', 'technicalerror'] },
];

/** Strips spaces, underscores, dashes and case so every variant matches. */
function normalise(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z]/g, '');
}

export function classifyFailure(reason: string | null | undefined): FailureKind {
  const n = normalise(String(reason ?? ''));
  if (!n) return 'unknown';
  for (const rule of RULES) {
    if (rule.patterns.some((p) => n.includes(p))) return rule.kind;
  }
  return 'unknown';
}

const TEXT: Record<PayLang, Record<FailureKind, string>> = {
  en: {
    wrong_pin:   'Wrong PIN. Try the payment again and enter your Mobile Money PIN carefully.',
    low_balance: 'Not enough money in your Mobile Money wallet. Top up and try again.',
    limit:       'This payment is above your wallet limit. Try a smaller amount, or raise the limit with your operator.',
    cancelled:   'The payment was cancelled. Start again and approve the prompt on your phone.',
    timeout:     'The prompt expired before it was approved. Try again and approve it quickly.',
    bad_number:  'That number is not registered for Mobile Money. Check the number and try again.',
    operator:    'Your mobile money operator had a problem with this payment. It is not your fault - please try again in a few minutes.',
    unknown:     'The payment did not go through. No money has left your account. Please try again.',
  },
  fr: {
    wrong_pin:   'Code PIN incorrect. Relancez le paiement et saisissez votre code Mobile Money avec attention.',
    low_balance: "Solde insuffisant sur votre compte Mobile Money. Rechargez puis réessayez.",
    limit:       "Ce paiement dépasse la limite de votre compte. Essayez un montant plus petit ou augmentez la limite auprès de votre opérateur.",
    cancelled:   "Le paiement a été annulé. Recommencez et validez la demande sur votre téléphone.",
    timeout:     "La demande a expiré avant validation. Réessayez et validez rapidement.",
    bad_number:  "Ce numéro n'est pas inscrit au Mobile Money. Vérifiez le numéro et réessayez.",
    operator:    "Votre opérateur Mobile Money a rencontré un problème. Ce n'est pas de votre faute - réessayez dans quelques minutes.",
    unknown:     "Le paiement n'a pas abouti. Aucun montant n'a été débité. Veuillez réessayer.",
  },
  pidgin: {
    wrong_pin:   'Di PIN no correct. Try di payment again and put your Mobile Money PIN well well.',
    low_balance: 'Money no reach for your Mobile Money. Load am and try again.',
    limit:       'Dis payment pass di limit wey your wallet get. Try small amount, or tell your operator make dem increase am.',
    cancelled:   'Dem cancel di payment. Start again and approve di prompt for your phone.',
    timeout:     'Di prompt expire before you approve am. Try again and approve am quick quick.',
    bad_number:  'Dat number no register for Mobile Money. Check di number and try again.',
    operator:    'Your mobile money operator get problem with dis payment. Na no your fault - try again for small time.',
    unknown:     'Di payment no pass. No money comot for your account. Abeg try again.',
  },
  ar: {
    wrong_pin:   'الرمز السري غير صحيح. أعد المحاولة وأدخل رمز المحفظة بعناية.',
    low_balance: 'الرصيد غير كافٍ في محفظتك. اشحن الرصيد ثم أعد المحاولة.',
    limit:       'هذا المبلغ يتجاوز حد محفظتك. جرّب مبلغاً أقل أو ارفع الحد لدى مشغّلك.',
    cancelled:   'تم إلغاء عملية الدفع. ابدأ من جديد ووافق على الطلب على هاتفك.',
    timeout:     'انتهت مهلة الطلب قبل الموافقة عليه. أعد المحاولة ووافق بسرعة.',
    bad_number:  'هذا الرقم غير مسجّل في المحفظة الإلكترونية. تحقّق من الرقم وأعد المحاولة.',
    operator:    'واجه مشغّل المحفظة مشكلة في هذه العملية. ليس خطأك - يرجى المحاولة بعد دقائق.',
    unknown:     'لم تتم عملية الدفع. لم يُخصم أي مبلغ من حسابك. يرجى المحاولة مرة أخرى.',
  },
  ff: {
    wrong_pin:   'PIN oo moƴƴaani. Fuɗɗit yoɓgol ngol naatnaa PIN Mobile Money maa e teentinal.',
    low_balance: 'Kaalis yonaani e Mobile Money maa. Loowu kaalis ndeen fuɗɗitaa.',
    limit:       'Njaru ngoo ɓuri keerol maa. Ƴeewndo njaru famarɗo, walla ɗaɓɓu ɓeydugol keerol to operateer maa.',
    cancelled:   'Yoɓgol ngol haaɗnaama. Fuɗɗit kadi njaɓaa ɓayre ndee e telefol maa.',
    timeout:     'Ɓayre ndee timmi ado njaɓaa ɗum. Fuɗɗit kadi njaɓaa law.',
    bad_number:  'Limngal ngal winndaaka e Mobile Money. Ƴeewndo limngal ngal ndeen fuɗɗitaa.',
    operator:    'Operateer Mobile Money maa dañii caɗeele e yoɓgol ngol. Wonaa ella maa - tiiɗno fuɗɗit caggal cewɗe seeɗa.',
    unknown:     'Yoɓgol ngol yahaani. Kaalis woo yaltaani e konte maa. Tiiɗno fuɗɗit kadi.',
  },
};

/**
 * The sentence to put in front of the buyer.
 * `reason` is whatever CamPay sent; `lang` is whatever useLang() emits.
 */
export function campayFailureMessage(
  reason: string | null | undefined,
  lang: string = 'en',
): string {
  const l = (TEXT[lang as PayLang] ? lang : 'en') as PayLang;
  return TEXT[l][classifyFailure(reason)];
}
// BAMBEH_END_TOKEN__CAMPAYREASONS_FIX352__COMPLETE
