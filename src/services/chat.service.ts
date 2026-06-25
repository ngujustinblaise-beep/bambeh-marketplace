// @ts-nocheck
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const EP = {
  products: `${BASE}/products`,
  orders:   `${BASE}/orders`,
  payments: `${BASE}/payments`,
  users:    `${BASE}/users`,
  chat:     `${BASE}/chat`,
} as const;

export const fetchChats = async (userId: string): Promise<unknown> => {
  const res = await fetch(`${EP.chat}/${userId}`);
  return res.json();
};

export const sendChatMessage = async (chatId: string, message: string): Promise<unknown> => {
  const res = await fetch(`${EP.chat}/${chatId}/messages`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ message }),
  });
  return res.json();
};

export const markChatRead = async (chatId: string): Promise<unknown> => {
  const res = await fetch(`${EP.chat}/${chatId}/read`, { method: "PATCH" });
  return res.json();
};

