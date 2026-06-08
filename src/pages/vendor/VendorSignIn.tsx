import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowLeft, LogIn, User, Lock, Eye, EyeOff, AlertCircle, Shield, Clock, CheckCircle, Building, Loader2 } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000;

const MASTERS = [
  { username: 'ngu', password: '670757326', privilege: 'basic', fullName: 'Ngu Basic Vendor', phoneNumber: '+237 670757326', businessName: 'Ngu Trading', vendorTier: 'basic' }
];

function doAuth(input: string, pw: string) {
  const lang = useLang();
  const isRtl = lang === "ar";
  const u = input.toLowerCase().trim();
  for (const m of MASTERS) {
    if (m.username === u && m.password === pw) {
      return { ok: true, v: { id: 'vendor_master_' + m.username, username: m.username, fullName: m.fullName, phoneNumber: m.phoneNumber, businessName: m.businessName, privilege: m.privilege, vendorTier: m.vendorTier, isMaster: true, isVendor: true } };
    }
  }
  try {
    const s = localStorage.getItem('Bambeh_vendors');
    if (s) {
      for (const v of JSON.parse(s)) {
        if ((v.phoneNumber?.toLowerCase() === u || v.username?.toLowerCase() === u || v.email?.toLowerCase() === u) && v.password === pw) {
          return { ok: true, v: { id: v.id, username: v.username || v.phoneNumber, fullName: v.fullName || v.businessName, phoneNumber: v.phoneNumber, email: v.email, businessName: v.businessName, privilege: v.privilege || 'basic', vendorTier: v.vendorTier || 'basic', isMaster: false, isVendor: true } };
        }
      }
    }
  } catch (e) { /* skip */ }
  try {
    const s = localStorage.getItem('Bambeh_users');
    if (s) {
      for (const x of JSON.parse(s)) {
        if (x.isVendor && (x.phoneNumber?.toLowerCase() === u || x.username?.toLowerCase() === u) && x.password === pw) {
          return { ok: true, v: { id: x.id, username: x.username || x.phoneNumber, fullName: x.fullName || (x.firstName + ' ' + x.lastName), phoneNumber: x.phoneNumber, businessName: x.businessName || 'My Store', privilege: x.privilege || 'basic', vendorTier: x.vendorTier || 'basic', isMaster: false, isVendor: true } };
        }
      }
    }
  } catch (e) { /* skip */ }
  return { ok: false, v: null };
}

