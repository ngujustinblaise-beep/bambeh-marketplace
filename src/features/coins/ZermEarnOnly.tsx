// BAMBEH_DEPLOY_TOKEN__ZERMEARNONLY_FIX848_CLEAN
// FILE LOCATION: src/features/coins/ZermEarnOnly.tsx
//
// FIX848 - "ZERM COINS ARE EARNED": the page /coins/buy and /coins/transfer show while an admin has buying or
// sending switched OFF (Command Center > Zerm coins, FIX845 - the default until Bambeh holds a COBAC licence).
// Old links, old buttons and old alerts land somewhere honest: what coins are, how they are earned, what one coin
// does, where premium is sold today, and who to write to if someone paid for coins before.
// Five languages (FIX846), right-to-left for Arabic.
// (c) 2026 BAMBEH SARL. All rights reserved.

import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, Crown, Gift, MessageCircle, ShieldCheck, Tag, TrendingUp, Zap } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import { ZERM_STR, zermLang } from '@/features/coins/zermText';

export default function ZermEarnOnly({ mode }: { mode: 'buy' | 'send' }) {
  const navigate = useNavigate();
  const lang = zermLang(useLang());
  const w = ZERM_STR[lang];
  const rtl = lang === 'ar';

  const Earn = ({ icon, text }: { icon: ReactNode; text: string }) => (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">{icon}</span>
      <span className="pt-1.5 text-sm text-gray-700">{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={rtl ? 'rtl' : 'ltr'} data-fix="FIX848" data-mode={mode}>
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-4 pb-10 pt-6 text-white">
        <button onClick={() => navigate('/coins')} className="mb-4 flex items-center gap-1 text-sm text-white/85 hover:text-white">
          <ArrowLeft className={`h-4 w-4 ${rtl ? 'rotate-180' : ''}`} /> {w.back}
        </button>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <ShieldCheck className="h-7 w-7 text-yellow-300" />
          </span>
          <h1 className="text-xl font-bold leading-tight" data-title="1">{mode === 'buy' ? w.buyTitle : w.sendTitle}</h1>
        </div>
        <p className="mt-3 text-sm text-teal-50">{w.lead}</p>
      </div>

      <div className="mx-auto -mt-5 max-w-lg space-y-4 px-4">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-gray-900">{w.earnTitle}</h2>
          <ul className="space-y-3">
            <Earn icon={<CalendarCheck className="h-4 w-4" />} text={w.earn1} />
            <Earn icon={<Tag className="h-4 w-4" />} text={w.earn2} />
            <Earn icon={<Gift className="h-4 w-4" />} text={w.earn3} />
            <Earn icon={<TrendingUp className="h-4 w-4" />} text={w.earn4} />
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <Zap className="h-4 w-4 text-amber-500" /> {w.useTitle}
          </h2>
          <p className="mt-1 text-sm text-amber-900/90">{w.useBody}</p>
        </section>

        <button onClick={() => navigate('/coins')} data-go="coins"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-sm active:scale-95">
          <Zap className="h-4 w-4 text-yellow-300" /> {w.wallet}
        </button>
        <button onClick={() => navigate('/subscription')} data-go="plans"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-teal-600 py-3 text-sm font-semibold text-teal-700 active:scale-95">
          <Crown className="h-4 w-4" /> {w.plans}
        </button>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900">{w.paidTitle}</h2>
          <p className="mt-1 text-xs text-gray-600">{w.paidBody}</p>
          <button onClick={() => navigate('/help/chat')} data-go="chat"
                  className="mt-3 flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100">
            <MessageCircle className="h-4 w-4" /> {w.chat}
          </button>
        </section>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__ZERMEARNONLY_FIX848__COMPLETE
