import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

type Status = "loading" | "success" | "failed" | "pending";

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const ref = params.get("reference") ?? params.get("trxref") ?? params.get("ref");
    if (!ref) { setStatus("failed"); return; }
    setReference(ref);

    supabase.functions.invoke("campay-status", { body: { reference: ref } })
      .then(({ data, error }) => {
        if (error || !data) { setStatus("failed"); return; }
        const s = (data.status as string)?.toUpperCase();
        if (s === "SUCCESSFUL") setStatus("success");
        else if (s === "PENDING") setStatus("pending");
        else setStatus("failed");
      })
      .catch(() => setStatus("failed"));
  }, [params]);

  const INFO = {
    success: { emoji: "?", title: "Payment Successful!",  color: "text-green-600",  msg: "Your payment was confirmed. Thank you!" },
    failed:  { emoji: "?", title: "Payment Failed",       color: "text-red-600",    msg: "Your payment could not be processed. No funds were deducted." },
    pending: { emoji: "?", title: "Payment Pending",      color: "text-yellow-600", msg: "We are still waiting for confirmation from your mobile operator." },
  };

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-teal-500 border-t-transparent"/>
    </div>
  );

  const info = INFO[status];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{info.emoji}</div>
        <h1 className={`text-xl font-bold mb-2 ${info.color}`}>{info.title}</h1>
        <p className="text-sm text-gray-500 mb-4">{info.msg}</p>
        {reference && (
          <p className="text-xs text-gray-400 mb-4 font-mono break-all">Ref: {reference}</p>
        )}
        {status === "failed" && (
          <p className="text-xs text-gray-400 mb-4">
            If funds were deducted, contact <strong>support@bambeh.com</strong> with your reference.
          </p>
        )}
        <button onClick={() => navigate("/")}
          className="mt-2 bg-teal-600 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-700">
          Back to Home
        </button>
        {status === "pending" && (
          <button onClick={() => window.location.reload()}
            className="mt-3 block w-full text-teal-600 text-sm hover:underline">
            Check again
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
