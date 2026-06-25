export interface PaymentInitPayload {
  amount: number;
  currency?: string;
  reference: string;
  description?: string;
  callbackUrl?: string;
  returnUrl?: string;
  customer?: { email?: string; phone?: string; name?: string };
}

export interface WithdrawalPayload {
  amount: number;
  currency?: string;
  reference: string;
  recipient: { phone: string; network: "mtn" | "orange" };
}

export interface WithdrawalResult {
  success: boolean;
  reference?: string;
  netPayout?: number;
  message?: string;
}

export const generateReference = (prefix = "BM"): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const initializePayment = async (
  payload: PaymentInitPayload,
): Promise<{ url: string; reference: string }> => {
  const res = await fetch("https://api.notchpay.co/payments/initialize", {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${import.meta.env.VITE_NOTCHPAY_PUBLIC_KEY ?? ""}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`NotchPay init failed: ${res.status}`);
  const data = await res.json() as { authorization_url?: string; url?: string };
  return { url: data.authorization_url ?? data.url ?? "", reference: payload.reference };
};

/** @deprecated use initializePayment */
export const initiatePayment = initializePayment;

export const verifyPayment = async (reference: string): Promise<Record<string, unknown>> => {
  const res = await fetch(`https://api.notchpay.co/payments/${reference}`, {
    headers: { Authorization: `Bearer ${import.meta.env.VITE_NOTCHPAY_PUBLIC_KEY ?? ""}` },
  });
  if (!res.ok) throw new Error(`NotchPay verify failed: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
};

export const initiateWithdrawal = async (
  payload: WithdrawalPayload,
): Promise<WithdrawalResult> => {
  const res = await fetch("https://api.notchpay.co/transfers", {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${import.meta.env.VITE_NOTCHPAY_SECRET_KEY ?? ""}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { success: false, message: `Transfer failed: ${res.status}` };
  const data = await res.json() as { reference?: string; amount?: number };
  return { success: true, reference: data.reference, netPayout: data.amount };
};

