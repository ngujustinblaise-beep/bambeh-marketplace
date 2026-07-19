// BAMBEH_DEPLOY_TOKEN__BIOMETRICSERVICE_FIX125_CLEAN
/**
 * biometric.ts — Bambeh real biometric (WebAuthn) service (FIX125)
 * FILE LOCATION: src/services/biometric.ts
 *
 * Real fingerprint / face unlock using the browser's WebAuthn platform
 * authenticator. No passwords are stored anywhere. Flow:
 *
 *   ENROLL (BiometricSetup, while the user is already logged in):
 *     1. navigator.credentials.create() with a platform authenticator
 *        → the device prompts for fingerprint/face and returns a credential.
 *     2. We store the credential id + the user's id in `biometric_credentials`.
 *     3. We also stash a local hint so the login screen knows who to offer.
 *
 *   LOGIN (BiometricLogin):
 *     1. navigator.credentials.get() with the stored credential id
 *        → the device prompts for fingerprint/face.
 *     2. On success, we refresh the existing Supabase session (the refresh
 *        token was kept by supabase-js). If a session exists, the user is in.
 *
 * IMPORTANT REALITY NOTE (told to Big):
 *   - On the WEB (Chrome/Safari) this works with the real device biometric.
 *   - Inside the Capacitor Android WebView, WebAuthn platform authenticators
 *     are often NOT supported. isBiometricAvailable() detects this and the
 *     UI falls back to password cleanly — no fake success.
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { supabase } from '@/lib/supabase';

const LOCAL_CRED_KEY = 'bambeh_biometric_cred_id';
const LOCAL_USER_HINT = 'bambeh_biometric_user';

const enc = new TextEncoder();
function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBuf(s: string): ArrayBuffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
function randomChallenge(): Uint8Array {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return a;
}

/** True only if the platform can actually do fingerprint/face (not just any WebAuthn). */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
    const ok = await window.PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable();
    return !!ok;
  } catch {
    return false;
  }
}

/** Has THIS device already enrolled a biometric credential for a user? */
export function hasLocalBiometric(): boolean {
  try { return !!localStorage.getItem(LOCAL_CRED_KEY); } catch { return false; }
}

export function localUserHint(): string | null {
  try { return localStorage.getItem(LOCAL_USER_HINT); } catch { return null; }
}

/** ENROLL: create a platform passkey and persist it. User must be logged in. */
export async function enrollBiometric(): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await isBiometricAvailable())) {
      return { ok: false, error: 'unavailable' };
    }
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return { ok: false, error: 'not_logged_in' };

    const userIdBuf = enc.encode(user.id);
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge(),
        rp: { name: 'Bambeh', id: window.location.hostname },
        user: {
          id: userIdBuf,
          name: user.email ?? user.id,
          displayName: user.email ?? 'Bambeh user',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null;

    if (!cred) return { ok: false, error: 'cancelled' };

    const credId = bufToB64url(cred.rawId);

    // Persist server-side (best-effort) and locally (for the login prompt).
    try {
      await supabase.from('biometric_credentials').upsert({
        user_id: user.id,
        credential_id: credId,
        device_label: navigator.userAgent.slice(0, 120),
        created_at: new Date().toISOString(),
      }, { onConflict: 'credential_id' });
    } catch { /* table optional; local still works */ }

    localStorage.setItem(LOCAL_CRED_KEY, credId);
    localStorage.setItem(LOCAL_USER_HINT, user.email ?? user.id);
    return { ok: true };
  } catch (e) {
    const name = (e as { name?: string })?.name;
    if (name === 'NotAllowedError') return { ok: false, error: 'cancelled' };
    console.error('[biometric] enroll failed:', e);
    return { ok: false, error: 'failed' };
  }
}

/** LOGIN: verify the device biometric, then confirm a Supabase session exists. */
export async function authenticateBiometric(): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await isBiometricAvailable())) return { ok: false, error: 'unavailable' };
    const credId = localStorage.getItem(LOCAL_CRED_KEY);
    if (!credId) return { ok: false, error: 'not_enrolled' };

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        allowCredentials: [{ type: 'public-key', id: b64urlToBuf(credId) }],
        userVerification: 'required',
        timeout: 60000,
        rpId: window.location.hostname,
      },
    });

    if (!assertion) return { ok: false, error: 'cancelled' };

    // The device biometric passed. Now ensure Supabase still has a session
    // (supabase-js persists + refreshes tokens locally). If yes → logged in.
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) return { ok: true };

    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed?.session) return { ok: true };

    // Biometric was valid but the session has fully expired → need password once.
    return { ok: false, error: 'session_expired' };
  } catch (e) {
    const name = (e as { name?: string })?.name;
    if (name === 'NotAllowedError') return { ok: false, error: 'cancelled' };
    console.error('[biometric] auth failed:', e);
    return { ok: false, error: 'failed' };
  }
}

/** Turn off biometric on this device and remove the stored credential. */
export async function disableBiometric(): Promise<void> {
  const credId = localStorage.getItem(LOCAL_CRED_KEY);
  try {
    if (credId) await supabase.from('biometric_credentials').delete().eq('credential_id', credId);
  } catch { /* ignore */ }
  try {
    localStorage.removeItem(LOCAL_CRED_KEY);
    localStorage.removeItem(LOCAL_USER_HINT);
  } catch { /* ignore */ }
}
// BAMBEH_END_TOKEN__BIOMETRICSERVICE__COMPLETE
