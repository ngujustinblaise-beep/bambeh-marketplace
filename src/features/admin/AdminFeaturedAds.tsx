// BAMBEH_DEPLOY_TOKEN__ADMIN_FEATURED_ADS_FIX827_CLEAN
/**
 * AdminFeaturedAds.tsx - FIX827 (new) - Command Center > Featured ads
 * Replaces the two screens "Adverts" (FIX464) and "Promotions" (FIX469): one place for everything that runs in
 * Featured Ads.
 *
 * Big, 18 Oct 2026: "Bambeh can not still submit adverts ... adverts from admin dashboard must not make picture be
 * uploaded only through url. let url be an option and the admin panel has a section to upload the pictures sent and
 * post the advert which runs on all phones. we must have a section in the admin page that controls the featured ads.
 * we can switch off all free ads running now on the feature ad as well as corporate ads and choose which ads should
 * run based on payments. the adverts should be able to run for a day, a week, a month or a year ... we should be able
 * to choose ads from posted items or create an advert which is not neccessarily an account on the app. the toogle
 * should have an option to put all ads as featured ads or select a few ads ... the admin section should be able to
 * select what ads feature."
 *
 *  1. WHAT RUNS (admins and the super admin): everything posted (free, the paid ones first) / only the ones chosen /
 *     nothing; the Corporate adverts strip on Home on or off; the full-screen advert for free users on or off.
 *  2. RUNNING NOW: every advert and item chosen, until when, what was paid, by whom, who added it and when.
 *     Add time (a day, a week, a month, a year - it starts when the current time ends) or Stop.
 *  3. ADD: choose a posted item (marketplace, jobs, services, rentals, vehicles, Farm Fresh, swaps), or write a company
 *     advert - no Bambeh account needed - with a picture uploaded from this phone or computer (or a picture link), the
 *     words in English and/or French, and where a tap goes. Paid (amount, by whom, payment reference) or free.
 *  4. ALL ADVERTS (edit, run again, remove) and RECENT CHANGES (who did what, when).
 * The database (FIX823) checks everything again: staff only, no phone numbers / WhatsApp / emails in adverts.
 * English, like the rest of the Command Center.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import {
  AlertCircle, CalendarClock, Clock, ImagePlus, Link2, Loader2, Megaphone, Pencil, Plus, RefreshCw, Search, Square,
  Star, Trash2, Upload, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { forgetAdNow } from '@/components/ads/adControl';
import { scanFields } from '@/lib/contactGuard';

type Mode = 'all' | 'selected' | 'off';
type Plan = 'day' | 'week' | 'month' | 'year' | 'dates';
type Kind = 'advert' | 'listing' | 'farm' | 'exchange';

export interface Period {
  period: string; kind: Kind; ref: string; plan: Plan; starts_at: string; ends_at: string; free: boolean; amount: number | null;
  paid_by: string | null; pay_ref: string | null; note: string | null; added_by: string | null; added_at: string;
  stopped_at: string | null; stopped_by: string | null; showable: boolean; state: 'running' | 'waiting' | 'ended' | 'stopped';
  title: string; type?: string; image?: string | null; company?: string | null; price?: number | null; location?: string | null;
}
export interface AdvertRow {
  id: string; company_name: string | null; title: string; description: string | null; title_fr: string | null;
  description_fr: string | null; image_url: string | null; link_url: string | null; views: number; taps: number;
  created_at: string | null; created_by: string | null; running_until: string | null; waiting_from: string | null;
}
export interface ChangeRow { at: string; who: string | null; what: string; detail: Record<string, unknown> }
export interface AdminData {
  ok: boolean; reason?: string; rank: number; me: string;
  control: { mode: Mode; corporate_on: boolean; popup_on: boolean; updated_at: string | null; updated_by_name: string | null };
  periods: Period[]; adverts: AdvertRow[]; changes: ChangeRow[];
  totals: { running: number; waiting: number; paid_30: number; paid_all: number };
}
export interface FoundRow {
  kind: Kind; id: string; type: string; title: string; price: number | null; unit: string | null; location: string | null;
  image: string | null; owner: string | null; created_at: string; until: string | null;
}
interface Draft {
  id: string | null; company_name: string; title: string; description: string; title_fr: string; description_fr: string;
  image_url: string; link_url: string;
}
interface RunState {
  plan: Plan; startNow: boolean; starts: string; ends: string; pay: 'paid' | 'free'; amount: string; paid_by: string; pay_ref: string; note: string;
}

const EMPTY_DRAFT: Draft = { id: null, company_name: '', title: '', description: '', title_fr: '', description_fr: '', image_url: '', link_url: '' };
const EMPTY_RUN: RunState = { plan: 'week', startNow: true, starts: '', ends: '', pay: 'paid', amount: '', paid_by: '', pay_ref: '', note: '' };

export const PLAN_LABEL: Record<Plan, string> = { day: 'A day', week: 'A week', month: 'A month', year: 'A year', dates: 'Choose dates' };
const PLAN_DAYS: Record<Exclude<Plan, 'dates'>, number> = { day: 1, week: 7, month: 30, year: 365 };
const KIND_LABEL: Record<string, string> = {
  advert: 'Advert', marketplace: 'Marketplace', job: 'Job', service: 'Service', rental: 'Rental', vehicle: 'Vehicle',
  farm: 'Farm Fresh', exchange: 'Swap',
};
const SECTIONS: ReadonlyArray<readonly [string, string]> = [
  ['all', 'Everything'], ['marketplace', 'Marketplace'], ['job', 'Jobs'], ['service', 'Services'], ['rental', 'Rentals'],
  ['vehicle', 'Vehicles'], ['farm', 'Farm Fresh'], ['exchange', 'Swaps'],
];
const MODES: ReadonlyArray<{ id: Mode; title: string; sub: string }> = [
  { id: 'all', title: 'Everything posted', sub: 'Every post in Marketplace, Jobs, Services, Rentals, Vehicles, Farm Fresh and Swaps runs free - the ones chosen below come first. (This is how it has been.)' },
  { id: 'selected', title: 'Only the ones I choose', sub: 'The free posts stop. Only the adverts and items in "Running now" run - the paid ones.' },
  { id: 'off', title: 'Nothing', sub: 'Featured Ads disappears from Home and from every section.' },
];

export const REASONS: Record<string, string> = {
  staff_only: 'Only Bambeh staff can do this.',
  admins_only: 'Only admins and the super admin can do this.',
  not_showable: 'This item cannot be shown any more (sold, removed or expired).',
  need_amount: 'Write the amount paid - or choose "Free (Bambeh\'s choice)".',
  bad_amount: 'The amount must be a number.',
  bad_dates: 'Check the dates: the end must be after the start, at most 400 days.',
  bad_plan: 'Choose a day, a week, a month, a year or dates.',
  bad_pay_ref: 'The payment reference may only hold letters, numbers and . : / # _ -',
  contact_in_text: 'No phone numbers, WhatsApp or email addresses in adverts - contact stays in Bambeh.',
  bad_title: 'The title needs 2 to 90 characters.',
  bad_company: 'The company name is too long (80 characters at most).',
  bad_description: 'The description is too long (300 characters at most).',
  bad_picture: 'Add a picture: upload one, or paste a link that starts with https://',
  bad_link: 'Where a tap goes must be a page of the app (like /marketplace) or a website that starts with https:// - never a phone or WhatsApp.',
  too_long: 'Too long: "paid by" takes 120 characters, the note 300.',
  not_found: 'Not found - it may have been removed. Press Refresh.',
};

function reasonText(r: { reason?: string; detail?: string } | null | undefined): string {
  if (!r) return 'No answer - check the connection and try again.';
  if (r.reason === 'db') return 'The database refused: ' + String(r.detail || 'unknown reason');
  return REASONS[r.reason || ''] || 'Something was not right (' + String(r.reason || 'unknown') + ') - press Refresh and try again.';
}

const fmtXAF = (n: number | null | undefined): string =>
  n == null || !Number.isFinite(Number(n)) ? '' : new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(Number(n)) + ' XAF';

export function fmtWhen(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function timeLeft(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '';
  const ms = new Date(iso).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return 'ended';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return mins + ' min left';
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return hrs + (hrs === 1 ? ' hour left' : ' hours left');
  const days = Math.floor(hrs / 24);
  return days + ' days left';
}
function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** When a new time would run, as the database will set it (it starts when the time already paid for ends). */
export function runWindow(run: RunState, after: string | null, now = Date.now()): { from: Date; to: Date } | null {
  let from = new Date(now);
  if (!run.startNow && run.starts) {
    const s = new Date(run.starts);
    if (!isNaN(s.getTime()) && s.getTime() > now) from = s;
  } else if (after) {
    const a = new Date(after);
    if (!isNaN(a.getTime()) && a.getTime() > now) from = a;
  }
  if (run.plan === 'dates') {
    const e = run.ends ? new Date(run.ends) : null;
    return e && !isNaN(e.getTime()) && e.getTime() > from.getTime() ? { from, to: e } : null;
  }
  return { from, to: new Date(from.getTime() + PLAN_DAYS[run.plan] * 86400000) };
}