export default function VendorSignIn() {
  const [form, setForm] = useState({ user: '', pass: '' });
  const [showPw, setShowPw] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockEnd, setLockEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    try {
      const d = localStorage.getItem('Bambeh_vendor');
      if (d) {
        const v = JSON.parse(d);
        if (v && v.isLoggedIn) { window.location.href = '/vendor/dashboard'; }
      }
    } catch (e) { /* skip */ }
  }, []);

  useEffect(() => {
    try {
      const l = localStorage.getItem('Bambeh_vendor_login_lockout');
      if (l) {
        const d = JSON.parse(l);
        if (d.endTime > Date.now()) {
          setLockEnd(d.endTime);
          setLocked(true);
          setFails(MAX_ATTEMPTS);
        } else {
          localStorage.removeItem('Bambeh_vendor_login_lockout');
          localStorage.removeItem('Bambeh_vendor_failed_attempts');
        }
      }
      const a = localStorage.getItem('Bambeh_vendor_failed_attempts');
      if (a) {
        const d = JSON.parse(a);
        if (d.timestamp && Date.now() - d.timestamp < LOCKOUT_DURATION) {
          setFails(d.count);
        } else {
          localStorage.removeItem('Bambeh_vendor_failed_attempts');
        }
      }
    } catch (e) { /* skip */ }
  }, []);

  useEffect(() => {
    if (!lockEnd) return;
    const i = setInterval(() => {
      const r = lockEnd - Date.now();
      if (r <= 0) {
        setLocked(false);
        setLockEnd(null);
        setFails(0);
        localStorage.removeItem('Bambeh_vendor_login_lockout');
        localStorage.removeItem('Bambeh_vendor_failed_attempts');
      } else {
        setTimeLeft(Math.ceil(r / 1000));
      }
    }, 1000);
    return () => clearInterval(i);
  }, [lockEnd]);

  const onFail = () => {
    const c = fails + 1;
    setFails(c);
    localStorage.setItem('Bambeh_vendor_failed_attempts', JSON.stringify({ count: c, timestamp: Date.now() }));
    if (c >= MAX_ATTEMPTS) {
      const e = Date.now() + LOCKOUT_DURATION;
      setLockEnd(e);
      setLocked(true);
      localStorage.setItem('Bambeh_vendor_login_lockout', JSON.stringify({ endTime: e }));
      setErrs({ login: 'Too many attempts. Locked 5 min.' });
    } else {
      setErrs({ login: 'Wrong credentials. ' + (MAX_ATTEMPTS - c) + ' left.' });
    }
  };

  const fmtTime = (s: number) => Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    const ne: Record<string, string> = {};
    if (!form.user.trim()) ne.user = 'Required';
    if (!form.pass) ne.pass = 'Required';
    if (Object.keys(ne).length) { setErrs(ne); return; }
    setBusy(true);
    setErrs({});

    const r = doAuth(form.user, form.pass);
    if (r.ok && r.v) {
      localStorage.removeItem('Bambeh_vendor_failed_attempts');
      localStorage.removeItem('Bambeh_vendor_login_lockout');

      const vd = { ...r.v, isLoggedIn: true, loginTimestamp: Date.now() };
      const tk = 'vendor_token_' + Date.now();

      localStorage.setItem('Bambeh_vendor', JSON.stringify(vd));
      localStorage.setItem('Bambeh_current_vendor', JSON.stringify(vd));
      localStorage.setItem('Bambeh_vendor_authenticated', 'true');
      localStorage.setItem('Bambeh_vendor_auth_token', tk);
      localStorage.setItem('Bambeh_user', JSON.stringify(vd));
      localStorage.setItem('Bambeh_current_user', JSON.stringify(vd));
      localStorage.setItem('Bambeh_auth_token', tk);
      localStorage.setItem('Bambeh_is_authenticated', 'true');
      localStorage.setItem('Bambeh_user_privilege', r.v.privilege);
      localStorage.setItem('bambe_current_user', JSON.stringify(vd));
      localStorage.setItem('Bambehvendor', JSON.stringify(vd));
      localStorage.setItem('authToken', tk);

      console.log('%c REBUILT SIGNIN OK! ' + r.v.username + ' -> dashboard', 'background:#10b981;color:white;font-size:16px;padding:6px 12px;border-radius:6px;');

      setOk(true);
      const rd = localStorage.getItem('Bambeh_vendor_redirect') || '/vendor/dashboard';
      localStorage.removeItem('Bambeh_vendor_redirect');
      setTimeout(() => { window.location.href = rd; }, 800);
    } else {
      onFail();
      setBusy(false);
    }
  };

  if (ok) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">Login successful. Redirecting...</p>
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading Dashboard</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Link to="/vendor/portal" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> Back to Vendor Portal
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">Vendor Sign In</h1>
            <p className="text-center text-purple-100 mt-2 flex items-center justify-center gap-2">
              <Building className="w-4 h-4" /> Enterprise Portal
            </p>
          </div>

          {locked && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900 mb-2">Account Locked</h3>
                  <p className="text-sm text-red-700 mb-3">Too many failed attempts.</p>
                  <div className="flex items-center gap-2 bg-red-100 px-4 py-3 rounded-lg">
                    <Clock className="w-5 h-5 text-red-700" />
                    <span className="text-red-900 font-bold">Unlocks in: {fmtTime(timeLeft)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!locked && fails > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-800"><strong>{MAX_ATTEMPTS - fails} attempts left</strong></p>
              </div>
            </div>
          )}

          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username, Email, or Phone</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.user}
                    onChange={e => { setForm(p => ({ ...p, user: e.target.value })); if (errs.user) setErrs(p => ({ ...p, user: '' })); }}
                    disabled={locked}
                    placeholder="Enter username, email, or phone"
                    autoComplete="username"
                    className={'w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 ' + (errs.user ? 'border-red-500' : 'border-gray-300')}
                  />
                </div>
                {errs.user && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errs.user}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.pass}
                    onChange={e => { setForm(p => ({ ...p, pass: e.target.value })); if (errs.pass) setErrs(p => ({ ...p, pass: '' })); }}
                    disabled={locked}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={'w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 ' + (errs.pass ? 'border-red-500' : 'border-gray-300')}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} disabled={locked} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errs.pass && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errs.pass}</p>}
              </div>

              {errs.login && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{errs.login}</p>
                </div>
              )}

              <button type="submit" disabled={busy || locked} className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold text-lg transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {busy ? (<><Loader2 className="w-5 h-5 animate-spin" />Signing In...</>) : locked ? 'Account Locked' : (<><LogIn className="w-5 h-5" />Sign In to Vendor Account</>)}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:underline font-medium">Forgot your password?</Link>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-gray-600">No vendor account?{' '}
              <Link to="/vendor/register" className="text-purple-600 font-semibold hover:underline">Register as Vendor</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-800">
              <p className="font-semibold mb-1">Enterprise Security</p>
              <p>Protected with advanced security. After {MAX_ATTEMPTS} failed attempts, locked for 5 minutes.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/help" className="text-sm text-gray-500 hover:text-gray-700">Need help? Visit our Help Center</Link>
        </div>
      </div>
    </div>
  );
}
