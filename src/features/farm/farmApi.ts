// BAMBEH_DEPLOY_TOKEN__FARMAPI_FIX864_CLEAN
// FILE LOCATION: src/features/farm/farmApi.ts
//
// FIX864 - what the Farm Fresh pages read. Everything comes from the database functions of FIX861
// (bambeh_farm_products / bambeh_farm_product / bambeh_farm_viewed): products for sale, the farmer's name and
// "verified" badge, sold out - and never a phone number. If FIX861 has not been run yet, the pages read the table
// the way the old page did, so Farm Fresh never shows a broken screen.
// The PRICE a buyer pays is not decided here: the payments server reads it from the product (FIX862).
// The farmer's stars come from the reviews buyers leave on the rating page (fetchFarmerRating).
// (c) 2026 BAMBEH SARL. All rights reserved.

import { supabase } from '@/lib/supabase';

export interface FarmCard {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  unit: string;
  category: string;
  location: string | null;
  image: string | null;
  images: string[];
  is_organic: boolean;
  delivery: boolean;
  stock: number | null;
  sold_out: boolean;
  harvest_date: string | null;
  views: number;
  created_at: string | null;
  seller_id: string | null;
  farmer_name: string | null;
  farmer_verified: boolean;
  farmer_photo: string | null;
  farmer_place: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isFarmId(id: unknown): boolean {
  return UUID_RE.test(String(id ?? ''));
}

function notReady(msg: unknown): boolean {
  return /does not exist|could not find the function|schema cache|PGRST202/i.test(String(msg || ''));
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: unknown): string | null {
  const s = v === null || v === undefined ? '' : String(v).trim();
  return s ? s : null;
}

/** One product as the pages use it, from either the database function or a raw row (old database). */
export function toCard(d: Record<string, unknown>): FarmCard {
  const imgs = Array.isArray(d.images) ? (d.images as unknown[]).map((x) => String(x || '').trim()).filter(Boolean) : [];
  const image = str(d.image) || str(d.image_url) || imgs[0] || null;
  if (image && imgs.indexOf(image) < 0) imgs.unshift(image);
  const stock = num(d.stock !== undefined ? d.stock : d.stock_quantity);
  const price = num(d.price_per_unit_xaf) ?? num(d.price);
  return {
    id: String(d.id ?? ''),
    title: str(d.title) || str(d.name) || 'Farm produce',
    description: str(d.description),
    price: price !== null && price > 0 ? Math.round(price) : null,
    unit: str(d.unit) || 'unit',
    category: str(d.category) || 'Other',
    location: str(d.location),
    image,
    images: imgs,
    is_organic: d.is_organic === true,
    delivery: d.delivery === true || d.available_for_delivery === true,
    stock,
    sold_out: d.sold_out === true || (stock !== null && stock <= 0),
    harvest_date: str(d.harvest_date),
    views: num(d.views !== undefined ? d.views : d.view_count) || 0,
    created_at: str(d.created_at),
    seller_id: str(d.seller_id) || str(d.farmer_id),
    farmer_name: str(d.farmer_name),
    farmer_verified: d.farmer_verified === true,
    farmer_photo: str(d.farmer_photo),
    farmer_place: str(d.farmer_place),
  };
}

function forSale(d: Record<string, unknown>): boolean {
  if (d.is_available === false || d.deleted_at) return false;
  const st = String(d.status ?? 'active').toLowerCase();
  return ['deleted', 'removed', 'hidden', 'inactive', 'draft', 'rejected', 'suspended'].indexOf(st) < 0;
}

function matches(c: FarmCard, category: string | null, q: string | null): boolean {
  if (category && c.category.toLowerCase() !== category.toLowerCase()) return false;
  if (!q) return true;
  const hay = [c.title, c.description, c.location, c.category, c.farmer_name].join(' ').toLowerCase();
  return hay.indexOf(q.toLowerCase()) >= 0;
}

export type FarmList = { ok: true; items: FarmCard[] } | { ok: false };

export async function fetchFarmProducts(opts: { category?: string | null; q?: string | null } = {}): Promise<FarmList> {
  const category = opts.category && opts.category !== 'All' ? opts.category : null;
  const q = opts.q && opts.q.trim() ? opts.q.trim() : null;
  try {
    const { data, error } = await supabase.rpc('bambeh_farm_products', { p_category: category, p_q: q, p_limit: 120 });
    if (!error && Array.isArray(data)) {
      return { ok: true, items: (data as Record<string, unknown>[]).map(toCard).filter((c) => c.id && c.price !== null) };
    }
    if (error && !notReady((error as { message?: string }).message)) return { ok: false };
  } catch {
    /* fall through to the table */
  }
  try {
    const { data, error } = await supabase.from('farm_products').select('*').eq('is_available', true)
      .order('created_at', { ascending: false }).limit(120);
    if (error || !Array.isArray(data)) return { ok: false };
    const items = (data as Record<string, unknown>[]).filter(forSale).map(toCard)
      .filter((c) => c.id && c.price !== null && matches(c, category, q));
    items.sort((a, b) => Number(!a.image) - Number(!b.image) || Number(a.sold_out) - Number(b.sold_out));
    return { ok: true, items };
  } catch {
    return { ok: false };
  }
}

export type FarmOne =
  | { ok: true; product: FarmCard; more: FarmCard[]; sameFarmer: FarmCard[] }
  | { ok: false; reason: 'not_found' | 'network' };

export async function fetchFarmProduct(id: string): Promise<FarmOne> {
  if (!isFarmId(id)) return { ok: false, reason: 'not_found' };
  try {
    const { data, error } = await supabase.rpc('bambeh_farm_product', { p_id: id });
    if (!error && data && typeof data === 'object') {
      const d = data as { ok?: boolean; product?: Record<string, unknown>; more?: unknown[]; same_farmer?: unknown[] };
      if (!d.ok || !d.product) return { ok: false, reason: 'not_found' };
      const list = (x: unknown[] | undefined) => (Array.isArray(x) ? (x as Record<string, unknown>[]).map(toCard).filter((c) => c.price !== null) : []);
      const product = toCard(d.product);
      if (product.price === null) return { ok: false, reason: 'not_found' };
      return { ok: true, product, more: list(d.more), sameFarmer: list(d.same_farmer) };
    }
    if (error && !notReady((error as { message?: string }).message)) return { ok: false, reason: 'network' };
  } catch {
    /* fall through to the table */
  }
  try {
    const { data, error } = await supabase.from('farm_products').select('*').eq('id', id).maybeSingle();
    if (error) return { ok: false, reason: 'network' };
    if (!data || !forSale(data as Record<string, unknown>)) return { ok: false, reason: 'not_found' };
    const product = toCard(data as Record<string, unknown>);
    if (product.price === null) return { ok: false, reason: 'not_found' };
    return { ok: true, product, more: [], sameFarmer: [] };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/** One view, counted by the database (a buyer's phone cannot write the product). Never throws. */
export async function farmViewed(id: string): Promise<void> {
  try {
    await supabase.rpc('bambeh_farm_viewed', { p_id: id });
  } catch {
    /* a view count never stops the page */
  }
}

/**
 * The farmer's stars: every rating buyers gave this farmer (the same reviews the marketplace and the review list
 * read - FIX326, FIX341). null when they cannot be read; { avg: 0, count: 0 } when nobody has rated yet.
 */
export async function fetchFarmerRating(sellerId: string | null): Promise<{ avg: number; count: number } | null> {
  if (!sellerId || !isFarmId(sellerId)) return null;
  try {
    const { data, error } = await supabase.from('reviews').select('rating').eq('target_id', sellerId).limit(1000);
    if (error || !Array.isArray(data)) return null;
    const scores = (data as { rating?: unknown }[]).map((r) => Number(r.rating)).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
    if (!scores.length) return { avg: 0, count: 0 };
    return { avg: scores.reduce((a, b) => a + b, 0) / scores.length, count: scores.length };
  } catch {
    return null;
  }
}

/** What the cart and the checkout need to know about one product, so the payments server can check it. */
export function cartLine(p: FarmCard, quantity: number) {
  return {
    id: p.id,
    listingId: p.id,
    listingType: 'farm-fresh',
    sellerId: p.seller_id || '',
    sellerName: p.farmer_name || 'Farmer',
    title: p.title,
    priceXAF: p.price || 0,
    quantity: Math.max(1, Math.round(quantity)),
    imageUrl: p.image || undefined,
  };
}
// BAMBEH_END_TOKEN__FARMAPI_FIX864__COMPLETE
