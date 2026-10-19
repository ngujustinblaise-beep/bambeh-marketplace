// BAMBEH_DEPLOY_TOKEN__CAMPAYWIDGET_FIX853_CLEAN
/**
 * CamPayWidget.tsx - Bambeh Marketplace
 * FILE LOCATION: src/components/payment/CamPayWidget.tsx
 *
 * FIX853 (replaces FIX201) - THE PAYMENT BOX SPEAKS THE BUYER'S LANGUAGE.
 *   Buy Now and the checkout page pay through this box, and every word of it was English: the number label, the
 *   "check your phone" steps, the countdown, the failure, the success. Now in the five app languages, right-to-left
 *   for Arabic. Also:
 *   - the phone checks no longer print a real phone number as their example (it was Big's own test number);
 *   - "we'll fix it within 1 hour" is gone - Bambeh does not promise what it cannot keep. A failed payment now
 *     points to Chat with Bambeh (in the app) and support@bambeh.com, with the reference when there is one.
 *
 * WHAT DID NOT CHANGE (FIX201): the two modes and every call.
 *   Simple (subscriptions, donations) - pass `amount`            -> initPayment()     -> POST /collect
 *   Cart   (marketplace, Buy Now)     - pass cartItems + token   -> initCartPayment() -> POST /cart
 *   In cart mode `amount` is display-only: the server prices the basket. A cart without a session token never falls
 *   back to /collect. onSuccess receives the server-created order id. Same props as before, plus onRetry (for a
 *   payment whose reference belongs to an order: a retry must start a fresh order, never reuse the reference).
 *
 * Every non-English character is a \u escape.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, Loader2, CheckCircle, AlertCircle,
  Clock, Shield, RefreshCw, ShoppingCart, MessageCircle,
} from 'lucide-react';
import {
  useCamPay, normalizePhone, detectOperator,
  type CartCheckoutItem, type PaymentSuccessInfo,
} from '@/hooks/useCamPay';
import { useLang } from '@/hooks/useAppLang';

interface CamPayWidgetProps {
  /** XAF. In cart mode this is DISPLAY ONLY - the server prices the cart. */
  amount: number;
  description: string;
  externalRef?: string;
  metadata?: Record<string, unknown>;

  /** CART MODE: supply both to use the order-first pipeline. */
  cartItems?: CartCheckoutItem[];
  accessToken?: string | null;
  /** true/omitted = Bambeh Secured Pay holds the money. false = pay the seller on confirmation. */
  escrow?: boolean;

  onSuccess?: (reference: string, info?: PaymentSuccessInfo) => void | Promise<void>;
  onFailure?: (message: string) => void;
  successNode?: ReactNode;
  /** When given, "Try again" and "Cancel and try again" call it instead of reusing the same reference - for a
   *  payment whose reference belongs to an order (Zerm coins, FIX849): the page starts a fresh order. */
  onRetry?: () => void;
  showBadge?: boolean;
  buttonLabel?: string;
  buttonClass?: string;
}

type LangKey = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
type Key =
  | 'label' | 'hint' | 'pay' | 'sending' | 'errLen' | 'errOp' | 'errSession' | 'cartOne' | 'cartMany'
  | 'checkMtn' | 'checkOrange' | 'sentTo' | 'stepsMtn' | 'stepsOrange' | 'step1' | 'step2Mtn' | 'step2Orange'
  | 'step3' | 'step4' | 'waiting' | 'processing' | 'cancel' | 'failTitle' | 'timeoutTitle' | 'retry'
  | 'helpLine' | 'chat' | 'okTitle' | 'okRef' | 'badge';

