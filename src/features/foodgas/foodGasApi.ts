// BAMBEH_DEPLOY_TOKEN__FOOD_GAS_API_FIX791_CLEAN
/**
 * src/features/foodgas/foodGasApi.ts - FIX791 (replaces FIX699)
 *
 * FIX791 (Big, 15 Oct 2026): search by REGION and TOWN (any town of Cameroon, FIX788), the towns that have
 * businesses, and the region and town sent with a business. Before FIX788 is run in Supabase the search
 * falls back to the five launch cities, so the page never breaks while the database catches up.
 *
 * GAS & FOOD - the only door between the pages and the database (FIX687).
 * Every call answers { ok: true, ... } or { ok: false, reason }, and the pages turn
 * the reason into a sentence in the user's language (reasonText in foodGasText).
 *
 *   - search and details, add / edit a business, the menu, "gas available today"
 *   - chat with a business (Bambeh chat only) and bookings (table, order ahead, gas)
 *   - featured at the top of the neighbourhood, paid by mobile money through the
 *     same payments server as the rest of Bambeh; the payment itself switches it on
 *   - photos: shrunk on the phone (a 4 MB picture becomes about 200 KB), then stored
 *     in the public "food-places" bucket under the uploader's own folder
 *   - FIX699 (database FIX697): the gas each seller has (brand, bottle size, refill and
 *     new-bottle prices, in stock), gas orders on those lines, the meats a grill cooks
 *     and the local dishes; the search takes brand, size, meat and dish filters.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { supabase } from '@/lib/supabase';
import { launchCityOf } from './foodGasText';
import type { CityKey, FoodKind, GasBrand, Meat } from './foodGasText';

export type PlaceStatus = 'pending' | 'live' | 'rejected' | 'hidden';
export type BookingKind = 'table' | 'order' | 'gas';
export type BookingStatus = 'sent' | 'confirmed' | 'declined' | 'cancelled';

export interface FoodPreviewItem { name: string; price_xaf: number | null }

/** One line of a seller's gas list (FIX697). */
export interface GasOffer {
  id: string;
  brand: GasBrand;
  brand_other: string;
  label: string;
  size_kg: number;
  refill_xaf: number | null;
  full_xaf: number | null;
  in_stock: boolean;
}

export interface GasOfferInput {
  id?: string;
  brand: GasBrand;
  brand_other: string;
  size_kg: number;
  refill_xaf: number | null;
  full_xaf: number | null;
  in_stock: boolean;
}

export type GasMode = 'refill' | 'full';

/** What a gas order was, worked out by the database from the seller's line. */
export interface GasOrderDetails {
  offer_id: string;
  brand: GasBrand;
  label: string;
  size_kg: number;
  mode: GasMode;
  quantity: number;
  unit_xaf: number | null;
  total_xaf: number | null;
}

export interface FoodCard {
  id: string;
  name: string;
  kinds: FoodKind[];
  /** a launch city key; outside the five cities the database sends the town's name here (FIX788) */
  city: CityKey;
  /** FIX788: the region key (centre, nord_ouest...) and the town */
  region?: string | null;
  town?: string | null;
  area: string;
  area_label: string;
  photo: string | null;
  key_price_xaf: number | null;
  key_price_label: string;
  gas_today: boolean;
  gas_checked_at: string | null;
  open_days: number[];
  opens_at: string | null;
  closes_at: string | null;
  featured: boolean;
  takes_bookings: boolean;
  delivers: boolean;
  preview: FoodPreviewItem[];
  meats?: Meat[];
  dishes?: string[];
  dish_count?: number;
  offers?: GasOffer[];
  offer_count?: number;
}

export interface FoodItem {
  id?: string;
  name: string;
  price_xaf: number | null;
  note: string;
  available: boolean;
}

export interface FoodPlace extends FoodCard {
  description: string;
  landmark: string;
  photos: string[];
  gas_available: boolean;
  created_at: string;
  items: FoodItem[];
  status?: PlaceStatus;
  hidden_by?: 'owner' | 'staff' | null;
  needs_review?: boolean;
  review_note?: string | null;
  reviewed_at?: string | null;
  reviewed_by_name?: string | null;
  featured_until?: string | null;
  owner_name?: string | null;
  agent_name?: string | null;
  meats_saved?: Meat[];
  dishes_saved?: string[];
}

export interface FoodMe {
  is_owner: boolean;
  is_agent: boolean;
  is_staff: boolean;
  can_edit: boolean;
  can_book: boolean;
  can_chat: boolean;
}

