// BAMBEH_DEPLOY_TOKEN__RECOVERY_HASH_FIX382_CLEAN
/**
 * src/lib/recovery-hash.ts - FIX382 (supersedes FIX378)
 *
 * WHAT CHANGED AND WHY
 *   FIX378 assumed Supabase sends recovery tokens in the URL HASH:
 *       https://app.bambeh.com/#access_token=...&type=recovery
 *   Supabase has moved to the PKCE flow. It now sends them in the QUERY STRING:
 *       https://app.bambeh.com/?code=a942a842-a015-...#/security-recovery
 *   FIX378 only read window.location.hash, so the code was never picked up and
 *   the user landed back on the "enter your email" form. Proven by the live URL.
 *
 * WHAT THIS DOES
 *   Runs BEFORE React mounts and BEFORE the Supabase client initialises.
 *   Captures whichever shape arrived - ?code=, #access_token=, or an error -
 *   stashes it, and rewrites the URL to a route that exists.
 *   We capture rather than read-in-place because supabase-js may clear the URL
 *   itself the moment it wakes up, and then the page has nothing left to use.
 *
 *   MUST be the first import in main.tsx. Order is the whole point.
 */

export const BAMBEH_RECOVERY_STASH = "bambeh_recovery_tokens";

(function captureRecovery() {
  if (typeof window === "undefined") return;

  const payload: Record<string, string> = {};

  // ---- 1. PKCE: ?code=... in the query string -----------------------------
  try {
    const q = new URLSearchParams(window.location.search || "");
    const code = q.get("code") || "";
    const qErrCode = q.get("error_code") || q.get("error") || "";
    const qErrDesc = q.get("error_description") || "";
    if (code) payload.code = code;
    if (qErrCode) payload.error_code = qErrCode;
    if (qErrDesc) payload.error_description = qErrDesc;
  } catch {
    /* malformed query - fall through to the hash check */
  }

  // ---- 2. Implicit: #access_token=... in the hash --------------------------
  const rawHash = (window.location.hash || "").replace(/^#\/?/, "");
  if (
    rawHash.indexOf("access_token=") !== -1 ||
    rawHash.indexOf("type=recovery") !== -1 ||
    rawHash.indexOf("error_code=") !== -1
  ) {
    try {
      const h = new URLSearchParams(rawHash);
      const at = h.get("access_token") || "";
      const rt = h.get("refresh_token") || "";
      const ty = h.get("type") || "";
      const hErrCode = h.get("error_code") || "";
      const hErrDesc = h.get("error_description") || "";
      if (at) payload.access_token = at;
      if (rt) payload.refresh_token = rt;
      if (ty) payload.type = ty;
      if (hErrCode && !payload.error_code) payload.error_code = hErrCode;
      if (hErrDesc && !payload.error_description) payload.error_description = hErrDesc;
    } catch {
      /* malformed hash - nothing to capture */
    }
  }

  const hasSomething =
    !!payload.code || !!payload.access_token || !!payload.error_code;

  if (!hasSomething) return;

  try {
    sessionStorage.setItem(BAMBEH_RECOVERY_STASH, JSON.stringify(payload));
  } catch {
    /* storage blocked - the page shows a clear error instead of a blank one */
  }

  // replaceState, not location.hash: keeps the token out of browser history.
  window.history.replaceState(
    null,
    "",
    window.location.pathname + "#/security-recovery"
  );

  console.info("[FIX382] recovery captured -> /security-recovery");
})();
// BAMBEH_END_TOKEN__RECOVERY_HASH__COMPLETE
