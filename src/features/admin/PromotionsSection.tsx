// BAMBEH_DEPLOY_TOKEN__PROMOTIONSSECTION_FIX469_CLEAN
/**
 * src/features/admin/PromotionsSection.tsx — Bambeh Admin Command Center
 *
 * FIX469 — SELL THE FRONT OF THE SHOP WINDOW.
 * ───────────────────────────────────────────
 * FIX470 taught FeaturedAdsStrip to put featured items first and to drop them
 * the moment their date passes. This is where a human decides which item that
 * is, and for how long.
 *
 * THE TIERS ARE YOURS
 *     100 XAF  daily   → featured 24 hours
 *     500 XAF  weekly  → featured 7 days
 *   1 500 XAF  monthly → featured 30 days
 *
 * Your reason for tying duration to the plan, in your words: so people don't
 * subscribe for 100 XAF expecting a month of featured ads.
 *
 * WHERE THE RULES ACTUALLY LIVE
 *   Not here. `admin_promote_listing` (FIX476) owns the durations, the admin
 *   gate, and the one-featured-listing-per-user cap — it stands down the
 *   owner's other live features before starting a new one. That means the cap
 *   holds whether the promotion comes from this screen, from SQL, or from
 *   whatever we build next. A rule enforced in a React file is a rule that
 *   only applies until someone writes a second React file.
 *
 * THE SWITCHES
 *   The featured strip is FREE today, to attract users. When you flip it to
 *   paid-only, that is a promise being withdrawn from people who are already
 *   using it — so the toggle asks you to confirm and says plainly what changes.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2, Search, Star, StarOff, AlertCircle, RefreshCw, Clock,
  Timer, ToggleLeft, ToggleRight, Sparkles,
} from 'lucide-react';
import {
  fetchFeaturedListings, searchPromotableListings, promoteListing, unpromoteListing,
  expireFeaturedListings, featureIsLive, fetchPlatformSettings, setPlatformSetting,
  settingIsOn,
  type FeaturedListing, type PromotePlan, type PlatformSetting,
  type AdminRole, type Capabilities,
} from './lib';

const PLANS: Array<{ id: PromotePlan; label: string; price: string; days: string }> = [
  { id: 'daily',   label: 'Daily',   price: '100 XAF',   days: '24 hours' },
  { id: 'weekly',  label: 'Weekly',  price: '500 XAF',   days: '7 days' },
  { id: 'monthly', label: 'Monthly', price: '1 500 XAF', days: '30 days' },
];

const SWITCHES: Array<{ key: string; label: string; whenOn: string; whenOff: string }> = [
  {
    key: 'featured_strip_paid_only',
    label: 'Featured strip',
    whenOn:  'Paid only — just promoted listings appear.',
    whenOff: 'Free for everyone — newest listings appear. Good for attracting users.',
  },
  {
    key: 'corporate_strip_paid_only',
    label: 'Corporate strip',
    whenOn:  'Paid only — just paid corporate placements appear.',
    whenOff: 'Free — every verified store\u2019s products appear.',
  },
  {
    key: 'featured_requires_approval',
    label: 'Featuring needs approval',
    whenOn:  'A subscriber\u2019s request must be approved by staff first.',
    whenOff: 'A subscriber\u2019s request goes live immediately. Not recommended.',
  },
];

/** "3 days left", "6 hours left", "expired". */
function remaining(iso: string | null): string {
  if (!iso) return 'no end date';
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min left`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs} hour${hrs === 1 ? '' : 's'} left`;
  return `${Math.floor(hrs / 24)} days left`;
}

