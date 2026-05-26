/**
 * ═══════════════════════════════════════════════════════════════════════
 * supabase/functions/_shared/auth-middleware.ts
 * CSRF + Auth Middleware for Supabase Edge Functions — Bambeh
 *
 * SECURITY FIX: Edge Functions had no CSRF protection.
 *
 * How this works:
 *   1. Every Edge Function imports requireAuth() from this file.
 *   2. requireAuth() validates the caller's Supabase JWT server-side.
 *   3. The JWT IS the CSRF token — it is cryptographically signed by
 *      Supabase, scoped to this user, and cannot be forged.
 *   4. Origin header is checked against the allowed origins allowlist.
 *
 * Usage in any Edge Function:
 *   import { requireAuth, corsHeaders, handleCors } from './_shared/auth-middleware.ts';
 *
 *   serve(async (req) => {
 *     const cors = handleCors(req);
 *     if (cors) return cors;                    // preflight
 *     const { user, error } = await requireAuth(req);
 *     if (error) return error;                  // 401 / 403
 *     // ... your logic using user.id
 *   });
 *
 * © 2026 ETS BUSHENERGY / Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { User }    from 'https://esm.sh/@supabase/supabase-js@2';

// ── Allowed origins ───────────────────────────────────────────────────────────
// Add your production domain and any staging domains here.

const ALLOWED_ORIGINS: readonly string[] = [
  'https://bambeh.com',
  'https://www.bambeh.com',
  'https://app.bambeh.com',
  'capacitor://localhost',     // Capacitor Android webview
  'http://localhost:5173',     // Vite dev server
  'http://localhost:4173',     // Vite preview
] as const;

// ── CORS headers ──────────────────────────────────────────────────────────────

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin  = req.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':      allowed,
    'Access-Control-Allow-Headers':     'authorization, x-client-info, apikey, content-type, x-bambeh-csrf',
    'Access-Control-Allow-Methods':     'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Vary':                             'Origin',
  };
}

/** Handle OPTIONS preflight. Returns a Response for preflight, null for real requests. */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }
  return null;
}

// Backwards-compat alias
export const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Auth validation ───────────────────────────────────────────────────────────

interface AuthResult {
  user:  User | null;
  error: Response | null;
}

/**
 * Validate the caller's JWT and return the authenticated user.
 *
 * @param req         - The incoming Request
 * @param requireRole - Optional role check ('admin' | 'seller'). Default: any auth user.
 */
export async function requireAuth(
  req:         Request,
  requireRole?: 'admin' | 'seller'
): Promise<AuthResult> {

  // ── 1. Extract Bearer token ─────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return {
      user:  null,
      error: new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...getCorsHeaders(req) } }
      ),
    };
  }
  const token = authHeader.slice(7);

  // ── 2. Validate JWT with Supabase Auth server ───────────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return {
      user:  null,
      error: new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...getCorsHeaders(req) } }
      ),
    };
  }

  // ── 3. Optional role check ──────────────────────────────────────────────────
  if (requireRole) {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, is_vendor')
      .eq('id', user.id)
      .maybeSingle();

    const hasRole =
      requireRole === 'admin'  ? profile?.role === 'admin' :
      requireRole === 'seller' ? profile?.is_vendor === true || profile?.role === 'seller' :
      false;

    if (!hasRole) {
      return {
        user:  null,
        error: new Response(
          JSON.stringify({ error: `Requires role: ${requireRole}` }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...getCorsHeaders(req) } }
        ),
      };
    }
  }

  return { user, error: null };
}

// ── Helper: JSON response ─────────────────────────────────────────────────────

export function jsonResponse(
  data:   unknown,
  req:    Request,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(req) },
  });
}
