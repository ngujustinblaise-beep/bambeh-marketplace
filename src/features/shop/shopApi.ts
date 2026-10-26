// BAMBEH_DEPLOY_TOKEN__SHOPAPI_FIX895_CLEAN
// FILE LOCATION: src/features/shop/shopApi.ts
//
// FIX895 - what the shop pages read and write (Package 10). Everything goes through the database functions of FIX892:
// the public shop page (anyone, no account: the first 6 items; members see all), the seller's own link, and
// Command Center > Shops (Verified on Bambeh by admins, hiding by staff). Never a phone number.
// (c) 2026 BAMBEH SARL. All rights reserved.

import { supabase } from '@/lib/supabase';

export interface ShopItem {
  kind: 'listing' | 'farm' | 'exchange';
  id: string;
  type: string;
  title: string;
  price: number | null;
  unit: string | null;
  location: string | null;
  image: string | null;
  sold_out: boolean;
}

export interface ShopInfo {
  slug: string;
  name: string;
  town: string | null;
  verified: boolean;
  since: string | null;
  rating: { avg: number; count: number };
  hidden_for_others: boolean;
}

export type ShopPublic =
  | { state: 'found'; signedIn: boolean; mine: boolean; shop: ShopInfo; total: number; items: ShopItem[]; limit: number }
  | { state: 'hidden'; slug: string }
  | { state: 'business'; slug: string; name: string }
  | { state: 'missing' }
  | { state: 'error' };

export interface MyShop {
  user_id: string;
  slug: string;
  name: string;
  town: string | null;
  hidden: boolean;
  hidden_note: string | null;
  verified: boolean;
  checks: string[];
  verify_note: string | null;
  verified_by_name: string | null;
  verified_at: string | null;
  slug_changed_at: string | null;
  next_link_change: string | null;
  created_at: string | null;
  aliases: string[];
  visits_7d: number;
}

export type MineRes =
  | { ok: true; signedIn: boolean; shop: MyShop | null; itemsTotal: number; suggestion: { slug: string; name: string; town: string | null } | null }
  | { ok: false; reason: string };

export type SaveRes = { ok: true; shop: MyShop } | { ok: false; reason: string; after?: string };

export interface AdminShopRow extends MyShop {
  owner: string;
  mine: boolean;
  account_off: boolean;
  items_total: number;
  log: Array<{ what: string; detail: string | null; by: string | null; at: string }>;
}

export type AdminShopsRes =
  | { ok: true; canVerify: boolean; canHide: boolean; rows: AdminShopRow[]; counts: { all: number; verified: number; unverified: number; hidden: number } }
  | { ok: false; reason: string };

// ---------------------------------------------------------------- links
export const SHOP_HOST = 'bambeh.com';

/** The link a seller shares: https://bambeh.com/<name> (the website sends it on to the app's shop page). */
export function shopUrl(slug: string): string {
  return 'https://' + SHOP_HOST + '/' + slug;
}

/** The link as people read it: bambeh.com/<name>. */
export function shopShort(slug: string): string {
  return SHOP_HOST + '/' + slug;
}

/** What a link name may look like while it is typed: small letters, numbers and hyphens, at most 30. */
export function typedSlug(raw: string): string {
  return String(raw || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 30);
}

/** The page of one item in the app. */
export function itemPath(it: Pick<ShopItem, 'kind' | 'type' | 'id'>): string {
  const id = encodeURIComponent(it.id);
  if (it.kind === 'farm') return '/farm-fresh/' + id;
  if (it.kind === 'exchange') return '/exchange/' + id;
  const t = String(it.type || '').toLowerCase();
  if (t === 'job' || t === 'jobs') return '/jobs/' + id;
  if (t === 'service' || t === 'services') return '/services/' + id;
  if (t === 'rental' || t === 'rentals' || t === 'property') return '/rentals/' + id;
  if (t === 'vehicle' || t === 'vehicles') return '/vehicles/' + id;
  return '/marketplace/' + id;
}

// ---------------------------------------------------------------- reading the answers
function num(v: unknown, dflt = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : dflt;
}

function str(v: unknown): string | null {
  const s = v === null || v === undefined ? '' : String(v).trim();
  return s ? s : null;
}

function toItem(d: Record<string, unknown>): ShopItem {
  const kind = d.kind === 'farm' || d.kind === 'exchange' ? d.kind : 'listing';
  const price = d.price === null || d.price === undefined ? null : num(d.price, 0);
  return {
    kind,
    id: String(d.id ?? ''),
    type: String(d.type ?? 'marketplace'),
    title: str(d.title) || '',
    price: price !== null && price > 0 ? Math.round(price) : null,
    unit: str(d.unit),
    location: str(d.location),
    image: str(d.image),
    sold_out: d.sold_out === true,
  };
}

function toMyShop(d: Record<string, unknown>): MyShop {
  return {
    user_id: String(d.user_id ?? ''),
    slug: String(d.slug ?? ''),
    name: String(d.name ?? ''),
    town: str(d.town),
    hidden: d.hidden === true,
    hidden_note: str(d.hidden_note),
    verified: d.verified === true,
    checks: Array.isArray(d.checks) ? (d.checks as unknown[]).map(String) : [],
    verify_note: str(d.verify_note),
    verified_by_name: str(d.verified_by_name),
    verified_at: str(d.verified_at),
    slug_changed_at: str(d.slug_changed_at),
    next_link_change: str(d.next_link_change),
    created_at: str(d.created_at),
    aliases: Array.isArray(d.aliases) ? (d.aliases as unknown[]).map(String) : [],
    visits_7d: num(d.visits_7d),
  };
}

