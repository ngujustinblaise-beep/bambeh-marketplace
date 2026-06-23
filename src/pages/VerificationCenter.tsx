/**
 * src/pages/VerificationCenter.tsx — Bambeh Marketplace
 * FIXED: Saves verification requests to Supabase verification_requests table.
 * Was only calling alert() — no data was being saved anywhere.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Mail, Phone, CreditCard, Building2,
  CheckCircle, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang, t } from "@/hooks/useAppLang";

type Level = 'email' | 'phone' | 'id' | 'business';

const LEVELS = [
  { id:'email' as Level,    title:'Email Verification',        icon:Mail,        badge:'Bronze', color:'bg-amber-50 border-amber-200',   desc:'Verify your email address to unlock basic features.' },
  { id:'phone' as Level,    title:'Phone Verification',        icon:Phone,       badge:'Silver', color:'bg-gray-50 border-gray-200',     desc:'Verify your phone number for account security.' },
  { id:'id' as Level,       title:'ID & Address Verification', icon:CreditCard,  badge:'Gold',   color:'bg-yellow-50 border-yellow-200', desc:'Verify your identity to become a trusted seller.' },
  { id:'business' as Level, title:'Business Verification',     icon:Building2,   badge:'Platinum',color:'bg-blue-50 border-blue-200',   desc:'Verify your business for maximum trust and features.' },
];

interface RequestStatus {
  level:  string;
  status: string;
}

export default function VerificationCenter() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();

  const [userId,         setUserId]         = useState<string | null>(null);
  const [submitted,      setSubmitted]      = useState<string[]>([]);
  const [existingReqs,   setExistingReqs]   = useState<RequestStatus[]>([]);
  const [activeLevel,    setActiveLevel]    = useState<Level | null>(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [successMsg,     setSuccessMsg]     = useState<string | null>(null);

  // Form fields
  const [idType,         setIdType]         = useState('national_id');
  const [idNumber,       setIdNumber]       = useState('');
  const [region,         setRegion]         = useState('');
  const [businessName,   setBusinessName]   = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      setUserId(session.user.id);

      // Load existing verification requests
      const { data } = await supabase
        .from('verification_requests')
        .select('level, status')
        .eq('user_id', session.user.id);

      if (data) {
        setExistingReqs(data);
        setSubmitted(data.map(d => d.level));
      }
    })();
  }, []);

  async function submitRequest(level: Level) {
    if (!userId) { navigate('/login'); return; }
    setSubmitting(true);
    setError(null);

    try {
      // Check if already submitted
      const existing = existingReqs.find(r => r.level === level);
      if (existing) {
        setError(`You have already submitted a ${level} verification request (status: ${existing.status}).`);
        setSubmitting(false);
        return;
      }

      const requestData: any = {
        user_id: userId,   // UUID — not text
        level,
        status: 'pending',
      };

      // Add level-specific fields
      if (level === 'id') {
        if (!idNumber.trim()) { setError('Please enter your ID number.'); setSubmitting(false); return; }
        requestData.id_type   = idType;
        requestData.id_number = idNumber.trim();
        requestData.region    = region.trim();
      }
      if (level === 'business') {
        if (!businessName.trim()) { setError('Please enter your business name.'); setSubmitting(false); return; }
        requestData.business_name = businessName.trim();
      }

      const { error: insertErr } = await supabase
        .from('verification_requests')
        .insert(requestData);

      if (insertErr) throw insertErr;

      setSubmitted(prev => [...prev, level]);
      setExistingReqs(prev => [...prev, { level, status: 'pending' }]);
      setSuccessMsg(`${level.charAt(0).toUpperCase() + level.slice(1)} verification request submitted! We'll review within 24-48 hours.`);
      setActiveLevel(null);
    } catch (e: any) {
      setError(e.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusBadge(level: string) {
    const req = existingReqs.find(r => r.level === level);
    if (!req) return null;
    const colors: Record<string, string> = {
      pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${colors[req.status] || colors.pending}`}>
        {req.status}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" /> Verification Center
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Get Verified</h2>
              <p className="text-blue-100 text-sm">Build trust with buyers and sellers</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm">
            Verified sellers get more views, higher trust scores, and unlock premium listing features.
          </p>
        </div>

        {/* Status messages */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification levels */}
        {LEVELS.map(level => {
          const Icon      = level.icon;
          const isSubmitted = submitted.includes(level.id);
          const isActive  = activeLevel === level.id;

          return (
            <div key={level.id} className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
              isActive ? 'border-blue-400 shadow-md' : 'border-gray-200'
            }`}>
              {/* Level header */}
              <button
                onClick={() => !isSubmitted && setActiveLevel(isActive ? null : level.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                <div className={`p-2.5 rounded-xl border ${level.color}`}>
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{level.title}</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-semibold">{level.badge}</span>
                    {getStatusBadge(level.id)}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{level.desc}</p>
                </div>
                {isSubmitted
                  ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  : <span className="text-gray-400 text-lg flex-shrink-0">{isActive ? '▲' : '▶'}</span>
                }
              </button>

              {/* Expanded form */}
              {isActive && !isSubmitted && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  {level.id === 'email' && (
                    <p className="text-sm text-gray-600">
                      A verification link will be sent to your registered email address. Click "Submit" to send the email.
                    </p>
                  )}
                  {level.id === 'phone' && (
                    <p className="text-sm text-gray-600">
                      An OTP will be sent to your registered phone number (+237). Click "Submit" to send the code.
                    </p>
                  )}
                  {level.id === 'id' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ID Type</label>
                        <select value={idType} onChange={e => setIdType(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="national_id">National ID (CNI)</option>
                          <option value="passport">Passport</option>
                          <option value="driver_license">Driver's Licence</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ID Number *</label>
                        <input value={idNumber} onChange={e => setIdNumber(e.target.value)}
                          placeholder="e.g. CM123456789"
                          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Region</label>
                        <input value={region} onChange={e => setRegion(e.target.value)}
                          placeholder="e.g. Centre, Littoral"
                          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <p className="text-xs text-gray-400">
                        📷 Document uploads will be added in a future update. Submit now to be placed in the queue.
                      </p>
                    </>
                  )}
                  {level.id === 'business' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Business Name *</label>
                        <input value={businessName} onChange={e => setBusinessName(e.target.value)}
                          placeholder="e.g. Bambeh Tech SARL"
                          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <p className="text-xs text-gray-400">
                        📄 Business registration documents upload coming soon. Submit now to be placed in the review queue.
                      </p>
                    </>
                  )}

                  <button
                    onClick={() => submitRequest(level.id)}
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                      : 'Submit Verification Request'
                    }
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Info */}
        <div className="bg-white rounded-2xl p-4 border text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800">⏱ Review Times</p>
          <p>• Email & Phone: Instant</p>
          <p>• ID & Address: 24-48 hours</p>
          <p>• Business: 2-5 business days</p>
        </div>
      </div>
    </div>
  );
}