export interface MyPlace extends FoodCard {
  status: PlaceStatus;
  hidden_by: 'owner' | 'staff' | null;
  needs_review: boolean;
  review_note: string | null;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
  approved_at: string | null;
  featured_until: string | null;
  gas_available: boolean;
  my_role: 'owner' | 'agent';
  owner_name: string | null;
  items_count: number;
  open_bookings: number;
  gas_offers?: GasOffer[];
  created_at: string;
}

export interface FoodBooking {
  id: string;
  place_id: string;
  place_name: string;
  area_label: string;
  kind: BookingKind;
  want_at: string;
  people: number | null;
  items: string;
  delivery: boolean;
  note: string;
  status: BookingStatus;
  conversation_id: string | null;
  created_at: string;
  answered_at: string | null;
  buyer_name: string | null;
  details?: GasOrderDetails | null;
}

export interface AreaCount { area: string; area_label: string; city: CityKey; town?: string; n: number }
/** FIX791: a town that has businesses (in the chosen region), with how many */
export interface TownCount { town: string; region: string; n: number }
export interface BrandCount { brand: GasBrand; label: string; n: number }
export interface SizeCount { size_kg: number; n: number }
export interface MeatCount { meat: Meat; n: number }
export interface DishCount { dish: string; n: number }

export interface PlaceInput {
  name: string;
  kinds: FoodKind[];
  description: string;
  /** a launch city, or 'other' (FIX788) - an older database only knows the five cities */
  city: CityKey | 'other';
  /** FIX791: the region key and any town of Cameroon */
  region?: string;
  town?: string;
  area: string;
  area_label: string;
  landmark: string;
  photos: string[];
  open_days: number[];
  opens_at: string;
  closes_at: string;
  key_price_xaf: number | null;
  key_price_label: string;
  takes_bookings: boolean;
  delivers: boolean;
  owner_identifier?: string;
  agent_identifier?: string;
  meats?: Meat[];
  dishes?: string[];
}

export interface Fail { ok: false; reason: string; detail?: string }
export type Res<T> = ({ ok: true } & T) | Fail;

/** One database function; never throws. */
export async function foodRpc<T>(fn: string, args?: Record<string, unknown>): Promise<Res<T>> {
  try {
    const { data, error } = await supabase.rpc(fn, args ?? {});
    if (error) {
      const msg = String(error.message || '');
      if (/failed to fetch|networkerror|network request failed|load failed/i.test(msg)) return { ok: false, reason: 'network', detail: msg };
      if (/does not exist|could not find the function/i.test(msg)) return { ok: false, reason: 'not_installed', detail: msg };
      return { ok: false, reason: 'generic', detail: msg };
    }
    const d = data as ({ ok?: unknown; reason?: unknown; detail?: unknown } & Record<string, unknown>) | null;
    if (!d || typeof d !== 'object') return { ok: false, reason: 'generic' };
    if (d.ok !== true) {
      return { ok: false, reason: String(d.reason || 'generic'), detail: typeof d.detail === 'string' ? d.detail : undefined };
    }
    return d as unknown as Res<T>;
  } catch (e) {
    return { ok: false, reason: 'network', detail: e instanceof Error ? e.message : String(e) };
  }
}

// ------------------------------------------------------------------ buyers
export interface ListResult {
  total: number;
  rows: FoodCard[];
  areas: AreaCount[];
  /** FIX791: the towns that have such businesses */
  towns?: TownCount[];
  today: string;
  brands?: BrandCount[];
  sizes?: SizeCount[];
  meats?: MeatCount[];
  dishes?: DishCount[];
}

/** kind: 'gas' (Cooking gas page), 'food' (Food page: restaurants, grills, roasted fish) or one kind.
 *  FIX791: region (key) and town (any town, accents ignored) - sent only when chosen. */
export async function listPlaces(p: {
  city?: string | null; area?: string | null; kind?: string | null; query?: string | null;
  gasToday?: boolean; limit?: number; offset?: number;
  brand?: string | null; size?: number | null; meat?: string | null; dish?: string | null;
  region?: string | null; town?: string | null;
}): Promise<Res<ListResult>> {
  const region = p.region ? String(p.region) : '';
  const town = p.town && p.town.trim() ? p.town.trim().slice(0, 60) : '';
  const r = await listPlacesRaw(p, region, town);
  if (r.ok || r.reason !== 'not_installed' || (!region && !town)) return r;
  // FIX788 not run yet: the five launch cities still work; anywhere else there is nothing to show yet
  const city = launchCityOf(region, town);
  if (!town || city === 'other') return { ok: true, total: 0, rows: [], areas: [], towns: [], today: '' };
  return listPlacesRaw({ ...p, city }, '', '');
}

