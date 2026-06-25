// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

const VerificationProcess: React.FC = () => {
  const navigate  = useNavigate();
  const [selected, setSelected] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const types = [
    { id: "identity", label: "Identity",  icon: "??", desc: "Upload a national ID or passport" },
    { id: "business", label: "Business",  icon: "??", desc: "Upload business registration" },
    { id: "address",  label: "Address",   icon: "??", desc: "Upload a utility bill" },
    { id: "phone",    label: "Phone",     icon: "??", desc: "Verify via OTP" },
  ];

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-5xl mb-4">?</div>
      <h1 className="text-xl font-bold mb-2">Request Submitted</h1>
      <p className="text-gray-500 text-center mb-6">We will review your documents within 24-48 hours.</p>
      <button onClick={() => navigate("/profile")} className="bg-teal-600 text-white px-6 py-2 rounded-full">Back to Profile</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Get Verified</h1>
        <div className="space-y-3 mb-6">
          {types.map(t => (
            <div key={t.id} onClick={() => setSelected(t.id)}
              className={"p-4 rounded-xl border-2 cursor-pointer transition-all " + (selected === t.id ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-white")}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={!selected || loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl">
          {loading ? "Submitting..." : "Submit for Verification"}
        </button>
      </div>
    </div>
  );
};
export default VerificationProcess;




