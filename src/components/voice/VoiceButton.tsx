// BAMBEH_DEPLOY_TOKEN__VOICEBUTTON_FIX527_CLEAN
/**
 * src/components/voice/VoiceButton.tsx - Bambeh Marketplace
 *
 * FIX527 - the microphone the user actually presses.
 *
 * IT HIDES ITSELF WHEN IT CANNOT WORK
 *   On a WebView without the plugin, or in Firefox, `supported` is false and
 *   this renders nothing. A microphone button that does nothing when pressed
 *   teaches people the app is broken.
 *
 * IT SAYS WHAT WENT WRONG, IN THEIR LANGUAGE
 *   "Nothing heard", "microphone blocked", "you are offline" are three
 *   different problems with three different fixes. One grey "error" helps
 *   nobody on a 2G line.
 *
 * IT ADMITS THE FULFULDE PROBLEM
 *   No speech engine on earth transcribes Fulfulde. A Fulfulde speaker gets a
 *   plain line telling them it will listen in French, rather than being quietly
 *   misheard and wondering why the app is stupid.
 *
 * IT NEVER PAYS
 *   Saying "pay" opens the checkout. The user still presses the button. A
 *   recogniser that hears "cinq cents" as "cinq mille" must not be able to move
 *   money.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader2, X } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import {
  detectEngine, listenOnce, normaliseLang, isApproximate,
  type VoiceLang, type VoiceErrorCode, type ListenHandle,
} from '@/lib/bambehVoice';
import { interpret, actionToPath } from '@/lib/voiceCommands';

type Copy = {
  tap: string; listening: string; heard: string; goingTo: string;
  approx: string; close: string;
  err: Record<VoiceErrorCode, string>;
};

const T: Record<VoiceLang, Copy> = {
  en: {
    tap: 'Tap and speak', listening: 'Listening...', heard: 'Heard', goingTo: 'Opening',
    approx: 'No system can understand Fulfulde yet. Bambeh will listen in French.',
    close: 'Close',
    err: {
      no_permission: 'Bambeh needs permission to use the microphone. Allow it in your phone settings.',
      unsupported: 'Voice is not available on this device.',
      no_speech: 'Nothing was heard. Try again, closer to the phone.',
      network: 'Voice needs a connection. You appear to be offline.',
      aborted: 'Stopped.',
      failed: 'That did not work. Please try again.',
    },
  },
  fr: {
    tap: 'Appuyez et parlez', listening: 'J\u2019\u00e9coute...', heard: 'Entendu', goingTo: 'Ouverture de',
    approx: 'Aucun syst\u00e8me ne comprend encore le fulfulde. Bambeh \u00e9coutera en fran\u00e7ais.',
    close: 'Fermer',
    err: {
      no_permission: 'Bambeh a besoin du microphone. Autorisez-le dans les param\u00e8tres du t\u00e9l\u00e9phone.',
      unsupported: 'La voix n\u2019est pas disponible sur cet appareil.',
      no_speech: 'Rien n\u2019a \u00e9t\u00e9 entendu. R\u00e9essayez, plus pr\u00e8s du t\u00e9l\u00e9phone.',
      network: 'La voix a besoin d\u2019une connexion. Vous semblez hors ligne.',
      aborted: 'Arr\u00eat\u00e9.',
      failed: 'Cela n\u2019a pas fonctionn\u00e9. R\u00e9essayez.',
    },
  },
  pcm: {
    tap: 'Press am, talk', listening: 'I dey hear you...', heard: 'I hear', goingTo: 'I dey open',
    approx: 'No machine fit understand Fulfulde yet. Bambeh go listen for French.',
    close: 'Close am',
    err: {
      no_permission: 'Bambeh need permission for microphone. Go your phone settings, allow am.',
      unsupported: 'Voice no dey work for this phone.',
      no_speech: 'I no hear anything. Try again, near the phone.',
      network: 'Voice need network. E be like say you no get connection.',
      aborted: 'I stop.',
      failed: 'E no work. Abeg try again.',
    },
  },
  ar: {
    tap: '\u0627\u0636\u063a\u0637 \u0648\u062a\u0643\u0644\u0645', listening: '\u0623\u0633\u062a\u0645\u0639...',
    heard: '\u0633\u0645\u0639\u062a', goingTo: '\u062c\u0627\u0631\u064a \u0627\u0644\u0641\u062a\u062d',
    approx: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0646\u0638\u0627\u0645 \u064a\u0641\u0647\u0645 \u0627\u0644\u0641\u0648\u0644\u0627\u0646\u064a\u0629 \u0628\u0639\u062f. \u0633\u064a\u0633\u062a\u0645\u0639 Bambeh \u0628\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629.',
    close: '\u0625\u063a\u0644\u0627\u0642',
    err: {
      no_permission: '\u064a\u062d\u062a\u0627\u062c Bambeh \u0625\u0644\u0649 \u0625\u0630\u0646 \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646. \u0627\u0633\u0645\u062d \u0628\u0647 \u0641\u064a \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a.',
      unsupported: '\u0627\u0644\u0635\u0648\u062a \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062c\u0647\u0627\u0632.',
      no_speech: '\u0644\u0645 \u0623\u0633\u0645\u0639 \u0634\u064a\u0626\u0627. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
      network: '\u0627\u0644\u0635\u0648\u062a \u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0627\u062a\u0635\u0627\u0644.',
      aborted: '\u062a\u0648\u0642\u0641.',
      failed: '\u0644\u0645 \u064a\u0646\u062c\u062d. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    },
  },
  ff: {
    tap: '\u00d1o\u01b4\u01b4u, haalu', listening: 'Mi nana...', heard: 'Mi nanii', goingTo: 'Mi udditii',
    approx: 'Masi\u014b woodaani mo faamata Fulfulde. Bambeh nanan e Faransi.',
    close: 'Uddu',
    err: {
      no_permission: 'Bambeh ina soklii yamiroore mikoro. Yamir e teeleeji maa.',
      unsupported: 'Sawto ngoo waawaa e ndee ka\u0253irgel.',
      no_speech: 'Mi nanaani hay huunde. Etu kadi.',
      network: 'Sawto ina soklii jokkondiral.',
      aborted: 'Mi dartii.',
      failed: 'Waawaa. Etu kadi.',
    },
  },
};

interface Props {
  /** extra classes for the button, so it drops into any header */
  className?: string;
  /** called with the query instead of navigating, if the host wants to handle it */
  onSearch?: (query: string) => void;
}

