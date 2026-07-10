// BAMBEH_DEPLOY_TOKEN__RenewListingsModal_FIX69_CLEAN
import { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Package,
} from 'lucide-react';

/* ============================================================
   ⚠️  VERIFY THESE 2 IMPORT PATHS AGAINST YOUR REPO BEFORE BUILD
   (same paths as SellerProfilePage — fix once, reuse.)
   ============================================================ */
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useLang';
/* ============================================================ */

const RENEW_DAYS = 30;
const SOON_DAYS = 7; // highlight anything expiring within a week

const STR: Record<string, Record<string, string>> = {
  en: {
    title: 'Renew your listings',
    subtitle: 'Extend any ad by 30 days',
    loading: 'Loading your listings...',
    none: 'You have no listings to renew.',
    renew: 'Renew +30d',
    renewing: 'Renewing...',
    renewed: 'Renewed',
    expired: 'Expired',
    expiresIn: 'Expires in {n}d',
    expiresToday: 'Expires today',
    noExpiry: 'No expiry set',
    close: 'Close',
    error: 'Could not renew. Try again.',
    newDate: 'Now valid until {d}',
  },
  fr: {
    title: 'Renouveler vos annonces',
    subtitle: 'Prolongez une annonce de 30 jours',
    loading: 'Chargement de vos annonces...',
    none: 'Aucune annonce à renouveler.',
    renew: 'Renouveler +30j',
    renewing: 'Renouvellement...',
    renewed: 'Renouvelée',
    expired: 'Expirée',
    expiresIn: 'Expire dans {n}j',
    expiresToday: "Expire aujourd'hui",
    noExpiry: "Pas d'expiration",
    close: 'Fermer',
    error: 'Échec du renouvellement. Réessayez.',
    newDate: "Valide jusqu'au {d}",
  },
  pidgin: {
    title: 'Renew your listing dem',
    subtitle: 'Add 30 days for any ad',
    loading: 'Di listing dem dey load...',
    none: 'You no get listing wey you fit renew.',
    renew: 'Renew +30d',
    renewing: 'E dey renew...',
    renewed: 'Don renew',
    expired: 'Don expire',
    expiresIn: 'E go expire for {n}d',
    expiresToday: 'E go expire today',
    noExpiry: 'No expiry dey',
    close: 'Close',
    error: 'E no fit renew. Try again.',
    newDate: 'Now e valid reach {d}',
  },
  ar: {
    title: 'تجديد إعلاناتك',
    subtitle: 'مدّد أي إعلان لمدة 30 يومًا',
    loading: 'جارٍ تحميل إعلاناتك...',
    none: 'لا توجد إعلانات للتجديد.',
    renew: 'تجديد +30 يوم',
    renewing: 'جارٍ التجديد...',
    renewed: 'تم التجديد',
    expired: 'منتهي',
    expiresIn: 'ينتهي خلال {n} يوم',
    expiresToday: 'ينتهي اليوم',
    noExpiry: 'بدون تاريخ انتهاء',
    close: 'إغلاق',
    error: 'تعذّر التجديد. حاول مرة أخرى.',
    newDate: 'صالح حتى {d}',
  },
  ff: {
    title: 'Hesɗitin njeeygu maa',
    subtitle: 'Ɓeydu balɗe 30 e njeeygu',
    loading: 'Njeeygu maa ina loowa...',
    none: 'A alaa njeeygu ngu hesɗitintaa.',
    renew: 'Hesɗitin +30',
    renewing: 'Ina hesɗitina...',
    renewed: 'Hesɗitinaama',
    expired: 'Timmii',
    expiresIn: 'Ina timma e balɗe {n}',
    expiresToday: 'Ina timma hannde',
    noExpiry: 'Timmineede alaa',
    close: 'Uddu',
    error: 'Hesɗitingol waawaaka. Ndaru kadi.',
    newDate: 'Jaɓaama haa {d}',
  },
};

function tr(lang: string, key: string, vars?: Record<string, string | number>): string {
  let s = (STR[lang] && STR[lang][key]) || STR.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      s = s.replace(`{${k}}`, String(vars[k]));
    });
  }
  return s;
}

