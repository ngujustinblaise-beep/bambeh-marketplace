// BAMBEH_DEPLOY_TOKEN__CART_FIX854_CLEAN
/**
 * src/pages/Cart.tsx - Bambeh Marketplace
 *
 * FIX854 - THE CART SAYS WHAT REALLY HAPPENS, IN THE BUYER'S LANGUAGE.
 *   - Five languages, right-to-left for Arabic. The whole page was English.
 *   - "Escrow" is gone from every word the buyer sees: it is Bambeh Secured Pay (Big's naming decision).
 *   - The old "If anything goes wrong, you get a full refund" was not true. A problem is reported before
 *     confirming, the money stays held while Bambeh reviews it (72 hours), and an approved refund returns the ITEM
 *     PRICE to the number that paid - the commission and charges are not refunded (Big's refund rule).
 *   - The total is priced exactly like the payments server: one order per seller, the 4 XAF tax once (the same
 *     maths as the checkout page, FIX685). With two sellers the old cart showed 1 XAF less than the phone prompt.
 *   - One pay button instead of three that all did the same thing. When an item does not say which listing or
 *     seller it is, the button goes through the checkout page, which looks the listing up (or refuses to charge).
 *   - "Delivery fee calculated separately at checkout" was not true either: no delivery fee is ever added here.
 *     The cart now says how delivery really works.
 *   - Who holds the money is not named: the payment is "held safely" (by CamPay, under its own licence - Bambeh
 *     never holds customer money).
 *
 * KEPT FROM THE ORDER-FIRST VERSION: the browser never creates an order. initCartPayment() -> POST /cart: the server
 * checks prices, reserves stock, creates one order per seller as pending, sends the mobile money prompt; the payment
 * check marks the orders paid and the money is held until the buyer confirms receipt (FIX663: every purchase).
 * Checkout needs a signed-in buyer.
 *
 * Every non-English character is a \u escape.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight,
  Shield, Info, Smartphone, Loader2, CheckCircle2,
  XCircle, Lock, Leaf, Zap, Users, Tag, Clock, Truck, MessageCircle, ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { CartItem } from '@/contexts/CartContext';
import { useCamPay, normalizePhone, detectOperator } from '@/hooks/useCamPay';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import SecuredPayNote from '@/components/payment/SecuredPayNote'; // FIX684

// --- Words ---------------------------------------------------------------------

type LangKey = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
type Key =
  | 'title' | 'itemOne' | 'itemMany' | 'each' | 'soldBy' | 'remove' | 'less' | 'more'
  | 'summary' | 'item' | 'items' | 'commission' | 'commissionTip' | 'service' | 'serviceTip' | 'total'
  | 'sellers' | 'deliveryTitle' | 'deliveryBody' | 'payBtn' | 'processing'
  | 'howTitle' | 'how1' | 'how2' | 'how3' | 'how4' | 'badge'
  | 'emptyTitle' | 'emptyBody' | 'c_marketplace' | 'c_farm' | 'c_group' | 'c_flash'
  | 'doneTitle' | 'doneBody' | 'track' | 'keepShopping' | 'ref'
  | 'mmTitle' | 'mmSub' | 'amount' | 'okTitle' | 'okBody' | 'checkPhone' | 'checkPhoneBody' | 'waiting' | 'checking'
  | 'sending' | 'failTitle' | 'timeoutTitle' | 'helpLine' | 'chat' | 'numLabel' | 'numHint' | 'confirmPay'
  | 'errLen' | 'errOp' | 'cancel'
  | 't_marketplace' | 't_farm' | 't_flash' | 't_group' | 't_vehicle';

const T: Record<LangKey, Record<Key, string>> = {
  en: {
    title: 'Cart', itemOne: '1 item', itemMany: '{n} items', each: '{price} XAF each', soldBy: 'Sold by {name}',
    remove: 'Remove', less: 'One less', more: 'One more',
    summary: 'Order summary', item: 'Item', items: 'Items',
    commission: 'Bambeh commission (1%)', commissionTip: "Bambeh's commission: 1% of the item price.",
    service: 'Service and payment charge',
    serviceTip: 'Government tax, VAT on the commission, the mobile money charges for collecting and for paying the seller, and a small Bambeh margin.',
    total: 'Total', sellers: 'Items from {n} sellers: each seller gets their own order. You pay once.',
    deliveryTitle: 'Delivery is not included',
    deliveryBody: 'Agree on delivery with the seller in chat, or book a Bambeh rider (paid separately).',
    payBtn: 'Pay {amount} XAF with Bambeh Secured Pay', processing: 'Processing...',
    howTitle: 'How Bambeh Secured Pay protects you',
    how1: 'You pay with MTN or Orange Money. The money is held safely - the seller does not receive it yet.',
    how2: 'The seller prepares your order and tells you where it is (My orders).',
    how3: 'You confirm you received it. Only then is the seller paid.',
    how4: 'A problem? Report it before you confirm. The money stays held while Bambeh reviews it (within 72 hours). If Bambeh approves a refund, the item price comes back to the number that paid; the commission and charges are not refunded.',
    badge: 'Payments go through CamPay (MTN and Orange) for BAMBEH SARL',
    emptyTitle: 'Your cart is empty', emptyBody: 'Add items from the marketplace, Farm Fresh, group deals and more.',
    c_marketplace: 'Marketplace', c_farm: 'Farm Fresh', c_group: 'Group deals', c_flash: 'Flash deals',
    doneTitle: 'Order placed', doneBody: 'Your payment is held safely. The seller has been told and will prepare your order.',
    track: 'Track my order', keepShopping: 'Keep shopping', ref: 'Reference',
    mmTitle: 'Mobile Money payment', mmSub: 'Bambeh Secured Pay', amount: 'Amount to pay',
    okTitle: 'Payment confirmed', okBody: 'Your order has been placed.',
    checkPhone: 'Check your phone', checkPhoneBody: 'A payment request was sent to your number. Enter your PIN to approve it.',
    waiting: 'Waiting... {time}', checking: 'Checking with your operator...', sending: 'Sending the request to your phone...',
    failTitle: 'Payment failed', timeoutTitle: 'No answer from your phone in time',
    helpLine: 'If money left your account but nothing happened, write to Bambeh in the app with the reference, or email support@bambeh.com.',
    chat: 'Chat with Bambeh',
    numLabel: 'MTN or Orange Money number', numHint: 'A payment prompt will appear on your phone. Enter your PIN to pay.',
    confirmPay: 'Confirm and pay {amount} XAF',
    errLen: 'Enter your 9-digit MTN or Orange number (6XX XXX XXX).', errOp: 'This is not an MTN or Orange number.',
    cancel: 'Cancel',
    t_marketplace: 'Marketplace', t_farm: 'Farm Fresh', t_flash: 'Flash deal', t_group: 'Group deal', t_vehicle: 'Vehicle',
  },
  fr: {
    title: 'Panier', itemOne: '1 article', itemMany: '{n} articles', each: '{price} XAF l\u2019unit\u00e9', soldBy: 'Vendu par {name}',
    remove: 'Retirer', less: 'Un de moins', more: 'Un de plus',
    summary: 'R\u00e9capitulatif', item: 'Article', items: 'Articles',
    commission: 'Commission Bambeh (1 %)', commissionTip: 'La commission de Bambeh : 1 % du prix de l\u2019article.',
    service: 'Frais de service et de paiement',
    serviceTip: 'Taxe de l\u2019\u00c9tat, TVA sur la commission, frais mobile money pour encaisser et pour payer le vendeur, et une petite marge Bambeh.',
    total: 'Total', sellers: 'Articles de {n} vendeurs : chaque vendeur re\u00e7oit sa propre commande. Vous payez une seule fois.',
    deliveryTitle: 'La livraison n\u2019est pas comprise',
    deliveryBody: 'Convenez de la livraison avec le vendeur dans le chat, ou r\u00e9servez un livreur Bambeh (pay\u00e9 \u00e0 part).',
    payBtn: 'Payer {amount} XAF avec Bambeh Secured Pay', processing: 'Traitement...',
    howTitle: 'Comment Bambeh Secured Pay vous prot\u00e8ge',
    how1: 'Vous payez par MTN ou Orange Money. L\u2019argent est gard\u00e9 en s\u00e9curit\u00e9 : le vendeur ne le re\u00e7oit pas encore.',
    how2: 'Le vendeur pr\u00e9pare votre commande et vous dit o\u00f9 elle en est (Mes commandes).',
    how3: 'Vous confirmez l\u2019avoir re\u00e7ue. Alors seulement le vendeur est pay\u00e9.',
    how4: 'Un probl\u00e8me ? Signalez-le avant de confirmer. L\u2019argent reste gard\u00e9 pendant que Bambeh examine (sous 72 heures). Si Bambeh accorde un remboursement, le prix de l\u2019article revient au num\u00e9ro qui a pay\u00e9 ; la commission et les frais ne sont pas rembours\u00e9s.',
    badge: 'Les paiements passent par CamPay (MTN et Orange) pour BAMBEH SARL',
    emptyTitle: 'Votre panier est vide', emptyBody: 'Ajoutez des articles de la marketplace, de Farm Fresh, des achats group\u00e9s et plus.',
    c_marketplace: 'Marketplace', c_farm: 'Farm Fresh', c_group: 'Achats group\u00e9s', c_flash: 'Ventes flash',
    doneTitle: 'Commande enregistr\u00e9e', doneBody: 'Votre paiement est gard\u00e9 en s\u00e9curit\u00e9. Le vendeur est pr\u00e9venu et va pr\u00e9parer votre commande.',
    track: 'Suivre ma commande', keepShopping: 'Continuer mes achats', ref: 'R\u00e9f\u00e9rence',
    mmTitle: 'Paiement Mobile Money', mmSub: 'Bambeh Secured Pay', amount: 'Montant \u00e0 payer',
    okTitle: 'Paiement confirm\u00e9', okBody: 'Votre commande est enregistr\u00e9e.',
    checkPhone: 'Regardez votre t\u00e9l\u00e9phone', checkPhoneBody: 'Une demande de paiement a \u00e9t\u00e9 envoy\u00e9e \u00e0 votre num\u00e9ro. Entrez votre code pour la valider.',
    waiting: 'En attente... {time}', checking: 'V\u00e9rification aupr\u00e8s de votre op\u00e9rateur...', sending: 'Envoi de la demande \u00e0 votre t\u00e9l\u00e9phone...',
    failTitle: '\u00c9chec du paiement', timeoutTitle: 'Pas de r\u00e9ponse de votre t\u00e9l\u00e9phone \u00e0 temps',
    helpLine: 'Si de l\u2019argent a quitt\u00e9 votre compte sans r\u00e9sultat, \u00e9crivez \u00e0 Bambeh dans l\u2019application avec la r\u00e9f\u00e9rence, ou \u00e0 support@bambeh.com.',
    chat: 'Discuter avec Bambeh',
    numLabel: 'Num\u00e9ro MTN ou Orange Money', numHint: 'Une demande de paiement appara\u00eetra sur votre t\u00e9l\u00e9phone. Entrez votre code pour payer.',
    confirmPay: 'Confirmer et payer {amount} XAF',
    errLen: 'Entrez votre num\u00e9ro MTN ou Orange \u00e0 9 chiffres (6XX XXX XXX).', errOp: 'Ce num\u00e9ro n\u2019est ni MTN ni Orange.',
    cancel: 'Annuler',
    t_marketplace: 'Marketplace', t_farm: 'Farm Fresh', t_flash: 'Vente flash', t_group: 'Achat group\u00e9', t_vehicle: 'V\u00e9hicule',
  },
  pidgin: {
    title: 'Cart', itemOne: '1 thing', itemMany: '{n} things', each: '{price} XAF for one', soldBy: 'Na {name} dey sell',
    remove: 'Comot am', less: 'Reduce one', more: 'Add one',
    summary: 'Wetin you dey buy', item: 'Thing', items: 'Things',
    commission: 'Bambeh commission (1%)', commissionTip: 'Bambeh commission: 1% of the price.',
    service: 'Service and payment charge',
    serviceTip: 'Government tax, VAT for the commission, mobile money charges to collect and to pay the seller, and small Bambeh margin.',
    total: 'Total', sellers: 'Things from {n} sellers: each seller get him own order. You pay one time.',
    deliveryTitle: 'Delivery no dey inside',
    deliveryBody: 'Agree delivery with the seller for chat, or book Bambeh rider (you pay am separate).',
    payBtn: 'Pay {amount} XAF with Bambeh Secured Pay', processing: 'E dey process...',
    howTitle: 'How Bambeh Secured Pay dey protect you',
    how1: 'You pay with MTN or Orange Money. The money dey safe - seller never collect am yet.',
    how2: 'Seller go prepare your order and tell you where e reach (My orders).',
    how3: 'You confirm say you don receive am. Na only then dem go pay the seller.',
    how4: 'Problem dey? Report am before you confirm. The money go still dey hold while Bambeh dey check (inside 72 hours). If Bambeh gree refund, the price of the thing go return to the number wey pay; commission and charges no dey return.',
    badge: 'Payment dey pass through CamPay (MTN and Orange) for BAMBEH SARL',
    emptyTitle: 'Your cart empty', emptyBody: 'Put things from marketplace, Farm Fresh, group deals and more.',
    c_marketplace: 'Marketplace', c_farm: 'Farm Fresh', c_group: 'Group deals', c_flash: 'Flash deals',
    doneTitle: 'Order don enter', doneBody: 'Your money dey safe. We don tell the seller, e go prepare your order.',
    track: 'Follow my order', keepShopping: 'Continue to buy', ref: 'Reference',
    mmTitle: 'Mobile Money payment', mmSub: 'Bambeh Secured Pay', amount: 'Money wey you go pay',
    okTitle: 'Payment don enter', okBody: 'Your order don enter.',
    checkPhone: 'Check your phone', checkPhoneBody: 'We don send payment request to your number. Put your PIN to approve am.',
    waiting: 'We dey wait... {time}', checking: 'We dey check with your network...', sending: 'We dey send the request to your phone...',
    failTitle: 'Payment no pass', timeoutTitle: 'Your phone no answer on time',
    helpLine: 'If money comot for your account but nothing happen, write Bambeh for inside the app with the reference, or email support@bambeh.com.',
    chat: 'Chat with Bambeh',
    numLabel: 'MTN or Orange Money number', numHint: 'Payment request go show for your phone. Put your PIN to pay.',
    confirmPay: 'Confirm and pay {amount} XAF',
    errLen: 'Put your MTN or Orange number wey get 9 numbers (6XX XXX XXX).', errOp: 'This number no be MTN or Orange.',
    cancel: 'Cancel',
    t_marketplace: 'Marketplace', t_farm: 'Farm Fresh', t_flash: 'Flash deal', t_group: 'Group deal', t_vehicle: 'Motor',
  },
  ar: {
    title: '\u0627\u0644\u0633\u0644\u0629', itemOne: '\u0645\u0646\u062a\u062c \u0648\u0627\u062d\u062f', itemMany: '{n} \u0645\u0646\u062a\u062c\u0627\u062a', each: '{price} XAF \u0644\u0644\u0648\u062d\u062f\u0629', soldBy: '\u064a\u0628\u064a\u0639\u0647 {name}',
    remove: '\u0625\u0632\u0627\u0644\u0629', less: '\u0648\u0627\u062d\u062f \u0623\u0642\u0644', more: '\u0648\u0627\u062d\u062f \u0623\u0643\u062b\u0631',
    summary: '\u0645\u0644\u062e\u0635 \u0627\u0644\u0637\u0644\u0628', item: '\u0627\u0644\u0645\u0646\u062a\u062c', items: '\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a',
    commission: '\u0639\u0645\u0648\u0644\u0629 Bambeh (1%)', commissionTip: '\u0639\u0645\u0648\u0644\u0629 Bambeh: 1% \u0645\u0646 \u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u062a\u062c.',
    service: '\u0631\u0633\u0648\u0645 \u0627\u0644\u062e\u062f\u0645\u0629 \u0648\u0627\u0644\u062f\u0641\u0639',
    serviceTip: '\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u062f\u0648\u0644\u0629\u060c \u0648\u0636\u0631\u064a\u0628\u0629 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0639\u0644\u0649 \u0627\u0644\u0639\u0645\u0648\u0644\u0629\u060c \u0648\u0631\u0633\u0648\u0645 \u0627\u0644\u062f\u0641\u0639 \u0628\u0627\u0644\u0647\u0627\u062a\u0641 \u0644\u0644\u062a\u062d\u0635\u064a\u0644 \u0648\u0644\u0644\u062f\u0641\u0639 \u0644\u0644\u0628\u0627\u0626\u0639\u060c \u0648\u0647\u0627\u0645\u0634 \u0635\u063a\u064a\u0631 \u0644\u0640 Bambeh.',
    total: '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a', sellers: '\u0645\u0646\u062a\u062c\u0627\u062a \u0645\u0646 {n} \u0628\u0627\u0626\u0639\u064a\u0646: \u0644\u0643\u0644 \u0628\u0627\u0626\u0639 \u0637\u0644\u0628\u0647 \u0627\u0644\u062e\u0627\u0635. \u062a\u062f\u0641\u0639 \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629.',
    deliveryTitle: '\u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u063a\u064a\u0631 \u0645\u0634\u0645\u0648\u0644',
    deliveryBody: '\u0627\u062a\u0641\u0642 \u0639\u0644\u0649 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0645\u0639 \u0627\u0644\u0628\u0627\u0626\u0639 \u0641\u064a \u0627\u0644\u062f\u0631\u062f\u0634\u0629\u060c \u0623\u0648 \u0627\u062d\u062c\u0632 \u0645\u0648\u0635\u0651\u0644\u064b\u0627 \u0645\u0646 Bambeh (\u064a\u064f\u062f\u0641\u0639 \u0645\u0646\u0641\u0635\u0644\u064b\u0627).',
    payBtn: '\u0627\u062f\u0641\u0639 {amount} XAF \u0639\u0628\u0631 Bambeh Secured Pay', processing: '\u062c\u0627\u0631\u064d \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629...',
    howTitle: '\u0643\u064a\u0641 \u064a\u062d\u0645\u064a\u0643 Bambeh Secured Pay',
    how1: '\u062a\u062f\u0641\u0639 \u0639\u0628\u0631 MTN \u0623\u0648 Orange Money. \u064a\u064f\u062d\u0641\u0638 \u0627\u0644\u0645\u0627\u0644 \u0628\u0623\u0645\u0627\u0646 \u0648\u0644\u0627 \u064a\u0633\u062a\u0644\u0645\u0647 \u0627\u0644\u0628\u0627\u0626\u0639 \u0628\u0639\u062f.',
    how2: '\u064a\u062c\u0647\u0651\u0632 \u0627\u0644\u0628\u0627\u0626\u0639 \u0637\u0644\u0628\u0643 \u0648\u064a\u062e\u0628\u0631\u0643 \u0628\u0645\u0643\u0627\u0646\u0647 (\u0637\u0644\u0628\u0627\u062a\u064a).',
    how3: '\u062a\u0624\u0643\u062f \u0623\u0646\u0643 \u0627\u0633\u062a\u0644\u0645\u062a\u0647. \u0639\u0646\u062f\u0647\u0627 \u0641\u0642\u0637 \u064a\u064f\u062f\u0641\u0639 \u0644\u0644\u0628\u0627\u0626\u0639.',
    how4: '\u0647\u0644 \u0647\u0646\u0627\u0643 \u0645\u0634\u0643\u0644\u0629\u061f \u0623\u0628\u0644\u063a \u0639\u0646\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u062a\u0623\u0643\u064a\u062f. \u064a\u0628\u0642\u0649 \u0627\u0644\u0645\u0627\u0644 \u0645\u062d\u0641\u0648\u0638\u064b\u0627 \u0628\u064a\u0646\u0645\u0627 \u062a\u0631\u0627\u062c\u0639 Bambeh \u0627\u0644\u0623\u0645\u0631 (\u062e\u0644\u0627\u0644 72 \u0633\u0627\u0639\u0629). \u0625\u0630\u0627 \u0648\u0627\u0641\u0642\u062a Bambeh \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f\u060c \u064a\u0639\u0648\u062f \u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u062a\u062c \u0625\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0630\u064a \u062f\u0641\u0639\u061b \u0644\u0627 \u062a\u064f\u0633\u062a\u0631\u062f \u0627\u0644\u0639\u0645\u0648\u0644\u0629 \u0648\u0627\u0644\u0631\u0633\u0648\u0645.',
    badge: '\u062a\u0645\u0631 \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0639\u0628\u0631 CamPay (MTN \u0648Orange) \u0644\u0635\u0627\u0644\u062d BAMBEH SARL',
    emptyTitle: '\u0633\u0644\u062a\u0643 \u0641\u0627\u0631\u063a\u0629', emptyBody: '\u0623\u0636\u0641 \u0645\u0646\u062a\u062c\u0627\u062a \u0645\u0646 \u0627\u0644\u0633\u0648\u0642 \u0648Farm Fresh \u0648\u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u062c\u0645\u0627\u0639\u064a \u0648\u063a\u064a\u0631\u0647\u0627.',
    c_marketplace: '\u0627\u0644\u0633\u0648\u0642', c_farm: 'Farm Fresh', c_group: '\u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u062c\u0645\u0627\u0639\u064a', c_flash: '\u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u0633\u0631\u064a\u0639\u0629',
    doneTitle: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0637\u0644\u0628', doneBody: '\u062f\u0641\u0639\u062a\u0643 \u0645\u062d\u0641\u0648\u0638\u0629 \u0628\u0623\u0645\u0627\u0646. \u0623\u064f\u0628\u0644\u063a \u0627\u0644\u0628\u0627\u0626\u0639 \u0648\u0633\u064a\u062c\u0647\u0651\u0632 \u0637\u0644\u0628\u0643.',
    track: '\u062a\u062a\u0628\u0651\u0639 \u0637\u0644\u0628\u064a', keepShopping: '\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u062a\u0633\u0648\u0642', ref: '\u0627\u0644\u0645\u0631\u062c\u0639',
    mmTitle: '\u0627\u0644\u062f\u0641\u0639 \u0639\u0628\u0631 \u0627\u0644\u0647\u0627\u062a\u0641', mmSub: 'Bambeh Secured Pay', amount: '\u0627\u0644\u0645\u0628\u0644\u063a \u0627\u0644\u0645\u0637\u0644\u0648\u0628',
    okTitle: '\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639', okBody: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0637\u0644\u0628\u0643.',
    checkPhone: '\u062a\u062d\u0642\u0642 \u0645\u0646 \u0647\u0627\u062a\u0641\u0643', checkPhoneBody: '\u0623\u064f\u0631\u0633\u0644 \u0637\u0644\u0628 \u062f\u0641\u0639 \u0625\u0644\u0649 \u0631\u0642\u0645\u0643. \u0623\u062f\u062e\u0644 \u0631\u0645\u0632\u0643 \u0627\u0644\u0633\u0631\u064a \u0644\u0644\u0645\u0648\u0627\u0641\u0642\u0629.',
    waiting: '\u0641\u064a \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631... {time}', checking: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0639 \u0645\u0634\u063a\u0651\u0644\u0643...', sending: '\u062c\u0627\u0631\u064d \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628 \u0625\u0644\u0649 \u0647\u0627\u062a\u0641\u0643...',
    failTitle: '\u0641\u0634\u0644 \u0627\u0644\u062f\u0641\u0639', timeoutTitle: '\u0644\u0645 \u064a\u0635\u0644 \u0631\u062f \u0645\u0646 \u0647\u0627\u062a\u0641\u0643 \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u062d\u062f\u062f',
    helpLine: '\u0625\u0630\u0627 \u062e\u0631\u062c \u0627\u0644\u0645\u0627\u0644 \u0645\u0646 \u062d\u0633\u0627\u0628\u0643 \u062f\u0648\u0646 \u0646\u062a\u064a\u062c\u0629\u060c \u0627\u0643\u062a\u0628 \u0625\u0644\u0649 Bambeh \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0645\u0639 \u0627\u0644\u0645\u0631\u062c\u0639\u060c \u0623\u0648 \u0631\u0627\u0633\u0644 support@bambeh.com.',
    chat: '\u062a\u062d\u062f\u0651\u062b \u0645\u0639 Bambeh',
    numLabel: '\u0631\u0642\u0645 MTN \u0623\u0648 Orange Money', numHint: '\u0633\u064a\u0638\u0647\u0631 \u0637\u0644\u0628 \u062f\u0641\u0639 \u0639\u0644\u0649 \u0647\u0627\u062a\u0641\u0643. \u0623\u062f\u062e\u0644 \u0631\u0645\u0632\u0643 \u0627\u0644\u0633\u0631\u064a \u0644\u0644\u062f\u0641\u0639.',
    confirmPay: '\u0623\u0643\u0651\u062f \u0648\u0627\u062f\u0641\u0639 {amount} XAF',
    errLen: '\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 MTN \u0623\u0648 Orange \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 9 \u0623\u0631\u0642\u0627\u0645 (6XX XXX XXX).', errOp: '\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u0644\u064a\u0633 \u0645\u0646 MTN \u0623\u0648 Orange.',
    cancel: '\u0625\u0644\u063a\u0627\u0621',
    t_marketplace: '\u0627\u0644\u0633\u0648\u0642', t_farm: 'Farm Fresh', t_flash: '\u0639\u0631\u0636 \u0633\u0631\u064a\u0639', t_group: '\u0634\u0631\u0627\u0621 \u062c\u0645\u0627\u0639\u064a', t_vehicle: '\u0645\u0631\u0643\u0628\u0629',
  },
  ff: {
    title: 'Cart', itemOne: 'Huunde wootere', itemMany: 'Ge\u0257e {n}', each: '{price} XAF gooto', soldBy: 'Jeeyoowo: {name}',
    remove: '\u0181ottu', less: 'Ustu gooto', more: '\u0181eydu gooto',
    summary: 'Ko soodataa', item: 'Huunde', items: 'Ge\u0257e',
    commission: 'Komisiyon Bambeh (1%)', commissionTip: 'Komisiyon Bambeh: 1% coggu huunde ndee.',
    service: 'Njo\u0253di golle e yo\u0253orde',
    serviceTip: 'Lempo laamu, TVA e komisiyon, njo\u0253di mobile money ngam he\u0253de e ngam yo\u0253de jeeyoowo, e ngonka Bambeh pamaro.',
    total: 'Fof', sellers: 'Ge\u0257e jeeyoo\u0253e {n}: kala jeeyoowo ina he\u0253a ordoru mum. A yo\u0253at laawol gootol.',
    deliveryTitle: 'Naworgol naataani \u0257oo',
    deliveryBody: 'Fottu e jeeyoowo e chat fii naworgol, walla \u0257a\u0253\u0253u naw\u0257o Bambeh (yo\u0253etee ko woori).',
    payBtn: 'Yo\u0253 {amount} XAF e Bambeh Secured Pay', processing: 'Ina wa\u0257ee...',
    howTitle: 'No Bambeh Secured Pay reenirta ma',
    how1: 'A yo\u0253ay e MTN walla Orange Money. Kaalis ngal ina reenee - jeeyoowo he\u0253aani ngal tawo.',
    how2: 'Jeeyoowo moftay ordoru maa, wiyay ma toon o yottii (Ordoruuji am).',
    how3: 'A tabitinay wonde a he\u0253ii. Ndeen tan jeeyoowo yo\u0253ete.',
    how4: 'Ca\u0257eele woodi? Habru \u0257um hade maa tabitinde. Kaalis ngal ina heddoo reenaa tuma nde Bambeh \u01b4eewtata (nder waktuuji 72). So Bambeh jaba\u0257o ruttingol, coggu huunde ndee ruttoto e limoore mo yo\u0253i; komisiyon e njo\u0253di ruttataake.',
    badge: 'Njo\u0253di ina yaha e CamPay (MTN e Orange) ngam BAMBEH SARL',
    emptyTitle: 'Cart maa ina meho', emptyBody: '\u0181eydu ge\u0257e immorde e marketplace, Farm Fresh, coodgu jamaa e goo\u0257e.',
    c_marketplace: 'Marketplace', c_farm: 'Farm Fresh', c_group: 'Coodgu jamaa', c_flash: 'Flash deals',
    doneTitle: 'Ordoru naatii', doneBody: 'Njo\u0253di maa ina reenee. Jeeyoowo anndinaama, o moftay ordoru maa.',
    track: 'Rewu ordoru am', keepShopping: 'Jokku coodgu', ref: 'Tonngoode',
    mmTitle: 'Njo\u0253di Mobile Money', mmSub: 'Bambeh Secured Pay', amount: 'Kaalis njo\u0253etee\u0257i',
    okTitle: 'Njo\u0253di tabitinaama', okBody: 'Ordoru maa naatii.',
    checkPhone: '\u01b3eew telefon maa', checkPhoneBody: '\u0181a\u0253\u0253itol njo\u0253di neldaama e limoore maa. Winndu PIN maa ngam ja\u0253de.',
    waiting: 'Ina habbii... {time}', checking: 'Ina \u01b4eewtee e reseau maa...', sending: 'Ina neldee \u0257a\u0253\u0253itol ngol e telefon maa...',
    failTitle: 'Njo\u0253di wa\u0257aaki', timeoutTitle: 'Telefon maa jaabaaki e sahaa',
    helpLine: 'So kaalis yalti e konte maa kono huunde wa\u0257aaki, winndan Bambeh e nder jaa\u0253nirgal ngal e tonngoode ndee, walla support@bambeh.com.',
    chat: 'Yeewtu e Bambeh',
    numLabel: 'Limoore MTN walla Orange Money', numHint: '\u0181a\u0253\u0253itol njo\u0253di feeyan e telefon maa. Winndu PIN maa ngam yo\u0253de.',
    confirmPay: 'Tabitin, yo\u0253 {amount} XAF',
    errLen: 'Winndu limoore MTN walla Orange maa (limle 9: 6XX XXX XXX).', errOp: 'Ndee limoore wonaa MTN walla Orange.',
    cancel: 'Haa\u0257',
    t_marketplace: 'Marketplace', t_farm: 'Farm Fresh', t_flash: 'Flash deal', t_group: 'Coodgu jamaa', t_vehicle: 'Oto',
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

// --- Pricing: IDENTICAL to the payments server and to PaymentCheckout (FIX685) ------
// IF THE EDGE FUNCTION EVER CHANGES, CHANGE THIS BLOCK IN THE SAME BREATH.
// Integer arithmetic in basis points - 0.0025 + 0.0075 does not equal 0.01 in JavaScript, and money must not drift.
const COMMISSION_BP = 100;   // Bambeh keeps 1% of the item price
const VAT_BP        = 1925;  // 19.25% - on the COMMISSION only
const GOV_TAX_FLAT  = 4;     // XAF, once per payment
const PAYOUT_FEE_BP = 100;   // the payout to the seller is grossed up 1%
const PROCESSING_BP = 400;   // the whole charge divided by 0.96

/** One seller's order: what the buyer pays for `subtotal`. */
function priceOrder(subtotal: number, withGovTax: boolean): { commission: number; total: number } {
  if (!(subtotal > 0)) return { commission: 0, total: 0 };
  const commission = Math.round((subtotal * COMMISSION_BP) / 10000);
  const payout = Math.ceil((subtotal * 10000) / (10000 - PAYOUT_FEE_BP));
  const gov = withGovTax ? GOV_TAX_FLAT : 0;
  const numerator = (payout + commission + gov) * 10000 + commission * VAT_BP;
  return { commission, total: Math.ceil(numerator / (10000 - PROCESSING_BP)) };
}

