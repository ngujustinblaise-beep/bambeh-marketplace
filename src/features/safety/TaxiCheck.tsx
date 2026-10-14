// BAMBEH_DEPLOY_TOKEN__TAXI_CHECK_FIX748_CLEAN
/**
 * src/features/safety/TaxiCheck.tsx - FIX748 (new) - route /taxi-check
 *
 * TAXI CHECK. Big, 14 Oct 2026: "taxis in Yaounde have bar codes for the security of passengers and
 * the state ... can we build a free barcode scanner in the free section where we will advise users to
 * scan before they enter a taxi ... the details will be sent to [their close relatives] ... no data is
 * kept in the app. it is shared with love ones or with the police if need be".
 *
 * Since 3 July 2026 the city of Yaounde (Communaute urbaine, platform Taxi-Yaounde - www.taxiyaounde.com -
 * built with GIZ) registers every taxi: each one gets a unique door number and its driver a personal QR code;
 * scanning it shows who is driving. Registration closed on 5 October 2026; an unregistered taxi can be
 * impounded.
 *
 *   1. SCAN the code with the camera (FIX749 - decoded on the phone), or take a photo of it, or type the
 *      door number. A web link is shown with its website: the city's register is marked; any other site
 *      gets a warning, because anybody can print a code. Nothing opens by itself; "Open the driver's page"
 *      opens it in the browser.
 *   2. THE TAXI: door number, plate, a note, when she should arrive (2 hours unless she changes it), and
 *      where she gets in if she allows the location.
 *   3. SEND: her SMS app opens with the message ready for the people she trusts (the same list as the
 *      Safety button, FIX750, kept only on the phone). SMS needs no data. WhatsApp is offered too.
 *      Her people get the taxi's details BEFORE the ride: if the phone dies, is stolen or lost, they
 *      already have them, and they know when to worry. A web page cannot send anything later by itself,
 *      and Bambeh keeps nothing, so this is said plainly on the page.
 *   4. YOUR TAXI: the trip stays on the phone for 24 hours (a bag left in the taxi), with "I arrived
 *      safely" (an SMS to the same people), "Something is wrong" (the Safety button), police 117, and
 *      "Forget this trip now".
 * No account needed - a safety tool must work at the taxi door. Signed-out phones see one quiet line
 * offering the free account. Bambeh's servers never receive the code, the numbers, the trip or the place.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Camera, Car, CheckCircle2, ChevronLeft, ExternalLink, Flashlight, ImageIcon, Loader2, MapPin, MessageCircle,
  Phone, ScanLine, ShieldCheck, Siren, Trash2, UserPlus, X,
} from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import { useAuth } from '@/contexts/AuthContext';
import { MAX_PEOPLE, findMe, fmtNumber, loadPeople, mapLink, normPhone, savePeople, smsHref, waHref } from './SafetyButton';
import type { TrustedPerson } from './SafetyButton';
import { cameraProblem, decodeCanvas, decodeImageFile, drawScaled, nativeDetector, openCamera, readCode } from './qrScan';
import type { CameraProblem, OpenCamera, ScannedCode } from './qrScan';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
export function normLang(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

const EN = {
  title: 'Taxi check',
  intro: 'Before you get in: scan the taxi\'s code, check the driver, and send the taxi\'s details to the people you trust.',
  back: 'Back',
  step1: '1. Scan the taxi\'s code',
  step1Help: 'In Yaound\u00e9, every registered taxi now has a QR code from the city (Taxi-Yaound\u00e9) and a door number. Scanning the code shows who the driver is.',
  scan: 'Scan the code',
  scanning: 'Point the camera at the code',
  closeCam: 'Close the camera',
  light: 'Light',
  photo: 'Take a photo of the code instead',
  reading: 'Reading the photo...',
  photoFail: 'No code found in this photo. Try again closer, with more light - or type the door number.',
  camUnsupported: 'This phone cannot open the camera here. Take a photo of the code, or type the door number.',
  camDenied: 'The camera is blocked for Bambeh. Allow it in your phone settings - or take a photo of the code, or type the door number.',
  camNone: 'No camera found. Take a photo of the code, or type the door number.',
  camBusy: 'Another app is using the camera. Close it and try again.',
  camFailed: 'The camera did not open. Take a photo of the code, or type the door number.',
  codeLink: 'This code opens:',
  official: 'The city of Yaound\u00e9\'s taxi register (Taxi-Yaound\u00e9)',
  notOfficial: 'Bambeh does not know this website. Real codes come from the city of Yaound\u00e9 (Taxi-Yaound\u00e9). Check carefully.',
  openPage: 'Open the driver\'s page',
  checkHint: 'Check that the page shows this driver and this taxi\'s door number. If it does not, do not get in.',
  codeText: 'The code says:',
  rescan: 'Scan again',
  step2: '2. The taxi',
  door: 'Door number',
  doorPh: 'The number on the door',
  plate: 'Number plate (if you can see it)',
  platePh: 'e.g. CE 123 AB',
  notes: 'Anything else (optional)',
  notesPh: 'e.g. grey Toyota, driver in a blue shirt',
  arrive: 'I should arrive in',
  arr30: '30 min',
  arr60: '1 h',
  arr120: '2 h',
  arr180: '3 h',
  arr360: '6 h',
  addPlace: 'Add where I am getting in (location)',
  step3: '3. Send it to your people',
  needSomething: 'Scan the code or type the door number first.',
  choose: 'Who gets it',
  noPeople: 'Add at least one person you trust (they stay on this phone).',
  send: 'Send by SMS',
  sendSub: 'Works without data - only airtime',
  whatsapp: 'Send on WhatsApp instead (needs data)',
  opened: 'Your SMS app should now be open with the message ready: press Send.',
  openSms: 'Open the SMS again',
  eachTitle: 'Or send it to one person at a time:',
  locating: 'Finding where you are...',
  noLoc: 'Your location could not be found - the message goes without it.',
  tripTitle: 'Your taxi',
  tripStarted: 'Got in at {time}',
  tripBy: 'You should arrive by {time}',
  tripLate: 'It is past {time}. Tell your people you are safe - or press the Safety button.',
  arrived: 'I arrived safely',
  arrivedSub: 'Tell my people (SMS)',
  arrivedDone: 'You told your people you arrived at {time}.',
  wrong: 'Something is wrong',
  call117: 'Police 117',
  forget: 'Forget this trip now',
  forgetConfirm: 'Delete this trip from this phone?',
  kept24: 'This trip stays on this phone for 24 hours, then it deletes itself.',
  why: 'Why send it before the ride?',
  whyBody: 'If your phone dies, is stolen or is lost during the ride, your people already have the taxi\'s details and know when you should arrive. Bambeh cannot send anything for you later: it never keeps your trip.',
  tipsTitle: 'Safer taxi rides',
  tip1: 'No number on the door, or a code that does not open the driver\'s page? Do not get in.',
  tip2: 'Sit behind the driver and keep your bag on you.',
  tip3: 'At night, keep your phone charged and share your trip.',
  tip4: 'In danger: the Safety button, or call the police (117) or the gendarmerie (113).',
  privacy: 'Bambeh never sees the code, the numbers, your trip or where you are. They stay on this phone and go only to the people you choose.',
  peopleTitle: 'The people I trust',
  peopleHelp: 'The same people as the Safety button. Saved only on this phone.',
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
  safety: 'Safety button',
  account: 'Bambeh is free - create your free account',
  msgStart: 'BAMBEH TAXI - {time}: I am getting into a taxi.',
  msgDoor: 'Door number: {x}.',
  msgPlate: 'Plate: {x}.',
  msgCode: 'Driver code: {x}',
  msgNotes: 'Note: {x}.',
  msgWhere: 'Where I got in: {x}',
  msgBy: 'I should arrive by {time}. If you have not heard from me by then, call me. If I do not answer, call the police (117) and give them these details.',
  msgArrived: 'BAMBEH TAXI - {time}: I arrived safely. Thank you.',
};
export type Key = keyof typeof EN;

const FR: Record<Key, string> = {
  title: 'V\u00e9rifier mon taxi',
  intro: 'Avant de monter : scannez le code du taxi, v\u00e9rifiez le chauffeur, et envoyez les d\u00e9tails du taxi \u00e0 vos personnes de confiance.',
  back: 'Retour',
  step1: '1. Scannez le code du taxi',
  step1Help: '\u00c0 Yaound\u00e9, chaque taxi enregistr\u00e9 a d\u00e9sormais un code QR de la ville (Taxi-Yaound\u00e9) et un num\u00e9ro de porti\u00e8re. Le scanner montre qui est le chauffeur.',
  scan: 'Scanner le code',
  scanning: 'Visez le code avec la cam\u00e9ra',
  closeCam: 'Fermer la cam\u00e9ra',
  light: 'Lumi\u00e8re',
  photo: 'Prendre plut\u00f4t une photo du code',
  reading: 'Lecture de la photo...',
  photoFail: 'Aucun code trouv\u00e9 sur cette photo. R\u00e9essayez plus pr\u00e8s, avec plus de lumi\u00e8re, ou saisissez le num\u00e9ro de porti\u00e8re.',
  camUnsupported: 'Ce t\u00e9l\u00e9phone ne peut pas ouvrir la cam\u00e9ra ici. Prenez une photo du code, ou saisissez le num\u00e9ro de porti\u00e8re.',
  camDenied: 'La cam\u00e9ra est bloqu\u00e9e pour Bambeh. Autorisez-la dans les r\u00e9glages du t\u00e9l\u00e9phone, ou prenez une photo du code, ou saisissez le num\u00e9ro de porti\u00e8re.',
  camNone: 'Aucune cam\u00e9ra trouv\u00e9e. Prenez une photo du code, ou saisissez le num\u00e9ro de porti\u00e8re.',
  camBusy: 'Une autre application utilise la cam\u00e9ra. Fermez-la et r\u00e9essayez.',
  camFailed: 'La cam\u00e9ra ne s\u2019est pas ouverte. Prenez une photo du code, ou saisissez le num\u00e9ro de porti\u00e8re.',
  codeLink: 'Ce code ouvre :',
  official: 'Le registre des taxis de la ville de Yaound\u00e9 (Taxi-Yaound\u00e9)',
  notOfficial: 'Bambeh ne conna\u00eet pas ce site. Les vrais codes viennent de la ville de Yaound\u00e9 (Taxi-Yaound\u00e9). V\u00e9rifiez bien.',
  openPage: 'Ouvrir la page du chauffeur',
  checkHint: 'V\u00e9rifiez que la page montre bien ce chauffeur et le num\u00e9ro de porti\u00e8re de ce taxi. Sinon, ne montez pas.',
  codeText: 'Le code dit :',
  rescan: 'Scanner \u00e0 nouveau',
  step2: '2. Le taxi',
  door: 'Num\u00e9ro de porti\u00e8re',
  doorPh: 'Le num\u00e9ro sur la porti\u00e8re',
  plate: 'Plaque d\u2019immatriculation (si vous la voyez)',
  platePh: 'ex. CE 123 AB',
  notes: 'Autre chose (facultatif)',
  notesPh: 'ex. Toyota grise, chauffeur en chemise bleue',
  arrive: 'Je dois arriver dans',
  arr30: '30 min',
  arr60: '1 h',
  arr120: '2 h',
  arr180: '3 h',
  arr360: '6 h',
  addPlace: 'Ajouter l\u2019endroit o\u00f9 je monte (position)',
  step3: '3. Envoyez-le \u00e0 vos proches',
  needSomething: 'Scannez d\u2019abord le code ou saisissez le num\u00e9ro de porti\u00e8re.',
  choose: 'Qui le re\u00e7oit',
  noPeople: 'Ajoutez au moins une personne de confiance (elle reste sur ce t\u00e9l\u00e9phone).',
  send: 'Envoyer par SMS',
  sendSub: 'Marche sans donn\u00e9es, avec du cr\u00e9dit seulement',
  whatsapp: 'Envoyer plut\u00f4t sur WhatsApp (avec des donn\u00e9es)',
  opened: 'Votre application SMS devrait \u00eatre ouverte avec le message pr\u00eat : appuyez sur Envoyer.',
  openSms: 'Rouvrir le SMS',
  eachTitle: 'Ou envoyez-le \u00e0 une personne \u00e0 la fois :',
  locating: 'Recherche de votre position...',
  noLoc: 'Votre position n\u2019a pas pu \u00eatre trouv\u00e9e : le message part sans elle.',
  tripTitle: 'Votre taxi',
  tripStarted: 'Dans le taxi depuis {time}',
  tripBy: 'Arriv\u00e9e pr\u00e9vue vers {time}',
  tripLate: 'Il est plus de {time}. Dites \u00e0 vos proches que tout va bien, ou appuyez sur le bouton de s\u00e9curit\u00e9.',
  arrived: 'Je suis bien arriv\u00e9(e)',
  arrivedSub: 'Le dire \u00e0 mes proches (SMS)',
  arrivedDone: 'Vous avez dit \u00e0 vos proches que vous \u00eates arriv\u00e9(e) \u00e0 {time}.',
  wrong: 'Quelque chose ne va pas',
  call117: 'Police 117',
  forget: 'Effacer ce trajet maintenant',
  forgetConfirm: 'Effacer ce trajet de ce t\u00e9l\u00e9phone ?',
  kept24: 'Ce trajet reste sur ce t\u00e9l\u00e9phone 24 heures, puis il s\u2019efface tout seul.',
  why: 'Pourquoi l\u2019envoyer avant la course ?',
  whyBody: 'Si votre t\u00e9l\u00e9phone s\u2019\u00e9teint, est vol\u00e9 ou perdu pendant la course, vos proches ont d\u00e9j\u00e0 les d\u00e9tails du taxi et savent quand vous devez arriver. Bambeh ne peut rien envoyer pour vous plus tard : il ne garde jamais votre trajet.',
  tipsTitle: 'Taxi plus s\u00fbr',
  tip1: 'Pas de num\u00e9ro sur la porti\u00e8re, ou un code qui n\u2019ouvre pas la page du chauffeur ? Ne montez pas.',
  tip2: 'Asseyez-vous derri\u00e8re le chauffeur et gardez votre sac sur vous.',
  tip3: 'Le soir, gardez votre t\u00e9l\u00e9phone charg\u00e9 et partagez votre trajet.',
  tip4: 'En danger : le bouton de s\u00e9curit\u00e9, ou appelez la police (117) ou la gendarmerie (113).',
  privacy: 'Bambeh ne voit jamais le code, les num\u00e9ros, votre trajet ni votre position. Ils restent sur ce t\u00e9l\u00e9phone et partent seulement vers les personnes que vous choisissez.',
  peopleTitle: 'Mes personnes de confiance',
  peopleHelp: 'Les m\u00eames personnes que pour le bouton de s\u00e9curit\u00e9. Enregistr\u00e9es uniquement sur ce t\u00e9l\u00e9phone.',
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
  safety: 'Bouton de s\u00e9curit\u00e9',
  account: 'Bambeh est gratuit : cr\u00e9ez votre compte gratuit',
  msgStart: 'BAMBEH TAXI - {time} : je monte dans un taxi.',
  msgDoor: 'Num\u00e9ro de porti\u00e8re : {x}.',
  msgPlate: 'Plaque : {x}.',
  msgCode: 'Code du chauffeur : {x}',
  msgNotes: 'Remarque : {x}.',
  msgWhere: 'O\u00f9 je suis mont\u00e9(e) : {x}',
  msgBy: 'Je dois arriver vers {time}. Sans nouvelles de moi \u00e0 cette heure, appelle-moi. Si je ne r\u00e9ponds pas, appelle la police (117) et donne-lui ces informations.',
  msgArrived: 'BAMBEH TAXI - {time} : je suis bien arriv\u00e9(e). Merci.',
};

const PIDGIN: Record<Key, string> = {
  title: 'Check your taxi',
  intro: 'Before you enter: scan the taxi code, check the driver, and send the taxi details to the people weh you trust.',
  back: 'Back',
  step1: '1. Scan the taxi code',
  step1Help: 'For Yaound\u00e9, every taxi weh dem don register get QR code from the city (Taxi-Yaound\u00e9) and door number. If you scan the code, you go see who the driver be.',
  scan: 'Scan the code',
  scanning: 'Point the camera for the code',
  closeCam: 'Close the camera',
  light: 'Light',
  photo: 'Snap the code instead',
  reading: 'We di read the picture...',
  photoFail: 'We no see any code for this picture. Try again near-near, with more light - or write the door number.',
  camUnsupported: 'This phone no fit open the camera here. Snap the code, or write the door number.',
  camDenied: 'The camera don block for Bambeh. Allow am for your phone settings - or snap the code, or write the door number.',
  camNone: 'We no see any camera. Snap the code, or write the door number.',
  camBusy: 'Another app di use the camera. Close am and try again.',
  camFailed: 'The camera no open. Snap the code, or write the door number.',
  codeLink: 'This code di open:',
  official: 'The taxi register of Yaound\u00e9 city (Taxi-Yaound\u00e9)',
  notOfficial: 'Bambeh no know this website. Correct codes di come from Yaound\u00e9 city (Taxi-Yaound\u00e9). Check am well.',
  openPage: 'Open the driver page',
  checkHint: 'Check say the page show this same driver and the door number of this taxi. If e no be so, no enter.',
  codeText: 'The code talk say:',
  rescan: 'Scan again',
  step2: '2. The taxi',
  door: 'Door number',
  doorPh: 'The number for the door',
  plate: 'Number plate (if you fit see am)',
  platePh: 'e.g. CE 123 AB',
  notes: 'Any other thing (if you want)',
  notesPh: 'e.g. grey Toyota, driver wear blue shirt',
  arrive: 'I suppose reach for',
  arr30: '30 min',
  arr60: '1 h',
  arr120: '2 h',
  arr180: '3 h',
  arr360: '6 h',
  addPlace: 'Add the place weh I di enter (location)',
  step3: '3. Send am to your people',
  needSomething: 'Scan the code or write the door number first.',
  choose: 'Who go get am',
  noPeople: 'Add at least one person weh you trust (dem go stay for this phone).',
  send: 'Send by SMS',
  sendSub: 'E di work without data - only credit',
  whatsapp: 'Send for WhatsApp instead (e need data)',
  opened: 'Your SMS app suppose open now with the message ready: press Send.',
  openSms: 'Open the SMS again',
  eachTitle: 'Or send am to one person one by one:',
  locating: 'We di find where you dey...',
  noLoc: 'We no fit find your location - the message go go without am.',
  tripTitle: 'Your taxi',
  tripStarted: 'You enter for {time}',
  tripBy: 'You suppose reach around {time}',
  tripLate: 'E don pass {time}. Tell your people say you dey fine - or press the Safety button.',
  arrived: 'I don reach well',
  arrivedSub: 'Tell my people (SMS)',
  arrivedDone: 'You don tell your people say you reach for {time}.',
  wrong: 'Something no correct',
  call117: 'Police 117',
  forget: 'Forget this trip now',
  forgetConfirm: 'Delete this trip from this phone?',
  kept24: 'This trip go stay for this phone for 24 hours, after that e go delete by eself.',
  why: 'Why send am before you go?',
  whyBody: 'If your phone die, if dem thief am or e lost for road, your people don already get the taxi details and dem know when you suppose reach. Bambeh no fit send anything for you later: e no di ever keep your trip.',
  tipsTitle: 'Safer taxi',
  tip1: 'No number for the door, or the code no open the driver page? No enter.',
  tip2: 'Sit for back of the driver and keep your bag with you.',
  tip3: 'For night, make your phone get charge and share your trip.',
  tip4: 'Danger: the Safety button, or call police (117) or gendarmerie (113).',
  privacy: 'Bambeh no di ever see the code, the numbers, your trip or where you dey. Dem go stay for this phone and go only to the people weh you choose.',
  peopleTitle: 'People weh I trust',
  peopleHelp: 'The same people as the Safety button. E dey only for this phone.',
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
  safety: 'Safety button',
  account: 'Bambeh na free - make your free account',
  msgStart: 'BAMBEH TAXI - {time}: I di enter taxi now.',
  msgDoor: 'Door number: {x}.',
  msgPlate: 'Plate: {x}.',
  msgCode: 'Driver code: {x}',
  msgNotes: 'Note: {x}.',
  msgWhere: 'Where I enter: {x}',
  msgBy: 'I suppose reach around {time}. If you no hear from me by that time, call me. If I no answer, call police (117) and give dem these details.',
  msgArrived: 'BAMBEH TAXI - {time}: I don reach well. Thank you.',
};

const AR: Record<Key, string> = {
  title: '\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0633\u064a\u0627\u0631\u0629 \u0627\u0644\u0623\u062c\u0631\u0629',
  intro: '\u0642\u0628\u0644 \u0623\u0646 \u062a\u0631\u0643\u0628: \u0627\u0645\u0633\u062d \u0631\u0645\u0632 \u0633\u064a\u0627\u0631\u0629 \u0627\u0644\u0623\u062c\u0631\u0629\u060c \u0648\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0627\u0644\u0633\u0627\u0626\u0642\u060c \u0648\u0623\u0631\u0633\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0633\u064a\u0627\u0631\u0629 \u0625\u0644\u0649 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645.',
  back: '\u0631\u062c\u0648\u0639',
  step1: '1. \u0627\u0645\u0633\u062d \u0631\u0645\u0632 \u0633\u064a\u0627\u0631\u0629 \u0627\u0644\u0623\u062c\u0631\u0629',
  step1Help: '\u0641\u064a \u064a\u0627\u0648\u0646\u062f\u064a\u060c \u0623\u0635\u0628\u062d \u0644\u0643\u0644 \u0633\u064a\u0627\u0631\u0629 \u0623\u062c\u0631\u0629 \u0645\u0633\u062c\u0651\u0644\u0629 \u0631\u0645\u0632 QR \u0645\u0646 \u0627\u0644\u0645\u062f\u064a\u0646\u0629 (Taxi-Yaound\u00e9) \u0648\u0631\u0642\u0645 \u0639\u0644\u0649 \u0627\u0644\u0628\u0627\u0628. \u0645\u0633\u062d \u0627\u0644\u0631\u0645\u0632 \u064a\u064f\u0638\u0647\u0631 \u0645\u0646 \u0647\u0648 \u0627\u0644\u0633\u0627\u0626\u0642.',
  scan: '\u0627\u0645\u0633\u062d \u0627\u0644\u0631\u0645\u0632',
  scanning: '\u0648\u062c\u0651\u0647 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u0646\u062d\u0648 \u0627\u0644\u0631\u0645\u0632',
  closeCam: '\u0623\u063a\u0644\u0642 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627',
  light: '\u0627\u0644\u0625\u0636\u0627\u0621\u0629',
  photo: '\u0627\u0644\u062a\u0642\u0637 \u0635\u0648\u0631\u0629 \u0644\u0644\u0631\u0645\u0632 \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643',
  reading: '\u062c\u0627\u0631\u064d \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0635\u0648\u0631\u0629...',
  photoFail: '\u0644\u0645 \u064a\u064f\u0639\u062b\u0631 \u0639\u0644\u0649 \u0631\u0645\u0632 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0635\u0648\u0631\u0629. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0645\u0646 \u0645\u0633\u0627\u0641\u0629 \u0623\u0642\u0631\u0628 \u0648\u0628\u0625\u0636\u0627\u0621\u0629 \u0623\u0643\u062b\u0631\u060c \u0623\u0648 \u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0627\u0644\u0628\u0627\u0628.',
  camUnsupported: '\u0644\u0627 \u064a\u0633\u062a\u0637\u064a\u0639 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641 \u0641\u062a\u062d \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u0647\u0646\u0627. \u0627\u0644\u062a\u0642\u0637 \u0635\u0648\u0631\u0629 \u0644\u0644\u0631\u0645\u0632\u060c \u0623\u0648 \u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0627\u0644\u0628\u0627\u0628.',
  camDenied: '\u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u0645\u062d\u062c\u0648\u0628\u0629 \u0639\u0646 \u0628\u0627\u0645\u0628\u064a\u0647. \u0627\u0633\u0645\u062d \u0628\u0647\u0627 \u0645\u0646 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0647\u0627\u062a\u0641\u060c \u0623\u0648 \u0627\u0644\u062a\u0642\u0637 \u0635\u0648\u0631\u0629 \u0644\u0644\u0631\u0645\u0632\u060c \u0623\u0648 \u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0627\u0644\u0628\u0627\u0628.',
  camNone: '\u0644\u0645 \u064a\u064f\u0639\u062b\u0631 \u0639\u0644\u0649 \u0643\u0627\u0645\u064a\u0631\u0627. \u0627\u0644\u062a\u0642\u0637 \u0635\u0648\u0631\u0629 \u0644\u0644\u0631\u0645\u0632\u060c \u0623\u0648 \u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0627\u0644\u0628\u0627\u0628.',
  camBusy: '\u062a\u0637\u0628\u064a\u0642 \u0622\u062e\u0631 \u064a\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627. \u0623\u063a\u0644\u0642\u0647 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
  camFailed: '\u0644\u0645 \u062a\u064f\u0641\u062a\u062d \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627. \u0627\u0644\u062a\u0642\u0637 \u0635\u0648\u0631\u0629 \u0644\u0644\u0631\u0645\u0632\u060c \u0623\u0648 \u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0627\u0644\u0628\u0627\u0628.',
  codeLink: '\u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u064a\u0641\u062a\u062d:',
  official: '\u0633\u062c\u0644 \u0633\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0623\u062c\u0631\u0629 \u0644\u0645\u062f\u064a\u0646\u0629 \u064a\u0627\u0648\u0646\u062f\u064a (Taxi-Yaound\u00e9)',
  notOfficial: '\u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0627 \u064a\u0639\u0631\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639. \u0627\u0644\u0631\u0645\u0648\u0632 \u0627\u0644\u062d\u0642\u064a\u0642\u064a\u0629 \u062a\u0623\u062a\u064a \u0645\u0646 \u0645\u062f\u064a\u0646\u0629 \u064a\u0627\u0648\u0646\u062f\u064a (Taxi-Yaound\u00e9). \u062a\u062d\u0642\u0651\u0642 \u062c\u064a\u062f\u064b\u0627.',
  openPage: '\u0627\u0641\u062a\u062d \u0635\u0641\u062d\u0629 \u0627\u0644\u0633\u0627\u0626\u0642',
  checkHint: '\u062a\u062d\u0642\u0651\u0642 \u0645\u0646 \u0623\u0646 \u0627\u0644\u0635\u0641\u062d\u0629 \u062a\u064f\u0638\u0647\u0631 \u0647\u0630\u0627 \u0627\u0644\u0633\u0627\u0626\u0642 \u0646\u0641\u0633\u0647 \u0648\u0631\u0642\u0645 \u0628\u0627\u0628 \u0647\u0630\u0647 \u0627\u0644\u0633\u064a\u0627\u0631\u0629. \u0648\u0625\u0646 \u0644\u0645 \u064a\u0643\u0646 \u0643\u0630\u0644\u0643\u060c \u0641\u0644\u0627 \u062a\u0631\u0643\u0628.',
  codeText: '\u064a\u0642\u0648\u0644 \u0627\u0644\u0631\u0645\u0632:',
  rescan: '\u0627\u0645\u0633\u062d \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
  step2: '2. \u0633\u064a\u0627\u0631\u0629 \u0627\u0644\u0623\u062c\u0631\u0629',
  door: '\u0631\u0642\u0645 \u0627\u0644\u0628\u0627\u0628',
  doorPh: '\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u0643\u062a\u0648\u0628 \u0639\u0644\u0649 \u0627\u0644\u0628\u0627\u0628',
  plate: '\u0631\u0642\u0645 \u0627\u0644\u0644\u0648\u062d\u0629 (\u0625\u0646 \u0643\u0646\u062a \u062a\u0631\u0627\u0647)',
  platePh: 'CE 123 AB',
  notes: '\u0634\u064a\u0621 \u0622\u062e\u0631 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)',
  notesPh: '\u0645\u062b\u0627\u0644: \u062a\u0648\u064a\u0648\u062a\u0627 \u0631\u0645\u0627\u062f\u064a\u0629\u060c \u0627\u0644\u0633\u0627\u0626\u0642 \u064a\u0631\u062a\u062f\u064a \u0642\u0645\u064a\u0635\u064b\u0627 \u0623\u0632\u0631\u0642',
  arrive: '\u064a\u062c\u0628 \u0623\u0646 \u0623\u0635\u0644 \u062e\u0644\u0627\u0644',
  arr30: '30 \u062f\u0642\u064a\u0642\u0629',
  arr60: '\u0633\u0627\u0639\u0629',
  arr120: '\u0633\u0627\u0639\u062a\u0627\u0646',
  arr180: '3 \u0633\u0627\u0639\u0627\u062a',
  arr360: '6 \u0633\u0627\u0639\u0627\u062a',
  addPlace: '\u0623\u0636\u0641 \u0627\u0644\u0645\u0643\u0627\u0646 \u0627\u0644\u0630\u064a \u0623\u0631\u0643\u0628 \u0645\u0646\u0647 (\u0627\u0644\u0645\u0648\u0642\u0639)',
  step3: '3. \u0623\u0631\u0633\u0644\u0647\u0627 \u0625\u0644\u0649 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645',
  needSomething: '\u0627\u0645\u0633\u062d \u0627\u0644\u0631\u0645\u0632 \u0623\u0648 \u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0627\u0644\u0628\u0627\u0628 \u0623\u0648\u0644\u064b\u0627.',
  choose: '\u0645\u0646 \u064a\u0633\u062a\u0644\u0645\u0647\u0627',
  noPeople: '\u0623\u0636\u0641 \u0634\u062e\u0635\u064b\u0627 \u0648\u0627\u062d\u062f\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u062a\u062b\u0642 \u0628\u0647 (\u064a\u0628\u0642\u0649 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641).',
  send: '\u0623\u0631\u0633\u0644 \u0628\u0631\u0633\u0627\u0644\u0629 \u0642\u0635\u064a\u0631\u0629',
  sendSub: '\u062a\u0639\u0645\u0644 \u062f\u0648\u0646 \u0628\u064a\u0627\u0646\u0627\u062a - \u0628\u0627\u0644\u0631\u0635\u064a\u062f \u0641\u0642\u0637',
  whatsapp: '\u0623\u0631\u0633\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u062f\u0644\u064b\u0627 \u0645\u0646 \u0630\u0644\u0643 (\u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0628\u064a\u0627\u0646\u0627\u062a)',
  opened: '\u064a\u064f\u0641\u062a\u0631\u0636 \u0623\u0646 \u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0645\u0641\u062a\u0648\u062d \u0627\u0644\u0622\u0646 \u0648\u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u062c\u0627\u0647\u0632\u0629: \u0627\u0636\u063a\u0637 \u0625\u0631\u0633\u0627\u0644.',
  openSms: '\u0627\u0641\u062a\u062d \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
  eachTitle: '\u0623\u0648 \u0623\u0631\u0633\u0644\u0647\u0627 \u0625\u0644\u0649 \u0634\u062e\u0635 \u0648\u0627\u062d\u062f \u0641\u064a \u0643\u0644 \u0645\u0631\u0629:',
  locating: '\u062c\u0627\u0631\u064d \u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639\u0643...',
  noLoc: '\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639\u0643 - \u0633\u062a\u064f\u0631\u0633\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0628\u062f\u0648\u0646\u0647.',
  tripTitle: '\u0633\u064a\u0627\u0631\u0629 \u0627\u0644\u0623\u062c\u0631\u0629 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0643',
  tripStarted: '\u0631\u0643\u0628\u062a \u0627\u0644\u0633\u0627\u0639\u0629 {time}',
  tripBy: '\u064a\u062c\u0628 \u0623\u0646 \u062a\u0635\u0644 \u0646\u062d\u0648 \u0627\u0644\u0633\u0627\u0639\u0629 {time}',
  tripLate: '\u062a\u062c\u0627\u0648\u0632\u062a \u0627\u0644\u0633\u0627\u0639\u0629 {time}. \u0623\u062e\u0628\u0631 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645 \u0623\u0646\u0643 \u0628\u062e\u064a\u0631\u060c \u0623\u0648 \u0627\u0636\u063a\u0637 \u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646.',
  arrived: '\u0648\u0635\u0644\u062a \u0628\u0633\u0644\u0627\u0645',
  arrivedSub: '\u0623\u062e\u0628\u0631 \u0645\u0646 \u0623\u062b\u0642 \u0628\u0647\u0645 (\u0631\u0633\u0627\u0644\u0629 \u0642\u0635\u064a\u0631\u0629)',
  arrivedDone: '\u0623\u062e\u0628\u0631\u062a \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645 \u0623\u0646\u0643 \u0648\u0635\u0644\u062a \u0627\u0644\u0633\u0627\u0639\u0629 {time}.',
  wrong: '\u0647\u0646\u0627\u0643 \u0645\u0634\u0643\u0644\u0629',
  call117: '\u0627\u0644\u0634\u0631\u0637\u0629 117',
  forget: '\u0627\u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0631\u062d\u0644\u0629 \u0627\u0644\u0622\u0646',
  forgetConfirm: '\u0647\u0644 \u062a\u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0631\u062d\u0644\u0629 \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641\u061f',
  kept24: '\u062a\u0628\u0642\u0649 \u0647\u0630\u0647 \u0627\u0644\u0631\u062d\u0644\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641 24 \u0633\u0627\u0639\u0629\u060c \u062b\u0645 \u062a\u064f\u062d\u0630\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627.',
  why: '\u0644\u0645\u0627\u0630\u0627 \u062a\u0631\u0633\u0644\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u0631\u0643\u0648\u0628\u061f',
  whyBody: '\u0625\u0630\u0627 \u0627\u0646\u0637\u0641\u0623 \u0647\u0627\u062a\u0641\u0643 \u0623\u0648 \u0633\u064f\u0631\u0642 \u0623\u0648 \u0636\u0627\u0639 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u0631\u062d\u0644\u0629\u060c \u064a\u0643\u0648\u0646 \u0644\u062f\u0649 \u0645\u0646 \u062a\u062b\u0642 \u0628\u0647\u0645 \u0628\u064a\u0627\u0646\u0627\u062a \u0633\u064a\u0627\u0631\u0629 \u0627\u0644\u0623\u062c\u0631\u0629 \u0648\u064a\u0639\u0631\u0641\u0648\u0646 \u0645\u062a\u0649 \u064a\u062c\u0628 \u0623\u0646 \u062a\u0635\u0644. \u0644\u0627 \u064a\u0633\u062a\u0637\u064a\u0639 \u0628\u0627\u0645\u0628\u064a\u0647 \u0625\u0631\u0633\u0627\u0644 \u0623\u064a \u0634\u064a\u0621 \u0646\u064a\u0627\u0628\u0629\u064b \u0639\u0646\u0643 \u0644\u0627\u062d\u0642\u064b\u0627: \u0641\u0647\u0648 \u0644\u0627 \u064a\u062d\u062a\u0641\u0638 \u0628\u0631\u062d\u0644\u062a\u0643 \u0623\u0628\u062f\u064b\u0627.',
  tipsTitle: '\u0631\u0643\u0648\u0628 \u0623\u0643\u062b\u0631 \u0623\u0645\u0627\u0646\u064b\u0627',
  tip1: '\u0644\u0627 \u0631\u0642\u0645 \u0639\u0644\u0649 \u0627\u0644\u0628\u0627\u0628\u060c \u0623\u0648 \u0627\u0644\u0631\u0645\u0632 \u0644\u0627 \u064a\u0641\u062a\u062d \u0635\u0641\u062d\u0629 \u0627\u0644\u0633\u0627\u0626\u0642\u061f \u0644\u0627 \u062a\u0631\u0643\u0628.',
  tip2: '\u0627\u062c\u0644\u0633 \u062e\u0644\u0641 \u0627\u0644\u0633\u0627\u0626\u0642 \u0648\u0627\u062d\u062a\u0641\u0638 \u0628\u062d\u0642\u064a\u0628\u062a\u0643 \u0645\u0639\u0643.',
  tip3: '\u0641\u064a \u0627\u0644\u0644\u064a\u0644\u060c \u0623\u0628\u0642\u0650 \u0647\u0627\u062a\u0641\u0643 \u0645\u0634\u062d\u0648\u0646\u064b\u0627 \u0648\u0634\u0627\u0631\u0643 \u0631\u062d\u0644\u062a\u0643.',
  tip4: '\u0641\u064a \u062e\u0637\u0631: \u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646\u060c \u0623\u0648 \u0627\u062a\u0635\u0644 \u0628\u0627\u0644\u0634\u0631\u0637\u0629 (117) \u0623\u0648 \u0628\u0627\u0644\u062f\u0631\u0643 (113).',
  privacy: '\u0644\u0627 \u064a\u0631\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0623\u0628\u062f\u064b\u0627 \u0627\u0644\u0631\u0645\u0632 \u0648\u0644\u0627 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0648\u0644\u0627 \u0631\u062d\u0644\u062a\u0643 \u0648\u0644\u0627 \u0645\u0643\u0627\u0646\u0643. \u062a\u0628\u0642\u0649 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641 \u0648\u0644\u0627 \u062a\u0630\u0647\u0628 \u0625\u0644\u0627 \u0625\u0644\u0649 \u0645\u0646 \u062a\u062e\u062a\u0627\u0631\u0647\u0645.',
  peopleTitle: '\u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0627\u0644\u0630\u064a\u0646 \u0623\u062b\u0642 \u0628\u0647\u0645',
  peopleHelp: '\u0646\u0641\u0633 \u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0641\u064a \u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646. \u0645\u062d\u0641\u0648\u0638\u0648\u0646 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641 \u0641\u0642\u0637.',
  name: '\u0627\u0644\u0627\u0633\u0645',
  namePh: '\u0645\u062b\u0627\u0644: \u0623\u062e\u062a\u064a \u063a\u0631\u064a\u0633',
  phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
  phonePh: '677 12 34 56',
  add: '\u0625\u0636\u0627\u0641\u0629',
  remove: '\u0625\u0632\u0627\u0644\u0629',
  badPhone: '\u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641: 9 \u0623\u0631\u0642\u0627\u0645 \u0644\u0644\u0643\u0627\u0645\u064a\u0631\u0648\u0646 (\u064a\u0628\u062f\u0623 \u0628\u0640 6 \u0623\u0648 2)\u060c \u0623\u0648 + \u0648\u0631\u0645\u0632 \u0627\u0644\u0628\u0644\u062f.',
  badName: '\u0627\u0643\u062a\u0628 \u0627\u0633\u0645\u064b\u0627 (\u0645\u0646 1 \u0625\u0644\u0649 40 \u062d\u0631\u0641\u064b\u0627).',
  full: '\u062e\u0645\u0633\u0629 \u0623\u0634\u062e\u0627\u0635 \u0643\u062d\u062f \u0623\u0642\u0635\u0649.',
  already: '\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u0645\u0648\u062c\u0648\u062f \u0628\u0627\u0644\u0641\u0639\u0644 \u0641\u064a \u0642\u0627\u0626\u0645\u062a\u0643.',
  safety: '\u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646',
  account: '\u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u062c\u0627\u0646\u064a - \u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a',
  msgStart: 'BAMBEH TAXI - {time}: \u0623\u0631\u0643\u0628 \u0633\u064a\u0627\u0631\u0629 \u0623\u062c\u0631\u0629 \u0627\u0644\u0622\u0646.',
  msgDoor: '\u0631\u0642\u0645 \u0627\u0644\u0628\u0627\u0628: {x}.',
  msgPlate: '\u0627\u0644\u0644\u0648\u062d\u0629: {x}.',
  msgCode: '\u0631\u0645\u0632 \u0627\u0644\u0633\u0627\u0626\u0642: {x}',
  msgNotes: '\u0645\u0644\u0627\u062d\u0638\u0629: {x}.',
  msgWhere: '\u0627\u0644\u0645\u0643\u0627\u0646 \u0627\u0644\u0630\u064a \u0631\u0643\u0628\u062a \u0645\u0646\u0647: {x}',
  msgBy: '\u064a\u062c\u0628 \u0623\u0646 \u0623\u0635\u0644 \u0646\u062d\u0648 \u0627\u0644\u0633\u0627\u0639\u0629 {time}. \u0625\u0630\u0627 \u0644\u0645 \u062a\u0633\u0645\u0639 \u0645\u0646\u064a \u062d\u062a\u0649 \u0630\u0644\u0643 \u0627\u0644\u0648\u0642\u062a\u060c \u0641\u0627\u062a\u0635\u0644 \u0628\u064a. \u0648\u0625\u0630\u0627 \u0644\u0645 \u0623\u062c\u0628\u060c \u0641\u0627\u062a\u0635\u0644 \u0628\u0627\u0644\u0634\u0631\u0637\u0629 (117) \u0648\u0623\u0639\u0637\u0647\u0645 \u0647\u0630\u0647 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a.',
  msgArrived: 'BAMBEH TAXI - {time}: \u0648\u0635\u0644\u062a \u0628\u0633\u0644\u0627\u0645. \u0634\u0643\u0631\u064b\u0627.',
};

const FF: Record<Key, string> = {
  title: '\u01b3eew taksi maa',
  intro: 'Adii naataa: \u01b4eewnu kod taksi oo e kamera, \u01b4eew dogoowo oo, neldu humpito taksi oo to yim\u0253e \u0253e hooloto\u0257aa.',
  back: 'Rutto',
  step1: '1. \u01b3eewnu kod taksi oo',
  step1Help: 'Nder Yaawunde, taksi kala winndaa\u0257o jogii jooni kod QR saare nde (Taxi-Yaound\u00e9) e limoore damal. \u01b3eewnude kod oo ina hollira moy woni dogoowo oo.',
  scan: '\u01b3eewnu kod oo',
  scanning: 'Fewnu kamera to kod oo',
  closeCam: 'Uddu kamera',
  light: 'Jaynge',
  photo: 'Natu kod oo kanjum',
  reading: 'Ina janngee natal ngal...',
  photoFail: 'Kod alaa e ndee natal. Eto kadi \u0253adaade, e jaynge \u0253urnde - walla winndu limoore damal.',
  camUnsupported: 'Ndee telefon waawaa udditde kamera \u0257oo. Natu kod oo, walla winndu limoore damal.',
  camDenied: 'Kamera uddaama wonande Bambeh. Accu \u0257um e teeltirgol telefon maa - walla natu kod oo, walla winndu limoore damal.',
  camNone: 'Kamera he\u0253aaka. Natu kod oo, walla winndu limoore damal.',
  camBusy: 'Aplikasiyo\u014b goo ina huutoroo kamera. Uddu \u0257um, eto kadi.',
  camFailed: 'Kamera udditaaki. Natu kod oo, walla winndu limoore damal.',
  codeLink: 'Ndee kod ina uddita:',
  official: 'Deftere taksi saare Yaawunde (Taxi-Yaound\u00e9)',
  notOfficial: 'Bambeh anndaa ndee lowre. Kod goonga ina iwra e saare Yaawunde (Taxi-Yaound\u00e9). \u01b3eewto no feewi.',
  openPage: 'Uddit hello dogoowo oo',
  checkHint: '\u01b3eewto hello oo ina hollira dogoowo oo e limoore damal taksi oo. So wonaa non, wota a naat.',
  codeText: 'Kod oo ina wi\u2019a:',
  rescan: '\u01b3eewnu kadi',
  step2: '2. Taksi oo',
  door: 'Limoore damal',
  doorPh: 'Limoore dow damal oo',
  plate: 'Limoore plak (so a yiyii nde)',
  platePh: 'mbaydi: CE 123 AB',
  notes: 'Huunde goo (so a faalaama)',
  notesPh: 'mbaydi: Toyota ndaneeri, dogoowo ina \u0253orni simis bulaajo',
  arrive: 'Mi foti yottaade nder',
  arr30: 'minitiiji 30',
  arr60: 'waktu 1',
  arr120: 'waktuuji 2',
  arr180: 'waktuuji 3',
  arr360: 'waktuuji 6',
  addPlace: '\u0181eydu nokku ka mi naatata (nokku)',
  step3: '3. Neldu \u0257um to yim\u0253e maa',
  needSomething: '\u01b3eewnu kod oo walla winndu limoore damal adii.',
  choose: 'Moy he\u0253ata \u0257um',
  noPeople: '\u0181eydu hay ne\u0257\u0257o gooto mo hooloto\u0257aa (\u0253e heddoo e ndee telefon).',
  send: 'Neldu e SMS',
  sendSub: 'Ina golloo tawa data alaa - kredit tan',
  whatsapp: 'Neldu e WhatsApp kanjum (ina sokli data)',
  opened: 'Aplikasiyo\u014b SMS maa foti udditaade jooni, mesaas oo ina hebli: \u00f1o\u01b4\u01b4u Neldu.',
  openSms: 'Uddit SMS oo kadi',
  eachTitle: 'Walla neldu \u0257um ne\u0257\u0257o e ne\u0257\u0257o:',
  locating: 'Ina yiyloo nokku maa...',
  noLoc: 'Nokku maa he\u0253aaka - mesaas oo ina yaha tawa alaa \u0257um.',
  tripTitle: 'Taksi maa',
  tripStarted: 'A naatii saa\u2019a {time}',
  tripBy: 'A foti yottaade saa\u2019a {time}',
  tripLate: 'Saa\u2019a {time} \u0253ennii. Anndin yim\u0253e maa wonde a woni mo\u01b4\u01b4a - walla \u00f1o\u01b4\u01b4u Buto\u014b kisal.',
  arrived: 'Mi yottiima no mo\u01b4\u01b4i',
  arrivedSub: 'Anndin yim\u0253e am (SMS)',
  arrivedDone: 'A anndinii yim\u0253e maa wonde a yottiima saa\u2019a {time}.',
  wrong: 'Huunde mo\u01b4\u01b4aani',
  call117: 'Polis 117',
  forget: 'Momtu ndee yahdu jooni',
  forgetConfirm: 'Momtu ndee yahdu e ndee telefon?',
  kept24: 'Ndee yahdu ina heddoo e ndee telefon waktuuji 24, caggal \u0257um nde momtoto hoore mum.',
  why: 'Ko wa\u0257i neldude adii yahdu?',
  whyBody: 'So telefon maa maayii, so wujjaama walla majji nder yahdu, yim\u0253e maa jogii humpito taksi oo tawo, ina anndi mande a foti yottaade. Bambeh waawaa neldude hay huunde wonande ma caggal: danndataa yahdu maa fey.',
  tipsTitle: 'Taksi \u0253ur\u0257o kisal',
  tip1: 'Limoore alaa dow damal, walla kod oo udditaani hello dogoowo oo? Wota a naat.',
  tip2: 'Joo\u0257o caggal dogoowo oo, jogo saak maa e maa.',
  tip3: 'Jemma, wa\u0257 telefon maa ina jogii doole, anndin yahdu maa.',
  tip4: 'Ca\u0257eele: Buto\u014b kisal, walla noddu polis (117) walla jandarmeri (113).',
  privacy: 'Bambeh yiyataa kod oo, limooje \u0257ee, yahdu maa walla nokku maa fey. \u018ae heddoo e ndee telefon, \u0257e njahata to yim\u0253e \u0253e cu\u0253\u0257aa tan.',
  peopleTitle: 'Yim\u0253e \u0253e mi hooli',
  peopleHelp: 'Yim\u0253e \u0253ee \u0253e Buto\u014b kisal. \u0181e danndaa e ndee telefon tan.',
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
  safety: 'Buto\u014b kisal',
  account: 'Bambeh ko meere - wa\u0257 konte maa meere',
  msgStart: 'BAMBEH TAXI - {time}: mi naatata taksi jooni.',
  msgDoor: 'Limoore damal: {x}.',
  msgPlate: 'Plak: {x}.',
  msgCode: 'Kod dogoowo: {x}',
  msgNotes: 'Ko \u0253eydi: {x}.',
  msgWhere: 'Ka mi naati: {x}',
  msgBy: 'Mi foti yottaade saa\u2019a {time}. So a nanaani kam haa \u0257um, noddu kam. So mi jaabaani, noddu polis (117), hokku \u0253e humpito \u0257ee.',
  msgArrived: 'BAMBEH TAXI - {time}: mi yottiima no mo\u01b4\u01b4i. A jaaraama.',
};

export const TAXI_TEXT: Record<Lang, Record<Key, string>> = { en: EN, fr: FR, pidgin: PIDGIN, ar: AR, ff: FF };

function fill(s: string, vars: Record<string, string>): string {
  let out = s;
  for (const k of Object.keys(vars)) out = out.split('{' + k + '}').join(vars[k]);
  return out;
}

/** "14:05", Cameroon time. */
export function doualaClock(d: Date): string {
  try {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Douala' });
  } catch {
    return new Date(d.getTime() + 3600 * 1000).toISOString().slice(11, 16);
  }
}