function listPlacesRaw(p: {
  city?: string | null; area?: string | null; kind?: string | null; query?: string | null;
  gasToday?: boolean; limit?: number; offset?: number;
  brand?: string | null; size?: number | null; meat?: string | null; dish?: string | null;
}, region: string, town: string): Promise<Res<ListResult>> {
  const args: Record<string, unknown> = {
    p_city: p.city || null,
    p_area: p.area || null,
    p_kind: p.kind || null,
    p_query: p.query && p.query.trim() ? p.query.trim().slice(0, 60) : null,
    p_gas_today: !!p.gasToday,
    p_limit: p.limit ?? 30,
    p_offset: p.offset ?? 0,
  };
  // the FIX697 filters are only sent when used
  if (p.brand) args.p_brand = p.brand;
  if (typeof p.size === 'number' && isFinite(p.size) && p.size > 0) args.p_size = p.size;
  if (p.meat) args.p_meat = p.meat;
  if (p.dish) args.p_dish = p.dish.slice(0, 40);
  // FIX791: only when chosen, so the search works the same before FIX788 is run
  if (region) args.p_region = region;
  if (town) args.p_town = town;
  return foodRpc('bambeh_food_list', args);
}

export function getPlace(id: string): Promise<Res<{ place: FoodPlace; me: FoodMe }>> {
  return foodRpc('bambeh_food_place', { p_id: id });
}

export function openChat(placeId: string): Promise<Res<{ conversation_id: string }>> {
  return foodRpc('bambeh_food_chat', { p_place: placeId });
}

export function book(a: {
  placeId: string; kind: BookingKind; wantAt: string; people: number | null; items: string;
  delivery: boolean; note: string; message: string;
  gas?: { offerId: string; quantity: number; mode: GasMode } | null;
}): Promise<Res<{ booking_id: string; conversation_id: string; details?: GasOrderDetails | null }>> {
  const args: Record<string, unknown> = {
    p_place: a.placeId, p_kind: a.kind, p_want_at: a.wantAt, p_people: a.people, p_items: a.items,
    p_delivery: a.delivery, p_note: a.note, p_message: a.message,
  };
  // FIX697: an order on one of the seller's gas lines - the price is worked out by the database
  if (a.gas) args.p_details = { offer_id: a.gas.offerId, quantity: a.gas.quantity, mode: a.gas.mode };
  return foodRpc('bambeh_food_book', args);
}

export function listBookings(role: 'owner' | 'buyer'): Promise<Res<{ rows: FoodBooking[] }>> {
  return foodRpc('bambeh_food_bookings', { p_role: role });
}

export function answerBooking(id: string, accept: boolean, message: string): Promise<Res<{ status: BookingStatus; conversation_id: string | null }>> {
  return foodRpc('bambeh_food_booking_answer', { p_booking: id, p_accept: accept, p_message: message });
}

export function cancelBooking(id: string, message: string): Promise<Res<{ status: BookingStatus; conversation_id: string | null }>> {
  return foodRpc('bambeh_food_booking_cancel', { p_booking: id, p_message: message });
}

// ------------------------------------------------------------------ owners and agents
export function savePlace(id: string | null, data: PlaceInput): Promise<Res<{ id: string; status: PlaceStatus; needs_review: boolean; owner_name?: string }>> {
  return foodRpc('bambeh_food_save_place', { p_id: id, p_data: data });
}

export function saveItems(placeId: string, items: FoodItem[]): Promise<Res<{ count: number }>> {
  return foodRpc('bambeh_food_save_items', {
    p_place: placeId,
    p_items: items.map((i) => ({ name: i.name, price_xaf: i.price_xaf, note: i.note, available: i.available })),
  });
}

/** The seller's whole gas list (30 lines at most); each line keeps its id. Also today's gas answer. */
export function saveGas(placeId: string, offers: GasOfferInput[]): Promise<Res<{
  count: number; gas_available: boolean; gas_checked_at: string | null; offers: GasOffer[];
}>> {
  return foodRpc('bambeh_food_save_gas', {
    p_place: placeId,
    p_offers: offers.map((o) => ({
      id: o.id || null, brand: o.brand, brand_other: o.brand === 'OTHER' ? o.brand_other : '', size_kg: o.size_kg,
      refill_xaf: o.refill_xaf, full_xaf: o.full_xaf, in_stock: o.in_stock,
    })),
  });
}

/** One tap: this bottle is in stock / out of stock today. */
export function setOfferStock(offerId: string, inStock: boolean): Promise<Res<{ in_stock: boolean; gas_available: boolean; gas_checked_at: string }>> {
  return foodRpc('bambeh_food_gas_stock', { p_offer: offerId, p_in_stock: inStock });
}

export function setGas(placeId: string, available: boolean): Promise<Res<{ gas_available: boolean; gas_checked_at: string }>> {
  return foodRpc('bambeh_food_set_gas', { p_place: placeId, p_available: available });
}

