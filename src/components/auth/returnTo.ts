// BAMBEH_DEPLOY_TOKEN__RETURN_TO_FIX755_CLEAN
/**
 * src/components/auth/returnTo.ts - FIX755 (new)
 *
 * WHERE TO GO AFTER SIGNING IN OR CREATING AN ACCOUNT: back to what she was doing, never "Home" by default.
 * Before: the sign-in page always opened Home (FIX656), so a person stopped at a locked page - an item,
 * the advert form, a free service - had to find it again after signing in.
 *
 * The order:
 *   1. ?next=/page in the address (links in adverts, WhatsApp statuses, field agents' QR codes)
 *   2. the page that sent her here (the router's "from", as FreeServiceGate, Taxi check and AuthGate pass it)
 *   3. a shared link noted before the first screens (LinkReturn, FIX752)
 *   4. Home
 * Only a page inside the app (cleanPath, FIX752): never another website, a payment page, or a sign-in page.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { cleanPath, savedLink } from './LinkReturn';

/** The path inside a router state { from: "/x" } or { from: { pathname, search } }. */
export function pathFromState(state: unknown): string {
  if (!state || typeof state !== 'object') return '';
  const from = (state as { from?: unknown }).from;
  if (typeof from === 'string') return from;
  if (from && typeof from === 'object') {
    const f = from as { pathname?: unknown; search?: unknown };
    if (typeof f.pathname === 'string') return f.pathname + (typeof f.search === 'string' ? f.search : '');
  }
  return '';
}

/** The value of ?next= in a search string ("?next=%2Fpharmacies"), or ''. */
export function nextParam(search: string): string {
  try {
    return new URLSearchParams(search || '').get('next') || '';
  } catch {
    return '';
  }
}

/** A page she may be sent back to, or null (outside the app, a sign-in page, the join page itself). */
export function returnable(raw: string): string | null {
  const c = cleanPath(raw);
  if (!c) return null;
  const page = c.split('?')[0].split('#')[0].replace(/\/+$/, '').toLowerCase();
  if (page === '/join' || page.indexOf('/join/') === 0) return null;
  return c;
}

/** The page to open after signing in or joining. It only reads: the caller forgets the noted link once she is in. */
export function returnTarget(state: unknown, search: string): string {
  return returnable(nextParam(search)) || returnable(pathFromState(state)) || returnable(savedLink() || '') || '/';
}
// BAMBEH_END_TOKEN__RETURN_TO_FIX755__COMPLETE
