// BAMBEH_DEPLOY_TOKEN__REFERRALPROGRAM_FIX137_REAL_CLEAN
/**
 * ReferralProgram.tsx — Bambeh Marketplace (FIX137)
 * FILE LOCATION: src/pages/ReferralProgram.tsx  (REPLACES the mock version)
 *
 * REAL data — mock Alice/Bob/Carol and random codes fully removed:
 *  • Your real referral code from profiles.referral_code (FIX133).
 *  • Real referral list from zerm_referrals (dates + reward status).
 *  • Real earnings: sum of zerm_transactions type 'referral_signup'.
 *  • Live reward amount from zerm_reward_rules (admin-editable, no redeploy).
 *  • "Enter a friend's code" → apply_referral_code() RPC with clear feedback.
 *  • Copy + native Share. 5 languages + RTL.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift, Users, Copy, Check, Share2, ArrowLeft, Loader2, Zap, KeyRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

// -- i18n ----------------------------------------------------------------------
const strings = {
  en: {
    title: 'Referral Program',
    yourCode: 'Your Referral Code', codeHint: 'Friends enter this code when they join Bambeh.',
    share: 'Share with Friends', copied: 'Copied!',
    shareText: (code: string, amt: number) =>
      `Join me on Bambeh Marketplace! Use my referral code ${code} when you sign up. bambeh.com`,
    perFriend: (amt: number) => `You earn ${amt} Zerm Coins for every friend who joins with your code.`,
    statFriends: 'Friends Joined', statEarned: 'Coins Earned',
    haveCode: 'Have a friend\u2019s code?', haveCodeHint: 'Enter it once to link your accounts.',
    codePlaceholder: 'Enter code', apply: 'Apply', applying: 'Applying\u2026',
    ok: 'Code applied \u2014 you are now linked to your friend!',
    invalid_code: 'That code was not found. Check it and try again.',
    own_code: 'You cannot use your own code.',
    already_referred: 'A code has already been applied to your account.',
    not_signed_in: 'Please sign in first.',
    error: 'Something went wrong. Please try again.',
    listTitle: 'Your Referrals', empty: 'No referrals yet \u2014 share your code!',
    friend: 'Friend', joined: 'Joined', rewarded: 'Rewarded', pending: 'Pending',
  },
  fr: {
    title: 'Programme de parrainage',
    yourCode: 'Votre code de parrainage', codeHint: 'Vos amis entrent ce code en s\u2019inscrivant sur Bambeh.',
    share: 'Partager avec des amis', copied: 'Copi\u00e9 !',
    shareText: (code: string, amt: number) =>
      `Rejoins-moi sur Bambeh Marketplace ! Utilise mon code ${code} \u00e0 l\u2019inscription. bambeh.com`,
    perFriend: (amt: number) => `Vous gagnez ${amt} pi\u00e8ces Zerm pour chaque ami qui s\u2019inscrit avec votre code.`,
    statFriends: 'Amis inscrits', statEarned: 'Pi\u00e8ces gagn\u00e9es',
    haveCode: 'Vous avez le code d\u2019un ami ?', haveCodeHint: 'Entrez-le une fois pour lier vos comptes.',
    codePlaceholder: 'Entrer le code', apply: 'Appliquer', applying: 'Application\u2026',
    ok: 'Code appliqu\u00e9 \u2014 vous \u00eates maintenant li\u00e9 \u00e0 votre ami !',
    invalid_code: 'Code introuvable. V\u00e9rifiez et r\u00e9essayez.',
    own_code: 'Vous ne pouvez pas utiliser votre propre code.',
    already_referred: 'Un code a d\u00e9j\u00e0 \u00e9t\u00e9 appliqu\u00e9 \u00e0 votre compte.',
    not_signed_in: 'Veuillez d\u2019abord vous connecter.',
    error: 'Une erreur est survenue. Veuillez r\u00e9essayer.',
    listTitle: 'Vos parrainages', empty: 'Aucun parrainage \u2014 partagez votre code !',
    friend: 'Ami', joined: 'Inscrit', rewarded: 'R\u00e9compens\u00e9', pending: 'En attente',
  },
  pidgin: {
    title: 'Referral Program',
    yourCode: 'Your Referral Code', codeHint: 'Your padi dem go enter this code when dem join Bambeh.',
    share: 'Share give padi', copied: 'E don copy!',
    shareText: (code: string, amt: number) =>
      `Come join me for Bambeh Marketplace! Use my code ${code} when you register. bambeh.com`,
    perFriend: (amt: number) => `You go get ${amt} Zerm Coins for every padi wey join with your code.`,
    statFriends: 'Padi wey join', statEarned: 'Coins wey you get',
    haveCode: 'You get padi code?', haveCodeHint: 'Enter am one time make una link.',
    codePlaceholder: 'Enter code', apply: 'Apply', applying: 'E dey apply\u2026',
    ok: 'Code don enter \u2014 you and your padi don link!',
    invalid_code: 'That code no dey. Check am try again.',
    own_code: 'You no fit use your own code.',
    already_referred: 'Code don already enter for your account.',
    not_signed_in: 'Abeg sign in first.',
    error: 'Something spoil. Try again.',
    listTitle: 'Your Referrals', empty: 'No referral yet \u2014 share your code!',
    friend: 'Padi', joined: 'Don join', rewarded: 'Don pay', pending: 'E dey wait',
  },
  ar: {
    title: '\u0628\u0631\u0646\u0627\u0645\u062c \u0627\u0644\u0625\u062d\u0627\u0644\u0629',
    yourCode: '\u0631\u0645\u0632 \u0627\u0644\u0625\u062d\u0627\u0644\u0629 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643', codeHint: '\u064a\u062f\u062e\u0644 \u0623\u0635\u062f\u0642\u0627\u0624\u0643 \u0647\u0630\u0627 \u0627\u0644\u0631\u0645\u0632 \u0639\u0646\u062f \u0627\u0646\u0636\u0645\u0627\u0645\u0647\u0645 \u0625\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647.',
    share: '\u0634\u0627\u0631\u0643 \u0645\u0639 \u0627\u0644\u0623\u0635\u062f\u0642\u0627\u0621', copied: '\u062a\u0645 \u0627\u0644\u0646\u0633\u062e!',
    shareText: (code: string, amt: number) =>
      `\u0627\u0646\u0636\u0645 \u0625\u0644\u064a\u0651 \u0641\u064a \u0628\u0627\u0645\u0628\u064a\u0647! \u0627\u0633\u062a\u062e\u062f\u0645 \u0631\u0645\u0632\u064a ${code} \u0639\u0646\u062f \u0627\u0644\u062a\u0633\u062c\u064a\u0644. bambeh.com`,
    perFriend: (amt: number) => `\u062a\u0643\u0633\u0628 ${amt} \u0639\u0645\u0644\u0629 \u0632\u064a\u0631\u0645 \u0639\u0646 \u0643\u0644 \u0635\u062f\u064a\u0642 \u064a\u0646\u0636\u0645 \u0628\u0631\u0645\u0632\u0643.`,
    statFriends: '\u0623\u0635\u062f\u0642\u0627\u0621 \u0627\u0646\u0636\u0645\u0648\u0627', statEarned: '\u0639\u0645\u0644\u0627\u062a \u0645\u0643\u062a\u0633\u0628\u0629',
    haveCode: '\u0644\u062f\u064a\u0643 \u0631\u0645\u0632 \u0635\u062f\u064a\u0642\u061f', haveCodeHint: '\u0623\u062f\u062e\u0644\u0647 \u0645\u0631\u0629 \u0648\u0627\u062d\u062f\u0629 \u0644\u0631\u0628\u0637 \u062d\u0633\u0627\u0628\u064a\u0643\u0645\u0627.',
    codePlaceholder: '\u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632', apply: '\u062a\u0637\u0628\u064a\u0642', applying: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u2026',
    ok: '\u062a\u0645 \u062a\u0637\u0628\u064a\u0642 \u0627\u0644\u0631\u0645\u0632 \u2014 \u0623\u0646\u062a \u0627\u0644\u0622\u0646 \u0645\u0631\u062a\u0628\u0637 \u0628\u0635\u062f\u064a\u0642\u0643!',
    invalid_code: '\u0627\u0644\u0631\u0645\u0632 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f. \u062a\u062d\u0642\u0642 \u0648\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u064b\u0627.',
    own_code: '\u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0631\u0645\u0632\u0643 \u0627\u0644\u062e\u0627\u0635.',
    already_referred: '\u062a\u0645 \u062a\u0637\u0628\u064a\u0642 \u0631\u0645\u0632 \u0628\u0627\u0644\u0641\u0639\u0644 \u0639\u0644\u0649 \u062d\u0633\u0627\u0628\u0643.',
    not_signed_in: '\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b.',
    error: '\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    listTitle: '\u0625\u062d\u0627\u0644\u0627\u062a\u0643', empty: '\u0644\u0627 \u0625\u062d\u0627\u0644\u0627\u062a \u0628\u0639\u062f \u2014 \u0634\u0627\u0631\u0643 \u0631\u0645\u0632\u0643!',
    friend: '\u0635\u062f\u064a\u0642', joined: '\u0627\u0646\u0636\u0645', rewarded: '\u062a\u0645\u062a \u0627\u0644\u0645\u0643\u0627\u0641\u0623\u0629', pending: '\u0642\u064a\u062f \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631',
  },
  ff: {
    title: 'Porogaraamu Noddugol',
    yourCode: 'Kod noddugol maa', codeHint: 'Sehilaa\u0253e maa naatnata kod oo so \u0253e naati Bambeh.',
    share: 'Sar\u00f3 e sehilaa\u0253e', copied: 'Naatii!',
    shareText: (code: string, amt: number) =>
      `Ar naatu Bambeh Marketplace! Huutoro kod am ${code} so a winnditoto. bambeh.com`,
    perFriend: (amt: number) => `A he\u0253ata ${amt} Zerm Coin\u0257e wonande sehil fof naat\u0257o e kod maa.`,
    statFriends: 'Sehilaa\u0253e naat\u0253e', statEarned: 'Coin\u0257e he\u0253aa\u0257e',
    haveCode: 'A jogii kod sehil?', haveCodeHint: 'Naatnu mo laawol gootol ngam jokkondirde.',
    codePlaceholder: 'Naatnu kod', apply: 'Huutoro', applying: '\u0257on huutoroo\u2026',
    ok: 'Kod naatii \u2014 a jokkondirii e sehil maa!',
    invalid_code: 'Kod oo alaa. \u01b4eew kadi.',
    own_code: 'A waawaa huutoraade kod maa kaa.',
    already_referred: 'Kod naatii e konte maa ko adii.',
    not_signed_in: 'Tii\u0257no naatu ko adii.',
    error: 'Hu\u0257o boni. Tii\u0257no eto kadi.',
    listTitle: 'Noddugol maa', empty: 'Alaa noddugol tawo \u2014 sar\u00f3 kod maa!',
    friend: 'Sehil', joined: 'Naatii', rewarded: 'Yo\u0253aama', pending: '\u0257on fadee',
  },
} as const;

type LangStrings = (typeof strings)['en'];

function useStrings(): { s: LangStrings; isRtl: boolean } {
  const raw = useLang() as string;
  const key = raw === 'fulfulde' ? 'ff' : raw;
  const s = ((strings as Record<string, LangStrings>)[key] ?? strings.en);
  return { s, isRtl: key === 'ar' };
}

interface ReferralRow {
  id: string;
  rewarded: boolean;
  created_at: string;
}

export default function ReferralProgram() {
  const navigate = useNavigate();
  const { s, isRtl } = useStrings();

  const [code, setCode] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<number>(200);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [earned, setEarned] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<keyof LangStrings | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      const userId = session.user.id;

      // My referral code (created by FIX133 for every profile)
      const { data: prof } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .maybeSingle();
      if (prof?.referral_code) setCode(prof.referral_code);

      // Live reward amount (admin can edit zerm_reward_rules anytime)
      const { data: rule } = await supabase
        .from('zerm_reward_rules')
        .select('amount')
        .eq('rule_key', 'referral_signup')
        .maybeSingle();
      if (rule?.amount != null) setRewardAmount(Number(rule.amount));

      // My referrals (RLS: I only see rows where I am referrer or referred)
      const { data: refs } = await supabase
        .from('zerm_referrals')
        .select('id, rewarded, created_at')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });
      setReferrals(refs ?? []);

      // Real earnings from the transaction ledger
      const { data: txs } = await supabase
        .from('zerm_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'referral_signup');
      setEarned((txs ?? []).reduce((sum, r) => sum + Number(r.amount || 0), 0));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void load(); }, [load]);

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => {});
  }

  async function shareCode() {
    if (!code) return;
    const text = s.shareText(code, rewardAmount);
    try {
      if (navigator.share) await navigator.share({ text });
      else copyCode();
    } catch { /* user cancelled */ }
  }

  async function applyCode() {
    const trimmed = inputCode.trim();
    if (!trimmed || applying) return;
    setApplying(true);
    setApplyResult(null);
    try {
      const { data, error } = await supabase.rpc('apply_referral_code', { p_code: trimmed });
      if (error) throw error;
      const key = String(data) as keyof LangStrings;
      setApplyResult(['ok', 'invalid_code', 'own_code', 'already_referred', 'not_signed_in'].includes(key) ? key : 'error');
      if (key === 'ok') setInputCode('');
    } catch (e) {
      console.error('[ReferralProgram] apply_referral_code failed:', e);
      setApplyResult('error');
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white px-4 pt-6 pb-10">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="mb-3 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber-300" /> {s.title}
        </h1>
        <p className="text-teal-100 text-sm mt-1 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-300 flex-shrink-0" /> {s.perFriend(rewardAmount)}
        </p>
      </div>

      <div className="px-4 -mt-5 max-w-lg mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-2xl font-bold text-gray-900">{loading ? '…' : referrals.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.statFriends}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <div className="text-2xl font-bold text-teal-600">{loading ? '…' : earned.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.statEarned}</div>
          </div>
        </div>

        {/* My code */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">{s.yourCode}</h3>
          <p className="text-xs text-gray-400 mb-3">{s.codeHint}</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-3">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <span className="flex-1 font-mono font-bold text-teal-600 text-lg tracking-widest">{code || '—'}</span>
            )}
            <button onClick={copyCode} aria-label="Copy" className="p-2 bg-teal-600 text-white rounded-lg active:scale-95 transition-transform">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && <p className="text-xs text-teal-600 font-semibold mb-2">{s.copied}</p>}
          <button
            onClick={() => void shareCode()}
            className="w-full border border-teal-600 text-teal-600 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4" /> {s.share}
          </button>
        </div>

        {/* Apply a friend's code */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-500" /> {s.haveCode}
          </h3>
          <p className="text-xs text-gray-400 mb-3">{s.haveCodeHint}</p>
          <div className="flex gap-2">
            <input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder={s.codePlaceholder}
              maxLength={12}
              className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono tracking-widest uppercase outline-none focus:ring-2 focus:ring-teal-300"
            />
            <button
              onClick={() => void applyCode()}
              disabled={applying || !inputCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold active:scale-95 transition-transform disabled:opacity-50 flex-shrink-0"
            >
              {applying ? s.applying : s.apply}
            </button>
          </div>
          {applyResult && (
            <p className={`text-xs font-semibold mt-2 ${applyResult === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
              {String(s[applyResult])}
            </p>
          )}
        </div>

        {/* Referral list */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> {s.listTitle}
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : referrals.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">{s.empty}</p>
          ) : (
            <div className="space-y-2">
              {referrals.map((r, i) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.friend} #{referrals.length - i}</p>
                    <p className="text-xs text-gray-400">
                      {s.joined}: {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.rewarded ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {r.rewarded ? `+${rewardAmount} · ${s.rewarded}` : s.pending}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__REFERRALPROGRAM_FIX137__COMPLETE