async function call(fn: string, args?: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null; failed: boolean }> {
  try {
    const { data, error } = await supabase.rpc(fn, args || {});
    if (error || !data || typeof data !== 'object') return { data: null, failed: true };
    return { data: data as Record<string, unknown>, failed: false };
  } catch {
    return { data: null, failed: true };
  }
}

// ---------------------------------------------------------------- the shop page (anyone)
export async function fetchShop(slug: string): Promise<ShopPublic> {
  const { data, failed } = await call('bambeh_shop_public', { p_slug: slug });
  if (failed || !data) return { state: 'error' };
  if (data.found !== true) {
    const b = data.business as Record<string, unknown> | null | undefined;
    if (b && typeof b === 'object' && str(b.slug)) return { state: 'business', slug: String(b.slug), name: str(b.name) || String(b.slug) };
    return { state: 'missing' };
  }
  if (data.hidden === true) return { state: 'hidden', slug: String(data.slug ?? slug) };
  const s = (data.shop || {}) as Record<string, unknown>;
  const r = (s.rating || {}) as Record<string, unknown>;
  return {
    state: 'found',
    signedIn: data.signed_in === true,
    mine: data.mine === true,
    shop: {
      slug: String(s.slug ?? slug),
      name: String(s.name ?? ''),
      town: str(s.town),
      verified: s.verified === true,
      since: str(s.since),
      rating: { avg: num(r.avg), count: num(r.count) },
      hidden_for_others: s.hidden_for_others === true,
    },
    total: num(data.total),
    items: Array.isArray(data.items) ? (data.items as Record<string, unknown>[]).map(toItem).filter((x) => x.id) : [],
    limit: num(data.limit, 6),
  };
}

// ---------------------------------------------------------------- the seller's own link
export async function fetchMine(): Promise<MineRes> {
  const { data, failed } = await call('bambeh_shop_mine');
  if (failed || !data) return { ok: false, reason: 'network' };
  if (data.ok !== true) return { ok: false, reason: String(data.reason ?? 'network') };
  const sug = data.suggestion as Record<string, unknown> | null | undefined;
  return {
    ok: true,
    signedIn: data.signed_in === true,
    shop: data.shop && typeof data.shop === 'object' ? toMyShop(data.shop as Record<string, unknown>) : null,
    itemsTotal: num(data.items_total),
    suggestion: sug && typeof sug === 'object'
      ? { slug: String(sug.slug ?? ''), name: String(sug.name ?? ''), town: str(sug.town) }
      : null,
  };
}

export async function checkSlug(slug: string): Promise<{ ok: boolean; slug: string; free: boolean; reason: string | null }> {
  const { data, failed } = await call('bambeh_shop_check', { p_slug: slug });
  if (failed || !data || data.ok !== true) return { ok: false, slug, free: false, reason: data ? String(data.reason ?? 'network') : 'network' };
  return { ok: true, slug: String(data.slug ?? slug), free: data.free === true, reason: str(data.reason) };
}

export async function saveShop(slug: string, name: string, town: string): Promise<SaveRes> {
  const { data, failed } = await call('bambeh_shop_save', { p_slug: slug, p_name: name, p_town: town || null });
  if (failed || !data) return { ok: false, reason: 'network' };
  if (data.ok !== true) return { ok: false, reason: String(data.reason ?? 'network'), after: str(data.after) || undefined };
  return { ok: true, shop: toMyShop((data.shop || {}) as Record<string, unknown>) };
}

// ---------------------------------------------------------------- Command Center > Shops
export async function adminShops(q: string, state: string): Promise<AdminShopsRes> {
  const { data, failed } = await call('bambeh_admin_shops', { p_q: q.trim() || null, p_state: state });
  if (failed || !data) return { ok: false, reason: 'network' };
  if (data.ok !== true) return { ok: false, reason: String(data.reason ?? 'network') };
  const c = (data.counts || {}) as Record<string, unknown>;
  return {
    ok: true,
    canVerify: data.can_verify === true,
    canHide: data.can_hide === true,
    rows: Array.isArray(data.rows)
      ? (data.rows as Record<string, unknown>[]).map((r) => ({
          ...toMyShop(r),
          owner: String(r.owner ?? ''),
          mine: r.mine === true,
          account_off: r.account_off === true,
          items_total: num(r.items_total),
          log: Array.isArray(r.log)
            ? (r.log as Record<string, unknown>[]).map((g) => ({ what: String(g.what ?? ''), detail: str(g.detail), by: str(g.by), at: String(g.at ?? '') }))
            : [],
        }))
      : [],
    counts: { all: num(c.all), verified: num(c.verified), unverified: num(c.unverified), hidden: num(c.hidden) },
  };
}

export async function adminVerify(user: string, on: boolean, checks: string[], note: string): Promise<{ ok: boolean; reason?: string }> {
  const { data, failed } = await call('bambeh_admin_shop_verify', { p_user: user, p_on: on, p_checks: checks, p_note: note.trim() || null });
  if (failed || !data) return { ok: false, reason: 'network' };
  return data.ok === true ? { ok: true } : { ok: false, reason: String(data.reason ?? 'network') };
}

export async function adminHide(user: string, on: boolean, note: string): Promise<{ ok: boolean; reason?: string }> {
  const { data, failed } = await call('bambeh_admin_shop_hide', { p_user: user, p_on: on, p_note: note.trim() || null });
  if (failed || !data) return { ok: false, reason: 'network' };
  return data.ok === true ? { ok: true } : { ok: false, reason: String(data.reason ?? 'network') };
}
// BAMBEH_END_TOKEN__SHOPAPI_FIX895__COMPLETE
