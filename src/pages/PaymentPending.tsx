import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLang, t } from "@/hooks/useAppLang";

const PaymentPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const reference = searchParams.get('reference') ?? 'N/A';

  useEffect(() => {
    // Poll every 5 seconds for up to 10 minutes
    const MAX_POLLS = 120;
    let polls = 0;

    const poll = async () => {
      polls++;
      try {
        // In production: call your Supabase Edge Function to check payment status
        // const res = await fetch(`/api/payment/status?reference=${reference}`);
        // const { status } = await res.json();
        // if (status === 'complete') navigate('/payment/success');
        // if (status === 'failed')   navigate('/payment/failed');
      } catch {
        /* keep polling */
      }
      if (polls >= MAX_POLLS) {
        navigate('/payment/failed');
      }
    };

    const interval = setInterval(() => {
      setSeconds(s => s + 1);
      if (seconds > 0 && seconds % 5 === 0) poll();
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, navigate, reference]);

  const dots = '.'.repeat((Math.floor(seconds / 1) % 3) + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-6 animate-pulse">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending{dots}</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment via MTN Mobile Money / Orange Money is being processed.
          This can take up to 5 minutes. <strong>Do not close this page.</strong>
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-yellow-700 font-semibold mb-1">Reference</p>
          <p className="text-sm font-mono text-yellow-900">{reference}</p>
        </div>

        <div className="flex items-center gap-2 justify-center text-sm text-gray-400 mb-6">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce"/>
          <span>Checking status every 5 seconds ({Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')} elapsed)</span>
        </div>

        <div className="space-y-2 text-xs text-gray-400">
          <p>📱 Check your phone for a pending USSD or push notification</p>
          <p>💡 Make sure you have sufficient balance</p>
          <p>🔄 If nothing happens in 10 minutes, the payment will be cancelled</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;


