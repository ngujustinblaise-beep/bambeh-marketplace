// BAMBEH_DEPLOY_TOKEN__CALM_TEXT_FIX740_CLEAN
/**
 * src/features/womenshealth/calmText.ts - FIX740 (new)
 *
 * CALM TOOLS - the words of the page around the tools, in the five app languages (English,
 * French, Pidgin, Arabic right-to-left, Fulfulde). The tools themselves - their titles, steps
 * and notes - are NOT here: staff write them in Command Center > Women's health > Calm tools,
 * and the database (FIX737) shows a language only after an admin published it with the name of
 * the psychologist who checked it.
 *
 * Big, 12 Oct 2026: "we don't treat. will get a psychologist to check and point people to health
 * units for follow up". Big, 14 Oct 2026: staff add, edit and delete the tools from the Command
 * Center.
 *
 * Pidgin, Arabic and Fulfulde are drafts: a speaker should read them. Words are written as \u
 * escapes on purpose, so the file stays plain ASCII.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useLang } from '@/hooks/useAppLang';
import { normWhLang, whDir } from './whText';
import type { WhLang } from './whText';

export type CalmKind = 'help' | 'breathe' | 'steps' | 'list';
export const CALM_KINDS: readonly CalmKind[] = ['help', 'breathe', 'steps', 'list'];
export function isCalmKind(v: unknown): v is CalmKind {
  return typeof v === 'string' && (CALM_KINDS as readonly string[]).indexOf(v) >= 0;
}

const EN = {
  title: 'Calm tools',
  subtitle: 'Short exercises for hard moments. Bambeh does not treat: for care, see a health worker.',
  cardTitle: 'Calm tools',
  cardSub: 'Slow breathing, a heavy thought, better sleep - and when to get help.',
  cardPreview: 'Staff preview: not open to the public yet.',
  privacy: 'Nothing you do here leaves your phone. Bambeh only counts how many times each tool is opened - never who.',
  notOpen: 'Calm tools are not open yet. If you need help now, call one of the numbers below or go to the nearest hospital.',
  staffOff: 'Staff view: Calm tools are switched off for the public.',
  staffPreview: 'Staff preview of the DRAFTS - the public never sees them.',
  previewBtn: 'See the drafts',
  publicBtn: 'See what the public sees',
  draftTag: 'Draft',
  hiddenTag: 'Hidden',
  notLiveTag: 'Not published',
  checkedBy: 'Checked by {name} ({role}), {date}.',
  otherLang: 'Not yet checked in your language - shown in {lang}.',
  open: 'Open',
  allTools: 'All calm tools',
  getHelp: 'When to get help',
  start: 'Start',
  stop: 'Stop',
  again: 'Start again',
  next: 'Next',
  back: 'Back',
  done: 'Done',
  stepOf: 'Step {n} of {total}',
  showAll: 'Show all the steps',
  oneByOne: 'One step at a time',
  breatheIn: 'Breathe in',
  breatheOut: 'Breathe out',
  minutes: '{n} min',
  timeLeft: '{t} left',
  breatheDone: 'Well done. Notice how your body feels now.',
  finished: 'Well done. Come back to this whenever you need it.',
  findListening: 'Find a listening centre',
  findHospital: 'Hospitals on duty',
  acctBody: 'Calm tools are free. Create your free Bambeh account, or sign in, to keep using them. "When to get help" stays open to everyone.',
  offlineSaved: 'No connection. Saved on this phone on {date}.',
  offlineNone: 'No connection, and nothing saved on this phone yet. Open this page once with a connection: after that it works without data.',
  noTools: 'No calm tool here yet.',
  k_help: 'Get help',
  k_breathe: 'Breathing',
  k_steps: 'Step by step',
  k_list: 'Tips',
};

export type CalmKey = keyof typeof EN;
type Table = Record<CalmKey, string>;

const FR: Table = {
  title: 'Outils de calme',
  subtitle: 'De courts exercices pour les moments difficiles. Bambeh ne soigne pas : pour des soins, voyez un agent de sant\u00e9.',
  cardTitle: 'Outils de calme',
  cardSub: 'Respiration lente, pens\u00e9e lourde, mieux dormir - et quand demander de l\u2019aide.',
  cardPreview: 'Aper\u00e7u du personnel : pas encore ouvert au public.',
  privacy: 'Rien de ce que vous faites ici ne quitte votre t\u00e9l\u00e9phone. Bambeh compte seulement combien de fois chaque outil est ouvert - jamais par qui.',
  notOpen: 'Les outils de calme ne sont pas encore ouverts. Si vous avez besoin d\u2019aide maintenant, appelez un des num\u00e9ros ci-dessous ou allez \u00e0 l\u2019h\u00f4pital le plus proche.',
  staffOff: 'Vue du personnel : les outils de calme sont ferm\u00e9s au public.',
  staffPreview: 'Aper\u00e7u des BROUILLONS par le personnel - le public ne les voit jamais.',
  previewBtn: 'Voir les brouillons',
  publicBtn: 'Voir ce que voit le public',
  draftTag: 'Brouillon',
  hiddenTag: 'Masqu\u00e9',
  notLiveTag: 'Non publi\u00e9',
  checkedBy: 'V\u00e9rifi\u00e9 par {name} ({role}), le {date}.',
  otherLang: 'Pas encore v\u00e9rifi\u00e9 dans votre langue - affich\u00e9 en {lang}.',
  open: 'Ouvrir',
  allTools: 'Tous les outils de calme',
  getHelp: 'Quand demander de l\u2019aide',
  start: 'Commencer',
  stop: 'Arr\u00eater',
  again: 'Recommencer',
  next: 'Suivant',
  back: 'Retour',
  done: 'Termin\u00e9',
  stepOf: '\u00c9tape {n} sur {total}',
  showAll: 'Voir toutes les \u00e9tapes',
  oneByOne: 'Une \u00e9tape \u00e0 la fois',
  breatheIn: 'Inspirez',
  breatheOut: 'Expirez',
  minutes: '{n} min',
  timeLeft: 'Encore {t}',
  breatheDone: 'Bravo. Remarquez comment votre corps se sent maintenant.',
  finished: 'Bravo. Revenez-y chaque fois que vous en avez besoin.',
  findListening: 'Trouver un centre d\u2019\u00e9coute',
  findHospital: 'H\u00f4pitaux de garde',
  acctBody: 'Les outils de calme sont gratuits. Cr\u00e9ez votre compte Bambeh gratuit, ou connectez-vous, pour continuer \u00e0 les utiliser. \u00ab Quand demander de l\u2019aide \u00bb reste ouvert \u00e0 tous.',
  offlineSaved: 'Pas de connexion. Enregistr\u00e9 sur ce t\u00e9l\u00e9phone le {date}.',
  offlineNone: 'Pas de connexion, et rien d\u2019enregistr\u00e9 sur ce t\u00e9l\u00e9phone pour l\u2019instant. Ouvrez cette page une fois avec une connexion : ensuite, elle marche sans donn\u00e9es.',
  noTools: 'Aucun outil de calme ici pour l\u2019instant.',
  k_help: 'Aide',
  k_breathe: 'Respiration',
  k_steps: '\u00c9tape par \u00e9tape',
  k_list: 'Conseils',
};

const PIDGIN: Table = {
  title: 'Calm tools',
  subtitle: 'Short exercises for hard times. Bambeh no di treat: for treatment, go see health worker.',
  cardTitle: 'Calm tools',
  cardSub: 'Slow breathing, heavy thought, better sleep - and when for go find help.',
  cardPreview: 'Staff preview: e never open for public.',
  privacy: 'Nothing weh you do here di comot for your phone. Bambeh di only count how many times people open each tool - never who.',
  notOpen: 'Calm tools never open yet. If you need help now, call one of the numbers for down or go for the hospital weh e near you.',
  staffOff: 'Staff view: Calm tools dem close for public.',
  staffPreview: 'Staff preview of the DRAFTS - public no di ever see dem.',
  previewBtn: 'See the drafts',
  publicBtn: 'See wetin public di see',
  draftTag: 'Draft',
  hiddenTag: 'Hidden',
  notLiveTag: 'No publish',
  checkedBy: '{name} ({role}) check am, {date}.',
  otherLang: 'Dem never check am for your language - e dey for {lang}.',
  open: 'Open',
  allTools: 'All calm tools',
  getHelp: 'When for go find help',
  start: 'Start',
  stop: 'Stop',
  again: 'Start again',
  next: 'Next',
  back: 'Back',
  done: 'Finish',
  stepOf: 'Step {n} for {total}',
  showAll: 'Show all the steps',
  oneByOne: 'One step one step',
  breatheIn: 'Breathe in',
  breatheOut: 'Breathe out',
  minutes: '{n} min',
  timeLeft: '{t} remain',
  breatheDone: 'Well done. Notice how your body di feel now.',
  finished: 'Well done. Come back here any time weh you need am.',
  findListening: 'Find listening centre',
  findHospital: 'Hospital wey dey on duty',
  acctBody: 'Calm tools dem free. Make your free Bambeh account, or sign in, for continue use dem. "When for go find help" go stay open for everybody.',
  offlineSaved: 'No connection. E save for this phone for {date}.',
  offlineNone: 'No connection, and nothing save for this phone yet. Open this page one time with connection: after that e go work without data.',
  noTools: 'No calm tool here yet.',
  k_help: 'Help',
  k_breathe: 'Breathing',
  k_steps: 'Step by step',
  k_list: 'Advice',
};

const AR: Table = {
  title: '\u0623\u062f\u0648\u0627\u062a \u0627\u0644\u062a\u0647\u062f\u0626\u0629',
  subtitle: '\u062a\u0645\u0627\u0631\u064a\u0646 \u0642\u0635\u064a\u0631\u0629 \u0644\u0644\u0623\u0648\u0642\u0627\u062a \u0627\u0644\u0635\u0639\u0628\u0629. \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0627 \u062a\u0639\u0627\u0644\u062c: \u0644\u0644\u0639\u0644\u0627\u062c\u060c \u0631\u0627\u062c\u0639 \u0639\u0627\u0645\u0644\u064b\u0627 \u0635\u062d\u064a\u064b\u0627.',
  cardTitle: '\u0623\u062f\u0648\u0627\u062a \u0627\u0644\u062a\u0647\u062f\u0626\u0629',
  cardSub: '\u0627\u0644\u062a\u0646\u0641\u0633 \u0627\u0644\u0628\u0637\u064a\u0621\u060c \u0627\u0644\u0641\u0643\u0631\u0629 \u0627\u0644\u062b\u0642\u064a\u0644\u0629\u060c \u0646\u0648\u0645 \u0623\u0641\u0636\u0644 - \u0648\u0645\u062a\u0649 \u062a\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629.',
  cardPreview: '\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646: \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u0644\u0644\u062c\u0645\u0647\u0648\u0631 \u0628\u0639\u062f.',
  privacy: '\u0644\u0627 \u0634\u064a\u0621 \u0645\u0645\u0627 \u062a\u0641\u0639\u0644\u0647 \u0647\u0646\u0627 \u064a\u063a\u0627\u062f\u0631 \u0647\u0627\u062a\u0641\u0643. \u062a\u062d\u0633\u0628 \u0628\u0627\u0645\u0628\u064a\u0647 \u0641\u0642\u0637 \u0639\u062f\u062f \u0645\u0631\u0627\u062a \u0641\u062a\u062d \u0643\u0644 \u0623\u062f\u0627\u0629 - \u0648\u0644\u0627 \u062a\u0639\u0631\u0641 \u0623\u0628\u062f\u064b\u0627 \u0645\u0646 \u0641\u062a\u062d\u0647\u0627.',
  notOpen: '\u0623\u062f\u0648\u0627\u062a \u0627\u0644\u062a\u0647\u062f\u0626\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u0628\u0639\u062f. \u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0622\u0646\u060c \u0641\u0627\u062a\u0635\u0644 \u0628\u0623\u062d\u062f \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0623\u062f\u0646\u0627\u0647 \u0623\u0648 \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0623\u0642\u0631\u0628 \u0645\u0633\u062a\u0634\u0641\u0649.',
  staffOff: '\u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646: \u0623\u062f\u0648\u0627\u062a \u0627\u0644\u062a\u0647\u062f\u0626\u0629 \u0645\u063a\u0644\u0642\u0629 \u0623\u0645\u0627\u0645 \u0627\u0644\u062c\u0645\u0647\u0648\u0631.',
  staffPreview: '\u0645\u0639\u0627\u064a\u0646\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646 \u0644\u0644\u0645\u0633\u0648\u062f\u0627\u062a - \u0644\u0627 \u064a\u0631\u0627\u0647\u0627 \u0627\u0644\u062c\u0645\u0647\u0648\u0631 \u0623\u0628\u062f\u064b\u0627.',
  previewBtn: '\u0639\u0631\u0636 \u0627\u0644\u0645\u0633\u0648\u062f\u0627\u062a',
  publicBtn: '\u0639\u0631\u0636 \u0645\u0627 \u064a\u0631\u0627\u0647 \u0627\u0644\u062c\u0645\u0647\u0648\u0631',
  draftTag: '\u0645\u0633\u0648\u062f\u0629',
  hiddenTag: '\u0645\u062e\u0641\u064a\u0629',
  notLiveTag: '\u063a\u064a\u0631 \u0645\u0646\u0634\u0648\u0631\u0629',
  checkedBy: '\u0631\u0627\u062c\u0639\u0647\u0627 {name} ({role})\u060c {date}.',
  otherLang: '\u0644\u0645 \u062a\u064f\u0631\u0627\u062c\u064e\u0639 \u0628\u0639\u062f \u0628\u0644\u063a\u062a\u0643 - \u0645\u0639\u0631\u0648\u0636\u0629 \u0628\u0627\u0644\u0644\u063a\u0629: {lang}.',
  open: '\u0641\u062a\u062d',
  allTools: '\u0643\u0644 \u0623\u062f\u0648\u0627\u062a \u0627\u0644\u062a\u0647\u062f\u0626\u0629',
  getHelp: '\u0645\u062a\u0649 \u062a\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629',
  start: '\u0627\u0628\u062f\u0623',
  stop: '\u062a\u0648\u0642\u0641',
  again: '\u0627\u0628\u062f\u0623 \u0645\u0646 \u062c\u062f\u064a\u062f',
  next: '\u0627\u0644\u062a\u0627\u0644\u064a',
  back: '\u0631\u062c\u0648\u0639',
  done: '\u062a\u0645',
  stepOf: '\u0627\u0644\u062e\u0637\u0648\u0629 {n} \u0645\u0646 {total}',
  showAll: '\u0639\u0631\u0636 \u0643\u0644 \u0627\u0644\u062e\u0637\u0648\u0627\u062a',
  oneByOne: '\u062e\u0637\u0648\u0629 \u0648\u0627\u062d\u062f\u0629 \u0641\u064a \u0643\u0644 \u0645\u0631\u0629',
  breatheIn: '\u0634\u0647\u064a\u0642',
  breatheOut: '\u0632\u0641\u064a\u0631',
  minutes: '{n} \u062f\u0642\u064a\u0642\u0629',
  timeLeft: '\u0645\u062a\u0628\u0642\u064d {t}',
  breatheDone: '\u0623\u062d\u0633\u0646\u062a. \u0644\u0627\u062d\u0638 \u0643\u064a\u0641 \u064a\u0634\u0639\u0631 \u062c\u0633\u0645\u0643 \u0627\u0644\u0622\u0646.',
  finished: '\u0623\u062d\u0633\u0646\u062a. \u0639\u064f\u062f \u0625\u0644\u0649 \u0647\u0646\u0627 \u0643\u0644\u0645\u0627 \u0627\u062d\u062a\u062c\u062a \u0625\u0644\u0649 \u0630\u0644\u0643.',
  findListening: '\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0631\u0643\u0632 \u0627\u0633\u062a\u0645\u0627\u0639',
  findHospital: '\u0645\u0633\u062a\u0634\u0641\u064a\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629',
  acctBody: '\u0623\u062f\u0648\u0627\u062a \u0627\u0644\u062a\u0647\u062f\u0626\u0629 \u0645\u062c\u0627\u0646\u064a\u0629. \u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062c\u0627\u0646\u064a \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647\u060c \u0623\u0648 \u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644\u060c \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647\u0627. \u064a\u0628\u0642\u0649 \u0642\u0633\u0645 \u00ab\u0645\u062a\u0649 \u062a\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629\u00bb \u0645\u062a\u0627\u062d\u064b\u0627 \u0644\u0644\u062c\u0645\u064a\u0639.',
  offlineSaved: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u062a\u0635\u0627\u0644. \u0645\u062d\u0641\u0648\u0638\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641 \u0628\u062a\u0627\u0631\u064a\u062e {date}.',
  offlineNone: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u062a\u0635\u0627\u0644\u060c \u0648\u0644\u0627 \u0634\u064a\u0621 \u0645\u062d\u0641\u0648\u0638 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0647\u0627\u062a\u0641 \u0628\u0639\u062f. \u0627\u0641\u062a\u062d \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629 \u0645\u0639 \u0627\u062a\u0635\u0627\u0644: \u0628\u0639\u062f\u0647\u0627 \u062a\u0639\u0645\u0644 \u062f\u0648\u0646 \u0628\u064a\u0627\u0646\u0627\u062a.',
  noTools: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u062f\u0627\u0629 \u062a\u0647\u062f\u0626\u0629 \u0647\u0646\u0627 \u0628\u0639\u062f.',
  k_help: '\u0645\u0633\u0627\u0639\u062f\u0629',
  k_breathe: '\u062a\u0646\u0641\u0633',
  k_steps: '\u062e\u0637\u0648\u0629 \u0628\u062e\u0637\u0648\u0629',
  k_list: '\u0646\u0635\u0627\u0626\u062d',
};

const FF: Table = {
  title: 'Kuutor\u0257e dee\u01b4al',
  subtitle: 'Golle \u0257akkuuje ngam saa\u2019iiji ca\u0257\u0257i. Bambeh safrataa: ngam safaara, yiytu golloowo safaara.',
  cardTitle: 'Kuutor\u0257e dee\u01b4al',
  cardSub: 'Foofgol see\u0257a see\u0257a, miijo teddungo, \u0257aanaade no mo\u01b4\u01b4i - e mande \u0257a\u0253\u0253itaa ballal.',
  cardPreview: '\u01b3eewgol golloo\u2019en: uddiima wonande yim\u0253e tawo.',
  privacy: 'Hay huunde nde wa\u0257ataa \u0257oo yaltataa e telefon maa. Bambeh ina limoo tan laabi njoy kuutorgal kala udditaa - wonaa moy.',
  notOpen: 'Kuutor\u0257e dee\u01b4al udditaaka tawo. So a sokli ballal jooni, noddu limoore les \u0257oo walla yah lopitaal \u0253ur\u0257o \u0253adaade ma.',
  staffOff: '\u01b3eewgol golloo\u2019en: kuutor\u0257e dee\u01b4al uddiima wonande yim\u0253e.',
  staffPreview: '\u01b3eewgol golloo\u2019en e binndi \u0257i nja\u0253aaka tawo - yim\u0253e yiyataa \u0257i.',
  previewBtn: '\u01b3eew binndi tawo',
  publicBtn: '\u01b3eew ko yim\u0253e njiyata',
  draftTag: 'Winndannde',
  hiddenTag: 'Suu\u0257aama',
  notLiveTag: 'Hollaaka',
  checkedBy: '{name} ({role}) \u01b4eewii \u0257um \u00f1alnde {date}.',
  otherLang: '\u01b3eewaaka tawo e \u0257emngal maa - hollaama e {lang}.',
  open: 'Uddit',
  allTools: 'Kuutor\u0257e dee\u01b4al fof',
  getHelp: 'Mande \u0257a\u0253\u0253itaa ballal',
  start: 'Fu\u0257\u0257o',
  stop: 'Accu',
  again: 'Fu\u0257\u0257ito',
  next: 'Yeeso',
  back: 'Rutto',
  done: 'Timmii',
  stepOf: 'Taa\u0253gol {n} e {total}',
  showAll: 'Hollu taa\u0253e fof',
  oneByOne: 'Taa\u0253gol gootol e gootol',
  breatheIn: 'Naatnu henndu',
  breatheOut: 'Yaltin henndu',
  minutes: 'min {n}',
  timeLeft: '{t} heddii',
  breatheDone: 'Mo\u01b4\u01b4i. \u01b3eew no \u0253anndu maa woni jooni.',
  finished: 'Mo\u01b4\u01b4i. Ruttu \u0257oo saa\u2019i fof ko sokli-\u0257aa.',
  findListening: 'Yiylo nokkuure he\u0257aare',
  findHospital: 'Opitaaluuji e ndeenka',
  acctBody: 'Kuutor\u0257e dee\u01b4al ko meere. Wa\u0257 konte Bambeh maa meere, walla naatu, ngam jokkude huutoraade \u0257e. "Mande \u0257a\u0253\u0253itaa ballal" ina heddoo udditii\u0257um wonande kala.',
  offlineSaved: 'Connexion alaa. Danndaama e ndee telefon \u00f1alnde {date}.',
  offlineNone: 'Connexion alaa, huunde danndaaka e ndee telefon tawo. Uddit ngol hello laawol gootol e connexion: caggal \u0257um ngol gollata tawa data alaa.',
  noTools: 'Kuutorgal dee\u01b4al alaa \u0257oo tawo.',
  k_help: 'Ballal',
  k_breathe: 'Foofgol',
  k_steps: 'Taa\u0253gol e taa\u0253gol',
  k_list: 'Wasiyaaji',
};

export const CALM_TEXT: Record<WhLang, Table> = { en: EN, fr: FR, pidgin: PIDGIN, ar: AR, ff: FF };

/** One sentence in the given language; {n}, {name}... are filled from vars. */
export function ct(lang: WhLang, key: CalmKey, vars?: Record<string, string | number>): string {
  const table = CALM_TEXT[lang] || EN;
  let s: string = table[key] || EN[key] || String(key);
  if (vars) {
    for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
  }
  return s;
}