function runPayload(run: RunState): Record<string, unknown> {
  const p: Record<string, unknown> = { plan: run.plan };
  if (run.pay === 'free') p.free = true;
  else p.amount = run.amount.replace(/[^0-9]/g, '');
  if (run.paid_by.trim()) p.paid_by = run.paid_by.trim();
  if (run.pay_ref.trim()) p.pay_ref = run.pay_ref.trim();
  if (run.note.trim()) p.note = run.note.trim();
  if (!run.startNow && run.starts) p.starts = fromLocalInput(run.starts);
  if (run.plan === 'dates' && run.ends) p.ends = fromLocalInput(run.ends);
  return p;
}

/** A picture from the phone or computer: made smaller (1280 px, JPEG) before it is sent - data costs money. */
async function preparePicture(file: File): Promise<Blob> {
  try {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error('picture'));
        i.src = url;
      });
      const w0 = img.naturalWidth || img.width;
      const h0 = img.naturalHeight || img.height;
      const k = Math.min(1, 1280 / Math.max(w0, h0));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(w0 * k));
      canvas.height = Math.max(1, Math.round(h0 * k));
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
      return blob && blob.size > 0 ? blob : file;
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return file;
  }
}

export async function uploadAdvertPicture(file: File): Promise<{ ok: true; url: string } | { ok: false; why: string }> {
  const type = String(file && file.type || '');
  if (!type.startsWith('image/')) return { ok: false, why: 'That is not a picture. Choose a JPG, PNG or WEBP picture.' };
  if (file.size > 15 * 1024 * 1024) return { ok: false, why: 'That picture is too big (15 MB at most).' };
  const blob = await preparePicture(file);
  if (blob.size > 3 * 1024 * 1024) return { ok: false, why: 'Even made smaller, the picture is over 3 MB. Choose another one.' };
  let uid = '';
  try {
    const { data } = await supabase.auth.getSession();
    uid = (data && data.session && data.session.user && data.session.user.id) || '';
  } catch {
    uid = '';
  }
  if (!uid) return { ok: false, why: 'Sign in again, then upload the picture.' };
  const ct = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
  const ext = ct === 'image/png' ? 'png' : ct === 'image/webp' ? 'webp' : 'jpg';
  const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const tries: Array<[string, string]> = [['adverts', uid + '/' + name], ['listings', 'marketplace/' + uid + '/advert-' + name]];
  let last = '';
  for (const [bucket, path] of tries) {
    try {
      const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: ct, upsert: false, cacheControl: '31536000' });
      if (error) {
        last = String((error as { message?: string }).message || error);
        // only a missing "adverts" folder (FIX823 not run, or made by hand later) falls back to the listings folder
        if (bucket === 'adverts' && /bucket|not found|does not exist/i.test(last)) continue;
        return { ok: false, why: 'The picture was not saved: ' + last };
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (data && data.publicUrl) return { ok: true, url: data.publicUrl };
      last = 'no address came back';
    } catch (e) {
      last = String((e as Error)?.message || e);
    }
  }
  return { ok: false, why: 'The picture was not saved: ' + last };
}

