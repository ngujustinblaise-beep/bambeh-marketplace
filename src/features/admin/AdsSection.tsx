// BAMBEH_DEPLOY_TOKEN__ADSSECTION_FIX464_CLEAN
/**
 * src/features/admin/AdsSection.tsx — Bambeh Admin Command Center
 *
 * FIX464 — THE SCREEN THAT LETS YOU SELL ADVERTISING.
 * ───────────────────────────────────────────────────
 * `corporate_ads` has been a finished, well-designed table for months —
 * scheduling, expiry, impression and click counters, all of it. It held one
 * row, because there has never been a way to create a second.
 *
 * `AdInterstitial` now displays from it (FIX465). This is the other half: the
 * place a staff member writes an advert, schedules it, and afterwards reads
 * back the number they will show the advertiser.
 *
 * WHAT THIS REPLACES
 *   PostFeaturedAdForm.tsx, which existed in TWO copies and wrote to
 *   `featured_ads` — a table nothing in the app has ever read. Anyone who used
 *   it saw a green "Posted!" tick and their advert went nowhere. Both copies
 *   should be deleted once this ships.
 *
 * WHY THE COPY IS ENGLISH *OR* FRENCH AND NOT FIVE LANGUAGES
 *   The five-language rule covers Bambeh's own words. An advert's words belong
 *   to the advertiser, and they are written by a person, not translated by a
 *   machine — bad French on a banner makes the ADVERTISER look unprofessional,
 *   and that is the customer you lose. Fill in one or both; French users see
 *   French when it exists and fall back to the base text when it does not.
 *
 * THE LIVE BADGE IS NOT DECORATION
 *   It uses adIsLive(), the same four rules AdInterstitial applies: active,
 *   has an image, started, not ended. So this list can never tell you an
 *   advert is running when a user cannot see it.
 *
 * LANGUAGE: English only, by decision. Staff chrome, never seen by a user.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2, Plus, X, Eye, MousePointerClick, AlertCircle, RefreshCw,
  Power, PowerOff, Trash2, Pencil, Megaphone,
} from 'lucide-react';
import {
  fetchAds, createAd, updateAd, setAdActive, deleteAd, adIsLive,
  type CorporateAd, type AdDraft, type AdminRole, type Capabilities,
} from './lib';

const EMPTY: AdDraft = {
  title: '',
  description: '',
  title_fr: '',
  description_fr: '',
  image_url: '',
  link_url: '',
  company_name: '',
  tier: 'standard',
  is_active: true,
  starts_at: null,
  ends_at: null,
};

/** <input type="datetime-local"> wants 'YYYY-MM-DDTHH:mm' in LOCAL time. */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AdsSection({
  userId, role, cap, flash,
}: { userId: string; role: AdminRole; cap: Capabilities; flash: (m: string) => void }) {

  const [ads, setAds] = useState<CorporateAd[]>([]);
  const [loading, setLoading] = useState(true);
  // FIX460b thinking: a failed load must never look like "you have no adverts".
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState<CorporateAd | null>(null);
  const [draft, setDraft] = useState<AdDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchAds();
    setAds(res.rows);
    setLoadError(res.ok ? null : (res.error || 'Could not load adverts.'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const liveCount = useMemo(() => ads.filter((a) => adIsLive(a)).length, [ads]);
  const totalViews = useMemo(() => ads.reduce((n, a) => n + (a.view_count ?? 0), 0), [ads]);
  const totalClicks = useMemo(() => ads.reduce((n, a) => n + (a.click_count ?? 0), 0), [ads]);

  const openNew = () => { setEditing(null); setDraft({ ...EMPTY }); };

  const openEdit = (ad: CorporateAd) => {
    setEditing(ad);
    setDraft({
      title: ad.title ?? '',
      description: ad.description ?? '',
      title_fr: ad.title_fr ?? '',
      description_fr: ad.description_fr ?? '',
      image_url: ad.image_url ?? '',
      link_url: ad.link_url ?? '',
      company_name: ad.company_name ?? '',
      tier: ad.tier ?? 'standard',
      is_active: ad.is_active,
      starts_at: ad.starts_at,
      ends_at: ad.ends_at,
    });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) { flash('The advert needs a title.'); return; }
    if (!draft.image_url?.trim()) {
      flash('An advert with no image is never shown. Add an image URL.');
      return;
    }
    if (draft.starts_at && draft.ends_at && new Date(draft.ends_at) <= new Date(draft.starts_at)) {
      flash('The end date must be after the start date.');
      return;
    }

    setSaving(true);
    try {
      // Empty strings become null so the database holds "absent", not "blank".
      const clean: AdDraft = {
        ...draft,
        title: draft.title.trim(),
        description: draft.description?.trim() || null,
        title_fr: draft.title_fr?.trim() || null,
        description_fr: draft.description_fr?.trim() || null,
        image_url: draft.image_url?.trim() || null,
        link_url: draft.link_url?.trim() || null,
        company_name: draft.company_name?.trim() || null,
      };
      if (editing) {
        await updateAd(userId, role, editing.id, clean);
        flash('Advert updated.');
      } else {
        await createAd(userId, role, clean);
        flash('Advert created.');
      }
      setDraft(null); setEditing(null);
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not save the advert.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (ad: CorporateAd) => {
    try {
      await setAdActive(userId, role, ad.id, !ad.is_active);
      flash(ad.is_active ? 'Advert paused.' : 'Advert activated.');
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not change the advert.');
    }
  };

  const remove = async (ad: CorporateAd) => {
    if (!window.confirm(`Delete "${ad.title}"? Its view and click history goes too.`)) return;
    try {
      await deleteAd(userId, role, ad.id);
      flash('Advert deleted.');
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not delete the advert.');
    }
  };

  const set = <K extends keyof AdDraft>(k: K, v: AdDraft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Adverts</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Shown to free users between listings. Premium and staff never see one.
          </p>
        </div>
        <button onClick={openNew}
          className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New advert
        </button>
      </div>

      {/* the three numbers you would quote to an advertiser */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-lg font-bold text-gray-900">{liveCount}</p>
          <p className="text-[11px] text-gray-400">Running now</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-lg font-bold text-gray-900">{totalViews.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400">Times shown</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-lg font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400">Taps through</p>
        </div>
      </div>

      {/* A failure says so. It does not render as emptiness. */}
      {loadError ? (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Could not load adverts</p>
            <p className="text-xs mt-0.5">{loadError}</p>
          </div>
          <button onClick={load} className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10 text-teal-600"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {ads.map((ad) => {
            const live = adIsLive(ad);
            return (
              <div key={ad.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-3">
                {ad.image_url ? (
                  <img src={ad.image_url} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ad.title}</p>
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                      live ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {live ? 'RUNNING' : ad.is_active ? 'SCHEDULED / ENDED' : 'PAUSED'}
                    </span>
                    {ad.title_fr ? (
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-blue-50 text-blue-700">FR</span>
                    ) : null}
                  </div>
                  {ad.company_name ? <p className="text-xs text-gray-400 truncate">{ad.company_name}</p> : null}
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(ad.view_count ?? 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {(ad.click_count ?? 0).toLocaleString()}</span>
                    {ad.ends_at ? <span>ends {new Date(ad.ends_at).toLocaleDateString()}</span> : null}
                  </div>
                  {!ad.image_url ? (
                    <p className="text-[11px] text-amber-700 mt-1">No image — this advert can never be shown.</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => openEdit(ad)} title="Edit"
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => toggle(ad)} title={ad.is_active ? 'Pause' : 'Activate'}
                    className={`p-1.5 rounded-lg ${ad.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                    {ad.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  {cap.viewFinances ? (
                    <button onClick={() => remove(ad)} title="Delete"
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  ) : null}
                </div>
              </div>
            );
          })}

          {ads.length === 0 && !loadError ? (
            <div className="text-center py-10">
              <Megaphone className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No adverts yet.</p>
              <p className="text-xs text-gray-400 mt-1">Create one and it appears to free users between listings.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* ── editor ─────────────────────────────────────────────────────── */}
      {draft ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => !saving && setDraft(null)}>
          <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              <p className="flex-1 font-bold text-gray-900">{editing ? 'Edit advert' : 'New advert'}</p>
              <button onClick={() => setDraft(null)} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Close">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <Field label="Advertiser / company">
                <input value={draft.company_name ?? ''} onChange={(e) => set('company_name', e.target.value)}
                  placeholder="e.g. Boulangerie Le Pain d'Or" className={INPUT} />
              </Field>

              <Field label="Title (English)" required>
                <input value={draft.title} onChange={(e) => set('title', e.target.value)}
                  placeholder="Fresh bread every morning" className={INPUT} />
              </Field>
              <Field label="Description (English)">
                <textarea rows={2} value={draft.description ?? ''} onChange={(e) => set('description', e.target.value)}
                  placeholder="Open 6am to 8pm, Bastos" className={`${INPUT} resize-none`} />
              </Field>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-[11px] text-gray-400 mb-2">
                  Optional French copy. Written by a person, not translated by a machine.
                  French users see it when present, otherwise they see the English.
                </p>
                <Field label="Titre (Français)">
                  <input value={draft.title_fr ?? ''} onChange={(e) => set('title_fr', e.target.value)}
                    placeholder="Du pain frais chaque matin" className={INPUT} />
                </Field>
                <div className="h-2" />
                <Field label="Description (Français)">
                  <textarea rows={2} value={draft.description_fr ?? ''} onChange={(e) => set('description_fr', e.target.value)}
                    placeholder="Ouvert de 6h à 20h, Bastos" className={`${INPUT} resize-none`} />
                </Field>
              </div>

              <Field label="Image URL" required hint="Without an image the advert is never shown.">
                <input value={draft.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)}
                  placeholder="https://…" className={INPUT} />
              </Field>
              {draft.image_url ? (
                <img src={draft.image_url} alt="" className="w-full h-36 object-cover rounded-xl bg-gray-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : null}

              <Field label="Link when tapped" hint="A full https:// address, or an in-app path like /marketplace">
                <input value={draft.link_url ?? ''} onChange={(e) => set('link_url', e.target.value)}
                  placeholder="https://… or /marketplace" className={INPUT} />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Starts" hint="Leave empty to start now">
                  <input type="datetime-local" value={toLocalInput(draft.starts_at)}
                    onChange={(e) => set('starts_at', fromLocalInput(e.target.value))} className={INPUT} />
                </Field>
                <Field label="Ends" hint="Leave empty for no end">
                  <input type="datetime-local" value={toLocalInput(draft.ends_at)}
                    onChange={(e) => set('ends_at', fromLocalInput(e.target.value))} className={INPUT} />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 pt-1">
                <input type="checkbox" checked={draft.is_active}
                  onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-teal-600" />
                Active
              </label>

              <button onClick={save} disabled={saving}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2.5 rounded-xl
                           disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editing ? 'Save changes' : 'Create advert'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const INPUT =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400';

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1 block">
        {label}{required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADSSECTION_FIX464__COMPLETE
