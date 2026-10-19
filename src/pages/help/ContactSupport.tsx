// BAMBEH_DEPLOY_TOKEN__CONTACT_SUPPORT_FIX839_CLEAN
/**
 * src/pages/help/ContactSupport.tsx - FIX839 (was an untagged page)
 * ROUTE: /help/contact (Help > Contact Support, the footer's "Contact")
 *
 * The page showed a phone number to call and a "Start Chat" button that did nothing, with office hours nobody had
 * checked. The rule is: contact stays in Bambeh. Now:
 *   1. Chat with Bambeh (FIX837) - the way to reach a person at Bambeh, answered in the app;
 *   2. email support@bambeh.com;
 *   3. cannot sign in -> the forgot-password page (its WhatsApp help stays there);
 *   4. in danger -> the Safety button (emergency numbers, no account needed);
 *   5. the Help Center.
 * Five languages, right-to-left for Arabic.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, KeyRound, Mail, MessageCircle, ShieldAlert } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

const SUPPORT_EMAIL = 'support@bambeh.com';

const T = {
  en: {
    title: 'Contact Bambeh', subtitle: 'A person at Bambeh answers you - in the app.',
    chat: 'Chat with Bambeh', chatDesc: 'Write to us from the app: a payment, your account, an order, a problem with the app. You are told when we answer.',
    chatBtn: 'Start a chat', email: 'Email', emailDesc: 'We usually answer within a day.',
    forgot: 'Cannot sign in?', forgotDesc: 'Reset your password with your phone number.', forgotBtn: 'Reset my password',
    danger: 'In danger?', dangerDesc: 'The Safety button gives the emergency numbers - no account needed.', dangerBtn: 'Open the Safety button',
    help: 'Help Center', helpDesc: 'Guides and answers to common questions.', back: 'Back to the Help Center',
  },
  fr: {
    title: 'Contacter Bambeh', subtitle: 'Une personne de Bambeh vous r\u00e9pond - dans l\u2019application.',
    chat: 'Discuter avec Bambeh', chatDesc: '\u00c9crivez-nous depuis l\u2019application : un paiement, votre compte, une commande, un probl\u00e8me avec l\u2019application. Vous \u00eates pr\u00e9venu quand nous r\u00e9pondons.',
    chatBtn: 'Commencer une discussion', email: 'E-mail', emailDesc: 'Nous r\u00e9pondons en g\u00e9n\u00e9ral sous un jour.',
    forgot: 'Impossible de vous connecter ?', forgotDesc: 'R\u00e9initialisez votre mot de passe avec votre num\u00e9ro de t\u00e9l\u00e9phone.', forgotBtn: 'R\u00e9initialiser mon mot de passe',
    danger: 'En danger ?', dangerDesc: 'Le bouton S\u00e9curit\u00e9 donne les num\u00e9ros d\u2019urgence - sans compte.', dangerBtn: 'Ouvrir le bouton S\u00e9curit\u00e9',
    help: 'Centre d\u2019aide', helpDesc: 'Guides et r\u00e9ponses aux questions fr\u00e9quentes.', back: 'Retour au centre d\u2019aide',
  },
  pidgin: {
    title: 'Contact Bambeh', subtitle: 'Real person for Bambeh go answer you - for inside the app.',
    chat: 'Chat with Bambeh', chatDesc: 'Write us from the app: payment, your account, order, problem with the app. Dem go tell you when we answer.',
    chatBtn: 'Start chat', email: 'Email', emailDesc: 'We dey answer for inside one day.',
    forgot: 'You no fit login?', forgotDesc: 'Change your password with your phone number.', forgotBtn: 'Change my password',
    danger: 'You dey for danger?', dangerDesc: 'The Safety button get the emergency numbers - you no need account.', dangerBtn: 'Open Safety button',
    help: 'Help Center', helpDesc: 'Guide and answer for question wey plenty people dey ask.', back: 'Go back to Help Center',
  },
  ar: {
    title: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 Bambeh', subtitle: '\u064a\u0631\u062f \u0639\u0644\u064a\u0643 \u0634\u062e\u0635 \u0645\u0646 Bambeh - \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642.',
    chat: '\u062a\u062d\u062f\u0651\u062b \u0645\u0639 Bambeh', chatDesc: '\u0627\u0643\u062a\u0628 \u0625\u0644\u064a\u0646\u0627 \u0645\u0646 \u0627\u0644\u062a\u0637\u0628\u064a\u0642: \u062f\u0641\u0639\u0629\u060c \u062d\u0633\u0627\u0628\u0643\u060c \u0637\u0644\u0628\u060c \u0645\u0634\u0643\u0644\u0629 \u0641\u064a \u0627\u0644\u062a\u0637\u0628\u064a\u0642. \u0633\u062a\u064f\u0628\u0644\u0651\u063a \u0639\u0646\u062f\u0645\u0627 \u0646\u0631\u062f.',
    chatBtn: '\u0627\u0628\u062f\u0623 \u0645\u062d\u0627\u062f\u062b\u0629', email: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a', emailDesc: '\u0646\u0631\u062f \u0639\u0627\u062f\u0629\u064b \u062e\u0644\u0627\u0644 \u064a\u0648\u0645.',
    forgot: '\u0644\u0627 \u062a\u0633\u062a\u0637\u064a\u0639 \u0627\u0644\u062f\u062e\u0648\u0644\u061f', forgotDesc: '\u0623\u0639\u062f \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0631\u0642\u0645 \u0647\u0627\u062a\u0641\u0643.', forgotBtn: '\u0625\u0639\u0627\u062f\u0629 \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    danger: '\u0641\u064a \u062e\u0637\u0631\u061f', dangerDesc: '\u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646 \u064a\u0639\u0637\u064a \u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 - \u062f\u0648\u0646 \u062d\u0633\u0627\u0628.', dangerBtn: '\u0627\u0641\u062a\u062d \u0632\u0631 \u0627\u0644\u0623\u0645\u0627\u0646',
    help: '\u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629', helpDesc: '\u0623\u062f\u0644\u0629 \u0648\u0625\u062c\u0627\u0628\u0627\u062a \u0639\u0646 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629.', back: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629',
  },
  ff: {
    title: 'Hewtu Bambeh', subtitle: 'Ne\u0257\u0257o Bambeh jaabay ma - e nder jaa\u0253nirgal ngal.',
    chat: 'Yeewtu e Bambeh', chatDesc: 'Winndan min e jaa\u0253nirgal ngal: njo\u0253di, konte maa, \u0257a\u0253\u0253orde, ca\u0257eele e jaa\u0253nirgal. Maa a anndine so min njaabii.',
    chatBtn: 'Fu\u0257\u0257u yeewtere', email: 'Iimeel', emailDesc: 'Min njaabotoo nder \u00f1alngu gooto.',
    forgot: 'A waawaa naatde?', forgotDesc: 'Waylu finnde maa e limoore telefol maa.', forgotBtn: 'Waylu finnde am',
    danger: 'A woni e kulol?', dangerDesc: 'Buto\u014b Hisnde ina hokka limle ballal law - konte hatojinaani.', dangerBtn: 'Uddit Buto\u014b Hisnde',
    help: 'Nokku ballal', helpDesc: 'Peeje e jaabawuuji naamnde keew\u0257e.', back: 'Rutto to nokku ballal',
  },
};

export default function ContactSupport() {
  const raw = useLang() as string;
  const key = (raw === 'fulfulde' ? 'ff' : raw) as keyof typeof T;
  const t = T[key] || T.en;
  const isRtl = key === 'ar';
  const card = 'flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm';
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50 py-8" data-fix="FIX839">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-700 p-7 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-11 w-11 shrink-0" />
            <div>
              <h1 className="text-3xl font-bold">{t.title}</h1>
              <p className="text-teal-50">{t.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className={card + ' border-teal-200'} data-contact="chat">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600"><MessageCircle className="h-6 w-6 text-white" /></div>
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 text-lg font-bold text-gray-900">{t.chat}</h2>
              <p className="mb-3 text-sm text-gray-600">{t.chatDesc}</p>
              <Link to="/help/chat" className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700" data-start-chat="1">
                {t.chatBtn} <ChevronRight className={'h-4 w-4 ' + (isRtl ? 'rotate-180' : '')} />
              </Link>
            </div>
          </div>

          <a href={'mailto:' + SUPPORT_EMAIL} className={card + ' hover:bg-gray-50'} data-contact="email">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600"><Mail className="h-6 w-6 text-white" /></div>
            <div>
              <h2 className="mb-1 font-bold text-gray-900">{t.email}</h2>
              <p className="text-sm font-semibold text-blue-700" dir="ltr">{SUPPORT_EMAIL}</p>
              <p className="text-sm text-gray-600">{t.emailDesc}</p>
            </div>
          </a>

          <div className={card} data-contact="forgot">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500"><KeyRound className="h-6 w-6 text-white" /></div>
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 font-bold text-gray-900">{t.forgot}</h2>
              <p className="mb-2 text-sm text-gray-600">{t.forgotDesc}</p>
              <Link to="/forgot-password" className="text-sm font-semibold text-amber-700 underline">{t.forgotBtn}</Link>
            </div>
          </div>

          <div className={card} data-contact="danger">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600"><ShieldAlert className="h-6 w-6 text-white" /></div>
            <div className="min-w-0 flex-1">
              <h2 className="mb-1 font-bold text-gray-900">{t.danger}</h2>
              <p className="mb-2 text-sm text-gray-600">{t.dangerDesc}</p>
              <Link to="/safety-button" className="text-sm font-semibold text-red-700 underline">{t.dangerBtn}</Link>
            </div>
          </div>

          <Link to="/help" className={card + ' hover:bg-gray-50'} data-contact="help">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-600"><BookOpen className="h-6 w-6 text-white" /></div>
            <div>
              <h2 className="mb-1 font-bold text-gray-900">{t.help}</h2>
              <p className="text-sm text-gray-600">{t.helpDesc}</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link to="/help" className="font-semibold text-teal-600 hover:text-teal-700">{t.back}</Link>
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CONTACT_SUPPORT_FIX839__COMPLETE
