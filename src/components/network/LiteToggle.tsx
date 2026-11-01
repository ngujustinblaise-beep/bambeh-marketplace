// BAMBEH_DEPLOY_TOKEN__LITETOGGLE_FIX961_CLEAN
/**
 * src/components/network/LiteToggle.tsx - FIX961 (Package 15)
 * The "Save data" switch in the phone menu (Header, FIX962). It is the same switch as the slow-connection banner's
 * button (NetworkMonitor, FIX962) - one switch for the whole app (FIX958).
 *   ON:  photos show only when you open an item; the big security library is not downloaded at start.
 *   OFF: everything as usual.
 * Left alone, it is ON by itself when the phone asks to save data or the line is 2G, and says so.
 */
import { Feather } from 'lucide-react';
import { useLite } from '@/lib/liteMode';
import { useLanguage } from '@/context/LanguageContext';

const W: Record<string, { label: string; hint: string; auto: string; on: string; off: string }> = {
  en: {
    label: 'Save data',
    hint: 'Photos show only when you open an item.',
    auto: "On by itself: a slow line, or your phone's Data saver is on.",
    on: 'ON', off: 'OFF',
  },
  fr: {
    label: '\u00c9conomiser les donn\u00e9es',
    hint: "Les photos s'affichent seulement quand vous ouvrez une annonce.",
    auto: 'Activ\u00e9 tout seul : connexion lente, ou \u00e9conomiseur de donn\u00e9es du t\u00e9l\u00e9phone activ\u00e9.',
    on: 'OUI', off: 'NON',
  },
  pidgin: {
    label: 'Save data',
    hint: 'Photo go show only when you open one item.',
    auto: 'E on by imself: network slow, or your phone Data saver dey on.',
    on: 'ON', off: 'OFF',
  },
  ar: {
    label: '\u062a\u0648\u0641\u064a\u0631 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a',
    hint: '\u062a\u0638\u0647\u0631 \u0627\u0644\u0635\u0648\u0631 \u0641\u0642\u0637 \u0639\u0646\u062f \u0641\u062a\u062d \u0625\u0639\u0644\u0627\u0646.',
    auto: '\u0645\u064f\u0641\u0639\u0651\u0644 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627: \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0637\u064a\u0621\u060c \u0623\u0648 \u0645\u0648\u0641\u0651\u0631 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0641\u064a \u0647\u0627\u062a\u0641\u0643 \u0645\u064f\u0641\u0639\u0651\u0644.',
    on: '\u062a\u0634\u063a\u064a\u0644', off: '\u0625\u064a\u0642\u0627\u0641',
  },
  ff: {
    label: 'Hisnu data',
    hint: 'Foto \u0257i njiyetee tan so a uddit huunde.',
    auto: 'Huu\u0253ii e hoore mum: ce\u014bol ina leeli, walla "Hisnu data" telefon maa huu\u0253ii.',
    on: 'ON', off: 'OFF',
  },
};

export function LiteToggle() {
  const { lite, choice, setChoice } = useLite();
  const { language } = useLanguage();
  const w = W[language] || W.en;
  const autoOn = choice === 'auto' && lite;
  return (
    <button
      type="button"
      onClick={() => setChoice(lite ? 'off' : 'on')}
      data-lite-toggle={lite ? 'on' : 'off'}
      aria-pressed={lite}
      className="text-left flex items-center gap-3 hover:bg-teal-700 active:bg-teal-800 px-4 py-3 rounded transition-colors font-medium"
      style={{ touchAction: 'auto', minHeight: '48px' }}
    >
      <Feather className="w-4 h-4 shrink-0" />
      <span className="flex-1 min-w-0">
        <span className="block">{w.label}</span>
        <span className="block text-xs font-normal text-teal-100" data-lite-hint="1">{autoOn ? w.auto : w.hint}</span>
      </span>
      <span
        className={'shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ' +
          (lite ? 'bg-emerald-400 text-emerald-950' : 'bg-white/20 text-white')}
      >
        {lite ? w.on : w.off}
      </span>
    </button>
  );
}

export default LiteToggle;
// BAMBEH_END_TOKEN__LITETOGGLE_FIX961__COMPLETE
