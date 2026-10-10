// BAMBEH_DEPLOY_TOKEN__FOOD_GAS_API_FIX689_CLEAN
/**
 * src/features/foodgas/foodGasApi.ts - FIX689
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
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { supabase } from '@/lib/supabase';
import type { CityKey, FoodKind } from './foodGasText';

export type PlaceStatus = 'pending' | 'live' | 'rejected' | 'hidden';
export type BookingKind = 'table' | 'order' | 'gas';
export type BookingStatus = 'sent' | 'confirmed' | 'declined' | 'cancelled';

export interface FoodPreviewItem { name: string; price_xaf: number | null }

export interface FoodCard {
  id: string;
  name: string;
  kinds: FoodKind[];
  city: CityKey;
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
}

export interface AreaCount { area: string; area_label: string; city: CityKey; n: number }

export interface PlaceInput {
  name: string;
  kinds: FoodKind[];
  description: string;
  city: CityKey;
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
export function listPlaces(p: {
  city?: string | null; area?: string | null; kind?: string | null; query?: string | null;
  gasToday?: boolean; limit?: number; offset?: number;
}): Promise<Res<{ total: number; rows: FoodCard[]; areas: AreaCount[]; today: string }>> {
  return foodRpc('bambeh_food_list', {
    p_city: p.city || null,
    p_area: p.area || null,
    p_kind: p.kind || null,
    p_query: p.query && p.query.trim() ? p.query.trim().slice(0, 60) : null,
    p_gas_today: !!p.gasToday,
    p_limit: p.limit ?? 30,
    p_offset: p.offset ?? 0,
  });
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
}): Promise<Res<{ booking_id: string; conversation_id: string }>> {
  return foodRpc('bambeh_food_book', {
    p_place: a.placeId, p_kind: a.kind, p_want_at: a.wantAt, p_people: a.people, p_items: a.items,
    p_delivery: a.delivery, p_note: a.note, p_message: a.message,
  });
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
// BAMBEH_END_TOKEN__FOOD_GAS_API_FIX689__COMPLETE
