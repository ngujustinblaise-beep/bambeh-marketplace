// BAMBEH_DEPLOY_TOKEN__ESCROWACTIONPANEL_FIX209_AUTOCONFIRM
/**
 * EscrowActionPanel.tsx - Bambeh Marketplace (FIX206)
 * FILE LOCATION: src/components/EscrowActionPanel.tsx
 *
 * WHAT THIS IS
 * ------------
 * The buyer-facing escrow control surface for a single order. Drop it into any
 * page that knows an order id. It loads the order itself (RLS-safe), works out
 * the real escrow state from real columns, and exposes only the actions that
 * are legal in that state.
 *
 * NO STUBS. Every button calls something that exists:
 *   Confirm receipt + pay seller -> POST <payments>/release-escrow
 *   Request refund               -> POST <payments>/refund-escrow
 *   Message the seller           -> /chat?userId=<seller_id>&listingTitle=...
 *   View breakdown / Refresh     -> pure client, reads the order row
 *
 * MONEY SAFETY RULES BUILT IN
 * ---------------------------
 *  1. IDENTITY GATE - only the buyer_id on the order sees the money actions.
 *     The seller (or anyone else) gets a read-only status card.
 *  2. PAYMENT GATE - release and refund stay DISABLED until the order is
 *     actually confirmed paid (paid_at set, or status advanced past pending).
 *     A buyer must never be able to release funds on a payment the platform
 *     has not confirmed. The server remains the authority; this is the second
 *     lock, not the only one.
 *  3. STATE GATE - once escrow_status is released / refunded / disputed the
 *     actions disappear. Terminal states are read-only.
 *  4. CONFIRMATION SCREEN - both money actions state the exact consequence and
 *     the exact amount before the final click. Refund requires a reason.
 *  5. SINGLE FLIGHT - buttons lock while a request is in the air, so a double
 *     tap cannot fire two releases.
 *  6. VERBATIM SERVER ERRORS - whatever the edge function says is shown as-is.
 *     That habit is what turned hours of guessing into one-attempt diagnoses.
 *
 * ENDPOINT RESOLUTION - the Railway lesson
 * ----------------------------------------
 * A stale VITE_BACKEND_URL once pointed every payment at a dead host. This file
 * never reads that variable. It builds the URL from the Supabase project and
 * refuses anything that is not a supabase.co functions URL.
 *
 * Columns used are all confirmed present on public.orders:
 *   id, order_number, buyer_id, seller_id, status, escrow, escrow_status,
 *   total_xaf, seller_payout_xaf, platform_fee_xaf, payment_method,
 *   payment_reference, payment_ref, paid_at, items, created_at, updated_at
 *
 * 5 languages (en / fr / pidgin / ar / ff) with RTL. All non-ASCII text lives
 * inside string literals as \u escapes so a truncated or re-encoded download can
 * never produce mojibake.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, Loader2, MessageCircle,
  RefreshCw, Receipt, ChevronDown, ChevronUp, Clock, Lock, XCircle, Info,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

/* ---------------------------------------------------------------------------
 * Endpoint - derived, validated, never from VITE_BACKEND_URL
 * ------------------------------------------------------------------------- */

const PROJECT_FALLBACK = 'https://rbjbdxefwzvgmioearie.supabase.co';

function resolveFunctionsBase(): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  const candidates = [env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PROJECT_URL, PROJECT_FALLBACK];
  for (const c of candidates) {
    if (!c) continue;
    const clean = c.replace(/\/+$/, '');
    // Only a real Supabase project URL is ever accepted.
    if (/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(clean)) return `${clean}/functions/v1/payments`;
  }
  return `${PROJECT_FALLBACK}/functions/v1/payments`;
}

const PAYMENTS_BASE = resolveFunctionsBase();
/** FIX209 - sibling function that verifies the payment with the provider. */
const CONFIRM_URL = PAYMENTS_BASE.replace(/\/payments$/, '/confirm-payment');

/* ---------------------------------------------------------------------------
 * i18n
 * ------------------------------------------------------------------------- */

