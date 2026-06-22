// @ts-nocheck
import React from "react";
import { useNavigate } from "react-router-dom";

interface AccountBlockedPageProps {
  reason?: string;
  contactSupport?: boolean;
}

const AccountBlockedPage: React.FC<AccountBlockedPageProps> = ({
  reason = "Your account has been restricted.",
  contactSupport = true,
}) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50">
      <div className="text-5xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-red-700 mb-2">Account Restricted</h1>
      <p className="text-gray-600 text-center max-w-sm mb-4">{reason}</p>
      {contactSupport && (
        <button onClick={() => navigate("/help")}
          className="bg-teal-600 text-white px-6 py-2 rounded-full font-medium">
          Contact Support
        </button>
      )}
    </div>
  );
};

interface AccountRestrictionBannerProps {
  isRestricted?: boolean;
  isBlocked?: boolean;
  reason?: string;
  onDismiss?: () => void;
}

const AccountRestrictionBanner: React.FC<AccountRestrictionBannerProps> = ({
  isRestricted,
  isBlocked,
  reason,
  onDismiss,
}) => {
  if (!isRestricted && !isBlocked) return null;

  if (isBlocked) return <AccountBlockedPage reason={reason} />;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start gap-3">
      <span className="text-yellow-500 text-xl">⚠ï¸</span>
      <div className="flex-1">
        <p className="text-yellow-800 font-medium text-sm">Account Restricted</p>
        <p className="text-yellow-700 text-xs mt-0.5">{reason ?? "Some features may be unavailable."}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-yellow-500 hover:text-yellow-700 text-lg">×</button>
      )}
    </div>
  );
};

export default AccountRestrictionBanner;
export { AccountBlockedPage };
export type { AccountBlockedPageProps };




