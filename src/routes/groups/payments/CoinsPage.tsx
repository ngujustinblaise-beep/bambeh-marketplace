// BAMBEH_DEPLOY_TOKEN__COINSPAGE_FIX851_CLEAN
/**
 * CoinsPage.tsx - Bambeh Marketplace
 * FILE LOCATION: src/routes/groups/payments/CoinsPage.tsx  (routed at /coins)
 *
 * FIX851 (replaces FIX136/FIX110) - THE ZERM COINS PAGE FOLLOWS THE COMMAND CENTER SWITCHES.
 *   - "Buy coins" and "Send coins" show only when an admin has switched buying / sending on (Command Center >
 *     Zerm coins, FIX845 - both OFF until Bambeh holds its COBAC licence). While both are off, a card says coins
 *     are earned, never bought or sent. The database refuses coin writes from phones either way (FIX845).
 *   - The "purchase received" banner (?purchased=1) is gone with the purchase.
 *   - "Earned" now counts every reward. The rewards are written with their rule as the type (daily_login,
 *     post_listing, referral_signup...), so the old count of type 'credit' only always read 0.
 *   - Balances show up to four decimals: a reward is 0.0025, which the old page rounded to 0.003.
 *   - The history names each line in the member's language (Daily check-in, Advert posted, A friend joined,
 *     Coins bought, Sent to / From a member...).
 *   - The tip no longer promises coins for completing a profile: no such reward exists.
 *   - A failed check-in says it failed, instead of "already claimed today".
 * Kept: the wallet opens itself at 0 on the first visit, claim_daily_login(), RedeemPremium (FIX547), referral.
 * Five languages, right-to-left for Arabic. Every non-English character is a \u escape.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, ArrowUpRight, ArrowDownLeft, History, RefreshCw, CalendarCheck, Gift, ShieldCheck, Plus, Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import RedeemPremium from '@/components/coins/RedeemPremium';   // FIX547
import { useZermState } from '@/features/coins/zermApi';      // FIX847 - the Command Center switches

// -- i18n ----------------------------------------------------------------------
const strings = {
  en: {
    title: 'Zerm Coins', balance: 'Your coins', available: 'Available',
    earned: 'Earned', spent: 'Used',
    onlyTitle: 'Earned, never bought',
    onlyBody: "Zerm coins are points you earn by using Bambeh. They can't be bought, sold, sent to someone else or changed into money.",
    tipTitle: 'Earn more Zerm Coins',
    tipBody: 'Check in every day, post adverts and invite friends - coins build up as you use Bambeh.',
    historyTitle: 'History', all: 'All', earnedTab: 'Earned', spentTab: 'Used',
    noTx: 'Nothing here yet',
    checkin: 'Daily check-in', checkinSub: 'Claim your free daily bonus', checkinBtn: 'Claim',
    checkinDone: 'Bonus added to your coins!', checkinAlready: 'Already claimed today - come back tomorrow.',
    checkinFail: 'Could not reach Bambeh. Try again in a moment.',
    referralCta: 'Invite friends and earn coins',
    refresh: 'Refresh', refreshing: 'Refreshing...',
    t_daily_login: 'Daily check-in', t_post_listing: 'Advert posted', t_first_listing: 'Your first advert',
    t_referral_signup: 'A friend joined Bambeh', t_signup_bonus: 'Welcome bonus', t_spent: 'Used for premium',
    t_purchase: 'Coins bought', t_sent: 'Sent to {name}', t_received: 'From {name}', buyBtn: 'Buy coins', sendBtn: 'Send coins',
  },
  fr: {
    title: 'Pi\u00e8ces Zerm', balance: 'Vos pi\u00e8ces', available: 'Disponibles',
    earned: 'Gagn\u00e9es', spent: 'Utilis\u00e9es',
    onlyTitle: 'Gagn\u00e9es, jamais achet\u00e9es',
    onlyBody: 'Les pi\u00e8ces Zerm sont des points que vous gagnez en utilisant Bambeh. Elles ne s\u2019ach\u00e8tent pas, ne se vendent pas, ne s\u2019envoient pas \u00e0 quelqu\u2019un d\u2019autre et ne se changent pas en argent.',
    tipTitle: 'Gagnez plus de pi\u00e8ces Zerm',
    tipBody: 'Prenez votre bonus chaque jour, publiez des annonces et invitez des amis : les pi\u00e8ces s\u2019accumulent quand vous utilisez Bambeh.',
    historyTitle: 'Historique', all: 'Tout', earnedTab: 'Gagn\u00e9es', spentTab: 'Utilis\u00e9es',
    noTx: 'Rien pour l\u2019instant',
    checkin: 'Bonus du jour', checkinSub: 'R\u00e9clamez votre bonus gratuit du jour', checkinBtn: 'R\u00e9clamer',
    checkinDone: 'Bonus ajout\u00e9 \u00e0 vos pi\u00e8ces !', checkinAlready: 'D\u00e9j\u00e0 r\u00e9clam\u00e9 aujourd\u2019hui - revenez demain.',
    checkinFail: 'Impossible de joindre Bambeh. R\u00e9essayez dans un instant.',
    referralCta: 'Invitez des amis et gagnez des pi\u00e8ces',
    refresh: 'Actualiser', refreshing: 'Actualisation...',
    t_daily_login: 'Bonus du jour', t_post_listing: 'Annonce publi\u00e9e', t_first_listing: 'Votre premi\u00e8re annonce',
    t_referral_signup: 'Un ami a rejoint Bambeh', t_signup_bonus: 'Bonus de bienvenue', t_spent: 'Utilis\u00e9e pour le premium',
    t_purchase: 'Pi\u00e8ces achet\u00e9es', t_sent: 'Envoy\u00e9 \u00e0 {name}', t_received: 'De {name}', buyBtn: 'Acheter des pi\u00e8ces', sendBtn: 'Envoyer des pi\u00e8ces',
  },
  pidgin: {
    title: 'Zerm Coins', balance: 'Your coins', available: 'Wey dey',
    earned: 'You get', spent: 'You use',
    onlyTitle: 'You get am, you no buy am',
    onlyBody: 'Zerm coins na points wey you dey get when you dey use Bambeh. Nobody fit buy dem, sell dem, send dem give another person or change dem to money.',
    tipTitle: 'Get more Zerm Coins',
    tipBody: 'Check in every day, post advert and bring your padi dem - coins go dey add as you dey use Bambeh.',
    historyTitle: 'History', all: 'All', earnedTab: 'You get', spentTab: 'You use',
    noTx: 'Nothing dey here yet',
    checkin: 'Daily check-in', checkinSub: 'Collect your free daily bonus', checkinBtn: 'Collect',
    checkinDone: 'Bonus don enter your coins!', checkinAlready: 'You don collect today - come back tomorrow.',
    checkinFail: 'We no fit reach Bambeh. Try again small time.',
    referralCta: 'Bring padi dem, get coins',
    refresh: 'Refresh', refreshing: 'Refreshing...',
    t_daily_login: 'Daily check-in', t_post_listing: 'You post advert', t_first_listing: 'Your first advert',
    t_referral_signup: 'Your padi don join Bambeh', t_signup_bonus: 'Welcome bonus', t_spent: 'You use am for premium',
    t_purchase: 'You buy coins', t_sent: 'You send give {name}', t_received: 'From {name}', buyBtn: 'Buy coins', sendBtn: 'Send coins',
  },
  ar: {
    title: '\u0639\u0645\u0644\u0627\u062a \u0632\u064a\u0631\u0645', balance: '\u0639\u0645\u0644\u0627\u062a\u0643', available: '\u0645\u062a\u0627\u062d\u0629',
    earned: '\u0645\u0643\u062a\u0633\u0628\u0629', spent: '\u0645\u0633\u062a\u062e\u062f\u0645\u0629',
    onlyTitle: '\u062a\u064f\u0643\u062a\u0633\u0628 \u0648\u0644\u0627 \u062a\u064f\u0634\u062a\u0631\u0649',
    onlyBody: '\u0639\u0645\u0644\u0627\u062a \u0632\u064a\u0631\u0645 \u0646\u0642\u0627\u0637 \u062a\u0643\u0633\u0628\u0647\u0627 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 Bambeh. \u0644\u0627 \u062a\u064f\u0634\u062a\u0631\u0649 \u0648\u0644\u0627 \u062a\u064f\u0628\u0627\u0639 \u0648\u0644\u0627 \u062a\u064f\u0631\u0633\u0644 \u0625\u0644\u0649 \u0634\u062e\u0635 \u0622\u062e\u0631 \u0648\u0644\u0627 \u062a\u064f\u062d\u0648\u0651\u0644 \u0625\u0644\u0649 \u0645\u0627\u0644.',
    tipTitle: '\u0627\u0643\u0633\u0628 \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0639\u0645\u0644\u0627\u062a \u0632\u064a\u0631\u0645',
    tipBody: '\u0633\u062c\u0651\u0644 \u062f\u062e\u0648\u0644\u0643 \u0643\u0644 \u064a\u0648\u0645\u060c \u0648\u0627\u0646\u0634\u0631 \u0625\u0639\u0644\u0627\u0646\u0627\u062a\u060c \u0648\u0627\u062f\u0639\u064f \u0623\u0635\u062f\u0642\u0627\u0621\u0643 - \u062a\u062a\u062c\u0645\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u062a \u0645\u0639 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 Bambeh.',
    historyTitle: '\u0627\u0644\u0633\u062c\u0644', all: '\u0627\u0644\u0643\u0644', earnedTab: '\u0645\u0643\u062a\u0633\u0628\u0629', spentTab: '\u0645\u0633\u062a\u062e\u062f\u0645\u0629',
    noTx: '\u0644\u0627 \u0634\u064a\u0621 \u0647\u0646\u0627 \u0628\u0639\u062f',
    checkin: '\u0627\u0644\u062f\u062e\u0648\u0644 \u0627\u0644\u064a\u0648\u0645\u064a', checkinSub: '\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0645\u0643\u0627\u0641\u0623\u062a\u0643 \u0627\u0644\u064a\u0648\u0645\u064a\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629', checkinBtn: '\u0627\u062d\u0635\u0644',
    checkinDone: '\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0643\u0627\u0641\u0623\u0629 \u0625\u0644\u0649 \u0639\u0645\u0644\u0627\u062a\u0643!', checkinAlready: '\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u064a\u0648\u0645 - \u0639\u062f \u063a\u062f\u064b\u0627.',
    checkinFail: '\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 Bambeh. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u0644\u062d\u0638\u0629.',
    referralCta: '\u0627\u062f\u0639\u064f \u0623\u0635\u062f\u0642\u0627\u0621\u0643 \u0648\u0627\u0643\u0633\u0628 \u0639\u0645\u0644\u0627\u062a',
    refresh: '\u062a\u062d\u062f\u064a\u062b', refreshing: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u062f\u064a\u062b...',
    t_daily_login: '\u0627\u0644\u062f\u062e\u0648\u0644 \u0627\u0644\u064a\u0648\u0645\u064a', t_post_listing: '\u0646\u0634\u0631 \u0625\u0639\u0644\u0627\u0646', t_first_listing: '\u0625\u0639\u0644\u0627\u0646\u0643 \u0627\u0644\u0623\u0648\u0644',
    t_referral_signup: '\u0627\u0646\u0636\u0645 \u0635\u062f\u064a\u0642 \u0625\u0644\u0649 Bambeh', t_signup_bonus: '\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062a\u0631\u062d\u064a\u0628', t_spent: '\u0627\u0633\u062a\u064f\u062e\u062f\u0645\u062a \u0644\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0627\u0644\u0645\u0645\u064a\u0632',
    t_purchase: '\u0639\u0645\u0644\u0627\u062a \u0645\u0634\u062a\u0631\u0627\u0629', t_sent: '\u0623\u064f\u0631\u0633\u0644\u062a \u0625\u0644\u0649 {name}', t_received: '\u0645\u0646 {name}', buyBtn: '\u0634\u0631\u0627\u0621 \u0639\u0645\u0644\u0627\u062a', sendBtn: '\u0625\u0631\u0633\u0627\u0644 \u0639\u0645\u0644\u0627\u062a',
  },
  ff: {
    title: 'Coin\u0257e Zerm', balance: 'Coin\u0257e maa', available: 'Woni',
    earned: 'He\u0253aa\u0257e', spent: 'Huutoraa\u0257e',
    onlyTitle: 'He\u0253etee, soodetaake',
    onlyBody: 'Coin\u0257e Zerm ko poyntiiji \u0257i ke\u0253ataa so a huutorii Bambeh. \u0181e soodetaake, \u0253e yeeyetaake, \u0253e neldetaake go\u0257\u0257o, \u0253e waylotaake kaalis.',
    tipTitle: 'He\u0253 coin\u0257e Zerm keew\u0257e',
    tipBody: 'Naatu \u00f1alnde fof, yaltin jeeynge, noddu sehilaa\u0253e - coin\u0257e \u0253eydotoo so a huutorii Bambeh.',
    historyTitle: 'Taariika', all: 'Fof', earnedTab: 'He\u0253aa\u0257e', spentTab: 'Huutoraa\u0257e',
    noTx: 'Alaa huunde tawo',
    checkin: 'Naatgol \u00f1alnde fof', checkinSub: 'He\u0253 bonus \u00f1alawma maa', checkinBtn: 'He\u0253',
    checkinDone: 'Bonus naati e coin\u0257e maa!', checkinAlready: 'A he\u0253ii hannde - artu janngo.',
    checkinFail: 'Min mbaawaa yottaade Bambeh. Fuddito seeda.',
    referralCta: 'Noddu sehilaa\u0253e, he\u0253 coin\u0257e',
    refresh: 'Hesdin', refreshing: 'Ina hesdina...',
    t_daily_login: 'Naatgol \u00f1alnde', t_post_listing: 'Jeeynge yaltinaama', t_first_listing: 'Jeeynge maa adanngo',
    t_referral_signup: 'Sehil maa naatii e Bambeh', t_signup_bonus: 'Bonus ja\u0253\u0253orgol', t_spent: 'Huutoraama ngam premium',
    t_purchase: 'Coin\u0257e sood\u0257e', t_sent: 'Neldaa e {name}', t_received: 'Immorde e {name}', buyBtn: 'Soodu coin\u0257e', sendBtn: 'Neldu coin\u0257e',
  },
} as const;

type LangStrings = Record<keyof (typeof strings)['en'], string>;

function useStrings(): { s: LangStrings; isRtl: boolean } {
  const raw = String(useLang() || 'en');
  const key = raw === 'fulfulde' || raw === 'ful' ? 'ff' : raw === 'pcm' ? 'pidgin' : raw;
  const s = ((strings as unknown as Record<string, LangStrings>)[key] ?? strings.en) as LangStrings;
  return { s, isRtl: key === 'ar' };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

/** A coin leaves the wallet only when it is used (the premium week). Everything else is a reward. */
const SPENT_TYPES = ['debit', 'spend', 'spent', 'redeem', 'redeem_week', 'premium_week', 'zerm_redeem', 'sent'];
function isSpent(tx: Transaction): boolean {
  return SPENT_TYPES.indexOf(String(tx.type || '').toLowerCase()) >= 0 || Number(tx.amount) < 0;
}