function Box({ children, tone }: { children: ReactNode; tone?: 'red' | 'amber' | 'green' }) {
  const cls = tone === 'red' ? 'bg-red-50 border-red-200 text-red-800' : tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-900'
    : tone === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-gray-100 text-gray-800';
  return <div className={'rounded-xl border p-3 text-sm ' + cls}>{children}</div>;
}

function Thumb({ src }: { src?: string | null }) {
  return src
    ? <img src={src} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-gray-100 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
    : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100"><Megaphone className="h-5 w-5 text-gray-300" /></div>;
}

function paidLine(p: { free: boolean; amount: number | null; paid_by: string | null; pay_ref: string | null }): string {
  if (p.free) return "Free (Bambeh's choice)";
  if (p.amount == null) return 'Payment not recorded';
  return fmtXAF(p.amount) + ' paid' + (p.paid_by ? ' by ' + p.paid_by : '') + (p.pay_ref ? ' - ref ' + p.pay_ref : '');
}

function changeLine(c: ChangeRow): string {
  const d = c.detail || {};
  const title = d.title ? '"' + String(d.title) + '"' : 'an item';
  if (c.what === 'feature') {
    const plan = PLAN_LABEL[String(d.plan) as Plan] || String(d.plan || '');
    return 'added ' + title + ' to Featured Ads - ' + plan.toLowerCase() + ' (' + (d.free ? 'free' : fmtXAF(Number(d.amount))) + ')';
  }
  if (c.what === 'stop') return 'stopped ' + title + (d.all ? ' (all its time)' : '');
  if (c.what === 'advert_new') return 'wrote the advert ' + title;
  if (c.what === 'advert_edit') return 'changed the advert ' + title;
  if (c.what === 'advert_removed') return 'removed the advert ' + title;
  if (c.what === 'switch') {
    const b = (d.before || {}) as Record<string, unknown>;
    const a = (d.after || {}) as Record<string, unknown>;
    const parts: string[] = [];
    const modeName = (m: unknown) => (m === 'selected' ? 'only the ones chosen' : m === 'off' ? 'nothing' : 'everything posted');
    if (a.mode !== b.mode) parts.push('Featured Ads: ' + modeName(b.mode) + ' -> ' + modeName(a.mode));
    if (a.corporate_on !== b.corporate_on) parts.push('Corporate strip ' + (a.corporate_on ? 'on' : 'off'));
    if (a.popup_on !== b.popup_on) parts.push('full-screen advert ' + (a.popup_on ? 'on' : 'off'));
    return 'changed what runs: ' + (parts.join('; ') || 'nothing');
  }
  return c.what;
}