interface RenewRow {
  id: string;
  table: 'listings' | 'exchange_items';
  title: string;
  type: string;
  expires_at: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function RenewListingsModal({ isOpen, onClose, userId }: Props) {
  const langRaw: any = useLang();
  const lang: string =
    typeof langRaw === 'string' ? langRaw : langRaw?.lang || 'en';

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<RenewRow[]>([]);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [renewedIds, setRenewedIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && userId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  async function load() {
    setLoading(true);
    setRenewedIds({});
    setErrorId(null);
    const out: RenewRow[] = [];
    try {
      // core: single listings table (marketplace/rental/service/vehicle/job/farm)
      const { data: lst } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId);
      (lst || []).forEach((r: any) => {
        out.push({
          id: r.id,
          table: 'listings',
          title: r.title || r.name || '-',
          type: r.type || 'listing',
          expires_at: r.expires_at ?? null,
        });
      });

      // exchange_items — only include if the table actually has expires_at
      const { data: exch } = await supabase
        .from('exchange_items')
        .select('*')
        .eq('user_id', userId);
      (exch || []).forEach((r: any) => {
        if (Object.prototype.hasOwnProperty.call(r, 'expires_at')) {
          out.push({
            id: r.id,
            table: 'exchange_items',
            title: r.title || r.name || '-',
            type: 'exchange',
            expires_at: r.expires_at ?? null,
          });
        }
      });

      // soonest expiry first; rows with no expiry go last
      out.sort((a, b) => {
        const ta = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
        const tb = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
        return ta - tb;
      });
      setRows(out);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Renew load error', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function daysLeft(exp: string | null): number | null {
    if (!exp) return null;
    const ms = new Date(exp).getTime() - Date.now();
    return Math.ceil(ms / 86400000);
  }

  async function renew(row: RenewRow) {
    setRenewingId(row.id);
    setErrorId(null);
    const now = Date.now();
    // if still valid, add 30d on top of remaining time; if expired, 30d from now
    const base =
      row.expires_at && new Date(row.expires_at).getTime() > now
        ? new Date(row.expires_at).getTime()
        : now;
    const next = new Date(base + RENEW_DAYS * 86400000).toISOString();

    const { error } = await supabase
      .from(row.table)
      .update({ expires_at: next })
      .eq('id', row.id);

    setRenewingId(null);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Renew error', error);
      setErrorId(row.id);
      return;
    }
    setRows((rs) =>
      rs.map((r) => (r.id === row.id ? { ...r, expires_at: next } : r))
    );
    setRenewedIds((d) => ({ ...d, [row.id]: next }));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">{tr(lang, 'title')}</h2>
            <p className="text-xs text-gray-500">{tr(lang, 'subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100"
            aria-label={tr(lang, 'close')}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mb-2" />
              <p className="text-sm">{tr(lang, 'loading')}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Package className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm">{tr(lang, 'none')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => {
                const d = daysLeft(row.expires_at);
                const renewed = renewedIds[row.id];
                const isExpired = d !== null && d < 0;
                const isSoon = d !== null && d >= 0 && d <= SOON_DAYS;

                let statusText = tr(lang, 'noExpiry');
                let statusClass = 'text-gray-400';
                if (renewed) {
                  statusText = tr(lang, 'newDate', {
                    d: new Date(renewed).toLocaleDateString(),
                  });
                  statusClass = 'text-emerald-600';
                } else if (d !== null) {
                  if (d < 0) {
                    statusText = tr(lang, 'expired');
                    statusClass = 'text-red-500';
                  } else if (d === 0) {
                    statusText = tr(lang, 'expiresToday');
                    statusClass = 'text-amber-600';
                  } else {
                    statusText = tr(lang, 'expiresIn', { n: d });
                    statusClass = isSoon ? 'text-amber-600' : 'text-gray-500';
                  }
                }

                return (
                  <div
                    key={`${row.table}-${row.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isExpired && !renewed
                        ? 'border-red-100 bg-red-50/40'
                        : isSoon && !renewed
                        ? 'border-amber-100 bg-amber-50/40'
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {row.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-gray-400">
                          {row.type}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span
                          className={`flex items-center gap-1 text-xs ${statusClass}`}
                        >
                          <Clock className="w-3 h-3" />
                          {statusText}
                        </span>
                      </div>
                      {errorId === row.id && (
                        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          {tr(lang, 'error')}
                        </p>
                      )}
                    </div>

                    {renewed ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 px-3 py-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {tr(lang, 'renewed')}
                      </span>
                    ) : (
                      <button
                        onClick={() => renew(row)}
                        disabled={renewingId === row.id}
                        className="flex items-center gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                      >
                        {renewingId === row.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {tr(lang, 'renewing')}
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            {tr(lang, 'renew')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// BAMBEH_END_TOKEN__RenewListingsModal__COMPLETE