const strings = {
  en: {
    panelTitle: 'Buyer Protection',
    heldTitle: 'Your money is held safely',
    heldBody: 'Bambeh is holding this payment. The seller is paid only when you confirm the item reached you.',
    awaitTitle: 'Waiting for payment confirmation',
    awaitBody: 'This payment has not been confirmed with the mobile-money provider yet. The buttons below unlock the moment it is.',
    releasedTitle: 'Payment released',
    releasedBody: 'You confirmed receipt, so the seller has been paid. This order is closed.',
    refundedTitle: 'Refund issued',
    refundedBody: 'This order was declined and the money was sent back to the number that paid.',
    disputedTitle: 'Under review',
    disputedBody: 'This order is frozen while it is reviewed. No money moves until it is resolved.',
    noEscrowTitle: 'Direct payment',
    noEscrowBody: 'This order was not placed under Buyer Protection, so there is nothing to hold or release.',
    closedTitle: 'Order closed',
    closedBody: 'This order was cancelled or did not complete. No money is being held for it.',
    sellerTitle: 'You are the seller on this order',
    sellerBody: 'Only the buyer can confirm receipt or request a refund. You will be paid as soon as the buyer confirms.',
    btnConfirm: 'Confirm receipt and pay seller',
    btnRefund: 'Not received - request refund',
    btnChat: 'Message the seller',
    showBreak: 'View breakdown',
    hideBreak: 'Hide breakdown',
    refresh: 'Refresh',
    brTotal: 'Total paid',
    brFee: 'Bambeh fee and tax',
    brSeller: 'Seller receives',
    brOrder: 'Order',
    brRef: 'Reference',
    brStatus: 'Protection status',
    lockedPaid: 'Locked until the payment is confirmed',
    checkNow: 'Check payment status now',
    checking: 'Checking with the provider...',
    checkPending: 'The provider has not confirmed it yet. Try again in a moment.',
    nowActive: 'Payment confirmed. Buyer Protection is now active.',
    confirmTitle: 'Confirm you received this item',
    confirmLine1: 'This releases {amount} to the seller straight away.',
    confirmLine2: 'It cannot be undone. Only confirm if the item is in your hands and it is what you ordered.',
    confirmCta: 'Yes, release the payment',
    refundTitle: 'Request a refund',
    refundBody: 'Tell us what went wrong. The money goes back to the number that paid.',
    refundPlaceholder: 'For example: the item never arrived, or it is not what was described.',
    refundNeedReason: 'Please describe the problem in at least 10 characters.',
    refundCta: 'Request the refund',
    cancel: 'Cancel',
    working: 'Working...',
    okReleased: 'Done. The payment has been released to the seller.',
    okRefunded: 'Refund requested. You will be notified when it lands.',
    signIn: 'Please sign in again to continue.',
    loadErr: 'Could not load the protection details.',
    notFound: 'Order not found, or it belongs to another account.',
    retry: 'Retry',
  },
  fr: {
    panelTitle: 'Protection Acheteur',
    heldTitle: 'Votre argent est conserv\u00e9 en s\u00e9curit\u00e9',
    heldBody: 'Bambeh conserve ce paiement. Le vendeur est pay\u00e9 uniquement quand vous confirmez avoir re\u00e7u l\u2019article.',
    awaitTitle: 'En attente de confirmation du paiement',
    awaitBody: 'Ce paiement n\u2019est pas encore confirm\u00e9 par l\u2019op\u00e9rateur mobile. Les boutons ci-dessous s\u2019activent d\u00e8s la confirmation.',
    releasedTitle: 'Paiement lib\u00e9r\u00e9',
    releasedBody: 'Vous avez confirm\u00e9 la r\u00e9ception, le vendeur a donc \u00e9t\u00e9 pay\u00e9. Cette commande est cl\u00f4tur\u00e9e.',
    refundedTitle: 'Remboursement effectu\u00e9',
    refundedBody: 'Cette commande a \u00e9t\u00e9 refus\u00e9e et l\u2019argent a \u00e9t\u00e9 renvoy\u00e9 au num\u00e9ro qui a pay\u00e9.',
    disputedTitle: 'En cours d\u2019examen',
    disputedBody: 'Cette commande est gel\u00e9e pendant l\u2019examen. Aucun mouvement d\u2019argent avant r\u00e9solution.',
    noEscrowTitle: 'Paiement direct',
    noEscrowBody: 'Cette commande n\u2019est pas sous Protection Acheteur, il n\u2019y a donc rien \u00e0 lib\u00e9rer.',
    closedTitle: 'Commande cl\u00f4tur\u00e9e',
    closedBody: 'Cette commande a \u00e9t\u00e9 annul\u00e9e ou n\u2019a pas abouti. Aucun argent n\u2019est conserv\u00e9.',
    sellerTitle: 'Vous \u00eates le vendeur de cette commande',
    sellerBody: 'Seul l\u2019acheteur peut confirmer la r\u00e9ception ou demander un remboursement. Vous serez pay\u00e9 d\u00e8s sa confirmation.',
    btnConfirm: 'Confirmer la r\u00e9ception et payer le vendeur',
    btnRefund: 'Non re\u00e7u - demander un remboursement',
    btnChat: 'Contacter le vendeur',
    showBreak: 'Voir le d\u00e9tail',
    hideBreak: 'Masquer le d\u00e9tail',
    refresh: 'Actualiser',
    brTotal: 'Total pay\u00e9',
    brFee: 'Frais Bambeh et taxe',
    brSeller: 'Le vendeur re\u00e7oit',
    brOrder: 'Commande',
    brRef: 'R\u00e9f\u00e9rence',
    brStatus: '\u00c9tat de la protection',
    lockedPaid: 'Bloqu\u00e9 jusqu\u2019\u00e0 la confirmation du paiement',
    checkNow: 'V\u00e9rifier le paiement maintenant',
    checking: 'V\u00e9rification aupr\u00e8s de l\u2019op\u00e9rateur...',
    checkPending: 'L\u2019op\u00e9rateur ne l\u2019a pas encore confirm\u00e9. R\u00e9essayez dans un instant.',
    nowActive: 'Paiement confirm\u00e9. La Protection Acheteur est active.',
    confirmTitle: 'Confirmez avoir re\u00e7u cet article',
    confirmLine1: 'Cela verse imm\u00e9diatement {amount} au vendeur.',
    confirmLine2: 'C\u2019est irr\u00e9versible. Ne confirmez que si vous avez l\u2019article et qu\u2019il correspond \u00e0 la commande.',
    confirmCta: 'Oui, lib\u00e9rer le paiement',
    refundTitle: 'Demander un remboursement',
    refundBody: 'Expliquez le probl\u00e8me. L\u2019argent retourne au num\u00e9ro qui a pay\u00e9.',
    refundPlaceholder: 'Par exemple : l\u2019article n\u2019est jamais arriv\u00e9, ou il ne correspond pas \u00e0 la description.',
    refundNeedReason: 'Merci de d\u00e9crire le probl\u00e8me en 10 caract\u00e8res minimum.',
    refundCta: 'Demander le remboursement',
    cancel: 'Annuler',
    working: 'Traitement...',
    okReleased: 'C\u2019est fait. Le paiement a \u00e9t\u00e9 lib\u00e9r\u00e9 au vendeur.',
    okRefunded: 'Remboursement demand\u00e9. Vous serez notifi\u00e9 d\u00e8s r\u00e9ception.',
    signIn: 'Veuillez vous reconnecter pour continuer.',
    loadErr: 'Impossible de charger les d\u00e9tails de la protection.',
    notFound: 'Commande introuvable, ou elle appartient \u00e0 un autre compte.',
    retry: 'R\u00e9essayer',
  },
  pidgin: {
    panelTitle: 'Buyer Protection',
    heldTitle: 'Your money dey safe',
    heldBody: 'Bambeh hold this money. Seller no go collect until you talk say the thing don reach you.',
    awaitTitle: 'We dey wait payment confirmation',
    awaitBody: 'Mobile money no confirm this payment yet. The buttons go open once e confirm.',
    releasedTitle: 'Money don go',
    releasedBody: 'You confirm say you receive am, so seller don collect. This order don finish.',
    refundedTitle: 'Money don come back',
    refundedBody: 'You refuse this order and the money go back to the number wey pay.',
    disputedTitle: 'Dem dey check am',
    disputedBody: 'This order freeze while dem check am. No money go move until dem settle am.',
    noEscrowTitle: 'Direct payment',
    noEscrowBody: 'This order no pass through Buyer Protection, so nothing dey for hold or release.',
    closedTitle: 'Order don close',
    closedBody: 'Dem cancel this order or e no complete. No money dey hold for am.',
    sellerTitle: 'You be the seller for this order',
    sellerBody: 'Only buyer fit confirm say e receive am or ask for refund. You go collect once buyer confirm.',
    btnConfirm: 'I don receive am - pay seller',
    btnRefund: 'I no receive am - I want my money',
    btnChat: 'Message the seller',
    showBreak: 'See how dem share am',
    hideBreak: 'Hide am',
    refresh: 'Refresh',
    brTotal: 'Total wey you pay',
    brFee: 'Bambeh cut and tax',
    brSeller: 'Seller go collect',
    brOrder: 'Order',
    brRef: 'Reference',
    brStatus: 'Protection status',
    lockedPaid: 'E lock until payment confirm',
    checkNow: 'Check payment now',
    checking: 'We dey check with the provider...',
    checkPending: 'Provider no confirm am yet. Try again small time.',
    nowActive: 'Payment confirm! Buyer Protection don active.',
    confirmTitle: 'Confirm say you receive this thing',
    confirmLine1: 'This one go send {amount} give seller now now.',
    confirmLine2: 'You no go fit undo am. Only confirm if the thing dey your hand and e correct.',
    confirmCta: 'Yes, release the money',
    refundTitle: 'Ask for your money back',
    refundBody: 'Tell us wetin happen. The money go back to the number wey pay.',
    refundPlaceholder: 'Like: the thing never reach, or e no be wetin dem talk.',
    refundNeedReason: 'Abeg write wetin happen, at least 10 letters.',
    refundCta: 'Ask for refund',
    cancel: 'Cancel',
    working: 'E dey work...',
    okReleased: 'Done. Seller don collect the money.',
    okRefunded: 'You don ask for refund. We go tell you when e land.',
    signIn: 'Abeg login again.',
    loadErr: 'The protection details no gree load.',
    notFound: 'Order no dey, or e belong to another account.',
    retry: 'Try again',
  },
  ar: {
    panelTitle: '\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0636\u0645\u0627\u0646',
    heldTitle: '\u0623\u0645\u0648\u0627\u0644\u0643 \u0645\u062d\u0641\u0648\u0638\u0629 \u0628\u0623\u0645\u0627\u0646',
    heldBody: '\u062a\u062d\u062a\u0641\u0632 \u0628\u0627\u0645\u0628\u064a \u0628\u0647\u0630\u0627 \u0627\u0644\u0645\u0628\u0644\u063a. \u0644\u0627 \u064a\u062d\u0635\u0644 \u0627\u0644\u0628\u0627\u0626\u0639 \u0639\u0644\u0649 \u0627\u0644\u0645\u0628\u0644\u063a \u0625\u0644\u0627 \u0628\u0639\u062f \u062a\u0623\u0643\u064a\u062f\u0643 \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0645\u0646\u062a\u062c.',
    awaitTitle: '\u0628\u0627\u0646\u062a\u0637\u0627\u0631 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639',
    awaitBody: '\u0644\u0645 \u064a\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639 \u0645\u0639 \u0645\u0634\u063a\u0644 \u0627\u0644\u0645\u062d\u0641\u0638\u0629 \u0628\u0639\u062f. \u062a\u0641\u062a\u062d \u0627\u0644\u0623\u0632\u0631\u0627\u0631 \u0641\u0648\u0631 \u0627\u0644\u062a\u0623\u0643\u064a\u062f.',
    releasedTitle: '\u062a\u0645 \u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u0628\u0644\u063a',
    releasedBody: '\u0644\u0642\u062f \u0623\u0643\u062f\u062a \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645\u060c \u0644\u0630\u0644\u0643 \u062a\u0645 \u062f\u0641\u0639 \u0627\u0644\u0645\u0628\u0644\u063a \u0644\u0644\u0628\u0627\u0626\u0639. \u0627\u0644\u0637\u0644\u0628 \u0645\u063a\u0644\u0642 \u0627\u0644\u0623\u0646.',
    refundedTitle: '\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f',
    refundedBody: '\u062a\u0645 \u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628 \u0648\u0623\u0639\u064a\u062f \u0627\u0644\u0645\u0628\u0644\u063a \u0625\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0630\u064a \u062f\u0641\u0639.',
    disputedTitle: '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
    disputedBody: '\u0627\u0644\u0637\u0644\u0628 \u0645\u062c\u0645\u062f \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629. \u0644\u0627 \u062a\u062a\u062d\u0631\u0643 \u0627\u0644\u0623\u0645\u0648\u0627\u0644 \u062d\u062a\u0649 \u0627\u0644\u062d\u0644.',
    noEscrowTitle: '\u062f\u0641\u0639 \u0645\u0628\u0627\u0634\u0631',
    noEscrowBody: '\u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628 \u0644\u064a\u0633 \u062a\u062d\u062a \u0627\u0644\u0636\u0645\u0627\u0646\u060c \u0644\u0630\u0644\u0643 \u0644\u0627 \u0634\u064a\u0621 \u0644\u062a\u062d\u0631\u064a\u0631\u0647.',
    closedTitle: '\u0627\u0644\u0637\u0644\u0628 \u0645\u063a\u0644\u0642',
    closedBody: '\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628 \u0623\u0648 \u0644\u0645 \u064a\u0643\u062a\u0645\u0644. \u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0645\u0648\u0627\u0644 \u0645\u062d\u062a\u0641\u0638 \u0628\u0647\u0627.',
    sellerTitle: '\u0623\u0646\u062a \u0627\u0644\u0628\u0627\u0626\u0639 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628',
    sellerBody: '\u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0648\u062d\u062f\u0647 \u064a\u0645\u0643\u0646\u0647 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0623\u0648 \u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f. \u0633\u062a\u0633\u062a\u0644\u0645 \u0627\u0644\u0645\u0628\u0644\u063a \u0628\u0639\u062f \u062a\u0623\u0643\u064a\u062f\u0647.',
    btnConfirm: '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0648\u062f\u0641\u0639 \u0627\u0644\u0628\u0627\u0626\u0639',
    btnRefund: '\u0644\u0645 \u064a\u0635\u0644 - \u0637\u0644\u0628 \u0627\u0633\u062a\u0631\u062f\u0627\u062f',
    btnChat: '\u0645\u0631\u0627\u0633\u0644\u0629 \u0627\u0644\u0628\u0627\u0626\u0639',
    showBreak: '\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644',
    hideBreak: '\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644',
    refresh: '\u062a\u062d\u062f\u064a\u062b',
    brTotal: '\u0627\u0644\u0645\u062f\u0641\u0648\u0639 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a',
    brFee: '\u0639\u0645\u0648\u0644\u0629 \u0628\u0627\u0645\u0628\u064a \u0648\u0627\u0644\u0631\u0633\u0648\u0645',
    brSeller: '\u064a\u0633\u062a\u0644\u0645 \u0627\u0644\u0628\u0627\u0626\u0639',
    brOrder: '\u0627\u0644\u0637\u0644\u0628',
    brRef: '\u0627\u0644\u0645\u0631\u062c\u0639',
    brStatus: '\u062d\u0627\u0644\u0629 \u0627\u0644\u0636\u0645\u0627\u0646',
    lockedPaid: '\u0645\u063a\u0644\u0642 \u062d\u062a\u0649 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639',
    checkNow: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0622\u0646',
    checking: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0639 \u0627\u0644\u0645\u0634\u063a\u0644...',
    checkPending: '\u0644\u0645 \u064a\u0624\u0643\u062f\u0647 \u0627\u0644\u0645\u0634\u063a\u0644 \u0628\u0639\u062f. \u062d\u0627\u0648\u0644 \u0628\u0639\u062f \u0642\u0644\u064a\u0644.',
    nowActive: '\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639. \u0627\u0644\u0636\u0645\u0627\u0646 \u0646\u0634\u0637 \u0627\u0644\u0622\u0646.',
    confirmTitle: '\u0623\u0643\u062f \u0623\u0646\u0643 \u0627\u0633\u062a\u0644\u0645\u062a \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062a\u062c',
    confirmLine1: '\u0633\u064a\u062a\u0645 \u062a\u062d\u0648\u064a\u0644 {amount} \u0644\u0644\u0628\u0627\u0626\u0639 \u0641\u0648\u0631\u064b\u0627.',
    confirmLine2: '\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639. \u0623\u0643\u062f \u0641\u0642\u0637 \u0625\u0646 \u0643\u0627\u0646 \u0627\u0644\u0645\u0646\u062a\u062c \u0645\u0639\u0643 \u0648\u0645\u0637\u0627\u0628\u0642\u064b\u0627 \u0644\u0644\u0637\u0644\u0628.',
    confirmCta: '\u0646\u0639\u0645\u060c \u062d\u0631\u0631 \u0627\u0644\u0645\u0628\u0644\u063a',
    refundTitle: '\u0637\u0644\u0628 \u0627\u0633\u062a\u0631\u062f\u0627\u062f',
    refundBody: '\u0623\u062e\u0628\u0631\u0646\u0627 \u0645\u0627 \u062d\u062f\u062b. \u064a\u0639\u0648\u062f \u0627\u0644\u0645\u0628\u0644\u063a \u0625\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0630\u064a \u062f\u0641\u0639.',
    refundPlaceholder: '\u0645\u062b\u0627\u0644: \u0627\u0644\u0645\u0646\u062a\u062c \u0644\u0645 \u064a\u0635\u0644\u060c \u0623\u0648 \u0644\u0627 \u064a\u0637\u0627\u0628\u0642 \u0627\u0644\u0648\u0635\u0641.',
    refundNeedReason: '\u0627\u0643\u062a\u0628 \u0648\u0635\u0641 \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0628\u0639\u0634\u0631\u0629 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.',
    refundCta: '\u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f',
    cancel: '\u0625\u0644\u063a\u0627\u0621',
    working: '\u062c\u0627\u0631\u064d...',
    okReleased: '\u062a\u0645. \u062a\u0645 \u062a\u062d\u0631\u064a\u0631 \u0627\u0644\u0645\u0628\u0644\u063a \u0644\u0644\u0628\u0627\u0626\u0639.',
    okRefunded: '\u062a\u0645 \u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f. \u0633\u0646\u062e\u0628\u0631\u0643 \u0639\u0646\u062f \u0648\u0635\u0648\u0644\u0647.',
    signIn: '\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    loadErr: '\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0636\u0645\u0627\u0646.',
    notFound: '\u0627\u0644\u0637\u0644\u0628 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u060c \u0623\u0648 \u064a\u062a\u0628\u0639 \u062d\u0633\u0627\u0628\u064b\u0627 \u0622\u062e\u0631.',
    retry: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629',
  },
  ff: {
    panelTitle: 'Ndeenka escrow',
    heldTitle: 'Kaalisi ma\u0257a ina reenaa',
    heldBody: 'Bambeh ina jogii kaalisi o. Jeeyoowo he\u0253ataa kaalisi so a tee\u014btinii wonde ku\u0257e yottiima.',
    awaitTitle: 'Ina hebee tee\u014btingol yo\u0253gol',
    awaitBody: 'Yo\u0253gol ngol tee\u014btinaaka tawo e mobile money. Butto\u014b \u0257i\u0257i \u0257on udditoo so tee\u014btinaama.',
    releasedTitle: 'Kaalisi neldaama',
    releasedBody: 'A tee\u014btinii jaggol, jeeyoowo yo\u0253aama. Yamiroore nde uddaama.',
    refundedTitle: 'Kaalisi rutti',
    refundedBody: 'Yamiroore nde salminaama, kaalisi rutti to limngal yo\u0253unoo.',
    disputedTitle: 'Ina yi\u0257ee',
    disputedBody: 'Yamiroore nde \u0257accaama haa yi\u0257ee. Kaalisi dilloytaa haa \u0257um \u0257oftaa.',
    noEscrowTitle: 'Yo\u0253gol laa\u0253i',
    noEscrowBody: 'Yamiroore nde alaa e escrow, hay hu\u0263\u0263o alaa e neldee.',
    closedTitle: 'Yamiroore uddaama',
    closedBody: 'Yamiroore nde haaytaama walla nde timmaani. Kaalisi alaa e jogaa\u0257e.',
    sellerTitle: 'A woni jeeyoowo e yamiroore nde',
    sellerBody: 'Ko so\u0257oowo tan wa\u0257ata tee\u014btingol walla \u0257a\u0253\u0253ere ruttingol. A yo\u0253ete so o tee\u014btinii.',
    btnConfirm: 'Tee\u014btin jaggol e yo\u0253 jeeyoowo',
    btnRefund: 'Mi he\u0253aani - mi \u0257a\u0253\u0253ii rutti',
    btnChat: 'Winndu jeeyoowo',
    showBreak: '\u01b4i\u0253\u0253u peccugol',
    hideBreak: 'Suu\u0257u peccugol',
    refresh: 'Refresh',
    brTotal: 'Fof ko yo\u0253aa',
    brFee: 'Jaw\u0257i Bambeh e lampo',
    brSeller: 'Jeeyoowo he\u0253ata',
    brOrder: 'Yamiroore',
    brRef: 'Reference',
    brStatus: 'Ngonka escrow',
    lockedPaid: 'Uddiingo haa yo\u0253gol tee\u014btinee',
    checkNow: 'Yiylo yo\u0253gol jooni',
    checking: 'Ina yiylee to mobile money...',
    checkPending: 'Tawo tee\u014btinaaka. Eto kadi see\u0257a.',
    nowActive: 'Yo\u0253gol tee\u014btinaama. Escrow ina golloo.',
    confirmTitle: 'Tee\u014btin wonde a he\u0253ii ku\u0257e \u0257e\u0257',
    confirmLine1: '\u0186um neldata {amount} to jeeyoowo jaka jooni.',
    confirmLine2: 'A waawaa firtude \u0257um. Tee\u014btin tan so ku\u0257e \u0257on e jun\u0257e ma\u0257a e \u0257e goonga.',
    confirmCta: 'Eey, neld kaalisi',
    refundTitle: '\u01b4a\u0253\u0253ere rutti kaalisi',
    refundBody: 'Wi\u2019 min ko hewti. Kaalisi rutta to limngal yo\u0253unoo.',
    refundPlaceholder: 'Misal: ku\u0257e yottaaki, walla \u0257e nanndaani e sifaa.',
    refundNeedReason: 'Winndu caggal caraa\u0257i sappo e nder.',
    refundCta: '\u01b4a\u0253\u0253u rutti',
    cancel: 'Haaytu',
    working: 'Ina golloo...',
    okReleased: 'Timmii. Kaalisi neldaama to jeeyoowo.',
    okRefunded: '\u01b4a\u0253\u0253ere rutti nelaama. A humpitete so \u0257um yottiima.',
    signIn: 'Tii\u0257no naatu kadi.',
    loadErr: 'Kabaruuji escrow loowaaki.',
    notFound: 'Yamiroore alaa, walla nde wonaa e konte ma\u0257a.',
    retry: 'Eto kadi',
  },
} as const;

