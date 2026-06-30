import { useCallback, useEffect, useState } from 'react';
import { EscrowTransaction, fetchEscrowByOrderId, requestConfirmReceipt, requestDispute } from '../services/escrow.service';

export function useEscrow(orderId?: string) {
  const [escrow, setEscrow] = useState<EscrowTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orderId) {
      setError('Missing order id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchEscrowByOrderId(orderId);
      setEscrow(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load escrow.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmReceipt = useCallback(async () => {
    if (!escrow) return;
    setActionLoading(true);
    setError(null);

    try {
      const res = await requestConfirmReceipt(escrow.id);
      if (res.escrow) setEscrow(res.escrow);
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm receipt.';
      setError(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [escrow]);

  const raiseDispute = useCallback(
    async (reason: string) => {
      if (!escrow) return;
      setActionLoading(true);
      setError(null);

      try {
        const res = await requestDispute(escrow.id, reason);
        if (res.escrow) setEscrow(res.escrow);
        return res;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to raise dispute.';
        setError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [escrow]
  );

  return {
    escrow,
    setEscrow,
    loading,
    actionLoading,
    error,
    reload: load,
    confirmReceipt,
    raiseDispute,
  };
}
