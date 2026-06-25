// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TermsAndConditionsProps {
  onAccept: () => void;
  onDecline?: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onAccept, onDecline }) => (
  <div className="p-6 max-w-lg mx-auto">
    <h2 className="text-xl font-bold mb-4">Terms &amp; Conditions</h2>
    <div className="bg-gray-50 rounded-xl p-4 h-64 overflow-y-auto text-sm text-gray-600 mb-6">
      <p className="mb-3">Welcome to Bambeh Marketplace. By using our platform you agree to these terms.</p>
      <p className="mb-3">1. You must be at least 18 years old to use this service.</p>
      <p className="mb-3">2. You agree not to post fraudulent or misleading listings.</p>
      <p className="mb-3">3. Bambeh takes a commission on successful transactions.</p>
      <p className="mb-3">4. We reserve the right to remove listings that violate our policies.</p>
      <p>5. Your data is handled in accordance with our Privacy Policy.</p>
    </div>
    <div className="flex gap-3">
      {onDecline && (
        <button onClick={onDecline}
          className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-medium">
          Decline
        </button>
      )}
      <button onClick={onAccept}
        className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-medium">
        Accept &amp; Continue
      </button>
    </div>
  </div>
);

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"terms" | "done">("terms");

  const handleAccept = () => {
    localStorage.setItem("Bambeh_terms_accepted", "true");
    setStep("done");
    navigate("/welcome");
  };

  if (step === "terms") {
    return <TermsAndConditions onAccept={handleAccept} />;
  }

  return null;
};

export default OnboardingFlow;
export { TermsAndConditions };
export type { TermsAndConditionsProps };





