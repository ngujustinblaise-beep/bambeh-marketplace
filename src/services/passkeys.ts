import { supabase } from "@/lib/supabase";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

/**
 * BAMBEH passkeys service (REAL WebAuthn - no longer a stub).
 * Enroll and verify run while the user already has a Supabase session, so a
 * successful fingerprint = "confirm it's really me". registerPasskey() and
 * authenticateWithPasskey() now perform the full ceremony against the Edge
 * Functions instead of throwing NotSupportedError.
 */

const FUNCTIONS_BASE_URL = "https://rbjbdxefwzvgmioearie.supabase.co/functions/v1";

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("No active Supabase session");
  return {
    Authorization: `Bearer ${accessToken}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };
}

async function postFunction<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${FUNCTIONS_BASE_URL}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = text;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    throw new Error(`Passkey function failed (${res.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data as T;
}

export function passkeysRegisterStart(payload: unknown) { return postFunction("passkeys-register-start", payload); }
export function passkeysRegisterVerify(payload: unknown) { return postFunction("passkeys-register-verify", payload); }
export function passkeysLoginStart(payload: unknown) { return postFunction("passkeys-login-start", payload); }
export function passkeysLoginVerify(payload: unknown) { return postFunction("passkeys-login-verify", payload); }

function ensureWebAuthn() {
  if (typeof window === "undefined" || !("credentials" in navigator) || !window.PublicKeyCredential) {
    const err = new Error("Biometrics unavailable on this device/browser");
    (err as any).name = "NotSupportedError";
    throw err;
  }
}

/** Enroll a new passkey for the currently signed-in user. */
export async function registerPasskey(): Promise<void> {
  ensureWebAuthn();
  const { challengeId, options } = await passkeysRegisterStart({}) as { challengeId: string; options: any };
  const credential = await startRegistration({ optionsJSON: options });
  const result = await passkeysRegisterVerify({ challengeId, credential }) as { ok?: boolean; error?: string };
  if (!result?.ok) throw new Error(result?.error || "Passkey registration failed");
}

/** Verify the signed-in user with their passkey (fingerprint confirm). */
export async function authenticateWithPasskey(): Promise<void> {
  ensureWebAuthn();
  const { challengeId, options } = await passkeysLoginStart({}) as { challengeId: string; options: any };
  const assertion = await startAuthentication({ optionsJSON: options });
  const result = await passkeysLoginVerify({ challengeId, assertion }) as { ok?: boolean; error?: string };
  if (!result?.ok) throw new Error(result?.error || "Passkey verification failed");
}

// Back-compat alias used by some components.
export const authenticateWithPasskeyCeremony = authenticateWithPasskey;
