export type PaymentSource = "cart" | "zerm" | "farmfresh" | "subscription" | "donation";

export interface PaymentPayload {
  amountXAF: number;
  source: PaymentSource;
  userId?: string;
  metadata?: Record<string, any>;
}

export function createPaymentReference(): string {
  return `BAMBEH_${Date.now()}_${Math.random().toString(36).substring(2,10)}`;
}

export function normalizePayment(payload: PaymentPayload) {
  return {
    ...payload,
    reference: createPaymentReference(),
    timestamp: new Date().toISOString(),
  };
}