type LangStrings = (typeof strings)['en'];

function useStrings(): { s: LangStrings; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw === 'pcm' ? 'pidgin' : raw;
  const s = (strings as Record<string, LangStrings>)[key] ?? strings.en;
  return { s, isRtl: key === 'ar' };
}

/* ---------------------------------------------------------------------------
 * Types + state derivation
 * ------------------------------------------------------------------------- */

interface EscrowOrderRow {
  id: string;
  order_number: string | null;
  buyer_id: string | null;
  seller_id: string | null;
  status: string | null;
  escrow: boolean | null;
  escrow_status: string | null;
  total_xaf: number | null;
  seller_payout_xaf: number | null;
  platform_fee_xaf: number | null;
  payment_method: string | null;
  payment_reference: string | null;
  payment_ref: string | null;
  paid_at: string | null;
  items: unknown;
  created_at: string | null;
  updated_at: string | null;
}

const SELECT_COLS =
  'id, order_number, buyer_id, seller_id, status, escrow, escrow_status, total_xaf, ' +
  'seller_payout_xaf, platform_fee_xaf, payment_method, payment_reference, payment_ref, ' +
  'paid_at, items, created_at, updated_at';

type EscrowState =
  | 'held'
  | 'awaiting_payment'
  | 'released'
  | 'refunded'
  | 'disputed'
  | 'no_escrow'
  | 'closed';

