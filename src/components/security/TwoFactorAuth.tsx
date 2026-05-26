// @ts-nocheck
import React, { useState } from "react";

interface OTPModalProps {
  phoneNumber: string;
  onVerify:   (code: string) => Promise<void>;
  onResend:   () => Promise<void>;
  onSuccess:  () => void;
  onCancel:   () => void;
  isVerifying: boolean;
  isSending:   boolean;
  error:       string;
}

const OTPModal: React.FC<OTPModalProps> = ({
  phoneNumber, onVerify, onResend, onSuccess,
  onCancel, isVerifying, isSending, error,
}) => {
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    await onVerify(code);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-2">Verify Phone</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the 6-digit code sent to {phoneNumber}
        </p>

        <input
          value={code}
          onChange={e => setCode(e.target.value.replace(/D/g, "").slice(0, 6))}
          className="w-full border-2 rounded-xl p-3 text-center text-2xl font-mono
            tracking-widest mb-4 focus:border-teal-500 outline-none"
          placeholder="000000"
          maxLength={6}
        />

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <button onClick={handleVerify} disabled={isVerifying || code.length < 6}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold
            disabled:opacity-50 mb-3">
          {isVerifying ? "Verifying…" : "Verify"}
        </button>

        <div className="flex gap-3">
          <button onClick={onResend} disabled={isSending}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm">
            {isSending ? "Sending…" : "Resend"}
          </button>
          <button onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const TwoFactorAuth: React.FC = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpError,  setOtpError]  = useState("");
  const phone = "+237 600 000 000";

  const handleSendOTP = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    setShowOTP(true);
  };

  const handleVerify = async (code: string) => {
    setVerifying(true);
    await new Promise(r => setTimeout(r, 800));
    setVerifying(false);
    if (code !== "123456") setOtpError("Invalid code. Try 123456 for demo.");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Two-Factor Authentication</h1>
      <p className="text-sm text-gray-500 mb-6">
        Add an extra layer of security to your account.
      </p>
      <button onClick={handleSendOTP} disabled={sending}
        className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">
        {sending ? "Sending OTP…" : "Enable 2FA"}
      </button>

      {showOTP && (
        <OTPModal
          phoneNumber={phone}
          onVerify={handleVerify}
          onResend={handleSendOTP}
          onSuccess={() => setShowOTP(false)}
          onCancel={() => setShowOTP(false)}
          isVerifying={verifying}
          isSending={sending}
          error={otpError}
        />
      )}
    </div>
  );
};

export default TwoFactorAuth;
export type { OTPModalProps };
