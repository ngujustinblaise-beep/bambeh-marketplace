// BAMBEH_DEPLOY_TOKEN__AICHATBOT_FIX734_CLEAN
/**
 * src/pages/BambehAIChatbot.tsx - FIX734 (replaces FIX97)   route: /ai-chat
 *
 * BAMBEH ASSISTANT, HONEST AND SIGNED IN.
 *   - The chat sends the person's Bambeh session token to the 'ai' Edge Function (FIX735), which
 *     answers signed-in accounts only, with its OWN instructions and a daily limit. This page sends
 *     no instructions any more - only the app language and the conversation.
 *   - The six quick questions are answered on the phone, at once, in five languages, without an
 *     account and without spending AI calls. Typed questions need the free account.
 *   - FIX97 told people false things: "1 Zerm = 100 XAF" (Zerm coins have no money value),
 *     "Cash on Delivery", "help.bambeh.cm", "call our support team", "SMS updates", "same-day
 *     delivery in all 10 regions", "Cameroon's #1 marketplace". All gone: every answer here is true
 *     today (Secured Pay, chat-only contact, My Orders, Send a parcel, support@bambeh.com).
 *   - Answers are shown as text, never as HTML (FIX97 put the AI's words into the page as HTML).
 *   - The thumbs up / down are gone: they saved nothing, and a button that throws away what you
 *     press is the same lie as a form that discards what you typed.
 *   - Limits reached, AI down, signed out: each has its own clear message in five languages.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight, Bot, LogIn, Maximize2, Minimize2, RefreshCw, Send, Sparkles, User, UserPlus, Zap,
} from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import { supabase } from '@/lib/supabase';

// The Supabase 'ai' Edge Function (FIX735) holds the Anthropic key on the server.
const AI_BACKEND =
  (import.meta as { env?: Record<string, string> }).env?.VITE_AI_BACKEND_URL ||
  'https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/ai';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
function normLang(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

export type Topic = 'zerm' | 'sell' | 'payment' | 'order' | 'delivery' | 'subscription';
export const TOPICS: readonly Topic[] = ['zerm', 'sell', 'payment', 'order', 'delivery', 'subscription'];

/** Where a quick answer can take the person next. */
export const TOPIC_LINKS: Partial<Record<Topic, string>> = {
  sell: '/marketplace/sell',
  order: '/orders',
  subscription: '/subscription',
};

/** Words that bring a quick answer when the AI cannot be asked (signed out, offline). */
const KEYWORDS: Record<Topic, string[]> = {
  zerm: ['zerm', 'coin', '\u0632\u0631\u0645'],
  subscription: ['subscri', 'abonnement', 'abonne', '\u0627\u0634\u062a\u0631\u0627\u0643'],
  sell: ['sell', 'vendor', 'vendre', 'vendeur', 'boutique', 'yeey', '\u0628\u064a\u0639', '\u0628\u0627\u0626\u0639'],
  payment: ['pay', 'momo', 'mobile money', 'orange money', 'paiement', 'payer', 'yo\u0253', '\u062f\u0641\u0639'],
  delivery: ['deliver', 'livraison', 'livrer', 'livree', 'parcel', 'colis', 'rider', '\u062a\u0648\u0635\u064a\u0644'],
  order: ['order', 'commande', 'komaanj', 'track', '\u0637\u0644\u0628'],
};

export function matchTopic(text: string): Topic | null {
  const s = String(text || '').toLowerCase();
  for (const topic of ['zerm', 'subscription', 'sell', 'payment', 'delivery', 'order'] as Topic[]) {
    if (KEYWORDS[topic].some((k) => s.indexOf(k) >= 0)) return topic;
  }
  return null;
}

type Say = 'needSignIn' | 'limit' | 'busy' | 'offline';

interface Texts {
  title: string;
  apiLabel: string;
  poweredBy: string;
  welcome: string;
  quickLabel: string;
  quick: Record<Topic, string>;
  answers: Record<Topic, string>;
  links: Partial<Record<Topic, string>>;
  placeholder: string;
  newConversation: string;
  signInTitle: string;
  signInBody: string;
  signIn: string;
  register: string;
  needSignIn: string;
  limit: string;
  busy: string;
  offline: string;
  note: string;
  send: string;
  minimize: string;
  maximize: string;
}

