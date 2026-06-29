import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

interface PaymentSettings { mtn_momo_number:string; orange_money_number:string; bank_name:string; bank_account_number:string; bank_account_name:string; preferred_method:string; notchpay_email:string; }
const defaultSettings: PaymentSettings = { mtn_momo_number:"", orange_money_number:"", bank_name:"", bank_account_number:"", bank_account_name:"", preferred_method:"", notchpay_email:"" };

export default function VendorSettingsPayment() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle"|"success"|"error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase.from("vendor_profiles").select("payment_settings").eq("user_id", user.id).single();
        if (error) throw error;
        if (data?.payment_settings) setSettings({ ...defaultSettings, ...data.payment_settings });
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    load();
  }, [user?.id]);

  const handleChange = (field: keyof PaymentSettings, value: string) => { setSettings(p => ({...p,[field]:value})); setSaveStatus("idle"); };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true); setSaveStatus("idle"); setErrorMessage("");
    try {
      const { error } = await supabase.from("vendor_profiles").update({ payment_settings:settings, updated_at:new Date().toISOString() }).eq("user_id", user.id);
      if (error) throw error;
      setSaveStatus("success"); setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err:any) { setErrorMessage(err.message||"Failed to save."); setSaveStatus("error"); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600"/></button>
            <div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-green-600"/><h1 className="text-lg font-semibold text-gray-900">Payment Settings</h1></div>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
            {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save className="w-4 h-4"/>}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {saveStatus==="success" && <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"><CheckCircle className="w-5 h-5"/><span>Payment settings saved!</span></div>}
        {saveStatus==="error" && <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><AlertCircle className="w-5 h-5"/><span>{errorMessage}</span></div>}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Preferred Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {[{value:"mtn_momo",label:"MTN MoMo"},{value:"orange_money",label:"Orange Money"},{value:"bank_transfer",label:"Bank Transfer"},{value:"notchpay",label:"NotchPay"}].map(o => (
              <button key={o.value} onClick={() => handleChange("preferred_method", o.value)} className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${settings.preferred_method===o.value?"border-green-600 bg-green-50 text-green-700":"border-gray-200 text-gray-600 hover:border-gray-300"}`}>{o.label}</button>
            ))}
          </div>
        </div>
        {[
          {title:"MTN Mobile Money",field:"mtn_momo_number" as const,placeholder:"e.g. 6XXXXXXXX",type:"tel"},
          {title:"Orange Money",field:"orange_money_number" as const,placeholder:"e.g. 6XXXXXXXX",type:"tel"},
          {title:"Bank Name",field:"bank_name" as const,placeholder:"e.g. Afriland First Bank",type:"text"},
          {title:"Bank Account Number",field:"bank_account_number" as const,placeholder:"Enter account number",type:"text"},
          {title:"Account Name",field:"bank_account_name" as const,placeholder:"Name on account",type:"text"},
          {title:"NotchPay Email",field:"notchpay_email" as const,placeholder:"your@email.com",type:"email"},
        ].map(({title,field,placeholder,type}) => (
          <div key={field} className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>
            <input type={type} value={settings[field]} onChange={e => handleChange(field, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
          </div>
        ))}
        <div className="pb-8"><button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">{isSaving?<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-5 h-5"/>}{isSaving?"Saving...":"Save Payment Settings"}</button></div>
      </div>
    </div>
  );
}