export function setVisible(placeId: string, visible: boolean): Promise<Res<{ status: PlaceStatus }>> {
  return foodRpc('bambeh_food_set_visible', { p_place: placeId, p_visible: visible });
}

export function myPlaces(): Promise<Res<{ rows: MyPlace[] }>> {
  return foodRpc('bambeh_food_my_places');
}

// ------------------------------------------------------------------ featured at the top of the neighbourhood
export type FeaturePlan = 'day' | 'week' | 'month';
export type FeatureStatus = 'pending' | 'paid' | 'granted' | 'failed' | 'underpaid' | 'expired';

export function featureStart(placeId: string, plan: FeaturePlan, days?: number): Promise<Res<{
  order_id: string; external_ref: string; amount: number; days: number; plan: FeaturePlan; description: string;
}>> {
  return foodRpc('bambeh_food_feature_start', { p_place: placeId, p_plan: plan, p_days: plan === 'day' ? (days ?? 2) : null });
}

export function featureStatus(orderId: string): Promise<Res<{
  status: FeatureStatus; amount: number; days: number; starts_at: string | null; ends_at: string | null; featured_until: string | null;
}>> {
  return foodRpc('bambeh_food_feature_status', { p_order: orderId });
}

const PROJECT_FALLBACK = 'https://rbjbdxefwzvgmioearie.supabase.co';

/** The payments server (same project as the app); never an arbitrary address. */
function paymentsBase(): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
  for (const c of [env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PROJECT_URL, PROJECT_FALLBACK]) {
    if (!c) continue;
    const clean = c.replace(/\/+$/, '');
    if (/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(clean)) return clean + '/functions/v1/payments';
  }
  return PROJECT_FALLBACK + '/functions/v1/payments';
}

/**
 * Ask mobile money for the featured price. The amount and the reference come from the
 * database (featureStart); the database switches the feature on only when the payment
 * record says SUCCESSFUL for at least that amount.
 */
export async function payWithMomo(order: { external_ref: string; amount: number; description: string },
                                   phone9: string): Promise<{ ok: true; reference: string | null } | { ok: false; error: string }> {
  try {
    const { data: s } = await supabase.auth.getSession();
    const token = s?.session?.access_token;
    if (!token) return { ok: false, error: 'not_signed_in' };
    const res = await fetch(paymentsBase() + '/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        phone: '237' + phone9,
        amount: order.amount,
        description: order.description,
        externalRef: order.external_ref,
        metadata: { user_id: s?.session?.user?.id ?? null },
      }),
    });
    const raw = await res.text();
    let j: Record<string, unknown> | null = null;
    try { j = raw ? (JSON.parse(raw) as Record<string, unknown>) : null; } catch { j = null; }
    if (!res.ok || !j || j.success !== true) {
      const err = (j && typeof j.error === 'string' && j.error) || raw || 'HTTP ' + res.status;
      return { ok: false, error: String(err).slice(0, 200) };
    }
    const d = (j.data ?? {}) as { reference?: unknown };
    return { ok: true, reference: typeof d.reference === 'string' ? d.reference : null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network' };
  }
}

// ------------------------------------------------------------------ photos
const FOOD_BUCKET = 'food-places';
const MAX_PICK_BYTES = 15 * 1024 * 1024;
const MAX_SEND_BYTES = 3 * 1024 * 1024;

/** Shrink a camera photo before it leaves the phone (3G is paid by the megabyte). */
export async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (typeof bitmap.close === 'function') bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.78));
  if (!blob) throw new Error('no picture');
  return blob;
}

export async function uploadPhoto(uid: string, file: File): Promise<{ ok: true; url: string } | Fail> {
  if (!file || !String(file.type || '').startsWith('image/') || file.size > MAX_PICK_BYTES) return { ok: false, reason: 'bad_photos' };
  let blob: Blob = file;
  try { blob = await compressPhoto(file); } catch { blob = file; }
  if (blob.size > MAX_SEND_BYTES) return { ok: false, reason: 'bad_photos' };
  const type = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
  const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  const path = uid + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  try {
    const { error } = await supabase.storage.from(FOOD_BUCKET).upload(path, blob, { contentType: type, upsert: false, cacheControl: '31536000' });
    if (error) return { ok: false, reason: 'upload', detail: error.message };
    const { data } = supabase.storage.from(FOOD_BUCKET).getPublicUrl(path);
    return data && data.publicUrl ? { ok: true, url: data.publicUrl } : { ok: false, reason: 'upload' };
  } catch (e) {
    return { ok: false, reason: 'upload', detail: e instanceof Error ? e.message : String(e) };
  }
}
// BAMBEH_END_TOKEN__FOOD_GAS_API_FIX791__COMPLETE
