// BAMBEH_DEPLOY_TOKEN__MEETSAFELYPAGE_FIX401_CLEAN
/**
 * src/routes/groups/community/MeetSafelyPage.tsx - Bambeh Marketplace
 *
 * FIX401: the whole page was hardcoded English. Every word now lives in a
 * local five-language table (en / fr / pidgin / ar / ff) so it can never fall
 * back to English because a key is missing from a shared file.
 *  - RTL applied for Arabic
 *  - the broken "?" characters left by an old encoding are gone
 *  - translate="no" guards against Chrome auto-translate crashing React
 *  - no phone, no WhatsApp, no email anywhere (chat-only policy)
 * (c) 2025-2026 BAMBEH SARL. All rights reserved.
 */
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, MapPin, Users, Phone, AlertTriangle, CheckCircle, Camera,
} from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

const T = {
  en: {
    back: "Back",
    title: "Meet Safely",
    subtitle: "Stay safe when you buy and sell in person",
    checklistTitle: "Quick safety checklist",
    c1: "Meet in a public, well-lit place",
    c2: "Tell someone where you are going",
    c3: "Test the item before you pay",
    c4: "Count the money or check the mobile payment",
    c5: "Trust your instinct. If something feels wrong, leave",
    t1: "Meet in a public place",
    t1a: "Choose busy places: supermarkets, shopping centres, banks",
    t1b: "Avoid quiet streets, car parks, and your own home",
    t1c: "Good spots: central markets, shopping malls, hotel lobbies",
    t1d: "Meet in daylight whenever you can",
    t2: "Bring someone you trust",
    t2a: "Always tell someone where you are going and who you are meeting",
    t2b: "For expensive items, bring a friend or a family member",
    t2c: "Share the seller's Bambeh chat name with someone you trust",
    t2d: "Message that person again once the deal is done",
    t3: "Check the item before you pay",
    t3a: "Switch electronics on and test every function",
    t3b: "Look closely for damage the photos did not show",
    t3c: "For vehicles, check the engine, the tyres and all the papers",
    t3d: "Do not pay until you are satisfied with the item",
    t4: "Pay safely",
    t4a: "Count cash before you hand it over",
    t4b: "Prefer MTN MoMo or Orange Money so there is a record",
    t4c: "Use Bambeh Escrow for expensive items. We hold the money until you confirm delivery",
    t4d: "Never send money to a bank account you do not know",
    t5: "Warning signs. Walk away if...",
    t5a: "The seller asks you to pay before you meet or see the item",
    t5b: "The price is far too low to be true",
    t5c: "The seller refuses to meet in a public place",
    t5d: "The seller pushes you to decide quickly",
    t5e: "Someone else turns up in the seller's place without warning",
    spotsTitle: "Suggested meeting places",
    spotHotelName: "Hotel lobbies (any city)",
    spotPoliceName: "Police stations",
    spotBankName: "Banks and ATM areas",
    kMarket: "Market",
    kSupermarket: "Supermarket",
    kBusiness: "Business area",
    kHotel: "Hotel",
    kOfficial: "Official",
    kFinancial: "Financial",
    escrowTitle: "Buying something expensive? Use Escrow",
    escrowBody: "Bambeh Escrow holds your payment until you confirm you received the item. Neither the buyer nor the seller carries the risk alone.",
    escrowCta: "Learn about Escrow",
    reportTitle: "Something went wrong?",
    reportBody: "If you met fraud, threats or a scam, report it now. We read every report.",
    reportCta: "Report an incident",
  },
  fr: {
    back: "Retour",
    title: "Se rencontrer en s\u00e9curit\u00e9",
    subtitle: "Restez en s\u00e9curit\u00e9 quand vous achetez et vendez en personne",
    checklistTitle: "V\u00e9rification rapide",
    c1: "Rencontrez-vous dans un lieu public et bien \u00e9clair\u00e9",
    c2: "Dites \u00e0 quelqu'un o\u00f9 vous allez",
    c3: "Testez l'article avant de payer",
    c4: "Comptez l'argent ou v\u00e9rifiez le paiement mobile",
    c5: "Fiez-vous \u00e0 votre instinct. Si quelque chose vous g\u00eane, partez",
    t1: "Rencontrez-vous dans un lieu public",
    t1a: "Choisissez des lieux fr\u00e9quent\u00e9s : supermarch\u00e9s, centres commerciaux, banques",
    t1b: "\u00c9vitez les rues d\u00e9sertes, les parkings et votre propre domicile",
    t1c: "Bons endroits : march\u00e9s centraux, centres commerciaux, halls d'h\u00f4tel",
    t1d: "Rencontrez-vous de jour autant que possible",
    t2: "Venez avec une personne de confiance",
    t2a: "Dites toujours \u00e0 quelqu'un o\u00f9 vous allez et qui vous rencontrez",
    t2b: "Pour un article co\u00fbteux, venez avec un ami ou un membre de la famille",
    t2c: "Partagez le nom du vendeur sur le chat Bambeh avec une personne de confiance",
    t2d: "Recontactez cette personne une fois la transaction termin\u00e9e",
    t3: "V\u00e9rifiez l'article avant de payer",
    t3a: "Allumez les appareils \u00e9lectroniques et testez toutes les fonctions",
    t3b: "Cherchez les dommages que les photos ne montraient pas",
    t3c: "Pour un v\u00e9hicule, v\u00e9rifiez le moteur, les pneus et tous les papiers",
    t3d: "Ne payez pas tant que l'article ne vous satisfait pas",
    t4: "Payez en s\u00e9curit\u00e9",
    t4a: "Comptez les esp\u00e8ces avant de les remettre",
    t4b: "Pr\u00e9f\u00e9rez MTN MoMo ou Orange Money pour garder une trace",
    t4c: "Utilisez Bambeh Escrow pour les articles co\u00fbteux. Nous gardons l'argent jusqu'\u00e0 votre confirmation de r\u00e9ception",
    t4d: "N'envoyez jamais d'argent vers un compte bancaire inconnu",
    t5: "Signaux d'alerte. Partez si...",
    t5a: "Le vendeur demande le paiement avant la rencontre ou avant de voir l'article",
    t5b: "Le prix est bien trop bas pour \u00eatre vrai",
    t5c: "Le vendeur refuse de se rencontrer dans un lieu public",
    t5d: "Le vendeur vous presse de d\u00e9cider vite",
    t5e: "Une autre personne se pr\u00e9sente \u00e0 la place du vendeur sans pr\u00e9venir",
    spotsTitle: "Lieux de rencontre conseill\u00e9s",
    spotHotelName: "Halls d'h\u00f4tel (toute ville)",
    spotPoliceName: "Commissariats de police",
    spotBankName: "Banques et zones de distributeurs",
    kMarket: "March\u00e9",
    kSupermarket: "Supermarch\u00e9",
    kBusiness: "Quartier d'affaires",
    kHotel: "H\u00f4tel",
    kOfficial: "Officiel",
    kFinancial: "Financier",
    escrowTitle: "Un achat co\u00fbteux ? Utilisez Escrow",
    escrowBody: "Bambeh Escrow garde votre paiement jusqu'\u00e0 ce que vous confirmiez avoir re\u00e7u l'article. Ni l'acheteur ni le vendeur ne porte le risque seul.",
    escrowCta: "En savoir plus sur Escrow",
    reportTitle: "Un probl\u00e8me est survenu ?",
    reportBody: "Si vous avez subi une fraude, des menaces ou une arnaque, signalez-le maintenant. Nous lisons chaque signalement.",
    reportCta: "Signaler un incident",
  },
  pidgin: {
    back: "Go back",
    title: "Meet Safe",
    subtitle: "Take care when you dey buy or sell face to face",
    checklistTitle: "Quick check before you go",
    c1: "Meet for public place weh light dey",
    c2: "Tell somebody weh you trust say na where you dey go",
    c3: "Try the thing first before you pay",
    c4: "Count the money or check the mobile money",
    c5: "If your mind no gree, comot. No shame for that",
    t1: "Meet for place weh people plenty",
    t1a: "Choose place weh people full: supermarket, shopping centre, bank",
    t1b: "No go quiet street, no go park, no carry person come your house",
    t1c: "Good place na: central market, shopping mall, hotel reception",
    t1d: "Meet for day time if e possible",
    t2: "Carry somebody weh you trust",
    t2a: "Always tell somebody say na where you dey go and na who you go meet",
    t2b: "If the thing cost, carry your padi or family member",
    t2c: "Give the seller im Bambeh chat name give somebody weh you trust",
    t2d: "Call that person again when the deal don finish",
    t3: "Check the thing before you pay",
    t3a: "On the electronics and try all the button",
    t3b: "Look well for spoil weh the photo no show",
    t3c: "For moto or car, check engine, tyre and all the paper",
    t3d: "No pay until your mind gree for the thing",
    t4: "Pay with sense",
    t4a: "Count the cash before you give am",
    t4b: "Better use MTN MoMo or Orange Money so record go dey",
    t4c: "Use Bambeh Escrow for expensive thing. We hold the money until you confirm say you don receive",
    t4d: "Never send money go bank account weh you no know",
    t5: "Danger sign. Comot if...",
    t5a: "The seller want make you pay before una meet or before you see the thing",
    t5b: "The price low too much, e no fit be true",
    t5c: "The seller no gree meet for public place",
    t5d: "The seller dey rush you make you decide quick quick",
    t5e: "Another person come for the seller im place and dem no tell you",
    spotsTitle: "Place weh we advise make una meet",
    spotHotelName: "Hotel reception (any town)",
    spotPoliceName: "Police station",
    spotBankName: "Bank and ATM area",
    kMarket: "Market",
    kSupermarket: "Supermarket",
    kBusiness: "Business area",
    kHotel: "Hotel",
    kOfficial: "Government",
    kFinancial: "Money place",
    escrowTitle: "You dey buy expensive thing? Use Escrow",
    escrowBody: "Bambeh Escrow go hold your money until you confirm say you don collect the thing. Buyer and seller, nobody go carry the risk alone.",
    escrowCta: "Learn about Escrow",
    reportTitle: "Something bad happen?",
    reportBody: "If dem scam you, threaten you or cheat you, report am now. We dey read every report.",
    reportCta: "Report the matter",
  },
  ar: {
    back: "\u0631\u062c\u0648\u0639",
    title: "\u0627\u0644\u0644\u0642\u0627\u0621 \u0628\u0623\u0645\u0627\u0646",
    subtitle: "\u0627\u0628\u0642 \u0622\u0645\u0646\u0627 \u0639\u0646\u062f \u0627\u0644\u0628\u064a\u0639 \u0648\u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u062c\u0647\u0627 \u0644\u0648\u062c\u0647",
    checklistTitle: "\u0642\u0627\u0626\u0645\u0629 \u062a\u062d\u0642\u0642 \u0633\u0631\u064a\u0639\u0629",
    c1: "\u0627\u0644\u062a\u0642 \u0641\u064a \u0645\u0643\u0627\u0646 \u0639\u0627\u0645 \u0648\u0645\u0636\u0627\u0621 \u062c\u064a\u062f\u0627",
    c2: "\u0623\u062e\u0628\u0631 \u0634\u062e\u0635\u0627 \u062a\u062b\u0642 \u0628\u0647 \u0625\u0644\u0649 \u0623\u064a\u0646 \u062a\u0630\u0647\u0628",
    c3: "\u062c\u0631\u0628 \u0627\u0644\u0633\u0644\u0639\u0629 \u0642\u0628\u0644 \u0627\u0644\u062f\u0641\u0639",
    c4: "\u0639\u062f \u0627\u0644\u0646\u0642\u0648\u062f \u0623\u0648 \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u062f\u0641\u0639 \u0639\u0628\u0631 \u0627\u0644\u0647\u0627\u062a\u0641",
    c5: "\u062b\u0642 \u0628\u062d\u062f\u0633\u0643. \u0625\u0630\u0627 \u0634\u0639\u0631\u062a \u0628\u0634\u064a\u0621 \u063a\u064a\u0631 \u0633\u0644\u064a\u0645 \u0641\u063a\u0627\u062f\u0631",
    t1: "\u0627\u0644\u062a\u0642 \u0641\u064a \u0645\u0643\u0627\u0646 \u0639\u0627\u0645",
    t1a: "\u0627\u062e\u062a\u0631 \u0623\u0645\u0627\u0643\u0646 \u0645\u0632\u062f\u062d\u0645\u0629: \u0627\u0644\u0645\u062a\u0627\u062c\u0631 \u0627\u0644\u0643\u0628\u0631\u0649 \u0648\u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0648\u0627\u0644\u0628\u0646\u0648\u0643",
    t1b: "\u062a\u062c\u0646\u0628 \u0627\u0644\u0634\u0648\u0627\u0631\u0639 \u0627\u0644\u0647\u0627\u062f\u0626\u0629 \u0648\u0645\u0648\u0627\u0642\u0641 \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a \u0648\u0645\u0646\u0632\u0644\u0643 \u0623\u0646\u062a",
    t1c: "\u0623\u0645\u0627\u0643\u0646 \u062c\u064a\u062f\u0629: \u0627\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0645\u0631\u0643\u0632\u064a\u0629 \u0648\u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0648\u0628\u0647\u0648 \u0627\u0644\u0641\u0646\u0627\u062f\u0642",
    t1d: "\u0627\u0644\u062a\u0642 \u0641\u064a \u0648\u0636\u062d \u0627\u0644\u0646\u0647\u0627\u0631 \u0643\u0644\u0645\u0627 \u0623\u0645\u0643\u0646",
    t2: "\u0627\u0635\u0637\u062d\u0628 \u0634\u062e\u0635\u0627 \u062a\u062b\u0642 \u0628\u0647",
    t2a: "\u0623\u062e\u0628\u0631 \u062f\u0627\u0626\u0645\u0627 \u0634\u062e\u0635\u0627 \u0625\u0644\u0649 \u0623\u064a\u0646 \u062a\u0630\u0647\u0628 \u0648\u0645\u0646 \u0633\u062a\u0642\u0627\u0628\u0644",
    t2b: "\u0644\u0644\u0633\u0644\u0639 \u0627\u0644\u063a\u0627\u0644\u064a\u0629 \u0627\u0635\u0637\u062d\u0628 \u0635\u062f\u064a\u0642\u0627 \u0623\u0648 \u0623\u062d\u062f \u0623\u0641\u0631\u0627\u062f \u0627\u0644\u0639\u0627\u0626\u0644\u0629",
    t2c: "\u0634\u0627\u0631\u0643 \u0627\u0633\u0645 \u0627\u0644\u0628\u0627\u0626\u0639 \u0641\u064a \u0645\u062d\u0627\u062f\u062b\u0629 \u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u0639 \u0634\u062e\u0635 \u062a\u062b\u0642 \u0628\u0647",
    t2d: "\u0627\u062a\u0635\u0644 \u0628\u0630\u0644\u0643 \u0627\u0644\u0634\u062e\u0635 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u0627\u0646\u062a\u0647\u0627\u0621 \u0627\u0644\u0635\u0641\u0642\u0629",
    t3: "\u0627\u0641\u062d\u0635 \u0627\u0644\u0633\u0644\u0639\u0629 \u0642\u0628\u0644 \u0627\u0644\u062f\u0641\u0639",
    t3a: "\u0634\u063a\u0644 \u0627\u0644\u0623\u062c\u0647\u0632\u0629 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629 \u0648\u0627\u062e\u062a\u0628\u0631 \u0643\u0644 \u0648\u0638\u064a\u0641\u0629",
    t3b: "\u0627\u0628\u062d\u062b \u062c\u064a\u062f\u0627 \u0639\u0646 \u0623\u064a \u0639\u0637\u0628 \u0644\u0645 \u062a\u0638\u0647\u0631\u0647 \u0627\u0644\u0635\u0648\u0631",
    t3c: "\u0644\u0644\u0645\u0631\u0643\u0628\u0627\u062a \u0627\u0641\u062d\u0635 \u0627\u0644\u0645\u062d\u0631\u0643 \u0648\u0627\u0644\u0625\u0637\u0627\u0631\u0627\u062a \u0648\u0643\u0644 \u0627\u0644\u0623\u0648\u0631\u0627\u0642",
    t3d: "\u0644\u0627 \u062a\u062f\u0641\u0639 \u062d\u062a\u0649 \u062a\u0642\u062a\u0646\u0639 \u0628\u0627\u0644\u0633\u0644\u0639\u0629",
    t4: "\u0627\u062f\u0641\u0639 \u0628\u0623\u0645\u0627\u0646",
    t4a: "\u0639\u062f \u0627\u0644\u0646\u0642\u0648\u062f \u0642\u0628\u0644 \u062a\u0633\u0644\u064a\u0645\u0647\u0627",
    t4b: "\u064a\u0641\u0636\u0644 \u0627\u0645 \u062a\u064a \u0625\u0646 \u0645\u0648MO \u0623\u0648 \u0623\u0648\u0631\u0627\u0646\u062c \u0645\u0648\u0646\u064a \u0644\u064a\u0628\u0642\u0649 \u0633\u062c\u0644 \u0644\u0644\u062f\u0641\u0639",
    t4c: "\u0627\u0633\u062a\u062e\u062f\u0645 \u0636\u0645\u0627\u0646 \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0644\u0633\u0644\u0639 \u0627\u0644\u063a\u0627\u0644\u064a\u0629. \u0646\u062d\u062a\u0641\u0638 \u0628\u0627\u0644\u0645\u0627\u0644 \u062d\u062a\u0649 \u062a\u0624\u0643\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645",
    t4d: "\u0644\u0627 \u062a\u0631\u0633\u0644 \u0627\u0644\u0645\u0627\u0644 \u0623\u0628\u062f\u0627 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628 \u0628\u0646\u0643\u064a \u0644\u0627 \u062a\u0639\u0631\u0641\u0647",
    t5: "\u0639\u0644\u0627\u0645\u0627\u062a \u062e\u0637\u0631. \u0627\u0646\u0633\u062d\u0628 \u0625\u0630\u0627...",
    t5a: "\u0637\u0644\u0628 \u0627\u0644\u0628\u0627\u0626\u0639 \u0627\u0644\u062f\u0641\u0639 \u0642\u0628\u0644 \u0627\u0644\u0644\u0642\u0627\u0621 \u0623\u0648 \u0642\u0628\u0644 \u0631\u0624\u064a\u0629 \u0627\u0644\u0633\u0644\u0639\u0629",
    t5b: "\u0643\u0627\u0646 \u0627\u0644\u0633\u0639\u0631 \u0645\u0646\u062e\u0641\u0636\u0627 \u0644\u062f\u0631\u062c\u0629 \u0644\u0627 \u062a\u0635\u062f\u0642",
    t5c: "\u0631\u0641\u0636 \u0627\u0644\u0628\u0627\u0626\u0639 \u0627\u0644\u0644\u0642\u0627\u0621 \u0641\u064a \u0645\u0643\u0627\u0646 \u0639\u0627\u0645",
    t5d: "\u0636\u063a\u0637 \u0639\u0644\u064a\u0643 \u0627\u0644\u0628\u0627\u0626\u0639 \u0644\u062a\u0642\u0631\u0631 \u0628\u0633\u0631\u0639\u0629",
    t5e: "\u062d\u0636\u0631 \u0634\u062e\u0635 \u0622\u062e\u0631 \u0628\u062f\u0644\u0627 \u0645\u0646 \u0627\u0644\u0628\u0627\u0626\u0639 \u062f\u0648\u0646 \u0625\u062e\u0628\u0627\u0631\u0643",
    spotsTitle: "\u0623\u0645\u0627\u0643\u0646 \u0644\u0642\u0627\u0621 \u0645\u0642\u062a\u0631\u062d\u0629",
    spotHotelName: "\u0628\u0647\u0648 \u0627\u0644\u0641\u0646\u0627\u062f\u0642 (\u0623\u064a \u0645\u062f\u064a\u0646\u0629)",
    spotPoliceName: "\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0634\u0631\u0637\u0629",
    spotBankName: "\u0627\u0644\u0628\u0646\u0648\u0643 \u0648\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0635\u0631\u0627\u0641 \u0627\u0644\u0622\u0644\u064a",
    kMarket: "\u0633\u0648\u0642",
    kSupermarket: "\u0645\u062a\u062c\u0631 \u0643\u0628\u064a\u0631",
    kBusiness: "\u062d\u064a \u0623\u0639\u0645\u0627\u0644",
    kHotel: "\u0641\u0646\u062f\u0642",
    kOfficial: "\u0631\u0633\u0645\u064a",
    kFinancial: "\u0645\u0627\u0644\u064a",
    escrowTitle: "\u062a\u0634\u062a\u0631\u064a \u0634\u064a\u0626\u0627 \u063a\u0627\u0644\u064a\u0627\u061f \u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0636\u0645\u0627\u0646",
    escrowBody: "\u0636\u0645\u0627\u0646 \u0628\u0627\u0645\u0628\u064a\u0647 \u064a\u062d\u062a\u0641\u0638 \u0628\u062f\u0641\u0639\u062a\u0643 \u062d\u062a\u0649 \u062a\u0624\u0643\u062f \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0633\u0644\u0639\u0629. \u0644\u0627 \u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0648\u0644\u0627 \u0627\u0644\u0628\u0627\u0626\u0639 \u064a\u062a\u062d\u0645\u0644 \u0627\u0644\u062e\u0637\u0631 \u0648\u062d\u062f\u0647.",
    escrowCta: "\u062a\u0639\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0636\u0645\u0627\u0646",
    reportTitle: "\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627\u061f",
    reportBody: "\u0625\u0630\u0627 \u062a\u0639\u0631\u0636\u062a \u0644\u0627\u062d\u062a\u064a\u0627\u0644 \u0623\u0648 \u062a\u0647\u062f\u064a\u062f \u0623\u0648 \u0646\u0635\u0628 \u0641\u0623\u0628\u0644\u063a \u0627\u0644\u0622\u0646. \u0646\u0642\u0631\u0623 \u0643\u0644 \u0628\u0644\u0627\u063a.",
    reportCta: "\u0627\u0644\u0625\u0628\u0644\u0627\u063a \u0639\u0646 \u062d\u0627\u062f\u062b",
  },
  ff: {
    back: "Rutto",
    title: "Fottude e hoolaare",
    subtitle: "Reen hoore maa nde njiilu\u0257aa walla ngeeyaa e juu\u0257e",
    checklistTitle: "\u01b3eewndo ra\u0253\u0253i\u0257\u0257o",
    c1: "Fottee nokku jamaanu, ka ndaygu woni",
    c2: "Haalan ne\u0257\u0257o mo hool\u0257aa to njahataa",
    c3: "Ndaaru ge\u0257al ngal ado maa yo\u0253de",
    c4: "Limtu kaalisi walla \u01b4eewto yo\u0253di telefon",
    c5: "Hoolo miijo maa. Si huunde nanndaani, yaltu",
    t1: "Fottee nokku jamaanu",
    t1a: "Su\u0253o nokkuuji \u0257i yim\u0253e heewi: marse maw\u0257i, sentar, banke",
    t1b: "Wo\u0257\u0257o laabi \u0257i yim\u0253e alaa, nokku otooji, e suudu maa",
    t1c: "Nokkuuji mo\u01b4\u01b4i: luumo hakkundeejo, sentar coodirdu, hall otel",
    t1d: "Fottee \u00f1alorma so waawi",
    t2: "Adda ne\u0257\u0257o mo hool\u0257aa",
    t2a: "Haalan sahaa kala ne\u0257\u0257o to njahataa e mo poti fottude",
    t2b: "So ge\u0257al ngal ina tii\u0257i coggu, adda sehil walla musi\u0257\u0257o",
    t2c: "Hollu innde njeeyoowo e chat Bambeh ne\u0257\u0257o mo hool\u0257aa",
    t2d: "Noddu ne\u0257\u0257o oon kadi so njulaagu ngu gasii",
    t3: "\u01b3eewto ge\u0257al ngal ado maa yo\u0253de",
    t3a: "Hu\u0253\u0253in kuutor\u0257e elektoronik \u0257e njarribo-\u0257aa golle majje fof",
    t3b: "Ndaaru no feewi bonannde nde nate collitaani",
    t3c: "So ko oto, \u01b4eewto motoor, penndeeji e kaayitaaji fof",
    t3d: "Hoto yo\u0253 haa welaa e ge\u0257al ngal",
    t4: "Yo\u0253 e hoolaare",
    t4a: "Limtu kaalisi ado maa hokkude",
    t4b: "\u0181uri mo\u01b4\u01b4ude MTN MoMo walla Orange Money ngam winndannde heddoo",
    t4c: "Huutoro Bambeh Escrow ngam ge\u0257e tii\u0257\u0257e coggu. Min njoggoto kaalisi haa tee\u014btinaa ko ke\u0253-\u0257aa",
    t4d: "Hoto neldu kaalisi e konte banke mo anndaa",
    t5: "Maandeeji bone. Yaltu si...",
    t5a: "Njeeyoowo ina naamnoo yo\u0253de ado on fottude walla ado a yiide ge\u0257al",
    t5b: "Coggu ngu \u0253uri fam\u0257ude no feewi haa nanndaani goonga",
    t5c: "Njeeyoowo salii fottude nokku jamaanu",
    t5d: "Njeeyoowo ina yaawnina ma nde cu\u0253oto-\u0257aa",
    t5e: "Ne\u0257\u0257o go\u0257\u0257o ari e lontagol njeeyoowo tawa haalanaaka ma",
    spotsTitle: "Nokkuuji fottir\u0257i \u0257i min cu\u0253i",
    spotHotelName: "Hall otel (wuro kala)",
    spotPoliceName: "Posto polis",
    spotBankName: "Banke e nokku ATM",
    kMarket: "Luumo",
    kSupermarket: "Marse maw\u0257o",
    kBusiness: "Nokku njulaagu",
    kHotel: "Otel",
    kOfficial: "Laamu",
    kFinancial: "Kaalisi",
    escrowTitle: "Ada soodda ge\u0257al tii\u0257ngal? Huutoro Escrow",
    escrowBody: "Bambeh Escrow ina jogoo kaalisi maa haa tee\u014btinaa ko ke\u0253-\u0257aa ge\u0257al ngal. Coodoowo e njeeyoowo, gooto fof roondotaako bone tan.",
    escrowCta: "Anndu ko Escrow woni",
    reportTitle: "Huunde bonnde wa\u0257ii?",
    reportBody: "So a he\u0253ii nguyka, kulhuli walla janfa, wiitu jooni. Min njanngata wiitannde kala.",
    reportCta: "Wiitu bone",
  },
};