const PAID_STATUSES = [
  'paid', 'confirmed', 'processing', 'shipped',
  'out_for_delivery', 'delivered', 'completed', 'released',
];

function isConfirmedPaid(o: EscrowOrderRow): boolean {
  if (o.paid_at) return true;
  return PAID_STATUSES.includes((o.status || '').toLowerCase());
}

function deriveState(o: EscrowOrderRow): EscrowState {
  const st = (o.status || '').toLowerCase();
  const es = (o.escrow_status || '').toLowerCase();

  if (st === 'cancelled' || st === 'canceled' || st === 'failed') return 'closed';
  if (es === 'released') return 'released';
  if (es.startsWith('refund')) return 'refunded';
  if (es.includes('disput') || es === 'frozen' || es === 'under_review') return 'disputed';
  if (o.escrow !== true) return 'no_escrow';
  if (!isConfirmedPaid(o)) return 'awaiting_payment';
  return 'held';
}

function firstItemTitle(items: unknown): string {
  if (Array.isArray(items) && items.length > 0) {
    const it = items[0] as Record<string, unknown>;
    const t = it?.title ?? it?.name ?? it?.listingTitle;
    if (typeof t === 'string' && t.trim()) return t.trim();
  }
  return '';
}

const fmtXAF = (n: number | null | undefined) => `${(n || 0).toLocaleString()} XAF`;

