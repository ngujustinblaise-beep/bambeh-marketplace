import { supabase } from "@/lib/supabase";

const FUNCTIONS_BASE_URL = "https://rbjbdxefwzvgmioearie.supabase.co/functions/v1";

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("No active Supabase session");
  }

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
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    throw new Error(
      `Passkey function failed (${res.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`
    );
  }

  return data as T;
}

export function passkeysRegisterStart(payload: unknown) {
  return postFunction("passkeys-register-start", payload);
}

export function passkeysRegisterVerify(payload: unknown) {
  return postFunction("passkeys-register-verify", payload);
}

export function passkeysLoginStart(payload: unknown) {
  return postFunction("passkeys-login-start", payload);
}

export function passkeysLoginVerify(payload: unknown) {
  return postFunction("passkeys-login-verify", payload);
}
export const authenticateWithPasskey = getAuthHeaders;
