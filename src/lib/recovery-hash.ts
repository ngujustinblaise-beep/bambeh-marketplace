/**
 * src/lib/recovery-hash.ts — FIX378
 * Supabase recovery links arrive as  https://app.bambeh.com/#access_token=...&type=recovery
 * HashRouter treats that as a route name and lands the user on Home, destroying
 * the token. This runs BEFORE React and before the Supabase client initialises:
 * it stashes the tokens, then rewrites the hash to a route that actually exists.
 */
export const BAMBEH_RECOVERY_STASH = "bambeh_recovery_tokens";

(function captureRecoveryHash() {
  if (typeof window === "undefined") return;

  const raw = window.location.hash.replace(/^#\/?/, "");
  if (!raw) return;
  if (!raw.includes("access_token=") && !raw.includes("type=recovery") && !raw.includes("error_code=")) return;

  const p = new URLSearchParams(raw);
  const payload = {
    access_token:      p.get("access_token")      ?? "",
    refresh_token:     p.get("refresh_token")     ?? "",
    type:              p.get("type")              ?? "",
    error_code:        p.get("error_code")        ?? "",
    error_description: p.get("error_description") ?? "",
  };

  if (!payload.access_token && !payload.error_code) return;

  try { sessionStorage.setItem(BAMBEH_RECOVERY_STASH, JSON.stringify(payload)); } catch { /* storage blocked */ }

  // replaceState, not location.hash: keeps the token out of browser history.
  window.history.replaceState(null, "", window.location.pathname + window.location.search + "#/security-recovery");
  console.info("[FIX378] recovery link captured -> /security-recovery");
})();