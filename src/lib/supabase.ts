import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

/**
 * Auth configuration is EXPLICIT here for a reason.
 *
 * Bambeh runs on HashRouter (bambeh.com/#/...). Supabase, by default, tries to
 * read auth tokens out of the URL hash (detectSessionInUrl). Because our router
 * ALSO owns the hash, the two collide and the session can fail to persist -
 * which is why the Header showed "logged in" (React state) while the cart's
 * supabase.auth.getSession() came back empty ("Sign in required to checkout").
 *
 *  - persistSession:     store the session in localStorage so it survives reloads
 *  - autoRefreshToken:   silently refresh the access token before it expires
 *  - detectSessionInUrl: FALSE - we sign in with password, not magic-link hash
 *                        tokens, so we never want Supabase touching our router hash
 *  - storageKey:         a stable, app-specific key
 *  - flowType 'pkce':    the modern, secure auth flow
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "bambeh-auth",
    flowType: "pkce",
  },
});