// ------------------------------------------------------------------ the trip, kept on this phone only
export const TRIP_KEY = 'bambeh_taxi_trip';
const TRIP_HOURS = 24;
export const ARRIVE_CHOICES: ReadonlyArray<{ minutes: number; key: Key }> = [
  { minutes: 30, key: 'arr30' }, { minutes: 60, key: 'arr60' }, { minutes: 120, key: 'arr120' },
  { minutes: 180, key: 'arr180' }, { minutes: 360, key: 'arr360' },
];

export interface Trip {
  at: string;
  by: string;
  door: string;
  plate: string;
  notes: string;
  code: string;
  people: string[];
  arrivedAt: string | null;
}

function okDate(s: unknown): s is string {
  return typeof s === 'string' && !isNaN(Date.parse(s));
}

/** The last trip, if it is less than 24 hours old (an older one is deleted on the way). */
export function loadTrip(now: number = Date.now()): Trip | null {
  try {
    const raw = window.localStorage.getItem(TRIP_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Trip>;
    if (!v || !okDate(v.at) || !okDate(v.by) || now - Date.parse(v.at) > TRIP_HOURS * 3600 * 1000 || Date.parse(v.at) > now + 60000) {
      window.localStorage.removeItem(TRIP_KEY);
      return null;
    }
    const str = (x: unknown, n: number) => (typeof x === 'string' ? x.slice(0, n) : '');
    return {
      at: v.at, by: v.by, door: str(v.door, 30), plate: str(v.plate, 20), notes: str(v.notes, 120), code: str(v.code, 1000),
      people: Array.isArray(v.people) ? v.people.filter((p): p is string => typeof p === 'string' && normPhone(p) !== null).slice(0, 5) : [],
      arrivedAt: okDate(v.arrivedAt) ? v.arrivedAt : null,
    };
  } catch {
    return null;
  }
}

export function saveTrip(t: Trip): void {
  try { window.localStorage.setItem(TRIP_KEY, JSON.stringify(t)); } catch { /* not kept - the SMS already carries everything */ }
}

export function clearTrip(): void {
  try { window.localStorage.removeItem(TRIP_KEY); } catch { /* nothing kept */ }
}

/** One line for the code in a message: the link as it is, or the first 160 letters of a text code. */
export function codeForMessage(code: string): string {
  const c = readCode(code);
  if (c.kind === 'link') return c.url.slice(0, 300);
  return c.text.replace(/\s+/g, ' ').slice(0, 160);
}

/** The message her people get before the ride. */
export function tripMessage(lang: Lang, trip: Trip, where: { lat: number; lng: number } | null): string {
  const t = TAXI_TEXT[lang];
  const lines = [fill(t.msgStart, { time: doualaClock(new Date(trip.at)) })];
  if (trip.door.trim()) lines.push(fill(t.msgDoor, { x: trip.door.trim() }));
  if (trip.plate.trim()) lines.push(fill(t.msgPlate, { x: trip.plate.trim() }));
  if (trip.code.trim()) lines.push(fill(t.msgCode, { x: codeForMessage(trip.code) }));
  if (trip.notes.trim()) lines.push(fill(t.msgNotes, { x: trip.notes.trim() }));
  if (where) lines.push(fill(t.msgWhere, { x: mapLink(where.lat, where.lng) }));
  lines.push(fill(t.msgBy, { time: doualaClock(new Date(trip.by)) }));
  return lines.join('\n');
}

export function arrivedMessage(lang: Lang, at: Date): string {
  return fill(TAXI_TEXT[lang].msgArrived, { time: doualaClock(at) });
}

/** A Bambeh session saved on this phone (supabase-js keeps it as sb-<project>-auth-token). */
function savedSession(): boolean {
  try {
    const ls = window.localStorage;
    if (!ls || typeof ls.length !== 'number' || typeof ls.key !== 'function') return false;
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (k && /^sb-[a-z0-9]+-auth-token$/i.test(k) && ls.getItem(k)) return true;
    }
  } catch {
    // storage blocked: no saved session
  }
  return false;
}

