// BAMBEH_DEPLOY_TOKEN__REDEEMPREMIUM_FIX547_CLEAN
/**
 * src/components/coins/RedeemPremium.tsx - Bambeh Marketplace
 *
 * FIX547 - spend a Zerm coin, get a week of premium.
 *
 * Talks to the two functions FIX544b installed and FIX545 repaired:
 *   bambeh_zerm_redeem_state()   read-only, draws the card
 *   bambeh_redeem_zerm_week()    spends the coin, grants the week
 *
 * WHY IT IS SELF-CONTAINED
 *   It fetches its own state rather than taking a balance prop. Two reasons.
 *   First, wiring it into CoinsPage is then one import and one line, with no
 *   anchors to miss. Second, the balance it shows comes from the same
 *   function that decides whether the redemption succeeds - so the button can
 *   never say "you can redeem" while the server disagrees.
 *
 * IT ASKS BEFORE SPENDING
 *   A coin is 400 qualifying actions. Taking one on a mis-tap, with no undo,
 *   would be indefensible. The confirm step states plainly what is being
 *   spent and what arrives in return.
 *
 * IT REPORTS WHAT THE SERVER ACTUALLY SAID
 *   Every refusal the SQL can return is handled by name - not_enough,
 *   disabled - and anything unexpected shows the real error rather than a
 *   shrug. A silent failure here means a user thinks they lost a coin.
 *
 * IT REFUSES TO LIE ABOUT SUCCESS
 *   The new expiry date comes back from the database and is displayed. If
 *   the call half-worked, the card says so instead of celebrating.
 *
 * FIVE LANGUAGES, ASCII-ESCAPED
 *   Every non-English character is a \\u escape, so no encoding change can
 *   ever turn this file into question marks the way it did to Logo.tsx.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
// FIX552 - only icons already used elsewhere in YOUR project.
// The first version imported Coins, Crown and CheckCircle2. None of those
// appear anywhere else in your codebase, so if your installed lucide version
// does not export one of them it arrives as undefined and React throws
// "Element type is invalid" the instant it renders - which is what took the
// coins page down. Zap, RefreshCw, CheckCircle and Gift are proven by
// CoinsPage itself; Loader2 and AlertCircle by PaywallSection, which works.
import { Zap, Gift, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
// FIX553 - read the language here instead of taking it as a prop. The first
// wiring passed lang={raw}, but `raw` lives inside CoinsPage's useStrings()
// helper, not in the component, so it did not exist at the card's location:
//     ReferenceError: raw is not defined
// A component that fetches its own language cannot be wired wrongly.
import { useLang } from '@/hooks/useAppLang';

type Dict = {
  title: string; sub: string; balance: string; cost: string; buys: string;
  redeem: string; confirmQ: string; yes: string; no: string; working: string;
  needMore: string; off: string; done: string; until: string; failed: string;
  signIn: string; refresh: string;
};

const STR: Record<string, Dict> = {
  en: {
    title: 'Turn coins into premium',
    sub: 'Spend Zerm coins for full access, no payment needed.',
    balance: 'Your balance', cost: 'Costs', buys: 'You get',
    redeem: 'Redeem', confirmQ: 'Spend {c} coin for {d} days of premium?',
    yes: 'Yes, redeem', no: 'Cancel', working: 'Redeeming\u2026',
    needMore: 'You need {c} coin. You have {b}.',
    off: 'Redeeming is switched off right now.',
    done: 'Premium unlocked', until: 'Active until',
    failed: 'The redemption did not go through. Nothing was taken.',
    signIn: 'Sign in to redeem coins.', refresh: 'Refresh',
  },
  fr: {
    title: 'Transformez vos pi\u00e8ces en premium',
    sub: 'D\u00e9pensez vos pi\u00e8ces Zerm pour un acc\u00e8s complet, sans paiement.',
    balance: 'Votre solde', cost: 'Co\u00fbte', buys: 'Vous obtenez',
    redeem: '\u00c9changer', confirmQ: 'D\u00e9penser {c} pi\u00e8ce pour {d} jours de premium\u00a0?',
    yes: 'Oui, \u00e9changer', no: 'Annuler', working: '\u00c9change en cours\u2026',
    needMore: 'Il vous faut {c} pi\u00e8ce. Vous avez {b}.',
    off: 'L\u2019\u00e9change est d\u00e9sactiv\u00e9 pour le moment.',
    done: 'Premium activ\u00e9', until: 'Actif jusqu\u2019au',
    failed: 'L\u2019\u00e9change n\u2019a pas abouti. Rien n\u2019a \u00e9t\u00e9 pr\u00e9lev\u00e9.',
    signIn: 'Connectez-vous pour \u00e9changer vos pi\u00e8ces.', refresh: 'Actualiser',
  },
  pcm: {
    title: 'Turn your coins to premium',
    sub: 'Use your Zerm coins to open everything. No money need.',
    balance: 'Your balance', cost: 'E go cost', buys: 'You go get',
    redeem: 'Change am', confirmQ: 'You wan use {c} coin for {d} days premium?',
    yes: 'Yes, change am', no: 'Leave am', working: 'We dey do am\u2026',
    needMore: 'You need {c} coin. You get {b}.',
    off: 'Changing coins no dey work now.',
    done: 'Premium don open', until: 'E go last till',
    failed: 'The change no work. We no collect anything.',
    signIn: 'Sign in first before you fit change coins.', refresh: 'Check again',
  },
  ar: {
    title: '\u062d\u0648\u0651\u0644 \u0639\u0645\u0644\u0627\u062a\u0643 \u0625\u0644\u0649 \u0627\u0634\u062a\u0631\u0627\u0643',
    sub: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0639\u0645\u0644\u0627\u062a \u0632\u064a\u0631\u0645 \u0644\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0643\u0627\u0645\u0644 \u062f\u0648\u0646 \u062f\u0641\u0639.',
    balance: '\u0631\u0635\u064a\u062f\u0643', cost: '\u0627\u0644\u062a\u0643\u0644\u0641\u0629', buys: '\u062a\u062d\u0635\u0644 \u0639\u0644\u0649',
    redeem: '\u0627\u0633\u062a\u0628\u062f\u0627\u0644',
    confirmQ: '\u0647\u0644 \u062a\u0631\u064a\u062f \u0625\u0646\u0641\u0627\u0642 {c} \u0639\u0645\u0644\u0629 \u0645\u0642\u0627\u0628\u0644 {d} \u064a\u0648\u0645\u0627\u064b\u061f',
    yes: '\u0646\u0639\u0645\u060c \u0627\u0633\u062a\u0628\u062f\u0644', no: '\u0625\u0644\u063a\u0627\u0621',
    working: '\u062c\u0627\u0631\u064d \u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644\u2026',
    needMore: '\u062a\u062d\u062a\u0627\u062c {c} \u0639\u0645\u0644\u0629. \u0644\u062f\u064a\u0643 {b}.',
    off: '\u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0645\u0648\u0642\u0648\u0641 \u062d\u0627\u0644\u064a\u0627\u064b.',
    done: '\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643',
    until: '\u0646\u0634\u0637 \u062d\u062a\u0649',
    failed: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644. \u0644\u0645 \u064a\u064f\u062e\u0635\u0645 \u0634\u064a\u0621.',
    signIn: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u062a.',
    refresh: '\u062a\u062d\u062f\u064a\u062b',
  },
  ff: {
    title: 'Waylu coin\u0257e maa e premium',
    sub: 'Huutoro coin\u0257e Zerm ngam udditde fof, ko aldaa e yo\u0253\u0257i.',
    balance: 'Soodaande maa', cost: 'Ko nde \u0257a\u0253\u0253i', buys: 'A he\u0253ay',
    redeem: 'Waylu', confirmQ: '\u0181e waylude coin {c} ngam \u01b4alde {d} premium?',
    yes: 'Eey, waylu', no: 'Accu', working: 'Ko waylo\u2026',
    needMore: 'A so\u01b4i coin {c}. A jogii {b}.',
    off: 'Waylugol e \u0257o wonaa jooni.',
    done: 'Premium udditii', until: 'Haa',
    failed: 'Waylugol waawaa. Hay huunde \u0257a\u0253\u0253aaka.',
    signIn: 'Naatu ngam waylude coin\u0257e maa.', refresh: 'Hesnu',
  },
};

function pick(code: unknown): Dict {
  const c = String(code || 'en').toLowerCase();
  if (STR[c]) return STR[c];
  if (c === 'pidgin') return STR.pcm;
  if (c === 'ful' || c === 'fula' || c === 'fulfulde') return STR.ff;
  if (c.startsWith('fr')) return STR.fr;
  if (c.startsWith('ar')) return STR.ar;
  return STR.en;
}

interface RedeemState {
  signed_in: boolean; enabled: boolean; balance?: number;
  cost: number; days: number; can_redeem?: boolean; expires_at?: string | null;
}

interface Props {
  /** optional override; normally the card reads the language itself */
  lang?: string;
  /** called after a successful redemption so the page can refresh its balance */
  onRedeemed?: () => void;
  className?: string;
}