export default function VoiceButton({ className = '', onSearch }: Props) {
  const navigate = useNavigate();
  const lang = normaliseLang(useLang() as string);
  const t = T[lang] || T.en;
  const rtl = lang === 'ar';

  const [supported, setSupported] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<VoiceErrorCode | null>(null);
  const [going, setGoing] = useState<string | null>(null);
  const handle = useRef<ListenHandle | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    void detectEngine().then((i: { supported: boolean }) => { if (alive.current) setSupported(i.supported); });
    return () => { alive.current = false; };
  }, []);

  const run = useCallback(async () => {
    setOpen(true); setError(null); setPartial(''); setGoing(null); setListening(true);
    try {
      const res = await listenOnce(
        { lang, onPartial: (p: string) => { if (alive.current) setPartial(p); } },
        (h: ListenHandle) => { handle.current = h; },
      );
      if (!alive.current) return;
      setListening(false);
      setPartial(res.transcript);

      const action = interpret(res.transcript);
      if (!action) { setError('no_speech'); return; }
      if (action.kind === 'back') { setOpen(false); navigate(-1); return; }
      if (action.kind === 'help') { setOpen(false); navigate('/help'); return; }
      if (action.kind === 'search' && onSearch) { setOpen(false); onSearch(action.query); return; }

      const path = actionToPath(action);
      if (!path) { setOpen(false); return; }
      setGoing(action.kind === 'navigate' ? action.label : action.query);
      // a beat so the user sees what was understood before the screen changes
      window.setTimeout(() => { if (alive.current) { setOpen(false); navigate(path); } }, 700);
    } catch (code) {
      if (!alive.current) return;
      setListening(false);
      setError((code as VoiceErrorCode) || 'failed');
    }
  }, [lang, navigate, onSearch]);

  const close = () => {
    try { handle.current?.cancel(); } catch { /* ignore */ }
    setOpen(false); setListening(false); setPartial(''); setError(null); setGoing(null);
  };

  // Never render a button that cannot do anything.
  if (supported !== true) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => void run()}
        aria-label={t.tap}
        title={t.tap}
        className={'inline-flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/10 active:scale-95 ' + className}
      >
        <Mic className="w-5 h-5" />
      </button>

      {open && (
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 text-center"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <button type="button" onClick={close} aria-label={t.close}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 sm:static sm:float-right">
              <X className="w-4 h-4 text-gray-400" />
            </button>

            <div className={'mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ' +
              (listening ? 'bg-red-50' : error ? 'bg-gray-100' : 'bg-teal-50')}>
              {listening
                ? <Mic className="h-7 w-7 text-red-600 animate-pulse" />
                : going
                  ? <Loader2 className="h-7 w-7 text-teal-600 animate-spin" />
                  : <Mic className={'h-7 w-7 ' + (error ? 'text-gray-400' : 'text-teal-600')} />}
            </div>

            <p className="text-sm font-semibold text-gray-900">
              {listening ? t.listening : going ? t.goingTo + ' ' + going : error ? '' : t.tap}
            </p>

            {partial && !error && (
              <p className="mt-2 text-base text-gray-700">
                <span className="text-xs text-gray-400">{t.heard}: </span>{partial}
              </p>
            )}

            {error && (
              <p className="mt-1 text-sm text-gray-700">{t.err[error]}</p>
            )}

            {isApproximate(lang) && !error && (
              <p className="mt-3 text-[11px] leading-snug text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                {t.approx}
              </p>
            )}

            {(error || (!listening && !going)) && (
              <button type="button" onClick={() => void run()}
                className="mt-4 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white active:scale-95">
                {t.tap}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
// BAMBEH_END_TOKEN__VOICEBUTTON_FIX527__COMPLETE
