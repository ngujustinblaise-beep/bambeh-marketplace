// BAMBEH_DEPLOY_TOKEN__SAFETY_BUTTON_FIX750_CLEAN
/**
 * src/features/safety/SafetyButton.tsx - FIX750 (was FIX733)
 *   route: /safety-button   (no account needed; on the Home free row, on every women's health page
 *                            and on the free account card)
 *
 * THE SAFETY BUTTON. Big, 12 Oct 2026: "panic button and safety button can be done ... GBV should
 * point to security numbers".
 *   - SEND ALERT: one tap finds where she is (if the phone allows it) and opens her SMS app with a
 *     message ready for every person she trusts: "HELP. I am in danger ... my location ... call me,
 *     or call the police on 117 or the gendarmerie on 113". She presses Send. A web page cannot
 *     send an SMS by itself, and an SMS needs no data - only airtime. WhatsApp is offered too
 *     (it needs data). If the SMS app does not open, a link and one SMS per person are shown.
 *   - CALL NOW: police 117, gendarmerie 113 (violence points here first), ambulance (SAMU) 119,
 *     fire brigade 118, 1511 (gender-based violence, someone to listen), 116 (violence against a
 *     child).
 *   - THE PEOPLE SHE TRUSTS (up to five) are kept ONLY on this phone (localStorage). Bambeh never
 *     receives them or the alert. "Delete everything from this phone" wipes them.
 *   - A short safety plan, and QUICK EXIT (google.com on the website, the Marketplace in the app).
 * Nothing here is stored on Bambeh's servers, so no health or violence data leaves the phone
 * (Law 2024/017).
 *
 * FIX750 (14 Oct 2026): a yellow TAXI CHECK card under the call buttons opens /taxi-check (FIX748:
 * scan a Yaounde taxi's QR code and send the taxi's details to the same trusted people).
 * savePeople is exported so Taxi check adds people to this same list - one list, kept on the phone.
 * In Arabic the phone example is now digits only: in the left-to-right number field the Arabic word
 * for "e.g." showed back to front.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, ChevronLeft, ChevronRight, Loader2, MapPin, MessageCircle, Phone, ShieldAlert, Siren, Trash2, UserPlus, X } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
function normLang(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

type Key = 'title' | 'intro' | 'send' | 'sendSub' | 'needPeople' | 'locating' | 'noLoc' | 'opened' | 'openSms' | 'eachTitle'
  | 'whatsapp' | 'callTitle' | 'police' | 'gendarmerie' | 'samu' | 'fire' | 'gbv' | 'child' | 'peopleTitle' | 'peopleHelp'
  | 'name' | 'namePh' | 'phone' | 'phonePh' | 'add' | 'remove' | 'badPhone' | 'badName' | 'full' | 'already' | 'wipe'
  | 'wipeConfirm' | 'wiped' | 'planTitle' | 'plan1' | 'plan2' | 'plan3' | 'plan4' | 'plan5' | 'privacy' | 'back'
  | 'quickExit' | 'quickExitHelp' | 'alertLoc' | 'alertNoLoc' | 'taxiTitle' | 'taxiSub';

const TEXT: Record<Lang, Record<Key, string>> = {
  en: {
    title: 'Safety button',
    intro: 'In danger now? Call the police (117) or the gendarmerie (113). The red button sends an SMS with where you are to the people you trust.',
    send: 'SEND ALERT',
    sendSub: 'SMS with your location to the people you trust',
    needPeople: 'First add at least one person you trust, below. You can call 117 or 113 right now.',
    locating: 'Finding where you are...',
    noLoc: 'Your location could not be found - the message goes without it.',
    opened: 'Your SMS app should now be open with the message ready: press Send.',
    openSms: 'Open the SMS again',
    eachTitle: 'Or send it to one person at a time:',
    whatsapp: 'Send on WhatsApp instead (needs data)',
    callTitle: 'Call now',
    police: 'Police',
    gendarmerie: 'Gendarmerie',
    samu: 'Ambulance (SAMU)',
    fire: 'Fire brigade',
    gbv: 'Violence - someone to listen',
    child: 'Violence against a child',
    peopleTitle: 'The people I trust',
    peopleHelp: 'Saved only on this phone. Bambeh never sees them.',
    name: 'Name',
    namePh: 'e.g. My sister Grace',
    phone: 'Phone number',
    phonePh: 'e.g. 677 12 34 56',
    add: 'Add',
    remove: 'Remove',
    badPhone: 'Write a phone number: 9 digits for Cameroon (starting with 6 or 2), or + and the country code.',
    badName: 'Write a name (1 to 40 letters).',
    full: 'Five people at most.',
    already: 'This number is already in your list.',
    wipe: 'Delete everything from this phone',
    wipeConfirm: 'Delete the people you trust from this phone?',
    wiped: 'Deleted from this phone.',
    planTitle: 'Be ready - a safety plan',
    plan1: 'Know a safe place you can go: a neighbour, family, a church or a mosque, a police station.',
    plan2: 'Agree a code word with someone you trust: when they hear it, they call 117 or 113.',
    plan3: 'Keep your ID card, some money, your phone and its charger where you can take them quickly.',
    plan4: 'Save 117, 113 and 1511 in your phone.',
    plan5: 'If you were hurt or forced to have sex, go to a health centre quickly: some care works best within 3 days.',
    privacy: 'Bambeh does not receive your alert and does not keep the people you trust. The SMS leaves from your phone with your airtime; WhatsApp uses your data.',
    back: 'Back',
    quickExit: 'Quick exit',
    quickExitHelp: 'Leave this page at once',
    alertLoc: 'HELP. I am in danger and I need you. My location: {link} (at {time}). Please call me, or call the police on 117 or the gendarmerie on 113.',
    alertNoLoc: 'HELP. I am in danger and I need you. I could not send my location. Please call me, or call the police on 117 or the gendarmerie on 113.',
    taxiTitle: 'Taxi check',
    taxiSub: 'Before you get into a taxi: scan its code and send its details to the people you trust.',
  },
  fr: {
    title: 'Bouton de s\u00e9curit\u00e9',
    intro: 'En danger maintenant ? Appelez la police (117) ou la gendarmerie (113). Le bouton rouge envoie un SMS avec l\u2019endroit o\u00f9 vous \u00eates aux personnes de confiance.',
    send: 'ENVOYER L\u2019ALERTE',
    sendSub: 'SMS avec votre position aux personnes de confiance',
    needPeople: 'Ajoutez d\u2019abord au moins une personne de confiance, plus bas. Vous pouvez appeler le 117 ou le 113 tout de suite.',
    locating: 'Recherche de votre position...',
    noLoc: 'Votre position n\u2019a pas pu \u00eatre trouv\u00e9e : le message part sans elle.',
    opened: 'Votre application SMS devrait \u00eatre ouverte avec le message pr\u00eat : appuyez sur Envoyer.',
    openSms: 'Rouvrir le SMS',
    eachTitle: 'Ou envoyez-le \u00e0 une personne \u00e0 la fois :',
    whatsapp: 'Envoyer plut\u00f4t sur WhatsApp (avec des donn\u00e9es)',
    callTitle: 'Appeler maintenant',
    police: 'Police',
    gendarmerie: 'Gendarmerie',
    samu: 'Ambulance (SAMU)',
    fire: 'Sapeurs-pompiers',
    gbv: 'Violences - une \u00e9coute',
    child: 'Violences sur un enfant',
    peopleTitle: 'Mes personnes de confiance',
    peopleHelp: 'Enregistr\u00e9es uniquement sur ce t\u00e9l\u00e9phone. Bambeh ne les voit jamais.',
    name: 'Nom',
    namePh: 'ex. Ma s\u0153ur Grace',
    phone: 'Num\u00e9ro de t\u00e9l\u00e9phone',
    phonePh: 'ex. 677 12 34 56',
    add: 'Ajouter',
    remove: 'Retirer',
    badPhone: '\u00c9crivez un num\u00e9ro : 9 chiffres pour le Cameroun (commen\u00e7ant par 6 ou 2), ou + et l\u2019indicatif du pays.',
    badName: '\u00c9crivez un nom (1 \u00e0 40 lettres).',
    full: 'Cinq personnes au maximum.',
    already: 'Ce num\u00e9ro est d\u00e9j\u00e0 dans votre liste.',
    wipe: 'Tout effacer de ce t\u00e9l\u00e9phone',
    wipeConfirm: 'Effacer vos personnes de confiance de ce t\u00e9l\u00e9phone ?',
    wiped: 'Effac\u00e9 de ce t\u00e9l\u00e9phone.',
    planTitle: 'Soyez pr\u00eate - un plan de s\u00e9curit\u00e9',
    plan1: 'Sachez o\u00f9 aller en s\u00e9curit\u00e9 : une voisine, la famille, une \u00e9glise ou une mosqu\u00e9e, un poste de police.',
    plan2: 'Convenez d\u2019un mot de code avec une personne de confiance : en l\u2019entendant, elle appelle le 117 ou le 113.',
    plan3: 'Gardez votre carte d\u2019identit\u00e9, un peu d\u2019argent, votre t\u00e9l\u00e9phone et son chargeur \u00e0 port\u00e9e de main.',
    plan4: 'Enregistrez le 117, le 113 et le 1511 dans votre t\u00e9l\u00e9phone.',
    plan5: 'Si vous avez \u00e9t\u00e9 bless\u00e9e ou forc\u00e9e \u00e0 avoir un rapport, allez vite dans un centre de sant\u00e9 : certains soins sont plus efficaces dans les 3 jours.',
    privacy: 'Bambeh ne re\u00e7oit pas votre alerte et ne garde pas vos personnes de confiance. Le SMS part de votre t\u00e9l\u00e9phone avec votre cr\u00e9dit ; WhatsApp utilise vos donn\u00e9es.',
    back: 'Retour',
    quickExit: 'Sortie rapide',
    quickExitHelp: 'Quitter cette page tout de suite',
    alertLoc: 'AU SECOURS. Je suis en danger et j\u2019ai besoin de toi. Ma position : {link} (\u00e0 {time}). Appelle-moi, ou appelle la police au 117 ou la gendarmerie au 113.',
    alertNoLoc: 'AU SECOURS. Je suis en danger et j\u2019ai besoin de toi. Je n\u2019ai pas pu envoyer ma position. Appelle-moi, ou appelle la police au 117 ou la gendarmerie au 113.',
    taxiTitle: 'V\u00e9rifier mon taxi',
    taxiSub: 'Avant de monter dans un taxi : scannez son code et envoyez ses d\u00e9tails \u00e0 vos personnes de confiance.',
  },
  pidgin: {
    title: 'Safety button',
    intro: 'Danger dey now? Call police (117) or gendarmerie (113). The red button go send SMS with the place weh you dey to people weh you trust.',
    send: 'SEND ALERT',
    sendSub: 'SMS with your location to people weh you trust',
    needPeople: 'First add at least one person weh you trust, for down. You fit call 117 or 113 now now.',
    locating: 'We di find the place weh you dey...',
    noLoc: 'We no fit find your location - the message go go without am.',
    opened: 'Your SMS app suppose open now with the message ready: press Send.',
    openSms: 'Open the SMS again',
    eachTitle: 'Or send am to one person one by one:',
    whatsapp: 'Send for WhatsApp instead (e need data)',
    callTitle: 'Call now',
    police: 'Police',
    gendarmerie: 'Gendarmerie',
    samu: 'Ambulance (SAMU)',
    fire: 'Fire service',
    gbv: 'Violence - person weh go listen you',
    child: 'Violence against pikin',
    peopleTitle: 'People weh I trust',
    peopleHelp: 'E dey only for this phone. Bambeh no di ever see dem.',
    name: 'Name',
    namePh: 'e.g. My sister Grace',
    phone: 'Phone number',
    phonePh: 'e.g. 677 12 34 56',
    add: 'Add',
    remove: 'Remove',
    badPhone: 'Write phone number: 9 numbers for Cameroon (start with 6 or 2), or + and the country code.',
    badName: 'Write name (1 to 40 letters).',
    full: 'Five people na the maximum.',
    already: 'This number don already dey your list.',
    wipe: 'Delete everything from this phone',
    wipeConfirm: 'Delete the people weh you trust from this phone?',
    wiped: 'E don delete from this phone.',
    planTitle: 'Make you ready - safety plan',
    plan1: 'Know safe place weh you fit go: neighbour, family, church or mosque, police station.',
    plan2: 'Agree one code word with person weh you trust: when e hear am, e go call 117 or 113.',
    plan3: 'Keep your ID card, small money, your phone and the charger for place weh you fit carry dem quick.',
    plan4: 'Save 117, 113 and 1511 for your phone.',
    plan5: 'If dem wound you or force you for sex, go health centre quick: some treatment di work best inside 3 days.',
    privacy: 'Bambeh no di receive your alert and e no di keep the people weh you trust. The SMS di commot from your phone with your credit; WhatsApp di use your data.',
    back: 'Back',
    quickExit: 'Quick exit',
    quickExitHelp: 'Commot for this page quick quick',
    alertLoc: 'HELP. I dey for danger and I need you. My location: {link} (for {time}). Abeg call me, or call police for 117 or gendarmerie for 113.',
    alertNoLoc: 'HELP. I dey for danger and I need you. I no fit send my location. Abeg call me, or call police for 117 or gendarmerie for 113.',
    taxiTitle: 'Check your taxi',
    taxiSub: 'Before you enter taxi: scan the code and send the details to the people weh you trust.',
  },
  ar: {
    title: '\u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646',
    intro: '\u0641\u064a \u062e\u0637\u0631 \u0627\u0644\u0622\u0646\u061f \u0627\u062a\u0635\u0644 \u0628\u0627\u0644\u0634\u0631\u0637\u0629 (117) \u0623\u0648 \u0628\u0627\u0644\u062f\u0631\u0643 (113). \u0627\u0644\u0632\u0631 \u0627\u0644\u0623\u062d\u0645\u0631 \u064a\u0631\u0633\u0644 \u0631\u0633\u0627\u0644\u0629 \u0642\u0635\u064a\u0631\u0629 \u0628\u0645\u0643\u0627\u0646\u0643 \u0625\u0644\u0649 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645.',
    send: '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062a\u0646\u0628\u064a\u0647',
    sendSub: '\u0631\u0633\u0627\u0644\u0629 \u0642\u0635\u064a\u0631\u0629 \u0628\u0645\u0648\u0642\u0639\u0643 \u0625\u0644\u0649 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645',
    needPeople: '\u0623\u0636\u0641 \u0623\u0648\u0644\u064b\u0627 \u0634\u062e\u0635\u064b\u0627 \u0648\u0627\u062d\u062f\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u062a\u062b\u0642 \u0628\u0647\u060c \u0641\u064a \u0627\u0644\u0623\u0633\u0641\u0644. \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u0631\u0642\u0645 117 \u0623\u0648 113 \u0627\u0644\u0622\u0646.',
    locating: '\u062c\u0627\u0631\u064d \u062a\u062d\u062f\u064a\u062f \u0645\u0643\u0627\u0646\u0643...',
    noLoc: '\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639\u0643 - \u0633\u062a\u064f\u0631\u0633\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0628\u062f\u0648\u0646\u0647.',
    opened: '\u064a\u064f\u0641\u062a\u0631\u0636 \u0623\u0646 \u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0645\u0641\u062a\u0648\u062d \u0627\u0644\u0622\u0646 \u0648\u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u062c\u0627\u0647\u0632\u0629: \u0627\u0636\u063a\u0637 \u0625\u0631\u0633\u0627\u0644.',
    openSms: '\u0627\u0641\u062a\u062d \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
    eachTitle: '\u0623\u0648 \u0623\u0631\u0633\u0644\u0647\u0627 \u0625\u0644\u0649 \u0634\u062e\u0635 \u0648\u0627\u062d\u062f \u0641\u064a \u0643\u0644 \u0645\u0631\u0629:',
    whatsapp: '\u0623\u0631\u0633\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643 (\u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0628\u064a\u0627\u0646\u0627\u062a)',
    callTitle: '\u0627\u062a\u0635\u0644 \u0627\u0644\u0622\u0646',
    police: '\u0627\u0644\u0634\u0631\u0637\u0629',
    gendarmerie: '\u0627\u0644\u062f\u0631\u0643',
    samu: '\u0627\u0644\u0625\u0633\u0639\u0627\u0641 (SAMU)',
    fire: '\u0627\u0644\u0625\u0637\u0641\u0627\u0621',
    gbv: '\u0627\u0644\u0639\u0646\u0641 - \u0645\u0646 \u064a\u0633\u062a\u0645\u0639 \u0625\u0644\u064a\u0643',
    child: '\u0627\u0644\u0639\u0646\u0641 \u0636\u062f \u0637\u0641\u0644',
    peopleTitle: '\u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0627\u0644\u0630\u064a\u0646 \u0623\u062b\u0642 \u0628\u0647\u0645',
    peopleHelp: '\u0645\u062d\u0641\u0648\u0638\u0648\u0646 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641 \u0641\u0642\u0637. \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0627 \u064a\u0631\u0627\u0647\u0645 \u0623\u0628\u062f\u064b\u0627.',
    name: '\u0627\u0644\u0627\u0633\u0645',
    namePh: '\u0645\u062b\u0627\u0644: \u0623\u062e\u062a\u064a \u063a\u0631\u064a\u0633',
    phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
    phonePh: '677 12 34 56', // FIX750: digits only - the field is left-to-right
    add: '\u0625\u0636\u0627\u0641\u0629',
    remove: '\u0625\u0632\u0627\u0644\u0629',
    badPhone: '\u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641: 9 \u0623\u0631\u0642\u0627\u0645 \u0644\u0644\u0643\u0627\u0645\u064a\u0631\u0648\u0646 (\u064a\u0628\u062f\u0623 \u0628\u0640 6 \u0623\u0648 2)\u060c \u0623\u0648 + \u0648\u0631\u0645\u0632 \u0627\u0644\u0628\u0644\u062f.',
    badName: '\u0627\u0643\u062a\u0628 \u0627\u0633\u0645\u064b\u0627 (\u0645\u0646 1 \u0625\u0644\u0649 40 \u062d\u0631\u0641\u064b\u0627).',
    full: '\u062e\u0645\u0633\u0629 \u0623\u0634\u062e\u0627\u0635 \u0643\u062d\u062f \u0623\u0642\u0635\u0649.',
    already: '\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u0645\u0648\u062c\u0648\u062f \u0628\u0627\u0644\u0641\u0639\u0644 \u0641\u064a \u0642\u0627\u0626\u0645\u062a\u0643.',
    wipe: '\u0627\u062d\u0630\u0641 \u0643\u0644 \u0634\u064a\u0621 \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641',
    wipeConfirm: '\u062d\u0630\u0641 \u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0627\u0644\u0630\u064a\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645 \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641\u061f',
    wiped: '\u062a\u0645 \u0627\u0644\u062d\u0630\u0641 \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641.',
    planTitle: '\u0643\u0646 \u0645\u0633\u062a\u0639\u062f\u064b\u0627 - \u062e\u0637\u0629 \u0623\u0645\u0627\u0646',
    plan1: '\u0627\u0639\u0631\u0641 \u0645\u0643\u0627\u0646\u064b\u0627 \u0622\u0645\u0646\u064b\u0627 \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0630\u0647\u0627\u0628 \u0625\u0644\u064a\u0647: \u062c\u0627\u0631\u0629\u060c \u0627\u0644\u0639\u0627\u0626\u0644\u0629\u060c \u0643\u0646\u064a\u0633\u0629 \u0623\u0648 \u0645\u0633\u062c\u062f\u060c \u0645\u0631\u0643\u0632 \u0634\u0631\u0637\u0629.',
    plan2: '\u0627\u062a\u0641\u0642 \u0639\u0644\u0649 \u0643\u0644\u0645\u0629 \u0633\u0631 \u0645\u0639 \u0634\u062e\u0635 \u062a\u062b\u0642 \u0628\u0647: \u0639\u0646\u062f\u0645\u0627 \u064a\u0633\u0645\u0639\u0647\u0627 \u064a\u062a\u0635\u0644 \u0628\u0627\u0644\u0631\u0642\u0645 117 \u0623\u0648 113.',
    plan3: '\u0627\u062d\u062a\u0641\u0638 \u0628\u0628\u0637\u0627\u0642\u0629 \u0647\u0648\u064a\u062a\u0643 \u0648\u0628\u0639\u0636 \u0627\u0644\u0645\u0627\u0644 \u0648\u0647\u0627\u062a\u0641\u0643 \u0648\u0634\u0627\u062d\u0646\u0647 \u0641\u064a \u0645\u0643\u0627\u0646 \u064a\u0645\u0643\u0646\u0643 \u0623\u062e\u0630\u0647\u0627 \u0645\u0646\u0647 \u0628\u0633\u0631\u0639\u0629.',
    plan4: '\u0627\u062d\u0641\u0638 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 117 \u0648113 \u06481511 \u0641\u064a \u0647\u0627\u062a\u0641\u0643.',
    plan5: '\u0625\u0630\u0627 \u062a\u0639\u0631\u0636\u062a \u0644\u0644\u0623\u0630\u0649 \u0623\u0648 \u0623\u064f\u062c\u0628\u0631\u062a \u0639\u0644\u0649 \u0639\u0644\u0627\u0642\u0629 \u062c\u0646\u0633\u064a\u0629\u060c \u0627\u0630\u0647\u0628 \u0628\u0633\u0631\u0639\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0635\u062d\u064a: \u0628\u0639\u0636 \u0627\u0644\u0639\u0644\u0627\u062c\u0627\u062a \u062a\u0643\u0648\u0646 \u0623\u0643\u062b\u0631 \u0641\u0639\u0627\u0644\u064a\u0629 \u062e\u0644\u0627\u0644 3 \u0623\u064a\u0627\u0645.',
    privacy: '\u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0627 \u064a\u0633\u062a\u0642\u0628\u0644 \u062a\u0646\u0628\u064a\u0647\u0643 \u0648\u0644\u0627 \u064a\u062d\u062a\u0641\u0638 \u0628\u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0627\u0644\u0630\u064a\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645. \u062a\u064f\u0631\u0633\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0642\u0635\u064a\u0631\u0629 \u0645\u0646 \u0647\u0627\u062a\u0641\u0643 \u0628\u0631\u0635\u064a\u062f\u0643\u061b \u0648\u064a\u0633\u062a\u062e\u062f\u0645 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u064a\u0627\u0646\u0627\u062a\u0643.',
    back: '\u0631\u062c\u0648\u0639',
    quickExit: '\u062e\u0631\u0648\u062c \u0633\u0631\u064a\u0639',
    quickExitHelp: '\u0645\u063a\u0627\u062f\u0631\u0629 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0641\u0648\u0631\u064b\u0627',
    alertLoc: '\u0627\u0644\u0646\u062c\u062f\u0629. \u0623\u0646\u0627 \u0641\u064a \u062e\u0637\u0631 \u0648\u0623\u062d\u062a\u0627\u062c\u0643. \u0645\u0648\u0642\u0639\u064a: {link} (\u0627\u0644\u0633\u0627\u0639\u0629 {time}). \u0627\u062a\u0635\u0644 \u0628\u064a\u060c \u0623\u0648 \u0627\u062a\u0635\u0644 \u0628\u0627\u0644\u0634\u0631\u0637\u0629 \u0639\u0644\u0649 117 \u0623\u0648 \u0628\u0627\u0644\u062f\u0631\u0643 \u0639\u0644\u0649 113.',
    alertNoLoc: '\u0627\u0644\u0646\u062c\u062f\u0629. \u0623\u0646\u0627 \u0641\u064a \u062e\u0637\u0631 \u0648\u0623\u062d\u062a\u0627\u062c\u0643. \u0644\u0645 \u0623\u0633\u062a\u0637\u0639 \u0625\u0631\u0633\u0627\u0644 \u0645\u0648\u0642\u0639\u064a. \u0627\u062a\u0635\u0644 \u0628\u064a\u060c \u0623\u0648 \u0627\u062a\u0635\u0644 \u0628\u0627\u0644\u0634\u0631\u0637\u0629 \u0639\u0644\u0649 117 \u0623\u0648 \u0628\u0627\u0644\u062f\u0631\u0643 \u0639\u0644\u0649 113.',
    taxiTitle: '\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0633\u064a\u0627\u0631\u0629 \u0627\u0644\u0623\u062c\u0631\u0629',
    taxiSub: '\u0642\u0628\u0644 \u0623\u0646 \u062a\u0631\u0643\u0628 \u0633\u064a\u0627\u0631\u0629 \u0623\u062c\u0631\u0629: \u0627\u0645\u0633\u062d \u0631\u0645\u0632\u0647\u0627 \u0648\u0623\u0631\u0633\u0644 \u0628\u064a\u0627\u0646\u0627\u062a\u0647\u0627 \u0625\u0644\u0649 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645.',
  },
  ff: {
    title: 'Buto\u014b kisal',
    intro: 'A ina e ca\u0257eele jooni? Noddu polis (117) walla jandarmeri (113). Buto\u014b bo\u0257eewo oo ina neldoo SMS e nokku mo ngon\u0257aa to yim\u0253e \u0253e hooloto\u0257aa.',
    send: 'NELDU JEERTINOL',
    sendSub: 'SMS e nokku maa to yim\u0253e \u0253e hooloto\u0257aa',
    needPeople: 'Adii fof, \u0253eydu hay ne\u0257\u0257o gooto mo hooloto\u0257aa, les. A waawii noddude 117 walla 113 jooni jooni.',
    locating: 'Ina yiyloo nokku mo ngon\u0257aa...',
    noLoc: 'Nokku maa he\u0253aaka - mesaas oo ina yaha tawa alaa \u0257um.',
    opened: 'Aplikasiyo\u014b SMS maa foti udditaade jooni, mesaas oo ina hebli: \u00f1o\u01b4\u01b4u Neldu.',
    openSms: 'Uddit SMS oo kadi',
    eachTitle: 'Walla neldu \u0257um ne\u0257\u0257o e ne\u0257\u0257o:',
    whatsapp: 'Neldu e WhatsApp kanjum (ina sokli data)',
    callTitle: 'Noddu jooni',
    police: 'Polis',
    gendarmerie: 'Jandarmeri',
    samu: 'Ambulance (SAMU)',
    fire: 'Pompiers',
    gbv: 'Torra - ne\u0257\u0257o he\u0257oowo ma',
    child: 'Torra \u0253i\u0257\u0257o',
    peopleTitle: 'Yim\u0253e \u0253e mi hooli',
    peopleHelp: '\u0181e danndaa e ndee telefon tan. Bambeh yiyataa \u0253e fey.',
    name: 'Innde',
    namePh: 'mbaydi: Neene am Grace',
    phone: 'Limoore telefon',
    phonePh: 'mbaydi: 677 12 34 56',
    add: '\u0181eydu',
    remove: 'Momtu',
    badPhone: 'Winndu limoore telefon: limooje 9 wonande Kameruun (fu\u0257\u0257oowe e 6 walla 2), walla + e limoore leydi.',
    badName: 'Winndu innde (alkule 1 haa 40).',
    full: 'Yim\u0253e joy tan \u0253uri.',
    already: 'Ndee limoore ina woodi e doggol maa tawo.',
    wipe: 'Momtu fof e ndee telefon',
    wipeConfirm: 'Momtu yim\u0253e \u0253e hooloto\u0257aa e ndee telefon?',
    wiped: 'Momtaama e ndee telefon.',
    planTitle: 'He\u0253tino - plan kisal',
    plan1: 'Andu nokku kisal mo mbaaw\u0257aa yahde: ko\u0257o maa, \u0253esngu maa, egliis walla jumaa, poste polis.',
    plan2: 'Ja\u0253ondir e ne\u0257\u0257o mo hooloto\u0257aa konngol siirlu: so o nani \u0257um, o noddat 117 walla 113.',
    plan3: 'Danndu karte identite maa, ceede see\u0257a, telefon maa e chargeur mum to mbaaw\u0257aa \u01b4ettude \u0257um law.',
    plan4: 'Danndu 117, 113 e 1511 e telefon maa.',
    plan5: 'So a gaa\u00f1aama walla a doolnaama waaldugol, yah law e nokkuure safaara: safaaraaji go\u0257\u0257i \u0253uri nafde nder \u00f1al\u0257e 3.',
    privacy: 'Bambeh he\u0253ataa jeertinol maa, danndataa yim\u0253e \u0253e hooloto\u0257aa. SMS oo ina yalta e telefon maa e kredit maa; WhatsApp ina huutoroo data maa.',
    back: 'Rutto',
    quickExit: 'Yaltu law',
    quickExitHelp: 'Yaltu e ngol hello jooni jooni',
    alertLoc: 'BALLAL. Mi ina e ca\u0257eele, mi sokli ma. Nokku am: {link} (waktu {time}). Noddu kam, walla noddu polis e 117 walla jandarmeri e 113.',
    alertNoLoc: 'BALLAL. Mi ina e ca\u0257eele, mi sokli ma. Mi waawaa neldude nokku am. Noddu kam, walla noddu polis e 117 walla jandarmeri e 113.',
    taxiTitle: '\u01b3eew taksi maa',
    taxiSub: 'Adii naataa taksi: \u01b4eewnu kod mum, neldu humpito mum to yim\u0253e \u0253e hooloto\u0257aa.',
  },
};

/** The numbers on the page - the same national short codes as the Safety alerts page. Violence: 117 and 113 first. */
export const SAFETY_LINES: ReadonlyArray<{ code: string; key: Key; strong: boolean }> = [
  { code: '117', key: 'police', strong: true },
  { code: '113', key: 'gendarmerie', strong: true },
  { code: '119', key: 'samu', strong: false },
  { code: '118', key: 'fire', strong: false },
  { code: '1511', key: 'gbv', strong: false },
  { code: '116', key: 'child', strong: false },
];