// ------------------------------------------------------------------ the camera
function CameraScan({ t, dir, onCode, onProblem, onClose }: {
  t: Record<Key, string>; dir: 'rtl' | 'ltr'; onCode: (text: string) => void; onProblem: (p: CameraProblem) => void; onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [torch, setTorch] = useState<OpenCamera['torch']>(null);
  const [lightOn, setLightOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let cam: OpenCamera | null = null;
    let timer = 0;
    const canvas = document.createElement('canvas');
    void (async () => {
      try {
        const video = videoRef.current;
        if (!video) throw new Error('unsupported');
        cam = await openCamera(video);
        if (!alive) { cam.stop(); return; }
        const cameraNow = cam;
        setTorch(() => cameraNow.torch);
        setReady(true);
        const native = await nativeDetector();
        const tick = async () => {
          if (!alive) return;
          try {
            if (video.readyState >= 2 && video.videoWidth > 0
                && drawScaled(canvas, video, video.videoWidth, video.videoHeight, native ? 960 : 640)) {
              const text = await decodeCanvas(canvas, !!native);
              if (text && alive) {
                alive = false;
                try { if (typeof navigator.vibrate === 'function') navigator.vibrate(60); } catch { /* no vibration */ }
                cameraNow.stop();
                onCode(text);
                return;
              }
            }
          } catch {
            // one bad frame: try the next one
          }
          if (alive) timer = window.setTimeout(() => void tick(), native ? 200 : 350);
        };
        void tick();
      } catch (e) {
        if (alive) onProblem(cameraProblem(e));
      }
    })();
    return () => {
      alive = false;
      window.clearTimeout(timer);
      if (cam) cam.stop();
    };
    // the camera opens once for this overlay; the callbacks are stable for its lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLight = async () => {
    if (!torch) return;
    const ok = await torch(!lightOn);
    if (ok) setLightOn(!lightOn);
  };

  return (
    <div dir={dir} className="fixed inset-0 z-50 flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={t.scanning} data-camera="1">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 max-w-[75vw] rounded-3xl border-4 border-yellow-300/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
        </div>
        <p className="absolute inset-x-0 top-6 px-6 text-center text-base font-bold text-white drop-shadow">
          {ready ? t.scanning : <Loader2 className="mx-auto h-6 w-6 animate-spin" aria-hidden="true" />}
        </p>
      </div>
      <div className="relative z-10 flex items-center justify-center gap-3 bg-black px-4 py-4 pb-8">
        {torch && (
          <button type="button" onClick={() => void toggleLight()} aria-pressed={lightOn} data-light="1"
                  className={'inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ' + (lightOn ? 'bg-yellow-300 text-gray-900' : 'bg-white/15 text-white')}>
            <Flashlight className="h-5 w-5" aria-hidden="true" />{t.light}
          </button>
        )}
        <button type="button" onClick={onClose} data-close-camera="1"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-gray-900">
          <X className="h-5 w-5" aria-hidden="true" />{t.closeCam}
        </button>
      </div>
    </div>
  );
}

const PROBLEM_KEY: Record<CameraProblem | 'photo', Key> = {
  unsupported: 'camUnsupported', denied: 'camDenied', none: 'camNone', busy: 'camBusy', failed: 'camFailed', photo: 'photoFail',
};

export default function TaxiCheck() {
  const lang = normLang(useLang());
  const t = TAXI_TEXT[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // no guest-day clock here (FIX730): a safety tool is never closed, it only offers the free account
  const signedIn = !!(user && user.id) || savedSession();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [people, setPeople] = useState<TrustedPerson[]>(loadPeople);
  const [chosen, setChosen] = useState<string[]>(() => loadPeople().map((p) => p.phone));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const [camera, setCamera] = useState(false);
  const [problem, setProblem] = useState<CameraProblem | 'photo' | null>(null);
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [code, setCode] = useState('');
  const [door, setDoor] = useState('');
  const [plate, setPlate] = useState('');
  const [notes, setNotes] = useState('');
  const [minutes, setMinutes] = useState(120);
  const [withPlace, setWithPlace] = useState(false);

  const [trip, setTrip] = useState<Trip | null>(() => loadTrip());
  const [sending, setSending] = useState<'idle' | 'locating' | 'ready'>('idle');
  const [message, setMessage] = useState('');
  const [noLoc, setNoLoc] = useState(false);
  const [needPeople, setNeedPeople] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // while a trip is open, notice when its arrival time passes
  useEffect(() => {
    if (!trip || trip.arrivedAt) return undefined;
    const id = window.setTimeout(() => setNow(Date.now()), 30000);
    return () => window.clearTimeout(id);
  }, [trip, now]);

  const scanned: ScannedCode | null = code ? readCode(code) : null;
  const hasTaxi = !!code.trim() || !!door.trim();
  const numbers = people.filter((p) => chosen.indexOf(p.phone) >= 0).map((p) => p.phone);

  const gotCode = (text: string) => {
    setCamera(false);
    setProblem(null);
    setCode(text.slice(0, 1000));
  };

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setReadingPhoto(true);
    setProblem(null);
    const text = await decodeImageFile(f);
    setReadingPhoto(false);
    if (text) gotCode(text); else setProblem('photo');
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
    setChosen(chosen.concat([p]));
    setName(''); setPhone(''); setFormMsg(null); setNeedPeople(false);
  };

  const remove = (p: string) => {
    const next = people.filter((x) => x.phone !== p);
    savePeople(next);
    setPeople(next);
    setChosen(chosen.filter((x) => x !== p));
  };

  const toggle = (p: string) => setChosen(chosen.indexOf(p) >= 0 ? chosen.filter((x) => x !== p) : chosen.concat([p]));

  const send = async () => {
    if (!hasTaxi) return;
    if (numbers.length === 0) { setNeedPeople(true); return; }
    setNeedPeople(false);
    const start = new Date();
    const next: Trip = {
      at: start.toISOString(), by: new Date(start.getTime() + minutes * 60000).toISOString(),
      door: door.trim().slice(0, 30), plate: plate.trim().slice(0, 20), notes: notes.trim().replace(/\s+/g, ' ').slice(0, 120),
      code: code.trim().slice(0, 1000), people: numbers, arrivedAt: null,
    };
    let where: { lat: number; lng: number } | null = null;
    if (withPlace) {
      setSending('locating');
      where = await findMe(8000);
      setNoLoc(!where);
    } else {
      setNoLoc(false);
    }
    const body = tripMessage(lang, next, where);
    saveTrip(next);
    setTrip(next);
    setMessage(body);
    setSending('ready');
    try { window.location.href = smsHref(numbers, body); } catch { /* the links below stay */ }
  };

  const markArrived = (at: Date) => {
    if (!trip) return;
    const done: Trip = { ...trip, arrivedAt: at.toISOString() };
    saveTrip(done);
    setTrip(done);
  };

  const arrived = () => {
    if (!trip) return;
    const at = new Date();
    markArrived(at);
    if (trip.people.length > 0) {
      try { window.location.href = smsHref(trip.people, arrivedMessage(lang, at)); } catch { /* the WhatsApp link stays */ }
    }
  };

  const forget = () => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function' && !window.confirm(t.forgetConfirm)) return;
    clearTrip();
    setTrip(null);
    setSending('idle');
    setMessage('');
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };

  const late = !!trip && !trip.arrivedAt && now > Date.parse(trip.by);
  const field = 'mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm';

  return (
    <>
    <div dir={dir} data-fix="FIX748" className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-28">
      <button type="button" onClick={goBack} className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />{t.back}
      </button>

      <header className="rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 p-5 text-gray-900 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/40"><Car className="h-6 w-6" /></span>
          <h1 className="text-2xl font-extrabold leading-tight">{t.title}</h1>
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-900">{t.intro}</p>
      </header>

      {trip && (
        <section className="space-y-3 rounded-3xl border-2 border-amber-400 bg-amber-50 p-4" data-trip={trip.arrivedAt ? 'arrived' : late ? 'late' : 'open'}>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900"><Car className="h-5 w-5 text-amber-700" />{t.tripTitle}</h2>
          <p className="text-sm text-gray-800">
            {fill(t.tripStarted, { time: doualaClock(new Date(trip.at)) })}
            {trip.door ? ' \u00b7 ' + t.door + ': ' + trip.door : ''}{trip.plate ? ' \u00b7 ' + trip.plate : ''}
          </p>
          {trip.arrivedAt ? (
            <p className="flex items-center gap-2 text-sm font-bold text-green-800" data-arrived-done="1">
              <CheckCircle2 className="h-4 w-4" />{fill(t.arrivedDone, { time: doualaClock(new Date(trip.arrivedAt)) })}
            </p>
          ) : (
            <>
              <p className={'text-sm font-semibold ' + (late ? 'text-red-700' : 'text-gray-700')} data-trip-by="1">
                {late ? fill(t.tripLate, { time: doualaClock(new Date(trip.by)) }) : fill(t.tripBy, { time: doualaClock(new Date(trip.by)) })}
              </p>
              <button type="button" onClick={arrived} data-arrived="1"
                      className="flex w-full flex-col items-center rounded-2xl bg-green-600 px-4 py-3 text-white shadow hover:bg-green-700">
                <span className="inline-flex items-center gap-2 text-lg font-extrabold"><CheckCircle2 className="h-5 w-5" />{t.arrived}</span>
                <span className="text-xs font-semibold text-green-50">{t.arrivedSub}</span>
              </button>
              <a href={waHref(arrivedMessage(lang, new Date(now)))} target="_blank" rel="noopener noreferrer" data-wa-arrived="1"
                 onClick={() => markArrived(new Date())}
                 className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 bg-white py-2 text-sm font-bold text-green-700">
                <MessageCircle className="h-4 w-4" />{t.whatsapp}
              </a>
            </>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Link to="/safety-button" data-go-safety="1"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-bold text-white">
              <Siren className="h-4 w-4" />{t.wrong}
            </Link>
            <a href="tel:117" data-sos="117" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-red-700 ring-1 ring-red-200">
              <Phone className="h-4 w-4" />{t.call117}
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-gray-600">{t.kept24}</p>
            <button type="button" onClick={forget} data-forget="1" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white">
              <Trash2 className="h-3.5 w-3.5" />{t.forget}
            </button>
          </div>
        </section>
      )}

      <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" data-step="1">
        <div>
          <h2 className="font-extrabold text-gray-900">{t.step1}</h2>
          <p className="text-xs text-gray-500">{t.step1Help}</p>
        </div>
        {!scanned ? (
          <>
            <button type="button" onClick={() => { setProblem(null); setCamera(true); }} data-scan="1"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-4 text-lg font-extrabold text-white shadow hover:bg-black">
              <ScanLine className="h-6 w-6" />{t.scan}
            </button>
            <button type="button" onClick={() => fileRef.current && fileRef.current.click()} disabled={readingPhoto} data-photo="1"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-800 disabled:opacity-60">
              {readingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}{readingPhoto ? t.reading : t.photo}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void onPhoto(e)} data-photo-input="1" />
          </>
        ) : scanned.kind === 'link' ? (
          <div className="space-y-2" data-code="link">
            <p className="text-xs font-bold text-gray-600">{t.codeLink}</p>
            <p className="break-all text-base font-extrabold text-gray-900" dir="ltr" data-host={scanned.host}>{scanned.host}</p>
            {scanned.official ? (
              <p className="flex items-start gap-2 rounded-xl bg-green-50 p-2 text-sm font-semibold text-green-800" data-official="1">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />{t.official}
              </p>
            ) : (
              <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-2 text-sm font-semibold text-amber-900" data-official="0">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />{t.notOfficial}
              </p>
            )}
            <a href={scanned.url} target="_blank" rel="noopener noreferrer" data-open-page="1"
               className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-base font-extrabold text-gray-900 shadow">
              <ExternalLink className="h-5 w-5" />{t.openPage}
            </a>
            <p className="text-xs text-gray-600">{t.checkHint}</p>
          </div>
        ) : (
          <div className="space-y-2" data-code="text">
            <p className="text-xs font-bold text-gray-600">{t.codeText}</p>
            <p className="whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-3 text-sm text-gray-900" dir="auto">{scanned.text}</p>
          </div>
        )}
        {scanned && (
          <button type="button" onClick={() => { setCode(''); setProblem(null); setCamera(true); }} data-rescan="1"
                  className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100">
            <Camera className="h-3.5 w-3.5" />{t.rescan}
          </button>
        )}
        {problem && <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900" role="alert" data-problem={problem}>{t[PROBLEM_KEY[problem]]}</p>}
      </section>

      <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" data-step="2">
        <h2 className="font-extrabold text-gray-900">{t.step2}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-bold text-gray-600">
            {t.door}
            <input value={door} onChange={(e) => setDoor(e.target.value.slice(0, 30))} placeholder={t.doorPh} maxLength={30} data-f="door" className={field} />
          </label>
          <label className="text-xs font-bold text-gray-600">
            {t.plate}
            <input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase().slice(0, 20))} placeholder={t.platePh} maxLength={20} dir="ltr" data-f="plate" className={field} />
          </label>
        </div>
        <label className="block text-xs font-bold text-gray-600">
          {t.notes}
          <input value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 120))} placeholder={t.notesPh} maxLength={120} data-f="notes" className={field} />
        </label>
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-600">{t.arrive}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.arrive}>
            {ARRIVE_CHOICES.map((c) => (
              <button key={c.minutes} type="button" onClick={() => setMinutes(c.minutes)} aria-pressed={minutes === c.minutes} data-minutes={c.minutes}
                      className={'rounded-full px-3 py-1.5 text-sm font-bold ' + (minutes === c.minutes ? 'bg-amber-500 text-gray-900' : 'border border-gray-200 bg-white text-gray-700')}>
                {t[c.key]}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <input type="checkbox" checked={withPlace} onChange={(e) => setWithPlace(e.target.checked)} data-f="place" />
          <MapPin className="h-4 w-4 text-gray-500" />{t.addPlace}
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" data-step="3">
        <div>
          <h2 className="font-extrabold text-gray-900">{t.step3}</h2>
          <p className="text-xs text-gray-500">{t.peopleHelp}</p>
        </div>
        {people.length > 0 && (
          <div className="space-y-1" role="group" aria-label={t.choose}>
            <p className="text-xs font-bold text-gray-600">{t.choose}</p>
            <ul className="divide-y divide-gray-100">
              {people.map((p) => (
                <li key={p.phone} className="flex items-center justify-between gap-2 py-2" data-person={p.phone}>
                  <label className="flex min-w-0 items-center gap-2">
                    <input type="checkbox" checked={chosen.indexOf(p.phone) >= 0} onChange={() => toggle(p.phone)} data-choose={p.phone} />
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-gray-900">{p.name}</span>
                      <span className="block text-xs text-gray-500" dir="ltr">{fmtNumber(p.phone)}</span>
                    </span>
                  </label>
                  <button type="button" onClick={() => remove(p.phone)} data-remove={p.phone}
                          className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100">
                    <X className="h-3.5 w-3.5" />{t.remove}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {people.length < MAX_PEOPLE && (
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs font-bold text-gray-600">
              {t.name}
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder={t.namePh} maxLength={40} data-f="name" className={field} />
            </label>
            <label className="text-xs font-bold text-gray-600">
              {t.phone}
              <input value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 20))} placeholder={t.phonePh} inputMode="tel" dir="ltr" data-f="phone" className={field} />
            </label>
            <button type="button" onClick={add} data-add="1"
                    className="inline-flex items-center justify-center gap-1.5 self-end rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white">
              <UserPlus className="h-4 w-4" />{t.add}
            </button>
          </div>
        )}
        {formMsg && <p className="text-sm font-semibold text-gray-700" role="status" data-form-msg="1">{formMsg}</p>}
        {(needPeople || people.length === 0) && <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900" data-need-people="1">{t.noPeople}</p>}
        {!hasTaxi && <p className="text-sm font-semibold text-gray-500" data-need-taxi="1">{t.needSomething}</p>}

        <button type="button" onClick={() => void send()} disabled={!hasTaxi || sending === 'locating'} data-send="1"
                className="flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl bg-amber-500 px-4 py-4 text-gray-900 shadow-lg hover:bg-amber-400 disabled:opacity-50">
          <span className="inline-flex items-center gap-2 text-xl font-extrabold">
            {sending === 'locating' ? <Loader2 className="h-6 w-6 animate-spin" /> : <MessageCircle className="h-6 w-6" />}{t.send}
          </span>
          <span className="text-xs font-semibold">{sending === 'locating' ? t.locating : t.sendSub}</span>
        </button>

        {sending === 'ready' && message && (
          <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3" role="status" data-sent="1">
            {noLoc && <p className="text-sm font-semibold text-amber-800" data-no-location="1">{t.noLoc}</p>}
            <p className="text-sm font-semibold text-gray-900">{t.opened}</p>
            <a href={smsHref(trip ? trip.people : numbers, message)} data-sms-all="1"
               className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-bold text-white">
              <MessageCircle className="h-5 w-5" />{t.openSms}
            </a>
            {(trip ? trip.people : numbers).length > 1 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-700">{t.eachTitle}</p>
                <div className="flex flex-wrap gap-2">
                  {people.filter((p) => (trip ? trip.people : numbers).indexOf(p.phone) >= 0).map((p) => (
                    <a key={p.phone} href={smsHref([p.phone], message)} data-sms-one={p.phone}
                       className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-gray-800">{p.name}</a>
                  ))}
                </div>
              </div>
            )}
            <a href={waHref(message)} target="_blank" rel="noopener noreferrer" data-wa="1"
               className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 bg-white py-2.5 text-sm font-bold text-green-700">
              <MessageCircle className="h-4 w-4" />{t.whatsapp}
            </a>
          </div>
        )}
      </section>

      <section className="space-y-1 rounded-2xl border border-blue-100 bg-blue-50 p-4" data-why="1">
        <h2 className="font-extrabold text-blue-950">{t.why}</h2>
        <p className="text-sm leading-6 text-blue-950">{t.whyBody}</p>
      </section>

      <section className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" data-tips="1">
        <h2 className="font-extrabold text-gray-900">{t.tipsTitle}</h2>
        <ul className="space-y-1.5">
          {[t.tip1, t.tip2, t.tip3, t.tip4].map((x) => (
            <li key={x} className="flex items-start gap-2 text-sm text-gray-900">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
              <span>{x}</span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a href="tel:117" data-sos="117" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-bold text-white">
            <Phone className="h-4 w-4" />117
          </a>
          <a href="tel:113" data-sos="113" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-bold text-white">
            <Phone className="h-4 w-4" />113
          </a>
        </div>
        <Link to="/safety-button" data-go-safety="2"
              className="flex items-center justify-center gap-2 rounded-xl border border-red-300 px-3 py-2.5 text-sm font-bold text-red-700">
          <Siren className="h-4 w-4" />{t.safety}
        </Link>
      </section>

      <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600" data-privacy="1">{t.privacy}</p>

      {!signedIn && (
        <Link to="/register" state={{ from: location }} data-account-line="1" className="block text-center text-sm font-bold text-teal-700 hover:underline">{t.account}</Link>
      )}
    </div>

    {/* outside the page column: its spacing must not move the full-screen camera */}
    {camera && (
      <CameraScan t={t} dir={dir} onCode={gotCode} onClose={() => setCamera(false)}
                  onProblem={(p) => { setCamera(false); setProblem(p); }} />
    )}
    </>
  );
}
// BAMBEH_END_TOKEN__TAXI_CHECK_FIX748__COMPLETE
