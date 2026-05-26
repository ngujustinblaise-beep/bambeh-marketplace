export interface PaymentVerifyResult {
  status: "success" | "failed" | "pending";
  reference: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
  metadata?: Record<string, unknown>;
}

export interface WithdrawalResult {
  success: boolean;
  reference?: string;
  netPayout?: number;
  message?: string;
}
