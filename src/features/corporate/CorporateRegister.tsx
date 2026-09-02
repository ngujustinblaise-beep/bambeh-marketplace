// BAMBEH_DEPLOY_TOKEN__CORPORATEREGISTER_FIX119_CLEAN
/**
 * CorporateRegister.tsx — Bambeh Corporate onboarding (FIX119)
 * FILE LOCATION: src/features/corporate/CorporateRegister.tsx
 * ROUTE: /corporate/register  (AuthGate require="user")
 *
 * The real 3-step onboarding from the build guide. On submit it INSERTS a row
 * into `corporate_stores` (status 'pending') — the trigger auto-adds the owner
 * as a member — then routes to the dashboard. No mock data.
 *   Step 1 Basic Profile  · Step 2 Legal Verification · Step 3 Business Setup
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, ArrowRight, Loader2, CheckCircle2, ShieldCheck, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';
import { corpStrings, slugify, type CorpCategory, type CorpAudience } from './lib';

export default function CorporateRegister() {
  const navigate = useNavigate();
  const { s, isRtl } = corpStrings(useLang() as string);

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [registeredName, setRegisteredName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [category, setCategory] = useState<CorpCategory>('shopping');
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [rccm, setRccm] = useState('');
  const [niu, setNiu] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [audience, setAudience] = useState<CorpAudience>('b2c');
  const [moq, setMoq] = useState('');
  const [minValue, setMinValue] = useState('');
  const [priceMode, setPriceMode] = useState<'ttc' | 'ht'>('ttc');

  const canNext1 = registeredName.trim() && repName.trim() && repPhone.trim();
  const canSubmit = registeredName.trim() && repPhone.trim();

  const submit = async () => {
    setError('');
    if (!canSubmit) { setError(s.reqField); return; }
    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth?.session?.user?.id;
      if (!uid) { setError(s.needLogin); setBusy(false); return; }

      const { data, error: insErr } = await supabase
        .from('corporate_stores')
        .insert({
          owner_id: uid,
          registered_name: registeredName.trim(),
          trading_name: tradingName.trim() || null,
          slug: slugify(tradingName.trim() || registeredName.trim()),
          category,
          rep_name: repName.trim() || null,
          rep_email: repEmail.trim() || null,
          rep_phone: repPhone.trim() || null,
          rccm_number: rccm.trim() || null,
          niu_number: niu.trim() || null,
          document_url: docUrl.trim() || null,
          city: city.trim() || null,
          address: address.trim() || null,
          about: about.trim() || null,
          audience,
          moq_text: moq.trim() || null,
          min_order_value_xaf: minValue ? Number(minValue.replace(/[^\d]/g, '')) : null,
          price_mode: priceMode,
          status: 'pending',
          verified: false,
        })
        .select('id')
        .single();

      if (insErr) throw insErr;
      // membership is auto-created by the DB trigger (corp_add_owner_member)
      setDone(true);
      void data;
    } catch (e) {
      console.error('[CorporateRegister] submit failed:', e);
      setError((e as { message?: string })?.message || s.reqField);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-sm w-full">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">{s.corporate}</h2>
          <p className="text-sm text-gray-500 mb-6">{s.regDone}</p>
          <button
            onClick={() => navigate('/corporate/dashboard')}
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold"
          >
            {s.myStore}
          </button>
        </div>
      </div>
    );
  }

  const field = (label: string, node: React.ReactNode) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {node}
    </div>
  );
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300';

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-5 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-300 text-sm mb-2">
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} /> {s.prevBtn}
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-amber-400" /> {s.regTitle}</h1>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`flex-1 h-1.5 rounded-full ${n <= step ? 'bg-amber-400' : 'bg-white/20'}`} />
          ))}
        </div>
        <p className="text-slate-300 text-xs mt-2">
          {s.step} {step}/3 · {step === 1 ? s.s1 : step === 2 ? s.s2 : s.s3}
        </p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{error}</span>
          </div>
        ) : null}

        <div className="bg-white rounded-2xl border p-4 space-y-4">
          {step === 1 && (
            <>
              {field(s.fRegName + ' *', <input value={registeredName} onChange={(e) => setRegisteredName(e.target.value)} className={inputCls} />)}
              {field(s.fTradeName, <input value={tradingName} onChange={(e) => setTradingName(e.target.value)} className={inputCls} />)}
              {field(s.fCategory, (
                <select value={category} onChange={(e) => setCategory(e.target.value as CorpCategory)} className={inputCls}>
                  <option value="shopping">{s.catShopping}</option>
                  <option value="services">{s.catServices}</option>
                  <option value="infrastructure">{s.catInfra}</option>
                </select>
              ))}
              {field(s.fRepName + ' *', <input value={repName} onChange={(e) => setRepName(e.target.value)} className={inputCls} />)}
              {field(s.fRepEmail, <input type="email" value={repEmail} onChange={(e) => setRepEmail(e.target.value)} placeholder="info@company.cm" className={inputCls} />)}
              {field(s.fRepPhone + ' *', <input type="tel" value={repPhone} onChange={(e) => setRepPhone(e.target.value)} placeholder="+237…" className={inputCls} />)}
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600">{s.verifyBanner}</p>
              </div>
              {field(s.fRccm, <input value={rccm} onChange={(e) => setRccm(e.target.value)} placeholder="RC/YAE/2024/B/…" className={inputCls} />)}
              {field(s.fNiu, <input value={niu} onChange={(e) => setNiu(e.target.value)} placeholder="M0…" className={inputCls} />)}
              {field(s.fDoc, <input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://…" className={inputCls} />)}
              {field(s.fCity, <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />)}
              {field(s.fAddress, <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />)}
            </>
          )}

          {step === 3 && (
            <>
              {field(s.fAbout, <textarea rows={3} value={about} onChange={(e) => setAbout(e.target.value)} className={inputCls} />)}
              {field(s.fAudience, (
                <div className="grid grid-cols-3 gap-2">
                  {(['b2c', 'b2b', 'hybrid'] as CorpAudience[]).map((a) => (
                    <button key={a} type="button" onClick={() => setAudience(a)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${audience === a ? 'bg-slate-800 text-white border-slate-800' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {a === 'b2c' ? s.audB2c : a === 'b2b' ? s.audB2b : s.audHybrid}
                    </button>
                  ))}
                </div>
              ))}
              {audience !== 'b2c' && (
                <>
                  {field(s.fMoq, <input value={moq} onChange={(e) => setMoq(e.target.value)} className={inputCls} />)}
                  {field(s.fMinValue, <input type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} className={inputCls} />)}
                </>
              )}
              {field(s.fPriceMode, (
                <div className="grid grid-cols-2 gap-2">
                  {(['ttc', 'ht'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setPriceMode(m)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${priceMode === m ? 'bg-slate-800 text-white border-slate-800' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {m === 'ttc' ? s.ttc : s.ht}
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>

        {/* nav */}
        <div className="flex gap-2">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold">
              {s.prevBtn}
            </button>
          ) : null}
          {step < 3 ? (
            <button
              onClick={() => { if (step === 1 && !canNext1) { setError(s.reqField); return; } setError(''); setStep(step + 1); }}
              className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5"
            >
              {s.next} <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={busy}
              className="flex-1 bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> {s.submitting}</>) : s.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__CORPORATEREGISTER__COMPLETE
