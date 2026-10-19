// BAMBEH_DEPLOY_TOKEN__CORPORATEREGISTER_FIX834_CLEAN
/**
 * CorporateRegister.tsx - FIX834 (was FIX119)
 * FILE LOCATION: src/features/corporate/CorporateRegister.tsx
 * ROUTE: /corporate/register  (AuthGate require="user")
 *
 * "Register your Enterprise", for real. Big, 18 Oct 2026: "let registered corporate bodies be sent to admin section
 * for treatment and prompt upload".
 *   Step 1 the company and the person who represents it   Step 2 RCCM / NIU numbers and the DOCUMENTS themselves
 *   (a photo or a PDF each - before, only a web link could be given)   Step 3 how it sells.
 * Sent with bambeh_corp_register (FIX832): checked again by the database, saved "waiting for Bambeh's check", Bambeh
 * staff told (Command Center > Businesses). The documents then go to the business's private folder. The page says
 * plainly what happens next, and a business that already exists is sent to its dashboard instead of a second form.
 * No phone number or email in the name, address or description (buyers reach the business in the Bambeh chat); the
 * representative's phone is for Bambeh only. Five languages, right-to-left for Arabic.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, ArrowRight, Building2, CheckCircle2, FileText, Loader2, Lock, ShieldCheck, Upload, X, XCircle,
} from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';
import { scanFields } from '@/lib/contactGuard';
import { corpStrings, type CorpAudience, type CorpCategory } from './lib';
import CorporateLogo from './CorporateLogo';
import {
  docLabel, failText, fetchMyBusinesses, registerBusiness, reviewStrings, uploadBusinessDoc, type DocKind, type RegisterForm,
} from './corpReview';

const PICK: DocKind[] = ['rccm', 'niu', 'licence'];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

type Phase = 'checking' | 'form' | 'sending' | 'docs' | 'done' | 'already';
interface DocResult { kind: DocKind; ok: boolean; why?: string }

function sizeText(n: number): string {
  return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
}

export default function CorporateRegister() {
  const navigate = useNavigate();
  const lang = useLang() as string;
  const { s, isRtl } = corpStrings(lang);
  const { r } = reviewStrings(lang);

  const [phase, setPhase] = useState<Phase>('checking');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [results, setResults] = useState<DocResult[]>([]);

  const [registeredName, setRegisteredName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [category, setCategory] = useState<CorpCategory>('shopping');
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [rccm, setRccm] = useState('');
  const [niu, setNiu] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [audience, setAudience] = useState<CorpAudience>('b2c');
  const [moq, setMoq] = useState('');
  const [minValue, setMinValue] = useState('');
  const [priceMode, setPriceMode] = useState<'ttc' | 'ht'>('ttc');
  const [files, setFiles] = useState<Partial<Record<DocKind, File>>>({});
  const pickers = useRef<Partial<Record<DocKind, HTMLInputElement | null>>>({});

  // one business per member: if there is one already, its dashboard is the place to go
  useEffect(() => {
    let alive = true;
    void fetchMyBusinesses().then((res) => {
      if (!alive) return;
      if (res.ok && res.stores.some((b) => b.status === 'pending' || b.status === 'active' || b.status === 'suspended')) setPhase('already');
      else setPhase('form');
    });
    return () => { alive = false; };
  }, []);

  const phoneDigits = repPhone.replace(/[^\d]/g, '').length;

  const checkStep = (n: number): string => {
    if (n === 1) {
      if (registeredName.trim().length < 2) return r.r_bad_name;
      if (repName.trim().length < 2) return r.r_bad_rep;
      if (repEmail.trim() && !EMAIL_RX.test(repEmail.trim())) return r.r_bad_email;
      if (phoneDigits < 8 || phoneDigits > 15) return r.r_bad_phone;
      if (!scanFields(registeredName, tradingName).clean) return r.r_contact_in_text;
    }
    if (n === 2) {
      if (!scanFields(city, address).clean) return r.r_contact_in_text;
    }
    if (n === 3) {
      if (!scanFields(about, moq).clean) return r.r_contact_in_text;
      if (about.length > 1000) return r.r_too_long;
    }
    return '';
  };

  const goNext = () => {
    const why = checkStep(step);
    if (why) { setError(why); return; }
    setError('');
    setStep(step + 1);
    try { window.scrollTo({ top: 0 }); } catch { /* old browser */ }
  };

  const pick = (kind: DocKind, f: File | undefined) => {
    if (!f) return;
    const t = String(f.type || '').toLowerCase();
    if (!(t.startsWith('image/') || t === 'application/pdf' || /\.pdf$/i.test(f.name || ''))) { setError(r.r_bad_type); return; }
    if (f.size > 25 * 1024 * 1024) { setError(r.r_too_big); return; }   // photos are made smaller before they leave the phone
    setError('');
    setFiles((x) => ({ ...x, [kind]: f }));
  };

  const submit = async () => {
    for (const n of [1, 2, 3]) {
      const why = checkStep(n);
      if (why) { setError(why); setStep(n); return; }
    }
    setError('');
    setPhase('sending');
    const form: RegisterForm = {
      registered_name: registeredName.trim(), trading_name: tradingName.trim(), category, rep_name: repName.trim(),
      rep_email: repEmail.trim(), rep_phone: repPhone.trim(), rccm_number: rccm.trim(), niu_number: niu.trim(), city: city.trim(),
      address: address.trim(), about: about.trim(), audience, moq_text: audience === 'b2c' ? '' : moq.trim(),
      min_order_value_xaf: audience === 'b2c' ? '' : minValue, price_mode: priceMode,
    };
    const res = await registerBusiness(form);
    if (!res.ok) {
      if (res.reason === 'already') { setPhase('already'); return; }
      setError(failText(r, res));
      setPhase('form');
      return;
    }
    const kinds = PICK.filter((k) => files[k]);
    if (kinds.length) {
      setPhase('docs');
      const out: DocResult[] = [];
      for (const k of kinds) {
        const u = await uploadBusinessDoc(res.id, k, files[k] as File);
        out.push(u.ok ? { kind: k, ok: true } : { kind: k, ok: false, why: failText(r, u) });
        setResults([...out]);
      }
    }
    setPhase('done');
    try { window.scrollTo({ top: 0 }); } catch { /* old browser */ }
  };

  const wrap = (children: ReactNode) => (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'} data-fix="FIX834">{children}</div>
  );

  if (phase === 'checking') {
    return wrap(<div className="flex min-h-[60vh] items-center justify-center text-slate-500"><Loader2 className="h-7 w-7 animate-spin" /></div>);
  }

  if (phase === 'already') {
    return wrap(
      <div className="flex min-h-[70vh] items-center justify-center p-6" data-already="1">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-md">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <p className="mb-6 text-sm text-gray-600">{r.already}</p>
          <button onClick={() => navigate('/corporate/dashboard')} className="w-full rounded-xl bg-slate-800 py-3 font-semibold text-white">{r.openDash}</button>
        </div>
      </div>,
    );
  }

  if (phase === 'done') {
    const sent = results.filter((x) => x.ok).length;
    return wrap(
      <div className="mx-auto max-w-md p-6" data-done="1">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-emerald-500" />
          <h2 className="mb-1 text-center text-lg font-bold text-gray-900">{r.doneTitle}</h2>
          <p className="mb-4 text-center text-sm text-gray-500">{tradingName.trim() || registeredName.trim()}</p>
          {results.length ? (
            <div className="mb-4 space-y-2" data-doc-results="1">
              <p className="text-xs font-semibold text-gray-500">{sent}/{results.length} {r.doneDocs}</p>
              {results.map((x) => (
                <div key={x.kind} className={'flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ' + (x.ok ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-red-100 bg-red-50 text-red-700')}
                     data-doc-result={x.kind} data-ok={x.ok ? '1' : '0'}>
                  {x.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{docLabel(r, x.kind)}{x.ok ? '' : ' - ' + r.docFailed + (x.why ? ' (' + x.why + ')' : '')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">{r.docsLater}</p>
          )}
          <div className="mb-5 rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-sm font-bold text-slate-800">{r.nextSteps}</p>
            <ol className="list-decimal space-y-1 ps-5 text-sm text-slate-600">
              <li>{r.next1}</li><li>{r.next2}</li><li>{r.next3}</li>
            </ol>
          </div>
          <button onClick={() => navigate('/corporate/dashboard')} className="w-full rounded-xl bg-slate-800 py-3 font-semibold text-white" data-open-dash="1">{r.openDash}</button>
        </div>
      </div>,
    );
  }

  const busy = phase === 'sending' || phase === 'docs';
  const field = (label: string, node: ReactNode, note?: string) => (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      {node}
      {note ? <p className="mt-1 flex items-start gap-1 text-xs text-gray-500"><Lock className="mt-0.5 h-3 w-3 shrink-0" />{note}</p> : null}
    </div>
  );
  const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300';

  return wrap(
    <>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pb-6 pt-5 text-white">
        <div className="mb-3"><CorporateLogo /></div>
        <button onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))} className="mb-2 flex items-center gap-1 text-sm text-slate-300" disabled={busy}>
          <ArrowLeft className={'h-4 w-4 ' + (isRtl ? 'rotate-180' : '')} /> {s.prevBtn}
        </button>
        <h1 className="flex items-center gap-2 text-xl font-bold"><Building2 className="h-6 w-6 text-amber-400" /> {s.regTitle}</h1>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((n) => <div key={n} className={'h-1.5 flex-1 rounded-full ' + (n <= step ? 'bg-amber-400' : 'bg-white/20')} />)}
        </div>
        <p className="mt-2 text-xs text-slate-300" data-step={step}>{s.step} {step}/3 - {step === 1 ? s.s1 : step === 2 ? s.s2 : s.s3}</p>
      </div>

      <div className="mt-4 space-y-4 px-4">
        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-error="1">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-4 rounded-2xl border bg-white p-4">
          {step === 1 && (
            <>
              {field(s.fRegName + ' *', <input value={registeredName} onChange={(e) => setRegisteredName(e.target.value.slice(0, 120))} className={inputCls} data-f="registered_name" />)}
              {field(s.fTradeName, <input value={tradingName} onChange={(e) => setTradingName(e.target.value.slice(0, 120))} className={inputCls} data-f="trading_name" />)}
              {field(s.fCategory, (
                <select value={category} onChange={(e) => setCategory(e.target.value as CorpCategory)} className={inputCls} data-f="category">
                  <option value="shopping">{s.catShopping}</option>
                  <option value="services">{s.catServices}</option>
                  <option value="infrastructure">{s.catInfra}</option>
                </select>
              ))}
              {field(s.fRepName + ' *', <input value={repName} onChange={(e) => setRepName(e.target.value.slice(0, 80))} className={inputCls} data-f="rep_name" />)}
              {field(s.fRepEmail, <input type="email" value={repEmail} onChange={(e) => setRepEmail(e.target.value.slice(0, 120))} placeholder="info@company.cm" className={inputCls} data-f="rep_email" />, r.phoneNote)}
              {field(s.fRepPhone + ' *', <input type="tel" inputMode="tel" value={repPhone} onChange={(e) => setRepPhone(e.target.value.slice(0, 24))} placeholder="+237 6XX XX XX XX" className={inputCls} dir="ltr" data-f="rep_phone" />, r.phoneNote)}
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                <p className="text-xs text-slate-600">{s.verifyBanner}</p>
              </div>
              {field(s.fRccm, <input value={rccm} onChange={(e) => setRccm(e.target.value.slice(0, 40))} placeholder="RC/YAE/2024/B/..." className={inputCls} dir="ltr" data-f="rccm_number" />)}
              {field(s.fNiu, <input value={niu} onChange={(e) => setNiu(e.target.value.slice(0, 30))} placeholder="M0..." className={inputCls} dir="ltr" data-f="niu_number" />)}

              <div data-docs="1">
                <p className="text-sm font-semibold text-gray-700">{r.docsStep}</p>
                <p className="mb-2 mt-0.5 flex items-start gap-1 text-xs text-gray-500"><Lock className="mt-0.5 h-3 w-3 shrink-0" />{r.docsStepNote}</p>
                <div className="space-y-2">
                  {PICK.map((k) => {
                    const f = files[k];
                    return (
                      <div key={k} className={'flex items-center gap-3 rounded-xl border p-3 ' + (f ? 'border-emerald-200 bg-emerald-50/60' : 'border-dashed border-gray-300')} data-doc-pick={k}>
                        <FileText className={'h-5 w-5 shrink-0 ' + (f ? 'text-emerald-600' : 'text-gray-400')} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800">{docLabel(r, k)}</p>
                          <p className="truncate text-xs text-gray-500" data-doc-name={k}>{f ? r.chosen + ': ' + f.name + ' (' + sizeText(f.size) + ')' : r.none}</p>
                        </div>
                        {f ? (
                          <button type="button" onClick={() => setFiles((x) => { const y = { ...x }; delete y[k]; return y; })} className="rounded-full p-1 text-gray-400 hover:bg-gray-100" aria-label={r.remove} data-doc-clear={k}>
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}
                        <button type="button" onClick={() => pickers.current[k]?.click()} className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white" data-doc-choose={k}>
                          <Upload className="h-3.5 w-3.5" /> {f ? r.change : r.upload}
                        </button>
                        <input ref={(el) => { pickers.current[k] = el; }} type="file" accept="image/*,application/pdf" className="hidden" data-doc-input={k}
                               onChange={(e) => { pick(k, e.target.files ? e.target.files[0] : undefined); e.target.value = ''; }} />
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">{r.docsLater}</p>
              </div>

              {field(s.fCity, <input value={city} onChange={(e) => setCity(e.target.value.slice(0, 60))} className={inputCls} data-f="city" />)}
              {field(s.fAddress, <input value={address} onChange={(e) => setAddress(e.target.value.slice(0, 160))} className={inputCls} data-f="address" />)}
            </>
          )}

          {step === 3 && (
            <>
              {field(s.fAbout, <textarea rows={3} value={about} onChange={(e) => setAbout(e.target.value.slice(0, 1000))} className={inputCls} data-f="about" />)}
              {field(s.fAudience, (
                <div className="grid grid-cols-3 gap-2">
                  {(['b2c', 'b2b', 'hybrid'] as CorpAudience[]).map((a) => (
                    <button key={a} type="button" onClick={() => setAudience(a)} data-audience={a}
                            className={'rounded-xl border py-2 text-xs font-semibold ' + (audience === a ? 'border-slate-800 bg-slate-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-600')}>
                      {a === 'b2c' ? s.audB2c : a === 'b2b' ? s.audB2b : s.audHybrid}
                    </button>
                  ))}
                </div>
              ))}
              {audience !== 'b2c' && (
                <>
                  {field(s.fMoq, <input value={moq} onChange={(e) => setMoq(e.target.value.slice(0, 60))} className={inputCls} data-f="moq_text" />)}
                  {field(s.fMinValue, <input inputMode="numeric" value={minValue} onChange={(e) => setMinValue(e.target.value.replace(/[^\d ]/g, '').slice(0, 14))} className={inputCls} data-f="min_order_value_xaf" />)}
                </>
              )}
              {field(s.fPriceMode, (
                <div className="grid grid-cols-2 gap-2">
                  {(['ttc', 'ht'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setPriceMode(m)} data-price={m}
                            className={'rounded-xl border py-2 text-xs font-semibold ' + (priceMode === m ? 'border-slate-800 bg-slate-800 text-white' : 'border-gray-200 bg-gray-50 text-gray-600')}>
                      {m === 'ttc' ? s.ttc : s.ht}
                    </button>
                  ))}
                </div>
              ))}
              <div className="rounded-xl bg-slate-50 p-3" data-next-steps="1">
                <p className="mb-2 text-sm font-bold text-slate-800">{r.nextSteps}</p>
                <ol className="list-decimal space-y-1 ps-5 text-xs text-slate-600">
                  <li>{r.next1}</li><li>{r.next2}</li><li>{r.next3}</li>
                </ol>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {step > 1 ? (
            <button onClick={() => { setError(''); setStep(step - 1); }} disabled={busy} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600">
              {s.prevBtn}
            </button>
          ) : null}
          {step < 3 ? (
            <button onClick={goNext} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white" data-next="1">
              {s.next} <ArrowRight className={'h-4 w-4 ' + (isRtl ? 'rotate-180' : '')} />
            </button>
          ) : (
            <button onClick={() => { void submit(); }} disabled={busy} data-submit="1"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-900 disabled:opacity-60">
              {busy ? (<><Loader2 className="h-4 w-4 animate-spin" /> {phase === 'docs' ? r.sendingDocs : r.sending}</>) : s.submit}
            </button>
          )}
        </div>
      </div>
    </>,
  );
}
// BAMBEH_END_TOKEN__CORPORATEREGISTER_FIX834__COMPLETE