export default function PromotionsSection({
  userId, role, cap, flash,
}: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {

  const [featured, setFeatured] = useState<FeaturedListing[]>([]);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const [q, setQ] = useState('');
  const [results, setResults] = useState<FeaturedListing[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const [plan, setPlan] = useState<PromotePlan>('weekly');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    const res = await fetchFeaturedListings();
    setFeatured(res.rows);
    // A failed load must never render as "nothing is featured".
    setFeaturedError(res.ok ? null : (res.error || 'Could not load featured listings.'));
    setLoadingFeatured(false);
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await fetchPlatformSettings();
    setSettings(res.rows);
    setSettingsError(res.ok ? null : (res.error || 'Could not load the switches.'));
  }, []);

  useEffect(() => { loadFeatured(); loadSettings(); }, [loadFeatured, loadSettings]);

  const runSearch = useCallback(async () => {
    setSearching(true);
    const res = await searchPromotableListings(q);
    setResults(res.rows);
    setSearchError(res.ok ? null : (res.error || 'Search failed.'));
    setSearching(false);
  }, [q]);

  const liveCount = useMemo(() => featured.filter((l) => featureIsLive(l)).length, [featured]);
  const staleCount = useMemo(() => featured.length - liveCount, [featured, liveCount]);

  const promote = async (l: FeaturedListing) => {
    setBusyId(l.id);
    try {
      const r = await promoteListing(userId, role, l.id, plan);
      const until = r?.featured_until ? new Date(r.featured_until).toLocaleString() : 'set';
      flash(
        r?.stood_down
          ? `Featured until ${until}. ${r.stood_down} other listing(s) by this seller were stood down — one at a time.`
          : `Featured until ${until}.`,
      );
      await loadFeatured();
      await runSearch();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not promote that listing.');
    } finally {
      setBusyId(null);
    }
  };

  const unpromote = async (l: FeaturedListing) => {
    setBusyId(l.id);
    try {
      await unpromoteListing(userId, role, l.id);
      flash('Feature ended.');
      await loadFeatured();
      await runSearch();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not end that feature.');
    } finally {
      setBusyId(null);
    }
  };

  const sweep = async () => {
    try {
      const n = await expireFeaturedListings();
      flash(n === 0 ? 'Nothing had expired.' : `${n} expired feature(s) cleared.`);
      await loadFeatured();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'The sweep failed.');
    }
  };

  const flip = async (s: PlatformSetting) => {
    const turningOn = !settingIsOn(s);
    const def = SWITCHES.find((x) => x.key === s.key);
    if (turningOn && s.key.endsWith('_paid_only')) {
      // Taking a free thing away from people already using it deserves a pause.
      if (!window.confirm(
        `Switch the ${def?.label ?? s.key} to PAID ONLY?\n\n` +
        `Users who are getting this free today will stop appearing there. ` +
        `Make sure they have been told the new rules first.`
      )) return;
    }
    try {
      await setPlatformSetting(userId, role, s.key, turningOn);
      flash(`${def?.label ?? s.key} is now ${turningOn ? 'PAID ONLY' : 'FREE'}.`);
      await loadSettings();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not change that switch.');
    }
  };

  const row = (l: FeaturedListing, mode: 'featured' | 'result') => {
    const live = featureIsLive(l);
    const busy = busyId === l.id;
    return (
      <div key={l.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">{l.title || 'Untitled'}</p>
            {l.type ? (
              <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{l.type}</span>
            ) : null}
            {l.is_featured ? (
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                live ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {live ? 'FEATURED' : 'EXPIRED'}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-400 truncate">
            {l.location || 'No location'}
            {l.price ? ` · ${Number(l.price).toLocaleString('fr-CM')} XAF` : ''}
          </p>
          {l.is_featured ? (
            <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {remaining(l.featured_until)}
            </p>
          ) : null}
        </div>

        {l.is_featured ? (
          <button onClick={() => unpromote(l)} disabled={busy}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100
                       px-2.5 py-2 rounded-xl disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <StarOff className="w-4 h-4" />} End
          </button>
        ) : (
          <button onClick={() => promote(l)} disabled={busy}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500
                       hover:bg-amber-600 px-2.5 py-2 rounded-xl disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />} Feature
          </button>
        )}
        {mode === 'result' && l.is_featured ? null : null}
      </div>
    );
  };

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Promotions</h1>
      <p className="text-xs text-gray-500 mb-4">
        A featured listing sits at the front of the strip until its time runs out.
        One per seller at a time — that is what keeps it worth paying for.
      </p>

      {/* ── the switches ─────────────────────────────────────────────── */}
      {cap.viewFinances ? (
        <section className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Free or paid</h2>
          {settingsError ? (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1"><p className="text-xs">{settingsError}</p></div>
              <button onClick={loadSettings} className="text-xs font-bold text-red-700 hover:underline">Retry</button>
            </div>
          ) : (
            <div className="space-y-2">
              {SWITCHES.map((def) => {
                const s = settings.find((x) => x.key === def.key);
                if (!s) return null;
                const on = settingIsOn(s);
                return (
                  <button key={def.key} onClick={() => flip(s)}
                    className="w-full text-left bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 hover:border-teal-300">
                    {on ? <ToggleRight className="w-6 h-6 text-teal-600 shrink-0" />
                        : <ToggleLeft className="w-6 h-6 text-gray-300 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {def.label}
                        <span className={`ml-2 text-[10px] font-bold rounded-full px-2 py-0.5 ${
                          on ? 'bg-teal-50 text-teal-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>{on ? 'PAID ONLY' : 'FREE'}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{on ? def.whenOn : def.whenOff}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {/* ── running now ──────────────────────────────────────────────── */}
      <section className="mb-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-sm font-bold text-gray-900">
            Featured now
            <span className="ml-2 text-xs font-normal text-gray-400">
              {liveCount} running{staleCount > 0 ? ` · ${staleCount} expired` : ''}
            </span>
          </h2>
          {staleCount > 0 ? (
            <button onClick={sweep}
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" /> Clear expired
            </button>
          ) : null}
        </div>

        {featuredError ? (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Could not load featured listings</p>
              <p className="text-xs mt-0.5">{featuredError}</p>
            </div>
            <button onClick={loadFeatured} className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        ) : loadingFeatured ? (
          <div className="flex justify-center py-8 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : featured.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Nothing is featured right now.</p>
            <p className="text-xs text-gray-400 mt-1">Find a listing below and give it the front of the strip.</p>
          </div>
        ) : (
          <div className="space-y-2">{featured.map((l) => row(l, 'featured'))}</div>
        )}
      </section>

      {/* ── promote something ────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-2">Feature a listing</h2>

        <div className="flex gap-2 mb-2">
          {PLANS.map((p) => (
            <button key={p.id} onClick={() => setPlan(p.id)}
              className={`flex-1 rounded-xl border px-2 py-2 text-center transition-colors ${
                plan === p.id ? 'border-amber-400 bg-amber-50 text-amber-800'
                              : 'border-gray-200 text-gray-600 hover:border-amber-300'
              }`}>
              <span className="block text-sm font-semibold">{p.label}</span>
              <span className="block text-[11px]">{p.price}</span>
              <span className="block text-[10px] text-gray-400">{p.days}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              placeholder="Search title, category or town…"
              className="flex-1 py-2.5 text-sm outline-none" />
          </div>
          <button onClick={runSearch} disabled={searching}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 rounded-xl disabled:opacity-60">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>

        {searchError ? (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs flex-1">{searchError}</p>
            <button onClick={runSearch} className="text-xs font-bold text-red-700 hover:underline">Retry</button>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">{results.map((l) => row(l, 'result'))}</div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-6">
            Search for a listing, then give it {PLANS.find((p) => p.id === plan)?.days} at the front.
          </p>
        )}
      </section>
    </>
  );
}
// BAMBEH_END_TOKEN__PROMOTIONSSECTION_FIX469__COMPLETE
