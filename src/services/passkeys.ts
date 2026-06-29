import { supabase } from "@/lib/supabase";

const BASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

type StartResponse = {
  challengeId: string;
  challenge: string;
  rpId: string;
  userId?: string;
  username?: string;
  displayName?: string;
  allowCredentials?: Array<{ id: string; transports?: string[] }>;
};

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  arr.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    apikey: ANON_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function postJSON<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/functions/v1/${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

function credentialToJSON(cred: any) {
  return {
    id: cred.id,
    rawId: toBase64Url(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: toBase64Url(cred.response.clientDataJSON),
      attestationObject: cred.response.attestationObject ? toBase64Url(cred.response.attestationObject) : undefined,
      authenticatorData: cred.response.authenticatorData ? toBase64Url(cred.response.authenticatorData) : undefined,
      signature: cred.response.signature ? toBase64Url(cred.response.signature) : undefined,
      userHandle: cred.response.userHandle ? toBase64Url(cred.response.userHandle) : undefined,
    },
    clientExtensionResults: cred.getClientExtensionResults?.() ?? {},
  };
}

export async function registerPasskey() {
  const start = await postJSON<StartResponse>("passkeys-register-start");

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: fromBase64Url(start.challenge),
      rp: { name: "Bambe", id: start.rpId },
      user: {
        id: fromBase64Url(start.userId ?? ""),
        name: start.username ?? "user",
        displayName: start.displayName ?? "User",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      attestation: "none",
      timeout: 60000,
    },
  } as PublicKeyCredentialCreationOptions);

  if (!credential) throw new Error("No credential returned");

  await postJSON("passkeys-register-verify", {
    challengeId: start.challengeId,
    credential: credentialToJSON(credential),
  });
}

export async function authenticateWithPasskey() {
  const start = await postJSON<StartResponse>("passkeys-login-start");

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: fromBase64Url(start.challenge),
      rpId: start.rpId,
      userVerification: "required",
      allowCredentials: (start.allowCredentials ?? []).map((c) => ({
        type: "public-key",
        id: fromBase64Url(c.id),
        transports: c.transports,
      })),
      timeout: 60000,
    },
  } as PublicKeyCredentialRequestOptions);

  if (!assertion) throw new Error("No assertion returned");

  await postJSON("passkeys-login-verify", {
    challengeId: start.challengeId,
    assertion: credentialToJSON(assertion),
  });
}