export interface TrustedPerson { name: string; phone: string }

/** Kept ONLY on this phone. */
export const PEOPLE_KEY = 'bambeh_safety_people';
export const MAX_PEOPLE = 5;

export function loadPeople(): TrustedPerson[] {
  try {
    const raw = window.localStorage.getItem(PEOPLE_KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(v)) return [];
    return (v as Array<Partial<TrustedPerson>>)
      .filter((p) => p && typeof p.name === 'string' && typeof p.phone === 'string' && normPhone(p.phone) !== null)
      .slice(0, MAX_PEOPLE)
      .map((p) => ({ name: String(p.name).slice(0, 40), phone: normPhone(String(p.phone)) as string }));
  } catch {
    return [];
  }
}

/** FIX750 - exported: Taxi check (FIX748) adds people to this same list. */
export function savePeople(list: TrustedPerson[]): boolean {
  try {
    if (list.length === 0) window.localStorage.removeItem(PEOPLE_KEY);
    else window.localStorage.setItem(PEOPLE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/** A number she can text: Cameroon 9 digits (6.. or 2..) -> +237..., or an international +country number. */
export function normPhone(raw: string): string | null {
  const s = String(raw || '').trim().replace(/[\s.()/-]/g, '');
  if (/^(\+|00)\d{8,15}$/.test(s)) {
    const d = s.replace(/^(\+|00)/, '');
    if (/^237/.test(d) && !/^237[26]\d{8}$/.test(d)) return null;
    return '+' + d;
  }
  const d = s.replace(/\D/g, '');
  if (d !== s) return null;
  if (/^237[26]\d{8}$/.test(d)) return '+' + d;
  if (/^[26]\d{8}$/.test(d)) return '+237' + d;
  return null;
}

/** "+237 677 12 34 56" */
export function fmtNumber(p: string): string {
  const m = /^\+237(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(p);
  return m ? '+237 ' + m[1] + m[2] + ' ' + m[3] + ' ' + m[4] + ' ' + m[5] : p;
}

function isIos(): boolean {
  try { return /iPad|iPhone|iPod/.test(String(navigator.userAgent || '')); } catch { return false; }
}

/** sms: link for one or several numbers, with the message ready. */
export function smsHref(numbers: readonly string[], body: string): string {
  return 'sms:' + numbers.join(',') + (isIos() ? '&' : '?') + 'body=' + encodeURIComponent(body);
}

export function waHref(body: string): string {
  return 'https://wa.me/?text=' + encodeURIComponent(body);
}

export function mapLink(lat: number, lng: number): string {
  return 'https://maps.google.com/?q=' + lat.toFixed(5) + ',' + lng.toFixed(5);
}

function doualaTime(d: Date = new Date()): string {
  try {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Douala' });
  } catch {
    return new Date(d.getTime() + 3600 * 1000).toISOString().slice(11, 16);
  }
}

/** Where the phone is, or null (no permission, no signal, too slow). Never throws, never waits more than ms. */
export function findMe(ms: number): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v: { lat: number; lng: number } | null) => { if (!done) { done = true; resolve(v); } };
    const timer = window.setTimeout(() => finish(null), ms + 500);
    try {
      const geo = typeof navigator !== 'undefined' ? navigator.geolocation : undefined;
      if (!geo || typeof geo.getCurrentPosition !== 'function') { window.clearTimeout(timer); finish(null); return; }
      geo.getCurrentPosition(
        (p) => { window.clearTimeout(timer); finish({ lat: p.coords.latitude, lng: p.coords.longitude }); },
        () => { window.clearTimeout(timer); finish(null); },
        { enableHighAccuracy: true, timeout: ms, maximumAge: 120000 },
      );
    } catch {
      window.clearTimeout(timer);
      finish(null);
    }
  });
}

