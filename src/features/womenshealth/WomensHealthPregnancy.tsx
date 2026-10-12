// BAMBEH_DEPLOY_TOKEN__WOMENS_HEALTH_PREGNANCY_FIX722_CLEAN
/**
 * src/features/womenshealth/WomensHealthPregnancy.tsx - FIX722 (replaces FIX710, which was never deployed)
 *   route: /womens-health/pregnancy
 *
 * THE PREGNANCY GUIDE - danger signs during pregnancy, when labour has started, antenatal visits
 * (CPN), what the cheque sante covers, getting ready for the birth, danger signs for the mother
 * and the baby after the birth, and the help lines for women who are being hurt.
 *
 * FIX722 (Big, 11 Oct 2026 evening): "guide, emergency numbers readable without an account ...
 * nothing is stored about readers". This page needs NO account. Added: QUICK EXIT (whUi, FIX719),
 * and the guide still opens with no connection - the words are inside the app, and the switch
 * (on / off, which languages, who checked it) is kept on the phone from the last visit.
 *
 * Big, 11 Oct 2026: "Nobody yet: build it switched off". The guide shows to women ONLY after an
 * admin switched it on in the Command Center with the name, role and date of the midwife or
 * doctor who checked it - and only in the languages that were checked (FIX715). A woman whose
 * language was not checked reads a checked language instead, with a line saying so. Staff can
 * read every language before the switch, under a "preview" banner, to prepare the check.
 * The page stores nothing about the reader: no cycle, no due date, no answers.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Baby, ChevronLeft, Info, Loader2, Search, ShieldCheck } from 'lucide-react';
import { GUIDE, LANG_NAMES, WH_LANGS, fmtLongDay, guideLangFor, useWhText, whDir, whReason, wt } from './whText';
import type { GuideSection, WhKey, WhLang } from './whText';
import { getGuide } from './whApi';
import type { WhGuide } from './whApi';
import { QuickExit, loadSwitches, saveSwitches } from './whUi';

const TONE: Record<GuideSection['tone'], { box: string; title: string; dot: string }> = {
  red: { box: 'border-red-200 bg-red-50', title: 'text-red-800', dot: 'bg-red-600' },
  amber: { box: 'border-amber-200 bg-amber-50', title: 'text-amber-900', dot: 'bg-amber-500' },
  teal: { box: 'border-teal-200 bg-teal-50', title: 'text-teal-900', dot: 'bg-teal-600' },
  plain: { box: 'border-gray-100 bg-white', title: 'text-gray-900', dot: 'bg-rose-500' },
};

function GuideBlock({ s }: { s: GuideSection }) {
  const tone = TONE[s.tone];
  return (
    <section data-guide-section={s.id} className={'space-y-2 rounded-2xl border p-4 shadow-sm ' + tone.box}>
      <h2 className={'flex items-start gap-2 font-extrabold leading-snug ' + tone.title}>
        {s.tone === 'red' && <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />}
        <span>{s.title}</span>
      </h2>
      <ul className="space-y-1.5">
        {s.items.map((x) => (
          <li key={x} className="flex items-start gap-2 text-sm text-gray-900">
            <span className={'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ' + tone.dot} />
            <span>{x}</span>
          </li>
        ))}
      </ul>
      {s.note && <p className="text-sm font-bold text-gray-800">{s.note}</p>}
    </section>
  );
}

export default function WomensHealthPregnancy() {
  const { lang, dir, t } = useWhText();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<WhGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<WhLang>(lang);

  useEffect(() => { setPreviewLang(lang); }, [lang]);

  useEffect(() => {
    let live = true;
    void getGuide().then((r) => {
      if (!live) return;
      if (r.ok) {
        setGuide(r);
        saveSwitches(r);
        return;
      }
      const saved = r.reason === 'network' ? loadSwitches() : null;
      if (saved) {
        setGuide({ ...saved.v, langs: saved.v.langs as WhGuide['langs'], quiz_langs: saved.v.quiz_langs as WhGuide['quiz_langs'],
                   signed_in: false, is_staff: false });
      } else setError(whReason(lang, r.reason));
    });
    return () => { live = false; };
  }, [lang]);

  const findMaternity = () => navigate('/womens-health?service=maternity');

  if (!guide && !error) {
    return <div className="flex justify-center py-16 text-gray-400" dir={dir}><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const back = (
    <button type="button" onClick={() => navigate('/womens-health')} className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100">
      <ChevronLeft className="h-4 w-4 rtl:rotate-180" />{t('title')}
    </button>
  );

  // what this reader may see
  const pick = guide && guide.on ? guideLangFor(lang, guide.langs) : { show: null, fallback: false };
  const preview = !!guide && guide.is_staff && (!guide.on || pick.show === null || pick.fallback);
  const showLang: WhLang | null = preview ? previewLang : pick.show;

  if (error || !guide || showLang === null) {
    return (
      <div dir={dir} data-fix="FIX722" className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-28">
        {back}
        <div className="space-y-3 rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-sm" data-guide-off="1">
          <Baby className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="text-xl font-extrabold text-gray-900">{t('guideTitle')}</h1>
          <p className="text-sm text-gray-700">{error || t('guideOff')}</p>
          <button type="button" onClick={findMaternity} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white">
            <Search className="h-4 w-4" />{t('findMaternity')}
          </button>
        </div>
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{t('emergency')}</p>
        <QuickExit t={t} />
      </div>
    );
  }

  const g = (key: WhKey, vars?: Record<string, string | number>) => wt(showLang, key, vars);
  const gDir = whDir(showLang);
  return (
    <div dir={gDir} lang={showLang === 'pidgin' ? 'pcm' : showLang} data-fix="FIX722" data-guide-lang={showLang} className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-28">
      {back}
      {preview && (
        <div className="space-y-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" data-guide-preview="1" dir={dir}>
          <p className="font-extrabold">{t('staffPreview')}</p>
          <div className="flex flex-wrap gap-1.5">
            {WH_LANGS.map((l) => (
              <button key={l} type="button" onClick={() => setPreviewLang(l)} aria-pressed={previewLang === l}
                      className={'rounded-full px-3 py-1 text-xs font-bold ' + (previewLang === l ? 'bg-amber-600 text-white' : 'border border-amber-300 bg-white text-amber-900')}>
                {LANG_NAMES[l]}{guide.on && guide.langs.indexOf(l) >= 0 ? ' \u2713' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <header className="rounded-3xl bg-gradient-to-br from-rose-600 to-pink-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20"><Baby className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight">{g('guideTitle')}</h1>
            <p className="text-sm text-rose-50">{g('guideIntro')}</p>
          </div>
        </div>
        {guide.on && guide.reviewer_name && !preview && (
          <p className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-rose-50" data-checked-by="1">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            {g('checkedBy', { name: guide.reviewer_name, role: guide.reviewer_role || '', date: fmtLongDay(guide.reviewed_on || '', showLang) })}
          </p>
        )}
      </header>

      {!preview && pick.fallback && (
        <p className="flex items-start gap-2 rounded-2xl bg-gray-100 p-3 text-sm text-gray-700" data-fallback="1" dir={dir}>
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />{t('notYourLang', { lang: LANG_NAMES[lang], other: LANG_NAMES[showLang] })}
        </p>
      )}

      {GUIDE[showLang].map((s) => <GuideBlock key={s.id} s={s} />)}

      <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">{g('guideFoot')} {g('freeLine')}</p>
      <button type="button" onClick={findMaternity} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-base font-extrabold text-white shadow">
        <Search className="h-5 w-5" />{g('findMaternity')}
      </button>
      <QuickExit t={t} />
    </div>
  );
}
// BAMBEH_END_TOKEN__WOMENS_HEALTH_PREGNANCY_FIX722__COMPLETE
