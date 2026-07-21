// BAMBEH_DEPLOY_TOKEN__BIOMETRICSERVICE_FIX157_CLEAN
/**
 * biometric.ts — Bambeh biometric service (FIX157)
 * REAL WebAuthn platform-authenticator (fingerprint / face / Windows Hello).
 * NO passwords or keys are ever stored. The passkey lives inside the device's
 * secure hardware; we keep only the public credential id.
 * Login model: biometric UNLOCKS the existing Supabase session (getSession/
 * refreshSession). If the session is fully expired, we return "session_expired"
 * and the UI falls back cleanly to password login.
 * Deploy: C:\Dev\bambe-android\src\services\biometric.ts
 */
import { supabase } from "@/lib/supabase";

const LS_CRED = "bambeh-biometric-credential";
const LS_HINT = "bambeh-biometric-user";

export type BiometricResult = { ok: boolean; error?: string };

/* ---------- base64url helpers ---------- */
function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64(s: string): Uint8Array {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b.length % 4 === 0 ? "" : "=".repeat(4 - (b.length % 4));
  const raw = atob(b + pad);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
function challenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

/* ---------- availability ---------- */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;
    const PKC: any = (window as any).PublicKeyCredential;
    if (!PKC || !navigator.credentials) return false;
    if (typeof PKC.isUserVerifyingPlatformAuthenticatorAvailable !== "function") return false;
    return await PKC.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function hasLocalBiometric(): boolean {
  try {
    return !!window.localStorage.getItem(LS_CRED);
  } catch {
    return false;
  }
}

export function localUserHint(): string | null {
  try {
    return window.localStorage.getItem(LS_HINT);
  } catch {
    return null;
  }
}

/* ---------- enroll (must be signed in) ---------- */
export async function enrollBiometric(): Promise<BiometricResult> {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return { ok: false, error: "not_signed_in" };

    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: challenge() as unknown as BufferSource,
        rp: { name: "Bambeh Marketplace", id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(user.id) as unknown as BufferSource,
          name: user.email || user.id,
          displayName: user.email || "Bambeh user",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;

    if (!cred) return { ok: false, error: "cancelled" };

    const credentialId = toB64(cred.rawId);
    window.localStorage.setItem(LS_CRED, credentialId);
    window.localStorage.setItem(LS_HINT, user.email || "");

    // Server bookkeeping — best-effort, NEVER blocks enrollment.
    try {
      await supabase
        .from("biometric_credentials")
        .insert({ user_id: user.id, credential_id: credentialId });
    } catch {
      /* non-fatal */
    }
    return { ok: true };
  } catch (e: any) {
    const name = e && e.name ? String(e.name) : "";
    if (name === "NotAllowedError") return { ok: false, error: "cancelled" };
    return { ok: false, error: "enroll_failed" };
  }
}

/* ---------- authenticate (unlock existing session) ---------- */
export async function authenticateBiometric(): Promise<BiometricResult> {
  const credId = (() => {
    try {
      return window.localStorage.getItem(LS_CRED);
    } catch {
      return null;
    }
  })();
  if (!credId) return { ok: false, error: "not_enrolled" };

  try {
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: challenge() as unknown as BufferSource,
        timeout: 60000,
        userVerification: "required",
        allowCredentials: [
          {
            type: "public-key",
            id: fromB64(credId) as unknown as BufferSource,
            transports: ["internal"] as AuthenticatorTransport[],
          },
        ],
      },
    })) as PublicKeyCredential | null;
    if (!assertion) return { ok: false, error: "cancelled" };
  } catch (e: any) {
    const name = e && e.name ? String(e.name) : "";
    if (name === "NotAllowedError") return { ok: false, error: "cancelled" };
    return { ok: false, error: "verify_failed" };
  }

  // Device verified the human — now unlock the Supabase session.
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      try {
        await supabase.auth.refreshSession();
      } catch {
        /* refresh best-effort; session still valid */
      }
      return { ok: true };
    }
    return { ok: false, error: "session_expired" };
  } catch {
    return { ok: false, error: "session_expired" };
  }
}

/* ---------- disable ---------- */
export async function disableBiometric(): Promise<void> {
  let credId: string | null = null;
  try {
    credId = window.localStorage.getItem(LS_CRED);
    window.localStorage.removeItem(LS_CRED);
    window.localStorage.removeItem(LS_HINT);
  } catch {
    /* ignore */
  }
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user && credId) {
      await supabase
        .from("biometric_credentials")
        .delete()
        .eq("user_id", data.user.id)
        .eq("credential_id", credId);
    }
  } catch {
    /* non-fatal */
  }
}
// BAMBEH_END_TOKEN__BIOMETRICSERVICE__COMPLETE
