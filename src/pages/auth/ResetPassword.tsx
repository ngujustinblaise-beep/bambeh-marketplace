// BAMBEH_DEPLOY_TOKEN__RESETPASSWORD_FIX528_CLEAN
/**
 * src/pages/auth/ResetPassword.tsx - Bambeh Marketplace
 *
 * FIX528 - THIS PAGE DID NOT RESET ANYTHING.
 * ------------------------------------------
 * The version this replaces never imported supabase. Not once. It asked for a
 * "reset token", accepted any six characters, and on submit ran exactly this:
 *
 *     setError(""); navigate("/login", { replace: true });
 *
 * The password was never changed. A locked-out user typed a new password, saw
 * the login screen, and their old password still worked - or rather, still
 * didn't. This is the last step of the recovery flow your Command Center feeds:
 * staff mint a link in UserActionPanel, send it on WhatsApp, and it landed here,
 * where nothing happened. The whole queue led to a dead end.
 *
 * It was also carrying 261 mojibake characters - every French accent and the
 * entire Arabic block had been replaced with question marks - and offered
 * Hausa, which Bambeh does not speak. All five real languages are written as
 * \\u escapes below, so no encoding change can ever corrupt them again.
 *
 * THE TOKEN FIELD IS GONE, ON PURPOSE
 *   A Supabase recovery link carries its own token in the URL. Asking a user to
 *   read a token out of a WhatsApp message and retype it was inviting failure
 *   at the exact moment they are already frustrated. Three link shapes are
 *   handled instead: an existing recovery session, a PKCE "?code=", and a raw
 *   "access_token" pair. If the link is dead the page says so plainly and sends
 *   them to request another, instead of pretending.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

type Dict = {
  title: string; subtitle: string; next: string; confirm: string; save: string;
  saving: string; cancel: string; checking: string; mismatch: string; tooShort: string;
  linkDead: string; getNew: string; done: string; doneBody: string; goHome: string;
  sameAsOld: string; failed: string; show: string; hide: string;
};

const STR: Record<string, Dict> = {
  en: {
    title: 'Choose a new password',
    subtitle: 'Type it twice so we know it is right.',
    next: 'New password', confirm: 'Confirm new password',
    save: 'Update password', saving: 'Updating\u2026', cancel: 'Back to login',
    checking: 'Checking your link\u2026',
    mismatch: 'The two passwords are not the same.',
    tooShort: 'Use at least 8 characters.',
    linkDead: 'This link has expired or has already been used. Reset links only work once.',
    getNew: 'Request a new link',
    done: 'Password changed', doneBody: 'You are signed in. Keep this password safe.',
    goHome: 'Continue to Bambeh',
    sameAsOld: 'That is your current password. Choose a different one.',
    failed: 'The password could not be changed. Please try again.',
    show: 'Show password', hide: 'Hide password',
  },
  fr: {
    title: 'Choisissez un nouveau mot de passe',
    subtitle: 'Saisissez-le deux fois pour \u00eatre s\u00fbr.',
    next: 'Nouveau mot de passe', confirm: 'Confirmez le nouveau mot de passe',
    save: 'Mettre \u00e0 jour', saving: 'Mise \u00e0 jour\u2026', cancel: 'Retour \u00e0 la connexion',
    checking: 'V\u00e9rification de votre lien\u2026',
    mismatch: 'Les deux mots de passe ne sont pas identiques.',
    tooShort: 'Utilisez au moins 8 caract\u00e8res.',
    linkDead: 'Ce lien a expir\u00e9 ou a d\u00e9j\u00e0 servi. Un lien de r\u00e9initialisation ne fonctionne qu\u2019une fois.',
    getNew: 'Demander un nouveau lien',
    done: 'Mot de passe modifi\u00e9', doneBody: 'Vous \u00eates connect\u00e9. Gardez ce mot de passe en s\u00fbret\u00e9.',
    goHome: 'Continuer vers Bambeh',
    sameAsOld: 'C\u2019est votre mot de passe actuel. Choisissez-en un autre.',
    failed: 'Le mot de passe n\u2019a pas pu \u00eatre modifi\u00e9. R\u00e9essayez.',
    show: 'Afficher le mot de passe', hide: 'Masquer le mot de passe',
  },
  pcm: {
    title: 'Choose new password',
    subtitle: 'Type am two times so we go sabi say e correct.',
    next: 'New password', confirm: 'Confirm new password',
    save: 'Update password', saving: 'We dey update\u2026', cancel: 'Back to login',
    checking: 'We dey check your link\u2026',
    mismatch: 'The two password no be the same.',
    tooShort: 'Use at least 8 characters.',
    linkDead: 'This link don expire or dem don use am. Reset link dey work one time only.',
    getNew: 'Ask for new link',
    done: 'Password don change', doneBody: 'You don sign in. Keep this password safe.',
    goHome: 'Continue go Bambeh',
    sameAsOld: 'Na your old password be that. Choose another one.',
    failed: 'We no fit change the password. Abeg try again.',
    show: 'Show password', hide: 'Hide password',
  },
  ar: {
    title: '\u0627\u062e\u062a\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629',
    subtitle: '\u0627\u0643\u062a\u0628\u0647\u0627 \u0645\u0631\u062a\u064a\u0646 \u0644\u0644\u062a\u0623\u0643\u062f.',
    next: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629',
    confirm: '\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    save: '\u062a\u062d\u062f\u064a\u062b \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    saving: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u062f\u064a\u062b\u2026',
    cancel: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    checking: '\u062c\u0627\u0631\u064d \u0641\u062d\u0635 \u0627\u0644\u0631\u0627\u0628\u0637\u2026',
    mismatch: '\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646.',
    tooShort: '\u0627\u0633\u062a\u062e\u062f\u0645 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.',
    linkDead: '\u0627\u0646\u062a\u0647\u062a \u0635\u0644\u0627\u062d\u064a\u0629 \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0623\u0648 \u062a\u0645 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647.',
    getNew: '\u0627\u0637\u0644\u0628 \u0631\u0627\u0628\u0637\u0627\u064b \u062c\u062f\u064a\u062f\u0627\u064b',
    done: '\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    doneBody: '\u0623\u0646\u062a \u0627\u0644\u0622\u0646 \u0645\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644.',
    goHome: '\u0645\u062a\u0627\u0628\u0639\u0629 \u0625\u0644\u0649 Bambeh',
    sameAsOld: '\u0647\u0630\u0647 \u0647\u064a \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631\u0643 \u0627\u0644\u062d\u0627\u0644\u064a\u0629. \u0627\u062e\u062a\u0631 \u063a\u064a\u0631\u0647\u0627.',
    failed: '\u062a\u0639\u0630\u0631 \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.',
    show: '\u0625\u0638\u0647\u0627\u0631', hide: '\u0625\u062e\u0641\u0627\u0621',
  },
  ff: {
    title: 'Su\u0253o mo\u01b4\u01b4ere hesere',
    subtitle: 'Winndu nde laabi \u0257i\u0257i ngam anndude ko nde mo\u01b4\u01b4unde.',
    next: 'Mo\u01b4\u01b4ere hesere', confirm: '\u0181eydu mo\u01b4\u01b4ere hesere',
    save: 'Hokka mo\u01b4\u01b4ere', saving: 'Ko waylo\u2026', cancel: 'Rutto to naatugol',
    checking: 'Min ndaara jokkorde maa\u2026',
    mismatch: 'Mo\u01b4\u01b4e \u0257e \u0257i\u0257i ngonaa gooto.',
    tooShort: 'Huutoro huunde 8 walla \u0253urnde.',
    linkDead: 'Ndee jokkorde timmii walla huutoraama. Nde wonata laawol gootol tan.',
    getNew: '\u01b4amu jokkorde hesere',
    done: 'Mo\u01b4\u01b4ere waylaama', doneBody: 'A naatii. Reenu mo\u01b4\u01b4ere maa.',
    goHome: 'Jokku to Bambeh',
    sameAsOld: 'Ko mo\u01b4\u01b4ere maa jonde. Su\u0253o goddun.',
    failed: 'Mo\u01b4\u01b4ere waawaa waylude. E\u0257\u0257itto.',
    show: 'Hollu', hide: 'Suu\u0257u',
  },
};

/** the codebase spells these several ways; accept all of them */
function pick(code: unknown): Dict {
  const c = String(code || 'en').toLowerCase();
  if (STR[c]) return STR[c];
  if (c === 'pidgin') return STR.pcm;
  if (c === 'ful' || c === 'fula' || c === 'fulfulde') return STR.ff;
  if (c.startsWith('fr')) return STR.fr;
  if (c.startsWith('ar')) return STR.ar;
  return STR.en;
}