/** The period, the start and the payment - the same form for a posted item, a new advert and "add time". */
function RunForm({ run, setRun, after, compact }: { run: RunState; setRun: (r: RunState) => void; after: string | null; compact?: boolean }) {
  const w = runWindow(run, after);
  const set = <K extends keyof RunState>(k: K, v: RunState[K]) => setRun({ ...run, [k]: v });
  return (
    <div className={'space-y-3 ' + (compact ? '' : 'rounded-xl border border-amber-200 bg-amber-50/60 p-3')} data-run-form="1">
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-600">How long</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {(['day', 'week', 'month', 'year', 'dates'] as Plan[]).map((p) => (
            <button key={p} type="button" data-plan={p} onClick={() => set('plan', p)}
                    className={'rounded-xl border px-2 py-2 text-sm font-semibold ' + (run.plan === p ? 'border-amber-500 bg-amber-100 text-amber-900' : 'border-gray-200 bg-white text-gray-700')}>
              {PLAN_LABEL[p]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={run.startNow} data-start-now="1" onChange={(e) => set('startNow', e.target.checked)} className="h-4 w-4 accent-teal-600" />
          {after ? 'Start when the time already running ends' : 'Start now'}
        </label>
        {!run.startNow ? (
          <input type="datetime-local" value={run.starts} data-starts="1" onChange={(e) => set('starts', e.target.value)}
                 className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" aria-label="Starts" />
        ) : <span />}
        {run.plan === 'dates' ? (
          <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Ends
            <input type="datetime-local" value={run.ends} data-ends="1" onChange={(e) => set('ends', e.target.value)}
                   className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal" />
          </label>
        ) : null}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-gray-700" data-run-window="1">
        <CalendarClock className="h-4 w-4 text-amber-600" />
        {w ? <>Runs from <b>{fmtWhen(w.from.toISOString())}</b> to <b>{fmtWhen(w.to.toISOString())}</b></> : 'Choose when it ends.'}
      </p>
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-600">Payment</p>
        <div className="mb-2 flex gap-2">
          <button type="button" data-pay="paid" onClick={() => set('pay', 'paid')}
                  className={'flex-1 rounded-xl border px-2 py-2 text-sm font-semibold ' + (run.pay === 'paid' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-gray-200 bg-white text-gray-600')}>Paid</button>
          <button type="button" data-pay="free" onClick={() => set('pay', 'free')}
                  className={'flex-1 rounded-xl border px-2 py-2 text-sm font-semibold ' + (run.pay === 'free' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-gray-200 bg-white text-gray-600')}>Free (Bambeh&apos;s choice)</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {run.pay === 'paid' ? (
            <input inputMode="numeric" value={run.amount} data-amount="1" onChange={(e) => set('amount', e.target.value.replace(/[^0-9 ]/g, '').slice(0, 12))}
                   placeholder="Amount paid (XAF)" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" aria-label="Amount paid in XAF" />
          ) : null}
          <input value={run.paid_by} data-paid-by="1" onChange={(e) => set('paid_by', e.target.value.slice(0, 120))}
                 placeholder={run.pay === 'paid' ? 'Paid by (name or company)' : 'For (name or company)'} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
          {run.pay === 'paid' ? (
            <input value={run.pay_ref} data-pay-ref="1" onChange={(e) => set('pay_ref', e.target.value.slice(0, 60))}
                   placeholder="Payment reference (MoMo ID or receipt)" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
          ) : null}
        </div>
        <input value={run.note} data-note="1" onChange={(e) => set('note', e.target.value.slice(0, 300))}
               placeholder="Note (optional)" className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
      </div>
    </div>
  );
}

export default function AdminFeaturedAds({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'red' | 'green' } | null>(null);
  const [tab, setTab] = useState<'item' | 'advert'>('item');

  // posted items
  const [q, setQ] = useState('');
  const [section, setSection] = useState('all');
  const [found, setFound] = useState<FoundRow[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<FoundRow | null>(null);
  const [run, setRun] = useState<RunState>(EMPTY_RUN);

  // add time to something already running
  const [more, setMore] = useState<{ kind: Kind; ref: string; title: string; after: string | null } | null>(null);
  const [moreRun, setMoreRun] = useState<RunState>(EMPTY_RUN);

  // a company advert
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [adRun, setAdRun] = useState<RunState>(EMPTY_RUN);
  const [runNow, setRunNow] = useState(true);
  const [useLink, setUseLink] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const formTop = useRef<HTMLDivElement | null>(null);

  const say = (text: string, tone: 'red' | 'green' = 'green') => {
    setMsg({ text, tone });
    // a "done" line goes away by itself; a problem stays until it is read and closed (or the next action)
    if (tone === 'green') {
      try { window.setTimeout(() => setMsg((m) => (m && m.text === text ? null : m)), 7000); } catch { /* no timer */ }
    }
  };

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const { data: d, error } = await supabase.rpc('bambeh_admin_ads');
      if (error) {
        const m = String((error as { message?: string }).message || error);
        setErr(/bambeh_admin_ads|could not find|does not exist|PGRST202/i.test(m) ? 'missing' : m);
        setData(null);
      } else {
        setErr(null);
        setData((d || null) as AdminData | null);
      }
    } catch (e) {
      setErr(String((e as Error)?.message || e));
    }
    setBusy(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const changed = useCallback(async () => {
    forgetAdNow();
    await load();
  }, [load]);

  const canSwitch = !!data && data.ok && data.rank >= 2;
  const canRemove = !!data && data.ok && data.rank >= 2;

  const setControl = async (mode: Mode | null, corporate: boolean | null, popup: boolean | null) => {
    if (!data) return;
    if (mode === 'selected' && data.control.mode !== 'selected'
        && !window.confirm('Only the adverts and items in "Running now" will run. The free posts stop showing in Featured Ads. Go ahead?')) return;
    if (mode === 'off' && !window.confirm('Featured Ads will disappear from Home and from every section. Go ahead?')) return;
    setBusy(true);
    const { data: r, error } = await supabase.rpc('bambeh_admin_ad_control', { p_mode: mode, p_corporate: corporate, p_popup: popup });
    setBusy(false);
    if (error || !r || !(r as { ok?: boolean }).ok) { say(error ? String(error.message || error) : reasonText(r as { reason?: string }), 'red'); return; }
    say('Saved. Phones follow within 2 minutes (the website at once on the next page; older apps after the new APK).');
    await changed();
  };

  const search = async () => {
    setSearching(true);
    setPicked(null);
    const { data: r, error } = await supabase.rpc('bambeh_admin_feature_search', { p_q: q.trim() || null, p_kind: section === 'all' ? null : section });
    setSearching(false);
    if (error || !r || !(r as { ok?: boolean }).ok) { say(error ? String(error.message || error) : reasonText(r as { reason?: string }), 'red'); setFound([]); return; }
    setFound(((r as { rows?: FoundRow[] }).rows || []) as FoundRow[]);
  };

  const feature = async (kind: Kind, ref: string, r: RunState, done: () => void) => {
    if (r.pay === 'paid' && !r.amount.replace(/[^0-9]/g, '')) { say(REASONS.need_amount, 'red'); return; }
    const scan = scanFields(r.paid_by, r.note);
    if (!scan.clean) { say(REASONS.contact_in_text + ' (' + scan.matches.join(', ') + ')', 'red'); return; }
    setBusy(true);
    const { data: res, error } = await supabase.rpc('bambeh_admin_feature', { p: { kind, ref, ...runPayload(r) } });
    setBusy(false);
    const out = res as { ok?: boolean; reason?: string; ends_at?: string; starts_at?: string } | null;
    if (error || !out || !out.ok) { say(error ? String(error.message || error) : reasonText(out), 'red'); return; }
    say('Added to Featured Ads: runs ' + fmtWhen(out.starts_at) + ' to ' + fmtWhen(out.ends_at) + '.');
    done();
    await changed();
  };

  const stop = async (p: Period, all: boolean) => {
    if (!window.confirm((all ? 'Stop "' + p.title + '" and all the time paid for it?' : 'Stop "' + p.title + '" now?') + ' It leaves every phone within 2 minutes.')) return;
    setBusy(true);
    const { data: r, error } = await supabase.rpc('bambeh_admin_feature_stop', { p_id: p.period, p_all: all });
    setBusy(false);
    if (error || !r || !(r as { ok?: boolean }).ok) { say(error ? String(error.message || error) : reasonText(r as { reason?: string }), 'red'); return; }
    say('Stopped.');
    await changed();
  };

  const onPicture = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    try { e.target.value = ''; } catch { /* read-only in some browsers */ }
    if (!f) return;
    setUploading(true);
    const r = await uploadAdvertPicture(f);
    setUploading(false);
    if (!r.ok) { say(r.why, 'red'); return; }
    setDraft((d) => ({ ...d, image_url: r.url }));
    say('Picture uploaded.');
  };

  const saveAdvert = async () => {
    const d = draft;
    if (d.title.trim().length < 2) { say(REASONS.bad_title, 'red'); return; }
    if (!/^https:\/\/\S+$/i.test(d.image_url.trim())) { say(REASONS.bad_picture, 'red'); return; }
    const link = d.link_url.trim();
    if (link && !(/^\/[A-Za-z0-9/_.?=&%#-]*$/.test(link) || /^https:\/\/\S+$/i.test(link)) ) { say(REASONS.bad_link, 'red'); return; }
    if (/wa\.me|whatsapp|tel:|sms:|mailto:/i.test(link)) { say(REASONS.bad_link, 'red'); return; }
    const scan = scanFields(d.company_name, d.title, d.description, d.title_fr, d.description_fr);
    if (!scan.clean) { say(REASONS.contact_in_text + ' (' + scan.matches.join(', ') + ')', 'red'); return; }
    const withRun = runNow && !d.id;
    if (withRun) {
      if (adRun.pay === 'paid' && !adRun.amount.replace(/[^0-9]/g, '')) { say(REASONS.need_amount, 'red'); return; }
      const s2 = scanFields(adRun.paid_by, adRun.note);
      if (!s2.clean) { say(REASONS.contact_in_text + ' (' + s2.matches.join(', ') + ')', 'red'); return; }
    }
    const ad = {
      id: d.id, company_name: d.company_name.trim(), title: d.title.trim(), description: d.description.trim(),
      title_fr: d.title_fr.trim(), description_fr: d.description_fr.trim(), image_url: d.image_url.trim(), link_url: link,
    };
    setBusy(true);
    const { data: res, error } = await supabase.rpc('bambeh_admin_ad_save', { p_ad: ad, p_run: withRun ? runPayload(adRun) : null });
    setBusy(false);
    const out = res as { ok?: boolean; reason?: string; detail?: string; new?: boolean; run?: { ends_at?: string } } | null;
    if (error || !out || !out.ok) { say(error ? String(error.message || error) : reasonText(out), 'red'); return; }
    say(d.id ? 'Advert saved.' : withRun ? 'Advert saved and running until ' + fmtWhen(out.run && out.run.ends_at) + '.' : 'Advert saved. Press "Run" when it is paid for.');
    setDraft(EMPTY_DRAFT);
    setAdRun(EMPTY_RUN);
    setUseLink(false);
    await changed();
  };

  const editAdvert = (a: AdvertRow) => {
    setTab('advert');
    setDraft({
      id: a.id, company_name: a.company_name || '', title: a.title || '', description: a.description || '', title_fr: a.title_fr || '',
      description_fr: a.description_fr || '', image_url: a.image_url || '', link_url: a.link_url || '',
    });
    setUseLink(!!a.image_url && !/\/storage\/v1\/object\/public\//.test(a.image_url));
    try { formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { /* old browser */ }
  };

  const removeAdvert = async (a: AdvertRow) => {
    if (!window.confirm('Remove the advert "' + a.title + '"? It stops at once and leaves this list. Its history stays in the database.')) return;
    setBusy(true);
    const { data: r, error } = await supabase.rpc('bambeh_admin_ad_hide', { p_id: a.id });
    setBusy(false);
    if (error || !r || !(r as { ok?: boolean }).ok) { say(error ? String(error.message || error) : reasonText(r as { reason?: string }), 'red'); return; }
    say('Advert removed.');
    await changed();
  };

  const periods = useMemo(() => (data && data.ok && Array.isArray(data.periods) ? data.periods : []), [data]);
  const open = useMemo(() => periods.filter((p) => p.state === 'running' || p.state === 'waiting'), [periods]);
  const closed = useMemo(() => periods.filter((p) => p.state === 'ended' || p.state === 'stopped'), [periods]);
  const openCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of open) m[p.kind + ':' + p.ref] = (m[p.kind + ':' + p.ref] || 0) + 1;
    return m;
  }, [open]);
  const lastEnd = (kind: Kind, ref: string): string | null => {
    let best: string | null = null;
    for (const p of open) if (p.kind === kind && p.ref === ref && (!best || p.ends_at > best)) best = p.ends_at;
    return best;
  };

  const periodRow = (p: Period, closedRow = false) => (
    <div key={p.period} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3" data-period={p.period} data-state={p.state}>
      <Thumb src={p.image} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={'rounded-full px-2 py-0.5 text-[10px] font-bold ' + (p.kind === 'advert' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600')}>
            {KIND_LABEL[p.kind === 'listing' ? String(p.type || 'marketplace') : p.kind] || p.kind}
          </span>
          <span className={'rounded-full px-2 py-0.5 text-[10px] font-bold ' + (p.state === 'running' ? 'bg-emerald-50 text-emerald-700' : p.state === 'waiting' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500')}>
            {p.state === 'running' ? 'RUNNING' : p.state === 'waiting' ? 'WAITING' : p.state === 'stopped' ? 'STOPPED' : 'ENDED'}
          </span>
          <span className="text-[10px] text-gray-500">{PLAN_LABEL[p.plan]}</span>
        </div>
        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">{p.title}</p>
        {p.company ? <p className="truncate text-xs text-gray-500">{p.company}</p> : null}
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-600">
          <Clock className="h-3 w-3" />
          {p.state === 'waiting' ? 'Starts ' + fmtWhen(p.starts_at) + ', until ' + fmtWhen(p.ends_at)
            : p.state === 'running' ? 'Until ' + fmtWhen(p.ends_at) + ' (' + timeLeft(p.ends_at) + ')'
            : p.state === 'stopped' ? 'Stopped ' + fmtWhen(p.stopped_at) + (p.stopped_by ? ' by ' + p.stopped_by : '')
            : 'Ended ' + fmtWhen(p.ends_at)}
        </p>
        <p className="text-[11px] text-gray-600" data-paid="1">{paidLine(p)}</p>
        <p className="text-[11px] text-gray-400">Added by {p.added_by || 'staff'}, {fmtWhen(p.added_at)}{p.note ? ' - ' + p.note : ''}</p>
        {!p.showable && !closedRow ? <p className="mt-0.5 text-[11px] font-semibold text-amber-700">Not shown: the item was sold, removed or has expired.</p> : null}
      </div>
      {!closedRow ? (
        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" data-addtime={p.period} disabled={busy}
                  onClick={() => { setMore({ kind: p.kind, ref: p.ref, title: p.title, after: lastEnd(p.kind, p.ref) }); setMoreRun(EMPTY_RUN); }}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" /> Add time
          </button>
          <button type="button" data-stop={p.period} disabled={busy} onClick={() => void stop(p, false)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-50">
            <Square className="h-3.5 w-3.5" /> Stop
          </button>
          {(openCount[p.kind + ':' + p.ref] || 0) > 1 ? (
            <button type="button" data-stop-all={p.period} disabled={busy} onClick={() => void stop(p, true)}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-red-700 disabled:opacity-50">Stop all its time</button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const c = data?.control;
  const previewTitle = draft.title.trim() || 'Your advert title';

  return (
    <div className={'space-y-4 ' + (embedded ? '' : 'mx-auto max-w-5xl p-4')} data-fix="FIX827" data-featured-admin="1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Star className="h-5 w-5 text-amber-500" /> Featured ads</h1>
          <p className="mt-0.5 text-xs text-gray-500">What runs in Featured Ads on every phone: company adverts, chosen posts, and the switches.</p>
        </div>
        <button type="button" data-refresh="1" onClick={() => void load()} disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
        </button>
      </div>

      {msg ? (
        <div data-msg={msg.tone} className={'flex items-start gap-2 rounded-xl border p-3 text-sm ' + (msg.tone === 'red' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800')}>
          {msg.tone === 'red' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : null}
          <span className="flex-1">{msg.text}</span>
          <button type="button" aria-label="Close" onClick={() => setMsg(null)}><X className="h-4 w-4" /></button>
        </div>
      ) : null}

      {err === 'missing' ? (
        <Box tone="amber"><span data-msg="missing">Featured ads is not in the database yet: run FIX823-adverts-and-featured.sql in the Supabase SQL Editor, then press Refresh.</span></Box>
      ) : err ? (
        <Box tone="red"><span data-msg="error">Could not load: {err}</span></Box>
      ) : data && !data.ok ? (
        <Box><span data-msg="staff">Only Bambeh staff can see this.</span></Box>
      ) : !data ? (
        <Box><span className="text-gray-500">Loading...</span></Box>
      ) : (
        <>
          {/* 1. what runs */}
          <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4" data-control="1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-bold text-gray-900">What runs in Featured Ads</h2>
              <p className="text-[11px] text-gray-500" data-control-by="1">
                {c && c.updated_by_name ? 'Last changed by ' + c.updated_by_name + ', ' + fmtWhen(c.updated_at) : 'Not changed yet'}
              </p>
            </div>
            {!canSwitch ? <p className="text-xs font-semibold text-amber-700" data-read-only="1">Only admins and the super admin can change these. You can add and stop adverts below.</p> : null}
            <div className="grid gap-2 sm:grid-cols-3">
              {MODES.map((m) => (
                <button key={m.id} type="button" data-mode-btn={m.id} aria-pressed={c?.mode === m.id} disabled={!canSwitch || busy}
                        onClick={() => { if (c?.mode !== m.id) void setControl(m.id, null, null); }}
                        className={'rounded-xl border-2 p-3 text-start transition-colors disabled:cursor-default ' + (c?.mode === m.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200 bg-white')}>
                  <span className="block text-sm font-bold text-gray-900">{c?.mode === m.id ? '\u2713 ' : ''}{m.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-gray-600">{m.sub}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {([['corporate', 'Corporate adverts strip on Home', 'Products of verified businesses (Corporate), under Featured Ads on Home.', c?.corporate_on],
                 ['popup', 'Full-screen advert for free users', 'Company adverts between pages: at most 3 a visit, closable after 3 seconds. Members never see it.', c?.popup_on]] as const).map(([key, title, sub, on]) => (
                <button key={key} type="button" data-switch={key} aria-pressed={!!on} disabled={!canSwitch || busy}
                        onClick={() => void setControl(null, key === 'corporate' ? !on : null, key === 'popup' ? !on : null)}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 text-start disabled:cursor-default">
                  <span className={'mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ' + (on ? 'bg-teal-600' : 'bg-gray-300')}>
                    <span className={'h-5 w-5 rounded-full bg-white shadow transition-transform ' + (on ? 'translate-x-5' : '')} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-gray-900">{title} <span className={on ? 'text-teal-700' : 'text-gray-500'}>{on ? 'ON' : 'OFF'}</span></span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-gray-600">{sub}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500">On the phones, Featured Ads shows 10 at a time: the cards of a set pass across the screen one by one, then the next 10 come. Paid adverts and chosen items always come first.</p>
          </section>

          {/* 2. running now */}
          <section className="space-y-2" data-running="1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-bold text-gray-900">Running now</h2>
              <p className="text-xs text-gray-500" data-totals="1">
                <b>{data.totals.running}</b> running - <b>{data.totals.waiting}</b> waiting to start - paid in the last 30 days: <b>{fmtXAF(data.totals.paid_30) || '0 XAF'}</b>
              </p>
            </div>
            {more ? (
              <div className="space-y-2 rounded-2xl border-2 border-amber-300 bg-white p-3" data-more="1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900">Add time: {more.title}</p>
                  <button type="button" aria-label="Close" onClick={() => setMore(null)}><X className="h-4 w-4 text-gray-500" /></button>
                </div>
                <RunForm run={moreRun} setRun={setMoreRun} after={more.after} compact />
                <button type="button" data-save-more="1" disabled={busy}
                        onClick={() => void feature(more.kind, more.ref, moreRun, () => setMore(null))}
                        className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white disabled:opacity-50">Add this time</button>
              </div>
            ) : null}
            {open.length ? open.map((p) => periodRow(p)) : (
              <Box><span className="text-gray-500" data-none-running="1">Nothing chosen is running. {c?.mode === 'selected' ? 'Featured Ads is empty on the phones until you add something below.' : 'Everything posted runs (free), as it always has.'}</span></Box>
            )}
            {closed.length ? (
              <div>
                <button type="button" data-show-old="1" onClick={() => setShowOld((v) => !v)} className="text-xs font-semibold text-teal-700">
                  {showOld ? 'Hide' : 'Show'} ended and stopped ({closed.length}, last 60 days)
                </button>
                {showOld ? <div className="mt-2 space-y-2">{closed.map((p) => periodRow(p, true))}</div> : null}
              </div>
            ) : null}
          </section>

          {/* 3. add */}
          <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4" data-add="1">
            <div ref={formTop} className="flex gap-2">
              <button type="button" data-tab="item" onClick={() => setTab('item')}
                      className={'flex-1 rounded-xl px-3 py-2 text-sm font-bold ' + (tab === 'item' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700')}>Choose a posted item</button>
              <button type="button" data-tab="advert" onClick={() => setTab('advert')}
                      className={'flex-1 rounded-xl px-3 py-2 text-sm font-bold ' + (tab === 'advert' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700')}>{draft.id ? 'Edit the advert' : 'Create an advert'}</button>
            </div>

            {tab === 'item' ? (
              <div className="space-y-3" data-item-tab="1">
                <div className="flex flex-wrap gap-1.5">
                  {SECTIONS.map(([k, label]) => (
                    <button key={k} type="button" data-section={k} onClick={() => setSection(k)}
                            className={'rounded-full border px-3 py-1 text-xs font-semibold ' + (section === k ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-gray-200 text-gray-600')}>{label}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input value={q} data-search-input="1" onChange={(e) => setQ(e.target.value.slice(0, 60))}
                           onKeyDown={(e) => { if (e.key === 'Enter') void search(); }}
                           placeholder="Title, category or town (empty: the newest)" className="flex-1 py-2.5 text-sm outline-none" />
                  </div>
                  <button type="button" data-search-btn="1" onClick={() => void search()} disabled={searching}
                          className="rounded-xl bg-teal-600 px-4 text-sm font-bold text-white disabled:opacity-60">{searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}</button>
                </div>
                {found === null ? (
                  <p className="text-center text-xs text-gray-500">Search, then press "Feature" on the item that was paid for.</p>
                ) : found.length === 0 ? (
                  <p className="text-center text-xs text-gray-500" data-found-none="1">Nothing found that can be shown (sold, removed and expired posts are left out).</p>
                ) : (
                  <div className="space-y-2">
                    {found.map((f) => (
                      <div key={f.kind + f.id} className={'rounded-xl border p-3 ' + (picked && picked.id === f.id ? 'border-amber-300 bg-amber-50/40' : 'border-gray-100')} data-result={f.id}>
                        <div className="flex items-start gap-3">
                          <Thumb src={f.image} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{f.title}</p>
                            <p className="truncate text-xs text-gray-500">
                              {KIND_LABEL[f.kind === 'listing' ? f.type : f.kind] || f.type}{f.price != null ? ' - ' + fmtXAF(f.price) : ''}{f.location ? ' - ' + f.location : ''}
                            </p>
                            <p className="text-[11px] text-gray-400">Posted by {f.owner || 'member'}, {fmtWhen(f.created_at)}</p>
                            {f.until ? <p className="text-[11px] font-semibold text-amber-700">Already featured until {fmtWhen(f.until)}</p> : null}
                          </div>
                          <button type="button" data-feature={f.id} onClick={() => { setPicked(f); setRun(EMPTY_RUN); }}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white">
                            <Star className="h-3.5 w-3.5" /> {f.until ? 'Add time' : 'Feature'}
                          </button>
                        </div>
                        {picked && picked.id === f.id ? (
                          <div className="mt-3 space-y-2">
                            <RunForm run={run} setRun={setRun} after={f.until} />
                            <div className="flex gap-2">
                              <button type="button" data-save-run="1" disabled={busy}
                                      onClick={() => void feature(f.kind, f.id, run, () => { setPicked(null); setFound(null); })}
                                      className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white disabled:opacity-50">Put it in Featured Ads</button>
                              <button type="button" onClick={() => setPicked(null)} className="rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600">Cancel</button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3" data-advert-form="1">
                <p className="text-xs text-gray-500">For a business, an event or anyone - no Bambeh account needed. The words are the advertiser&apos;s: English, French or both (French readers see the French when there is some). No phone numbers, WhatsApp or email addresses: contact stays in Bambeh.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-gray-600">Advertiser / company
                    <input value={draft.company_name} data-ad-company="1" onChange={(e) => setDraft({ ...draft, company_name: e.target.value.slice(0, 80) })}
                           placeholder="e.g. Boulangerie Le Pain d'Or" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">Title (English) *
                    <input value={draft.title} data-ad-title="1" onChange={(e) => setDraft({ ...draft, title: e.target.value.slice(0, 90) })}
                           placeholder="Fresh bread every morning" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Description (English)
                    <textarea rows={2} value={draft.description} data-ad-desc="1" onChange={(e) => setDraft({ ...draft, description: e.target.value.slice(0, 300) })}
                              placeholder="Open 6am to 8pm, Bastos" className="mt-1 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">Titre (fran&ccedil;ais)
                    <input value={draft.title_fr} data-ad-title-fr="1" onChange={(e) => setDraft({ ...draft, title_fr: e.target.value.slice(0, 90) })}
                           placeholder="Du pain frais chaque matin" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-gray-600">Description (fran&ccedil;ais)
                    <input value={draft.description_fr} data-ad-desc-fr="1" onChange={(e) => setDraft({ ...draft, description_fr: e.target.value.slice(0, 300) })}
                           placeholder="Ouvert de 6h a 20h, Bastos" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal" />
                  </label>
                </div>

                <div className="rounded-xl border border-gray-200 p-3" data-picture="1">
                  <p className="mb-2 text-xs font-semibold text-gray-600">Picture * <span className="font-normal text-gray-400">(without a picture an advert never runs)</span></p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" data-upload-btn="1" onClick={() => fileRef.current?.click()} disabled={uploading}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {uploading ? 'Uploading...' : draft.image_url ? 'Upload another picture' : 'Upload a picture'}
                    </button>
                    <button type="button" data-use-link="1" onClick={() => setUseLink((v) => !v)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                      <Link2 className="h-4 w-4" /> {useLink ? 'Hide the picture link' : 'Use a picture link instead'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void onPicture(e)} data-upload="1" />
                  </div>
                  {useLink ? (
                    <input value={draft.image_url} data-ad-url="1" onChange={(e) => setDraft({ ...draft, image_url: e.target.value.trim().slice(0, 1000) })}
                           placeholder="https://... (a link to the picture)" className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                  ) : null}
                  <p className="mt-1 text-[11px] text-gray-400">From this phone or computer: it is made smaller before it is sent. JPG, PNG or WEBP.</p>
                </div>

                <label className="block text-xs font-semibold text-gray-600">Where a tap goes (optional)
                  <input value={draft.link_url} data-ad-link="1" onChange={(e) => setDraft({ ...draft, link_url: e.target.value.trim().slice(0, 500) })}
                         placeholder="/marketplace  or  https://website.cm" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal" />
                  <span className="mt-1 block font-normal text-gray-400">A page of the app (starts with /) or a website (https://). Empty: a tap shows the advert larger.</span>
                </label>

                <div data-ad-preview="1">
                  <p className="mb-1 text-xs font-semibold text-gray-600">How it looks on the phones</p>
                  <div className="flex items-start gap-3">
                    <div className="w-36 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <div className="flex h-24 items-center justify-center overflow-hidden bg-gray-100">
                        {draft.image_url ? <img src={draft.image_url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-gray-300" />}
                      </div>
                      <div className="p-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-1.5 py-0.5 text-[9px] font-bold text-white"><Megaphone className="h-2.5 w-2.5" /> Ad</span>
                        {draft.company_name.trim() ? <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-teal-700">{draft.company_name}</p> : null}
                        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-tight text-gray-800">{previewTitle}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500">In Featured Ads on Home and in every section, marked &quot;Ad&quot;; and, when the full-screen advert is on, between pages for free users.</p>
                  </div>
                </div>

                {!draft.id ? (
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <input type="checkbox" checked={runNow} data-run-now="1" onChange={(e) => setRunNow(e.target.checked)} className="h-4 w-4 accent-teal-600" />
                    Run it now (paid or free)
                  </label>
                ) : null}
                {!draft.id && runNow ? <RunForm run={adRun} setRun={setAdRun} after={null} /> : null}

                <div className="flex gap-2">
                  <button type="button" data-ad-save="1" disabled={busy || uploading} onClick={() => void saveAdvert()}
                          className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white disabled:opacity-50">
                    {draft.id ? 'Save the changes' : runNow ? 'Save and run' : 'Save (not running yet)'}
                  </button>
                  {draft.id || draft.title || draft.image_url ? (
                    <button type="button" onClick={() => { setDraft(EMPTY_DRAFT); setUseLink(false); }}
                            className="rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600">Clear</button>
                  ) : null}
                </div>
              </div>
            )}
          </section>

          {/* 4. all adverts */}
          <section className="space-y-2" data-adverts="1">
            <h2 className="text-base font-bold text-gray-900">All company adverts</h2>
            {data.adverts.length ? data.adverts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3" data-advert={a.id}>
                <Thumb src={a.image_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{a.title}</p>
                  {a.company_name ? <p className="truncate text-xs text-gray-500">{a.company_name}</p> : null}
                  <p className="text-[11px] text-gray-600">
                    {a.running_until ? 'Running until ' + fmtWhen(a.running_until) : a.waiting_from ? 'Starts ' + fmtWhen(a.waiting_from) : 'Not running'}
                    {' - seen ' + a.views + ', tapped ' + a.taps}
                  </p>
                  <p className="text-[11px] text-gray-400">Written by {a.created_by || 'staff'}{a.created_at ? ', ' + fmtWhen(a.created_at) : ''}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button type="button" data-run={a.id} disabled={busy}
                          onClick={() => { setMore({ kind: 'advert', ref: a.id, title: a.title, after: a.running_until || null }); setMoreRun(EMPTY_RUN); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { /* old browser */ } }}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                    <Plus className="h-3.5 w-3.5" /> {a.running_until || a.waiting_from ? 'Add time' : 'Run'}
                  </button>
                  <button type="button" data-edit={a.id} onClick={() => editAdvert(a)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {canRemove ? (
                    <button type="button" data-remove={a.id} disabled={busy} onClick={() => void removeAdvert(a)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-red-700 disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  ) : null}
                </div>
              </div>
            )) : <Box><span className="text-gray-500" data-no-adverts="1">No company advert yet. Create one above: "Create an advert".</span></Box>}
          </section>

          {/* 5. recent changes */}
          <section className="space-y-1 rounded-2xl border border-gray-100 bg-white p-4" data-changes="1">
            <h2 className="mb-1 text-base font-bold text-gray-900">Recent changes</h2>
            {data.changes.length ? data.changes.map((h, i) => (
              <p key={i} className="text-xs text-gray-700" data-change={h.what}>
                <span className="text-gray-400">{fmtWhen(h.at)}</span> - <b>{h.who || 'staff'}</b> {changeLine(h)}
              </p>
            )) : <p className="text-xs text-gray-500">Nothing yet.</p>}
          </section>
        </>
      )}
    </div>
  );
}
// BAMBEH_END_TOKEN__ADMIN_FEATURED_ADS_FIX827__COMPLETE
