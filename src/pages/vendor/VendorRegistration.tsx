// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

interface RegistrationForm {
  businessName: string;
  businessType: string;
  businessPhone: string;
  businessEmail: string;
  region: string;
  city: string;
  agreeToTerms: boolean;
  agreeToVendorPolicy: boolean;
}

type StringField = "businessName" | "businessType" | "businessPhone" | "businessEmail" | "region" | "city";

const STRING_FIELDS: { label: string; key: StringField; placeholder: string }[] = [
  { label: "Business Name", key: "businessName",  placeholder: "Your business name"   },
  { label: "Phone",         key: "businessPhone", placeholder: "+237 6XX XXX XXX"      },
  { label: "Email",         key: "businessEmail", placeholder: "business@example.com"  },
  { label: "Region",        key: "region",        placeholder: "e.g. Centre"           },
  { label: "City",          key: "city",          placeholder: "e.g. Yaounde"          },
];

const VendorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegistrationForm>({
    businessName:        "",
    businessType:        "sole_proprietor",
    businessPhone:       "",
    businessEmail:       "",
    region:              "",
    city:                "",
    agreeToTerms:        false,
    agreeToVendorPolicy: false,
  });

  const setString = (key: StringField, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const setBool = (key: "agreeToTerms" | "agreeToVendorPolicy", value: boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.agreeToTerms || !form.agreeToVendorPolicy) {
      alert("Please agree to all terms.");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigate("/vendor/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Become a Vendor</h1>

        <div className="space-y-4">
          {STRING_FIELDS.map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-700">{f.label}</label>
              <input
                value={form[f.key]}
                onChange={e => setString(f.key, e.target.value)}
                className="mt-1 w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-teal-500"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium text-gray-700">Business Type</label>
            <select
              value={form.businessType}
              onChange={e => setString("businessType", e.target.value)}
              className="mt-1 w-full border rounded-lg p-2 text-sm"
            >
              {[
                ["sole_proprietor", "Sole Proprietor"],
                ["partnership",     "Partnership"],
                ["llc",             "LLC"],
                ["corporation",     "Corporation"],
                ["cooperative",     "Cooperative"],
                ["other",           "Other"],
              ].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeToTerms}
              onChange={e => setBool("agreeToTerms", e.target.checked)}
              className="mt-0.5 accent-teal-600"
            />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <span className="text-teal-600 underline cursor-pointer">Terms of Service</span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeToVendorPolicy}
              onChange={e => setBool("agreeToVendorPolicy", e.target.checked)}
              className="mt-0.5 accent-teal-600"
            />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <span className="text-teal-600 underline cursor-pointer">Vendor Policy</span>
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50
            text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? "Registering..." : "Register as Vendor"}
        </button>
      </div>
    </div>
  );
};

export default VendorRegistration;