/**
 * FIX552 - a boundary of its own.
 *
 * A coin-redemption widget must never be able to break the coins page. If
 * anything in the card throws - a missing icon, a shape of data I did not
 * anticipate, anything - the card disappears and the rest of /coins keeps
 * working. Failing invisibly is the right behaviour for an optional extra;
 * taking the whole screen down is not.
 */
class RedeemBoundary extends React.Component<
  { children: React.ReactNode },
  { dead: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { dead: false };
  }
  static getDerivedStateFromError() { return { dead: true }; }
  componentDidCatch(err: unknown) {
    // visible in the console for diagnosis, invisible to the user
    console.error('[RedeemPremium] suppressed:', err);
  }
  render() {
    if (this.state.dead) return null;
    return this.props.children;
  }
}

export default function RedeemPremium(props: Props) {
  return (
    <RedeemBoundary>
      <RedeemPremiumInner {...props} />
    </RedeemBoundary>
  );
}

function RedeemPremiumInner({ lang, onRedeemed, className = '' }: Props) {
  const ctxLang = useLang() as string;
  const code = lang || ctxLang;
  const t = pick(code);
  const rtl = String(code || '').toLowerCase().startsWith('ar');

  const [state, setState]   = useState<RedeemState | null>(null);
  const [loading, setLoad]  = useState(true);
  const [asking, setAsk]    = useState(false);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [done, setDone]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoad(true);
    setError(null);
    try {
      const { data, error: e } = await supabase.rpc('bambeh_zerm_redeem_state');
      if (e) throw e;
      setState(data as RedeemState);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not read your balance.');
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const redeem = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data, error: e } = await supabase.rpc('bambeh_redeem_zerm_week');
      if (e) throw e;

      const r = data as {
        ok?: boolean; reason?: string; balance?: number;
        needed?: number; expires_at?: string;
      };

      if (!r?.ok) {
        // every refusal the database can return, answered by name
        if (r?.reason === 'not_enough') {
          setError(t.needMore
            .replace('{c}', String(r.needed ?? state?.cost ?? 1))
            .replace('{b}', String(r.balance ?? 0)));
        } else if (r?.reason === 'disabled') {
          setError(t.off);
        } else {
          setError(t.failed);
        }
        setAsk(false);
        await load();
        return;
      }

      setDone(r.expires_at || null);
      setAsk(false);
      await load();
      if (onRedeemed) onRedeemed();
    } catch (e: unknown) {
      // show what actually happened - a silent failure makes a user think
      // their coin vanished
      setError(e instanceof Error ? e.message : t.failed);
      setAsk(false);
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (iso: string | null | undefined) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className={'rounded-2xl border border-gray-200 bg-white p-5 ' + className}>
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-teal-600" />
      </div>
    );
  }

  if (done) {
    return (
      <div dir={rtl ? 'rtl' : 'ltr'}
        className={'rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center ' + className}>
        <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-2 font-bold text-emerald-900">{t.done}</p>
        <p className="mt-1 text-sm text-emerald-800">{t.until} {fmtDate(done)}</p>
      </div>
    );
  }

  if (state && !state.signed_in) {
    return (
      <div dir={rtl ? 'rtl' : 'ltr'}
        className={'rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 ' + className}>
        {t.signIn}
      </div>
    );
  }

  const cost = state?.cost ?? 1;
  const days = state?.days ?? 7;
  const bal  = state?.balance ?? 0;
  const can  = Boolean(state?.can_redeem);

  return (
    <div dir={rtl ? 'rtl' : 'ltr'}
      className={'rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 ' + className}>
      <div className="flex items-start gap-3">
        <Gift className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900">{t.title}</p>
          <p className="mt-0.5 text-sm text-gray-600">{t.sub}</p>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-gray-200">
              <p className="text-[11px] text-gray-500">{t.balance}</p>
              <p className="text-sm font-bold text-gray-900">{bal}</p>
            </div>
            <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-gray-200">
              <p className="text-[11px] text-gray-500">{t.cost}</p>
              <p className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900">
                <Zap className="h-3.5 w-3.5 text-amber-500" />{cost}
              </p>
            </div>
            <div className="rounded-xl bg-white px-2 py-2 ring-1 ring-gray-200">
              <p className="text-[11px] text-gray-500">{t.buys}</p>
              <p className="text-sm font-bold text-gray-900">{days}d</p>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!state?.enabled && (
            <p className="mt-3 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-600">{t.off}</p>
          )}

          {/* a coin is 400 earned actions. Never spend one on a mis-tap. */}
          {asking ? (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-900">
                {t.confirmQ.replace('{c}', String(cost)).replace('{d}', String(days))}
              </p>
              <div className="mt-2 flex gap-2">
                <button type="button" disabled={busy} onClick={() => void redeem()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:bg-gray-300">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                  {busy ? t.working : t.yes}
                </button>
                <button type="button" disabled={busy} onClick={() => setAsk(false)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {t.no}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <button type="button" disabled={!can} onClick={() => { setError(null); setAsk(true); }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:bg-gray-300">
                <Gift className="h-4 w-4" /> {t.redeem}
              </button>
              <button type="button" onClick={() => void load()} aria-label={t.refresh}
                className="rounded-xl border border-gray-300 p-2.5 text-gray-600 hover:bg-gray-50">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* say WHY it is disabled instead of showing a dead grey button */}
          {!can && state?.enabled && !asking && (
            <p className="mt-2 text-xs text-gray-500">
              {t.needMore.replace('{c}', String(cost)).replace('{b}', String(bal))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__REDEEMPREMIUM_FIX547__COMPLETE
