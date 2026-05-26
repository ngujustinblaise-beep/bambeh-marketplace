// @ts-nocheck
export type PaymentProvider = "notchpay" | "mtn_momo" | "orange_money" | "stripe";

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  userId: string;
  reference: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  transactionId?: string;
  data?: Record<string, unknown>;
  error?: string;
}

export class PaymentService {
  async initiate(intent: PaymentIntent): Promise<PaymentResult> {
    console.debug("[PaymentService] initiate:", intent);
    return { success: true, reference: intent.reference, data: { intent } };
  }

  async verify(reference: string): Promise<PaymentResult> {
    console.debug("[PaymentService] verify:", reference);
    return { success: true, reference, data: {} };
  }

  generateReceipt(result: PaymentResult): Record<string, unknown> {
    return {
      receiptNumber: `RCP_${Date.now()}`,
      reference:     result.reference,
      generatedAt:   new Date().toISOString(),
      ...result.data,
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