type TL = typeof T.en;

export default function MeetSafelyPage() {
  const navigate = useNavigate();
  const raw = useLang() as string;
  const langKey = raw === 'fulfulde' ? 'ff' : raw === 'pcm' ? 'pidgin' : raw === 'ful' ? 'ff' : raw;
  const t: TL = (T as Record<string, TL>)[langKey] ?? T.en;
  const isRtl = langKey === 'ar';

  const CHECKS = [t.c1, t.c2, t.c3, t.c4, t.c5];

  const TIPS = [
    {
      icon: <MapPin className="w-5 h-5 text-teal-600" />,
      title: t.t1,
      color: 'bg-teal-50 border-teal-200',
      points: [t.t1a, t.t1b, t.t1c, t.t1d],
    },
    {
      icon: <Users className="w-5 h-5 text-blue-600" />,
      title: t.t2,
      color: 'bg-blue-50 border-blue-200',
      points: [t.t2a, t.t2b, t.t2c, t.t2d],
    },
    {
      icon: <Camera className="w-5 h-5 text-purple-600" />,
      title: t.t3,
      color: 'bg-purple-50 border-purple-200',
      points: [t.t3a, t.t3b, t.t3c, t.t3d],
    },
    {
      icon: <Phone className="w-5 h-5 text-green-600" />,
      title: t.t4,
      color: 'bg-green-50 border-green-200',
      points: [t.t4a, t.t4b, t.t4c, t.t4d],
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      title: t.t5,
      color: 'bg-red-50 border-red-200',
      points: [t.t5a, t.t5b, t.t5c, t.t5d, t.t5e],
    },
  ];

  const SAFE_SPOTS = [
    { name: "March\u00e9 Central, Yaound\u00e9", type: t.kMarket },
    { name: "Auchan, Yaound\u00e9",              type: t.kSupermarket },
    { name: "Akwa, Douala",                     type: t.kBusiness },
    { name: t.spotHotelName,                    type: t.kHotel },
    { name: t.spotPoliceName,                   type: t.kOfficial },
    { name: t.spotBankName,                     type: t.kFinancial },
  ];

  return (
    <div
      className="min-h-screen bg-gray-50 pb-10 notranslate"
      translate="no"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 pt-6 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-teal-100 hover:text-white mb-4 text-sm"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {t.back}
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-teal-100 text-sm">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Quick checklist */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" /> {t.checklistTitle}
          </h2>
          <div className="space-y-2">
            {CHECKS.map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                </div>
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed tips */}
        {TIPS.map((tip, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${tip.color}`}>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              {tip.icon} {tip.title}
            </h3>
            <ul className="space-y-1.5">
              {tip.points.map((point, j) => (
                <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Suggested meeting spots */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" /> {t.spotsTitle}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {SAFE_SPOTS.map((spot, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{spot.name}</p>
                <p className="text-xs text-teal-600 mt-0.5">{spot.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Escrow */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-3">
            <Shield className="w-8 h-8 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg mb-1">{t.escrowTitle}</h3>
              <p className="text-teal-100 text-sm mb-3">{t.escrowBody}</p>
              <button
                onClick={() => navigate('/escrow')}
                className="bg-white text-teal-700 font-bold px-4 py-2 rounded-xl text-sm"
              >
                {t.escrowCta}
              </button>
            </div>
          </div>
        </div>

        {/* Report */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="font-bold text-red-800 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> {t.reportTitle}
          </h3>
          <p className="text-sm text-red-700 mb-3">{t.reportBody}</p>
          <button
            onClick={() => navigate('/report-issue')}
            className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold"
          >
            {t.reportCta}
          </button>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__MEETSAFELYPAGE_FIX401__COMPLETE
