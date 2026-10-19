// BAMBEH_DEPLOY_TOKEN__ESCROWPAGE_FIX855_CLEAN
/**
 * EscrowPage.tsx - Bambeh Marketplace
 * FILE LOCATION: src/routes/groups/community/EscrowPage.tsx  (routed at /escrow and /escrow/:orderId)
 * The Home tile "User Protection" opens it (FIX857 renames the tile; it was "Buyer Protection").
 *
 * FIX855 (replaces FIX180) - USER PROTECTION (BAMBEH SECURED PAY), ON THE REAL ORDERS.
 *   The FIX180 page read public.escrows, a table nothing has ever written: purchases go to public.orders (the
 *   payments server holds the money on the order itself since FIX197/FIX663). So the page said "No protected
 *   transactions yet" to every buyer, even right after a real protected purchase. It now reads:
 *     What I bought - public.orders where I am the buyer (row security lets a buyer read their own orders)
 *     What I sold   - get_seller_orders(), the same function My sales uses
 *   with the same states as the order page's protection panel (EscrowActionPanel): money held, waiting for payment
 *   confirmation, paid to the seller, refunded, under review. Money actions stay where they are - on the order page
 *   (buyer: confirm receipt / report a problem) and My sales (seller) - so there is one place that moves money.
 *   /escrow/:orderId now opens that order's page.
 *   The word "escrow" is gone from what people read. Big, 19 Oct 2026: "take off the word escrow and we stick with user
 *   protection" - the page is "User Protection"; the payment itself is "Bambeh Secured Pay". The address (/escrow)
 *   and the code names stay.
 *   Who holds the money is not named: it is "held safely" (CamPay holds it under its own licence; Bambeh never
 *   holds customer money). Refunds are described as Big's rule says: reviewed by Bambeh, item price only.
 *
 * Five languages, right-to-left for Arabic. Every non-English character is a \u escape.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ShieldCheck, Loader2, RefreshCw, ShoppingBag, Store, ChevronRight, Lock, CheckCircle2, Undo2, Scale, Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type LangKey = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
type Key =
  | 'title' | 'sub' | 'tabBought' | 'tabSold' | 'heldBuyer' | 'heldSeller' | 'loading'
  | 'emptyBought' | 'emptyBoughtBody' | 'emptySold' | 'emptySoldBody' | 'browse' | 'mySales'
  | 'st_held' | 'st_awaiting' | 'st_released' | 'st_refunded' | 'st_disputed'
  | 'open' | 'openSales' | 'youPaid' | 'youGet' | 'heldHint' | 'more' | 'order'
  | 'howTitle' | 'how1' | 'how2' | 'how3' | 'how4' | 'sellerNote' | 'refresh' | 'error' | 'retry';

const T: Record<LangKey, Record<Key, string>> = {
  en: {
    title: 'User Protection',
    sub: 'Bambeh Secured Pay protects every purchase: the money is held until the buyer confirms the item arrived.',
    tabBought: 'What I bought', tabSold: 'What I sold',
    heldBuyer: 'Held for your purchases now', heldSeller: 'Coming to you once buyers confirm', loading: 'Loading...',
    emptyBought: 'No protected purchases yet',
    emptyBoughtBody: 'When you buy on Bambeh, your payment is held here until you confirm the item arrived.',
    emptySold: 'No protected sales yet',
    emptySoldBody: 'When someone buys from you, the sale appears here. You are paid when the buyer confirms.',
    browse: 'Browse the marketplace', mySales: 'Open My sales',
    st_held: 'Money held', st_awaiting: 'Waiting for payment confirmation', st_released: 'Paid to the seller',
    st_refunded: 'Refunded', st_disputed: 'Under review by Bambeh',
    open: 'Open', openSales: 'Open in My sales',
    youPaid: 'You paid {amount} XAF', youGet: 'You receive {amount} XAF',
    heldHint: 'Received it? Open the order to confirm, or to report a problem.',
    more: '+ {n} more', order: 'Order',
    howTitle: 'How it protects you',
    how1: 'The buyer pays with MTN or Orange Money. The money is held safely - the seller does not receive it yet.',
    how2: 'The seller prepares the order and says where it is.',
    how3: 'The buyer confirms receiving it. Only then is the seller paid.',
    how4: 'A problem? The buyer reports it before confirming. The money stays held while Bambeh reviews it (within 72 hours). If Bambeh approves a refund, the item price goes back to the number that paid; the commission and charges are not refunded.',
    sellerNote: 'Sellers: you are paid when the buyer confirms, or when Bambeh decides a claim in your favour. The money goes to the payout number in your profile.',
    refresh: 'Refresh', error: 'Could not load. Check your connection and try again.', retry: 'Try again',
  },
  fr: {
    title: 'Protection des utilisateurs',
    sub: 'Bambeh Secured Pay prot\u00e8ge chaque achat : l\u2019argent est gard\u00e9 jusqu\u2019\u00e0 ce que l\u2019acheteur confirme la r\u00e9ception.',
    tabBought: 'Mes achats', tabSold: 'Mes ventes',
    heldBuyer: 'Gard\u00e9 pour vos achats en ce moment', heldSeller: 'Pour vous d\u00e8s que les acheteurs confirment', loading: 'Chargement...',
    emptyBought: 'Aucun achat prot\u00e9g\u00e9 pour l\u2019instant',
    emptyBoughtBody: 'Quand vous achetez sur Bambeh, votre paiement est gard\u00e9 ici jusqu\u2019\u00e0 ce que vous confirmiez la r\u00e9ception.',
    emptySold: 'Aucune vente prot\u00e9g\u00e9e pour l\u2019instant',
    emptySoldBody: 'Quand quelqu\u2019un vous ach\u00e8te un article, la vente appara\u00eet ici. Vous \u00eates pay\u00e9 quand l\u2019acheteur confirme.',
    browse: 'Parcourir la marketplace', mySales: 'Ouvrir Mes ventes',
    st_held: 'Argent gard\u00e9', st_awaiting: 'Paiement en attente de confirmation', st_released: 'Vers\u00e9 au vendeur',
    st_refunded: 'Rembours\u00e9', st_disputed: 'En examen chez Bambeh',
    open: 'Ouvrir', openSales: 'Ouvrir dans Mes ventes',
    youPaid: 'Vous avez pay\u00e9 {amount} XAF', youGet: 'Vous recevez {amount} XAF',
    heldHint: 'Re\u00e7u ? Ouvrez la commande pour confirmer, ou pour signaler un probl\u00e8me.',
    more: '+ {n} autre(s)', order: 'Commande',
    howTitle: 'Comment il vous prot\u00e8ge',
    how1: 'L\u2019acheteur paie par MTN ou Orange Money. L\u2019argent est gard\u00e9 en s\u00e9curit\u00e9 : le vendeur ne le re\u00e7oit pas encore.',
    how2: 'Le vendeur pr\u00e9pare la commande et indique o\u00f9 elle en est.',
    how3: 'L\u2019acheteur confirme la r\u00e9ception. Alors seulement le vendeur est pay\u00e9.',
    how4: 'Un probl\u00e8me ? L\u2019acheteur le signale avant de confirmer. L\u2019argent reste gard\u00e9 pendant que Bambeh examine (sous 72 heures). Si Bambeh accorde un remboursement, le prix de l\u2019article revient au num\u00e9ro qui a pay\u00e9 ; la commission et les frais ne sont pas rembours\u00e9s.',
    sellerNote: 'Vendeurs : vous \u00eates pay\u00e9 quand l\u2019acheteur confirme, ou quand Bambeh tranche une r\u00e9clamation en votre faveur. L\u2019argent va au num\u00e9ro de paiement de votre profil.',
    refresh: 'Actualiser', error: 'Chargement impossible. V\u00e9rifiez votre connexion et r\u00e9essayez.', retry: 'R\u00e9essayer',
  },
  pidgin: {
    title: 'User Protection',
    sub: 'Bambeh Secured Pay dey protect every buy: the money dey hold until buyer confirm say the thing don reach.',
    tabBought: 'Wetin I buy', tabSold: 'Wetin I sell',
    heldBuyer: 'Money wey dey hold for your buy now', heldSeller: 'E go reach you when buyers confirm', loading: 'E dey load...',
    emptyBought: 'No protected buy yet',
    emptyBoughtBody: 'When you buy for Bambeh, your money go dey hold here until you confirm say the thing don reach.',
    emptySold: 'No protected sale yet',
    emptySoldBody: 'When person buy from you, the sale go show here. Dem go pay you when the buyer confirm.',
    browse: 'Go check marketplace', mySales: 'Open My sales',
    st_held: 'Money dey hold', st_awaiting: 'We dey wait payment confirmation', st_released: 'Seller don collect',
    st_refunded: 'Money don return', st_disputed: 'Bambeh dey check am',
    open: 'Open', openSales: 'Open for My sales',
    youPaid: 'You pay {amount} XAF', youGet: 'You go collect {amount} XAF',
    heldHint: 'You don receive am? Open the order to confirm, or to report problem.',
    more: '+ {n} more', order: 'Order',
    howTitle: 'How e dey protect you',
    how1: 'Buyer pay with MTN or Orange Money. The money dey safe - seller never collect am yet.',
    how2: 'Seller prepare the order and talk where e reach.',
    how3: 'Buyer confirm say e don receive am. Na only then dem go pay seller.',
    how4: 'Problem dey? Buyer go report am before e confirm. The money go still dey hold while Bambeh dey check (inside 72 hours). If Bambeh gree refund, the price of the thing go return to the number wey pay; commission and charges no dey return.',
    sellerNote: 'Sellers: dem go pay you when buyer confirm, or when Bambeh decide claim for your side. The money go enter the payout number for your profile.',
    refresh: 'Refresh', error: 'E no load. Check your network and try again.', retry: 'Try again',
  },
  ar: {
    title: '\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645',
    sub: 'Bambeh Secured Pay \u064a\u062d\u0645\u064a \u0643\u0644 \u0639\u0645\u0644\u064a\u0629 \u0634\u0631\u0627\u0621: \u064a\u064f\u062d\u0641\u0638 \u0627\u0644\u0645\u0627\u0644 \u062d\u062a\u0649 \u064a\u0624\u0643\u062f \u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0648\u0635\u0648\u0644 \u0627\u0644\u0645\u0646\u062a\u062c.',
    tabBought: '\u0645\u0634\u062a\u0631\u064a\u0627\u062a\u064a', tabSold: '\u0645\u0628\u064a\u0639\u0627\u062a\u064a',
    heldBuyer: '\u0645\u062d\u0641\u0648\u0638 \u0644\u0645\u0634\u062a\u0631\u064a\u0627\u062a\u0643 \u0627\u0644\u0622\u0646', heldSeller: '\u064a\u0635\u0644\u0643 \u0628\u0645\u062c\u0631\u062f \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0646', loading: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...',
    emptyBought: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0634\u062a\u0631\u064a\u0627\u062a \u0645\u062d\u0645\u064a\u0629 \u0628\u0639\u062f',
    emptyBoughtBody: '\u0639\u0646\u062f\u0645\u0627 \u062a\u0634\u062a\u0631\u064a \u0639\u0644\u0649 Bambeh\u060c \u062a\u064f\u062d\u0641\u0638 \u062f\u0641\u0639\u062a\u0643 \u0647\u0646\u0627 \u062d\u062a\u0649 \u062a\u0624\u0643\u062f \u0648\u0635\u0648\u0644 \u0627\u0644\u0645\u0646\u062a\u062c.',
    emptySold: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0628\u064a\u0639\u0627\u062a \u0645\u062d\u0645\u064a\u0629 \u0628\u0639\u062f',
    emptySoldBody: '\u0639\u0646\u062f\u0645\u0627 \u064a\u0634\u062a\u0631\u064a \u0623\u062d\u062f \u0645\u0646\u0643\u060c \u062a\u0638\u0647\u0631 \u0627\u0644\u0628\u064a\u0639\u0629 \u0647\u0646\u0627. \u064a\u064f\u062f\u0641\u0639 \u0644\u0643 \u0639\u0646\u062f\u0645\u0627 \u064a\u0624\u0643\u062f \u0627\u0644\u0645\u0634\u062a\u0631\u064a.',
    browse: '\u062a\u0635\u0641\u0651\u062d \u0627\u0644\u0633\u0648\u0642', mySales: '\u0627\u0641\u062a\u062d \u0645\u0628\u064a\u0639\u0627\u062a\u064a',
    st_held: '\u0627\u0644\u0645\u0627\u0644 \u0645\u062d\u0641\u0648\u0638', st_awaiting: '\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639', st_released: '\u062f\u064f\u0641\u0639 \u0644\u0644\u0628\u0627\u0626\u0639',
    st_refunded: '\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f', st_disputed: '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0644\u062f\u0649 Bambeh',
    open: '\u0641\u062a\u062d', openSales: '\u0641\u062a\u062d \u0641\u064a \u0645\u0628\u064a\u0639\u0627\u062a\u064a',
    youPaid: '\u062f\u0641\u0639\u062a {amount} XAF', youGet: '\u062a\u0633\u062a\u0644\u0645 {amount} XAF',
    heldHint: '\u0647\u0644 \u0627\u0633\u062a\u0644\u0645\u062a\u0647\u061f \u0627\u0641\u062a\u062d \u0627\u0644\u0637\u0644\u0628 \u0644\u0644\u062a\u0623\u0643\u064a\u062f \u0623\u0648 \u0644\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646 \u0645\u0634\u0643\u0644\u0629.',
    more: '+ {n} \u0623\u062e\u0631\u0649', order: '\u0627\u0644\u0637\u0644\u0628',
    howTitle: '\u0643\u064a\u0641 \u064a\u062d\u0645\u064a\u0643',
    how1: '\u064a\u062f\u0641\u0639 \u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0639\u0628\u0631 MTN \u0623\u0648 Orange Money. \u064a\u064f\u062d\u0641\u0638 \u0627\u0644\u0645\u0627\u0644 \u0628\u0623\u0645\u0627\u0646 \u0648\u0644\u0627 \u064a\u0633\u062a\u0644\u0645\u0647 \u0627\u0644\u0628\u0627\u0626\u0639 \u0628\u0639\u062f.',
    how2: '\u064a\u062c\u0647\u0651\u0632 \u0627\u0644\u0628\u0627\u0626\u0639 \u0627\u0644\u0637\u0644\u0628 \u0648\u064a\u062e\u0628\u0631 \u0628\u0645\u0643\u0627\u0646\u0647.',
    how3: '\u064a\u0624\u0643\u062f \u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645. \u0639\u0646\u062f\u0647\u0627 \u0641\u0642\u0637 \u064a\u064f\u062f\u0641\u0639 \u0644\u0644\u0628\u0627\u0626\u0639.',
    how4: '\u0647\u0644 \u0647\u0646\u0627\u0643 \u0645\u0634\u0643\u0644\u0629\u061f \u064a\u0628\u0644\u0651\u063a \u0639\u0646\u0647\u0627 \u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0642\u0628\u0644 \u0627\u0644\u062a\u0623\u0643\u064a\u062f. \u064a\u0628\u0642\u0649 \u0627\u0644\u0645\u0627\u0644 \u0645\u062d\u0641\u0648\u0638\u064b\u0627 \u0628\u064a\u0646\u0645\u0627 \u062a\u0631\u0627\u062c\u0639 Bambeh \u0627\u0644\u0623\u0645\u0631 (\u062e\u0644\u0627\u0644 72 \u0633\u0627\u0639\u0629). \u0625\u0630\u0627 \u0648\u0627\u0641\u0642\u062a Bambeh \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f\u060c \u064a\u0639\u0648\u062f \u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u062a\u062c \u0625\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0630\u064a \u062f\u0641\u0639\u061b \u0644\u0627 \u062a\u064f\u0633\u062a\u0631\u062f \u0627\u0644\u0639\u0645\u0648\u0644\u0629 \u0648\u0627\u0644\u0631\u0633\u0648\u0645.',
    sellerNote: '\u0627\u0644\u0628\u0627\u0626\u0639\u0648\u0646: \u064a\u064f\u062f\u0641\u0639 \u0644\u0643 \u0639\u0646\u062f\u0645\u0627 \u064a\u0624\u0643\u062f \u0627\u0644\u0645\u0634\u062a\u0631\u064a\u060c \u0623\u0648 \u0639\u0646\u062f\u0645\u0627 \u062a\u0642\u0631\u0631 Bambeh \u0634\u0643\u0648\u0649 \u0644\u0635\u0627\u0644\u062d\u0643. \u064a\u0630\u0647\u0628 \u0627\u0644\u0645\u0627\u0644 \u0625\u0644\u0649 \u0631\u0642\u0645 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0641\u064a \u0645\u0644\u0641\u0643.',
    refresh: '\u062a\u062d\u062f\u064a\u062b', error: '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.', retry: '\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
  },
  ff: {
    title: 'Ndeenka huutoroo\u0253e',
    sub: 'Bambeh Secured Pay ina reena kala coodgu: kaalis ngal ina jogaa haa soodoowo tabitina wonde huunde ndee yottii.',
    tabBought: 'Ko mi soodi', tabSold: 'Ko mi yeeyi',
    heldBuyer: 'Ko jogaa ngam coodi maa jooni', heldSeller: 'Yottoto ma so soodoo\u0253e tabitinii', loading: 'Ina loowa...',
    emptyBought: 'Alaa coodgu reenangu tawo',
    emptyBoughtBody: 'So a soodii e Bambeh, njo\u0253di maa jogoto \u0257oo haa a tabitina wonde huunde ndee yottii.',
    emptySold: 'Alaa jeeygu reenangu tawo',
    emptySoldBody: 'So go\u0257\u0257o soodii e maa, jeeygu ngu feeyan \u0257oo. A yo\u0253etee so soodoowo tabitinii.',
    browse: 'Ndaar marketplace', mySales: 'Uddit jeeyi am',
    st_held: 'Kaalis ina jogaa', st_awaiting: 'Ina habbii tabitingol njo\u0253di', st_released: 'Jeeyoowo yo\u0253aama',
    st_refunded: 'Ruttaama', st_disputed: 'Bambeh ina \u01b4eewa',
    open: 'Uddit', openSales: 'Uddit e jeeyi am',
    youPaid: 'A yo\u0253ii {amount} XAF', youGet: 'A he\u0253at {amount} XAF',
    heldHint: 'A he\u0253ii? Uddit ordoru ndu ngam tabitinde, walla ngam habrude ca\u0257eele.',
    more: '+ {n} goo\u0257e', order: 'Ordoru',
    howTitle: 'No reenirta ma',
    how1: 'Soodoowo yo\u0253ay e MTN walla Orange Money. Kaalis ngal ina reenee - jeeyoowo he\u0253aani ngal tawo.',
    how2: 'Jeeyoowo moftay ordoru ndu, wiya toon nde yottii.',
    how3: 'Soodoowo tabitinay wonde o he\u0253ii. Ndeen tan jeeyoowo yo\u0253ete.',
    how4: 'Ca\u0257eele woodi? Soodoowo habray \u0257um hade tabitinde. Kaalis ngal heddoto jogaa tuma nde Bambeh \u01b4eewtata (nder waktuuji 72). So Bambeh jabii ruttingol, coggu huunde ndee ruttoto e limoore mo yo\u0253i; komisiyon e njo\u0253di ruttataake.',
    sellerNote: 'Jeeyoo\u0253e: a yo\u0253etee so soodoowo tabitinii, walla so Bambeh ta\u01b4ii ca\u0257eele ngam maa. Kaalis ngal yahan e limoore yo\u0253oore e profil maa.',
    refresh: 'Hesdin', error: 'Waawaa loowde. \u01b3eew reseau maa, fuddito.', retry: 'Fuddito',
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

const fmt = (n: number | null | undefined) => (Number(n) || 0).toLocaleString('fr-CM');

/* ---- The same states as the order page's protection panel (EscrowActionPanel.deriveState) ---- */
type State = 'held' | 'awaiting' | 'released' | 'refunded' | 'disputed' | 'no_escrow' | 'closed';