export const TEXTS: Record<Lang, Texts> = {
  en: {
    title: 'Bambeh Assistant',
    apiLabel: 'Powered by Claude AI',
    poweredBy: 'Powered by Claude AI - Bambeh Marketplace',
    welcome: 'Hello! I am **Bambeh Assistant**. Ask me how Bambeh works: buying and selling safely, Bambeh Secured Pay, your orders, Zerm coins or the free help. I am an AI, so check important answers in the app.',
    quickLabel: 'Quick questions:',
    quick: {
      zerm: 'How do Zerm coins work?',
      sell: 'How do I sell on Bambeh?',
      payment: 'How do I pay safely?',
      order: 'Where is my order?',
      delivery: 'How does delivery work?',
      subscription: 'Do I need a subscription?',
    },
    answers: {
      zerm: '**Zerm coins** are Bambeh reward points. You earn small amounts by taking part, for example in quizzes. They have **no money value**: they cannot be bought, sold, sent to someone else or turned into cash.',
      sell: 'Sign in, open **Marketplace**, then **Sell**. Add clear photos, an honest description and your price. Buyers reach you only through the Bambeh chat, so never put a phone or WhatsApp number in your listing. Medicines cannot be sold on Bambeh.',
      payment: 'Pay inside the app with **Bambeh Secured Pay** (MTN Mobile Money or Orange Money). Bambeh holds the money until you confirm you received your item; only then is the seller paid. Never pay outside the app, and never share your PIN: Bambeh will never ask for it.',
      order: 'Open **My Orders** to see each order and its status. When the item reaches you and it is right, press **Confirm I Received My Item**. If something is wrong, report the problem from the order before you confirm, or write to support@bambeh.com with the order reference.',
      delivery: 'Delivery is agreed with the seller in the Bambeh chat. Where Bambeh riders work in your town, **Send a parcel** in the menu shows the price before you pay. Bambeh does not promise delivery times.',
      subscription: 'Some sections of Bambeh need a subscription, and you pay only for the sections you use: the app shows the plans and the exact price before you pay. The free help (pharmacies, hospitals, water and lights, fuel, safety, women\'s health) never needs a subscription, only a free account.',
    },
    links: { sell: 'Sell an item', order: 'My Orders', subscription: 'See the plans' },
    placeholder: 'Ask me anything about Bambeh...',
    newConversation: 'New conversation',
    signInTitle: 'Sign in to chat',
    signInBody: 'Bambeh Assistant is free with your Bambeh account. The quick questions work without one.',
    signIn: 'Sign in',
    register: 'Create a free account',
    needSignIn: 'To chat with Bambeh Assistant, sign in or create your free Bambeh account. The quick questions work without an account.',
    limit: 'You have used today\'s questions for Bambeh Assistant. It opens again tomorrow. The quick questions still work.',
    busy: 'Bambeh Assistant has reached its limit for today. Please try again tomorrow. The quick questions still work.',
    offline: 'Bambeh Assistant is not available right now. Try again in a few minutes. For help with an order or your account, write to support@bambeh.com.',
    note: 'Bambeh Assistant is an AI and can make mistakes. It is not a doctor. Never share your PIN, password or codes.',
    send: 'Send',
    minimize: 'Make smaller',
    maximize: 'Make bigger',
  },
  fr: {
    title: 'Bambeh Assistant',
    apiLabel: 'Propuls\u00e9 par Claude AI',
    poweredBy: 'Propuls\u00e9 par Claude AI - Bambeh Marketplace',
    welcome: 'Bonjour ! Je suis **Bambeh Assistant**. Demandez-moi comment marche Bambeh : acheter et vendre en s\u00e9curit\u00e9, Bambeh Secured Pay (le paiement s\u00e9curis\u00e9), vos commandes, les Zerm coins ou l\'aide gratuite. Je suis une IA : v\u00e9rifiez les r\u00e9ponses importantes dans l\'application.',
    quickLabel: 'Questions rapides :',
    quick: {
      zerm: 'Comment marchent les Zerm coins ?',
      sell: 'Comment vendre sur Bambeh ?',
      payment: 'Comment payer en s\u00e9curit\u00e9 ?',
      order: 'O\u00f9 est ma commande ?',
      delivery: 'Comment marche la livraison ?',
      subscription: 'Faut-il un abonnement ?',
    },
    answers: {
      zerm: 'Les **Zerm coins** sont les points de r\u00e9compense de Bambeh. Vous en gagnez un peu en participant, par exemple aux quiz. Ils n\'ont **aucune valeur en argent** : on ne peut ni les acheter, ni les vendre, ni les envoyer \u00e0 quelqu\'un, ni les changer en argent.',
      sell: 'Connectez-vous, ouvrez **Marketplace**, puis **Vendre**. Ajoutez des photos nettes, une description honn\u00eate et votre prix. Les acheteurs vous joignent seulement par le chat Bambeh : ne mettez jamais de num\u00e9ro de t\u00e9l\u00e9phone ou WhatsApp dans votre annonce. La vente de m\u00e9dicaments est interdite sur Bambeh.',
      payment: 'Payez dans l\'application avec **Bambeh Secured Pay** (MTN Mobile Money ou Orange Money). Bambeh garde l\'argent jusqu\'\u00e0 ce que vous confirmiez avoir re\u00e7u votre article ; alors seulement le vendeur est pay\u00e9. Ne payez jamais en dehors de l\'application et ne donnez jamais votre code PIN : Bambeh ne vous le demandera jamais.',
      order: 'Ouvrez **Mes commandes** pour voir chaque commande et son statut. Quand l\'article vous arrive et qu\'il est conforme, appuyez sur **Confirmer que j\'ai re\u00e7u mon article**. En cas de probl\u00e8me, signalez-le depuis la commande avant de confirmer, ou \u00e9crivez \u00e0 support@bambeh.com avec la r\u00e9f\u00e9rence de la commande.',
      delivery: 'La livraison se convient avec le vendeur dans le chat Bambeh. L\u00e0 o\u00f9 des livreurs Bambeh travaillent dans votre ville, **Envoyer un colis** dans le menu affiche le prix avant de payer. Bambeh ne promet pas de d\u00e9lai de livraison.',
      subscription: 'Certaines sections de Bambeh demandent un abonnement, et vous ne payez que pour les sections que vous utilisez : l\'application affiche les formules et le prix exact avant de payer. L\'aide gratuite (pharmacies, h\u00f4pitaux, eau et \u00e9lectricit\u00e9, carburant, s\u00e9curit\u00e9, sant\u00e9 des femmes) ne demande jamais d\'abonnement, seulement un compte gratuit.',
    },
    links: { sell: 'Vendre un article', order: 'Mes commandes', subscription: 'Voir les formules' },
    placeholder: 'Posez votre question sur Bambeh...',
    newConversation: 'Nouvelle conversation',
    signInTitle: 'Connectez-vous pour discuter',
    signInBody: 'Bambeh Assistant est gratuit avec votre compte Bambeh. Les questions rapides marchent sans compte.',
    signIn: 'Se connecter',
    register: 'Cr\u00e9er un compte gratuit',
    needSignIn: 'Pour discuter avec Bambeh Assistant, connectez-vous ou cr\u00e9ez votre compte Bambeh gratuit. Les questions rapides marchent sans compte.',
    limit: 'Vous avez utilis\u00e9 vos questions du jour pour Bambeh Assistant. Il rouvre demain. Les questions rapides marchent toujours.',
    busy: 'Bambeh Assistant a atteint sa limite pour aujourd\'hui. R\u00e9essayez demain. Les questions rapides marchent toujours.',
    offline: 'Bambeh Assistant n\'est pas disponible pour le moment. R\u00e9essayez dans quelques minutes. Pour une commande ou votre compte, \u00e9crivez \u00e0 support@bambeh.com.',
    note: 'Bambeh Assistant est une IA et peut se tromper. Ce n\'est pas un m\u00e9decin. Ne donnez jamais votre code PIN, votre mot de passe ou vos codes.',
    send: 'Envoyer',
    minimize: 'R\u00e9duire',
    maximize: 'Agrandir',
  },
  pidgin: {
    title: 'Bambeh Assistant',
    apiLabel: 'Powered by Claude AI',
    poweredBy: 'Powered by Claude AI - Bambeh Marketplace',
    welcome: 'Hello! I be **Bambeh Assistant**. Ask me how Bambeh dey work: how to buy and sell without wahala, Bambeh Secured Pay, your orders, Zerm coins or the free help. I be AI, so check important answer inside the app.',
    quickLabel: 'Quick questions:',
    quick: {
      zerm: 'How Zerm coins dey work?',
      sell: 'How I fit sell for Bambeh?',
      payment: 'How I go pay safe?',
      order: 'Where my order dey?',
      delivery: 'How delivery dey work?',
      subscription: 'I need subscription?',
    },
    answers: {
      zerm: '**Zerm coins** na Bambeh reward points. You dey get small one when you take part, like for quiz. Dem **no get money value**: you no fit buy dem, sell dem, send dem give another person or change dem to cash.',
      sell: 'Sign in, open **Marketplace**, then **Sell**. Put clear photo, true description and your price. Buyers go reach you only for Bambeh chat, so no ever put phone or WhatsApp number for your listing. Dem no allow person sell medicine for Bambeh.',
      payment: 'Pay inside the app with **Bambeh Secured Pay** (MTN Mobile Money or Orange Money). Bambeh go hold the money until you confirm say you don receive your item; na then seller go get im pay. No ever pay outside the app, and no ever give your PIN: Bambeh no go ever ask you for am.',
      order: 'Open **My Orders** to see every order and how e dey. When the item reach you and e correct, press **Confirm say I don receive my item**. If something no correct, report the problem from the order before you confirm, or write to support@bambeh.com with the order reference.',
      delivery: 'You and the seller go agree delivery for Bambeh chat. Where Bambeh riders dey work for your town, **Send something** for the menu go show the price before you pay. Bambeh no dey promise delivery time.',
      subscription: 'Some section for Bambeh need subscription, and you go pay only for the section weh you use: the app go show the plans and the correct price before you pay. The free help (pharmacy, hospital, water and light, fuel, safety, woman health) no dey ever need subscription, na only free account.',
    },
    links: { sell: 'Sell something', order: 'My Orders', subscription: 'See the plans' },
    placeholder: 'Ask me anything about Bambeh...',
    newConversation: 'New conversation',
    signInTitle: 'Sign in make you chat',
    signInBody: 'Bambeh Assistant na free with your Bambeh account. The quick questions dey work without account.',
    signIn: 'Sign in',
    register: 'Create free account',
    needSignIn: 'To chat with Bambeh Assistant, sign in or create your free Bambeh account. The quick questions dey work without account.',
    limit: 'You don use all your questions for today. Bambeh Assistant go open again tomorrow. The quick questions still dey work.',
    busy: 'Bambeh Assistant don reach im limit for today. Try again tomorrow. The quick questions still dey work.',
    offline: 'Bambeh Assistant no dey available now. Try again small time. For order or account matter, write to support@bambeh.com.',
    note: 'Bambeh Assistant na AI, e fit make mistake. E no be doctor. No ever give your PIN, password or code.',
    send: 'Send',
    minimize: 'Make am small',
    maximize: 'Make am big',
  },
  ar: {
    title: 'Bambeh Assistant',
    apiLabel: '\u0645\u062f\u0639\u0648\u0645 \u0628\u0648\u0627\u0633\u0637\u0629 Claude AI',
    poweredBy: '\u0645\u062f\u0639\u0648\u0645 \u0628\u0648\u0627\u0633\u0637\u0629 Claude AI - Bambeh Marketplace',
    welcome: '\u0645\u0631\u062d\u0628\u064b\u0627! \u0623\u0646\u0627 **Bambeh Assistant**. \u0627\u0633\u0623\u0644\u0646\u064a \u0639\u0646 \u0637\u0631\u064a\u0642\u0629 \u0639\u0645\u0644 \u0628\u0627\u0645\u0628\u064a\u0647: \u0627\u0644\u0628\u064a\u0639 \u0648\u0627\u0644\u0634\u0631\u0627\u0621 \u0628\u0623\u0645\u0627\u0646\u060c \u0648\u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0622\u0645\u0646 Bambeh Secured Pay\u060c \u0648\u0637\u0644\u0628\u0627\u062a\u0643\u060c \u0648\u0639\u0645\u0644\u0627\u062a \u0632\u0631\u0645\u060c \u0648\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629. \u0623\u0646\u0627 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a\u060c \u0641\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u0644\u0625\u062c\u0627\u0628\u0627\u062a \u0627\u0644\u0645\u0647\u0645\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642.',
    quickLabel: '\u0623\u0633\u0626\u0644\u0629 \u0633\u0631\u064a\u0639\u0629:',
    quick: {
      zerm: '\u0643\u064a\u0641 \u062a\u0639\u0645\u0644 \u0639\u0645\u0644\u0627\u062a \u0632\u0631\u0645\u061f',
      sell: '\u0643\u064a\u0641 \u0623\u0628\u064a\u0639 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647\u061f',
      payment: '\u0643\u064a\u0641 \u0623\u062f\u0641\u0639 \u0628\u0623\u0645\u0627\u0646\u061f',
      order: '\u0623\u064a\u0646 \u0637\u0644\u0628\u064a\u061f',
      delivery: '\u0643\u064a\u0641 \u064a\u062a\u0645 \u0627\u0644\u062a\u0648\u0635\u064a\u0644\u061f',
      subscription: '\u0647\u0644 \u0623\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0627\u0634\u062a\u0631\u0627\u0643\u061f',
    },
    answers: {
      zerm: '**\u0639\u0645\u0644\u0627\u062a \u0632\u0631\u0645** \u0647\u064a \u0646\u0642\u0627\u0637 \u0645\u0643\u0627\u0641\u0623\u0629 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647. \u062a\u062d\u0635\u0644 \u0639\u0644\u0649 \u0643\u0645\u064a\u0627\u062a \u0635\u063a\u064a\u0631\u0629 \u0645\u0646\u0647\u0627 \u0639\u0646\u062f \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629\u060c \u0645\u062b\u0644 \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631\u0627\u062a. \u0644\u064a\u0633\u062a \u0644\u0647\u0627 **\u0623\u064a \u0642\u064a\u0645\u0629 \u0645\u0627\u0644\u064a\u0629**: \u0644\u0627 \u064a\u0645\u0643\u0646 \u0634\u0631\u0627\u0624\u0647\u0627 \u0623\u0648 \u0628\u064a\u0639\u0647\u0627 \u0623\u0648 \u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0625\u0644\u0649 \u0634\u062e\u0635 \u0622\u062e\u0631 \u0623\u0648 \u062a\u062d\u0648\u064a\u0644\u0647\u0627 \u0625\u0644\u0649 \u0646\u0642\u0648\u062f.',
      sell: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644\u060c \u0648\u0627\u0641\u062a\u062d **\u0627\u0644\u0633\u0648\u0642** \u062b\u0645 **\u0628\u064a\u0639**. \u0623\u0636\u0641 \u0635\u0648\u0631\u064b\u0627 \u0648\u0627\u0636\u062d\u0629 \u0648\u0648\u0635\u0641\u064b\u0627 \u0635\u0627\u062f\u0642\u064b\u0627 \u0648\u0633\u0639\u0631\u0643. \u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u0639\u0628\u0631 \u0645\u062d\u0627\u062f\u062b\u0629 \u0628\u0627\u0645\u0628\u064a\u0647 \u0641\u0642\u0637\u060c \u0641\u0644\u0627 \u062a\u0636\u0639 \u0623\u0628\u062f\u064b\u0627 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641 \u0623\u0648 \u0648\u0627\u062a\u0633\u0627\u0628 \u0641\u064a \u0625\u0639\u0644\u0627\u0646\u0643. \u0628\u064a\u0639 \u0627\u0644\u0623\u062f\u0648\u064a\u0629 \u0645\u0645\u0646\u0648\u0639 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647.',
      payment: '\u0627\u062f\u0641\u0639 \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0639\u0628\u0631 **Bambeh Secured Pay** (MTN Mobile Money \u0623\u0648 Orange Money). \u062a\u062d\u062a\u0641\u0638 \u0628\u0627\u0645\u0628\u064a\u0647 \u0628\u0627\u0644\u0645\u0627\u0644 \u062d\u062a\u0649 \u062a\u0624\u0643\u062f \u0623\u0646\u0643 \u0627\u0633\u062a\u0644\u0645\u062a \u0645\u0646\u062a\u062c\u0643\u060c \u0648\u0639\u0646\u062f\u0647\u0627 \u0641\u0642\u0637 \u064a\u064f\u062f\u0641\u0639 \u0644\u0644\u0628\u0627\u0626\u0639. \u0644\u0627 \u062a\u062f\u0641\u0639 \u0623\u0628\u062f\u064b\u0627 \u062e\u0627\u0631\u062c \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u060c \u0648\u0644\u0627 \u062a\u0634\u0627\u0631\u0643 \u0631\u0645\u0632\u0643 \u0627\u0644\u0633\u0631\u064a (PIN): \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0646 \u062a\u0637\u0644\u0628\u0647 \u0645\u0646\u0643 \u0623\u0628\u062f\u064b\u0627.',
      order: '\u0627\u0641\u062a\u062d **\u0637\u0644\u0628\u0627\u062a\u064a** \u0644\u062a\u0631\u0649 \u0643\u0644 \u0637\u0644\u0628 \u0648\u062d\u0627\u0644\u062a\u0647. \u0639\u0646\u062f\u0645\u0627 \u064a\u0635\u0644\u0643 \u0627\u0644\u0645\u0646\u062a\u062c \u0633\u0644\u064a\u0645\u064b\u0627\u060c \u0627\u0636\u063a\u0637 **\u062a\u0623\u0643\u064a\u062f \u0627\u0633\u062a\u0644\u0627\u0645\u064a \u0644\u0644\u0645\u0646\u062a\u062c**. \u0625\u0630\u0627 \u0643\u0627\u0646\u062a \u0647\u0646\u0627\u0643 \u0645\u0634\u0643\u0644\u0629\u060c \u0623\u0628\u0644\u063a \u0639\u0646\u0647\u0627 \u0645\u0646 \u0627\u0644\u0637\u0644\u0628 \u0642\u0628\u0644 \u0627\u0644\u062a\u0623\u0643\u064a\u062f\u060c \u0623\u0648 \u0627\u0643\u062a\u0628 \u0625\u0644\u0649 support@bambeh.com \u0645\u0639 \u0645\u0631\u062c\u0639 \u0627\u0644\u0637\u0644\u0628.',
      delivery: '\u064a\u062a\u0645 \u0627\u0644\u0627\u062a\u0641\u0627\u0642 \u0639\u0644\u0649 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0645\u0639 \u0627\u0644\u0628\u0627\u0626\u0639 \u0641\u064a \u0645\u062d\u0627\u062f\u062b\u0629 \u0628\u0627\u0645\u0628\u064a\u0647. \u062d\u064a\u062b \u064a\u0639\u0645\u0644 \u0633\u0627\u0626\u0642\u0648 \u0628\u0627\u0645\u0628\u064a\u0647 \u0641\u064a \u0645\u062f\u064a\u0646\u062a\u0643\u060c \u064a\u0639\u0631\u0636 **\u0627\u0637\u0644\u0628 \u062a\u0648\u0635\u064a\u0644\u0629** \u0641\u064a \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0633\u0639\u0631 \u0642\u0628\u0644 \u0627\u0644\u062f\u0641\u0639. \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0627 \u062a\u0639\u062f \u0628\u0645\u0648\u0627\u0639\u064a\u062f \u0644\u0644\u062a\u0648\u0635\u064a\u0644.',
      subscription: '\u0628\u0639\u0636 \u0623\u0642\u0633\u0627\u0645 \u0628\u0627\u0645\u0628\u064a\u0647 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0627\u0634\u062a\u0631\u0627\u0643\u060c \u0648\u062a\u062f\u0641\u0639 \u0641\u0642\u0637 \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u062a\u064a \u062a\u0633\u062a\u062e\u062f\u0645\u0647\u0627: \u064a\u0639\u0631\u0636 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u062e\u0637\u0637 \u0648\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062f\u0642\u064a\u0642 \u0642\u0628\u0644 \u0627\u0644\u062f\u0641\u0639. \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629 (\u0627\u0644\u0635\u064a\u062f\u0644\u064a\u0627\u062a\u060c \u0627\u0644\u0645\u0633\u062a\u0634\u0641\u064a\u0627\u062a\u060c \u0627\u0644\u0645\u0627\u0621 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621\u060c \u0627\u0644\u0648\u0642\u0648\u062f\u060c \u0627\u0644\u0633\u0644\u0627\u0645\u0629\u060c \u0635\u062d\u0629 \u0627\u0644\u0645\u0631\u0623\u0629) \u0644\u0627 \u062a\u062d\u062a\u0627\u062c \u0623\u0628\u062f\u064b\u0627 \u0625\u0644\u0649 \u0627\u0634\u062a\u0631\u0627\u0643\u060c \u0628\u0644 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628 \u0645\u062c\u0627\u0646\u064a \u0641\u0642\u0637.',
    },
    links: { sell: '\u0627\u0639\u0631\u0636 \u0645\u0646\u062a\u062c\u064b\u0627 \u0644\u0644\u0628\u064a\u0639', order: '\u0637\u0644\u0628\u0627\u062a\u064a', subscription: '\u0639\u0631\u0636 \u0627\u0644\u062e\u0637\u0637' },
    placeholder: '\u0627\u0633\u0623\u0644\u0646\u064a \u0623\u064a \u0634\u064a\u0621 \u0639\u0646 \u0628\u0627\u0645\u0628\u064a\u0647...',
    newConversation: '\u0645\u062d\u0627\u062f\u062b\u0629 \u062c\u062f\u064a\u062f\u0629',
    signInTitle: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u0645\u062d\u0627\u062f\u062b\u0629',
    signInBody: 'Bambeh Assistant \u0645\u062c\u0627\u0646\u064a \u0645\u0639 \u062d\u0633\u0627\u0628\u0643 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647. \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0633\u0631\u064a\u0639\u0629 \u062a\u0639\u0645\u0644 \u0628\u062f\u0648\u0646 \u062d\u0633\u0627\u0628.',
    signIn: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    register: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628 \u0645\u062c\u0627\u0646\u064a',
    needSignIn: '\u0644\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u0645\u0639 Bambeh Assistant\u060c \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648 \u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647. \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0633\u0631\u064a\u0639\u0629 \u062a\u0639\u0645\u0644 \u0628\u062f\u0648\u0646 \u062d\u0633\u0627\u0628.',
    limit: '\u0644\u0642\u062f \u0627\u0633\u062a\u062e\u062f\u0645\u062a \u0623\u0633\u0626\u0644\u062a\u0643 \u0644\u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645. \u0633\u064a\u0639\u0648\u062f Bambeh Assistant \u063a\u062f\u064b\u0627. \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0633\u0631\u064a\u0639\u0629 \u0645\u0627 \u0632\u0627\u0644\u062a \u062a\u0639\u0645\u0644.',
    busy: '\u0628\u0644\u063a Bambeh Assistant \u062d\u062f\u0651\u0647 \u0644\u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u063a\u062f\u064b\u0627. \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0633\u0631\u064a\u0639\u0629 \u0645\u0627 \u0632\u0627\u0644\u062a \u062a\u0639\u0645\u0644.',
    offline: 'Bambeh Assistant \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u0627\u0644\u0622\u0646. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u062f\u0642\u0627\u0626\u0642. \u0644\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0628\u062e\u0635\u0648\u0635 \u0637\u0644\u0628 \u0623\u0648 \u062d\u0633\u0627\u0628\u0643\u060c \u0627\u0643\u062a\u0628 \u0625\u0644\u0649 support@bambeh.com.',
    note: 'Bambeh Assistant \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0648\u0642\u062f \u064a\u062e\u0637\u0626. \u0644\u064a\u0633 \u0637\u0628\u064a\u0628\u064b\u0627. \u0644\u0627 \u062a\u0634\u0627\u0631\u0643 \u0623\u0628\u062f\u064b\u0627 \u0631\u0645\u0632\u0643 \u0627\u0644\u0633\u0631\u064a \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0623\u0648 \u0627\u0644\u0631\u0645\u0648\u0632.',
    send: '\u0625\u0631\u0633\u0627\u0644',
    minimize: '\u062a\u0635\u063a\u064a\u0631',
    maximize: '\u062a\u0643\u0628\u064a\u0631',
  },
  ff: {
    title: 'Bambeh Assistant',
    apiLabel: 'Powered by Claude AI',
    poweredBy: 'Powered by Claude AI - Bambeh Marketplace',
    welcome: 'Jam waali! Mi\u0257o woni **Bambeh Assistant**. Lamndo kam no Bambeh gollortoo: soodde e yeeyde e kisal, Bambeh Secured Pay, komaanjiije maa, Zerm coins walla ballal meere. Mi\u0257o AI: \u01b4eewto jaabawuuje maw\u0257e e nder aplikasiyo\u014b.',
    quickLabel: 'Lamndeeji \u0257i njaawi:',
    quick: {
      zerm: 'No Zerm coins gollortoo?',
      sell: 'No mbaawmi yeeyde e Bambeh?',
      payment: 'No njo\u0253irtoomi e kisal?',
      order: 'Hoto komaanji am woni?',
      delivery: 'No livreeson gollortoo?',
      subscription: 'Mi sokli abonnement na?',
    },
    answers: {
      zerm: '**Zerm coins** ko nga\u00f1aari Bambeh. A he\u0253ata see\u0257a so a naati e golle, wano kiis (quiz). **Ngalaa coggu ceede**: a waawaa soodde \u0257e, yeeyde \u0257e, neldude \u0257e ne\u0257\u0257o, walla waylude \u0257e ceede.',
      sell: 'Naatu e konte maa, uddit **Marketplace**, refti **Sell**. \u0181eydu nate laa\u0253\u0257e, sifaa goonga e coggu maa. Soodoo\u0253e ina njottoo ma e chat Bambeh tan: wota a wa\u0257 limoore telefon walla WhatsApp e anonse maa. Yeeyde lekki (m\u00e9dicaments) ha\u0257aama e Bambeh.',
      payment: 'Yo\u0253 e nder aplikasiyo\u014b e **Bambeh Secured Pay** (MTN Mobile Money walla Orange Money). Bambeh ina danndoo ceede \u0257ee haa a tee\u014btina a he\u0253ii huunde maa; \u0257on tan yeeyoowo yo\u0253etee. Wota a yo\u0253 yaasi aplikasiyo\u014b, wota a hokku PIN maa fey: Bambeh lamndataa \u0257um.',
      order: 'Uddit **Komaanjiije am** ngam yiyde komaanji kala e no woniri. So huunde ndee yottii ma tee ina mo\u01b4\u01b4i, \u00f1o\u01b4\u01b4u **\u018aa\u0257\u0257o mi he\u0253ii lumuuji mi**. So ca\u0257eele woodi, holliru \u0257um e komaanji ndii hade a tee\u014btinde, walla winndu to support@bambeh.com e referaas komaanji ndii.',
      delivery: 'Livreeson ina ja\u0253ondiree e yeeyoowo e nder chat Bambeh. To riders Bambeh ngollata e wuro maa, **Neldu huunde** e menu ina hollira coggu hade a yo\u0253de. Bambeh fodaani waktu livreeson.',
      subscription: 'Senngooji go\u0257\u0257i e Bambeh ina nji\u0257i abonnement, a yo\u0253ata senngooji \u0257i kuutorto\u0257aa tan: aplikasiyo\u014b ina hollira plan-uuji e coggu goonga hade a yo\u0253de. Ballal meere (farmasiiji, opitaaluuji, ndiyam e yiite, esaas, kisal, cellal rew\u0253e) sokliraa abonnement fey, konte meere tan.',
    },
    links: { sell: 'Yeeyu huunde', order: 'Komaanjiije am', subscription: 'Yiy plan-uuji' },
    placeholder: 'Lamndo kam fii Bambeh...',
    newConversation: 'Haala kesal',
    signInTitle: 'Naatu ngam haalde',
    signInBody: 'Bambeh Assistant ko meere e konte Bambeh maa. Lamndeeji \u0257i njaawi ina ngolloo tawa alaa konte.',
    signIn: 'Naatu',
    register: 'Wa\u0257 konte meere',
    needSignIn: 'Ngam haalde e Bambeh Assistant, naatu walla wa\u0257 konte Bambeh maa meere. Lamndeeji \u0257i njaawi ina ngolloo tawa alaa konte.',
    limit: 'A huutoriima lamndeeji maa hannde. Bambeh Assistant ina uddita kadi jaango. Lamndeeji \u0257i njaawi ina ngolloo tawo.',
    busy: 'Bambeh Assistant yottiima keerol mum hannde. Etno kadi jaango. Lamndeeji \u0257i njaawi ina ngolloo tawo.',
    offline: 'Bambeh Assistant woodaani jooni. Etno kadi \u0253ooyaani. Ngam komaanji walla konte maa, winndu to support@bambeh.com.',
    note: 'Bambeh Assistant ko AI, ina waawi juumde. Wonaa doktoor. Wota a hokku PIN maa, finnde maa walla kodeeji maa fey.',
    send: 'Neldu',
    minimize: 'Ustu',
    maximize: 'Mawnin',
  },
};