/** The basket the way the server charges it: one order per seller, in basket order, the 4 XAF on the first. */
function priceBasket(lines: { sellerId: string | null; priceXAF: number; quantity: number }[]) {
  const groups: { key: string; subtotal: number }[] = [];
  for (const l of lines) {
    const key = l.sellerId || '?';
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, subtotal: 0 }; groups.push(g); }
    g.subtotal += Math.max(0, Math.round(l.priceXAF)) * Math.max(1, Math.round(l.quantity));
  }
  let subtotal = 0; let commission = 0; let total = 0;
  groups.forEach((g, idx) => {
    const o = priceOrder(g.subtotal, idx === 0);
    subtotal += g.subtotal; commission += o.commission; total += o.total;
  });
  return { subtotal, commission, serviceCharge: total - subtotal - commission, total, sellers: groups.length };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The cart's own Pay button sends lines as they are; only lines that name listing, type and seller qualify. */
function isDirectLine(i: CartItem): boolean {
  return !!i.listingId && UUID_RE.test(String(i.listingId)) && !!i.listingType && !!i.sellerId && UUID_RE.test(String(i.sellerId));
}

const TYPE_ICONS: Record<string, ReactNode> = {
  'farm-fresh':   <Leaf  className="w-3 h-3 text-green-600" />,
  'flash-deal':   <Zap   className="w-3 h-3 text-yellow-600" />,
  'group-buying': <Users className="w-3 h-3 text-blue-600" />,
  'marketplace':  <Tag   className="w-3 h-3 text-teal-600" />,
};
const TYPE_KEY: Record<string, Key> = {
  'marketplace': 't_marketplace', 'listing': 't_marketplace', 'farm-fresh': 't_farm', 'farm_fresh': 't_farm',
  'flash-deal': 't_flash', 'group-buying': 't_group', 'vehicle': 't_vehicle',
};