interface Row {
  id: string;
  order_number: string | null;
  status: string | null;
  escrow: boolean | null;
  escrow_status: string | null;
  total_xaf: number | null;
  seller_payout_xaf?: number | null;
  items: unknown;
  created_at: string | null;
  paid_at: string | null;
  claim_status?: string | null;
}

const PAID_STATUSES = ['paid', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'released'];

function stateOf(o: Row): State {
  const st = (o.status || '').toLowerCase();
  const es = (o.escrow_status || '').toLowerCase();
  if (st === 'cancelled' || st === 'canceled' || st === 'failed') return 'closed';
  if (es === 'released') return 'released';
  if (es.startsWith('refund')) return 'refunded';
  if (es.includes('disput') || es === 'frozen' || es === 'under_review') return 'disputed';
  if ((o.claim_status || '').toLowerCase() === 'open') return 'disputed';
  if (o.escrow !== true) return 'no_escrow';
  if (!(o.paid_at || PAID_STATUSES.indexOf(st) >= 0)) return 'awaiting';
  return 'held';
}

function titleOf(items: unknown, t: Record<Key, string>): string {
  if (Array.isArray(items) && items.length > 0) {
    const it = (items[0] || {}) as Record<string, unknown>;
    const first = String(it.title ?? it.name ?? it.listingTitle ?? '').trim();
    if (first) return items.length > 1 ? first + ' ' + fill(t.more, { n: items.length - 1 }) : first;
  }
  return '';
}

