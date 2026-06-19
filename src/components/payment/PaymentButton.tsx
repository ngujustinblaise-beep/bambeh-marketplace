import React, { useState } from "react";
import { useNotchPay } from "@/hooks/useNotchPay";

interface PaymentButtonProps {
  amount: number;
  description?: string;
  email?: string;
  onSuccess?: (ref: string) => void;
  onError?: (msg: string) => void;
  label?: string;
  className?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount, description, email, onSuccess, onError,
  label = "Pay Now", className = "",
}) => {
  const { initiate, isLoading } = useNotchPay();
  const [err, setErr] = useState<string | null>(null);

  const handleClick = async () => {
    setErr(null);
    try {
      const ref = `BM_${Date.now()}`;
      const { url } = await initiate({ amount, reference: ref, description, customer: { email } });
      onSuccess?.(ref);
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Payment failed";
      setErr(msg);
      onError?.(msg);
    }
  };

  return (
    <div>
      {err && <p className="text-red-500 text-xs mb-2">{err}</p>}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white
          font-semibold px-5 py-2 rounded-xl transition-colors ${className}`}
      >
        {isLoading ? "Processingâ€¦" : label}
      </button>
    </div>
  );
};

export default PaymentButton;