/* ---------------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------- */

interface Props {
  /** uuid of the order in public.orders */
  orderId?: string | null;
  /** called after a successful release or refund so the host page can reload */
  onChanged?: () => void;
  className?: string;
}

export default function EscrowActionPanel({ orderId, onChanged, className }: Props) {
  const { s, isRtl } = useStrings();
  const navigate = useNavigate();

  const [order, setOrder] = useState<EscrowOrderRow | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [busy, setBusy] = useState<null | 'release' | 'refund'>(null);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [showBreak, setShowBreak] = useState(false);
  const [modal, setModal] = useState<null | 'release' | 'refund'>(null);
  const [reason, setReason] = useState('');
  const [reasonErr, setReasonErr] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [autoTried, setAutoTried] = useState<string | null>(null);

  /* ---- load ------------------------------------------------------------- */
  const load = useCallback(async () => {
    if (!orderId) { setLoading(false); setOrder(null); return; }
    setLoading(true);
    setLoadError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      setViewerId(sessionData?.session?.user?.id ?? null);

      const { data, error } = await supabase
        .from('orders')
        .select(SELECT_COLS)
        .eq('id', orderId)
        .maybeSingle();

      if (error) { setLoadError(error.message || s.loadErr); setOrder(null); return; }
      if (!data) { setLoadError(s.notFound); setOrder(null); return; }
      setOrder(data as unknown as EscrowOrderRow);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : s.loadErr);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, s.loadErr, s.notFound]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ---- derived ---------------------------------------------------------- */
  const state: EscrowState | null = useMemo(() => (order ? deriveState(order) : null), [order]);
  const isBuyer = !!(order && viewerId && order.buyer_id === viewerId);
  const isSeller = !!(order && viewerId && order.seller_id === viewerId);
  const reference = order?.payment_reference || order?.payment_ref || null;
  const payoutAmount = order?.seller_payout_xaf ?? null;

  /* ---- server calls ----------------------------------------------------- */
  const callPayments = useCallback(
    async (path: 'release-escrow' | 'refund-escrow', extra: Record<string, unknown>) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error(s.signIn);

      const res = await fetch(`${PAYMENTS_BASE}/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // both spellings so the panel matches the server whichever it reads
          orderId: order?.id,
          order_id: order?.id,
          reference,
          ...extra,
        }),
      });

      const raw = await res.text();
      let json: Record<string, unknown> | null = null;
      try { json = raw ? (JSON.parse(raw) as Record<string, unknown>) : null; } catch { /* plain text */ }

      if (!res.ok) {
        const msg =
          (typeof json?.error === 'string' && json.error) ||
          (typeof json?.message === 'string' && json.message) ||
          raw ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }
      return json;
    },
    [order?.id, reference, s.signIn],
  );

  /* ---- FIX209: verify the payment with the provider, server-side --------
   * The client never claims a payment succeeded - it only names the order.
   * The edge function asks CamPay and writes paid_at only on a real success.
   * Runs once automatically per order, and on demand from the button. */
  const confirmPayment = useCallback(async (silent: boolean) => {
    if (!order?.id) return;
    setConfirming(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const tok = sessionData?.session?.access_token;
      if (!tok) throw new Error(s.signIn);

      const res = await fetch(CONFIRM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ orderId: order.id, order_id: order.id }),
      });

      const raw = await res.text();
      let j: Record<string, unknown> | null = null;
      try { j = raw ? (JSON.parse(raw) as Record<string, unknown>) : null; } catch { /* plain text */ }

      if (!res.ok) {
        const msg = (typeof j?.error === 'string' && j.error) || raw || `HTTP ${res.status}`;
        if (!silent) setToast({ kind: 'err', text: msg });
        return;
      }

      if (j?.paid === true) {
        setToast({ kind: 'ok', text: s.nowActive });
        await load();
        onChanged?.();
        return;
      }

      if (!silent) {
        const msg = (typeof j?.message === 'string' && j.message) || s.checkPending;
        setToast({ kind: 'err', text: msg });
      }
    } catch (e) {
      if (!silent) setToast({ kind: 'err', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setConfirming(false);
    }
  }, [order?.id, load, onChanged, s.signIn, s.nowActive, s.checkPending]);

  // Auto-verify once per order, so a buyer who just paid sees escrow activate
  // without having to press anything.
  useEffect(() => {
    if (!order || !viewerId) return;
    if (order.buyer_id !== viewerId) return;
    if (order.paid_at) return;
    if (deriveState(order) !== 'awaiting_payment') return;
    if (!(order.payment_reference || order.payment_ref)) return;
    if (autoTried === order.id) return;
    setAutoTried(order.id);
    void confirmPayment(true);
  }, [order, viewerId, autoTried, confirmPayment]);

  const doRelease = useCallback(async () => {
    if (busy) return;
    setBusy('release');
    setModal(null);
    try {
      await callPayments('release-escrow', { confirmReceipt: true });
      setToast({ kind: 'ok', text: s.okReleased });
      await load();
      onChanged?.();
    } catch (e) {
      setToast({ kind: 'err', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }, [busy, callPayments, load, onChanged, s.okReleased]);

  const doRefund = useCallback(async () => {
    if (busy) return;
    const trimmed = reason.trim();
    if (trimmed.length < 10) { setReasonErr(s.refundNeedReason); return; }
    setReasonErr(null);
    setBusy('refund');
    setModal(null);
    try {
      await callPayments('refund-escrow', { reason: trimmed, declineReason: trimmed });
      setToast({ kind: 'ok', text: s.okRefunded });
      setReason('');
      await load();
      onChanged?.();
    } catch (e) {
      setToast({ kind: 'err', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }, [busy, callPayments, load, onChanged, reason, s.okRefunded, s.refundNeedReason]);

  const messageSeller = useCallback(() => {
    if (!order?.seller_id) return;
    const title = firstItemTitle(order.items) || order.order_number || '';
    navigate(`/chat?userId=${order.seller_id}&listingTitle=${encodeURIComponent(title)}`);
  }, [navigate, order]);

  /* ---- nothing to show ------------------------------------------------- */
  if (!orderId) return null;

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl p-5 ${className ?? ''}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          <span className="text-sm">{s.panelTitle}</span>
        </div>
      </div>
    );
  }

  if (loadError || !order || !state) {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl p-5 ${className ?? ''}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 break-words">{loadError || s.loadErr}</p>
            <button
              onClick={() => void load()}
              className="mt-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              {s.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- status presentation --------------------------------------------- */
  const presentation: Record<EscrowState, { icon: ReactNode; title: string; body: string; tone: string }> = {
    held: {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: s.heldTitle, body: s.heldBody,
      tone: 'bg-emerald-50 border-emerald-200',
    },
    awaiting_payment: {
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      title: s.awaitTitle, body: s.awaitBody,
      tone: 'bg-yellow-50 border-yellow-200',
    },
    released: {
      icon: <CheckCircle2 className="w-6 h-6 text-teal-600" />,
      title: s.releasedTitle, body: s.releasedBody,
      tone: 'bg-teal-50 border-teal-200',
    },
    refunded: {
      icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
      title: s.refundedTitle, body: s.refundedBody,
      tone: 'bg-blue-50 border-blue-200',
    },
    disputed: {
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      title: s.disputedTitle, body: s.disputedBody,
      tone: 'bg-orange-50 border-orange-200',
    },
    no_escrow: {
      icon: <Info className="w-6 h-6 text-gray-500" />,
      title: s.noEscrowTitle, body: s.noEscrowBody,
      tone: 'bg-gray-50 border-gray-200',
    },
    closed: {
      icon: <XCircle className="w-6 h-6 text-gray-500" />,
      title: s.closedTitle, body: s.closedBody,
      tone: 'bg-gray-50 border-gray-200',
    },
  };

  const p = presentation[state];
  const canAct = state === 'held' && isBuyer;
  const lockedByPayment = state === 'awaiting_payment' && isBuyer;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={className ?? ''}>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> {s.panelTitle}
          </h3>
          <button
            onClick={() => void load()}
            className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-gray-100"
            aria-label={s.refresh}
            title={s.refresh}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* status */}
        <div className="px-4 pt-3">
          <div className={`border rounded-xl p-4 flex items-start gap-3 ${p.tone}`}>
            <div className="flex-shrink-0 mt-0.5">{p.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{p.title}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{p.body}</p>
            </div>
          </div>
        </div>

        {/* seller notice */}
        {isSeller && !isBuyer && (
          <div className="px-4 pt-3">
            <div className="border border-gray-200 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-800">{s.sellerTitle}</p>
              <p className="text-xs text-gray-600 mt-1">{s.sellerBody}</p>
            </div>
          </div>
        )}

        {/* actions */}
        {(canAct || lockedByPayment) && (
          <div className="px-4 pt-4 space-y-2">
            <button
              onClick={() => setModal('release')}
              disabled={!canAct || busy !== null}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                canAct && busy === null
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {busy === 'release'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {s.working}</>
                : <>{canAct ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {s.btnConfirm}</>}
            </button>

            <button
              onClick={() => { setReason(''); setReasonErr(null); setModal('refund'); }}
              disabled={!canAct || busy !== null}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                canAct && busy === null
                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                  : 'border-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {busy === 'refund'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {s.working}</>
                : <>{canAct ? <AlertTriangle className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {s.btnRefund}</>}
            </button>

            {lockedByPayment && (
              <>
                <button
                  onClick={() => void confirmPayment(false)}
                  disabled={confirming}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    confirming
                      ? 'bg-gray-100 text-gray-400 cursor-wait'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  {confirming
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {s.checking}</>
                    : <><RefreshCw className="w-4 h-4" /> {s.checkNow}</>}
                </button>
                <p className="text-xs text-yellow-700 flex items-center gap-1.5 pt-0.5">
                  <Lock className="w-3 h-3 flex-shrink-0" /> {s.lockedPaid}
                </p>
              </>
            )}
          </div>
        )}

        {/* secondary */}
        <div className="px-4 pt-3 pb-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          {order.seller_id && (
            <button
              onClick={messageSeller}
              className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" /> {s.btnChat}
            </button>
          )}
          <button
            onClick={() => setShowBreak(v => !v)}
            className="text-sm font-semibold text-gray-600 hover:text-gray-800 flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" />
            {showBreak ? s.hideBreak : s.showBreak}
            {showBreak ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* breakdown */}
        {showBreak && (
          <div className="px-4 pb-2">
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 text-sm">
              <Row label={s.brOrder} value={order.order_number || order.id.slice(0, 8)} mono />
              {reference && <Row label={s.brRef} value={reference} mono />}
              <Row label={s.brTotal} value={fmtXAF(order.total_xaf)} strong />
              <Row label={s.brFee} value={fmtXAF(order.platform_fee_xaf)} />
              <Row label={s.brSeller} value={fmtXAF(order.seller_payout_xaf)} strong />
              <Row
                label={s.brStatus}
                value={(order.escrow_status || '-').replace(/_/g, ' ')}
              />
            </div>
          </div>
        )}

        <div className="h-3" />
      </div>

      {/* toast */}
      {toast && (
        <div
          className={`mt-3 rounded-xl border px-4 py-3 flex items-start gap-2 ${
            toast.kind === 'ok'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {toast.kind === 'ok'
            ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
          <p className={`text-sm break-words ${toast.kind === 'ok' ? 'text-green-800' : 'text-red-800'}`}>
            {toast.text}
          </p>
        </div>
      )}

      {/* ---- release confirmation ---- */}
      {modal === 'release' && (
        <Modal onClose={() => setModal(null)} isRtl={isRtl}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900">{s.confirmTitle}</h4>
              <p className="text-sm text-gray-700 mt-2">
                {s.confirmLine1.replace('{amount}', fmtXAF(payoutAmount ?? order.total_xaf))}
              </p>
              <p className="text-sm text-gray-500 mt-2">{s.confirmLine2}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={() => setModal(null)}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-100"
            >
              {s.cancel}
            </button>
            <button
              onClick={() => void doRelease()}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white"
            >
              {s.confirmCta}
            </button>
          </div>
        </Modal>
      )}

      {/* ---- refund request ---- */}
      {modal === 'refund' && (
        <Modal onClose={() => setModal(null)} isRtl={isRtl}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900">{s.refundTitle}</h4>
              <p className="text-sm text-gray-600 mt-2">{s.refundBody}</p>
            </div>
          </div>
          <textarea
            value={reason}
            onChange={e => { setReason(e.target.value); if (reasonErr) setReasonErr(null); }}
            rows={4}
            placeholder={s.refundPlaceholder}
            className="mt-4 w-full border-2 border-gray-200 focus:border-teal-500 rounded-xl p-3 text-sm outline-none resize-none"
          />
          {reasonErr && <p className="text-xs text-red-600 mt-1.5">{reasonErr}</p>}
          <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={() => setModal(null)}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-100"
            >
              {s.cancel}
            </button>
            <button
              onClick={() => void doRefund()}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-red-600 hover:bg-red-700 text-white"
            >
              {s.refundCta}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Small local pieces
 * ------------------------------------------------------------------------- */

function Row({ label, value, strong, mono }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-3 px-3 py-2.5">
      <span className="text-gray-500 text-xs">{label}</span>
      <span
        className={`${mono ? 'font-mono text-xs' : 'text-sm'} ${
          strong ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
        } text-right break-all`}
      >
        {value}
      </span>
    </div>
  );
}

function Modal({
  children, onClose, isRtl,
}: { children: ReactNode; onClose: () => void; isRtl: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__ESCROWACTIONPANEL_FIX209__COMPLETE
