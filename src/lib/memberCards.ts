// BAMBEH_DEPLOY_TOKEN__MEMBERCARDS_FIX911_CLEAN
/**
 * memberCards.ts - FIX911 (Package 11): reading members without reading their phone numbers.
 *
 * FIX910 closes members' phone numbers, payout numbers and e-mail addresses to the app's public key (an e-mail like
 * 2376xxxxxxxx@phone.bambeh.com IS the phone number). From then on supabase.from('profiles').select('*') is refused,
 * so every page that needs a member reads through here:
 *   - readMyProfile(id)          the signed-in member's own row, numbers included   (bambeh_my_profile)
 *   - readProfileCards(ids)      other members' names and photos, never a number     (bambeh_profile_cards)
 *   - readMyListingContact(id)   the seller's own advert number, for the edit page   (bambeh_my_listing_contact)
 * Each asks the new database function first. Until FIX910 has been run in Supabase that function does not exist yet,
 * and the old read still works - so the app and the database can go live in either order.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { supabase } from '@/lib/supabase';

export type MemberRow = Record<string, unknown>;
type DbError = { code?: string; message?: string } | null | undefined;

/** The function is not in the database yet (FIX910 not run): PostgREST answers PGRST202, Postgres 42883. */
export function isMissingFunction(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: unknown; message?: unknown };
  const code = String(e.code ?? '');
  const msg = String(e.message ?? '');
  return code === 'PGRST202' || code === '42883' || /could not find the function|function .* does not exist/i.test(msg);
}

/** The signed-in member's own profile row (phone and payout number included), or null. */
export async function readMyProfile(userId: string): Promise<{ data: MemberRow | null; error: DbError }> {
  const r = await supabase.rpc('bambeh_my_profile');
  if (!r.error) return { data: (r.data as MemberRow | null) ?? null, error: null };
  if (isMissingFunction(r.error)) {
    const old = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    return { data: (old.data as MemberRow | null) ?? null, error: old.error as DbError };
  }
  return { data: null, error: r.error as DbError };
}

/** Names and photos of other members: id, full_name, display_name, username, avatar_url, name. Never a number. */
export async function readProfileCards(ids: string[]): Promise<MemberRow[]> {
  const list = Array.from(new Set(ids.filter((x) => typeof x === 'string' && x.length > 0)));
  if (list.length === 0) return [];
  const r = await supabase.rpc('bambeh_profile_cards', { p_ids: list });
  if (!r.error) return (r.data as MemberRow[] | null) ?? [];
  if (isMissingFunction(r.error)) {
    const old = await supabase.from('profiles').select('*').in('id', list);
    return (old.data as MemberRow[] | null) ?? [];
  }
  return [];
}

/** The numbers the signed-in seller typed into one of their own adverts (payout_phone, phone, contact_phone), or null. */
export async function readMyListingContact(listingId: string): Promise<MemberRow | null> {
  if (!listingId) return null;
  const r = await supabase.rpc('bambeh_my_listing_contact', { p_listing: listingId });
  if (r.error) return null;
  return (r.data as MemberRow | null) ?? null;
}
// BAMBEH_END_TOKEN__MEMBERCARDS_FIX911__COMPLETE
