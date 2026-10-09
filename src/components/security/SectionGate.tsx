// BAMBEH_DEPLOY_TOKEN__SECTION_GATE_FIX673_CLEAN
/**
 * src/components/security/SectionGate.tsx - FIX673
 *
 * Members-only detail pages and chat, section by section, decided in the Command
 * Center (Members-only sections, FIX671/FIX675). Wraps a page in App.tsx:
 *   <AuthGate require="user"><SectionGate section="rentals"><RentalDetails /></SectionGate></AuthGate>
 *
 * WHO PASSES
 *   - members (useSubscription - which already counts the Command Center "free"
 *     switch, the staff pass and every way of paying), admins, and the Play build
 *   - everyone, when the section is switched to free
 *   - chat only: anyone with an active advert, while "Sellers answering" is free -
 *     a paying member must never write to a seller who cannot reply
 * Everyone else sees a short card in their language: what is members-only, the
 * plans button, and Go back. The page itself is not loaded behind the card.
 *
 * THE TWO RULES AuthGate LEARNED (FIX320, FIX397), kept here
 *   - "no answer yet" means WAIT, never NO: a 2-second grace and a spinner, so a
 *     member who has just paid is never shown the card while the check finishes
 *   - an admin is never held at the paywall
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { SECTION_DEFAULTS, useSectionGates } from '@/hooks/useSectionGates';
import type { SectionKey } from '@/hooks/useSectionGates';
import { PLAN_PRICES } from '@/hooks/usePlanLimits';
import { useLang } from '@/hooks/useAppLang';
import { IS_STORE_APP } from '@/config/storeMode';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
function normLang(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm') return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

const TEXT: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Subscribe to see the full details',
    body: 'Browsing the list is free. To open this advert, see every detail and chat with the owner, subscribe to Bambeh.',
    chatTitle: 'Chat is for subscribers',
    chatBody: 'Subscribe to message landlords, sellers and service providers on Bambeh. Your money stays protected by Bambeh Secured Pay when you buy.',
    sellerNote: 'Have an active advert on Bambeh? You can always open your messages and answer them.',
    plans: 'See subscription plans',
    from: 'from {n} XAF a day',
    back: 'Go back',
    signin: 'Sign in',
    checking: 'Checking your subscription...',
  },
  fr: {
    title: 'Abonnez-vous pour voir tous les d\u00e9tails',
    body: 'Parcourir la liste est gratuit. Pour ouvrir cette annonce, voir tous les d\u00e9tails et discuter avec le propri\u00e9taire, abonnez-vous \u00e0 Bambeh.',
    chatTitle: 'La messagerie est r\u00e9serv\u00e9e aux abonn\u00e9s',
    chatBody: 'Abonnez-vous pour \u00e9crire aux propri\u00e9taires, vendeurs et prestataires sur Bambeh. Quand vous achetez, votre argent reste prot\u00e9g\u00e9 par Bambeh Secured Pay.',
    sellerNote: 'Vous avez une annonce active sur Bambeh ? Vous pouvez toujours ouvrir vos messages et y r\u00e9pondre.',
    plans: 'Voir les abonnements',
    from: '\u00e0 partir de {n} XAF par jour',
    back: 'Retour',
    signin: 'Se connecter',
    checking: 'V\u00e9rification de votre abonnement...',
  },
  pidgin: {
    title: 'Subscribe make you see all the details',
    body: 'To look the list na free. To open this advert, see all the details and chat with the owner, subscribe for Bambeh.',
    chatTitle: 'Chat na for people wey don subscribe',
    chatBody: 'Subscribe make you fit message landlord, seller and service people for Bambeh. When you buy, your money dey safe with Bambeh Secured Pay.',
    sellerNote: 'You get advert wey dey active for Bambeh? You fit always open your messages and answer dem.',
    plans: 'See subscription plans',
    from: 'start for {n} XAF each day',
    back: 'Go back',
    signin: 'Sign in',
    checking: 'We dey check your subscription...',
  },
  ar: {
    title: '\u0627\u0634\u062a\u0631\u0643 \u0644\u0631\u0624\u064a\u0629 \u0643\u0644 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644',
    body: '\u062a\u0635\u0641\u062d \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0645\u062c\u0627\u0646\u064a. \u0644\u0641\u062a\u062d \u0647\u0630\u0627 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0648\u0631\u0624\u064a\u0629 \u0643\u0644 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0648\u0627\u0644\u062f\u0631\u062f\u0634\u0629 \u0645\u0639 \u0635\u0627\u062d\u0628\u0647\u060c \u0627\u0634\u062a\u0631\u0643 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647.',
    chatTitle: '\u0627\u0644\u062f\u0631\u062f\u0634\u0629 \u0644\u0644\u0645\u0634\u062a\u0631\u0643\u064a\u0646 \u0641\u0642\u0637',
    chatBody: '\u0627\u0634\u062a\u0631\u0643 \u0644\u0645\u0631\u0627\u0633\u0644\u0629 \u0627\u0644\u0645\u0624\u062c\u0631\u064a\u0646 \u0648\u0627\u0644\u0628\u0627\u0626\u0639\u064a\u0646 \u0648\u0645\u0642\u062f\u0645\u064a \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647. \u0639\u0646\u062f \u0627\u0644\u0634\u0631\u0627\u0621 \u062a\u0628\u0642\u0649 \u0623\u0645\u0648\u0627\u0644\u0643 \u0645\u062d\u0645\u064a\u0629 \u0628\u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0622\u0645\u0646 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647.',
    sellerNote: '\u0644\u062f\u064a\u0643 \u0625\u0639\u0644\u0627\u0646 \u0646\u0634\u0637 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647\u061f \u064a\u0645\u0643\u0646\u0643 \u062f\u0627\u0626\u0645\u064b\u0627 \u0641\u062a\u062d \u0631\u0633\u0627\u0626\u0644\u0643 \u0648\u0627\u0644\u0631\u062f \u0639\u0644\u064a\u0647\u0627.',
    plans: '\u0639\u0631\u0636 \u062e\u0637\u0637 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643',
    from: '\u0627\u0628\u062a\u062f\u0627\u0621\u064b \u0645\u0646 {n} \u0641\u0631\u0646\u0643 \u064a\u0648\u0645\u064a\u064b\u0627',
    back: '\u0631\u062c\u0648\u0639',
    signin: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    checking: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0634\u062a\u0631\u0627\u0643\u0643...',
  },
  ff: {
    title: 'Naatu premium ngam yiyde fof',
    body: '\u01b3eewde doggol ngol ko yo\u0253aaki. Ngam uddude ndee bayyinaango, yiyde fof e haalde e jom mayre, naatu premium Bambeh.',
    chatTitle: 'Chat ko won\u0253e e premium tan',
    chatBody: 'Naatu premium ngam winndude jom cuu\u0257i, coggoo\u0253e e golloo\u0253e e Bambeh. So a soodii, kaalis maa ina reenaa e Bambeh Secured Pay.',
    sellerNote: 'A jogii bayyinaango e Bambeh? A waawii uddude mesaasji maa e jaabaade \u0257i sahaa kala.',
    plans: 'Naatu premium',
    from: 'gila {n} XAF e \u00f1alawma',
    back: 'Rutto',
    signin: 'Naatu e konte maa',
    checking: 'Min \u0257on \u01b4eewa premium maa...',
  },
};

const GRACE_MS = 2000;

export default function SectionGate({ section, children }: { section: SectionKey; children: ReactNode }) {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const uid = user?.id ?? null;
  const { isActive, isLoading } = useSubscription(uid);
  const { ready, gates, advertiser } = useSectionGates(uid);
  const [graceOver, setGraceOver] = useState(false);

  useEffect(() => {
    setGraceOver(false);
    const timer = window.setTimeout(() => setGraceOver(true), GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [section, uid]);

  // members, staff and the Play build always pass
  if (IS_STORE_APP || isAdmin === true || isActive === true) return <>{children}</>;

  // a section that is free (or free by default while the switches load) opens at once
  const membersOnly = ready ? gates[section] === true : SECTION_DEFAULTS[section] === true;
  if (!membersOnly) return <>{children}</>;

  // chat: people with an active advert can always open and answer their messages
  if (section === 'chat' && ready && gates.chat_sellers === false && advertiser) return <>{children}</>;

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (!ready || isLoading || !graceOver) {
    return (
      <div dir={dir} role="status" aria-busy="true" data-fix="FIX673"
        className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 text-sm text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" aria-hidden="true" />
        <span>{t.checking}</span>
      </div>
    );
  }

  const isChat = section === 'chat';
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };
  return (
    <div dir={dir} data-fix="FIX673" className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-teal-100 bg-white p-6 text-center shadow-lg" role="region" aria-label={isChat ? t.chatTitle : t.title}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
          <Lock className="h-7 w-7 text-teal-700" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{isChat ? t.chatTitle : t.title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{isChat ? t.chatBody : t.body}</p>
        {isChat && gates.chat_sellers === false ? (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{t.sellerNote}</p>
        ) : null}
        {uid ? (
          <>
            <button type="button" onClick={() => navigate('/subscription')}
              className="mt-5 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700">
              {t.plans}
            </button>
            <p className="mt-2 text-xs text-gray-500">{t.from.replace('{n}', String(PLAN_PRICES.daily.xaf))}</p>
          </>
        ) : (
          <button type="button" onClick={() => navigate('/login')}
            className="mt-5 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700">
            {t.signin}
          </button>
        )}
        <button type="button" onClick={goBack}
          className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          {t.back}
        </button>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__SECTION_GATE_FIX673__COMPLETE