type Phase = 'checking' | 'ready' | 'saving' | 'dead' | 'done';

export default function ResetPassword() {
  const navigate = useNavigate();
  const langCtx = (useLanguage() || {}) as { language?: string };
  const t = pick(langCtx.language);
  const isRtl = String(langCtx.language || '').toLowerCase() === 'ar';

  const [phase, setPhase] = useState<Phase>('checking');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  /**
   * Three ways a recovery link can arrive. Try them in order, once.
   * HashRouter puts the app's own route in the hash, so tokens can land in
   * either half of the URL depending on how the link was built and how the
   * chat app that carried it rewrote it.
   */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 1. the SDK may already have swapped the token for a session
        const { data } = await supabase.auth.getSession();
        if (!alive) return;
        if (data?.session) { setPhase('ready'); return; }

        const href = window.location.href;

        // 2. PKCE style: ?code=...
        const code = new URLSearchParams(window.location.search).get('code')
          || (href.includes('code=') ? href.split('code=')[1]?.split(/[&#]/)[0] : null);
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!alive) return;
          if (!exErr) { setPhase('ready'); return; }
        }

        // 3. implicit style: access_token + refresh_token anywhere in the URL
        const grab = (k: string) => {
          const m = href.match(new RegExp('[#&?]' + k + '=([^&#]+)'));
          return m ? decodeURIComponent(m[1]) : null;
        };
        const at = grab('access_token');
        const rt = grab('refresh_token');
        if (at && rt) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: at, refresh_token: rt,
          });
          if (!alive) return;
          if (!setErr) { setPhase('ready'); return; }
        }

        setPhase('dead');
      } catch {
        if (alive) setPhase('dead');
      }
    })();
    return () => { alive = false; };
  }, []);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (next.length < 8) { setError(t.tooShort); return; }
    if (next !== confirm) { setError(t.mismatch); return; }

    setPhase('saving');
    const { error: upErr } = await supabase.auth.updateUser({ password: next });
    if (upErr) {
      const msg = (upErr.message || '').toLowerCase();
      // Supabase words this differently across versions; match on meaning
      if (msg.includes('should be different') || msg.includes('same as')) setError(t.sameAsOld);
      else if (msg.includes('weak') || msg.includes('at least')) setError(t.tooShort);
      else setError(t.failed);
      setPhase('ready');
      return;
    }
    setPhase('done');
  }, [next, confirm, t]);

  /* ---------------------------------------------------------------- */

  if (phase === 'checking') {
    return (
      <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="py-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" />
          <p className="mt-3 text-sm text-gray-500">{t.checking}</p>
        </div>
      </AuthShell>
    );
  }

  if (phase === 'dead') {
    return (
      <AuthShell title={t.title} subtitle="" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t.linkDead}</span>
          </div>
          <button type="button" onClick={() => navigate('/forgot-password', { replace: true })}
            className="w-full rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700">
            {t.getNew}
          </button>
          <button type="button" onClick={() => navigate('/login', { replace: true })}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100">
            {t.cancel}
          </button>
        </div>
      </AuthShell>
    );
  }

  if (phase === 'done') {
    return (
      <AuthShell title={t.done} subtitle={t.doneBody} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <button type="button" onClick={() => navigate('/', { replace: true })}
            className="w-full rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700">
            {t.goHome}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t.title} subtitle={t.subtitle} dir={isRtl ? 'rtl' : 'ltr'}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input
            value={next}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNext(e.target.value)}
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t.next}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm outline-none focus:border-teal-500 focus:bg-white"
          />
          <button type="button" onClick={() => setShow((v: boolean) => !v)}
            aria-label={show ? t.hide : t.show}
            className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input
            value={confirm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t.confirm}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white"
          />
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <button type="submit" disabled={phase === 'saving'}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-gray-300">
          {phase === 'saving'
            ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.saving}</>
            : <>{t.save} <CheckCircle2 className="h-4 w-4" /></>}
        </button>

        <button type="button" onClick={() => navigate('/login', { replace: true })}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100">
          {t.cancel}
        </button>
      </form>
    </AuthShell>
  );
}
// BAMBEH_END_TOKEN__RESETPASSWORD_FIX528__COMPLETE