const T: Record<LangKey, Record<Key, string>> = {
  en: {
    label: 'MTN or Orange Money number',
    hint: 'A payment prompt will be sent to this number. Approve it on your phone with your PIN.',
    pay: 'Pay {amount} XAF',
    sending: 'Sending the request...',
    errLen: 'Enter your 9-digit MTN or Orange number (6XX XXX XXX).',
    errOp: 'This is not an MTN or Orange number.',
    errSession: 'Your session has expired. Sign in again to finish paying.',
    cartOne: '1 item - the price is checked by Bambeh before you are charged',
    cartMany: '{n} items - the prices are checked by Bambeh before you are charged',
    checkMtn: 'Check your MTN phone',
    checkOrange: 'Check your Orange phone',
    sentTo: 'A payment request of {amount} XAF was sent to +237 {phone}. Approve it with your PIN.',
    stepsMtn: 'MTN MoMo steps:',
    stepsOrange: 'Orange Money steps:',
    step1: 'A payment prompt appears on your phone',
    step2Mtn: 'Enter your MoMo PIN',
    step2Orange: 'Enter your Orange Money PIN',
    step3: 'Your operator sends you a confirmation SMS',
    step4: 'This page updates by itself',
    waiting: 'Waiting... {time} left',
    processing: 'Checking with your operator...',
    cancel: 'Cancel and try again',
    failTitle: 'Payment failed',
    timeoutTitle: 'No answer from your phone in time',
    retry: 'Try again',
    helpLine: 'If money left your account but nothing happened, write to Bambeh in the app with the reference, or email support@bambeh.com.',
    chat: 'Chat with Bambeh',
    okTitle: 'Payment received',
    okRef: 'Reference',
    badge: 'Paid through CamPay (MTN and Orange) for BAMBEH SARL',
  },
  fr: {
    label: 'Num\u00e9ro MTN ou Orange Money',
    hint: 'Une demande de paiement sera envoy\u00e9e \u00e0 ce num\u00e9ro. Validez-la sur votre t\u00e9l\u00e9phone avec votre code.',
    pay: 'Payer {amount} XAF',
    sending: 'Envoi de la demande...',
    errLen: 'Entrez votre num\u00e9ro MTN ou Orange \u00e0 9 chiffres (6XX XXX XXX).',
    errOp: 'Ce num\u00e9ro n\u2019est ni MTN ni Orange.',
    errSession: 'Votre session a expir\u00e9. Reconnectez-vous pour terminer le paiement.',
    cartOne: '1 article - le prix est v\u00e9rifi\u00e9 par Bambeh avant le paiement',
    cartMany: '{n} articles - les prix sont v\u00e9rifi\u00e9s par Bambeh avant le paiement',
    checkMtn: 'Regardez votre t\u00e9l\u00e9phone MTN',
    checkOrange: 'Regardez votre t\u00e9l\u00e9phone Orange',
    sentTo: 'Une demande de paiement de {amount} XAF a \u00e9t\u00e9 envoy\u00e9e au +237 {phone}. Validez-la avec votre code.',
    stepsMtn: '\u00c9tapes MTN MoMo :',
    stepsOrange: '\u00c9tapes Orange Money :',
    step1: 'Une demande de paiement s\u2019affiche sur votre t\u00e9l\u00e9phone',
    step2Mtn: 'Entrez votre code MoMo',
    step2Orange: 'Entrez votre code Orange Money',
    step3: 'Votre op\u00e9rateur vous envoie un SMS de confirmation',
    step4: 'Cette page se met \u00e0 jour toute seule',
    waiting: 'En attente... encore {time}',
    processing: 'V\u00e9rification aupr\u00e8s de votre op\u00e9rateur...',
    cancel: 'Annuler et r\u00e9essayer',
    failTitle: '\u00c9chec du paiement',
    timeoutTitle: 'Pas de r\u00e9ponse de votre t\u00e9l\u00e9phone \u00e0 temps',
    retry: 'R\u00e9essayer',
    helpLine: 'Si de l\u2019argent a quitt\u00e9 votre compte sans r\u00e9sultat, \u00e9crivez \u00e0 Bambeh dans l\u2019application avec la r\u00e9f\u00e9rence, ou \u00e0 support@bambeh.com.',
    chat: 'Discuter avec Bambeh',
    okTitle: 'Paiement re\u00e7u',
    okRef: 'R\u00e9f\u00e9rence',
    badge: 'Pay\u00e9 via CamPay (MTN et Orange) pour BAMBEH SARL',
  },
  pidgin: {
    label: 'MTN or Orange Money number',
    hint: 'We go send payment request to this number. Approve am for your phone with your PIN.',
    pay: 'Pay {amount} XAF',
    sending: 'We dey send the request...',
    errLen: 'Put your MTN or Orange number wey get 9 numbers (6XX XXX XXX).',
    errOp: 'This number no be MTN or Orange.',
    errSession: 'Your session don expire. Log in again make you finish the payment.',
    cartOne: '1 thing - Bambeh go check the price before dem collect money',
    cartMany: '{n} things - Bambeh go check the prices before dem collect money',
    checkMtn: 'Check your MTN phone',
    checkOrange: 'Check your Orange phone',
    sentTo: 'We don send payment request of {amount} XAF to +237 {phone}. Approve am with your PIN.',
    stepsMtn: 'MTN MoMo steps:',
    stepsOrange: 'Orange Money steps:',
    step1: 'Payment request go show for your phone',
    step2Mtn: 'Put your MoMo PIN',
    step2Orange: 'Put your Orange Money PIN',
    step3: 'Your network go send you confirmation SMS',
    step4: 'This page go update by himself',
    waiting: 'We dey wait... {time} remain',
    processing: 'We dey check with your network...',
    cancel: 'Cancel and try again',
    failTitle: 'Payment no pass',
    timeoutTitle: 'Your phone no answer on time',
    retry: 'Try again',
    helpLine: 'If money comot for your account but nothing happen, write Bambeh for inside the app with the reference, or email support@bambeh.com.',
    chat: 'Chat with Bambeh',
    okTitle: 'Payment don enter',
    okRef: 'Reference',
    badge: 'Pay through CamPay (MTN and Orange) for BAMBEH SARL',
  },
  ar: {
    label: '\u0631\u0642\u0645 MTN \u0623\u0648 Orange Money',
    hint: '\u0633\u064a\u064f\u0631\u0633\u0644 \u0637\u0644\u0628 \u062f\u0641\u0639 \u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645. \u0648\u0627\u0641\u0642 \u0639\u0644\u064a\u0647 \u0645\u0646 \u0647\u0627\u062a\u0641\u0643 \u0628\u0631\u0645\u0632\u0643 \u0627\u0644\u0633\u0631\u064a.',
    pay: '\u0627\u062f\u0641\u0639 {amount} XAF',
    sending: '\u062c\u0627\u0631\u064d \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628...',
    errLen: '\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 MTN \u0623\u0648 Orange \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 9 \u0623\u0631\u0642\u0627\u0645 (6XX XXX XXX).',
    errOp: '\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u0644\u064a\u0633 \u0645\u0646 MTN \u0623\u0648 Orange.',
    errSession: '\u0627\u0646\u062a\u0647\u062a \u062c\u0644\u0633\u062a\u0643. \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0644\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u062f\u0641\u0639.',
    cartOne: '\u0645\u0646\u062a\u062c \u0648\u0627\u062d\u062f - \u062a\u062a\u062d\u0642\u0642 Bambeh \u0645\u0646 \u0627\u0644\u0633\u0639\u0631 \u0642\u0628\u0644 \u0627\u0644\u062e\u0635\u0645',
    cartMany: '{n} \u0645\u0646\u062a\u062c\u0627\u062a - \u062a\u062a\u062d\u0642\u0642 Bambeh \u0645\u0646 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0642\u0628\u0644 \u0627\u0644\u062e\u0635\u0645',
    checkMtn: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0647\u0627\u062a\u0641 MTN',
    checkOrange: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0647\u0627\u062a\u0641 Orange',
    sentTo: '\u0623\u064f\u0631\u0633\u0644 \u0637\u0644\u0628 \u062f\u0641\u0639 \u0628\u0642\u064a\u0645\u0629 {amount} XAF \u0625\u0644\u0649 \u200e+237 {phone}. \u0648\u0627\u0641\u0642 \u0639\u0644\u064a\u0647 \u0628\u0631\u0645\u0632\u0643 \u0627\u0644\u0633\u0631\u064a.',
    stepsMtn: '\u062e\u0637\u0648\u0627\u062a MTN MoMo:',
    stepsOrange: '\u062e\u0637\u0648\u0627\u062a Orange Money:',
    step1: '\u064a\u0638\u0647\u0631 \u0637\u0644\u0628 \u0627\u0644\u062f\u0641\u0639 \u0639\u0644\u0649 \u0647\u0627\u062a\u0641\u0643',
    step2Mtn: '\u0623\u062f\u062e\u0644 \u0631\u0645\u0632 MoMo \u0627\u0644\u0633\u0631\u064a',
    step2Orange: '\u0623\u062f\u062e\u0644 \u0631\u0645\u0632 Orange Money \u0627\u0644\u0633\u0631\u064a',
    step3: '\u062a\u0635\u0644\u0643 \u0631\u0633\u0627\u0644\u0629 \u062a\u0623\u0643\u064a\u062f \u0645\u0646 \u0645\u0634\u063a\u0651\u0644\u0643',
    step4: '\u062a\u062a\u062d\u062f\u0651\u062b \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627',
    waiting: '\u0641\u064a \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631... \u0645\u062a\u0628\u0642\u064d {time}',
    processing: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0639 \u0645\u0634\u063a\u0651\u0644\u0643...',
    cancel: '\u0625\u0644\u063a\u0627\u0621 \u0648\u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u062c\u062f\u062f\u064b\u0627',
    failTitle: '\u0641\u0634\u0644 \u0627\u0644\u062f\u0641\u0639',
    timeoutTitle: '\u0644\u0645 \u064a\u0635\u0644 \u0631\u062f \u0645\u0646 \u0647\u0627\u062a\u0641\u0643 \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062d\u062f\u062f',
    retry: '\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
    helpLine: '\u0625\u0630\u0627 \u062e\u0631\u062c \u0627\u0644\u0645\u0627\u0644 \u0645\u0646 \u062d\u0633\u0627\u0628\u0643 \u062f\u0648\u0646 \u0646\u062a\u064a\u062c\u0629\u060c \u0627\u0643\u062a\u0628 \u0625\u0644\u0649 Bambeh \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0645\u0639 \u0627\u0644\u0645\u0631\u062c\u0639\u060c \u0623\u0648 \u0631\u0627\u0633\u0644 support@bambeh.com.',
    chat: '\u062a\u062d\u062f\u0651\u062b \u0645\u0639 Bambeh',
    okTitle: '\u062a\u0645 \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u062f\u0641\u0639',
    okRef: '\u0627\u0644\u0645\u0631\u062c\u0639',
    badge: '\u0627\u0644\u062f\u0641\u0639 \u0639\u0628\u0631 CamPay (MTN \u0648Orange) \u0644\u0635\u0627\u0644\u062d BAMBEH SARL',
  },
  ff: {
    label: 'Limoore MTN walla Orange Money',
    hint: '\u0181a\u0253\u0253itol njo\u0253di neldetee e ndee limoore. Ja\u0253 \u0257um e telefon maa e PIN maa.',
    pay: 'Yo\u0253 {amount} XAF',
    sending: 'Ina neldee \u0257a\u0253\u0253itol ngol...',
    errLen: 'Winndu limoore MTN walla Orange maa (limle 9: 6XX XXX XXX).',
    errOp: 'Ndee limoore wonaa MTN walla Orange.',
    errSession: 'Naatgol maa timmii. Naatu kadi ngam timminde njo\u0253di ndi.',
    cartOne: 'Huunde wootere - Bambeh \u01b4eewto coggu ngu hade maa yo\u0253de',
    cartMany: 'Ge\u0257e {n} - Bambeh \u01b4eewto coggu \u0257i hade maa yo\u0253de',
    checkMtn: '\u01b3eew telefon MTN maa',
    checkOrange: '\u01b3eew telefon Orange maa',
    sentTo: '\u0181a\u0253\u0253itol njo\u0253di {amount} XAF neldaama e +237 {phone}. Ja\u0253 \u0257um e PIN maa.',
    stepsMtn: 'Laabi MTN MoMo:',
    stepsOrange: 'Laabi Orange Money:',
    step1: '\u0181a\u0253\u0253itol njo\u0253di feeyan e telefon maa',
    step2Mtn: 'Winndu PIN MoMo maa',
    step2Orange: 'Winndu PIN Orange Money maa',
    step3: 'A he\u0253at SMS tabitingol immorde e reseau maa',
    step4: 'Ngoo hello hesdinitoo hoore mum',
    waiting: 'Ina habbii... {time} heddii',
    processing: 'Ina \u01b4eewtee e reseau maa...',
    cancel: 'Haa\u0257, fuddito',
    failTitle: 'Njo\u0253di wa\u0257aaki',
    timeoutTitle: 'Telefon maa jaabaaki e sahaa',
    retry: 'Fuddito',
    helpLine: 'So kaalis yalti e konte maa kono huunde wa\u0257aaki, winndan Bambeh e nder jaa\u0253nirgal ngal e tonngoode ndee, walla support@bambeh.com.',
    chat: 'Yeewtu e Bambeh',
    okTitle: 'Njo\u0253di he\u0253aama',
    okRef: 'Tonngoode',
    badge: 'Yo\u0253aama e CamPay (MTN e Orange) ngam BAMBEH SARL',
  },
};