export type CalmT = (key: CalmKey, vars?: Record<string, string | number>) => string;

/** The language, its direction and a t() for the Calm tools page; follows language changes. */
export function useCalmText(): { lang: WhLang; dir: 'rtl' | 'ltr'; t: CalmT } {
  const lang = normWhLang(useLang());
  return { lang, dir: whDir(lang), t: (key: CalmKey, vars?: Record<string, string | number>) => ct(lang, key, vars) };
}

/** "1:05" for 65 seconds. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

/**
 * The same rule as the database (FIX737): no phone number (the short emergency codes are fine), no
 * WhatsApp or Telegram link, no web link and no e-mail address in a Calm text. null = fine.
 */
export function calmContactProblem(text: string | null | undefined): 'phone_in_text' | 'link_in_text' | null {
  const v = String(text || '');
  if (/(wa\.me|whatsapp\.com|t\.me\/|chat\.whatsapp)/i.test(v)) return 'phone_in_text';
  const joined = v.replace(/([0-9])[\s.()/-]+(?=[0-9+])/g, '$1');
  if (/(^|[^0-9])(\+?237|00237)?[26][0-9]{8}([^0-9]|$)/.test(joined)) return 'phone_in_text';
  if (/[0-9]{7,}/.test(joined)) return 'phone_in_text';
  if (/(https?:\/\/|www\.|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i.test(v)) return 'link_in_text';
  if (/(^|[^A-Za-z0-9])[A-Za-z0-9-]+\.(com|cm|org|net|fr|info|io|me|app|ly|gl|biz|co)([^A-Za-z0-9]|$)/i.test(v)) return 'link_in_text';
  return null;
}
// BAMBEH_END_TOKEN__CALM_TEXT_FIX740__COMPLETE