const CHIP: Record<State, { cls: string; icon: typeof Lock; key: Key }> = {
  held:      { cls: 'bg-teal-50 text-teal-800 border-teal-200',       icon: Lock,         key: 'st_held' },
  awaiting:  { cls: 'bg-amber-50 text-amber-800 border-amber-200',    icon: Clock,        key: 'st_awaiting' },
  released:  { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2, key: 'st_released' },
  refunded:  { cls: 'bg-gray-100 text-gray-700 border-gray-200',      icon: Undo2,        key: 'st_refunded' },
  disputed:  { cls: 'bg-orange-50 text-orange-800 border-orange-200', icon: Scale,        key: 'st_disputed' },
  no_escrow: { cls: 'bg-gray-100 text-gray-700 border-gray-200',      icon: Lock,         key: 'st_held' },
  closed:    { cls: 'bg-gray-100 text-gray-700 border-gray-200',      icon: Lock,         key: 'st_held' },
};

const SHOWN: State[] = ['held', 'awaiting', 'disputed', 'released', 'refunded'];

const BUYER_COLS = 'id, order_number, status, escrow, escrow_status, total_xaf, seller_payout_xaf, items, created_at, paid_at';

export default function EscrowPage() {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const lang = pickLang(useLang());
  const t = T[lang];
  const rtl = lang === 'ar';

  const [tab, setTab] = useState<'bought' | 'sold'>('bought');
  const [bought, setBought] = useState<Row[]>([]);
  const [sold, setSold] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id;
      if (!uid) { setLoading(false); return; }

      // The claim columns (FIX635) are asked for separately so the page still loads without them.
      let b: { data: unknown; error: unknown } = await supabase.from('orders').select(BUYER_COLS + ', claim_status')
        .eq('buyer_id', uid).order('created_at', { ascending: false }).limit(50);
      if (b.error) {
        b = await supabase.from('orders').select(BUYER_COLS).eq('buyer_id', uid)
          .order('created_at', { ascending: false }).limit(50);
      }
      const s = await supabase.rpc('get_seller_orders', { p_limit: 50 });
      if (b.error && s.error) { setFailed(true); return; }
      setBought(((b.data as unknown as Row[]) || []).filter((o) => SHOWN.indexOf(stateOf(o)) >= 0));
      setSold((Array.isArray(s.data) ? (s.data as Row[]) : []).filter((o) => SHOWN.indexOf(stateOf(o)) >= 0));
      if (b.error || s.error) setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!orderId) void load(); }, [load, orderId]);

  const heldBuyer = useMemo(() => bought.filter((o) => { const st = stateOf(o); return st === 'held' || st === 'disputed'; })
    .reduce((a, o) => a + (Number(o.total_xaf) || 0), 0), [bought]);
  const heldSeller = useMemo(() => sold.filter((o) => { const st = stateOf(o); return st === 'held' || st === 'disputed'; })
    .reduce((a, o) => a + (Number(o.seller_payout_xaf) || 0), 0), [sold]);

  // An old link to one protected order: open that order's page, where the money actions are.
  if (orderId) return <Navigate to={'/orders/' + encodeURIComponent(orderId)} replace />;

  const list = tab === 'bought' ? bought : sold;

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX855">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 pb-6 pt-6 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold">{t.title}</h1>
                <p className="text-xs text-emerald-50">{t.sub}</p>
              </div>
            </div>
            <button onClick={() => void load()} aria-label={t.refresh} className="rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[11px] text-emerald-50">{t.heldBuyer}</p>
              <p className="text-lg font-bold" dir="ltr" data-held-buyer={heldBuyer}>{fmt(heldBuyer)} XAF</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[11px] text-emerald-50">{t.heldSeller}</p>
              <p className="text-lg font-bold" dir="ltr" data-held-seller={heldSeller}>{fmt(heldSeller)} XAF</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4">
        <div className="-mt-4 mb-4 flex rounded-2xl bg-white p-1 shadow-sm">
          {(['bought', 'sold'] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} data-tab={k}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold ${
                      tab === k ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {k === 'bought' ? <ShoppingBag className="h-4 w-4" /> : <Store className="h-4 w-4" />}
              {k === 'bought' ? t.tabBought : t.tabSold}
              <span className={`rounded-full px-1.5 text-[11px] ${tab === k ? 'bg-white/20' : 'bg-gray-100'}`}>
                {(k === 'bought' ? bought : sold).length}
              </span>
            </button>
          ))}
        </div>

        {failed && !loading && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" data-error="1">
            <span>{t.error}</span>
            <button onClick={() => void load()} className="shrink-0 rounded-lg bg-white px-2.5 py-1 font-bold ring-1 ring-amber-200">{t.retry}</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" /> {t.loading}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm" data-empty={tab}>
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-800">{tab === 'bought' ? t.emptyBought : t.emptySold}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">{tab === 'bought' ? t.emptyBoughtBody : t.emptySoldBody}</p>
            <button onClick={() => navigate(tab === 'bought' ? '/marketplace' : '/my-sales')}
                    className="mt-4 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
              {tab === 'bought' ? t.browse : t.mySales}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((o) => {
              const st = stateOf(o);
              const chip = CHIP[st];
              const Icon = chip.icon;
              const title = titleOf(o.items, t) || (t.order + ' ' + (o.order_number || o.id.slice(0, 8)));
              const go = () => navigate(tab === 'bought' ? '/orders/' + o.id : '/my-sales');
              return (
                <button key={o.id} onClick={go} data-row={o.id} data-state={st}
                        className="block w-full rounded-2xl border border-gray-100 bg-white p-4 text-start shadow-sm hover:border-teal-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{title}</p>
                      <p className="mt-0.5 text-xs text-gray-500" dir="ltr">
                        {o.order_number || o.id.slice(0, 8)}{o.created_at ? ' \u00b7 ' + new Date(o.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${chip.cls}`}>
                      <Icon className="h-3 w-3" /> {t[chip.key]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-gray-800">
                      {tab === 'bought'
                        ? fill(t.youPaid, { amount: fmt(o.total_xaf) })
                        : fill(t.youGet, { amount: fmt(o.seller_payout_xaf) })}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                      {tab === 'bought' ? t.open : t.openSales}
                      <ChevronRight className={`h-4 w-4 ${rtl ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                  {tab === 'bought' && st === 'held' && <p className="mt-2 text-xs text-teal-700">{t.heldHint}</p>}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4" data-how="1">
          <p className="flex items-center gap-2 text-sm font-semibold text-teal-900">
            <ShieldCheck className="h-4 w-4" /> {t.howTitle}
          </p>
          <ol className="mt-2 space-y-1.5 text-xs text-teal-900">
            <li>1. {t.how1}</li>
            <li>2. {t.how2}</li>
            <li>3. {t.how3}</li>
            <li>4. {t.how4}</li>
          </ol>
          <p className="mt-3 text-xs text-teal-800">{t.sellerNote}</p>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__ESCROWPAGE_FIX855__COMPLETE