// --- FeeRow ----------------------------------------------------------------------

function FeeRow({ label, amount, muted = false, bold = false, tooltip }: {
  label: string; amount: string; muted?: boolean; bold?: boolean; tooltip?: string;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div className={`flex justify-between items-center py-1.5 text-sm ${
      bold ? 'font-bold text-gray-900 text-base' : muted ? 'text-gray-500' : 'text-gray-700'
    }`}>
      <span className="flex items-center gap-1">
        {label}
        {tooltip && (
          <span className="relative">
            <button type="button" aria-label={tooltip} onClick={() => setTip((v) => !v)}
                    onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {tip && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 text-xs bg-gray-800 text-white rounded-lg px-2 py-1 pointer-events-none z-10 text-center shadow-lg">
                {tooltip}
              </span>
            )}
          </span>
        )}
      </span>
      <span dir="ltr">{amount}</span>
    </div>
  );
}

// --- MobileMoneyModal ---------------------------------------------------------------

function MobileMoneyModal({ t, rtl, total, onClose, onPay, status, payRef, errorMsg, countdown, onChat }: {
  t: Record<Key, string>; rtl: boolean; total: number;
  onClose: () => void; onPay: (phone: string) => void;
  status: string; payRef: string; errorMsg: string; countdown: number; onChat: () => void;
}) {
  const [phone,      setPhone]      = useState('');
  const [phoneError, setPhoneError] = useState('');

  const operator = phone.length >= 3 ? detectOperator(normalizePhone(phone)) : null;

  function handlePhoneChange(v: string) {
    setPhone(v.replace(/\D/g, '').slice(0, 9));
    setPhoneError('');
  }

  function handlePay() {
    const p9 = normalizePhone(phone);
    if (p9.length !== 9) { setPhoneError(t.errLen); return; }
    if (!detectOperator(p9)) { setPhoneError(t.errOp); return; }
    onPay(p9);
  }

  const busy = status === 'waiting' || status === 'submitting';
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
      dir={rtl ? 'rtl' : 'ltr'}
      data-mm-modal="1"
    >
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-teal-600 px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5" />
            <span className="font-bold text-lg">{t.mmTitle}</span>
          </div>
          <p className="text-teal-100 text-sm flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> {t.mmSub}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 flex justify-between items-center">
            <span className="text-gray-600 text-sm">{t.amount}</span>
            <span className="text-teal-700 font-bold text-lg" dir="ltr">{fmt(total)} XAF</span>
          </div>

          {status === 'success' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-800">{t.okTitle}</p>
              <p className="text-xs text-gray-500 text-center">{t.okBody}</p>
              {payRef && (
                <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600" dir="ltr">{t.ref}: {payRef}</p>
              )}
            </div>
          )}

          {status === 'waiting' && (
            <div className="flex flex-col items-center gap-3 py-4" data-mm-state="waiting">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              <p className="font-semibold text-gray-800 text-center">{t.checkPhone}</p>
              <p className="text-xs text-gray-500 text-center">{t.checkPhoneBody}</p>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-3 py-2 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {countdown > 0
                  ? fill(t.waiting, { time: `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}` })
                  : t.checking}
              </div>
            </div>
          )}

          {status === 'submitting' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              <p className="text-sm text-gray-600 text-center">{t.sending}</p>
            </div>
          )}

          {(status === 'failed' || status === 'timeout') && (
            <div className="flex flex-col items-center gap-2 py-3" data-mm-state="failed">
              <XCircle className="w-10 h-10 text-red-500" />
              <p className="font-semibold text-gray-800">{status === 'timeout' ? t.timeoutTitle : t.failTitle}</p>
              {errorMsg && <p className="text-xs text-red-500 text-center">{errorMsg}</p>}
              <p className="text-xs text-gray-500 text-center">
                {t.helpLine}{payRef ? <> <span className="font-mono" dir="ltr">({payRef})</span></> : null}
              </p>
              <button type="button" onClick={onChat} data-go="chat"
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50">
                <MessageCircle className="h-3.5 w-3.5" /> {t.chat}
              </button>
            </div>
          )}

          {(status === 'idle' || status === 'failed' || status === 'timeout') && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.numLabel}</label>
                <div className="relative" dir="ltr">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">+237</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="6XXXXXXXX"
                    maxLength={9}
                    data-phone="1"
                    className={`w-full pl-14 pr-20 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all ${
                      operator === 'mtn' ? 'border-yellow-400 bg-yellow-50'
                        : operator === 'orange' ? 'border-orange-400 bg-orange-50'
                        : phoneError ? 'border-red-300'
                        : 'border-gray-200 focus:border-teal-500'
                    }`}
                  />
                  {operator && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full ${
                      operator === 'mtn' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {operator === 'mtn' ? 'MTN' : 'Orange'}
                    </span>
                  )}
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1" data-phone-error="1">{phoneError}</p>}
                <p className="text-xs text-gray-400 mt-1">{t.numHint}</p>
              </div>

              <button
                disabled={phone.length < 9}
                onClick={handlePay}
                data-confirm-pay="1"
                className="w-full bg-teal-600 disabled:bg-teal-300 text-white py-3.5 rounded-2xl font-bold"
              >
                {fill(t.confirmPay, { amount: fmt(total) })}
              </button>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>

          {!busy && status !== 'success' && (
            <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1 transition-colors">
              {t.cancel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Cart Component ---------------------------------------------------------------

export default function Cart() {
  const navigate = useNavigate();
  const lang = pickLang(useLang());
  const t = T[lang];
  const rtl = lang === 'ar';
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();

  const [showMobileMoney, setShowMobileMoney] = useState(false);

  const priced = priceBasket(items.map((i) => ({ sellerId: i.sellerId || null, priceXAF: Number(i.priceXAF) || 0, quantity: Number(i.quantity) || 1 })));
  const { subtotal, commission, serviceCharge, total, sellers } = priced;
  const allDirect = items.length > 0 && items.every(isDirectLine);

  const cartDescription = items.length === 1
    ? `Bambeh - ${items[0].title}`
    : `Bambeh Order - ${items.length} items`;

  // ORDER-FIRST: the server creates the order(s) BEFORE money moves. The browser writes no order.
  const { status, errorMsg, reference, countdown, initCartPayment, reset } = useCamPay({
    onSuccess: async () => {
      clearCart();
      setShowMobileMoney(false);
    },
  });

  const handlePay = useCallback(async (phone: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setShowMobileMoney(false);
      navigate(`/login?redirect=${encodeURIComponent('/cart')}`);
      return;
    }
    await initCartPayment({
      items: items.map((i) => ({
        listingId:   i.listingId ?? null,
        listingType: i.listingType ?? null,
        sellerId:    i.sellerId || null,
        title:       i.title,
        priceXAF:    i.priceXAF,
        quantity:    i.quantity,
      })),
      phone,
      description: cartDescription,
      accessToken: session.access_token,
    });
  }, [initCartPayment, items, cartDescription, navigate]);

  /** Lines that do not name their listing and seller go through the checkout page, which looks them up. */
  function startPayment() {
    if (allDirect) {
      reset();
      setShowMobileMoney(true);
      return;
    }
    navigate('/payment/checkout', {
      state: { items, subtotal, deliveryFee: 0, total, context: 'cart', description: cartDescription },
    });
  }

  const isSuccess = status === 'success';

  // -- Empty -----------------------------------------------------------------------------
  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX854" data-cart="empty">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t.emptyTitle}</h2>
        <p className="text-gray-500 mb-6 text-center text-sm">{t.emptyBody}</p>
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {[
            { label: t.c_marketplace, path: '/marketplace' },
            { label: t.c_farm,        path: '/farm-fresh' },
            { label: t.c_group,       path: '/group-buying' },
            { label: t.c_flash,       path: '/deals' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className="py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // -- Paid ------------------------------------------------------------------------------
  if (isSuccess && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX854" data-cart="done">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.doneTitle}</h2>
        <p className="text-gray-500 mb-1 text-sm text-center max-w-sm">{t.doneBody}</p>
        {reference && (
          <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600 mb-6" dir="ltr">{t.ref}: {reference}</p>
        )}
        <div className="flex gap-3">
          <button onClick={() => navigate('/orders')} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">
            {t.track}
          </button>
          <button onClick={() => navigate('/marketplace')} className="border border-teal-600 text-teal-600 px-6 py-3 rounded-xl font-semibold">
            {t.keepShopping}
          </button>
        </div>
      </div>
    );
  }

  // -- The cart ----------------------------------------------------------------------------
  const count = items.length === 1 ? t.itemOne : fill(t.itemMany, { n: items.length });
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 pb-8" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX854" data-cart="items">
        <div className="max-w-2xl mx-auto">

          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ShoppingCart className="w-6 h-6 text-teal-600" />
            {t.title} ({count})
          </h1>

          <div className="space-y-3 mb-6">
            {items.map((item) => {
              const typeKey = item.listingType ? TYPE_KEY[item.listingType] : undefined;
              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border flex gap-3" data-line={item.id}>
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.title}</h3>
                      <button onClick={() => removeFromCart(item.id)} aria-label={t.remove}
                        className="text-red-400 hover:text-red-600 flex-shrink-0 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {typeKey && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5">
                        {TYPE_ICONS[item.listingType || ''] || <Tag className="w-3 h-3 text-gray-400" />}
                        {t[typeKey]}
                      </span>
                    )}

                    <p className="text-teal-600 font-bold mt-1 text-sm" dir="ltr">{fmt(item.priceXAF * item.quantity)} XAF</p>
                    <p className="text-gray-400 text-xs">{fill(t.each, { price: fmt(item.priceXAF) })}</p>

                    {item.sellerName && (
                      <p className="text-xs text-gray-400 mt-0.5">{fill(t.soldBy, { name: item.sellerName })}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={t.less}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={t.more}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary: the same numbers the server charges */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4" data-summary="1">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{t.summary}</h2>
            <FeeRow label={items.length > 1 ? t.items : t.item} amount={`${fmt(subtotal)} XAF`} />
            <FeeRow label={t.commission} amount={`${fmt(commission)} XAF`} muted tooltip={t.commissionTip} />
            <FeeRow label={t.service} amount={`${fmt(serviceCharge)} XAF`} muted tooltip={t.serviceTip} />
            <div className="border-t border-gray-100 my-3" />
            <FeeRow label={t.total} amount={`${fmt(total)} XAF`} bold />
            {sellers > 1 && <p className="mt-2 text-xs text-gray-500" data-sellers={sellers}>{fill(t.sellers, { n: sellers })}</p>}
            <SecuredPayNote />{/* FIX684 */}
          </div>

          {/* Delivery, honestly */}
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4" data-delivery-note="1">
            <Truck className="w-5 h-5 shrink-0 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{t.deliveryTitle}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.deliveryBody}</p>
            </div>
          </div>

          {/* One pay button */}
          <button
            onClick={startPayment}
            disabled={status === 'submitting' || status === 'waiting'}
            data-pay-cart={allDirect ? 'direct' : 'checkout'}
            className="w-full bg-teal-600 disabled:bg-teal-300 text-white py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-center leading-snug shadow-md shadow-teal-100 transition"
          >
            {(status === 'submitting' || status === 'waiting')
              ? <><Loader2 className="w-5 h-5 shrink-0 animate-spin" /> <span>{t.processing}</span></>
              : <><Lock className="w-5 h-5 shrink-0" /> <span>{fill(t.payBtn, { amount: fmt(total) })}</span> {allDirect ? null : <ArrowRight className={`w-4 h-4 shrink-0 ${rtl ? 'rotate-180' : ''}`} />}</>}
          </button>

          {/* How the protection works - true to Big's refund rule */}
          <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4" data-how="1">
            <p className="flex items-center gap-2 text-sm font-semibold text-teal-900">
              <ShieldCheck className="w-4 h-4" /> {t.howTitle}
            </p>
            <ol className="mt-2 space-y-1.5 text-xs text-teal-900">
              <li>1. {t.how1}</li>
              <li>2. {t.how2}</li>
              <li>3. {t.how3}</li>
              <li>4. {t.how4}</li>
            </ol>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
        </div>
      </div>

      {showMobileMoney && (
        <MobileMoneyModal
          t={t}
          rtl={rtl}
          total={total}
          onClose={() => { setShowMobileMoney(false); reset(); }}
          onPay={handlePay}
          status={status}
          payRef={reference}
          errorMsg={errorMsg}
          countdown={countdown}
          onChat={() => { setShowMobileMoney(false); reset(); navigate('/help/chat'); }}
        />
      )}
    </>
  );
}
// BAMBEH_END_TOKEN__CART_FIX854__COMPLETE