/** **bold** and line breaks, as React text - never as HTML. */
export function RichText({ text }: { text: string }) {
  const lines = String(text || '').split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <br /> : null}
          {line.split('**').map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : <React.Fragment key={j}>{part}</React.Fragment>))}
        </React.Fragment>
      ))}
    </>
  );
}

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  time: number;
  text?: string;   // typed by the person, or answered by the AI
  topic?: Topic;   // a quick question / quick answer (shown in the current language)
  say?: Say;       // a message from this page (sign in, limit, busy, offline)
}

let seq = 0;
const nextId = () => 'm' + Date.now().toString(36) + '-' + (++seq).toString(36);

async function sessionToken(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    const tok = data && data.session ? data.session.access_token : '';
    return typeof tok === 'string' ? tok : '';
  } catch {
    return '';
  }
}

const BambehAIChatbot: React.FC = () => {
  const lang = normLang(useLang());
  const t = TEXTS[lang];
  const isRtl = lang === 'ar';
  const location = useLocation();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession()
      .then(({ data }: { data: { session: unknown } }) => { if (alive) setSignedIn(!!(data && data.session)); })
      .catch(() => { if (alive) setSignedIn(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: unknown) => {
      if (alive) setSignedIn(!!session);
    });
    return () => {
      alive = false;
      try { sub && sub.subscription && sub.subscription.unsubscribe(); } catch { /* already gone */ }
    };
  }, []);

  useEffect(() => {
    const end = messagesEndRef.current;
    if (end && typeof end.scrollIntoView === 'function') end.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const words = (m: Msg): string => {
    if (typeof m.text === 'string') return m.text;
    if (m.topic) return m.role === 'user' ? t.quick[m.topic] : t.answers[m.topic];
    if (m.say) return t[m.say];
    return '';
  };

  const add = (list: Msg[], m: Omit<Msg, 'id' | 'time'>): Msg[] => [...list, { ...m, id: nextId(), time: Date.now() }];

  // Quick questions: answered here, at once, with or without an account.
  const ask = (topic: Topic) => {
    if (isLoading) return;
    setMessages((prev) => add(add(prev, { role: 'user', topic }), { role: 'assistant', topic }));
  };

  const sendMessage = async (raw: string) => {
    const text = raw.trim().slice(0, 2000);
    if (!text || isLoading) return;
    const withQuestion = add(messages, { role: 'user', text });
    setMessages(withQuestion);
    setInput('');
    setIsLoading(true);

    const answerLocally = (fallback: Say) => {
      const topic = matchTopic(text);
      setMessages((prev) => add(prev, topic ? { role: 'assistant', topic } : { role: 'assistant', say: fallback }));
    };

    try {
      const token = await sessionToken();
      if (!token) {
        setSignedIn(false);
        const topic = matchTopic(text);
        setMessages((prev) => {
          let next = prev;
          if (topic) next = add(next, { role: 'assistant', topic });
          return add(next, { role: 'assistant', say: 'needSignIn' });
        });
        return;
      }
      // the conversation so far: typed questions, AI answers and quick answers (not this page's notices)
      const history = withQuestion
        .filter((m) => !m.say)
        .map((m) => ({ role: m.role, content: words(m) }))
        .filter((m) => m.content.trim() !== '')
        .slice(-12);
      const response = await fetch(`${AI_BACKEND}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lang, messages: history }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.success === true && typeof data.text === 'string' && data.text.trim()) {
        const answer = data.text.trim();
        setMessages((prev) => add(prev, { role: 'assistant', text: answer }));
        return;
      }
      const error = data && typeof data.error === 'string' ? data.error : '';
      if (error === 'sign_in_required') {
        setSignedIn(false);
        setMessages((prev) => add(prev, { role: 'assistant', say: 'needSignIn' }));
      } else if (error === 'daily_limit') {
        setMessages((prev) => add(prev, { role: 'assistant', say: 'limit' }));
      } else if (error === 'busy') {
        setMessages((prev) => add(prev, { role: 'assistant', say: 'busy' }));
      } else {
        answerLocally('offline');
      }
    } catch {
      answerLocally('offline');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
  };

  const signInLinks = (
    <div className="flex flex-wrap gap-2 mt-2" data-signin-links="1">
      <Link to="/login" state={{ from: location }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">
        <LogIn className="w-3.5 h-3.5" />{t.signIn}
      </Link>
      <Link to="/register" state={{ from: location }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-indigo-700 border border-indigo-200 text-xs font-semibold hover:bg-indigo-50">
        <UserPlus className="w-3.5 h-3.5" />{t.register}
      </Link>
    </div>
  );

  const bubble = (m: Msg | null, content: string, extra: React.ReactNode = null) => {
    const mine = !!m && m.role === 'user';
    return (
      <div key={m ? m.id : 'welcome'} className={`flex gap-3 ${mine ? 'flex-row-reverse' : 'flex-row'}`}
        data-msg={m ? m.role : 'welcome'} data-say={m && m.say ? m.say : undefined} data-topic={m && m.topic ? m.topic : undefined}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${mine ? 'bg-indigo-600' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
          {mine ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
        </div>
        <div className={`max-w-[80%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${mine ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}
            data-bubble="1">
            <RichText text={content} />
            {extra}
          </div>
          {m ? (
            <span className="text-xs text-gray-400">
              {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center p-4"
      data-fix="FIX734">
      <div dir={isRtl ? 'rtl' : 'ltr'}
        className={`bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl flex flex-col transition-all duration-300 ${isMinimized ? 'h-20' : 'h-[85vh] max-h-[750px]'}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">{t.title}</h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${signedIn ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-blue-100 text-xs">{t.apiLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={resetChat} title={t.newConversation} aria-label={t.newConversation} data-reset="1"
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button type="button" onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? t.maximize : t.minimize} aria-label={isMinimized ? t.maximize : t.minimize}
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
              {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {signedIn === false && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3" data-signin-banner="1">
                  <p className="text-sm font-bold text-indigo-900">{t.signInTitle}</p>
                  <p className="text-xs text-indigo-800 mt-0.5">{t.signInBody}</p>
                  {signInLinks}
                </div>
              )}

              {bubble(null, t.welcome)}

              {messages.map((m) => {
                const link = m.role === 'assistant' && m.topic ? TOPIC_LINKS[m.topic] : undefined;
                const extra = m.say === 'needSignIn'
                  ? signInLinks
                  : link && m.topic ? (
                    <Link to={link} data-topic-link={m.topic}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-indigo-700 border border-indigo-200 text-xs font-semibold hover:bg-indigo-50">
                      {t.links[m.topic]}<ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                    </Link>
                  ) : null;
                return bubble(m, words(m), extra);
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3" data-loading="1">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions - always there, answered on the phone */}
            <div className="px-4 pb-2 flex-shrink-0">
              <p className="text-xs text-gray-500 font-medium mb-1.5 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {t.quickLabel}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {TOPICS.map((topic) => (
                  <button type="button" key={topic} onClick={() => ask(topic)} disabled={isLoading} data-quick={topic}
                    className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-100 border border-blue-100 transition-all disabled:opacity-50">
                    {t.quick[topic]}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="flex gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  maxLength={2000}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400 px-2"
                  disabled={isLoading}
                  data-chat-input="1"
                />
                <button type="button"
                  onClick={() => void sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  aria-label={t.send}
                  data-send="1"
                  className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 transition-all flex-shrink-0">
                  <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <p className="text-center text-[11px] text-gray-500 mt-2" data-note="1">{t.note}</p>
              <p className="text-center text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                {t.poweredBy}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BambehAIChatbot;
// BAMBEH_END_TOKEN__AICHATBOT_FIX734__COMPLETE