function inInstalledApp(): boolean {
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  } catch {
    return false;
  }
}

export default function SafetyButton() {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const navigate = useNavigate();
  const [people, setPeople] = useState<TrustedPerson[]>(loadPeople);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'locating' | 'ready'>('idle');
  const [alertText, setAlertText] = useState('');
  const [noLoc, setNoLoc] = useState(false);
  const [needPeople, setNeedPeople] = useState(false);

  const sendAlert = async () => {
    if (people.length === 0) { setNeedPeople(true); return; }
    setNeedPeople(false);
    setState('locating');
    const where = await findMe(8000);
    const body = where ? t.alertLoc.replace('{link}', mapLink(where.lat, where.lng)).replace('{time}', doualaTime()) : t.alertNoLoc;
    setNoLoc(!where);
    setAlertText(body);
    setState('ready');
    try { window.location.href = smsHref(people.map((p) => p.phone), body); } catch { /* the links below stay */ }
  };

  const add = () => {
    const n = name.trim().replace(/\s+/g, ' ');
    const p = normPhone(phone);
    if (n.length < 1 || n.length > 40) { setFormMsg(t.badName); return; }
    if (!p) { setFormMsg(t.badPhone); return; }
    if (people.some((x) => x.phone === p)) { setFormMsg(t.already); return; }
    if (people.length >= MAX_PEOPLE) { setFormMsg(t.full); return; }
    const next = people.concat([{ name: n, phone: p }]);
    savePeople(next);
    setPeople(next);
    setName(''); setPhone(''); setFormMsg(null); setNeedPeople(false);
  };

  const remove = (p: string) => {
    const next = people.filter((x) => x.phone !== p);
    savePeople(next);
    setPeople(next);
  };

  const wipe = () => {
    if (typeof window !== 'undefined' && !window.confirm(t.wipeConfirm)) return;
    savePeople([]);
    setPeople([]);
    setState('idle'); setAlertText('');
    setFormMsg(t.wiped);
  };

  const leave = () => {
    if (inInstalledApp()) { navigate('/marketplace', { replace: true }); return; }
    try { window.location.replace('https://www.google.com/'); } catch { navigate('/marketplace', { replace: true }); }
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };

  return (
    <div dir={dir} data-fix="FIX750" className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-28">
      <button type="button" onClick={goBack} className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />{t.back}
      </button>

      <header className="rounded-3xl bg-gradient-to-br from-red-600 to-rose-600 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20"><ShieldAlert className="h-6 w-6" /></span>
          <h1 className="text-2xl font-extrabold leading-tight">{t.title}</h1>
        </div>
        <p className="mt-3 text-sm font-semibold text-red-50">{t.intro}</p>
      </header>

      <button type="button" onClick={() => void sendAlert()} disabled={state === 'locating'} data-send-alert="1"
              className="flex w-full flex-col items-center justify-center gap-1 rounded-3xl bg-red-600 px-4 py-6 text-white shadow-lg ring-4 ring-red-200 hover:bg-red-700 active:scale-[0.99] disabled:opacity-80">
        <span className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-wide">
          {state === 'locating' ? <Loader2 className="h-7 w-7 animate-spin" /> : <Siren className="h-7 w-7" />}{t.send}
        </span>
        <span className="text-sm font-semibold text-red-50">{state === 'locating' ? t.locating : t.sendSub}</span>
      </button>

      {needPeople && <p className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900" role="alert" data-need-people="1">{t.needPeople}</p>}

      {state === 'ready' && (
        <section className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-4" role="status" data-alert-ready="1">
          {noLoc && <p className="text-sm font-semibold text-amber-800" data-no-location="1">{t.noLoc}</p>}
          <p className="text-sm font-semibold text-red-900">{t.opened}</p>
          <a href={smsHref(people.map((p) => p.phone), alertText)} data-sms-all="1"
             className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white">
            <MessageCircle className="h-5 w-5" />{t.openSms}
          </a>
          {people.length > 1 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-900">{t.eachTitle}</p>
              <div className="flex flex-wrap gap-2">
                {people.map((p) => (
                  <a key={p.phone} href={smsHref([p.phone], alertText)} data-sms-one={p.phone}
                     className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-700">{p.name}</a>
                ))}
              </div>
            </div>
          )}
          <a href={waHref(alertText)} target="_blank" rel="noopener noreferrer" data-wa="1"
             className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 bg-white py-2.5 text-sm font-bold text-green-700">
            <MessageCircle className="h-4 w-4" />{t.whatsapp}
          </a>
        </section>
      )}

      <section className="space-y-2" aria-label={t.callTitle}>
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-600">{t.callTitle}</h2>
        <div className="grid grid-cols-2 gap-2">
          {SAFETY_LINES.map((l) => (
            <a key={l.code} href={'tel:' + l.code} data-sos={l.code}
               className={'flex min-w-0 items-center gap-2 rounded-2xl px-3 py-3 shadow-sm ' +
                 (l.strong ? 'bg-red-600 text-white' : 'bg-white text-red-800 ring-1 ring-red-100')}>
              <Phone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-lg font-extrabold leading-tight" dir="ltr">{l.code}</span>
                <span className={'block truncate text-xs font-semibold leading-tight ' + (l.strong ? 'text-red-50' : 'text-red-700')}>{t[l.key]}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <Link to="/taxi-check" data-taxi-link="1"
            className="flex w-full items-center gap-3 rounded-2xl bg-yellow-400 px-4 py-3 text-start text-gray-900 shadow hover:bg-yellow-300">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/50"><Car className="h-5 w-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold leading-tight">{t.taxiTitle}</span>
          <span className="block text-xs font-semibold leading-snug text-gray-800">{t.taxiSub}</span>
        </span>
        <ChevronRight className="h-5 w-5 flex-shrink-0 rtl:rotate-180" aria-hidden="true" />
      </Link>

      <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" data-people="1">
        <div>
          <h2 className="font-extrabold text-gray-900">{t.peopleTitle}</h2>
          <p className="text-xs text-gray-500">{t.peopleHelp}</p>
        </div>
        {people.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {people.map((p) => (
              <li key={p.phone} className="flex items-center justify-between gap-2 py-2" data-person={p.phone}>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-gray-900">{p.name}</span>
                  <span className="block text-xs text-gray-500" dir="ltr">{fmtNumber(p.phone)}</span>
                </span>
                <button type="button" onClick={() => remove(p.phone)} data-remove={p.phone}
                        className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100">
                  <X className="h-3.5 w-3.5" />{t.remove}
                </button>
              </li>
            ))}
          </ul>
        )}
        {people.length < MAX_PEOPLE && (
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs font-bold text-gray-600">
              {t.name}
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder={t.namePh} data-f="name" maxLength={40}
                     className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs font-bold text-gray-600">
              {t.phone}
              <input value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 20))} placeholder={t.phonePh} data-f="phone" inputMode="tel" dir="ltr"
                     className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            </label>
            <button type="button" onClick={add} data-add="1"
                    className="inline-flex items-center justify-center gap-1.5 self-end rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white">
              <UserPlus className="h-4 w-4" />{t.add}
            </button>
          </div>
        )}
        {formMsg && <p className="text-sm font-semibold text-gray-700" role="status" data-form-msg="1">{formMsg}</p>}
        {people.length > 0 && (
          <button type="button" onClick={wipe} data-wipe="1"
                  className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100">
            <Trash2 className="h-3.5 w-3.5" />{t.wipe}
          </button>
        )}
      </section>

      <section className="space-y-2 rounded-2xl border border-amber-100 bg-amber-50 p-4" data-plan="1">
        <h2 className="flex items-center gap-2 font-extrabold text-amber-900"><MapPin className="h-4 w-4" />{t.planTitle}</h2>
        <ul className="space-y-1.5">
          {[t.plan1, t.plan2, t.plan3, t.plan4, t.plan5].map((x) => (
            <li key={x} className="flex items-start gap-2 text-sm text-gray-900">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600" data-privacy="1">{t.privacy}</p>

      <button type="button" onClick={leave} data-quick-exit="1" title={t.quickExitHelp} aria-label={t.quickExitHelp}
              className="fixed bottom-24 left-3 z-40 inline-flex items-center gap-1.5 rounded-full bg-gray-900/90 px-3.5 py-2 text-sm font-bold text-white shadow-lg ring-2 ring-white hover:bg-black">
        <X className="h-4 w-4" aria-hidden="true" />{t.quickExit}
      </button>
    </div>
  );
}
// BAMBEH_END_TOKEN__SAFETY_BUTTON_FIX750__COMPLETE
