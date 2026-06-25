// FILE: src/components/common/SubscriptionGateModal.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, Zap, Lock } from 'lucide-react';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: { title: 'Unlock This Feature', sub: 'Subscribe and let us take the load from here.', body: 'This feature is available to subscribed members. Join Bambeh today — all for as little as 100 XAF.', cta: 'View Subscription Plans', cancel: 'Maybe Later' },
  fr: { title: 'Débloquez cette fonctionnalité', sub: 'Abonnez-vous et laissez-nous gérer le reste.', body: 'Rejoignez Bambeh — dès 100 XAF.', cta: 'Voir les forfaits', cancel: 'Peut-être plus tard' },
  ha: { title: 'Bu?e wannan fasalin', sub: 'Yi rajista mana mu ?auki nauyi daga nan.', body: 'Ku shiga Bambeh yau.', cta: 'Duba Tsare-tsare', cancel: 'Wata?ila daga baya' },
  ar: { title: '?Ù?? ??? ??????', sub: '????? ????? ????? ????? ?? ???.', body: '???? ??? Bambeh ?????.', cta: '??? ??? ????????', cancel: '???? ??????' },
};

function getLang(): string { try { return localStorage.getItem('Bambeh_language') || 'en'; } catch { return 'en'; } }
function t(key: string): string { const lang = getLang(); return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en'][key] ?? key; }

interface Props { open: boolean; onClose: () => void; message?: string; }

export default function SubscriptionGateModal({ open, onClose, message }: Props) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">{t('title')}</h2>
        <p className="text-teal-600 font-semibold text-center mb-3">{t('sub')}</p>
        {message && <p className="text-sm text-center text-gray-500 mb-2 italic">"{message}"</p>}
        <p className="text-gray-600 text-sm text-center mb-6">{t('body')}</p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['FarmFresh', 'Group Buy', 'AI Chat', 'Flash Deals', 'Tontine', 'Escrow'].map(f => (
            <span key={f} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-200">
              <Star className="w-3 h-3" />{f}
            </span>
          ))}
        </div>
        <button onClick={() => { onClose(); navigate('/subscription'); }}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold rounded-xl hover:from-teal-400 hover:to-teal-600 flex items-center justify-center gap-2 mb-3">
          <Zap className="w-5 h-5" />{t('cta')}
        </button>
        <button onClick={onClose} className="w-full py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 font-medium">
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}




