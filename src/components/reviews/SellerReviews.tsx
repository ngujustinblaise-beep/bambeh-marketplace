// BAMBEH_DEPLOY_TOKEN__SELLERREVIEWS_FIX341_CLEAN
/**
 * src/components/reviews/SellerReviews.tsx - Bambeh Marketplace
 *
 * FIX341 - buyers could never read a single review. Not because they were
 * blocked: `reviews` carries THREE separate public SELECT policies, every one
 * of them `qual = true`. Reading was wide open the whole time. The reading
 * SCREEN had simply never been built. SellerRatingPage wrote reviews through
 * the submit_review RPC, the item page showed a star average (FIX326), and the
 * words themselves were written to a table nobody ever displayed.
 *
 * This component is that missing screen.
 *
 * Two deliberate choices:
 *  - Reviews are matched on `target_id` ALONE, exactly as FIX326 does. They are
 *    stored polymorphically (target_id + target_type) and a seller's user id
 *    can never collide with a listing id, so this keeps working whatever
 *    target_type happens to be called.
 *  - Reviewer names come from `profiles` via select('*'), then the first
 *    non-empty of several likely name columns. Naming a column that does not
 *    exist makes PostgREST reject the whole query, which would blank every
 *    name at once. Same lesson as FIX96 and FIX340.
 */

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2, Loader2, MessageSquare, CornerDownRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

const COPY: Record<Lang, Record<string, string>> = {
  en: {
    heading: 'What buyers said', none: 'No reviews yet. Be the first to leave one.',
    verified: 'Verified purchase', reply: 'Seller replied', anon: 'Bambeh user',
    one: 'review', many: 'reviews',
  },
  fr: {
    heading: 'Ce que disent les acheteurs', none: "Pas encore d'avis. Soyez le premier.",
    verified: 'Achat vérifié', reply: 'Réponse du vendeur', anon: 'Utilisateur Bambeh',
    one: 'avis', many: 'avis',
  },
  pidgin: {
    heading: 'Wetin buyers talk', none: 'No review dey yet. You fit be di first.',
    verified: 'Na real buy', reply: 'Seller answer', anon: 'Bambeh user',
    one: 'review', many: 'reviews',
  },
  ar: {
    heading: 'ماذا قال المشترون', none: 'لا توجد مراجعات بعد. كن أول من يكتب واحدة.',
    verified: 'شراء موثّق', reply: 'رد البائع', anon: 'مستخدم بامبيه',
    one: 'مراجعة', many: 'مراجعات',
  },
  ff: {
    heading: 'Ko soodooɓe mbi\u0257i', none: 'Haala alaa tawo. Won\u0257u gadano.',
    verified: 'Coodgu tabitinaangu', reply: 'Njeeyoowo jaabii', anon: 'Kuutoro\u0257o Bambeh',
    one: 'haala', many: 'haalaaji',
  },
};

const DATE_LOCALE: Record<Lang, string> = {
  en: 'en-GB', fr: 'fr-CM', pidgin: 'en-GB', ar: 'ar-MA-u-nu-latn', ff: 'fr-CM',
};

// The first of these that holds a non-empty string wins.
const NAME_KEYS = ['full_name', 'name', 'display_name', 'username', 'business_name', 'first_name'];

interface ReviewRow {
  id: string;
  reviewer_id: string | null;
  rating: number | null;
  comment: string | null;
  response: string | null;
  response_at: string | null;
  is_verified_purchase: boolean | null;
  created_at: string;
}

interface Props {
  sellerId: string;
  className?: string;
  limit?: number;
}

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} / 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-3.5 h-3.5 ${n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </span>
);

export const SellerReviews: React.FC<Props> = ({ sellerId, className = '', limit = 20 }) => {
  const raw   = String(useLang() || 'en');
  const lang  = (COPY[raw as Lang] ? raw : 'en') as Lang;
  const c     = COPY[lang];
  const isRtl = lang === 'ar';

  const [rows, setRows]       = useState<ReviewRow[]>([]);
  const [names, setNames]     = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) { setRows([]); setLoading(false); return; }
    let alive = true;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, reviewer_id, rating, comment, response, response_at, is_verified_purchase, created_at')
        .eq('target_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!alive) return;
      if (error || !data) { setRows([]); setLoading(false); return; }

      const list = data as ReviewRow[];
      setRows(list);
      setLoading(false);

      // Names are a nice-to-have: a failure here must never blank the reviews.
      const ids = Array.from(new Set(list.map((r) => r.reviewer_id).filter(Boolean))) as string[];
      if (ids.length === 0) return;
      try {
        const { data: profs } = await supabase.from('profiles').select('*').in('id', ids);
        if (!alive || !profs) return;
        const map: Record<string, string> = {};
        for (const row of profs as Record<string, unknown>[]) {
          const id = String(row.id ?? '');
          if (!id) continue;
          for (const key of NAME_KEYS) {
            const v = row[key];
            if (typeof v === 'string' && v.trim()) { map[id] = v.trim(); break; }
          }
        }
        setNames(map);
      } catch {
        /* names are optional - leave them anonymous */
      }
    })();

    return () => { alive = false; };
  }, [sellerId, limit]);

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(DATE_LOCALE[lang], {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch {
      return new Date(iso).toLocaleDateString('en-GB');
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 p-6 flex justify-center ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`bg-white rounded-2xl border border-gray-100 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-bold text-gray-900">{c.heading}</h3>
        {rows.length > 0 && (
          <span className="text-[11px] text-gray-400">
            {rows.length} {rows.length === 1 ? c.one : c.many}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">{c.none}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const score = Math.max(0, Math.min(5, Math.round(Number(r.rating) || 0)));
            const who   = (r.reviewer_id && names[r.reviewer_id]) || c.anon;
            return (
              <li key={r.id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-gray-800 truncate">{who}</span>
                    <Stars value={score} />
                  </div>
                  <span className="text-[10px] text-gray-400">{fmtDate(r.created_at)}</span>
                </div>

                {r.is_verified_purchase ? (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-teal-700">
                    <CheckCircle2 className="w-3 h-3" />{c.verified}
                  </span>
                ) : null}

                {r.comment && r.comment.trim() ? (
                  <p className="text-xs text-gray-600 mt-1 whitespace-pre-line break-words">{r.comment.trim()}</p>
                ) : null}

                {r.response && r.response.trim() ? (
                  <div className="mt-2 ms-3 ps-2 border-s-2 border-teal-100">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700">
                      <CornerDownRight className="w-3 h-3" />{c.reply}
                    </span>
                    <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line break-words">{r.response.trim()}</p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SellerReviews;
// BAMBEH_END_TOKEN__SELLERREVIEWS_FIX341__COMPLETE