function pickLang(raw: unknown): LangKey {
  const v = String(raw ?? 'en').toLowerCase();
  if (v === 'fr' || v.indexOf('fr-') === 0) return 'fr';
  if (v === 'pidgin' || v === 'pcm') return 'pidgin';
  if (v === 'ar' || v.indexOf('ar-') === 0) return 'ar';
  if (v === 'ff' || v === 'ful' || v === 'fulfulde') return 'ff';
  return 'en';
}

function fill(s: string, vals: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vals ? String(vals[k]) : m));
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString('fr-CM');

export default function CamPayWidget({
  amount,
  description,
  externalRef,
  metadata,
  cartItems,
  accessToken,
  escrow,
  onSuccess,
  onFailure,
  successNode,
  onRetry,
  showBadge = true,
  buttonLabel,
  buttonClass = 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800',
}: CamPayWidgetProps) {
  const navigate = useNavigate();
  const lang = pickLang(useLang());
  const t = T[lang];
  const rtl = lang === 'ar';

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const {
    status, errorMsg, reference, countdown,
    initPayment, initCartPayment, reset,
  } = useCamPay({
    onSuccess: async (ref, info) => { await onSuccess?.(ref, info); },
    onFailure,
  });

  /* Cart mode is active only when we have BOTH items and a session token. */
  const isCartMode = Array.isArray(cartItems) && cartItems.length > 0 && !!accessToken;

  const operator     = phone.length >= 3 ? detectOperator(normalizePhone(phone)) : null;
  const isSubmitting = status === 'submitting';
  const isWaiting    = status === 'waiting';
  const isSuccess    = status === 'success';
  const isFailed     = status === 'failed' || status === 'timeout';

  function handlePhoneChange(v: string) {
    setPhone(v.replace(/\D/g, '').slice(0, 9));
    setPhoneError(null);
  }

  async function handlePay() {
    const p9 = normalizePhone(phone);
    if (p9.length !== 9) { setPhoneError(t.errLen); return; }
    if (!detectOperator(p9)) { setPhoneError(t.errOp); return; }

    if (isCartMode) {
      await initCartPayment({
        items: cartItems!,
        phone,
        description,
        accessToken: accessToken!,
        ...(escrow === false ? { escrow: false } : {}),
      });
      return;
    }

    // A cart was passed but the session is missing - never silently fall back
    // to the amount-based collect, which would skip the order entirely.
    if (Array.isArray(cartItems) && cartItems.length > 0 && !accessToken) {
      setPhoneError(t.errSession);
      return;
    }

    await initPayment({ amount, phone, description, externalRef, metadata });
  }

  /* -- SUCCESS ------------------------------------------------------------- */
  if (isSuccess) {
    if (successNode) return <>{successNode}</>;
    return (
      <div className="flex flex-col items-center py-8 text-center" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX853" data-state="success">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-9 w-9 text-green-500" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-gray-900">{t.okTitle}</h3>
        {reference && (
          <p className="mb-2 text-sm text-gray-500">
            {t.okRef}: <span className="font-mono text-xs" dir="ltr">{reference}</span>
          </p>
        )}
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    );
  }

  /* -- WAITING FOR THE PHONE ----------------------------------------------- */
  if (isWaiting) {
    const time = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`;
    return (
      <div className="flex flex-col items-center px-4 py-8 text-center" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX853" data-state="waiting">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Loader2 className="h-9 w-9 animate-spin text-amber-500" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">
          {operator === 'orange' ? t.checkOrange : t.checkMtn}
        </h3>
        <p className="mb-4 max-w-xs text-sm text-gray-600">
          {fill(t.sentTo, { amount: fmt(amount), phone })}
        </p>

        <div className="mb-4 w-full max-w-xs space-y-1.5 rounded-2xl bg-gray-50 p-4 text-start">
          <p className="text-xs font-semibold text-gray-700">
            {operator === 'orange' ? t.stepsOrange : t.stepsMtn}
          </p>
          <p className="text-xs text-gray-500">1. {t.step1}</p>
          <p className="text-xs text-gray-500">2. {operator === 'orange' ? t.step2Orange : t.step2Mtn}</p>
          <p className="text-xs text-gray-500">3. {t.step3}</p>
          <p className="text-xs text-gray-500">4. {t.step4}</p>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-600">
          <Clock className="h-4 w-4 flex-shrink-0" />
          {countdown > 0 ? fill(t.waiting, { time }) : t.processing}
        </div>

        <button onClick={() => { if (onRetry) { reset(); onRetry(); } else { reset(); } }} className="text-sm text-gray-500 underline hover:text-gray-700">
          {t.cancel}
        </button>
      </div>
    );
  }

  /* -- IDLE / FAILED ------------------------------------------------------- */
  const n = Array.isArray(cartItems) ? cartItems.length : 0;
  return (
    <div className="space-y-4" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX853" data-state={isFailed ? 'failed' : 'idle'}>
      {isFailed && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="mb-0.5 text-sm font-semibold text-red-700">
              {status === 'timeout' ? t.timeoutTitle : t.failTitle}
            </p>
            {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
            <button onClick={() => { if (onRetry) { reset(); onRetry(); } else { reset(); } }} className="mt-2 flex items-center gap-1 text-xs font-bold text-red-700 underline">
              <RefreshCw className="h-3 w-3" /> {t.retry}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              {t.helpLine}
              {reference && <> <span className="font-mono" dir="ltr">({reference})</span></>}
            </p>
            <button onClick={() => navigate('/help/chat')} data-go="chat"
                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50">
              <MessageCircle className="h-3.5 w-3.5" /> {t.chat}
            </button>
          </div>
        </div>
      )}

      {isCartMode && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs text-teal-800">
          <ShoppingCart className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{n === 1 ? t.cartOne : fill(t.cartMany, { n })}</span>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          <Phone className="-mt-0.5 me-1 inline h-4 w-4" />
          {t.label}
        </label>
        <div className="relative" dir="ltr">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-semibold text-gray-500">
            +237
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={e => handlePhoneChange(e.target.value)}
            placeholder="6XXXXXXXX"
            maxLength={9}
            disabled={isSubmitting}
            data-phone="1"
            className={`w-full rounded-xl border-2 py-3 pl-14 pr-20 text-sm transition-all focus:outline-none disabled:bg-gray-50 ${
              operator === 'mtn'
                ? 'border-yellow-400 bg-yellow-50 focus:border-yellow-500'
                : operator === 'orange'
                ? 'border-orange-400 bg-orange-50 focus:border-orange-500'
                : phoneError
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-200 focus:border-teal-500'
            }`}
          />
          {operator && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-xs font-bold ${
              operator === 'mtn' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {operator === 'mtn' ? 'MTN' : 'Orange'}
            </span>
          )}
        </div>
        {phoneError && <p className="mt-1 text-xs text-red-500" data-phone-error="1">{phoneError}</p>}
        <p className="mt-1 text-xs text-gray-400">{t.hint}</p>
      </div>

      <button
        onClick={handlePay}
        disabled={isSubmitting || phone.length < 9}
        data-pay="1"
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> {t.sending}</>
        ) : (
          buttonLabel ?? fill(t.pay, { amount: fmt(amount) })
        )}
      </button>

      {showBadge && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="h-3.5 w-3.5" />
          {t.badge}
        </div>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__CAMPAYWIDGET_FIX853__COMPLETE
