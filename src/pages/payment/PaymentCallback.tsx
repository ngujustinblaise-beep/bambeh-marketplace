// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../../services/payment/notchpayService";

type Status = "loading" | "success" | "failed" | "pending";

const INFO: Record<Exclude<Status, "loading">, { emoji: string; title: string; color: string }> = {
  success: { emoji: "✅", title: "Payment Successful!", color: "text-green-600"  },
  failed:  { emoji: "❌", title: "Payment Failed",      color: "text-red-600"    },
  pending: { emoji: "⏳", title: "Payment Pending",     color: "text-yellow-600" },
};

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const [params]  = useSearchParams();
  const [status,  setStatus] = useState<Status>("loading");
  const [paidAt,  setPaidAt] = useState<string | null>(null);

  useEffect(() => {
    const ref = params.get("reference") ?? params.get("trxref");
    if (!ref) { setStatus("failed"); return; }

    verifyPayment(ref)
      .then(data => {
        const raw = (data as Record<string, Record<string, string>>)?.transaction?.status
                 ?? (data as Record<string, string>)?.status
                 ?? "failed";
        const s: Status = raw === "complete" || raw === "success"
          ? "success"
          : raw === "pending" ? "pending" : "failed";
        setStatus(s);
        const pa = (data as Record<string, Record<string, string>>)?.transaction?.paid_at;
        if (pa) setPaidAt(pa);
      })
      .catch(() => setStatus("failed"));
  }, [params]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const info = INFO[status];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{info.emoji}</div>
        <h1 className={`text-xl font-bold mb-2 ${info.color}`}>{info.title}</h1>
        {paidAt && (
          <p className="text-sm text-gray-500 mb-4">
            Paid at: {new Date(paidAt).toLocaleString()}
          </p>
        )}
        <button onClick={() => navigate("/")}
          className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-full font-medium">
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentCallback;
