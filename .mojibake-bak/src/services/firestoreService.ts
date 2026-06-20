// @ts-nocheck
// Firestore removed â€” using Supabase REST. Exports kept for compatibility.
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL    ?? "";
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const headers = () => ({
  apikey:        SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  "Content-Type": "application/json",
});

export const getDocument = async (
  collection: string,
  id: string,
): Promise<Record<string, unknown> | null> => {
  const res  = await fetch(`${SUPA_URL}/rest/v1/${collection}?id=eq.${id}`, { headers: headers() });
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows?.[0] ?? null;
};

export const setDocument = async (
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> => {
  await fetch(`${SUPA_URL}/rest/v1/${collection}`, {
    method:  "POST",
    headers: { ...headers(), Prefer: "resolution=merge-duplicates" },
    body:    JSON.stringify({ id, ...data }),
  });
};

export const db      = null;
export const auth    = null;
export const storage = null;