/** Coins are counted in quarter-thousandths (a reward is 0.0025), so show up to four decimals. */
function fmtCoins(n: number | null | undefined): string {
  const v = Number(n) || 0;
  return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function txLabel(tx: Transaction, s: LangStrings): string {
  const ty = String(tx.type || '').toLowerCase();
  // FIX845 writes the other member's name as the description of a send
  if (ty === 'sent') return s.t_sent.replace('{name}', tx.description || '?');
  if (ty === 'received') return s.t_received.replace('{name}', tx.description || '?');
  if (ty === 'purchase') return s.t_purchase;
  if (isSpent(tx)) return s.t_spent;
  const k = ('t_' + String(tx.type || '').toLowerCase()) as keyof LangStrings;
  return s[k] || tx.description || s.earnedTab;
}

export default function CoinsPage() {
  const navigate     = useNavigate();
  const { s, isRtl } = useStrings();
  const { state: zerm } = useZermState();                       // FIX851 - what the admins switched on

  const [balance,      setBalance]      = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab,          setTab]          = useState<'all' | 'earned' | 'spent'>('all');
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [claiming,     setClaiming]     = useState(false);
  const [claimMsg,     setClaimMsg]     = useState<'done' | 'already' | 'fail' | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      const userId = session.user.id;

      const { data: coinData } = await supabase
        .from('zerm_coins')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (coinData) {
        setBalance(Number(coinData.balance) || 0);
      } else {
        // First visit: open the wallet. It always starts at 0 (FIX845 makes sure of it).
        const { data: newRow } = await supabase
          .from('zerm_coins')
          .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' })
          .select('balance')
          .maybeSingle();
        setBalance(Number(newRow?.balance) || 0);
      }

      const { data: txData } = await supabase
        .from('zerm_transactions')
        .select('id, type, amount, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      setTransactions(((txData ?? []) as Transaction[]).map((t) => ({ ...t, amount: Number(t.amount) || 0 })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => { void loadData(); }, [loadData]);

  // Daily check-in via claim_daily_login() (server-enforced, once a day)
  const claimDaily = useCallback(async () => {
    setClaiming(true);
    setClaimMsg(null);
    try {
      const { data, error } = await supabase.rpc('claim_daily_login');
      if (error) { setClaimMsg('fail'); return; }
      if (data === null || data === undefined) {
        setClaimMsg('already');
      } else {
        setClaimMsg('done');
        setBalance(Number(data));
        void loadData(true);
      }
    } catch {
      setClaimMsg('fail');
    } finally {
      setClaiming(false);
    }
  }, [loadData]);

  const filtered = transactions.filter((tx) => tab === 'all' || (tab === 'spent' ? isSpent(tx) : !isSpent(tx)));
  const earned   = transactions.filter((tx) => !isSpent(tx)).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const spent    = transactions.filter((tx) => isSpent(tx)).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'} data-fix="FIX851">

      {/* Header hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-4 pt-10 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-300" /> {s.title}
          </h1>
          <button
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="text-white/80 hover:text-white p-2 rounded-xl transition-colors"
            aria-label={s.refresh}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-center">
          <p className="text-teal-100 text-sm mb-1">{s.balance}</p>
          <div className="text-white text-6xl font-black mb-1" data-balance="1">
            {loading ? '...' : fmtCoins(balance)}
          </div>
          <p className="text-teal-100 text-sm flex items-center justify-center gap-1">
            <Zap className="w-4 h-4 text-yellow-300" /> Zerm Coins
          </p>
        </div>
      </div>

      {/* Stats card */}
      <div className="px-4 -mt-14 mb-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-md border p-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{fmtCoins(balance)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.available}</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-bold text-green-600" data-earned="1">{fmtCoins(earned)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.earned}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{fmtCoins(spent)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.spent}</p>
          </div>
        </div>
      </div>

      {/* FIX547 - one Zerm coin buys a week of premium (its own state from bambeh_zerm_redeem_state()) */}
      <div className="px-4 mb-4">
        <RedeemPremium onRedeemed={() => void loadData(true)} />
      </div>

      {/* FIX851 - Buy / Send only when an admin has switched them on; otherwise: earned, never bought */}
      {(zerm.buying || zerm.sending) ? (
        <div className="px-4 mb-4 grid grid-cols-2 gap-3" data-coin-actions="1">
          {zerm.buying && (
            <button
              onClick={() => navigate('/coins/buy')}
              data-go="buy"
              className={`bg-teal-600 text-white py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm ${zerm.sending ? '' : 'col-span-2'}`}
            >
              <Plus className="w-4 h-4" /> {s.buyBtn}
            </button>
          )}
          {zerm.sending && (
            <button
              onClick={() => navigate('/coins/transfer')}
              data-go="send"
              className={`border-2 border-teal-600 text-teal-600 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform ${zerm.buying ? '' : 'col-span-2'}`}
            >
              <Send className="w-4 h-4" /> {s.sendBtn}
            </button>
          )}
        </div>
      ) : (
        <div className="px-4 mb-4">
          <div className="bg-white border border-teal-100 shadow-sm rounded-2xl p-4 flex items-start gap-3" data-earn-only="1">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{s.onlyTitle}</p>
              <p className="text-xs text-gray-600 mt-0.5">{s.onlyBody}</p>
            </div>
          </div>
        </div>
      )}

      {/* Daily check-in */}
      <div className="px-4 mb-4">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{s.checkin}</p>
            <p className={`text-xs mt-0.5 ${claimMsg === 'fail' ? 'text-red-600' : 'text-gray-500'}`} data-claim-msg={claimMsg ?? ''}>
              {claimMsg === 'done' ? s.checkinDone
                : claimMsg === 'already' ? s.checkinAlready
                : claimMsg === 'fail' ? s.checkinFail
                : s.checkinSub}
            </p>
          </div>
          <button
            onClick={() => void claimDaily()}
            disabled={claiming || claimMsg === 'done' || claimMsg === 'already'}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold active:scale-95 transition-transform disabled:opacity-50 flex-shrink-0"
          >
            {claiming ? '...' : claimMsg === 'done' ? '\u2713' : s.checkinBtn}
          </button>
        </div>
      </div>

      {/* Referral */}
      <div className="px-4 mb-4">
        <button
          onClick={() => navigate('/referral')}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
        >
          <Gift className="w-4 h-4" /> {s.referralCta}
        </button>
      </div>

      {/* Earn tip */}
      <div className="px-4 mb-4">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
          <div>
            <p className="text-sm font-semibold text-teal-800">{s.tipTitle}</p>
            <p className="text-xs text-teal-600 mt-0.5">{s.tipBody}</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-4 h-4" /> {s.historyTitle}
          </h2>
        </div>

        <div className="flex gap-2 mb-3">
          {(['all', 'earned', 'spent'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tab === tabKey
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {tabKey === 'all' ? s.all : tabKey === 'earned' ? s.earnedTab : s.spentTab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{s.noTx}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => {
              const out = isSpent(tx);
              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                  data-tx={tx.type}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${out ? 'bg-red-50' : 'bg-green-50'}`}>
                    {out
                      ? <ArrowUpRight  className="w-5 h-5 text-red-500" />
                      : <ArrowDownLeft className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{txLabel(tx, s)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-bold text-sm flex-shrink-0 ${out ? 'text-red-500' : 'text-green-600'}`} dir="ltr">
                    {out ? '-' : '+'}{fmtCoins(Math.abs(tx.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__COINSPAGE_FIX851__COMPLETE
