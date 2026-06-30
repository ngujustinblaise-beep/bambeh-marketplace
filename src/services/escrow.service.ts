export type EscrowStatus =
  | 'pending'
  | 'funded'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'refunded';

export type EscrowStep = {
  id: number;
  label: string;
  sublabel: string;
  completed: boolean;
  active: boolean;
  date?: string;
};

export type EscrowTransaction = {
  id: string;
  orderId: string;
  itemName: string;
  itemImage: string;
  sellerName: string;
  sellerTrustScore: number;
  buyerName: string;
  amountXAF: number;
  amountZerm: number;
  status: EscrowStatus;
  createdAt: string;
  deadlineDate: string;
  disputeWindowEndsAt: string;
  canConfirmReceipt: boolean;
  canRaiseDispute: boolean;
  steps: EscrowStep[];
};

export type EscrowActionResponse = {
  success: boolean;
  message: string;
  escrow?: EscrowTransaction;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function getAuthToken() {
  return localStorage.getItem('authToken') ?? '';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    let message = 'Request failed.';
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export async function fetchEscrowByOrderId(orderId: string): Promise<EscrowTransaction> {
  return request<EscrowTransaction>(`/escrows/${encodeURIComponent(orderId)}`);
}

export async function requestConfirmReceipt(escrowId: string): Promise<EscrowActionResponse> {
  return request<EscrowActionResponse>(`/escrows/${encodeURIComponent(escrowId)}/confirm-receipt`, {
    method: 'POST',
  });
}

export async function requestDispute(escrowId: string, reason: string): Promise<EscrowActionResponse> {
  return request<EscrowActionResponse>(`/escrows/${encodeURIComponent(escrowId)}/disputes`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
